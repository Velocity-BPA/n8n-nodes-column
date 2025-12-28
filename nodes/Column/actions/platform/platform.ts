/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';

export const platformOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['platform'],
      },
    },
    options: [
      {
        name: 'Get Info',
        value: 'getInfo',
        description: 'Get platform information',
        action: 'Get platform info',
      },
      {
        name: 'Get Accounts',
        value: 'getAccounts',
        description: 'Get platform accounts',
        action: 'Get platform accounts',
      },
      {
        name: 'Get Entities',
        value: 'getEntities',
        description: 'Get platform entities',
        action: 'Get platform entities',
      },
      {
        name: 'Get Limits',
        value: 'getLimits',
        description: 'Get platform limits',
        action: 'Get platform limits',
      },
      {
        name: 'Get Settings',
        value: 'getSettings',
        description: 'Get platform settings',
        action: 'Get platform settings',
      },
    ],
    default: 'getInfo',
  },
];

export const platformFields: INodeProperties[] = [
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['platform'],
        operation: ['getAccounts', 'getEntities'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' },
          { name: 'Pending', value: 'pending' },
          { name: 'Closed', value: 'closed' },
        ],
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
];

export async function executePlatformOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getInfo': {
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.PLATFORM,
      })) as IDataObject;
      break;
    }

    case 'getAccounts': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.PLATFORM}/accounts`,
          query,
        },
        limit,
      )) as IDataObject[];
      break;
    }

    case 'getEntities': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.PLATFORM}/entities`,
          query,
        },
        limit,
      )) as IDataObject[];
      break;
    }

    case 'getLimits': {
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.PLATFORM}/limits`,
      })) as IDataObject;
      break;
    }

    case 'getSettings': {
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.PLATFORM}/settings`,
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
  return executePlatformOperation.call(this, operation, index);
}

export const operations = platformOperations;
export const fields = platformFields;
export const executePlatform = execute;
