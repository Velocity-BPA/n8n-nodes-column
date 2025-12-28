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
				resource: ['wireTransfer'],
			},
		},
		options: [
			{
				name: 'Create Domestic',
				value: 'createDomestic',
				description: 'Create a domestic wire transfer',
				action: 'Create domestic wire',
			},
			{
				name: 'Create International',
				value: 'createInternational',
				description: 'Create an international wire transfer',
				action: 'Create international wire',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a wire transfer by ID',
				action: 'Get wire transfer',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List wire transfers',
				action: 'List wire transfers',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a pending wire transfer',
				action: 'Cancel wire transfer',
			},
			{
				name: 'Get Status',
				value: 'getStatus',
				description: 'Get wire transfer status',
				action: 'Get wire status',
			},
			{
				name: 'Get Fees',
				value: 'getFees',
				description: 'Get wire transfer fees',
				action: 'Get wire fees',
			},
			{
				name: 'Get Cutoff Time',
				value: 'getCutoffTime',
				description: 'Get wire cutoff time',
				action: 'Get wire cutoff time',
			},
		],
		default: 'createDomestic',
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
				resource: ['wireTransfer'],
				operation: ['createDomestic', 'createInternational'],
			},
		},
	},
	{
		displayName: 'Counterparty ID',
		name: 'counterpartyId',
		type: 'string',
		required: true,
		default: '',
		description: 'The counterparty receiving the funds',
		displayOptions: {
			show: {
				resource: ['wireTransfer'],
				operation: ['createDomestic', 'createInternational'],
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
				resource: ['wireTransfer'],
				operation: ['createDomestic', 'createInternational'],
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
				resource: ['wireTransfer'],
				operation: ['createDomestic', 'createInternational'],
			},
		},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
				description: 'Description for the wire transfer',
			},
			{
				displayName: 'Originator to Beneficiary Info',
				name: 'originatorToBeneficiaryInfo',
				type: 'string',
				default: '',
				description: 'Additional info from originator to beneficiary',
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
		displayName: 'Currency',
		name: 'currency',
		type: 'string',
		required: true,
		default: 'USD',
		description: 'Currency code for international wire',
		displayOptions: {
			show: {
				resource: ['wireTransfer'],
				operation: ['createInternational'],
			},
		},
	},
	{
		displayName: 'Wire Transfer ID',
		name: 'wireTransferId',
		type: 'string',
		required: true,
		default: '',
		description: 'The ID of the wire transfer',
		displayOptions: {
			show: {
				resource: ['wireTransfer'],
				operation: ['get', 'cancel', 'getStatus'],
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
				resource: ['wireTransfer'],
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
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
				description: 'Maximum number of results',
			},
		],
	},
	{
		displayName: 'Wire Type',
		name: 'wireType',
		type: 'options',
		required: true,
		default: 'domestic',
		options: [
			{ name: 'Domestic', value: 'domestic' },
			{ name: 'International', value: 'international' },
		],
		description: 'Type of wire to get fees for',
		displayOptions: {
			show: {
				resource: ['wireTransfer'],
				operation: ['getFees'],
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
		case 'createDomestic': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				bank_account_id: bankAccountId,
				counterparty_id: counterpartyId,
				amount: amountToCents(amount),
				type: 'domestic',
			};

			if (additionalFields.description) {
				body.description = additionalFields.description;
			}
			if (additionalFields.originatorToBeneficiaryInfo) {
				body.originator_to_beneficiary_info = additionalFields.originatorToBeneficiaryInfo;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.WIRE_TRANSFERS,
				body,
				idempotencyKey: additionalFields.idempotencyKey as string | undefined,
			}) as IDataObject;
			break;
		}

		case 'createInternational': {
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const counterpartyId = this.getNodeParameter('counterpartyId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			const currency = this.getNodeParameter('currency', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				bank_account_id: bankAccountId,
				counterparty_id: counterpartyId,
				amount: amountToCents(amount),
				currency,
				type: 'international',
			};

			if (additionalFields.description) {
				body.description = additionalFields.description;
			}
			if (additionalFields.originatorToBeneficiaryInfo) {
				body.originator_to_beneficiary_info = additionalFields.originatorToBeneficiaryInfo;
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.WIRE_TRANSFERS,
				body,
				idempotencyKey: additionalFields.idempotencyKey as string | undefined,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const wireTransferId = this.getNodeParameter('wireTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.WIRE_TRANSFERS}/${wireTransferId}`,
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
				endpoint: API_PATHS.WIRE_TRANSFERS,
				query,
			}) as IDataObject;
			break;
		}

		case 'cancel': {
			const wireTransferId = this.getNodeParameter('wireTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.WIRE_TRANSFERS}/${wireTransferId}/cancel`,
			}) as IDataObject;
			break;
		}

		case 'getStatus': {
			const wireTransferId = this.getNodeParameter('wireTransferId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.WIRE_TRANSFERS}/${wireTransferId}/status`,
			}) as IDataObject;
			break;
		}

		case 'getFees': {
			const wireType = this.getNodeParameter('wireType', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.WIRE_TRANSFERS}/fees`,
				query: { type: wireType },
			}) as IDataObject;
			break;
		}

		case 'getCutoffTime': {
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: `${API_PATHS.WIRE_TRANSFERS}/cutoff`,
			}) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const wireTransferOperations = operations;
export const wireTransferFields = fields;
export const executeWireTransfer = execute;
