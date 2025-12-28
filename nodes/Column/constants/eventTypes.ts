/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Column Event Types
 * Events are emitted for all significant changes in the Column platform
 */

/**
 * Entity Events
 */
export const ENTITY_EVENTS = {
  ENTITY_CREATED: 'entity.created',
  ENTITY_UPDATED: 'entity.updated',
  ENTITY_ARCHIVED: 'entity.archived',
  ENTITY_VERIFICATION_COMPLETED: 'entity.verification.completed',
  ENTITY_VERIFICATION_FAILED: 'entity.verification.failed',
} as const;

/**
 * Account Events
 */
export const ACCOUNT_EVENTS = {
  ACCOUNT_CREATED: 'account.created',
  ACCOUNT_UPDATED: 'account.updated',
  ACCOUNT_CLOSED: 'account.closed',
  ACCOUNT_BALANCE_CHANGED: 'account.balance.changed',
  ACCOUNT_OVERDRAWN: 'account.overdrawn',
} as const;

/**
 * ACH Events
 */
export const ACH_EVENTS = {
  ACH_CREATED: 'ach.created',
  ACH_SUBMITTED: 'ach.submitted',
  ACH_COMPLETED: 'ach.completed',
  ACH_RETURNED: 'ach.returned',
  ACH_CANCELED: 'ach.canceled',
  ACH_NOC_RECEIVED: 'ach.noc.received',
} as const;

/**
 * Wire Events
 */
export const WIRE_EVENTS = {
  WIRE_CREATED: 'wire.created',
  WIRE_SUBMITTED: 'wire.submitted',
  WIRE_COMPLETED: 'wire.completed',
  WIRE_RETURNED: 'wire.returned',
  WIRE_CANCELED: 'wire.canceled',
} as const;

/**
 * Book Transfer Events
 */
export const BOOK_TRANSFER_EVENTS = {
  BOOK_TRANSFER_CREATED: 'book_transfer.created',
  BOOK_TRANSFER_COMPLETED: 'book_transfer.completed',
} as const;

/**
 * Check Events
 */
export const CHECK_EVENTS = {
  CHECK_ISSUED: 'check.issued',
  CHECK_MAILED: 'check.mailed',
  CHECK_CASHED: 'check.cashed',
  CHECK_VOIDED: 'check.voided',
  CHECK_DEPOSIT_RECEIVED: 'check_deposit.received',
  CHECK_DEPOSIT_CLEARED: 'check_deposit.cleared',
  CHECK_DEPOSIT_RETURNED: 'check_deposit.returned',
} as const;

/**
 * Card Events
 */
export const CARD_EVENTS = {
  CARD_CREATED: 'card.created',
  CARD_ACTIVATED: 'card.activated',
  CARD_LOCKED: 'card.locked',
  CARD_UNLOCKED: 'card.unlocked',
  CARD_TRANSACTION: 'card.transaction',
} as const;

/**
 * Loan Events
 */
export const LOAN_EVENTS = {
  LOAN_CREATED: 'loan.created',
  LOAN_FUNDED: 'loan.funded',
  LOAN_PAYMENT_RECEIVED: 'loan.payment.received',
  LOAN_PAYMENT_DUE: 'loan.payment.due',
  LOAN_PAID_OFF: 'loan.paid_off',
  LOAN_DELINQUENT: 'loan.delinquent',
} as const;

/**
 * Transaction Events
 */
export const TRANSACTION_EVENTS = {
  TRANSACTION_CREATED: 'transaction.created',
  TRANSACTION_POSTED: 'transaction.posted',
  TRANSACTION_REVERSED: 'transaction.reversed',
} as const;

/**
 * All Event Types Combined
 */
export const ALL_EVENT_TYPES = {
  ...ENTITY_EVENTS,
  ...ACCOUNT_EVENTS,
  ...ACH_EVENTS,
  ...WIRE_EVENTS,
  ...BOOK_TRANSFER_EVENTS,
  ...CHECK_EVENTS,
  ...CARD_EVENTS,
  ...LOAN_EVENTS,
  ...TRANSACTION_EVENTS,
} as const;

export type EventType = (typeof ALL_EVENT_TYPES)[keyof typeof ALL_EVENT_TYPES];

/**
 * Event options for n8n dropdowns - grouped by category
 */
