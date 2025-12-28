/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Column API Endpoints and Base URLs
 * Column is a chartered bank providing Banking-as-a-Service
 */

export const COLUMN_API_ENDPOINTS = {
  PRODUCTION: 'https://api.column.com/v1',
  SANDBOX: 'https://api.column-sandbox.com/v1',
} as const;

export const COLUMN_API_VERSION = 'v1';

/**
 * API Resource Paths
 */
export const API_PATHS = {
  // Entity Management
  ENTITIES: '/entities',
  ENTITY: (id: string) => `/entities/${id}`,
  ENTITY_DOCUMENTS: (id: string) => `/entities/${id}/documents`,
  ENTITY_ACCOUNTS: (id: string) => `/entities/${id}/bank-accounts`,
  ENTITY_VERIFICATION: (id: string) => `/entities/${id}/verification`,

  // Bank Accounts
  BANK_ACCOUNTS: '/bank-accounts',
  BANK_ACCOUNT: (id: string) => `/bank-accounts/${id}`,
  BANK_ACCOUNT_BALANCE: (id: string) => `/bank-accounts/${id}/balance`,
  BANK_ACCOUNT_NUMBER: (id: string) => `/bank-accounts/${id}/account-number`,
  BANK_ACCOUNT_ROUTING: (id: string) => `/bank-accounts/${id}/routing-number`,
  BANK_ACCOUNT_STATEMENT: (id: string) => `/bank-accounts/${id}/statements`,
  BANK_ACCOUNT_LIMITS: (id: string) => `/bank-accounts/${id}/limits`,

  // ACH Transfers
  ACH_TRANSFERS: '/transfers/ach',
  ACH_TRANSFER: (id: string) => `/transfers/ach/${id}`,
  ACH_RETURNS: '/transfers/ach/returns',
  ACH_RETURN: (id: string) => `/transfers/ach/returns/${id}`,
  ACH_NOC: '/transfers/ach/noc',
  ACH_LIMITS: '/transfers/ach/limits',
  ACH_WINDOW: '/transfers/ach/window',

  // Wire Transfers
  WIRE_TRANSFERS: '/transfers/wire',
  WIRE_TRANSFER: (id: string) => `/transfers/wire/${id}`,
  WIRE_FEES: '/transfers/wire/fees',
  WIRE_CUTOFF: '/transfers/wire/cutoff',

  // Book Transfers
  BOOK_TRANSFERS: '/transfers/book',
  BOOK_TRANSFER: (id: string) => `/transfers/book/${id}`,

  // Checks
  CHECKS: '/checks',
  CHECK: (id: string) => `/checks/${id}`,
  CHECK_IMAGE: (id: string) => `/checks/${id}/image`,
  CHECK_DEPOSITS: '/check-deposits',
  CHECK_DEPOSIT: (id: string) => `/check-deposits/${id}`,
  CHECK_STOP_PAYMENT: (id: string) => `/checks/${id}/stop-payment`,

  // Counterparties
  COUNTERPARTIES: '/counterparties',
  COUNTERPARTY: (id: string) => `/counterparties/${id}`,
  COUNTERPARTY_VERIFY: (id: string) => `/counterparties/${id}/verify`,
  COUNTERPARTY_ACH: (id: string) => `/counterparties/${id}/ach`,

  // Transactions
  TRANSACTIONS: '/transactions',
  TRANSACTION: (id: string) => `/transactions/${id}`,
  TRANSACTIONS_PENDING: '/transactions/pending',
  TRANSACTIONS_POSTED: '/transactions/posted',
  TRANSACTIONS_SEARCH: '/transactions/search',
  TRANSACTIONS_EXPORT: '/transactions/export',

  // Loans
  LOANS: '/loans',
  LOAN: (id: string) => `/loans/${id}`,
  LOAN_BALANCE: (id: string) => `/loans/${id}/balance`,
  LOAN_SCHEDULE: (id: string) => `/loans/${id}/schedule`,
  LOAN_PAYMENT: (id: string) => `/loans/${id}/payments`,
  LOAN_TRANSACTIONS: (id: string) => `/loans/${id}/transactions`,
  LOAN_PAYOFF: (id: string) => `/loans/${id}/payoff`,
  LOAN_CHARGE_OFF: (id: string) => `/loans/${id}/charge-off`,

  // Lines of Credit
  LINES_OF_CREDIT: '/lines-of-credit',
  LINE_OF_CREDIT: (id: string) => `/lines-of-credit/${id}`,
  LOC_DRAW: (id: string) => `/lines-of-credit/${id}/draw`,
  LOC_PAYMENT: (id: string) => `/lines-of-credit/${id}/payments`,
  LOC_AVAILABLE: (id: string) => `/lines-of-credit/${id}/available`,
  LOC_TRANSACTIONS: (id: string) => `/lines-of-credit/${id}/transactions`,

  // Interest
  INTEREST: '/interest',
  INTEREST_RATE: (accountId: string) => `/bank-accounts/${accountId}/interest-rate`,
  INTEREST_ACCRUED: (accountId: string) => `/bank-accounts/${accountId}/interest/accrued`,
  INTEREST_PAYMENTS: (accountId: string) => `/bank-accounts/${accountId}/interest/payments`,
  INTEREST_APY: (accountId: string) => `/bank-accounts/${accountId}/apy`,

  // Cards
  CARDS: '/cards',
  CARD: (id: string) => `/cards/${id}`,
  CARD_ACTIVATE: (id: string) => `/cards/${id}/activate`,
  CARD_LOCK: (id: string) => `/cards/${id}/lock`,
  CARD_UNLOCK: (id: string) => `/cards/${id}/unlock`,
  CARD_REPLACE: (id: string) => `/cards/${id}/replace`,
  CARD_CLOSE: (id: string) => `/cards/${id}/close`,
  CARD_PIN: (id: string) => `/cards/${id}/pin`,
  CARD_RESET_PIN: (id: string) => `/cards/${id}/pin/reset`,
  CARD_TRANSACTIONS: (id: string) => `/cards/${id}/transactions`,
  CARD_LIMITS: (id: string) => `/cards/${id}/limits`,

  // Statements
  STATEMENTS: '/statements',
  STATEMENT: (id: string) => `/statements/${id}`,
  STATEMENT_PDF: (id: string) => `/statements/${id}/pdf`,
  STATEMENT_TRANSACTIONS: (id: string) => `/statements/${id}/transactions`,
  STATEMENT_GENERATE: '/statements/generate',

  // Documents
  DOCUMENTS: '/documents',
  DOCUMENT: (id: string) => `/documents/${id}`,
  DOCUMENTS_REQUIRED: '/documents/required',

  // Verification
  VERIFICATION: '/verification',
  VERIFICATION_STATUS: (id: string) => `/verification/${id}`,
  VERIFICATION_COMPLETE: (id: string) => `/verification/${id}/complete`,
  VERIFICATION_REQUIREMENTS: '/verification/requirements',

  // Platform
  PLATFORM: '/platform',
  PLATFORM_ACCOUNTS: '/platform/accounts',
  PLATFORM_ENTITIES: '/platform/entities',
  PLATFORM_LIMITS: '/platform/limits',
  PLATFORM_SETTINGS: '/platform/settings',

  // Reporting
  REPORTS: '/reports',
  REPORT: (id: string) => `/reports/${id}`,
  REPORT_DOWNLOAD: (id: string) => `/reports/${id}/download`,
  REPORT_TYPES: '/reports/types',
  REPORT_SCHEDULE: '/reports/schedule',

  // Webhooks
  WEBHOOKS: '/webhooks',
  WEBHOOK: (id: string) => `/webhooks/${id}`,
  WEBHOOK_TEST: (id: string) => `/webhooks/${id}/test`,
  WEBHOOK_EVENTS: '/webhooks/events',
  WEBHOOK_RETRY: (id: string) => `/webhooks/${id}/retry`,

  // Events
  EVENTS: '/events',
  EVENT: (id: string) => `/events/${id}`,
  EVENTS_BY_TYPE: '/events/by-type',
  EVENTS_BY_ENTITY: (entityId: string) => `/entities/${entityId}/events`,
  EVENTS_BY_ACCOUNT: (accountId: string) => `/bank-accounts/${accountId}/events`,

  // Holds
  HOLDS: '/holds',
  HOLD: (id: string) => `/holds/${id}`,
  HOLD_RELEASE: (id: string) => `/holds/${id}/release`,

  // Fees
  FEES: '/fees',
  FEE: (id: string) => `/fees/${id}`,
  FEE_WAIVE: (id: string) => `/fees/${id}/waive`,
  FEE_SCHEDULE: '/fees/schedule',

  // Sandbox
  SANDBOX_ACH_RETURN: '/sandbox/ach/return',
  SANDBOX_ACH_NOC: '/sandbox/ach/noc',
  SANDBOX_WIRE_RETURN: '/sandbox/wire/return',
  SANDBOX_CHECK_DEPOSIT: '/sandbox/check/deposit',
  SANDBOX_CARD_TRANSACTION: '/sandbox/card/transaction',
  SANDBOX_ADVANCE_TIME: '/sandbox/time/advance',
  SANDBOX_FUND_ACCOUNT: '/sandbox/fund',

  // Utility
  ROUTING_NUMBER_VALIDATE: '/routing-numbers/validate',
  BANK_INFO: '/banks',
  API_STATUS: '/status',
  RATE_LIMITS: '/rate-limits',
} as const;

export type ColumnEnvironment = 'production' | 'sandbox' | 'custom';
