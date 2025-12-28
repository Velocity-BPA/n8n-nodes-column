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

export const webhookOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['webhook'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new webhook',
        action: 'Create a webhook',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a webhook by ID',
        action: 'Get a webhook',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a webhook',
        action: 'Update a webhook',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a webhook',
        action: 'Delete a webhook',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all webhooks',
        action: 'List webhooks',
      },
      {
        name: 'Test',
        value: 'test',
        description: 'Send a test webhook event',
        action: 'Test webhook',
      },
      {
        name: 'Get Events',
        value: 'getEvents',
        description: 'Get webhook delivery events',
        action: 'Get webhook events',
      },
      {
        name: 'Retry',
        value: 'retry',
        description: 'Retry a failed webhook delivery',
        action: 'Retry webhook',
      },
      {
        name: 'Verify Signature',
        value: 'verifySignature',
        description: 'Verify a webhook signature',
        action: 'Verify signature',
      },
    ],
    default: 'list',
  },
];

export const webhookFields: INodeProperties[] = [
  {
    displayName: 'Webhook ID',
    name: 'webhookId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['get', 'update', 'delete', 'test', 'getEvents'],
      },
    },
    description: 'The ID of the webhook',
  },
  {
    displayName: 'URL',
    name: 'url',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    description: 'The URL to receive webhook events',
  },
  {
    displayName: 'Events',
    name: 'events',
    type: 'multiOptions',
    required: true,
    options: EVENT_TYPE_OPTIONS,
    default: [],
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    description: 'Events to subscribe to',
  },
  {
    displayName: 'Create Options',
    name: 'createOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['create'],
      },
    },
    options: [
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the webhook',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the webhook is active',
      },
      {
        displayName: 'Secret',
        name: 'secret',
        type: 'string',
        typeOptions: { password: true },
        default: '',
        description: 'Secret for signature verification',
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
        resource: ['webhook'],
        operation: ['update'],
      },
    },
    options: [
      {
        displayName: 'URL',
        name: 'url',
        type: 'string',
        default: '',
        description: 'Updated webhook URL',
      },
      {
        displayName: 'Events',
        name: 'events',
        type: 'multiOptions',
        options: EVENT_TYPE_OPTIONS,
        default: [],
        description: 'Updated event subscriptions',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Updated description',
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'boolean',
        default: true,
        description: 'Whether the webhook is active',
      },
    ],
  },
  {
    displayName: 'Event ID',
    name: 'eventId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['retry'],
      },
    },
    description: 'The ID of the event to retry',
  },
  {
    displayName: 'Signature',
    name: 'signature',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['verifySignature'],
      },
    },
    description: 'The signature to verify',
  },
  {
    displayName: 'Payload',
    name: 'payload',
    type: 'json',
    required: true,
    default: '{}',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['verifySignature'],
      },
    },
    description: 'The webhook payload to verify',
  },
  {
    displayName: 'Timestamp',
    name: 'timestamp',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['webhook'],
        operation: ['verifySignature'],
      },
    },
    description: 'The timestamp from the webhook header',
  },
];

export async function executeWebhookOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'create': {
      const url = this.getNodeParameter('url', i) as string;
      const events = this.getNodeParameter('events', i) as string[];
      const createOptions = this.getNodeParameter('createOptions', i) as IDataObject;

      const body: IDataObject = {
        url,
        events,
      };

      if (createOptions.description) body.description = createOptions.description;
      if (createOptions.active !== undefined) body.active = createOptions.active;
      if (createOptions.secret) body.secret = createOptions.secret;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: API_PATHS.WEBHOOKS,
        body,
      })) as IDataObject;
      break;
    }

    case 'get': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.WEBHOOK(webhookId),
      })) as IDataObject;
      break;
    }

    case 'update': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

      const body: IDataObject = {};

      if (updateFields.url) body.url = updateFields.url;
      if (updateFields.events) body.events = updateFields.events;
      if (updateFields.description) body.description = updateFields.description;
      if (updateFields.active !== undefined) body.active = updateFields.active;

      responseData = (await columnApiRequest.call(this, {
        method: 'PATCH',
        endpoint: API_PATHS.WEBHOOK(webhookId),
        body,
      })) as IDataObject;
      break;
    }

    case 'delete': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'DELETE',
        endpoint: API_PATHS.WEBHOOK(webhookId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: API_PATHS.WEBHOOKS,
        },
        100,
      )) as IDataObject[];
      break;
    }

    case 'test': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.WEBHOOK(webhookId)}/test`,
      })) as IDataObject;
      break;
    }

    case 'getEvents': {
      const webhookId = this.getNodeParameter('webhookId', i) as string;
      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.WEBHOOK(webhookId)}/events`,
        },
        100,
      )) as IDataObject[];
      break;
    }

    case 'retry': {
      const eventId = this.getNodeParameter('eventId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.EVENTS}/${eventId}/retry`,
      })) as IDataObject;
      break;
    }

    case 'verifySignature': {
      const signature = this.getNodeParameter('signature', i) as string;
      const payload = this.getNodeParameter('payload', i) as string;
      const timestamp = this.getNodeParameter('timestamp', i) as string;

      // Get webhook secret from credentials
      const credentials = await this.getCredentials('columnApi');
      const secret = credentials.webhookSecret as string;

      if (!secret) {
        throw new Error('Webhook secret not configured in credentials');
      }

      // Import signature verification utility
      const { verifyWebhookSignature } = await import('../../utils/signatureUtils');

      const isValid = verifyWebhookSignature(
        JSON.stringify(JSON.parse(payload)),
        signature,
        secret,
        timestamp,
      );

      responseData = {
        valid: isValid,
        signature,
        timestamp,
      };
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
  return executeWebhookOperation.call(this, operation, index);
}

export const operations = webhookOperations;
export const fields = webhookFields;
export const executeWebhook = execute;
