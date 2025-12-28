/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * ACH (Automated Clearing House) Codes and Constants
 * ACH is the primary payment rail for electronic bank transfers in the US
 */

/**
 * ACH SEC (Standard Entry Class) Codes
 * These codes define the type of ACH transaction
 */
export const ACH_SEC_CODES = {
  // Consumer entries
  PPD: 'PPD', // Prearranged Payment and Deposit - consumer bill payments/direct deposits
  WEB: 'WEB', // Internet-initiated entries - consumer payments via web
  TEL: 'TEL', // Telephone-initiated entries - consumer payments via phone

  // Business entries
  CCD: 'CCD', // Corporate Credit or Debit - B2B payments
  CTX: 'CTX', // Corporate Trade Exchange - B2B with addenda records

  // Specialized entries
  IAT: 'IAT', // International ACH Transaction
  ARC: 'ARC', // Accounts Receivable Entry - converting checks
  BOC: 'BOC', // Back Office Conversion - check conversion at lockbox
  POP: 'POP', // Point of Purchase - check conversion at POS
  RCK: 'RCK', // Re-presented Check Entry - bounced check re-presentation
  POS: 'POS', // Point of Sale Entry - debit card POS
  SHR: 'SHR', // Shared Network Entry
  MTE: 'MTE', // Machine Transfer Entry - ATM
} as const;

export type AchSecCode = (typeof ACH_SEC_CODES)[keyof typeof ACH_SEC_CODES];

/**
 * ACH Transfer Direction
 */
export const ACH_DIRECTION = {
  CREDIT: 'credit', // Money flows TO counterparty (push)
  DEBIT: 'debit', // Money flows FROM counterparty (pull)
} as const;

export type AchDirection = (typeof ACH_DIRECTION)[keyof typeof ACH_DIRECTION];

/**
 * ACH Transfer Status
 */
export const ACH_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  RETURNED: 'returned',
  CANCELED: 'canceled',
  FAILED: 'failed',
} as const;

export type AchStatus = (typeof ACH_STATUS)[keyof typeof ACH_STATUS];

/**
 * ACH Return Codes
 * These codes explain why an ACH transfer was returned
 */
export const ACH_RETURN_CODES = {
  // Administrative Returns (Returned within 2 banking days)
  R01: { code: 'R01', reason: 'Insufficient Funds', description: 'Available balance insufficient' },
  R02: { code: 'R02', reason: 'Account Closed', description: 'Previously active account closed' },
  R03: { code: 'R03', reason: 'No Account/Unable to Locate', description: 'Account not found' },
  R04: { code: 'R04', reason: 'Invalid Account Number', description: 'Account number invalid' },
  R05: { code: 'R05', reason: 'Unauthorized Debit', description: 'Consumer claims unauthorized' },
  R06: { code: 'R06', reason: 'Returned per ODFI Request', description: 'ODFI requested return' },
  R07: { code: 'R07', reason: 'Authorization Revoked', description: 'Consumer revoked authorization' },
  R08: { code: 'R08', reason: 'Payment Stopped', description: 'Stop payment placed' },
  R09: { code: 'R09', reason: 'Uncollected Funds', description: 'Funds not yet available' },
  R10: { code: 'R10', reason: 'Customer Advises Unauthorized', description: 'Consumer claims not authorized' },

  // Additional Administrative Returns
  R11: { code: 'R11', reason: 'Check Truncation Entry Return', description: 'Check conversion issue' },
  R12: { code: 'R12', reason: 'Branch Sold', description: 'Account at sold branch' },
  R13: { code: 'R13', reason: 'RDFI Not Qualified', description: 'RDFI not qualified to participate' },
  R14: { code: 'R14', reason: 'Representative Payee Deceased', description: 'Rep payee deceased' },
  R15: { code: 'R15', reason: 'Beneficiary Deceased', description: 'Account holder deceased' },
  R16: { code: 'R16', reason: 'Account Frozen', description: 'Account frozen/blocked' },
  R17: { code: 'R17', reason: 'File Record Edit Criteria', description: 'Invalid field data' },
  R18: { code: 'R18', reason: 'Improper Effective Entry Date', description: 'Invalid effective date' },
  R19: { code: 'R19', reason: 'Amount Field Error', description: 'Amount incorrect' },
  R20: { code: 'R20', reason: 'Non-Transaction Account', description: 'Account cannot accept debits' },

  // Extended Returns
  R21: { code: 'R21', reason: 'Invalid Company Identification', description: 'Company ID invalid' },
  R22: { code: 'R22', reason: 'Invalid Individual ID Number', description: 'Individual ID invalid' },
  R23: { code: 'R23', reason: 'Credit Entry Refused', description: 'Receiver refused credit' },
  R24: { code: 'R24', reason: 'Duplicate Entry', description: 'Duplicate transaction' },
  R25: { code: 'R25', reason: 'Addenda Error', description: 'Invalid addenda record' },
  R26: { code: 'R26', reason: 'Mandatory Field Error', description: 'Required field missing' },
  R27: { code: 'R27', reason: 'Trace Number Error', description: 'Invalid trace number' },
  R28: { code: 'R28', reason: 'Routing Number Check Digit Error', description: 'Invalid routing number' },
  R29: { code: 'R29', reason: 'Corporate Customer Advises Not Authorized', description: 'Corp unauthorized' },
  R30: { code: 'R30', reason: 'RDFI Not Participant in Check Truncation', description: 'Check truncation issue' },
  R31: { code: 'R31', reason: 'Permissible Return Entry', description: 'CCD/CTX permissible return' },
  R32: { code: 'R32', reason: 'RDFI Non-Settlement', description: 'RDFI settlement issue' },
  R33: { code: 'R33', reason: 'Return of XCK Entry', description: 'Check conversion return' },
  R34: { code: 'R34', reason: 'Limited Participation DFI', description: 'DFI participation limited' },
  R35: { code: 'R35', reason: 'Return of Improper Debit Entry', description: 'Improper debit' },
  R36: { code: 'R36', reason: 'Return of Improper Credit Entry', description: 'Improper credit' },
  R37: { code: 'R37', reason: 'Source Document Presented', description: 'Original document presented' },
  R38: { code: 'R38', reason: 'Stop Payment on Source Document', description: 'Stop payment on original' },
  R39: { code: 'R39', reason: 'Improper Source Document', description: 'Invalid source document' },
} as const;

