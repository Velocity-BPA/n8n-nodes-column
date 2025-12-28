/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems, columnApiUploadDocument } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';

const DOCUMENT_TYPE_OPTIONS = [
  { name: 'ID Front', value: 'id_front' },
  { name: 'ID Back', value: 'id_back' },
  { name: 'Passport', value: 'passport' },
  { name: 'Proof of Address', value: 'proof_of_address' },
  { name: 'Articles of Incorporation', value: 'articles_of_incorporation' },
  { name: 'EIN Letter', value: 'ein_letter' },
  { name: 'Operating Agreement', value: 'operating_agreement' },
  { name: 'Bank Statement', value: 'bank_statement' },
  { name: 'Tax Return', value: 'tax_return' },
  { name: 'Other', value: 'other' },
];

export const documentOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['document'],
      },
    },
    options: [
      {
        name: 'Upload',
        value: 'upload',
        description: 'Upload a document',
        action: 'Upload a document',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a document by ID',
        action: 'Get a document',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all documents',
        action: 'List documents',
      },
      {
        name: 'Delete',
        value: 'delete',
        description: 'Delete a document',
        action: 'Delete a document',
      },
      {
        name: 'Get Status',
        value: 'getStatus',
        description: 'Get document verification status',
        action: 'Get document status',
      },
      {
        name: 'Get Required',
        value: 'getRequired',
        description: 'Get required documents for an entity',
        action: 'Get required documents',
      },
    ],
    default: 'list',
  },
];

export const documentFields: INodeProperties[] = [
  {
    displayName: 'Document ID',
    name: 'documentId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['get', 'delete', 'getStatus'],
      },
    },
    description: 'The ID of the document',
  },
  {
    displayName: 'Entity ID',
    name: 'entityId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['upload', 'list', 'getRequired'],
      },
    },
    description: 'The ID of the entity',
  },
  {
    displayName: 'Document Type',
    name: 'documentType',
    type: 'options',
    required: true,
    options: DOCUMENT_TYPE_OPTIONS,
    default: 'id_front',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['upload'],
      },
    },
    description: 'Type of document',
  },
  {
    displayName: 'File',
    name: 'file',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['upload'],
      },
    },
    description: 'Base64-encoded file content or URL to file',
  },
  {
    displayName: 'Upload Options',
    name: 'uploadOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['document'],
        operation: ['upload'],
      },
    },
    options: [
      {
        displayName: 'Filename',
        name: 'filename',
        type: 'string',
        default: '',
        description: 'Name of the file',
      },
      {
        displayName: 'Content Type',
        name: 'contentType',
        type: 'options',
        default: 'application/pdf',
        options: [
          { name: 'PDF', value: 'application/pdf' },
          { name: 'PNG', value: 'image/png' },
          { name: 'JPEG', value: 'image/jpeg' },
        ],
        description: 'MIME type of the file',
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Description of the document',
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
        resource: ['document'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: DOCUMENT_TYPE_OPTIONS,
        default: '',
        description: 'Filter by document type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'Pending', value: 'pending' },
          { name: 'Approved', value: 'approved' },
          { name: 'Rejected', value: 'rejected' },
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

export async function executeDocumentOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'upload': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const documentType = this.getNodeParameter('documentType', i) as string;
      const file = this.getNodeParameter('file', i) as string;
      const uploadOptions = this.getNodeParameter('uploadOptions', i) as IDataObject;

      // Convert file from base64 or path to Buffer
      const fileBuffer = Buffer.from(file, 'base64');
      const fileName = (uploadOptions.filename as string) || 'document';
      const mimeType = (uploadOptions.contentType as string) || 'application/octet-stream';

      responseData = (await columnApiUploadDocument.call(
        this,
        API_PATHS.ENTITY_DOCUMENTS(entityId),
        fileName,
        fileBuffer,
        mimeType,
        {
          type: documentType,
          description: uploadOptions.description as string,
        },
      )) as IDataObject;
      break;
    }

    case 'get': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.DOCUMENT(documentId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.type) query.type = filters.type as string;
      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: `${API_PATHS.ENTITY(entityId)}/documents`,
          query,
        },
        limit,
      ) as IDataObject[];
      break;
    }

    case 'delete': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'DELETE',
        endpoint: API_PATHS.DOCUMENT(documentId),
      })) as IDataObject;
      break;
    }

    case 'getStatus': {
      const documentId = this.getNodeParameter('documentId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.DOCUMENT(documentId)}/status`,
      })) as IDataObject;
      break;
    }

    case 'getRequired': {
      const entityId = this.getNodeParameter('entityId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.ENTITY(entityId)}/documents/required`,
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
  return executeDocumentOperation.call(this, operation, index);
}

export const operations = documentOperations;
export const fields = documentFields;
export const executeDocument = execute;
