/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { columnApiRequest, columnApiRequestAllItems } from '../../transport/columnClient';
import { API_PATHS } from '../../constants/endpoints';
import { REPORT_TYPE_OPTIONS } from '../../constants/eventTypes';

export const reportingOperations: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['reporting'],
      },
    },
    options: [
      {
        name: 'Generate',
        value: 'generate',
        description: 'Generate a new report',
        action: 'Generate report',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a report by ID',
        action: 'Get report',
      },
      {
        name: 'List',
        value: 'list',
        description: 'List all reports',
        action: 'List reports',
      },
      {
        name: 'Download',
        value: 'download',
        description: 'Download a report',
        action: 'Download report',
      },
      {
        name: 'Get Types',
        value: 'getTypes',
        description: 'Get available report types',
        action: 'Get report types',
      },
      {
        name: 'Schedule',
        value: 'schedule',
        description: 'Schedule a recurring report',
        action: 'Schedule report',
      },
    ],
    default: 'list',
  },
];

export const reportingFields: INodeProperties[] = [
  {
    displayName: 'Report ID',
    name: 'reportId',
    type: 'string',
    required: true,
    default: '',
    displayOptions: {
      show: {
        resource: ['reporting'],
        operation: ['get', 'download'],
      },
    },
    description: 'The ID of the report',
  },
  {
    displayName: 'Report Type',
    name: 'reportType',
    type: 'options',
    required: true,
    options: REPORT_TYPE_OPTIONS,
    default: 'transaction_summary',
    displayOptions: {
      show: {
        resource: ['reporting'],
        operation: ['generate', 'schedule'],
      },
    },
    description: 'Type of report to generate',
  },
  {
    displayName: 'Generate Options',
    name: 'generateOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['reporting'],
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
        description: 'Report start date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: 'YYYY-MM-DD',
        description: 'Report end date',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        default: 'csv',
        options: [
          { name: 'CSV', value: 'csv' },
          { name: 'JSON', value: 'json' },
          { name: 'PDF', value: 'pdf' },
        ],
        description: 'Report output format',
      },
      {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        default: '',
        description: 'Filter by account ID',
      },
      {
        displayName: 'Entity ID',
        name: 'entityId',
        type: 'string',
        default: '',
        description: 'Filter by entity ID',
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
        resource: ['reporting'],
        operation: ['list'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: REPORT_TYPE_OPTIONS,
        default: '',
        description: 'Filter by report type',
      },
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        default: '',
        options: [
          { name: 'Pending', value: 'pending' },
          { name: 'Processing', value: 'processing' },
          { name: 'Completed', value: 'completed' },
          { name: 'Failed', value: 'failed' },
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
  {
    displayName: 'Schedule',
    name: 'schedule',
    type: 'options',
    required: true,
    default: 'daily',
    options: [
      { name: 'Daily', value: 'daily' },
      { name: 'Weekly', value: 'weekly' },
      { name: 'Monthly', value: 'monthly' },
    ],
    displayOptions: {
      show: {
        resource: ['reporting'],
        operation: ['schedule'],
      },
    },
    description: 'Report schedule frequency',
  },
  {
    displayName: 'Schedule Options',
    name: 'scheduleOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['reporting'],
        operation: ['schedule'],
      },
    },
    options: [
      {
        displayName: 'Email Recipients',
        name: 'emailRecipients',
        type: 'string',
        default: '',
        description: 'Comma-separated email addresses',
      },
      {
        displayName: 'Format',
        name: 'format',
        type: 'options',
        default: 'csv',
        options: [
          { name: 'CSV', value: 'csv' },
          { name: 'JSON', value: 'json' },
          { name: 'PDF', value: 'pdf' },
        ],
        description: 'Report format',
      },
      {
        displayName: 'Webhook URL',
        name: 'webhookUrl',
        type: 'string',
        default: '',
        description: 'URL to receive report notifications',
      },
    ],
  },
];

export async function executeReportingOperation(
  this: IExecuteFunctions,
  operation: string,
  i: number,
): Promise<INodeExecutionData[]> {
  let responseData: IDataObject | IDataObject[];

  switch (operation) {
    case 'generate': {
      const reportType = this.getNodeParameter('reportType', i) as string;
      const generateOptions = this.getNodeParameter('generateOptions', i) as IDataObject;

      const body: IDataObject = {
        type: reportType,
      };

      if (generateOptions.startDate) body.start_date = generateOptions.startDate;
      if (generateOptions.endDate) body.end_date = generateOptions.endDate;
      if (generateOptions.format) body.format = generateOptions.format;
      if (generateOptions.accountId) body.account_id = generateOptions.accountId;
      if (generateOptions.entityId) body.entity_id = generateOptions.entityId;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: API_PATHS.REPORTS,
        body,
      })) as IDataObject;
      break;
    }

    case 'get': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: API_PATHS.REPORT(reportId),
      })) as IDataObject;
      break;
    }

    case 'list': {
      const filters = this.getNodeParameter('filters', i) as IDataObject;
      const query: Record<string, string | number | boolean | undefined> = {};

      if (filters.type) query.type = filters.type as string;
      if (filters.status) query.status = filters.status as string;

      const limit = (filters.limit as number) || 50;

      responseData = (await columnApiRequestAllItems.call(
        this,
        {
          method: 'GET',
          endpoint: API_PATHS.REPORTS,
          query,
        },
        limit,
      )) as IDataObject[];
      break;
    }

    case 'download': {
      const reportId = this.getNodeParameter('reportId', i) as string;
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.REPORT(reportId)}/download`,
      })) as IDataObject;
      break;
    }

    case 'getTypes': {
      responseData = (await columnApiRequest.call(this, {
        method: 'GET',
        endpoint: `${API_PATHS.REPORTS}/types`,
      })) as IDataObject;
      break;
    }

    case 'schedule': {
      const reportType = this.getNodeParameter('reportType', i) as string;
      const schedule = this.getNodeParameter('schedule', i) as string;
      const scheduleOptions = this.getNodeParameter('scheduleOptions', i) as IDataObject;

      const body: IDataObject = {
        type: reportType,
        schedule,
      };

      if (scheduleOptions.emailRecipients) {
        body.email_recipients = (scheduleOptions.emailRecipients as string).split(',').map((e) => e.trim());
      }
      if (scheduleOptions.format) body.format = scheduleOptions.format;
      if (scheduleOptions.webhookUrl) body.webhook_url = scheduleOptions.webhookUrl;

      responseData = (await columnApiRequest.call(this, {
        method: 'POST',
        endpoint: `${API_PATHS.REPORTS}/schedule`,
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
  return executeReportingOperation.call(this, operation, index);
}

export const operations = reportingOperations;
export const fields = reportingFields;
export const executeReporting = execute;
