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
import { ACCOUNT_TYPE_OPTIONS } from '../../constants/accountTypes';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['bankAccount'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new bank account',
				action: 'Create bank account',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a bank account by ID',
				action: 'Get bank account',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List bank accounts',
				action: 'List bank accounts',
			},
			{
				name: 'Close',
				value: 'close',
				description: 'Close a bank account',
				action: 'Close bank account',
			},
			{
				name: 'Get Balance',
				value: 'getBalance',
				description: 'Get account balance',
				action: 'Get account balance',
			},
			{
				name: 'Get Account Number',
				value: 'getAccountNumber',
				description: 'Get full account number',
				action: 'Get account number',
			},
			{
				name: 'Get Routing Number',
				value: 'getRoutingNumber',
				description: 'Get routing number',
				action: 'Get routing number',
			},
			{
				name: 'Get Statement',
				value: 'getStatement',
				description: 'Get account statement',
				action: 'Get statement',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update bank account',
				action: 'Update bank account',
			},
			{
				name: 'Get Limits',
				value: 'getLimits',
				description: 'Get account limits',
				action: 'Get account limits',
			},
		],
		default: 'create',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'string',
		required: true,
		default: '',
		description: 'The entity that owns this account',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Account Type',
		name: 'accountType',
		type: 'options',
		required: true,
		default: 'checking',
		options: ACCOUNT_TYPE_OPTIONS,
		displayOptions: {
			show: {
				resource: ['bankAccount'],
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
				resource: ['bankAccount'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['get', 'close', 'getBalance', 'getAccountNumber', 'getRoutingNumber', 'getStatement', 'update', 'getLimits'],
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
				resource: ['bankAccount'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Account Type',
				name: 'accountType',
				type: 'options',
				default: '',
				options: ACCOUNT_TYPE_OPTIONS,
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
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Nickname',
				name: 'nickname',
				type: 'string',
				default: '',
			},
		],
	},
	{
		displayName: 'Statement Options',
		name: 'statementOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['bankAccount'],
				operation: ['getStatement'],
			},
		},
		options: [
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
		case 'create': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			const accountType = this.getNodeParameter('accountType', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				entity_id: entityId,
				type: accountType,
			};

			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.nickname) body.nickname = additionalFields.nickname;

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.BANK_ACCOUNTS,
				body,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}`,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (filters.entityId) query.entity_id = filters.entityId as string;
			if (filters.accountType) query.type = filters.accountType as string;

			const limit = (filters.limit as number) || 25;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: API_PATHS.BANK_ACCOUNTS,
				query,
			}, limit) as IDataObject[];
			break;
		}

		case 'close': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/close`,
			}) as IDataObject;
			break;
		}

		case 'getBalance': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/balance`,
			}) as IDataObject;
			break;
		}

		case 'getAccountNumber': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/account-number`,
			}) as IDataObject;
			break;
		}

		case 'getRoutingNumber': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/routing-number`,
			}) as IDataObject;
			break;
		}

		case 'getStatement': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const options = this.getNodeParameter('statementOptions', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (options.startDate) query.start_date = options.startDate as string;
			if (options.endDate) query.end_date = options.endDate as string;

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/statements`,
				query,
			}) as IDataObject;
			break;
		}

		case 'update': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

			const body: IDataObject = {};
			if (updateFields.description) body.description = updateFields.description;
			if (updateFields.nickname) body.nickname = updateFields.nickname;

			responseData = await columnApiRequest.call(this, {
				method: 'PATCH',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}`,
				body,
			}) as IDataObject;
			break;
		}

		case 'getLimits': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.BANK_ACCOUNTS}/${bankAccountId}/limits`,
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

export const bankAccountOperations = operations;
export const bankAccountFields = fields;
export const executeBankAccount = execute;
