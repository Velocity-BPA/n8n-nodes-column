/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  ICredentialDataDecryptedObject,
  IHttpRequestOptions,
  IHttpRequestMethods,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { getBaseUrl, buildAuthHeaders, maskSensitiveData } from '../utils/authUtils';
import { generateIdempotencyKey } from '../utils/validationUtils';

/**
 * Column API Client for making authenticated requests
 */

export interface ColumnApiRequestOptions {
  method: IHttpRequestMethods;
  endpoint: string;
  body?: Record<string, unknown>;
  query?: Record<string, string | number | boolean | undefined>;
  idempotencyKey?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  starting_after?: string;
  ending_before?: string;
  total_count?: number;
}

export interface ColumnApiError {
  code: string;
  message: string;
  param?: string;
  type: string;
  doc_url?: string;
}

/**
 * Make a request to the Column API
 */
export async function columnApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  options: ColumnApiRequestOptions,
): Promise<unknown> {
  const credentials = await this.getCredentials('columnApi');

  const baseUrl = getBaseUrl(credentials);
  const headers = buildAuthHeaders(credentials);

  // Add idempotency key for POST/PUT/PATCH requests
  if (['POST', 'PUT', 'PATCH'].includes(options.method)) {
    headers['Idempotency-Key'] = options.idempotencyKey || generateIdempotencyKey();
  }

  // Build request options
  const requestOptions: IHttpRequestOptions = {
    method: options.method,
    url: `${baseUrl}${options.endpoint}`,
    headers,
    json: true,
  };

  // Add body for appropriate methods
  if (options.body && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
    requestOptions.body = options.body;
  }

  // Add query parameters
  if (options.query) {
    const cleanQuery: Record<string, string> = {};
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null && value !== '') {
        cleanQuery[key] = String(value);
      }
    }
    if (Object.keys(cleanQuery).length > 0) {
      requestOptions.qs = cleanQuery;
    }
  }

  try {
    const response = await this.helpers.httpRequest(requestOptions);
    return response;
  } catch (error: unknown) {
    // Handle Column API errors
    if (error && typeof error === 'object' && 'response' in error) {
      const errorResponse = (error as { response?: { body?: ColumnApiError } }).response;
      if (errorResponse?.body) {
        const apiError = errorResponse.body;
        const statusCode = (error as { statusCode?: number }).statusCode || 500;
        throw new NodeOperationError(
          this.getNode(),
          `Column API Error: ${apiError.message || 'Unknown error'} (${apiError.type}: ${apiError.code})`,
          { description: `HTTP ${statusCode}` },
        );
      }
    }
    throw error;
  }
}

/**
 * Make a paginated request to the Column API
 */
export async function columnApiRequestAllItems<T>(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  options: Omit<ColumnApiRequestOptions, 'query'> & {
    query?: Record<string, string | number | boolean | undefined>;
  },
  limit?: number,
): Promise<T[]> {
  const results: T[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  const pageSize = Math.min(limit || 100, 100);

  while (hasMore) {
    const query = {
      ...options.query,
      limit: pageSize,
      starting_after: startingAfter,
    };

    const response = (await columnApiRequest.call(this, {
      ...options,
      query,
    })) as PaginatedResponse<T>;

    results.push(...response.data);

    hasMore = response.has_more && (!limit || results.length < limit);

    if (hasMore && response.data.length > 0) {
      const lastItem = response.data[response.data.length - 1] as { id?: string };
      startingAfter = lastItem.id;
    }
  }

  // Trim to exact limit if specified
  if (limit && results.length > limit) {
    return results.slice(0, limit);
  }

  return results;
}

/**
 * Upload a document to Column
 */
export async function columnApiUploadDocument(
  this: IExecuteFunctions,
  endpoint: string,
  fileName: string,
  fileData: Buffer,
  mimeType: string,
  additionalFields?: Record<string, unknown>,
): Promise<unknown> {
  const credentials = await this.getCredentials('columnApi');
  const baseUrl = getBaseUrl(credentials);
  const headers = buildAuthHeaders(credentials);

  // Remove content-type for multipart
  delete headers['Content-Type'];

  const requestOptions: IHttpRequestOptions = {
    method: 'POST',
    url: `${baseUrl}${endpoint}`,
    headers: {
      ...headers,
      'Idempotency-Key': generateIdempotencyKey(),
    },
    body: {
      file: {
        value: fileData,
        options: {
          filename: fileName,
          contentType: mimeType,
        },
      },
      ...additionalFields,
    },
    json: true,
  };

  return await this.helpers.httpRequest(requestOptions);
}

/**
 * Download a file from Column
 */
export async function columnApiDownloadFile(
  this: IExecuteFunctions,
  endpoint: string,
): Promise<Buffer> {
  const credentials = await this.getCredentials('columnApi');
  const baseUrl = getBaseUrl(credentials);
  const headers = buildAuthHeaders(credentials);

  const requestOptions: IHttpRequestOptions = {
    method: 'GET',
    url: `${baseUrl}${endpoint}`,
    headers,
    encoding: 'arraybuffer',
    returnFullResponse: true,
  };

  const response = await this.helpers.httpRequest(requestOptions);
  return Buffer.from(response.body as ArrayBuffer);
}

/**
 * Test API connection
 */
export async function testColumnConnection(
  credentials: ICredentialDataDecryptedObject,
): Promise<{ success: boolean; message: string }> {
  try {
    const baseUrl = getBaseUrl(credentials);
    const headers = buildAuthHeaders(credentials);

    const response = await fetch(`${baseUrl}/platform`, {
      method: 'GET',
      headers,
    });

    if (response.ok) {
      return { success: true, message: 'Connection successful' };
    } else {
      const errorData = await response.json();
      return {
        success: false,
        message: `Authentication failed: ${(errorData as ColumnApiError).message || response.statusText}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Handle rate limiting with exponential backoff
 */
export async function columnApiRequestWithRetry(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  options: ColumnApiRequestOptions,
  maxRetries = 3,
): Promise<unknown> {
  let lastError: unknown;
  let delay = 1000;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await columnApiRequest.call(this, options);
    } catch (error: unknown) {
      lastError = error;

      // Check if it's a rate limit error (429)
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 429 && attempt < maxRetries) {
        // Wait with exponential backoff
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * Log API activity (for debugging, never logs sensitive data)
 */
export function logApiActivity(
  method: string,
  endpoint: string,
  success: boolean,
  duration: number,
): void {
  // Sanitize endpoint to remove IDs
  const sanitizedEndpoint = endpoint.replace(/[a-zA-Z]+_[a-zA-Z0-9]{20,}/g, '[ID]');
  console.log(`[Column API] ${method} ${sanitizedEndpoint} - ${success ? 'OK' : 'FAILED'} (${duration}ms)`);
}
