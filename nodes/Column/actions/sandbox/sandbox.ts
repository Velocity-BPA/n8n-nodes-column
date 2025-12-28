/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeProperties,
	IDataObject,
} from 'n8n-workflow';

import { columnApiRequest } from '../../transport/columnClient';
import {
	simulateAchReturn,
	simulateAchNoc,
	simulateWireReturn,
	simulateCheckDeposit,
	simulateCardTransaction,
	advanceSandboxTime,
	fundSandboxAccount,
	ensureSandboxEnvironment,
} from '../../transport/sandboxClient';

export const sandboxOperations: INodeProperties[] = [{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['sandbox'],
		},
	},
	options: [
		{
			name: 'Advance Time',
			value: 'advanceTime',
			description: 'Advance sandbox time to trigger scheduled events',
			action: 'Advance sandbox time',
		},
		{
			name: 'Fund Account',
			value: 'fundAccount',
			description: 'Fund a sandbox account with test funds',
			action: 'Fund a sandbox account',
		},
		{
			name: 'Simulate ACH NOC',
			value: 'simulateAchNoc',
			description: 'Simulate an ACH Notification of Change',
			action: 'Simulate ach noc',
		},
		{
			name: 'Simulate ACH Return',
			value: 'simulateAchReturn',
			description: 'Simulate an ACH return for testing',
			action: 'Simulate ach return',
		},
		{
			name: 'Simulate Card Transaction',
			value: 'simulateCardTransaction',
			description: 'Simulate a card transaction',
			action: 'Simulate card transaction',
		},
		{
			name: 'Simulate Check Deposit',
			value: 'simulateCheckDeposit',
			description: 'Simulate a check deposit',
			action: 'Simulate check deposit',
		},
		{
			name: 'Simulate Wire Return',
			value: 'simulateWireReturn',
			description: 'Simulate a wire transfer return',
			action: 'Simulate wire return',
		},
	],
	default: 'simulateAchReturn',
}];

