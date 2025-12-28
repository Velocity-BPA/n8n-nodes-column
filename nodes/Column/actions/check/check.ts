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
import { amountToCents } from '../../utils/validationUtils';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['check'],
			},
		},
		options: [
			{
				name: 'Issue',
				value: 'issue',
				description: 'Issue a new check',
				action: 'Issue check',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a check by ID',
				action: 'Get check',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List checks',
				action: 'List checks',
			},
			{
				name: 'Void',
				value: 'void',
				description: 'Void a check',
				action: 'Void check',
			},
			{
				name: 'Stop Payment',
				value: 'stopPayment',
				description: 'Stop payment on a check',
				action: 'Stop payment',
			},
			{
				name: 'Get Image',
				value: 'getImage',
				description: 'Get check image',
				action: 'Get check image',
			},
			{
				name: 'Deposit',
				value: 'deposit',
				description: 'Submit a check deposit',
				action: 'Deposit check',
			},
			{
				name: 'Get Deposit',
				value: 'getDeposit',
				description: 'Get check deposit details',
				action: 'Get check deposit',
			},
			{
				name: 'Get Deposit Status',
				value: 'getDepositStatus',
				description: 'Get check deposit status',
				action: 'Get deposit status',
			},
		],
		default: 'issue',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The Column bank account ID',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['issue', 'deposit'],
			},
		},
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Check amount in dollars',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['issue'],
			},
		},
	},
	{
		displayName: 'Payee Name',
		name: 'payeeName',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the payee',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['issue'],
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
				resource: ['check'],
				operation: ['issue'],
			},
		},
		options: [
			{
				displayName: 'Memo',
				name: 'memo',
				type: 'string',
				default: '',
				description: 'Memo line on the check',
			},
			{
				displayName: 'Payee Address Line 1',
				name: 'payeeAddressLine1',
				type: 'string',
				default: '',
				description: 'Payee address line 1',
			},
			{
				displayName: 'Payee Address Line 2',
				name: 'payeeAddressLine2',
				type: 'string',
				default: '',
				description: 'Payee address line 2',
			},
			{
				displayName: 'Payee City',
				name: 'payeeCity',
				type: 'string',
				default: '',
				description: 'Payee city',
			},
			{
				displayName: 'Payee State',
				name: 'payeeState',
				type: 'string',
				default: '',
				description: 'Payee state (2-letter code)',
			},
			{
				displayName: 'Payee Postal Code',
				name: 'payeePostalCode',
				type: 'string',
				default: '',
				description: 'Payee postal code',
			},
			{
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicates',
			},
		],
	},
	{
		displayName: 'Check ID',
		name: 'checkId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the check',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['get', 'void', 'stopPayment', 'getImage'],
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
				resource: ['check'],
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
					{ name: 'Mailed', value: 'mailed' },
					{ name: 'Cashed', value: 'cashed' },
					{ name: 'Voided', value: 'voided' },
					{ name: 'Stopped', value: 'stopped' },
				],
				description: 'Filter by status',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of results',
			},
		],
	},
	{
		displayName: 'Check Deposit ID',
		name: 'checkDepositId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the check deposit',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['getDeposit', 'getDepositStatus'],
			},
		},
	},
	{
		displayName: 'Front Image',
		name: 'frontImage',
		type: 'string',
		required: true,
		default: '',
		description: 'Base64 encoded front image of check',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['deposit'],
			},
		},
	},
	{
		displayName: 'Back Image',
		name: 'backImage',
		type: 'string',
		required: true,
		default: '',
		description: 'Base64 encoded back image of check',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['deposit'],
			},
		},
	},
	{
		displayName: 'Stop Payment Reason',
		name: 'stopPaymentReason',
		type: 'string',
		required: true,
		default: '',
		description: 'Reason for stopping payment',
		displayOptions: {
			show: {
				resource: ['check'],
				operation: ['stopPayment'],
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
		case 'issue': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const payeeName = this.getNodeParameter('payeeName', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				bank_account_id: bankAccountId,
				amount: amountToCents(amount),
				payee_name: payeeName,
			};

			if (additionalFields.memo) {
				body.memo = additionalFields.memo;
			}
			if (additionalFields.payeeAddressLine1) {
				body.payee_address = {
					line1: additionalFields.payeeAddressLine1,
					line2: additionalFields.payeeAddressLine2 || '',
					city: additionalFields.payeeCity || '',
					state: additionalFields.payeeState || '',
					postal_code: additionalFields.payeePostalCode || '',
				};
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.CHECKS,
				body,
				idempotencyKey: additionalFields.idempotencyKey as string | undefined,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const checkId = this.getNodeParameter('checkId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.CHECKS}/${checkId}`,
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
			if (filters.limit) {
				query.limit = filters.limit as number;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.CHECKS,
				query,
			}) as IDataObject;
			break;
		}

		case 'void': {
			const checkId = this.getNodeParameter('checkId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.CHECKS}/${checkId}/void`,
			}) as IDataObject;
			break;
		}

		case 'stopPayment': {
			const checkId = this.getNodeParameter('checkId', index) as string;
			const reason = this.getNodeParameter('stopPaymentReason', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.CHECKS}/${checkId}/stop`,
				body: { reason },
			}) as IDataObject;
			break;
		}

		case 'getImage': {
			const checkId = this.getNodeParameter('checkId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.CHECKS}/${checkId}/image`,
			}) as IDataObject;
			break;
		}

		case 'deposit': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const frontImage = this.getNodeParameter('frontImage', index) as string;
			const backImage = this.getNodeParameter('backImage', index) as string;

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.CHECK_DEPOSITS,
				body: {
					bank_account_id: bankAccountId,
					front_image: frontImage,
					back_image: backImage,
				},
			}) as IDataObject;
			break;
		}

		case 'getDeposit': {
			const checkDepositId = this.getNodeParameter('checkDepositId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.CHECK_DEPOSITS}/${checkDepositId}`,
			}) as IDataObject;
			break;
		}

		case 'getDepositStatus': {
			const checkDepositId = this.getNodeParameter('checkDepositId', index) as string;
			const deposit = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.CHECK_DEPOSITS}/${checkDepositId}`,
			}) as IDataObject;

			responseData = {
				id: deposit.id,
				status: deposit.status,
				amount: deposit.amount,
				created_at: deposit.created_at,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const checkOperations = operations;
export const checkFields = fields;
export const executeCheck = execute;
