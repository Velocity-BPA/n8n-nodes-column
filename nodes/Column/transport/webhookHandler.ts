/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IWebhookFunctions, IDataObject, INodeExecutionData } from 'n8n-workflow';
import {
  verifyWebhookSignature,
  parseSignatureHeader,
  isValidWebhookPayload,
  eventMatchesFilter,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
  type WebhookPayload,
} from '../utils/signatureUtils';

/**
 * Webhook handler for Column events
 */

export interface WebhookHandlerResult {
  workflowData: INodeExecutionData[][];
}

/**
 * Process incoming webhook from Column
 */
export async function handleColumnWebhook(
  this: IWebhookFunctions,
  eventFilters: string[],
): Promise<WebhookHandlerResult> {
  const req = this.getRequestObject();
  const body = this.getBodyData() as IDataObject;

  // Get webhook secret from credentials
  const credentials = await this.getCredentials('columnApi');
  const webhookSecret = credentials.webhookSecret as string | undefined;

  // Verify signature if secret is configured
  if (webhookSecret) {
    const signatureHeader = req.headers[WEBHOOK_SIGNATURE_HEADER.toLowerCase()] as string;
    const timestampHeader = req.headers[WEBHOOK_TIMESTAMP_HEADER.toLowerCase()] as string;

    if (!signatureHeader) {
      throw new Error('Missing webhook signature header');
    }

    // Try parsing structured signature header
    const parsed = parseSignatureHeader(signatureHeader);
    let isValid = false;

    if (parsed) {
      isValid = verifyWebhookSignature(
        JSON.stringify(body),
        parsed.signature,
        webhookSecret,
        parsed.timestamp,
      );
    } else {
      // Fall back to direct signature verification
      isValid = verifyWebhookSignature(
        JSON.stringify(body),
        signatureHeader,
        webhookSecret,
        timestampHeader,
      );
    }

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }
  }

  // Validate payload structure
  if (!isValidWebhookPayload(body)) {
    throw new Error('Invalid webhook payload structure');
  }

  const payload = body as unknown as WebhookPayload;

  // Check event type filter
  if (!eventMatchesFilter(payload.type, eventFilters)) {
    // Return empty result if event doesn't match filter
    return {
      workflowData: [],
    };
  }

  // Build output data
  const outputData: IDataObject = {
    eventId: payload.id,
    eventType: payload.type,
    createdAt: payload.created_at,
    livemode: payload.livemode ?? true,
    apiVersion: payload.api_version,
    data: payload.data,
  };

  return {
    workflowData: [[{ json: outputData }]],
  };
}

/**
 * Create webhook at Column
 */
export async function createColumnWebhook(
  this: IWebhookFunctions,
  url: string,
  events: string[],
): Promise<{ id: string; secret: string }> {
  const credentials = await this.getCredentials('columnApi');

  // Import the client dynamically to avoid circular dependencies
  const { columnApiRequest } = await import('./columnClient');

  const response = (await columnApiRequest.call(this as any, {
    method: 'POST',
    endpoint: '/webhooks',
    body: {
      url,
      events: events.length > 0 ? events : ['*'],
      enabled: true,
    },
  })) as { id: string; secret: string };

  return response;
}

/**
 * Delete webhook at Column
 */
export async function deleteColumnWebhook(
  this: IWebhookFunctions,
  webhookId: string,
): Promise<void> {
  const { columnApiRequest } = await import('./columnClient');

  await columnApiRequest.call(this as any, {
    method: 'DELETE',
    endpoint: `/webhooks/${webhookId}`,
  });
}

/**
 * Update webhook at Column
 */
export async function updateColumnWebhook(
  this: IWebhookFunctions,
  webhookId: string,
  url: string,
  events: string[],
  enabled: boolean,
): Promise<void> {
  const { columnApiRequest } = await import('./columnClient');

  await columnApiRequest.call(this as any, {
    method: 'PATCH',
    endpoint: `/webhooks/${webhookId}`,
    body: {
      url,
      events: events.length > 0 ? events : ['*'],
      enabled,
    },
  });
}

/**
 * Get webhook details from Column
 */
export async function getColumnWebhook(
  this: IWebhookFunctions,
  webhookId: string,
): Promise<unknown> {
  const { columnApiRequest } = await import('./columnClient');

  return await columnApiRequest.call(this as any, {
    method: 'GET',
    endpoint: `/webhooks/${webhookId}`,
  });
}

/**
 * List all webhooks at Column
 */
export async function listColumnWebhooks(
  this: IWebhookFunctions,
): Promise<unknown[]> {
  const { columnApiRequestAllItems } = await import('./columnClient');

  return await columnApiRequestAllItems.call(this as any, {
    method: 'GET',
    endpoint: '/webhooks',
  });
}

/**
 * Extract resource IDs from webhook payload
 */
export function extractResourceIds(payload: WebhookPayload): Record<string, string> {
  const ids: Record<string, string> = {};
  const data = payload.data;

  // Common ID fields
  if (data.id) ids.resourceId = data.id as string;
  if (data.entity_id) ids.entityId = data.entity_id as string;
  if (data.account_id) ids.accountId = data.account_id as string;
  if (data.bank_account_id) ids.bankAccountId = data.bank_account_id as string;
  if (data.transfer_id) ids.transferId = data.transfer_id as string;
  if (data.card_id) ids.cardId = data.card_id as string;
  if (data.loan_id) ids.loanId = data.loan_id as string;

  return ids;
}

/**
 * Classify event by category
 */
export function classifyEvent(eventType: string): string {
  const [category] = eventType.split('.');
  return category || 'unknown';
}
