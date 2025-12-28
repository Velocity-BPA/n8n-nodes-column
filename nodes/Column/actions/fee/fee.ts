/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';

const FEE_TYPE_OPTIONS = [
  { name: 'Monthly Maintenance', value: 'monthly_maintenance' },
  { name: 'Wire Transfer', value: 'wire_transfer' },
  { name: 'ACH Transfer', value: 'ach_transfer' },
  { name: 'Overdraft', value: 'overdraft' },
  { name: 'NSF (Insufficient Funds)', value: 'nsf' },
  { name: 'Stop Payment', value: 'stop_payment' },
  { name: 'Statement', value: 'statement' },
  { name: 'Check', value: 'check' },
  { name: 'Card Replacement', value: 'card_replacement' },
  { name: 'Custom', value: 'custom' },
];

export const feeOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['fee'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a fee',
        action: 'Create a fee',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a fee by ID',
        action: 'Get a fee',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all fees',
        action: 'List fees',
      },
      {
        name: 'Waive',
        value: 'waive',
        description: 'Waive a fee',
        action: 'Waive a fee',
      },
      {
        name: 'Get Schedule',
        value: 'getSchedule',
        description: 'Get fee schedule',
        action: 'Get fee schedule',
      },
    ],
    default: 'list',
  },
];

export const feeFields: INodeProperties[] = [
  {
    displayName: 'Fee ID',
    name: 'feeId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['fee'],
        operation: ['get', 'waive'],
      },
    },
    description: 'The ID of the fee',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['fee'],
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
        resource: ['fee'],
        operation: ['create'],
      },
    },
    description: 'Fee amount in dollars',
  },
  {
    displayName: 'Fee Type',
    name: 'feeType',
    type: 'options',
    required: true,
    options: FEE_TYPE_OPTIONS,
    default: 'custom',
    displayOptions: {
      show: {
        resource: ['fee'],
        operation: ['create'],
      },
    },
    description: 'Type of fee',
  },
  {
    displayName: 'Create Options',
    name: 'createOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['fee'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the fee',
      },
      {
        displayName: 'Reference',
        name: 'reference',
        type: 'string',
        default: '',
        description: 'External reference ID',
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
        resource: ['fee'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: FEE_TYPE_OPTIONS,
        default: '',
        description: 'Filter by fee type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'Pending', value: 'pending' },
          { name: 'Posted', value: 'posted' },
          { name: 'Waived', value: 'waived' },
        ],
        description: 'Filter by status',
      },
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
  {
    displayName: 'Waive Reason',
    name: 'waiveReason',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['fee'],
        operation: ['waive'],
      },
    },
    description: 'Reason for waiving the fee',
  },
];

export async function executeFeeOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const amount = this.getNodeParameter('amount', i) as number;
      const feeType = this.getNodeParameter('feeType', i) as string;
      const createOptions = this.getNodeParameter('createOptions', i) as IDataObject;

      const body: IDataObject = {
        account_id: accountId,
        amount: Math.round(amount * 100),
        type: feeType,
      };

      if (createOptions.description) body.description = createOptions.description;
      if (createOptions.reference) body.reference = createOptions.reference;
      if (createOptions.metadata) body.metadata = JSON.parse(createOptions.metadata as string);

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: API_PATHS.FEES,
        body,
      })) as IDataObject;
      break;
    }

    case 'get': {
      const feeId = this.getNodeParameter('feeId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.FEE(feeId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      const accountId = this.getNodeParameter('accountId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.type) query.type = filters.type as string;
      if (filters.status) query.status = filters.status as string;
      if (filters.startDate) query.start_date = filters.startDate as string;
      if (filters.endDate) query.end_date = filters.endDate as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.BANK_ACCOUNT(accountId)}/fees`,
          query,
        },
        limit,
      )) as IDataObject[];
      break;
    }

    case 'waive': {
      const feeId = this.getNodeParameter('feeId', i) as string;
      const waiveReason = this.getNodeParameter('waiveReason', i) as string;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.FEE(feeId)}/waive`,
        body: { reason: waiveReason },
      })) as IDataObject;
      break;
    }

    case 'getSchedule': {
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.FEES}/schedule`,
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
  return executeFeeOperation.call(this, operation, index);
}

export const operations = feeOperations;
export const fields = feeFields;
export const executeFee = execute;
