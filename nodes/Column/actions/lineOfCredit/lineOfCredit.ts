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
import { amountToCents } from '../../utils/validationUtils';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: { resource: ['lineOfCredit'] } },
		options: [
			{ name: 'Create', value: 'create', description: 'Create a line of credit', action: 'Create line of credit' },
			{ name: 'Get', value: 'get', description: 'Get line of credit', action: 'Get line of credit' },
			{ name: 'Update Credit Limit', value: 'updateCreditLimit', description: 'Update credit limit', action: 'Update credit limit' },
			{ name: 'Draw', value: 'draw', description: 'Draw from line', action: 'Draw from line' },
			{ name: 'Make Payment', value: 'makePayment', description: 'Make payment', action: 'Make payment' },
			{ name: 'Get Available Credit', value: 'getAvailableCredit', description: 'Get available credit', action: 'Get available credit' },
			{ name: 'Get Transactions', value: 'getTransactions', description: 'Get transactions', action: 'Get transactions' },
			{ name: 'Close', value: 'close', description: 'Close line of credit', action: 'Close line of credit' },
		],
		default: 'create',
	},
];

export const fields: INodeProperties[] = [
	{
		displayName: 'Entity ID', name: 'entityId', type: 'string', required: true, default: '',
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['create'] } },
	},
	{
		displayName: 'Bank Account ID', name: 'bankAccountId', type: 'string', required: true, default: '',
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['create'] } },
	},
	{
		displayName: 'Credit Limit', name: 'creditLimit', type: 'number', required: true, default: 0,
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['create', 'updateCreditLimit'] } },
	},
	{
		displayName: 'Interest Rate', name: 'interestRate', type: 'number', required: true, default: 0,
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['create'] } },
	},
	{
		displayName: 'Line of Credit ID', name: 'lineOfCreditId', type: 'string', required: true, default: '',
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['get', 'updateCreditLimit', 'draw', 'makePayment', 'getAvailableCredit', 'getTransactions', 'close'] } },
	},
	{
		displayName: 'Amount', name: 'amount', type: 'number', required: true, default: 0,
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['draw', 'makePayment'] } },
	},
	{
		displayName: 'Additional Fields', name: 'additionalFields', type: 'collection', placeholder: 'Add Field', default: {},
		displayOptions: { show: { resource: ['lineOfCredit'], operation: ['create'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Min Payment Percentage', name: 'minPaymentPercentage', type: 'number', default: 2 },
		],
	},
];

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'create': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const creditLimit = this.getNodeParameter('creditLimit', index) as number;
			const interestRate = this.getNodeParameter('interestRate', index) as number;
			const additionalFields = this.getNodeParameter('additionalFields', index) as IDataObject;

			const body: IDataObject = {
				entity_id: entityId,
				bank_account_id: bankAccountId,
				credit_limit: amountToCents(creditLimit),
				interest_rate: interestRate,
			};
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.minPaymentPercentage) body.min_payment_percentage = additionalFields.minPaymentPercentage;

			responseData = await columnApiRequest.call(this, { method: 'POST', endpoint: API_PATHS.LINES_OF_CREDIT, body }) as IDataObject;
			break;
		}

		case 'get': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}` }) as IDataObject;
			break;
		}

		case 'updateCreditLimit': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			const creditLimit = this.getNodeParameter('creditLimit', index) as number;
			responseData = await columnApiRequest.call(this, {
				method: 'PATCH',
				endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}`,
				body: { credit_limit: amountToCents(creditLimit) },
			}) as IDataObject;
			break;
		}

		case 'draw': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}/draw`,
				body: { amount: amountToCents(amount) },
			}) as IDataObject;
			break;
		}

		case 'makePayment': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			const amount = this.getNodeParameter('amount', index) as number;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}/payments`,
				body: { amount: amountToCents(amount) },
			}) as IDataObject;
			break;
		}

		case 'getAvailableCredit': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}/available` }) as IDataObject;
			break;
		}

		case 'getTransactions': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			responseData = await columnApiRequestAllItems.call(this, { method: 'GET', endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}/transactions` }, 100) as IDataObject[];
			break;
		}

		case 'close': {
			const id = this.getNodeParameter('lineOfCreditId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'POST', endpoint: `${API_PATHS.LINES_OF_CREDIT}/${id}/close` }) as IDataObject;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	if (Array.isArray(responseData)) return responseData.map(item => ({ json: item }));
	return [{ json: responseData }];
}

export const lineOfCreditOperations = operations;
export const lineOfCreditFields = fields;
export const executeLineOfCredit = execute;
