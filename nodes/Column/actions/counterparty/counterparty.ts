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

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['counterparty'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new counterparty',
				action: 'Create counterparty',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a counterparty by ID',
				action: 'Get counterparty',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a counterparty',
				action: 'Update counterparty',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a counterparty',
				action: 'Delete counterparty',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List counterparties',
				action: 'List counterparties',
			},
			{
				name: 'Verify',
				value: 'verify',
				description: 'Verify counterparty bank details',
				action: 'Verify counterparty',
			},
			{
				name: 'Get ACH Details',
				value: 'getAchDetails',
				description: 'Get ACH routing details',
				action: 'Get ACH details',
			},
		],
		default: 'create',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the counterparty',
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		default: '',
		description: '9-digit ABA routing number',
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Account Number',
		name: 'accountNumber',
		type: 'string',
		required: true,
		default: '',
		description: 'Bank account number',
		displayOptions: {
			show: {
				resource: ['counterparty'],
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
		options: [
			{ name: 'Checking', value: 'checking' },
			{ name: 'Savings', value: 'savings' },
		],
		description: 'Type of bank account',
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'string',
		required: true,
		default: '',
		description: 'The entity this counterparty belongs to',
		displayOptions: {
			show: {
				resource: ['counterparty'],
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
				resource: ['counterparty'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description of the counterparty',
			},
			{
				displayName: 'Wire Routing Number',
				name: 'wireRoutingNumber',
				type: 'string',
				default: '',
				description: 'Wire routing number if different from ACH',
			},
		],
	},
	{
		displayName: 'Counterparty ID',
		name: 'counterpartyId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the counterparty',
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['get', 'update', 'delete', 'verify', 'getAchDetails'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Updated name',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Updated description',
			},
		],
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['counterparty'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Entity ID',
				name: 'entityId',
				type: 'string',
				default: '',
				description: 'Filter by entity',
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
			const name = this.getNodeParameter('name', index) as string;
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			const accountNumber = this.getNodeParameter('accountNumber', index) as string;
			const accountType = this.getNodeParameter('accountType', index) as string;
			const entityId = this.getNodeParameter('entityId', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				name,
				routing_number: routingNumber,
				account_number: accountNumber,
				account_type: accountType,
				entity_id: entityId,
			};

			if (additionalFields.description) {
				body.description = additionalFields.description;
			}
			if (additionalFields.wireRoutingNumber) {
				body.wire_routing_number = additionalFields.wireRoutingNumber;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.COUNTERPARTIES,
				body,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.COUNTERPARTIES}/${counterpartyId}`,
			}) as IDataObject;
			break;
		}

		case 'update': {
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

			const body: IDataObject = {};
			if (updateFields.name) {
				body.name = updateFields.name;
			}
			if (updateFields.description) {
				body.description = updateFields.description;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'PATCH',
				endpoint: `${API_PATHS.COUNTERPARTIES}/${counterpartyId}`,
				body,
			}) as IDataObject;
			break;
		}

		case 'delete': {
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'DELETE',
				endpoint: `${API_PATHS.COUNTERPARTIES}/${counterpartyId}`,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (filters.entityId) {
				query.entity_id = filters.entityId as string;
			}
			if (filters.limit) {
				query.limit = filters.limit as number;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.COUNTERPARTIES,
				query,
			}) as IDataObject;
			break;
		}

		case 'verify': {
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.COUNTERPARTIES}/${counterpartyId}/verify`,
			}) as IDataObject;
			break;
		}

		case 'getAchDetails': {
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.COUNTERPARTIES}/${counterpartyId}/ach`,
			}) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const counterpartyOperations = operations;
export const counterpartyFields = fields;
export const executeCounterparty = execute;
