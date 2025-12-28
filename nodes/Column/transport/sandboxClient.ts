/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { columnApiRequest } from './columnClient';
import { isSandboxEnvironment } from '../utils/authUtils';
import { API_PATHS } from '../constants/endpoints';

/**
 * Sandbox-specific operations for testing Column integrations
 * These operations are only available in the sandbox environment
 */

/**
 * Verify we're in sandbox environment
 */
export async function ensureSandboxEnvironment(context: IExecuteFunctions): Promise<void> {
  const credentials = await context.getCredentials('columnApi');
  if (!isSandboxEnvironment(credentials)) {
    throw new NodeOperationError(
      context.getNode(),
      'Sandbox operations are only available in the sandbox environment',
    );
  }
}

/**
 * Simulate an ACH return
 */
export async function simulateAchReturn(
  this: IExecuteFunctions,
  transferId: string,
  returnCode: string,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_ACH_RETURN,
    body: {
      transfer_id: transferId,
      return_code: returnCode,
    },
  });
}

/**
 * Simulate an ACH Notification of Change (NOC)
 */
export async function simulateAchNoc(
  this: IExecuteFunctions,
  transferId: string,
  nocCode: string,
  correctedData: Record<string, string>,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_ACH_NOC,
    body: {
      transfer_id: transferId,
      noc_code: nocCode,
      corrected_data: correctedData,
    },
  });
}

/**
 * Simulate a wire transfer return
 */
export async function simulateWireReturn(
  this: IExecuteFunctions,
  transferId: string,
  reason: string,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_WIRE_RETURN,
    body: {
      transfer_id: transferId,
      reason,
    },
  });
}

/**
 * Simulate a check deposit
 */
export async function simulateCheckDeposit(
  this: IExecuteFunctions,
  depositId: string,
  action: 'clear' | 'return',
  returnReason?: string,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  const body: Record<string, unknown> = {
    deposit_id: depositId,
    action,
  };

  if (action === 'return' && returnReason) {
    body.return_reason = returnReason;
  }

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_CHECK_DEPOSIT,
    body,
  });
}

/**
 * Simulate a card transaction
 */
export async function simulateCardTransaction(
  this: IExecuteFunctions,
  cardId: string,
  amount: number,
  merchantName: string,
  merchantCategory: string,
  transactionType: 'purchase' | 'refund' | 'withdrawal',
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_CARD_TRANSACTION,
    body: {
      card_id: cardId,
      amount,
      merchant_name: merchantName,
      merchant_category_code: merchantCategory,
      transaction_type: transactionType,
    },
  });
}

/**
 * Advance sandbox time
 * Useful for testing time-sensitive operations like interest accrual
 */
export async function advanceSandboxTime(
  this: IExecuteFunctions,
  days: number,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_ADVANCE_TIME,
    body: {
      days,
    },
  });
}

/**
 * Fund a sandbox account
 * Adds test funds to an account for testing purposes
 */
export async function fundSandboxAccount(
  this: IExecuteFunctions,
  accountId: string,
  amount: number,
  description?: string,
): Promise<unknown> {
  await ensureSandboxEnvironment(this);

  return await columnApiRequest.call(this, {
    method: 'POST',
    endpoint: API_PATHS.SANDBOX_FUND_ACCOUNT,
    body: {
      account_id: accountId,
      amount,
      description: description || 'Sandbox funding',
    },
  });
}

/**
 * Sandbox test data generators
 */

/**
 * Generate test person entity data
 */
export function generateTestPersonData(): Record<string, unknown> {
  const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'];

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

  return {
    type: 'person',
    first_name: firstName,
    last_name: lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    phone: '+15555555555',
    date_of_birth: '1985-06-15',
    ssn: '123456789', // Test SSN
    address: {
      line1: '123 Test Street',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
  };
}

/**
 * Generate test business entity data
 */
export function generateTestBusinessData(): Record<string, unknown> {
  const businessNames = ['Acme Corp', 'Test Industries', 'Sample LLC', 'Demo Company'];
  const businessName = businessNames[Math.floor(Math.random() * businessNames.length)];

  return {
    type: 'business',
    legal_name: businessName,
    dba_name: businessName,
    business_type: 'llc',
    ein: '123456789', // Test EIN
    formation_date: '2020-01-01',
    formation_state: 'DE',
    phone: '+15555555555',
    email: 'contact@example.com',
    website: 'https://example.com',
    address: {
      line1: '456 Business Ave',
      city: 'San Francisco',
      state: 'CA',
      postal_code: '94105',
      country: 'US',
    },
  };
}

/**
 * Generate test counterparty data
 */
export function generateTestCounterpartyData(): Record<string, unknown> {
  return {
    name: 'Test Counterparty',
    routing_number: '121000358', // Test routing number (Wells Fargo)
    account_number: '1234567890',
    account_type: 'checking',
  };
}

/**
 * Sandbox-specific constants
 */
export const SANDBOX_TEST_ROUTING_NUMBERS = [
  { routingNumber: '121000358', bankName: 'Wells Fargo (Test)' },
  { routingNumber: '021000021', bankName: 'JPMorgan Chase (Test)' },
  { routingNumber: '011401533', bankName: 'Bank of America (Test)' },
];

export const SANDBOX_ACH_RETURN_SIMULATION_CODES = [
  { code: 'R01', description: 'Insufficient Funds' },
  { code: 'R02', description: 'Account Closed' },
  { code: 'R03', description: 'No Account/Unable to Locate' },
  { code: 'R04', description: 'Invalid Account Number' },
  { code: 'R10', description: 'Customer Advises Unauthorized' },
];

export const SANDBOX_CHECK_RETURN_REASONS = [
  { code: 'insufficient_funds', description: 'Insufficient Funds' },
  { code: 'account_closed', description: 'Account Closed' },
  { code: 'stop_payment', description: 'Stop Payment' },
  { code: 'unable_to_locate', description: 'Unable to Locate Account' },
];
