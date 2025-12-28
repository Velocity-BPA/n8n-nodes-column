/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IHookFunctions,
	IDataObject,
} from 'n8n-workflow';

import { verifyWebhookSignature } from './utils/signatureUtils';
import { ALL_EVENT_TYPES } from './constants/eventTypes';

// Emit licensing notice once on module load
const licensingNoticeEmitted = false;
if (!licensingNoticeEmitted) {
	console.warn(
		'[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
		'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
		'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.'
	);
}

export class ColumnTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Column Trigger',
		name: 'columnTrigger',
		icon: 'file:column.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when Column events occur',
		defaults: {
			name: 'Column Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'columnApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				description: 'The events to listen for',
				options: [
					// Entity Events
					{
						name: 'Entity Created',
						value: 'entity.created',
					},
					{
						name: 'Entity Updated',
						value: 'entity.updated',
					},
					{
						name: 'Entity Archived',
						value: 'entity.archived',
					},
					{
						name: 'Verification Completed',
						value: 'entity.verification.completed',
					},
					{
						name: 'Verification Failed',
						value: 'entity.verification.failed',
					},
					// Account Events
					{
						name: 'Account Created',
						value: 'bank_account.created',
					},
					{
						name: 'Account Updated',
						value: 'bank_account.updated',
					},
					{
						name: 'Account Closed',
						value: 'bank_account.closed',
					},
					{
						name: 'Balance Changed',
						value: 'bank_account.balance.changed',
					},
					{
						name: 'Account Overdrawn',
						value: 'bank_account.overdrawn',
					},
					// ACH Events
					{
						name: 'ACH Created',
						value: 'ach_transfer.created',
					},
					{
						name: 'ACH Submitted',
						value: 'ach_transfer.submitted',
					},
					{
						name: 'ACH Completed',
						value: 'ach_transfer.completed',
					},
					{
						name: 'ACH Returned',
						value: 'ach_transfer.returned',
					},
					{
						name: 'ACH Canceled',
						value: 'ach_transfer.canceled',
					},
					{
						name: 'NOC Received',
						value: 'ach_transfer.noc_received',
					},
					// Wire Events
					{
						name: 'Wire Created',
						value: 'wire_transfer.created',
					},
					{
						name: 'Wire Submitted',
						value: 'wire_transfer.submitted',
					},
					{
						name: 'Wire Completed',
						value: 'wire_transfer.completed',
					},
					{
						name: 'Wire Returned',
						value: 'wire_transfer.returned',
					},
					{
						name: 'Wire Canceled',
						value: 'wire_transfer.canceled',
					},
					// Book Transfer Events
					{
						name: 'Book Transfer Created',
						value: 'book_transfer.created',
					},
					{
						name: 'Book Transfer Completed',
						value: 'book_transfer.completed',
					},
					// Check Events
					{
						name: 'Check Issued',
						value: 'check.issued',
					},
					{
						name: 'Check Mailed',
						value: 'check.mailed',
					},
					{
						name: 'Check Cashed',
						value: 'check.cashed',
					},
					{
						name: 'Check Voided',
						value: 'check.voided',
					},
					{
						name: 'Check Deposit Received',
						value: 'check.deposit.received',
					},
					{
						name: 'Check Deposit Cleared',
						value: 'check.deposit.cleared',
					},
					{
						name: 'Check Deposit Returned',
						value: 'check.deposit.returned',
					},
					// Card Events
					{
						name: 'Card Created',
						value: 'card.created',
					},
					{
						name: 'Card Activated',
						value: 'card.activated',
					},
					{
						name: 'Card Locked',
						value: 'card.locked',
					},
					{
						name: 'Card Unlocked',
						value: 'card.unlocked',
					},
					{
						name: 'Card Transaction',
						value: 'card.transaction',
					},
					// Loan Events
					{
						name: 'Loan Created',
						value: 'loan.created',
					},
					{
						name: 'Loan Funded',
						value: 'loan.funded',
					},
					{
						name: 'Loan Payment Received',
						value: 'loan.payment.received',
					},
					{
						name: 'Loan Payment Due',
						value: 'loan.payment.due',
					},
					{
						name: 'Loan Paid Off',
						value: 'loan.paid_off',
					},
					{
						name: 'Loan Delinquent',
						value: 'loan.delinquent',
					},
					// Transaction Events
					{
						name: 'Transaction Created',
						value: 'transaction.created',
					},
					{
						name: 'Transaction Posted',
						value: 'transaction.posted',
					},
					{
						name: 'Transaction Reversed',
						value: 'transaction.reversed',
					},
				],
			},
			{
				displayName: 'Verify Signature',
				name: 'verifySignature',
				type: 'boolean',
				default: true,
				description: 'Whether to verify the webhook signature using the webhook secret',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Include Raw Body',
						name: 'includeRawBody',
						type: 'boolean',
						default: false,
						description: 'Whether to include the raw request body in the output',
					},
					{
						displayName: 'Include Headers',
						name: 'includeHeaders',
						type: 'boolean',
						default: false,
						description: 'Whether to include the request headers in the output',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				
				// Check if we have stored webhook data
				if (webhookData.webhookId) {
					try {
						// Verify the webhook still exists in Column
						const { columnApiRequest } = await import('./transport/columnClient');
						await columnApiRequest.call(this as any, {
							method: 'GET',
							endpoint: `/webhooks/${webhookData.webhookId}`,
						});
						return true;
					} catch {
						// Webhook doesn't exist anymore
						delete webhookData.webhookId;
						return false;
					}
				}
				
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				try {
					const { columnApiRequest } = await import('./transport/columnClient');
					const webhook = (await columnApiRequest.call(this as any, {
						method: 'POST',
						endpoint: '/webhooks',
						body: {
							url: webhookUrl,
							events: events.length > 0 ? events : ['*'],
							enabled: true,
						},
					})) as { id: string };
					webhookData.webhookId = webhook.id;
					return true;
				} catch (error) {
					throw new Error(`Failed to create Column webhook: ${(error as Error).message}`);
				}
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						const { columnApiRequest } = await import('./transport/columnClient');
						await columnApiRequest.call(this as any, {
							method: 'DELETE',
							endpoint: `/webhooks/${webhookData.webhookId}`,
						});
					} catch (error) {
						// Webhook may have already been deleted
						console.warn(`Failed to delete Column webhook: ${(error as Error).message}`);
					}
					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const req = this.getRequestObject();
		const body = this.getBodyData();
		const verifySignature = this.getNodeParameter('verifySignature') as boolean;
		const options = this.getNodeParameter('options') as {
			includeRawBody?: boolean;
			includeHeaders?: boolean;
		};
		const events = this.getNodeParameter('events') as string[];

		// Verify webhook signature if enabled
		if (verifySignature) {
			const signature = req.headers['column-signature'] as string;
			const timestamp = req.headers['column-timestamp'] as string;
			
			if (!signature || !timestamp) {
				return {
					webhookResponse: {
						status: 401,
						body: { error: 'Missing signature or timestamp header' },
					},
				};
			}

			try {
				const credentials = await this.getCredentials('columnApi');
				const webhookSecret = credentials.webhookSecret as string;
				
				if (webhookSecret) {
					const rawBody = JSON.stringify(body);
					const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret, timestamp);
					
					if (!isValid) {
						return {
							webhookResponse: {
								status: 401,
								body: { error: 'Invalid webhook signature' },
							},
						};
					}
				}
			} catch (error) {
				console.warn('Could not verify webhook signature:', (error as Error).message);
			}
		}

		// Check if the event type matches our subscribed events
		const eventType = (body as { type?: string }).type;
		if (eventType && events.length > 0 && !events.includes(eventType) && !events.includes('*')) {
			// Event type doesn't match, but still acknowledge receipt
			return {
				webhookResponse: {
					status: 200,
					body: { received: true, processed: false },
				},
			};
		}

		// Build the output data
		const outputData: IDataObject = {
			event: body as IDataObject,
		};

		if (options.includeRawBody) {
			outputData.rawBody = JSON.stringify(body);
		}

		if (options.includeHeaders) {
			outputData.headers = req.headers as IDataObject;
		}

		return {
			workflowData: [
				[
					{
						json: outputData,
					},
				],
			],
		};
	}
}