export type AchReturnCode = keyof typeof ACH_RETURN_CODES;

/**
 * ACH NOC (Notification of Change) Codes
 * These codes indicate required changes to account information
 */
export const ACH_NOC_CODES = {
  C01: { code: 'C01', reason: 'Incorrect DFI Account Number', description: 'Account number changed' },
  C02: { code: 'C02', reason: 'Incorrect Routing Number', description: 'Routing number changed' },
  C03: { code: 'C03', reason: 'Incorrect Routing and Account Number', description: 'Both changed' },
  C04: { code: 'C04', reason: 'Incorrect Individual Name', description: 'Name changed' },
  C05: { code: 'C05', reason: 'Incorrect Transaction Code', description: 'Account type changed' },
  C06: { code: 'C06', reason: 'Incorrect Account Number and Transaction Code', description: 'Account and type changed' },
  C07: { code: 'C07', reason: 'Incorrect Routing, Account, and Transaction Code', description: 'All changed' },
  C09: { code: 'C09', reason: 'Incorrect Individual ID', description: 'ID changed' },
  C10: { code: 'C10', reason: 'Incorrect Company Name', description: 'Company name changed' },
  C11: { code: 'C11', reason: 'Incorrect Company Identification', description: 'Company ID changed' },
  C12: { code: 'C12', reason: 'Incorrect Company Name and Company ID', description: 'Both changed' },
  C13: { code: 'C13', reason: 'Addenda Format Error', description: 'Addenda format issue' },
  C14: { code: 'C14', reason: 'Incorrect DFI Account Number and Identification', description: 'Account and ID changed' },
} as const;

export type AchNocCode = keyof typeof ACH_NOC_CODES;

/**
 * ACH options for n8n dropdowns
 */
export const ACH_SEC_CODE_OPTIONS = [
  { name: 'PPD - Consumer Direct Deposit/Payment', value: 'PPD' },
  { name: 'WEB - Internet Payment', value: 'WEB' },
  { name: 'TEL - Telephone Payment', value: 'TEL' },
  { name: 'CCD - Corporate Payment', value: 'CCD' },
  { name: 'CTX - Corporate Trade Exchange', value: 'CTX' },
  { name: 'IAT - International ACH', value: 'IAT' },
];

export const ACH_DIRECTION_OPTIONS = [
  { name: 'Credit (Push funds to counterparty)', value: 'credit' },
  { name: 'Debit (Pull funds from counterparty)', value: 'debit' },
];

export const ACH_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Submitted', value: 'submitted' },
  { name: 'Processing', value: 'processing' },
  { name: 'Completed', value: 'completed' },
  { name: 'Returned', value: 'returned' },
  { name: 'Canceled', value: 'canceled' },
  { name: 'Failed', value: 'failed' },
];

export const ACH_RETURN_CODE_OPTIONS = Object.entries(ACH_RETURN_CODES).map(([key, value]) => ({
  name: `${key} - ${value.reason}`,
  value: key,
}));
