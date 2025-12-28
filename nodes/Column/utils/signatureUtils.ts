/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import * as crypto from 'crypto';

/**
 * Webhook signature header name
 */
export const WEBHOOK_SIGNATURE_HEADER = 'X-Column-Signature';
export const WEBHOOK_TIMESTAMP_HEADER = 'X-Column-Timestamp';

/**
 * Maximum age for webhook timestamp (5 minutes)
 */
export const MAX_WEBHOOK_AGE_SECONDS = 300;

/**
 * Verify Column webhook signature
 * @param payload - Raw request body
 * @param signature - Signature from header
 * @param secret - Webhook secret
 * @param timestamp - Timestamp from header
 * @returns boolean indicating if signature is valid
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
  timestamp?: string,
): boolean {
  try {
    // Check timestamp if provided
    if (timestamp) {
      const webhookTime = parseInt(timestamp, 10);
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - webhookTime) > MAX_WEBHOOK_AGE_SECONDS) {
        return false;
      }
    }

    // Build signed payload
    const signedPayload = timestamp
      ? `${timestamp}.${payload.toString()}`
      : payload.toString();

    // Calculate expected signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    // Compare signatures using timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  } catch {
    return false;
  }
}

/**
 * Generate webhook signature for testing
 * @param payload - Request body
 * @param secret - Webhook secret
 * @param timestamp - Optional timestamp (defaults to current time)
 * @returns Object containing signature and timestamp
 */
export function generateWebhookSignature(
  payload: string | object,
  secret: string,
  timestamp?: number,
): { signature: string; timestamp: string } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const signedPayload = `${ts}.${payloadString}`;
  const signature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return {
    signature,
    timestamp: ts.toString(),
  };
}

/**
 * Parse Column webhook signature header
 * Format: t=timestamp,v1=signature
 */
export function parseSignatureHeader(header: string): { timestamp: string; signature: string } | null {
  try {
    const parts = header.split(',');
    let timestamp = '';
    let signature = '';

    for (const part of parts) {
      const [key, value] = part.split('=');
      if (key === 't') {
        timestamp = value;
      } else if (key === 'v1') {
        signature = value;
      }
    }

    if (!timestamp || !signature) {
      return null;
    }

    return { timestamp, signature };
  } catch {
    return null;
  }
}

/**
 * Build signature header for testing
 */
export function buildSignatureHeader(signature: string, timestamp: string): string {
  return `t=${timestamp},v1=${signature}`;
}

/**
 * Validate webhook payload structure
 */
export function isValidWebhookPayload(payload: unknown): payload is WebhookPayload {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  const p = payload as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.type === 'string' &&
    typeof p.created_at === 'string' &&
    p.data !== undefined
  );
}

/**
 * Webhook payload interface
 */
export interface WebhookPayload {
  id: string;
  type: string;
  created_at: string;
  data: Record<string, unknown>;
  api_version?: string;
  livemode?: boolean;
}

/**
 * Extract event type from webhook payload
 */
export function getEventType(payload: WebhookPayload): string {
  return payload.type;
}

/**
 * Check if event matches filter
 */
export function eventMatchesFilter(eventType: string, filters: string[]): boolean {
  if (filters.length === 0) {
    return true; // No filter means accept all
  }

  for (const filter of filters) {
    // Exact match
    if (filter === eventType) {
      return true;
    }
    // Wildcard match (e.g., 'entity.*' matches 'entity.created')
    if (filter.endsWith('.*')) {
      const prefix = filter.slice(0, -2);
      if (eventType.startsWith(prefix + '.')) {
        return true;
      }
    }
  }

  return false;
}
