/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { CARD_TYPE_OPTIONS, CARD_STATUS_OPTIONS } from '../../constants/eventTypes';

export const cardOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['card'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new card',
        action: 'Create a card',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a card by ID',
        action: 'Get a card',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all cards',
        action: 'List cards',
      },
      {
        name: 'Activate',
        value: 'activate',
        description: 'Activate a card',
        action: 'Activate a card',
      },
      {
        name: 'Lock',
        value: 'lock',
        description: 'Lock a card',
        action: 'Lock a card',
      },
      {
        name: 'Unlock',
        value: 'unlock',
        description: 'Unlock a card',
        action: 'Unlock a card',
      },
      {
        name: 'Replace',
        value: 'replace',
        description: 'Replace a card',
        action: 'Replace a card',
      },
      {
        name: 'Close',
        value: 'close',
        description: 'Close a card',
        action: 'Close a card',
      },
      {
        name: 'Get PIN',
        value: 'getPin',
        description: 'Get card PIN',
        action: 'Get card PIN',
      },
      {
        name: 'Reset PIN',
        value: 'resetPin',
        description: 'Reset card PIN',
        action: 'Reset card PIN',
      },
      {
        name: 'Get Transactions',
        value: 'getTransactions',
        description: 'Get card transactions',
        action: 'Get card transactions',
      },
      {
        name: 'Set Limits',
        value: 'setLimits',
        description: 'Set card limits',
        action: 'Set card limits',
      },
    ],
    default: 'get',
  },
];

export const cardFields: INodeProperties[] = [
  {
    displayName: 'Card ID',
    name: 'cardId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['get', 'activate', 'lock', 'unlock', 'replace', 'close', 'getPin', 'resetPin', 'getTransactions', 'setLimits'],
      },
    },
    description: 'The ID of the card',
  },
  {
    displayName: 'Entity ID',
    name: 'entityId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create'],
      },
    },
    description: 'The ID of the entity (cardholder)',
  },
  {
    displayName: 'Account ID',
    name: 'accountId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create'],
      },
    },
    description: 'The ID of the linked bank account',
  },
  {
    displayName: 'Card Type',
    name: 'cardType',
    type: 'options',
    required: true,
    options: CARD_TYPE_OPTIONS,
    default: 'virtual',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create'],
      },
    },
    description: 'Type of card to create',
  },
  {
    displayName: 'Create Options',
    name: 'createOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Cardholder Name',
        name: 'cardholderName',
        type: 'string',
        default: '',
        description: 'Name to print on the card',
      },
      {
        displayName: 'Shipping Address',
        name: 'shippingAddress',
        type: 'json',
        default: '{}',
        description: 'Shipping address for physical cards',
      },
      {
        displayName: 'Daily Limit',
        name: 'dailyLimit',
        type: 'number',
        default: 0,
        description: 'Daily spending limit in dollars',
      },
      {
        displayName: 'Monthly Limit',
        name: 'monthlyLimit',
        type: 'number',
        default: 0,
        description: 'Monthly spending limit in dollars',
      },
      {
        displayName: 'Per Transaction Limit',
        name: 'perTransactionLimit',
        type: 'number',
        default: 0,
        description: 'Per transaction limit in dollars',
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
        resource: ['card'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Entity ID',
        name: 'entityId',
        type: 'string',
        default: '',
        description: 'Filter by entity ID',
      },
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        default: '',
        description: 'Filter by account ID',
      },
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: CARD_TYPE_OPTIONS,
        default: '',
        description: 'Filter by card type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: CARD_STATUS_OPTIONS,
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
    displayName: 'Replace Reason',
    name: 'replaceReason',
    type: 'options',
    required: true,
    default: 'damaged',
    options: [
      { name: 'Damaged', value: 'damaged' },
      { name: 'Lost', value: 'lost' },
      { name: 'Stolen', value: 'stolen' },
      { name: 'Expired', value: 'expired' },
    ],
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['replace'],
      },
    },
    description: 'Reason for replacing the card',
  },
  {
    displayName: 'New PIN',
    name: 'newPin',
    type: 'string',
    typeOptions: { password: true },
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['resetPin'],
      },
    },
    description: 'New 4-digit PIN',
  },
  {
    displayName: 'Limits',
    name: 'limits',
    type: 'collection',
    placeholder: 'Add Limit',
    default: {},
    displayOptions: {
      show: {
        resource: ['card'],
        operation: ['setLimits'],
      },
    },
    options: [
      {
        displayName: 'Daily Limit',
        name: 'dailyLimit',
        type: 'number',
        default: 0,
        description: 'Daily spending limit in dollars',
      },
      {
        displayName: 'Monthly Limit',
        name: 'monthlyLimit',
        type: 'number',
        default: 0,
        description: 'Monthly spending limit in dollars',
      },
      {
        displayName: 'Per Transaction Limit',
        name: 'perTransactionLimit',
        type: 'number',
        default: 0,
        description: 'Per transaction limit in dollars',
      },
      {
        displayName: 'ATM Daily Limit',
        name: 'atmDailyLimit',
        type: 'number',
        default: 0,
        description: 'Daily ATM withdrawal limit in dollars',
      },
    ],
  },
];

