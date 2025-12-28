/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';

export const verificationOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['verification'],
      },
    },
    options: [
      {
        name: 'Start',
        value: 'start',
        description: 'Start a verification process',
        action: 'Start verification',
      },
      {
        name: 'Get Status',
        value: 'getStatus',
        description: 'Get verification status',
        action: 'Get verification status',
      },
      {
        name: 'Complete',
        value: 'complete',
        description: 'Complete verification with results',
        action: 'Complete verification',
      },
      {
        name: 'Get Requirements',
        value: 'getRequirements',
        description: 'Get verification requirements',
        action: 'Get verification requirements',
      },
    ],
    default: 'getStatus',
  },
];

export const verificationFields: INodeProperties[] = [
  {
    displayName: 'Entity ID',
    name: 'entityId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['start', 'getStatus', 'complete', 'getRequirements'],
      },
    },
    description: 'The ID of the entity to verify',
  },
  {
    displayName: 'Verification Type',
    name: 'verificationType',
    type: 'options',
    required: true,
    default: 'kyc',
    options: [
      { name: 'KYC (Know Your Customer)', value: 'kyc' },
      { name: 'KYB (Know Your Business)', value: 'kyb' },
      { name: 'Document', value: 'document' },
      { name: 'Address', value: 'address' },
      { name: 'Identity', value: 'identity' },
    ],
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['start'],
      },
    },
    description: 'Type of verification to perform',
  },
  {
    displayName: 'Start Options',
    name: 'startOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['start'],
      },
    },
    options: [
      {
        displayName: 'Force New',
        name: 'forceNew',
        type: 'boolean',
        default: false,
        description: 'Force a new verification even if one exists',
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        default: '',
        description: 'URL to receive verification updates',
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
    displayName: 'Verification ID',
    name: 'verificationId',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['complete'],
      },
    },
    description: 'The ID of the verification to complete',
  },
  {
    displayName: 'Verification Result',
    name: 'verificationResult',
    type: 'options',
    required: true,
    default: 'approved',
    options: [
      { name: 'Approved', value: 'approved' },
      { name: 'Rejected', value: 'rejected' },
      { name: 'Review Required', value: 'review_required' },
    ],
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['complete'],
      },
    },
    description: 'Result of the verification',
  },
  {
    displayName: 'Complete Options',
    name: 'completeOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['verification'],
        operation: ['complete'],
      },
    },
    options: [
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Reason for the verification result',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes',
      },
    ],
  },
];

export async function executeVerificationOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'start': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const verificationType = this.getNodeParameter('verificationType', i) as string;
      const startOptions = this.getNodeParameter('startOptions', i) as IDataObject;

      const body: IDataObject = {
        type: verificationType,
      };

      if (startOptions.forceNew !== undefined) body.force_new = startOptions.forceNew;
      if (startOptions.webhookUrl) body.webhook_url = startOptions.webhookUrl;
      if (startOptions.metadata) body.metadata = JSON.parse(startOptions.metadata as string);

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.ENTITY(entityId)}/verifications`,
        body,
      })) as IDataObject;
      break;
    }

    case 'getStatus': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.ENTITY(entityId)}/verification-status`,
      })) as IDataObject;
      break;
    }

    case 'complete': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const verificationId = this.getNodeParameter('verificationId', i) as string;
      const verificationResult = this.getNodeParameter('verificationResult', i) as string;
      const completeOptions = this.getNodeParameter('completeOptions', i) as IDataObject;

      const body: IDataObject = {
        result: verificationResult,
      };

      if (completeOptions.reason) body.reason = completeOptions.reason;
      if (completeOptions.notes) body.notes = completeOptions.notes;

      const endpoint = verificationId
        ? `${API_PATHS.ENTITY(entityId)}/verifications/${verificationId}/complete`
        : `${API_PATHS.ENTITY(entityId)}/verifications/complete`;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint,
        body,
      })) as IDataObject;
      break;
    }

    case 'getRequirements': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.ENTITY(entityId)}/verification-requirements`,
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
  return executeVerificationOperation.call(this, operation, index);
}

export const operations = verificationOperations;
export const fields = verificationFields;
export const executeVerification = execute;
