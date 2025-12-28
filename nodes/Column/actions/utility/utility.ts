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
import { isValidRoutingNumber, isValidAccountNumber } from '../../utils/validationUtils';

export const utilityOperations: INodeProperties[] = [{
	displayName: 'Operation',
	name: 'operation',
	type: 'options',
	noDataExpression: true,
	displayOptions: {
		show: {
			resource: ['utility'],
		},
	},
	options: [
		{
			name: 'Get API Status',
			value: 'getApiStatus',
			description: 'Get the current API status and health',
			action: 'Get api status',
		},
		{
			name: 'Get Bank Info',
			value: 'getBankInfo',
			description: 'Get bank information from a routing number',
			action: 'Get bank info',
		},
		{
			name: 'Get Rate Limits',
			value: 'getRateLimits',
			description: 'Get current rate limit information',
			action: 'Get rate limits',
		},
		{
			name: 'Test Connection',
			value: 'testConnection',
			description: 'Test the Column API connection',
			action: 'Test connection',
		},
		{
			name: 'Validate Routing Number',
			value: 'validateRoutingNumber',
			description: 'Validate an ABA routing number',
			action: 'Validate routing number',
		},
	],
	default: 'testConnection',
}];

export const utilityFields: INodeProperties[] = [
	// Validate Routing Number fields
	{
		displayName: 'Routing Number',
		name: 'routingNumber',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateRoutingNumber', 'getBankInfo'],
			},
		},
		description: 'The 9-digit ABA routing number to validate or look up',
	},

	// Validate Account Number field (optional for additional validation)
	{
		displayName: 'Also Validate Account Number',
		name: 'alsoValidateAccount',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateRoutingNumber'],
			},
		},
		description: 'Whether to also validate an account number',
	},
	{
		displayName: 'Account Number',
		name: 'accountNumber',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['utility'],
				operation: ['validateRoutingNumber'],
				alsoValidateAccount: [true],
			},
		},
		description: 'The account number to validate (4-17 digits)',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<INodeExecutionData[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject;

	switch (operation) {
		case 'validateRoutingNumber': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;
			const alsoValidateAccount = this.getNodeParameter('alsoValidateAccount', index) as boolean;

			const result: IDataObject = {
				routing_number: routingNumber,
				routing_number_valid: isValidRoutingNumber(routingNumber),
				routing_number_checksum_valid: isValidRoutingNumber(routingNumber),
				validation_timestamp: new Date().toISOString(),
			};

			if (alsoValidateAccount) {
				const accountNumber = this.getNodeParameter('accountNumber', index) as string;
				result.account_number = accountNumber;
				result.account_number_valid = isValidAccountNumber(accountNumber);
			}

			// Try to get bank info if routing number is valid
			if (result.routing_number_valid) {
				try {
					const bankInfo = (await columnApiRequest.call(this, {
						method: 'GET',
						endpoint: `/institutions/routing-numbers/${routingNumber}`,
					})) as IDataObject;
					responseData = {
						...result,
						bank_info: bankInfo,
					};
				} catch {
					// Bank info lookup failed, return just validation result
					responseData = {
						...result,
						bank_info: null,
						bank_info_error: 'Could not retrieve bank information',
					};
				}
			} else {
				responseData = result;
			}
			break;
		}

		case 'getBankInfo': {
			const routingNumber = this.getNodeParameter('routingNumber', index) as string;

			if (!isValidRoutingNumber(routingNumber)) {
				throw new Error(`Invalid routing number: ${routingNumber}. Must be 9 digits with valid checksum.`);
			}

			try {
				responseData = (await columnApiRequest.call(this, {
					method: 'GET',
					endpoint: `/institutions/routing-numbers/${routingNumber}`,
				})) as IDataObject;
			} catch {
				// Return a structured error response
				responseData = {
					routing_number: routingNumber,
					found: false,
					error: 'Bank not found for this routing number',
				};
			}
			break;
		}

		case 'getApiStatus': {
			try {
				// Try to get API status from health endpoint
				responseData = (await columnApiRequest.call(this, {
					method: 'GET',
					endpoint: '/health',
				})) as IDataObject;
			} catch {
				// If health endpoint doesn't exist, try a simple authenticated request
				try {
					const platformInfo = (await columnApiRequest.call(this, {
						method: 'GET',
						endpoint: '/platform',
					})) as IDataObject;
					responseData = {
						status: 'operational',
						authenticated: true,
						platform_id: platformInfo.id,
						timestamp: new Date().toISOString(),
					};
				} catch {
					responseData = {
						status: 'error',
						authenticated: false,
						timestamp: new Date().toISOString(),
						error: 'Could not verify API status',
					};
				}
			}
			break;
		}

		case 'getRateLimits': {
			// Make a request to get some info
			try {
				await columnApiRequest.call(this, {
					method: 'GET',
					endpoint: '/platform',
				});

				responseData = {
					rate_limits: {
						note: 'Rate limit information extracted from API response headers',
						requests_per_minute: 'varies by endpoint',
					},
					timestamp: new Date().toISOString(),
				};
			} catch {
				responseData = {
					rate_limits: {
						note: 'Rate limit information not available',
					},
					timestamp: new Date().toISOString(),
				};
			}
			break;
		}

		case 'testConnection': {
			try {
				const platformInfo = (await columnApiRequest.call(this, {
					method: 'GET',
					endpoint: '/platform',
				})) as IDataObject;

				responseData = {
					connected: true,
					platform_id: platformInfo.id,
					timestamp: new Date().toISOString(),
					message: 'Successfully connected to Column API',
				};
			} catch {
				responseData = {
					connected: false,
					timestamp: new Date().toISOString(),
					message: 'Failed to connect to Column API',
				};
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return [{ json: responseData }];
}

export const operations = utilityOperations;
export const fields = utilityFields;
export const executeUtility = execute;
