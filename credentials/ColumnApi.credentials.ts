/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
  ICredentialType,
  INodeProperties,
  ICredentialTestRequest,
  IAuthenticateGeneric,
  ICredentialDataDecryptedObject,
} from 'n8n-workflow';

export class ColumnApi implements ICredentialType {
  name = 'columnApi';
  displayName = 'Column API';
  documentationUrl = 'https://column.com/docs';
  properties: INodeProperties[] = [
    {
      displayName: 'Environment',
      name: 'environment',
      type: 'options',
      options: [
        {
          name: 'Production',
          value: 'production',
          description: 'Column Production Environment',
        },
        {
          name: 'Sandbox',
          value: 'sandbox',
          description: 'Column Sandbox Environment (for testing)',
        },
        {
          name: 'Custom',
          value: 'custom',
          description: 'Custom API endpoint',
        },
      ],
      default: 'sandbox',
      description: 'The Column environment to connect to',
    },
    {
      displayName: 'Custom Endpoint',
      name: 'customEndpoint',
      type: 'string',
      default: '',
      placeholder: 'https://api.custom-column.com/v1',
      description: 'Custom API endpoint URL',
      displayOptions: {
        show: {
          environment: ['custom'],
        },
      },
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Column API key. Found in the Column Dashboard under Settings > API Keys.',
    },
    {
      displayName: 'Platform ID',
      name: 'platformId',
      type: 'string',
      default: '',
      description: 'Optional Platform ID for multi-platform setups',
    },
    {
      displayName: 'Webhook Secret',
      name: 'webhookSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      description: 'Secret key for verifying webhook signatures. Found when creating a webhook in the Column Dashboard.',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.environment === "production" ? "https://api.column.com/v1" : $credentials.environment === "sandbox" ? "https://api.column-sandbox.com/v1" : $credentials.customEndpoint}}',
      url: '/platform',
      method: 'GET',
    },
  };
}
