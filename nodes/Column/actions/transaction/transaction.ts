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
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { TRANSACTION_TYPE_OPTIONS, TRANSACTION_STATUS_OPTIONS } from '../../constants/accountTypes';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['transaction'],
			},
		},
		options: [
			{
				name: 'Get',
				value: 'get',
				description: 'Get a transaction by ID',
				action: 'Get transaction',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List transactions',
				action: 'List transactions',
			},
			{
				name: 'Get Pending',
				value: 'getPending',
				description: 'Get pending transactions',
				action: 'Get pending transactions',
			},
			{
				name: 'Get Posted',
				value: 'getPosted',
				description: 'Get posted transactions',
				action: 'Get posted transactions',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search transactions',
				action: 'Search transactions',
			},
			{
				name: 'Get By Reference',
				value: 'getByReference',
				description: 'Get transaction by reference ID',
				action: 'Get by reference',
			},
			{
				name: 'Export',
				value: 'export',
				description: 'Export transactions',
				action: 'Export transactions',
			},
		],
		default: 'list',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Transaction ID',
		name: 'transactionId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['get'],
			},
		},
	},
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['list', 'getPending', 'getPosted', 'search', 'export'],
			},
		},
	},
	{
		displayName: 'Reference ID',
		name: 'referenceId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['getByReference'],
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
				resource: ['transaction'],
				operation: ['list', 'search'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: '',
				options: TRANSACTION_TYPE_OPTIONS,
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: TRANSACTION_STATUS_OPTIONS,
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'Min Amount',
				name: 'minAmount',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Max Amount',
				name: 'maxAmount',
				type: 'number',
				default: 0,
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
			},
		],
	},
	{
		displayName: 'Export Options',
		name: 'exportOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['transaction'],
				operation: ['export'],
			},
		},
		options: [
			{
				displayName: 'Format',
				name: 'format',
				type: 'options',
				default: 'csv',
				options: [
					{ name: 'CSV', value: 'csv' },
					{ name: 'JSON', value: 'json' },
				],
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
			{
				displayName: 'End Date',
				name: 'endDate',
				type: 'string',
				default: '',
				placeholder: 'YYYY-MM-DD',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'get': {
			const transactionId = this.getNodeParameter('transactionId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.TRANSACTIONS}/${transactionId}`,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {
				bank_account_id: bankAccountId,
			};

			if (filters.type) query.type = filters.type as string;
			if (filters.status) query.status = filters.status as string;
			if (filters.startDate) query.start_date = filters.startDate as string;
			if (filters.endDate) query.end_date = filters.endDate as string;
			if (filters.minAmount) query.min_amount = filters.minAmount as number;
			if (filters.maxAmount) query.max_amount = filters.maxAmount as number;

			const limit = (filters.limit as number) || 25;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: API_PATHS.TRANSACTIONS,
				query,
			}, limit) as IDataObject[];
			break;
		}

		case 'getPending': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: API_PATHS.TRANSACTIONS,
				query: {
					bank_account_id: bankAccountId,
					status: 'pending',
				},
			}, 100) as IDataObject[];
			break;
		}

		case 'getPosted': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: API_PATHS.TRANSACTIONS,
				query: {
					bank_account_id: bankAccountId,
					status: 'posted',
				},
			}, 100) as IDataObject[];
			break;
		}

		case 'search': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {
				bank_account_id: bankAccountId,
			};

			if (filters.type) query.type = filters.type as string;
			if (filters.status) query.status = filters.status as string;
			if (filters.startDate) query.start_date = filters.startDate as string;
			if (filters.endDate) query.end_date = filters.endDate as string;
			if (filters.minAmount) query.min_amount = filters.minAmount as number;
			if (filters.maxAmount) query.max_amount = filters.maxAmount as number;

			const limit = (filters.limit as number) || 25;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.TRANSACTIONS}/search`,
				query,
			}, limit) as IDataObject[];
			break;
		}

		case 'getByReference': {
			const referenceId = this.getNodeParameter('referenceId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.TRANSACTIONS}/reference/${referenceId}`,
			}) as IDataObject;
			break;
		}

		case 'export': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const options = this.getNodeParameter('exportOptions', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {
				bank_account_id: bankAccountId,
				format: (options.format as string) || 'csv',
			};

			if (options.startDate) query.start_date = options.startDate as string;
			if (options.endDate) query.end_date = options.endDate as string;

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.TRANSACTIONS}/export`,
				query,
			}) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	if (Array.isArray(responseData)) {
		return responseData.map(item => ({ json: item }));
	}
	return [{ json: responseData }];
}

export const transactionOperations = operations;
export const transactionFields = fields;
export const executeTransaction = execute;
