/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { EVENT_TYPE_OPTIONS } from '../../constants/eventTypes';

export const eventOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['event'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get an event by ID',
        action: 'Get an event',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all events',
        action: 'List events',
      },
      {
        name: 'Get By Type',
        value: 'getByType',
        description: 'Get events by type',
        action: 'Get events by type',
      },
      {
        name: 'Get By Entity',
        value: 'getByEntity',
        description: 'Get events by entity',
        action: 'Get events by entity',
      },
      {
        name: 'Get By Account',
        value: 'getByAccount',
        description: 'Get events by account',
        action: 'Get events by account',
      },
    ],
    default: 'list',
  },
];

export const eventFields: INodeProperties[] = [
  {
    displayName: 'Event ID',
    name: 'eventId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['get'],
      },
    },
    description: 'The ID of the event',
  },
  {
    displayName: 'Event Type',
    name: 'eventType',
    type: 'options',
    required: true,
    options: EVENT_TYPE_OPTIONS,
    default: '',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getByType'],
      },
    },
    description: 'Type of events to retrieve',
  },
  {
    displayName: 'Entity ID',
    name: 'entityId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getByEntity'],
      },
    },
    description: 'The ID of the entity',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['getByAccount'],
      },
    },
    description: 'The ID of the account',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['event'],
        operation: ['list', 'getByType', 'getByEntity', 'getByAccount'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Filter from this date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Filter to this date',
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

export async function executeEventOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const eventId = this.getNodeParameter('eventId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.EVENTS}/${eventId}`,
      })) as IDataObject;
      break;
    }

    case 'list': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.startDate) query.start_date = filters.startDate as string;
      if (filters.endDate) query.end_date = filters.endDate as string;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: API_PATHS.EVENTS,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'getByType': {
      const eventType = this.getNodeParameter('eventType', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {
        type: eventType,
      };

      if (filters.startDate) query.start_date = filters.startDate as string;
      if (filters.endDate) query.end_date = filters.endDate as string;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: API_PATHS.EVENTS,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'getByEntity': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.startDate) query.start_date = filters.startDate as string;
      if (filters.endDate) query.end_date = filters.endDate as string;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.ENTITY(entityId)}/events`,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'getByAccount': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.startDate) query.start_date = filters.startDate as string;
      if (filters.endDate) query.end_date = filters.endDate as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/events`,
          query,
        },
        limit,
      )) as IDataObject[];
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
  return executeEventOperation.call(this, operation, index);
}

export const operations = eventOperations;
export const fields = eventFields;
export const executeEvent = execute;
