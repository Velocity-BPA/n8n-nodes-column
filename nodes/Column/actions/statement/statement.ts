/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { STATEMENT_PERIOD_OPTIONS } from '../../constants/accountTypes';

export const statementOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['statement'],
      },
    },
    options: [
      {
        name: 'Get',
        value: 'get',
        description: 'Get a statement by ID',
        action: 'Get a statement',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all statements',
        action: 'List statements',
      },
      {
        name: 'Get PDF',
        value: 'getPdf',
        description: 'Get statement as PDF',
        action: 'Get statement PDF',
      },
      {
        name: 'Get Transactions',
        value: 'getTransactions',
        description: 'Get transactions for a statement',
        action: 'Get statement transactions',
      },
      {
        name: 'Generate',
        value: 'generate',
        description: 'Generate a new statement',
        action: 'Generate statement',
      },
    ],
    default: 'list',
  },
];

export const statementFields: INodeProperties[] = [
  {
    displayName: 'Statement ID',
    name: 'statementId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['statement'],
        operation: ['get', 'getPdf', 'getTransactions'],
      },
    },
    description: 'The ID of the statement',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['statement'],
        operation: ['list', 'generate'],
      },
    },
    description: 'The ID of the bank account',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['statement'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Year',
        name: 'year',
        type: 'number',
        default: new Date().getFullYear(),
        description: 'Filter by year',
      },
      {
        displayName: 'Month',
        name: 'month',
        type: 'number',
        default: 0,
        description: 'Filter by month (1-12)',
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
    displayName: 'Statement Period',
    name: 'statementPeriod',
    type: 'options',
    required: true,
    options: STATEMENT_PERIOD_OPTIONS,
    default: 'monthly',
    displayOptions: {
      show: {
        resource: ['statement'],
        operation: ['generate'],
      },
    },
    description: 'Type of statement period',
  },
  {
    displayName: 'Generate Options',
    name: 'generateOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['statement'],
        operation: ['generate'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Custom start date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Custom end date',
      },
    ],
  },
];

export async function executeStatementOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'get': {
      const statementId = this.getNodeParameter('statementId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.STATEMENT(statementId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.year) query.year = filters.year as number;
      if (filters.month) query.month = filters.month as number;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/statements`,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'getPdf': {
      const statementId = this.getNodeParameter('statementId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.STATEMENT(statementId)}/pdf`,
      })) as IDataObject;
      break;
    }

    case 'getTransactions': {
      const statementId = this.getNodeParameter('statementId', i) as string;
      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.STATEMENT(statementId)}/transactions`,
        },
        100,
      ) as IDataObject[];
      break;
    }

    case 'generate': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const statementPeriod = this.getNodeParameter('statementPeriod', i) as string;
      const generateOptions = this.getNodeParameter('generateOptions', i) as IDataObject;

      const body: IDataObject = {
        period: statementPeriod,
      };

      if (generateOptions.startDate) body.start_date = generateOptions.startDate;
      if (generateOptions.endDate) body.end_date = generateOptions.endDate;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/statements`,
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
  return executeStatementOperation.call(this, operation, index);
}

export const operations = statementOperations;
export const fields = statementFields;
export const executeStatement = execute;
