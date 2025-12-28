/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Column Bank Account Types
 * Column provides checking and savings accounts as a chartered bank
 */

export const ACCOUNT_TYPES = {
  CHECKING: 'checking',
  SAVINGS: 'savings',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

/**
 * Account Status Values
 */
export const ACCOUNT_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
  SUSPENDED: 'suspended',
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUS)[keyof typeof ACCOUNT_STATUS];

/**
 * Transaction Types
 */
export const TRANSACTION_TYPES = {
  ACH_CREDIT: 'ach_credit',
  ACH_DEBIT: 'ach_debit',
  WIRE_CREDIT: 'wire_credit',
  WIRE_DEBIT: 'wire_debit',
  BOOK_CREDIT: 'book_credit',
  BOOK_DEBIT: 'book_debit',
  CHECK_DEPOSIT: 'check_deposit',
  CHECK_ISSUED: 'check_issued',
  CARD_TRANSACTION: 'card_transaction',
  CARD_REFUND: 'card_refund',
  FEE: 'fee',
  INTEREST: 'interest',
  ADJUSTMENT: 'adjustment',
  LOAN_DISBURSEMENT: 'loan_disbursement',
  LOAN_PAYMENT: 'loan_payment',
  LOC_DRAW: 'loc_draw',
  LOC_PAYMENT: 'loc_payment',
  HOLD: 'hold',
  HOLD_RELEASE: 'hold_release',
} as const;

export type TransactionType = (typeof TRANSACTION_TYPES)[keyof typeof TRANSACTION_TYPES];

/**
 * Transaction Status
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  POSTED: 'posted',
  REVERSED: 'reversed',
  FAILED: 'failed',
  CANCELED: 'canceled',
} as const;

export type TransactionStatus = (typeof TRANSACTION_STATUS)[keyof typeof TRANSACTION_STATUS];

/**
 * Balance Types
 */
export const BALANCE_TYPES = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  CURRENT: 'current',
  LEDGER: 'ledger',
} as const;

export type BalanceType = (typeof BALANCE_TYPES)[keyof typeof BALANCE_TYPES];

/**
 * Hold Types
 */
export const HOLD_TYPES = {
  AUTHORIZATION: 'authorization',
  PENDING_TRANSFER: 'pending_transfer',
  REGULATORY: 'regulatory',
  MANUAL: 'manual',
  CHECK_HOLD: 'check_hold',
} as const;

export type HoldType = (typeof HOLD_TYPES)[keyof typeof HOLD_TYPES];

/**
 * Hold Status
 */
export const HOLD_STATUS = {
  ACTIVE: 'active',
  RELEASED: 'released',
  EXPIRED: 'expired',
  CAPTURED: 'captured',
} as const;

export type HoldStatus = (typeof HOLD_STATUS)[keyof typeof HOLD_STATUS];

/**
 * Statement Periods
 */
export const STATEMENT_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  ANNUAL: 'annual',
} as const;

export type StatementPeriod = (typeof STATEMENT_PERIODS)[keyof typeof STATEMENT_PERIODS];

/**
 * Account options for n8n dropdowns
 */
export const ACCOUNT_TYPE_OPTIONS = [
  { name: 'Checking', value: 'checking' },
  { name: 'Savings', value: 'savings' },
];

export const ACCOUNT_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Active', value: 'active' },
  { name: 'Frozen', value: 'frozen' },
  { name: 'Closed', value: 'closed' },
  { name: 'Suspended', value: 'suspended' },
];

export const TRANSACTION_TYPE_OPTIONS = [
  { name: 'ACH Credit', value: 'ach_credit' },
  { name: 'ACH Debit', value: 'ach_debit' },
  { name: 'Wire Credit', value: 'wire_credit' },
  { name: 'Wire Debit', value: 'wire_debit' },
  { name: 'Book Credit', value: 'book_credit' },
  { name: 'Book Debit', value: 'book_debit' },
  { name: 'Check Deposit', value: 'check_deposit' },
  { name: 'Check Issued', value: 'check_issued' },
  { name: 'Card Transaction', value: 'card_transaction' },
  { name: 'Card Refund', value: 'card_refund' },
  { name: 'Fee', value: 'fee' },
  { name: 'Interest', value: 'interest' },
  { name: 'Adjustment', value: 'adjustment' },
  { name: 'Loan Disbursement', value: 'loan_disbursement' },
  { name: 'Loan Payment', value: 'loan_payment' },
  { name: 'Line of Credit Draw', value: 'loc_draw' },
  { name: 'Line of Credit Payment', value: 'loc_payment' },
  { name: 'Hold', value: 'hold' },
  { name: 'Hold Release', value: 'hold_release' },
];

export const TRANSACTION_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Posted', value: 'posted' },
  { name: 'Reversed', value: 'reversed' },
  { name: 'Failed', value: 'failed' },
  { name: 'Canceled', value: 'canceled' },
];

export const STATEMENT_PERIOD_OPTIONS = [
  { name: 'Daily', value: 'daily' },
  { name: 'Weekly', value: 'weekly' },
  { name: 'Monthly', value: 'monthly' },
  { name: 'Quarterly', value: 'quarterly' },
  { name: 'Annual', value: 'annual' },
];

export const HOLD_TYPE_OPTIONS = [
  { name: 'Authorization', value: 'authorization' },
  { name: 'Pending Transfer', value: 'pending_transfer' },
  { name: 'Regulatory', value: 'regulatory' },
  { name: 'Manual', value: 'manual' },
  { name: 'Check Hold', value: 'check_hold' },
];

export const HOLD_STATUS_OPTIONS = [
  { name: 'Active', value: 'active' },
  { name: 'Released', value: 'released' },
  { name: 'Expired', value: 'expired' },
  { name: 'Captured', value: 'captured' },
];