export const sandboxFields: INodeProperties[] = [
	// Simulate ACH Return fields
	{
		displayName: 'ACH Transfer ID',
		name: 'achTransferId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAchReturn'],
			},
		},
		description: 'The ID of the ACH transfer to simulate a return for',
	},
	{
		displayName: 'Return Code',
		name: 'returnCode',
		type: 'options',
		required: true,
		default: 'R01',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAchReturn'],
			},
		},
		options: [
			{ name: 'R01 - Insufficient Funds', value: 'R01' },
			{ name: 'R02 - Account Closed', value: 'R02' },
			{ name: 'R03 - No Account/Unable to Locate', value: 'R03' },
			{ name: 'R04 - Invalid Account Number', value: 'R04' },
			{ name: 'R05 - Unauthorized Debit', value: 'R05' },
			{ name: 'R06 - Returned per ODFI Request', value: 'R06' },
			{ name: 'R07 - Authorization Revoked', value: 'R07' },
			{ name: 'R08 - Payment Stopped', value: 'R08' },
			{ name: 'R09 - Uncollected Funds', value: 'R09' },
			{ name: 'R10 - Customer Advises Unauthorized', value: 'R10' },
			{ name: 'R11 - Check Truncation Entry Return', value: 'R11' },
			{ name: 'R12 - Branch Sold to Another DFI', value: 'R12' },
			{ name: 'R13 - Invalid ACH Routing Number', value: 'R13' },
			{ name: 'R14 - Representative Payee Deceased', value: 'R14' },
			{ name: 'R15 - Beneficiary or Account Holder Deceased', value: 'R15' },
			{ name: 'R16 - Account Frozen', value: 'R16' },
			{ name: 'R17 - File Record Edit Criteria', value: 'R17' },
			{ name: 'R20 - Non-Transaction Account', value: 'R20' },
			{ name: 'R21 - Invalid Company Identification', value: 'R21' },
			{ name: 'R22 - Invalid Individual ID Number', value: 'R22' },
			{ name: 'R23 - Credit Entry Refused by Receiver', value: 'R23' },
			{ name: 'R24 - Duplicate Entry', value: 'R24' },
			{ name: 'R29 - Corporate Customer Advises Not Authorized', value: 'R29' },
		],
		description: 'The ACH return code to simulate',
	},

	// Simulate ACH NOC fields
	{
		displayName: 'ACH Transfer ID',
		name: 'achTransferIdNoc',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAchNoc'],
			},
		},
		description: 'The ID of the ACH transfer to simulate a NOC for',
	},
	{
		displayName: 'NOC Code',
		name: 'nocCode',
		type: 'options',
		required: true,
		default: 'C01',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAchNoc'],
			},
		},
		options: [
			{ name: 'C01 - Incorrect Account Number', value: 'C01' },
			{ name: 'C02 - Incorrect Routing Number', value: 'C02' },
			{ name: 'C03 - Incorrect Routing and Account Number', value: 'C03' },
			{ name: 'C05 - Incorrect Transaction Code', value: 'C05' },
			{ name: 'C06 - Incorrect Account Number and Transaction Code', value: 'C06' },
			{ name: 'C07 - Incorrect Routing, Account, and Transaction Code', value: 'C07' },
			{ name: 'C09 - Incorrect Individual ID Number', value: 'C09' },
		],
		description: 'The NOC code to simulate',
	},
	{
		displayName: 'Corrected Data',
		name: 'correctedData',
		type: 'fixedCollection',
		default: {},
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateAchNoc'],
			},
		},
		typeOptions: {
			multipleValues: false,
		},
		options: [
			{
				displayName: 'Corrections',
				name: 'corrections',
				values: [
					{
						displayName: 'Corrected Account Number',
						name: 'correctedAccountNumber',
						type: 'string',
						default: '',
						description: 'The corrected account number',
					},
					{
						displayName: 'Corrected Routing Number',
						name: 'correctedRoutingNumber',
						type: 'string',
						default: '',
						description: 'The corrected routing number',
					},
				],
			},
		],
		description: 'The corrected data to include in the NOC',
	},

	// Simulate Wire Return fields
	{
		displayName: 'Wire Transfer ID',
		name: 'wireTransferId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateWireReturn'],
			},
		},
		description: 'The ID of the wire transfer to simulate a return for',
	},
	{
		displayName: 'Return Reason',
		name: 'wireReturnReason',
		type: 'options',
		required: true,
		default: 'ACCOUNT_CLOSED',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateWireReturn'],
			},
		},
		options: [
			{ name: 'Account Closed', value: 'ACCOUNT_CLOSED' },
			{ name: 'Account Frozen', value: 'ACCOUNT_FROZEN' },
			{ name: 'Beneficiary Deceased', value: 'BENEFICIARY_DECEASED' },
			{ name: 'Beneficiary Unknown', value: 'BENEFICIARY_UNKNOWN' },
			{ name: 'Duplicate Wire', value: 'DUPLICATE_WIRE' },
			{ name: 'Incorrect Account Number', value: 'INCORRECT_ACCOUNT_NUMBER' },
			{ name: 'Regulatory', value: 'REGULATORY' },
			{ name: 'Refused', value: 'REFUSED' },
		],
		description: 'The reason for the wire return',
	},

	// Simulate Check Deposit fields
	{
		displayName: 'Bank Account ID',
		name: 'checkDepositAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCheckDeposit'],
			},
		},
		description: 'The ID of the bank account to deposit the check into',
	},
	{
		displayName: 'Amount (in Cents)',
		name: 'checkDepositAmount',
		type: 'number',
		required: true,
		default: 10000,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCheckDeposit'],
			},
		},
		description: 'The amount of the check deposit in cents (e.g., 10000 = $100.00)',
	},
	{
		displayName: 'Check Number',
		name: 'checkNumber',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCheckDeposit'],
			},
		},
		description: 'The check number (optional)',
	},

	// Simulate Card Transaction fields
	{
		displayName: 'Card ID',
		name: 'cardId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCardTransaction'],
			},
		},
		description: 'The ID of the card to simulate a transaction for',
	},
	{
		displayName: 'Amount (in Cents)',
		name: 'cardTransactionAmount',
		type: 'number',
		required: true,
		default: 5000,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCardTransaction'],
			},
		},
		description: 'The transaction amount in cents (e.g., 5000 = $50.00)',
	},
	{
		displayName: 'Merchant Name',
		name: 'merchantName',
		type: 'string',
		default: 'Test Merchant',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCardTransaction'],
			},
		},
		description: 'The name of the merchant',
	},
	{
		displayName: 'Merchant Category Code',
		name: 'mcc',
		type: 'string',
		default: '5411',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCardTransaction'],
			},
		},
		description: 'The MCC code for the merchant (e.g., 5411 = Grocery Stores)',
	},
	{
		displayName: 'Transaction Type',
		name: 'cardTransactionType',
		type: 'options',
		default: 'purchase',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['simulateCardTransaction'],
			},
		},
		options: [
			{ name: 'Purchase', value: 'purchase' },
			{ name: 'ATM Withdrawal', value: 'atm_withdrawal' },
			{ name: 'Refund', value: 'refund' },
			{ name: 'Authorization', value: 'authorization' },
		],
		description: 'The type of card transaction to simulate',
	},

	// Advance Time fields
	{
		displayName: 'Days to Advance',
		name: 'daysToAdvance',
		type: 'number',
		required: true,
		default: 1,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['advanceTime'],
			},
		},
		description: 'The number of days to advance sandbox time (1-30)',
	},
	{
		displayName: 'Process ACH',
		name: 'processAch',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['advanceTime'],
			},
		},
		description: 'Whether to process pending ACH transfers',
	},
	{
		displayName: 'Process Wires',
		name: 'processWires',
		type: 'boolean',
		default: true,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['advanceTime'],
			},
		},
		description: 'Whether to process pending wire transfers',
	},

	// Fund Account fields
	{
		displayName: 'Bank Account ID',
		name: 'fundAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['fundAccount'],
			},
		},
		description: 'The ID of the bank account to fund',
	},
	{
		displayName: 'Amount (in Cents)',
		name: 'fundAmount',
		type: 'number',
		required: true,
		default: 100000,
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['fundAccount'],
			},
		},
		description: 'The amount to fund in cents (e.g., 100000 = $1,000.00)',
	},
	{
		displayName: 'Description',
		name: 'fundDescription',
		type: 'string',
		default: 'Sandbox test funding',
		displayOptions: {
			show: {
				resource: ['sandbox'],
				operation: ['fundAccount'],
			},
		},
		description: 'A description for the funding transaction',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	// Ensure we're in sandbox environment
	await ensureSandboxEnvironment(this);

	switch (operation) {
		case 'simulateAchReturn': {
			const achTransferId = this.getNodeParameter('achTransferId', index) as string;
			const returnCode = this.getNodeParameter('returnCode', index) as string;

			responseData = (await simulateAchReturn.call(this, achTransferId, returnCode)) as IDataObject;
			break;
		}

		case 'simulateAchNoc': {
			const achTransferId = this.getNodeParameter('achTransferIdNoc', index) as string;
			const nocCode = this.getNodeParameter('nocCode', index) as string;
			const correctedDataRaw = this.getNodeParameter('correctedData', index) as {
				corrections?: {
					correctedAccountNumber?: string;
					correctedRoutingNumber?: string;
				};
			};

			const correctedData: Record<string, string> = {};
			if (correctedDataRaw.corrections?.correctedAccountNumber) {
				correctedData.account_number = correctedDataRaw.corrections.correctedAccountNumber;
			}
			if (correctedDataRaw.corrections?.correctedRoutingNumber) {
				correctedData.routing_number = correctedDataRaw.corrections.correctedRoutingNumber;
			}

			responseData = (await simulateAchNoc.call(this, achTransferId, nocCode, correctedData)) as IDataObject;
			break;
		}

		case 'simulateWireReturn': {
			const wireTransferId = this.getNodeParameter('wireTransferId', index) as string;
			const returnReason = this.getNodeParameter('wireReturnReason', index) as string;

			responseData = (await simulateWireReturn.call(this, wireTransferId, returnReason)) as IDataObject;
			break;
		}

		case 'simulateCheckDeposit': {
			const depositId = this.getNodeParameter('checkDepositAccountId', index) as string;
			const action = this.getNodeParameter('checkDepositAction', index, 'clear') as 'clear' | 'return';
			const returnReason = this.getNodeParameter('checkReturnReason', index, '') as string;

			responseData = (await simulateCheckDeposit.call(this, depositId, action, returnReason || undefined)) as IDataObject;
			break;
		}

		case 'simulateCardTransaction': {
			const cardId = this.getNodeParameter('cardId', index) as string;
			const amount = this.getNodeParameter('cardTransactionAmount', index) as number;
			const merchantName = this.getNodeParameter('merchantName', index) as string;
			const mcc = this.getNodeParameter('mcc', index) as string;
			const transactionType = this.getNodeParameter('cardTransactionType', index, 'purchase') as 'purchase' | 'refund' | 'withdrawal';

			responseData = (await simulateCardTransaction.call(this, cardId, amount, merchantName, mcc, transactionType)) as IDataObject;
			break;
		}

		case 'advanceTime': {
			const days = this.getNodeParameter('daysToAdvance', index) as number;

			responseData = (await advanceSandboxTime.call(this, days)) as IDataObject;
			break;
		}

		case 'fundAccount': {
			const bankAccountId = this.getNodeParameter('fundAccountId', index) as string;
			const amount = this.getNodeParameter('fundAmount', index) as number;
			const description = this.getNodeParameter('fundDescription', index) as string;

			responseData = (await fundSandboxAccount.call(this, bankAccountId, amount, description)) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const operations = sandboxOperations;
export const fields = sandboxFields;
export const executeSandbox = execute;