export const EVENT_TYPE_OPTIONS = [
  // Entity Events
  { name: 'Entity Created', value: 'entity.created' },
  { name: 'Entity Updated', value: 'entity.updated' },
  { name: 'Entity Archived', value: 'entity.archived' },
  { name: 'Verification Completed', value: 'entity.verification.completed' },
  { name: 'Verification Failed', value: 'entity.verification.failed' },

  // Account Events
  { name: 'Account Created', value: 'account.created' },
  { name: 'Account Updated', value: 'account.updated' },
  { name: 'Account Closed', value: 'account.closed' },
  { name: 'Balance Changed', value: 'account.balance.changed' },
  { name: 'Account Overdrawn', value: 'account.overdrawn' },

  // ACH Events
  { name: 'ACH Created', value: 'ach.created' },
  { name: 'ACH Submitted', value: 'ach.submitted' },
  { name: 'ACH Completed', value: 'ach.completed' },
  { name: 'ACH Returned', value: 'ach.returned' },
  { name: 'ACH Canceled', value: 'ach.canceled' },
  { name: 'NOC Received', value: 'ach.noc.received' },

  // Wire Events
  { name: 'Wire Created', value: 'wire.created' },
  { name: 'Wire Submitted', value: 'wire.submitted' },
  { name: 'Wire Completed', value: 'wire.completed' },
  { name: 'Wire Returned', value: 'wire.returned' },
  { name: 'Wire Canceled', value: 'wire.canceled' },

  // Book Transfer Events
  { name: 'Book Transfer Created', value: 'book_transfer.created' },
  { name: 'Book Transfer Completed', value: 'book_transfer.completed' },

  // Check Events
  { name: 'Check Issued', value: 'check.issued' },
  { name: 'Check Mailed', value: 'check.mailed' },
  { name: 'Check Cashed', value: 'check.cashed' },
  { name: 'Check Voided', value: 'check.voided' },
  { name: 'Check Deposit Received', value: 'check_deposit.received' },
  { name: 'Check Deposit Cleared', value: 'check_deposit.cleared' },
  { name: 'Check Deposit Returned', value: 'check_deposit.returned' },

  // Card Events
  { name: 'Card Created', value: 'card.created' },
  { name: 'Card Activated', value: 'card.activated' },
  { name: 'Card Locked', value: 'card.locked' },
  { name: 'Card Unlocked', value: 'card.unlocked' },
  { name: 'Card Transaction', value: 'card.transaction' },

  // Loan Events
  { name: 'Loan Created', value: 'loan.created' },
  { name: 'Loan Funded', value: 'loan.funded' },
  { name: 'Loan Payment Received', value: 'loan.payment.received' },
  { name: 'Loan Payment Due', value: 'loan.payment.due' },
  { name: 'Loan Paid Off', value: 'loan.paid_off' },
  { name: 'Loan Delinquent', value: 'loan.delinquent' },

  // Transaction Events
  { name: 'Transaction Created', value: 'transaction.created' },
  { name: 'Transaction Posted', value: 'transaction.posted' },
  { name: 'Transaction Reversed', value: 'transaction.reversed' },
];

/**
 * Wire Transfer Types
 */
export const WIRE_TYPES = {
  DOMESTIC: 'domestic',
  INTERNATIONAL: 'international',
} as const;

export type WireType = (typeof WIRE_TYPES)[keyof typeof WIRE_TYPES];

/**
 * Wire Status
 */
export const WIRE_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  RETURNED: 'returned',
  CANCELED: 'canceled',
  FAILED: 'failed',
} as const;

export type WireStatus = (typeof WIRE_STATUS)[keyof typeof WIRE_STATUS];

/**
 * Check Status
 */
export const CHECK_STATUS = {
  PENDING: 'pending',
  PRINTED: 'printed',
  MAILED: 'mailed',
  CASHED: 'cashed',
  VOIDED: 'voided',
  STOPPED: 'stopped',
  EXPIRED: 'expired',
} as const;

export type CheckStatus = (typeof CHECK_STATUS)[keyof typeof CHECK_STATUS];

/**
 * Check Deposit Status
 */
export const CHECK_DEPOSIT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  CLEARED: 'cleared',
  RETURNED: 'returned',
  REJECTED: 'rejected',
} as const;

