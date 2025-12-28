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
import { API_PATHS } from '../../constants/endpoints';
import { ACH_SEC_CODE_OPTIONS } from '../../constants/achCodes';
import { amountToCents } from '../../utils/validationUtils';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['achTransfer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new ACH transfer',
				action: 'Create ACH transfer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an ACH transfer by ID',
				action: 'Get ACH transfer',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List ACH transfers',
				action: 'List ACH transfers',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a pending ACH transfer',
				action: 'Cancel ACH transfer',
			},
			{
				name: 'Get Return',
				value: 'getReturn',
				description: 'Get ACH return information',
				action: 'Get ACH return',
			},
			{
				name: 'Handle Return',
				value: 'handleReturn',
				description: 'Accept or contest an ACH return',
				action: 'Handle ACH return',
			},
			{
				name: 'Get NOC',
				value: 'getNoc',
				description: 'Get Notification of Change details',
				action: 'Get NOC',
			},
			{
				name: 'Get Limits',
				value: 'getLimits',
				description: 'Get ACH limits for an account',
				action: 'Get ACH limits',
			},
			{
				name: 'Get Window',
				value: 'getWindow',
				description: 'Get current ACH processing window',
				action: 'Get ACH window',
			},
		],
		default: 'create',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The Column bank account ID to initiate transfer from',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Counterparty ID',
		name: 'counterpartyId',
		type: 'string',
		required: true,
		default: '',
		description: 'The counterparty receiving or sending the funds',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Transfer amount in dollars (will be converted to cents)',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Direction',
		name: 'direction',
		type: 'options',
		required: true,
		default: 'credit',
		options: [
			{ name: 'Credit (Send Money)', value: 'credit' },
			{ name: 'Debit (Pull Money)', value: 'debit' },
		],
		description: 'Whether to send (credit) or pull (debit) funds',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'SEC Code',
		name: 'secCode',
		type: 'options',
		required: true,
		default: 'ppd',
		options: ACH_SEC_CODE_OPTIONS,
		description: 'Standard Entry Class code for the transfer',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description for the transfer',
			},
			{
				displayName: 'Company Name',
				name: 'companyName',
				type: 'string',
				default: '',
				description: 'Company name for the ACH batch header',
			},
			{
				displayName: 'Company Entry Description',
				name: 'companyEntryDescription',
				type: 'string',
				default: '',
				description: 'Entry description for the ACH batch',
			},
			{
				displayName: 'Individual ID',
				name: 'individualId',
				type: 'string',
				default: '',
				description: 'Individual identification number',
			},
			{
				displayName: 'Same Day',
				name: 'sameDay',
				type: 'boolean',
				default: false,
				description: 'Whether to process as same-day ACH',
			},
			{
				displayName: 'Effective Date',
				name: 'effectiveDate',
				type: 'string',
				default: '',
				description: 'Requested settlement date (YYYY-MM-DD)',
			},
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicate transfers',
			},
		],
	},
	{
		displayName: 'ACH Transfer ID',
		name: 'achTransferId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the ACH transfer',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['get', 'cancel', 'getReturn', 'getNoc'],
			},
		},
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Bank Account ID',
				name: 'bankAccountId',
				type: 'string',
				default: '',
				description: 'Filter by bank account',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{ name: 'Pending', value: 'pending' },
					{ name: 'Submitted', value: 'submitted' },
					{ name: 'Completed', value: 'completed' },
					{ name: 'Returned', value: 'returned' },
					{ name: 'Canceled', value: 'canceled' },
				],
				description: 'Filter by status',
			},
			{
				displayName: 'Direction',
				name: 'direction',
				type: 'options',
				default: '',
				options: [
					{ name: 'Credit', value: 'credit' },
					{ name: 'Debit', value: 'debit' },
				],
				description: 'Filter by direction',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of results',
			},
			{
				displayName: 'Starting After',
				name: 'startingAfter',
				type: 'string',
				default: '',
				description: 'Cursor for pagination',
			},
		],
	},
	{
		displayName: 'ACH Return ID',
		name: 'achReturnId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the ACH return',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['handleReturn'],
			},
		},
	},
	{
		displayName: 'Return Action',
		name: 'returnAction',
		type: 'options',
		required: true,
		default: 'accept',
		options: [
			{ name: 'Accept', value: 'accept' },
			{ name: 'Contest', value: 'contest' },
		],
		description: 'Action to take on the return',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['handleReturn'],
			},
		},
	},
	{
		displayName: 'Bank Account ID',
		name: 'limitsAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The bank account to get ACH limits for',
		displayOptions: {
			show: {
				resource: ['achTransfer'],
				operation: ['getLimits'],
			},
		},
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	switch (operation) {
		case 'create': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const direction = this.getNodeParameter('direction', index) as string;
			const secCode = this.getNodeParameter('secCode', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				bank_account_id: bankAccountId,
				counterparty_id: counterpartyId,
				amount: amountToCents(amount),
				type: direction,
				sec_code: secCode,
			};

			if (additionalFields.description) {
				body.description = additionalFields.description;
			}
			if (additionalFields.companyName) {
				body.company_name = additionalFields.companyName;
			}
			if (additionalFields.companyEntryDescription) {
				body.company_entry_description = additionalFields.companyEntryDescription;
			}
			if (additionalFields.individualId) {
				body.individual_id = additionalFields.individualId;
			}
			if (additionalFields.sameDay) {
				body.same_day = additionalFields.sameDay;
			}
			if (additionalFields.effectiveDate) {
				body.effective_date = additionalFields.effectiveDate;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.ACH_TRANSFERS,
				body,
				idempotencyKey: additionalFields.idempotencyKey as string | undefined,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const achTransferId = this.getNodeParameter('achTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.ACH_TRANSFERS}/${achTransferId}`,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (filters.bankAccountId) {
				query.bank_account_id = filters.bankAccountId as string;
			}
			if (filters.status) {
				query.status = filters.status as string;
			}
			if (filters.direction) {
				query.type = filters.direction as string;
			}
			if (filters.limit) {
				query.limit = filters.limit as number;
			}
			if (filters.startingAfter) {
				query.starting_after = filters.startingAfter as string;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ACH_TRANSFERS,
				query,
			}) as IDataObject;
			break;
		}

		case 'cancel': {
			const achTransferId = this.getNodeParameter('achTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.ACH_TRANSFERS}/${achTransferId}/cancel`,
			}) as IDataObject;
			break;
		}

		case 'getReturn': {
			const achTransferId = this.getNodeParameter('achTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.ACH_TRANSFERS}/${achTransferId}/return`,
			}) as IDataObject;
			break;
		}

		case 'handleReturn': {
			const achReturnId = this.getNodeParameter('achReturnId', index) as string;
			const returnAction = this.getNodeParameter('returnAction', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.ACH_RETURNS}/${achReturnId}/${returnAction}`,
			}) as IDataObject;
			break;
		}

		case 'getNoc': {
			const achTransferId = this.getNodeParameter('achTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.ACH_TRANSFERS}/${achTransferId}/noc`,
			}) as IDataObject;
			break;
		}

		case 'getLimits': {
			const bankAccountId = this.getNodeParameter('limitsAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/ach-limits`,
			}) as IDataObject;
			break;
		}

		case 'getWindow': {
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.ACH_TRANSFERS}/window`,
			}) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const achTransferOperations = operations;
export const achTransferFields = fields;
export const executeAchTransfer = execute;
