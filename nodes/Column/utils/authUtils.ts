/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ICredentialDataDecryptedObject, IExecuteFunctions, ILoadOptionsFunctions } from 'n8n-workflow';
import { COLUMN_API_ENDPOINTS, type ColumnEnvironment } from '../constants';

/**
 * Get the base URL for Column API based on environment
 */
export function getBaseUrl(credentials: ICredentialDataDecryptedObject): string {
  const environment = credentials.environment as ColumnEnvironment;

  if (environment === 'custom') {
    return credentials.customEndpoint as string;
  }

  return environment === 'production'
    ? COLUMN_API_ENDPOINTS.PRODUCTION
    : COLUMN_API_ENDPOINTS.SANDBOX;
}

/**
 * Build authentication headers for Column API requests
 */
export function buildAuthHeaders(credentials: ICredentialDataDecryptedObject): Record<string, string> {
  const apiKey = credentials.apiKey as string;
  const platformId = credentials.platformId as string | undefined;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  if (platformId) {
    headers['X-Platform-ID'] = platformId;
  }

  return headers;
}

/**
 * Get credentials from execution context
 */
export async function getColumnCredentials(
  this: IExecuteFunctions | ILoadOptionsFunctions,
): Promise<ICredentialDataDecryptedObject> {
  return await this.getCredentials('columnApi');
}

/**
 * Mask sensitive data for logging (never log full API keys)
 */
export function maskSensitiveData(data: string): string {
  if (data.length <= 8) {
    return '****';
  }
  return `${data.substring(0, 4)}...${data.substring(data.length - 4)}`;
}

/**
 * Validate API key format
 */
export function isValidApiKey(apiKey: string): boolean {
  // Column API keys are typically in the format: col_xxx...
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  return apiKey.length >= 20 && /^col_[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Check if we're in sandbox environment
 */
export function isSandboxEnvironment(credentials: ICredentialDataDecryptedObject): boolean {
  return (credentials.environment as ColumnEnvironment) === 'sandbox';
}
