/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { HOLD_TYPE_OPTIONS, HOLD_STATUS_OPTIONS } from '../../constants/accountTypes';

export const holdOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['hold'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a hold on an account',
        action: 'Create a hold',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a hold by ID',
        action: 'Get a hold',
      },
      {
        name: 'Release',
        value: 'release',
        description: 'Release a hold',
        action: 'Release a hold',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all holds',
        action: 'List holds',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a hold',
        action: 'Update a hold',
      },
    ],
    default: 'list',
  },
];

export const holdFields: INodeProperties[] = [
  {
    displayName: 'Hold ID',
    name: 'holdId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['hold'],
        operation: ['get', 'release', 'update'],
      },
    },
    description: 'The ID of the hold',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['hold'],
        operation: ['create', 'list'],
      },
    },
    description: 'The ID of the bank account',
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['hold'],
        operation: ['create'],
      },
    },
    description: 'Hold amount in dollars',
  },
  {
    displayName: 'Hold Type',
    name: 'holdType',
    type: 'options',
    required: true,
    options: HOLD_TYPE_OPTIONS,
    default: 'pending_transaction',
    displayOptions: {
      show: {
        resource: ['hold'],
        operation: ['create'],
      },
    },
    description: 'Type of hold',
  },
  {
    displayName: 'Create Options',
    name: 'createOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['hold'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the hold',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'External reference ID',
      },
      {
        displayName: 'Expires At',
        name: 'expiresAt',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DDTHH:mm:ssZ',
        description: 'When the hold expires',
      },
      {
        displayName: 'Metadata',
        name: 'metadata',
        type: 'json',
        default: '{}',
        description: 'Custom metadata',
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
        resource: ['hold'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: HOLD_TYPE_OPTIONS,
        default: '',
        description: 'Filter by hold type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: HOLD_STATUS_OPTIONS,
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 50,
        description: 'Maximum number of results',
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
        resource: ['hold'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'Amount',
        name: 'amount',
        type: 'number',
        default: 0,
        description: 'Updated hold amount',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Updated description',
      },
      {
        displayName: 'Expires At',
        name: 'expiresAt',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DDTHH:mm:ssZ',
        description: 'Updated expiration',
      },
    ],
  },
];

export async function executeHoldOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const amount = this.getNodeParameter('amount', i) as number;
      const holdType = this.getNodeParameter('holdType', i) as string;
      const createOptions = this.getNodeParameter('createOptions', i) as IDataObject;

      const body: IDataObject = {
        account_id: accountId,
        amount: Math.round(amount * 100),
        type: holdType,
      };

      if (createOptions.description) body.description = createOptions.description;
      if (createOptions.reference) body.reference = createOptions.reference;
      if (createOptions.expiresAt) body.expires_at = createOptions.expiresAt;
      if (createOptions.metadata) body.metadata = JSON.parse(createOptions.metadata as string);

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: API_PATHS.HOLDS,
        body,
      })) as IDataObject;
      break;
    }

    case 'get': {
      const holdId = this.getNodeParameter('holdId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.HOLD(holdId),
      })) as IDataObject;
      break;
    }

    case 'release': {
      const holdId = this.getNodeParameter('holdId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.HOLD(holdId)}/release`,
      })) as IDataObject;
      break;
    }

    case 'list': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.type) query.type = filters.type as string;
      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/holds`,
          query,
        },
        limit,
      )) as IDataObject[];
      break;
    }

    case 'update': {
      const holdId = this.getNodeParameter('holdId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.amount) body.amount = Math.round((updateFields.amount as number) * 100);
      if (updateFields.description) body.description = updateFields.description;
      if (updateFields.expiresAt) body.expires_at = updateFields.expiresAt;

      responseData = (await columnApiRequest.call(this, {
        method: 'PATCH',
        endpoint: API_PATHS.HOLD(holdId),
        body,
      })) as IDataObject;
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  const executionData = Array.isArray(responseData)
    ? responseData.map((item) => ({ json: item }))
    : [{ json: responseData }];

  return executionData;
}

export async function execute(
  this: IExecuteFunctions,
  index: number,
): Promise<INodeExecutionData[]> {
  const operation = this.getNodeParameter('operation', index) as string;
  return executeHoldOperation.call(this, operation, index);
}

export const operations = holdOperations;
export const fields = holdFields;
export const executeHold = execute;
