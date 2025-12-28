/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class ColumnOAuth implements ICredentialType {
  name = 'columnOAuth';
  displayName = 'Column OAuth2 API';
  documentationUrl = 'https://column.com/docs/oauth';
  extends = ['oAuth2Api'];

  properties: INodeProperties[] = [
    {
      displayName: 'Grant Type',
      name: 'grantType',
      type: 'hidden',
      default: 'authorizationCode',
    },
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
      ],
      default: 'sandbox',
      description: 'The Column environment to connect to',
    },
    {
      displayName: 'Authorization URL',
      name: 'authUrl',
      type: 'hidden',
      default: '={{$self.environment === "production" ? "https://auth.column.com/oauth/authorize" : "https://auth.column-sandbox.com/oauth/authorize"}}',
    },
    {
      displayName: 'Access Token URL',
      name: 'accessTokenUrl',
      type: 'hidden',
      default: '={{$self.environment === "production" ? "https://auth.column.com/oauth/token" : "https://auth.column-sandbox.com/oauth/token"}}',
    },
    {
      displayName: 'Scope',
      name: 'scope',
      type: 'hidden',
      default: 'read write',
    },
    {
      displayName: 'Auth URI Query Parameters',
      name: 'authQueryParameters',
      type: 'hidden',
      default: '',
    },
    {
      displayName: 'Authentication',
      name: 'authentication',
      type: 'hidden',
      default: 'header',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      required: true,
      description: 'Your Column OAuth Client ID',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      required: true,
      description: 'Your Column OAuth Client Secret',
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
      description: 'Secret key for verifying webhook signatures',
    },
  ];
}
