/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NodeOperationError } from 'n8n-workflow';
import type { IExecuteFunctions, INode } from 'n8n-workflow';

/**
 * Validate ABA routing number using checksum algorithm
 * @param routingNumber - 9-digit ABA routing number
 * @returns boolean indicating if routing number is valid
 */
export function isValidRoutingNumber(routingNumber: string): boolean {
  // Must be exactly 9 digits
  if (!/^\d{9}$/.test(routingNumber)) {
    return false;
  }

  // ABA routing number checksum algorithm
  // 3(d1 + d4 + d7) + 7(d2 + d5 + d8) + (d3 + d6 + d9) mod 10 = 0
  const digits = routingNumber.split('').map(Number);
  const checksum =
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    (digits[2] + digits[5] + digits[8]);

  return checksum % 10 === 0;
}

/**
 * Validate US bank account number
 */
export function isValidAccountNumber(accountNumber: string): boolean {
  // Account numbers are typically 4-17 digits
  return /^\d{4,17}$/.test(accountNumber);
}

/**
 * Validate amount (positive number with max 2 decimal places)
 */
export function isValidAmount(amount: number): boolean {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return false;
  }
  if (amount <= 0) {
    return false;
  }
  // Check for max 2 decimal places
  const decimalPlaces = (amount.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
}

/**
 * Convert amount to cents (Column API uses cents)
 */
export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert cents to amount
 */
export function centsToAmount(cents: number): number {
  return cents / 100;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (E.164 format preferred)
 */
export function isValidPhoneNumber(phone: string): boolean {
  // E.164 format: +[country code][number]
  const e164Regex = /^\+[1-9]\d{1,14}$/;
  // US format: 10 digits
  const usRegex = /^\d{10}$/;

  return e164Regex.test(phone) || usRegex.test(phone.replace(/\D/g, ''));
}

/**
 * Format phone to E.164
 */
export function formatPhoneE164(phone: string, countryCode = '1'): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `+${countryCode}${digits}`;
  }
  if (digits.length === 11 && digits.startsWith(countryCode)) {
    return `+${digits}`;
  }
  return phone;
}

/**
 * Validate SSN format (with or without dashes)
 */
export function isValidSSN(ssn: string): boolean {
  const ssnRegex = /^\d{3}-?\d{2}-?\d{4}$/;
  return ssnRegex.test(ssn);
}

/**
 * Format SSN (remove dashes for API)
 */
export function formatSSN(ssn: string): string {
  return ssn.replace(/-/g, '');
}

/**
 * Validate EIN format
 */
export function isValidEIN(ein: string): boolean {
  const einRegex = /^\d{2}-?\d{7}$/;
  return einRegex.test(ein);
}

/**
 * Format EIN (remove dashes for API)
 */
export function formatEIN(ein: string): string {
  return ein.replace(/-/g, '');
}

/**
 * Validate date of birth (must be in the past)
 */
export function isValidDateOfBirth(dob: string): boolean {
  const date = new Date(dob);
  if (isNaN(date.getTime())) {
    return false;
  }
  return date < new Date();
}

/**
 * Validate US state code
 */
export function isValidStateCode(state: string): boolean {
  const stateCodes = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP',
  ];
  return stateCodes.includes(state.toUpperCase());
}

/**
 * Validate US ZIP code
 */
export function isValidZipCode(zip: string): boolean {
  // 5 digits or 5+4 format
  return /^\d{5}(-\d{4})?$/.test(zip);
}

/**
 * Validate idempotency key format
 */
export function isValidIdempotencyKey(key: string): boolean {
  // UUID v4 format or custom alphanumeric
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const customRegex = /^[a-zA-Z0-9_-]{1,64}$/;

  return uuidRegex.test(key) || customRegex.test(key);
}

/**
 * Generate idempotency key
 */
export function generateIdempotencyKey(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate Column entity ID format
 */
export function isValidEntityId(id: string): boolean {
  // Column IDs typically start with a prefix like 'ent_', 'acct_', etc.
  return /^[a-z]+_[a-zA-Z0-9]{20,32}$/.test(id);
}

/**
 * Validate required fields and throw error if missing
 */
export function validateRequiredFields(
  node: INode,
  itemIndex: number,
  fields: Record<string, unknown>,
  requiredFields: string[],
): void {
  for (const field of requiredFields) {
    if (fields[field] === undefined || fields[field] === null || fields[field] === '') {
      throw new NodeOperationError(
        node,
        `Required field "${field}" is missing`,
        { itemIndex },
      );
    }
  }
}

/**
 * Sanitize string for safe use (remove control characters)
 */
export function sanitizeString(input: string): string {
  // Remove control characters but keep printable ASCII and common Unicode
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Truncate string to max length
 */
export function truncateString(input: string, maxLength: number): string {
  if (input.length <= maxLength) {
    return input;
  }
  return input.substring(0, maxLength - 3) + '...';
}

/**
 * Parse amount string to number
 */
export function parseAmount(amount: string | number): number {
  if (typeof amount === 'number') {
    return amount;
  }
  // Remove currency symbols and commas
  const cleaned = amount.replace(/[$,]/g, '').trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error(`Invalid amount: ${amount}`);
  }
  return parsed;
}
