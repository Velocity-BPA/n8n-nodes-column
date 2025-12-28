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
				resource: ['bookTransfer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a book transfer between Column accounts',
				action: 'Create book transfer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a book transfer by ID',
				action: 'Get book transfer',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List book transfers',
				action: 'List book transfers',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get book transfer status',
				action: 'Get book transfer status',
			},
		],
		default: 'create',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'From Account ID',
		name: 'fromAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The source Column bank account ID',
		displayOptions: {
			show: {
				resource: ['bookTransfer'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'To Account ID',
		name: 'toAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'The destination Column bank account ID',
		displayOptions: {
			show: {
				resource: ['bookTransfer'],
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
		description: 'Transfer amount in dollars',
		displayOptions: {
			show: {
				resource: ['bookTransfer'],
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
				resource: ['bookTransfer'],
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
				displayName: 'Idempotency Key',
				name: 'idempotencyKey',
				type: 'string',
				default: '',
				description: 'Unique key to prevent duplicate transfers',
			},
		],
	},
	{
		displayName: 'Book Transfer ID',
		name: 'bookTransferId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the book transfer',
		displayOptions: {
			show: {
				resource: ['bookTransfer'],
				operation: ['get', 'getStatus'],
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
				resource: ['bookTransfer'],
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
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of results',
			},
		],
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
			const fromAccountId = this.getNodeParameter('fromAccountId', index) as string;
			const toAccountId = this.getNodeParameter('toAccountId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				sender_bank_account_id: fromAccountId,
				receiver_bank_account_id: toAccountId,
				amount: amountToCents(amount),
			};

			if (additionalFields.description) {
				body.description = additionalFields.description;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.BOOK_TRANSFERS,
				body,
				idempotencyKey: additionalFields.idempotencyKey as string | undefined,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const bookTransferId = this.getNodeParameter('bookTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BOOK_TRANSFERS}/${bookTransferId}`,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (filters.bankAccountId) {
				query.bank_account_id = filters.bankAccountId as string;
			}
			if (filters.limit) {
				query.limit = filters.limit as number;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.BOOK_TRANSFERS,
				query,
			}) as IDataObject;
			break;
		}

		case 'getStatus': {
			const bookTransferId = this.getNodeParameter('bookTransferId', index) as string;
			const transfer = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BOOK_TRANSFERS}/${bookTransferId}`,
			}) as IDataObject;

			responseData = {
				id: transfer.id,
				status: transfer.status,
				created_at: transfer.created_at,
				completed_at: transfer.completed_at,
			};
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const bookTransferOperations = operations;
export const bookTransferFields = fields;
export const executeBookTransfer = execute;
