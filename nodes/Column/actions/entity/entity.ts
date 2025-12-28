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
import { ENTITY_TYPE_OPTIONS, US_STATE_OPTIONS } from '../../constants/entityTypes';

export const operations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['entity'],
			},
		},
		options: [
			{
				name: 'Create Person',
				value: 'createPerson',
				description: 'Create a person entity',
				action: 'Create person entity',
			},
			{
				name: 'Create Business',
				value: 'createBusiness',
				description: 'Create a business entity',
				action: 'Create business entity',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an entity by ID',
				action: 'Get entity',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an entity',
				action: 'Update entity',
			},
			{
				name: 'List',
				value: 'list',
				description: 'List entities',
				action: 'List entities',
			},
			{
				name: 'Archive',
				value: 'archive',
				description: 'Archive an entity',
				action: 'Archive entity',
			},
			{
				name: 'Get Documents',
				value: 'getDocuments',
				description: 'Get entity documents',
				action: 'Get entity documents',
			},
			{
				name: 'Get Accounts',
				value: 'getAccounts',
				description: 'Get entity bank accounts',
				action: 'Get entity accounts',
			},
			{
				name: 'Get Verification Status',
				value: 'getVerificationStatus',
				description: 'Get entity verification status',
				action: 'Get verification status',
			},
		],
		default: 'createPerson',
	},
];

export const fields: INodeProperties[] = [
	// Person fields
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@email.com',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Date of Birth',
		name: 'dateOfBirth',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'SSN',
		name: 'ssn',
		type: 'string',
		required: true,
		default: '',
		description: 'Social Security Number (9 digits)',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
	},
	{
		displayName: 'Person Additional Fields',
		name: 'personAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createPerson'],
			},
		},
		options: [
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 1',
				name: 'addressLine1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 2',
				name: 'addressLine2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: '',
				options: US_STATE_OPTIONS,
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
		],
	},
	// Business fields
	{
		displayName: 'Business Name',
		name: 'businessName',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createBusiness'],
			},
		},
	},
	{
		displayName: 'EIN',
		name: 'ein',
		type: 'string',
		required: true,
		default: '',
		description: 'Employer Identification Number',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createBusiness'],
			},
		},
	},
	{
		displayName: 'Business Type',
		name: 'businessType',
		type: 'options',
		required: true,
		default: 'llc',
		options: ENTITY_TYPE_OPTIONS,
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createBusiness'],
			},
		},
	},
	{
		displayName: 'Business Email',
		name: 'businessEmail',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createBusiness'],
			},
		},
	},
	{
		displayName: 'Business Additional Fields',
		name: 'businessAdditionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['createBusiness'],
			},
		},
		options: [
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Address Line 1',
				name: 'addressLine1',
				type: 'string',
				default: '',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'options',
				default: '',
				options: US_STATE_OPTIONS,
			},
			{
				displayName: 'Postal Code',
				name: 'postalCode',
				type: 'string',
				default: '',
			},
		],
	},
	// Common fields
	{
		displayName: 'Entity ID',
		name: 'entityId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['entity'],
				operation: ['get', 'update', 'archive', 'getDocuments', 'getAccounts', 'getVerificationStatus'],
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
				resource: ['entity'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
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
				resource: ['entity'],
				operation: ['list'],
			},
		},
		options: [
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				default: '',
				options: [
					{ name: 'Person', value: 'person' },
					{ name: 'Business', value: 'business' },
				],
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: '',
				options: [
					{ name: 'Active', value: 'active' },
					{ name: 'Pending', value: 'pending' },
					{ name: 'Archived', value: 'archived' },
				],
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				default: 25,
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
		case 'createPerson': {
			const firstName = this.getNodeParameter('firstName', index) as string;
			const lastName = this.getNodeParameter('lastName', index) as string;
			const email = this.getNodeParameter('email', index) as string;
			const dateOfBirth = this.getNodeParameter('dateOfBirth', index) as string;
			const ssn = this.getNodeParameter('ssn', index) as string;
			const additionalFields = this.getNodeParameter('personAdditionalFields', index) as IDataObject;

			const body: IDataObject = {
				type: 'person',
				first_name: firstName,
				last_name: lastName,
				email,
				date_of_birth: dateOfBirth,
				ssn,
			};

			if (additionalFields.phone) body.phone = additionalFields.phone;
			if (additionalFields.addressLine1) {
				body.address = {
					line1: additionalFields.addressLine1,
					line2: additionalFields.addressLine2 || '',
					city: additionalFields.city || '',
					state: additionalFields.state || '',
					postal_code: additionalFields.postalCode || '',
					country: 'US',
				};
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.ENTITIES,
				body,
			}) as IDataObject;
			break;
		}

		case 'createBusiness': {
			const businessName = this.getNodeParameter('businessName', index) as string;
			const ein = this.getNodeParameter('ein', index) as string;
			const businessType = this.getNodeParameter('businessType', index) as string;
			const businessEmail = this.getNodeParameter('businessEmail', index) as string;
			const additionalFields = this.getNodeParameter('businessAdditionalFields', index) as IDataObject;

			const body: IDataObject = {
				type: 'business',
				business_name: businessName,
				ein,
				business_type: businessType,
				email: businessEmail,
			};

			if (additionalFields.phone) body.phone = additionalFields.phone;
			if (additionalFields.website) body.website = additionalFields.website;
			if (additionalFields.addressLine1) {
				body.address = {
					line1: additionalFields.addressLine1,
					city: additionalFields.city || '',
					state: additionalFields.state || '',
					postal_code: additionalFields.postalCode || '',
					country: 'US',
				};
			}

			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: API_PATHS.ENTITIES,
				body,
			}) as IDataObject;
			break;
		}

		case 'get': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ENTITY(entityId),
			}) as IDataObject;
			break;
		}

		case 'update': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

			const body: IDataObject = {};
			if (updateFields.email) body.email = updateFields.email;
			if (updateFields.phone) body.phone = updateFields.phone;

			responseData = await columnApiRequest.call(this, {
				method: 'PATCH',
				endpoint: API_PATHS.ENTITY(entityId),
				body,
			}) as IDataObject;
			break;
		}

		case 'list': {
			const filters = this.getNodeParameter('filters', index) as IDataObject;
			const query: Record<string, string | number | boolean | undefined> = {};

			if (filters.type) query.type = filters.type as string;
			if (filters.status) query.status = filters.status as string;

			const limit = (filters.limit as number) || 25;
			responseData = await columnApiRequestAllItems.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ENTITIES,
				query,
			}, limit) as IDataObject[];
			break;
		}

		case 'archive': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'POST',
				endpoint: `${API_PATHS.ENTITY(entityId)}/archive`,
			}) as IDataObject;
			break;
		}

		case 'getDocuments': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ENTITY_DOCUMENTS(entityId),
			}) as IDataObject;
			break;
		}

		case 'getAccounts': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ENTITY_ACCOUNTS(entityId),
			}) as IDataObject;
			break;
		}

		case 'getVerificationStatus': {
			const entityId = this.getNodeParameter('entityId', index) as string;
			responseData = await columnApiRequest.call(this, {
				method: 'GET',
				endpoint: API_PATHS.ENTITY_VERIFICATION(entityId),
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

export const entityOperations = operations;
export const entityFields = fields;
export const executeEntity = execute;