export type CheckDepositStatus = (typeof CHECK_DEPOSIT_STATUS)[keyof typeof CHECK_DEPOSIT_STATUS];

/**
 * Card Status
 */
export const CARD_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  LOCKED: 'locked',
  CLOSED: 'closed',
  EXPIRED: 'expired',
  LOST: 'lost',
  STOLEN: 'stolen',
} as const;

export type CardStatus = (typeof CARD_STATUS)[keyof typeof CARD_STATUS];

/**
 * Card Types
 */
export const CARD_TYPES = {
  DEBIT: 'debit',
  CREDIT: 'credit',
  PREPAID: 'prepaid',
  VIRTUAL: 'virtual',
} as const;

export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];

/**
 * Loan Status
 */
export const LOAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  FUNDED: 'funded',
  ACTIVE: 'active',
  DELINQUENT: 'delinquent',
  DEFAULTED: 'defaulted',
  PAID_OFF: 'paid_off',
  CHARGED_OFF: 'charged_off',
  CLOSED: 'closed',
} as const;

export type LoanStatus = (typeof LOAN_STATUS)[keyof typeof LOAN_STATUS];

/**
 * Loan Types
 */
export const LOAN_TYPES = {
  TERM: 'term',
  INSTALLMENT: 'installment',
  BULLET: 'bullet',
} as const;

export type LoanType = (typeof LOAN_TYPES)[keyof typeof LOAN_TYPES];

/**
 * Line of Credit Status
 */
export const LOC_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  FROZEN: 'frozen',
  CLOSED: 'closed',
} as const;

export type LocStatus = (typeof LOC_STATUS)[keyof typeof LOC_STATUS];

/**
 * Report Types
 */
export const REPORT_TYPES = {
  TRANSACTION_SUMMARY: 'transaction_summary',
  ACCOUNT_ACTIVITY: 'account_activity',
  ACH_ACTIVITY: 'ach_activity',
  WIRE_ACTIVITY: 'wire_activity',
  LOAN_SUMMARY: 'loan_summary',
  CARD_ACTIVITY: 'card_activity',
  BALANCE_REPORT: 'balance_report',
  FEE_SUMMARY: 'fee_summary',
  INTEREST_SUMMARY: 'interest_summary',
  REGULATORY: 'regulatory',
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

/**
 * Additional dropdown options
 */
export const WIRE_TYPE_OPTIONS = [
  { name: 'Domestic', value: 'domestic' },
  { name: 'International', value: 'international' },
];

export const CARD_TYPE_OPTIONS = [
  { name: 'Debit', value: 'debit' },
  { name: 'Credit', value: 'credit' },
  { name: 'Prepaid', value: 'prepaid' },
  { name: 'Virtual', value: 'virtual' },
];

export const CARD_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Active', value: 'active' },
  { name: 'Locked', value: 'locked' },
  { name: 'Closed', value: 'closed' },
  { name: 'Expired', value: 'expired' },
  { name: 'Lost', value: 'lost' },
  { name: 'Stolen', value: 'stolen' },
];

export const LOAN_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Approved', value: 'approved' },
  { name: 'Funded', value: 'funded' },
  { name: 'Active', value: 'active' },
  { name: 'Delinquent', value: 'delinquent' },
  { name: 'Defaulted', value: 'defaulted' },
  { name: 'Paid Off', value: 'paid_off' },
  { name: 'Charged Off', value: 'charged_off' },
  { name: 'Closed', value: 'closed' },
];

export const LOAN_TYPE_OPTIONS = [
  { name: 'Term Loan', value: 'term' },
  { name: 'Installment Loan', value: 'installment' },
  { name: 'Bullet Loan', value: 'bullet' },
];

export const REPORT_TYPE_OPTIONS = [
  { name: 'Transaction Summary', value: 'transaction_summary' },
  { name: 'Account Activity', value: 'account_activity' },
  { name: 'ACH Activity', value: 'ach_activity' },
  { name: 'Wire Activity', value: 'wire_activity' },
  { name: 'Loan Summary', value: 'loan_summary' },
  { name: 'Card Activity', value: 'card_activity' },
  { name: 'Balance Report', value: 'balance_report' },
  { name: 'Fee Summary', value: 'fee_summary' },
  { name: 'Interest Summary', value: 'interest_summary' },
  { name: 'Regulatory', value: 'regulatory' },
];
