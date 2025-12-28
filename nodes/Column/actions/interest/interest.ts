/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';

export const interestOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['interest'],
      },
    },
    options: [
      {
        name: 'Get Rate',
        value: 'getRate',
        description: 'Get interest rate for an account',
        action: 'Get interest rate',
      },
      {
        name: 'Set Rate',
        value: 'setRate',
        description: 'Set interest rate for an account',
        action: 'Set interest rate',
      },
      {
        name: 'Get Accrued',
        value: 'getAccrued',
        description: 'Get accrued interest',
        action: 'Get accrued interest',
      },
      {
        name: 'Get Payments',
        value: 'getPayments',
        description: 'Get interest payments',
        action: 'Get interest payments',
      },
      {
        name: 'Get APY',
        value: 'getApy',
        description: 'Get Annual Percentage Yield',
        action: 'Get APY',
      },
    ],
    default: 'getRate',
  },
];

export const interestFields: INodeProperties[] = [
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['interest'],
        operation: ['getRate', 'setRate', 'getAccrued', 'getPayments', 'getApy'],
      },
    },
    description: 'The ID of the bank account',
  },
  {
    displayName: 'Interest Rate',
    name: 'interestRate',
    type: 'number',
    required: true,
    default: 0,
    displayOptions: {
      show: {
        resource: ['interest'],
        operation: ['setRate'],
      },
    },
    description: 'Interest rate as a percentage (e.g., 2.5 for 2.5%)',
  },
  {
    displayName: 'Date Range',
    name: 'dateRange',
    type: 'collection',
    placeholder: 'Add Date Range',
    default: {},
    displayOptions: {
      show: {
        resource: ['interest'],
        operation: ['getAccrued', 'getPayments'],
      },
    },
    options: [
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Start date for the range',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'End date for the range',
      },
    ],
  },
];

export async function executeInterestOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'getRate': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/interest/rate`,
      })) as IDataObject;
      break;
    }

    case 'setRate': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const interestRate = this.getNodeParameter('interestRate', i) as number;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/interest/rate`,
        body: { rate: interestRate / 100 },
      })) as IDataObject;
      break;
    }

    case 'getAccrued': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const dateRange = this.getNodeParameter('dateRange', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (dateRange.startDate) query.start_date = dateRange.startDate as string;
      if (dateRange.endDate) query.end_date = dateRange.endDate as string;

      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/interest/accrued`,
        query,
      })) as IDataObject;
      break;
    }

    case 'getPayments': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const dateRange = this.getNodeParameter('dateRange', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (dateRange.startDate) query.start_date = dateRange.startDate as string;
      if (dateRange.endDate) query.end_date = dateRange.endDate as string;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/interest/payments`,
          query,
        },
        100,
      ) as IDataObject[];
      break;
    }

    case 'getApy': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/interest/apy`,
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
  return executeInterestOperation.call(this, operation, index);
}

export const operations = interestOperations;
export const fields = interestFields;
export const executeInterest = execute;
