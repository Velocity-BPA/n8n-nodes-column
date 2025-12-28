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
		displayOptions: {
			show: {
				resource: ['loan'],
			},
		},
		options: [
			{ name: 'Create', value: 'create', description: 'Create a loan', action: 'Create loan' },
			{ name: 'Get', value: 'get', description: 'Get a loan by ID', action: 'Get loan' },
			{ name: 'List', value: 'list', description: 'List loans', action: 'List loans' },
			{ name: 'Update', value: 'update', description: 'Update a loan', action: 'Update loan' },
			{ name: 'Get Balance', value: 'getBalance', description: 'Get loan balance', action: 'Get loan balance' },
			{ name: 'Get Payment Schedule', value: 'getPaymentSchedule', description: 'Get payment schedule', action: 'Get payment schedule' },
			{ name: 'Make Payment', value: 'makePayment', description: 'Make a loan payment', action: 'Make payment' },
			{ name: 'Get Transactions', value: 'getTransactions', description: 'Get loan transactions', action: 'Get loan transactions' },
			{ name: 'Calculate Payoff', value: 'calculatePayoff', description: 'Calculate payoff amount', action: 'Calculate payoff' },
			{ name: 'Charge Off', value: 'chargeOff', description: 'Charge off a loan', action: 'Charge off loan' },
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
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
	},
	{
		displayName: 'Bank Account ID',
		name: 'bankAccountId',
		type: 'string',
		required: true,
		default: '',
		description: 'Account for disbursement and payments',
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
	},
	{
		displayName: 'Principal Amount',
		name: 'principalAmount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Loan principal in dollars',
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
	},
	{
		displayName: 'Interest Rate',
		name: 'interestRate',
		type: 'number',
		required: true,
		default: 0,
		description: 'Annual interest rate (e.g., 5.5 for 5.5%)',
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
	},
	{
		displayName: 'Term Months',
		name: 'termMonths',
		type: 'number',
		required: true,
		default: 12,
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
	},
	{
		displayName: 'Loan Additional Fields',
		name: 'loanAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['loan'], operation: ['create'] } },
		options: [
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
			{ displayName: 'Origination Fee', name: 'originationFee', type: 'number', default: 0 },
			{ displayName: 'Auto Pay', name: 'autoPay', type: 'boolean', default: false },
		],
	},
	{
		displayName: 'Loan ID',
		name: 'loanId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: { show: { resource: ['loan'], operation: ['get', 'update', 'getBalance', 'getPaymentSchedule', 'makePayment', 'getTransactions', 'calculatePayoff', 'chargeOff'] } },
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: { show: { resource: ['loan'], operation: ['list'] } },
		options: [
			{ displayName: 'Entity ID', name: 'entityId', type: 'string', default: '' },
			{ displayName: 'Status', name: 'status', type: 'options', default: '', options: [
				{ name: 'Active', value: 'active' },
				{ name: 'Paid Off', value: 'paid_off' },
				{ name: 'Delinquent', value: 'delinquent' },
				{ name: 'Charged Off', value: 'charged_off' },
			]},
			{ displayName: 'Limit', name: 'limit', type: 'number', default: 25 },
		],
	},
	{
		displayName: 'Payment Amount',
		name: 'paymentAmount',
		type: 'number',
		required: true,
		default: 0,
		description: 'Payment amount in dollars',
		displayOptions: { show: { resource: ['loan'], operation: ['makePayment'] } },
	},
	{
		displayName: 'Payment Options',
		name: 'paymentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: { show: { resource: ['loan'], operation: ['makePayment'] } },
		options: [
			{ displayName: 'Apply to Principal', name: 'applyToPrincipal', type: 'boolean', default: false },
			{ displayName: 'Source Account ID', name: 'sourceAccountId', type: 'string', default: '' },
		],
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { resource: ['loan'], operation: ['update'] } },
		options: [
			{ displayName: 'Auto Pay', name: 'autoPay', type: 'boolean', default: false },
			{ displayName: 'Description', name: 'description', type: 'string', default: '' },
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
			const bankAccountId = this.getNodeParameter('bankAccountId', index) as string;
			const principalAmount = this.getNodeParameter('principalAmount', index) as number;
			const interestRate = this.getNodeParameter('interestRate', index) as number;
			const termMonths = this.getNodeParameter('termMonths', index) as number;
			const additionalFields = this.getNodeParameter('loanAdditionalFields', index) as IDataObject;

			const body: IDataObject = {
				entity_id: entityId,
				bank_account_id: bankAccountId,
				principal_amount: amountToCents(principalAmount),
				interest_rate: interestRate,
				term_months: termMonths,
			};

			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.originationFee) body.origination_fee = amountToCents(additionalFields.originationFee as number);
			if (additionalFields.autoPay !== undefined) body.auto_pay = additionalFields.autoPay;

			responseData = await columnApiRequest.call(this, { method: 'POST', endpoint: API_PATHS.LOANS, body }) as IDataObject;
			break;
		}

		case 'get': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LOANS}/${loanId}` }) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};
			if (filters.entityId) query.entity_id = filters.entityId as string;
			if (filters.status) query.status = filters.status as string;
			const limit = (filters.limit as number) || 25;
			responseData = await columnApiRequestAllItems.call(this, { method: 'GET', endpoint: API_PATHS.LOANS, query }, limit) as IDataObject[];
			break;
		}

		case 'update': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;
			const body: IDataObject = {};
			if (updateFields.autoPay !== undefined) body.auto_pay = updateFields.autoPay;
			if (updateFields.description) body.description = updateFields.description;
			responseData = await columnApiRequest.call(this, { method: 'PATCH', endpoint: `${API_PATHS.LOANS}/${loanId}`, body }) as IDataObject;
			break;
		}

		case 'getBalance': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LOANS}/${loanId}/balance` }) as IDataObject;
			break;
		}

		case 'getPaymentSchedule': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LOANS}/${loanId}/schedule` }) as IDataObject;
			break;
		}

		case 'makePayment': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			const paymentAmount = this.getNodeParameter('paymentAmount', index) as number;
			const options = this.getNodeParameter('paymentOptions', index) as IDataObject;

			const body: IDataObject = { amount: amountToCents(paymentAmount) };
			if (options.applyToPrincipal) body.apply_to_principal = options.applyToPrincipal;
			if (options.sourceAccountId) body.source_account_id = options.sourceAccountId;

			responseData = await columnApiRequest.call(this, { method: 'POST', endpoint: `${API_PATHS.LOANS}/${loanId}/payments`, body }) as IDataObject;
			break;
		}

		case 'getTransactions': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequestAllItems.call(this, { method: 'GET', endpoint: API_PATHS.LOAN_TRANSACTIONS(loanId) }, 100) as IDataObject[];
			break;
		}

		case 'calculatePayoff': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'GET', endpoint: `${API_PATHS.LOANS}/${loanId}/payoff` }) as IDataObject;
			break;
		}

		case 'chargeOff': {
			const loanId = this.getNodeParameter('loanId', index) as string;
			responseData = await columnApiRequest.call(this, { method: 'POST', endpoint: `${API_PATHS.LOANS}/${loanId}/charge-off` }) as IDataObject;
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

export const loanOperations = operations;
export const loanFields = fields;
export const executeLoan = execute;