export async function executeCardOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const accountId = this.getNodeParameter('accountId', i) as string;
      const cardType = this.getNodeParameter('cardType', i) as string;
      const createOptions = this.getNodeParameter('createOptions', i) as IDataObject;

      const body: IDataObject = {
        entity_id: entityId,
        account_id: accountId,
        type: cardType,
      };

      if (createOptions.cardholderName) body.cardholder_name = createOptions.cardholderName;
      if (createOptions.shippingAddress) body.shipping_address = JSON.parse(createOptions.shippingAddress as string);
      if (createOptions.dailyLimit) body.daily_limit = Math.round((createOptions.dailyLimit as number) * 100);
      if (createOptions.monthlyLimit) body.monthly_limit = Math.round((createOptions.monthlyLimit as number) * 100);
      if (createOptions.perTransactionLimit) body.per_transaction_limit = Math.round((createOptions.perTransactionLimit as number) * 100);
      if (createOptions.metadata) body.metadata = JSON.parse(createOptions.metadata as string);

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: API_PATHS.CARDS,
        body,
      })) as IDataObject;
      break;
    }

    case 'get': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.CARD(cardId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.entityId) query.entity_id = filters.entityId as string;
      if (filters.accountId) query.account_id = filters.accountId as string;
      if (filters.type) query.type = filters.type as string;
      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: API_PATHS.CARDS,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'activate': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/activate`,
      })) as IDataObject;
      break;
    }

    case 'lock': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/lock`,
      })) as IDataObject;
      break;
    }

    case 'unlock': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/unlock`,
      })) as IDataObject;
      break;
    }

    case 'replace': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      const replaceReason = this.getNodeParameter('replaceReason', i) as string;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/replace`,
        body: { reason: replaceReason },
      })) as IDataObject;
      break;
    }

    case 'close': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/close`,
      })) as IDataObject;
      break;
    }

    case 'getPin': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.CARD(cardId)}/pin`,
      })) as IDataObject;
      break;
    }

    case 'resetPin': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      const newPin = this.getNodeParameter('newPin', i) as string;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.CARD(cardId)}/pin`,
        body: { pin: newPin },
      })) as IDataObject;
      break;
    }

    case 'getTransactions': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.CARD(cardId)}/transactions`,
        },
        100,
      ) as IDataObject[];
      break;
    }

    case 'setLimits': {
      const cardId = this.getNodeParameter('cardId', i) as string;
      const limits = this.getNodeParameter('limits', i) as IDataObject;

      const body: IDataObject = {};

      if (limits.dailyLimit) body.daily_limit = Math.round((limits.dailyLimit as number) * 100);
      if (limits.monthlyLimit) body.monthly_limit = Math.round((limits.monthlyLimit as number) * 100);
      if (limits.perTransactionLimit) body.per_transaction_limit = Math.round((limits.perTransactionLimit as number) * 100);
      if (limits.atmDailyLimit) body.atm_daily_limit = Math.round((limits.atmDailyLimit as number) * 100);

      responseData = (await columnApiRequest.call(this, {
        method: 'PATCH',
        endpoint: `${API_PATHS.CARD(cardId)}/limits`,
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
  return executeCardOperation.call(this, operation, index);
}

export const operations = cardOperations;
export const fields = cardFields;
export const executeCard = execute;
