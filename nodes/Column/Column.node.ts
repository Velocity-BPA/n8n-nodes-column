/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
} from 'n8n-workflow';

// Import operations and fields from each resource
import { entityOperations, entityFields, executeEntity } from './actions/entity/entity';
import { bankAccountOperations, bankAccountFields, executeBankAccount } from './actions/bankAccount/bankAccount';
import { achTransferOperations, achTransferFields, executeAchTransfer } from './actions/achTransfer/achTransfer';
import { wireTransferOperations, wireTransferFields, executeWireTransfer } from './actions/wireTransfer/wireTransfer';
import { bookTransferOperations, bookTransferFields, executeBookTransfer } from './actions/bookTransfer/bookTransfer';
import { checkOperations, checkFields, executeCheck } from './actions/check/check';
import { counterpartyOperations, counterpartyFields, executeCounterparty } from './actions/counterparty/counterparty';
import { transactionOperations, transactionFields, executeTransaction } from './actions/transaction/transaction';
import { loanOperations, loanFields, executeLoan } from './actions/loan/loan';
import { lineOfCreditOperations, lineOfCreditFields, executeLineOfCredit } from './actions/lineOfCredit/lineOfCredit';
import { interestOperations, interestFields, executeInterest } from './actions/interest/interest';
import { cardOperations, cardFields, executeCard } from './actions/card/card';
import { statementOperations, statementFields, executeStatement } from './actions/statement/statement';
import { documentOperations, documentFields, executeDocument } from './actions/document/document';
import { verificationOperations, verificationFields, executeVerification } from './actions/verification/verification';
import { platformOperations, platformFields, executePlatform } from './actions/platform/platform';
import { reportingOperations, reportingFields, executeReporting } from './actions/reporting/reporting';
import { webhookOperations, webhookFields, executeWebhook } from './actions/webhook/webhook';
import { eventOperations, eventFields, executeEvent } from './actions/event/event';
import { holdOperations, holdFields, executeHold } from './actions/hold/hold';
import { feeOperations, feeFields, executeFee } from './actions/fee/fee';
import { sandboxOperations, sandboxFields, executeSandbox } from './actions/sandbox/sandbox';
import { utilityOperations, utilityFields, executeUtility } from './actions/utility/utility';

// Emit licensing notice once on module load
const licensingNoticeEmitted = false;
if (!licensingNoticeEmitted) {
	console.warn(
		'[Velocity BPA Licensing Notice] This n8n node is licensed under the Business Source License 1.1 (BSL 1.1). ' +
		'Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA. ' +
		'For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.'
	);
}

export class Column implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Column',
		name: 'column',
		icon: 'file:column.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Banking-as-a-Service platform for fintech applications',
		defaults: {
			name: 'Column',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'columnApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'ACH Transfer',
						value: 'achTransfer',
						description: 'Manage ACH transfers through the Automated Clearing House network',
					},
					{
						name: 'Bank Account',
						value: 'bankAccount',
						description: 'Manage bank accounts for entities',
					},
					{
						name: 'Book Transfer',
						value: 'bookTransfer',
						description: 'Transfer funds between Column accounts instantly',
					},
					{
						name: 'Card',
						value: 'card',
						description: 'Issue and manage debit cards',
					},
					{
						name: 'Check',
						value: 'check',
						description: 'Issue checks and process check deposits',
					},
					{
						name: 'Counterparty',
						value: 'counterparty',
						description: 'Manage external parties for transfers',
					},
					{
						name: 'Document',
						value: 'document',
						description: 'Upload and manage documents for verification',
					},
					{
						name: 'Entity',
						value: 'entity',
						description: 'Manage person and business entities',
					},
					{
						name: 'Event',
						value: 'event',
						description: 'View platform events and activity',
					},
					{
						name: 'Fee',
						value: 'fee',
						description: 'Manage account fees',
					},
					{
						name: 'Hold',
						value: 'hold',
						description: 'Manage balance holds on accounts',
					},
					{
						name: 'Interest',
						value: 'interest',
						description: 'Manage interest rates and accruals',
					},
					{
						name: 'Line of Credit',
						value: 'lineOfCredit',
						description: 'Manage revolving credit lines',
					},
					{
						name: 'Loan',
						value: 'loan',
						description: 'Originate and manage loans',
					},
					{
						name: 'Platform',
						value: 'platform',
						description: 'Access platform-level information',
					},
					{
						name: 'Reporting',
						value: 'reporting',
						description: 'Generate and manage reports',
					},
					{
						name: 'Sandbox',
						value: 'sandbox',
						description: 'Test operations in sandbox environment',
					},
					{
						name: 'Statement',
						value: 'statement',
						description: 'Generate and retrieve account statements',
					},
					{
						name: 'Transaction',
						value: 'transaction',
						description: 'View and search transactions',
					},
					{
						name: 'Utility',
						value: 'utility',
						description: 'Utility operations like validation and status checks',
					},
					{
						name: 'Verification',
						value: 'verification',
						description: 'Manage KYC/KYB verification processes',
					},
					{
						name: 'Webhook',
						value: 'webhook',
						description: 'Manage webhook subscriptions',
					},
					{
						name: 'Wire Transfer',
						value: 'wireTransfer',
						description: 'Send domestic and international wire transfers',
					},
				],
				default: 'entity',
			},
			// Operations for each resource
			...entityOperations,
			...bankAccountOperations,
			...achTransferOperations,
			...wireTransferOperations,
			...bookTransferOperations,
			...checkOperations,
			...counterpartyOperations,
			...transactionOperations,
			...loanOperations,
			...lineOfCreditOperations,
			...interestOperations,
			...cardOperations,
			...statementOperations,
			...documentOperations,
			...verificationOperations,
			...platformOperations,
			...reportingOperations,
			...webhookOperations,
			...eventOperations,
			...holdOperations,
			...feeOperations,
			...sandboxOperations,
			...utilityOperations,
			// Fields for each resource
			...entityFields,
			...bankAccountFields,
			...achTransferFields,
			...wireTransferFields,
			...bookTransferFields,
			...checkFields,
			...counterpartyFields,
			...transactionFields,
			...loanFields,
			...lineOfCreditFields,
			...interestFields,
			...cardFields,
			...statementFields,
			...documentFields,
			...verificationFields,
			...platformFields,
			...reportingFields,
			...webhookFields,
			...eventFields,
			...holdFields,
			...feeFields,
			...sandboxFields,
			...utilityFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let result: INodeExecutionData[];

				switch (resource) {
					case 'entity':
						result = await executeEntity.call(this, i);
						break;
					case 'bankAccount':
						result = await executeBankAccount.call(this, i);
						break;
					case 'achTransfer':
						result = await executeAchTransfer.call(this, i);
						break;
					case 'wireTransfer':
						result = await executeWireTransfer.call(this, i);
						break;
					case 'bookTransfer':
						result = await executeBookTransfer.call(this, i);
						break;
					case 'check':
						result = await executeCheck.call(this, i);
						break;
					case 'counterparty':
						result = await executeCounterparty.call(this, i);
						break;
					case 'transaction':
						result = await executeTransaction.call(this, i);
						break;
					case 'loan':
						result = await executeLoan.call(this, i);
						break;
					case 'lineOfCredit':
						result = await executeLineOfCredit.call(this, i);
						break;
					case 'interest':
						result = await executeInterest.call(this, i);
						break;
					case 'card':
						result = await executeCard.call(this, i);
						break;
					case 'statement':
						result = await executeStatement.call(this, i);
						break;
					case 'document':
						result = await executeDocument.call(this, i);
						break;
					case 'verification':
						result = await executeVerification.call(this, i);
						break;
					case 'platform':
						result = await executePlatform.call(this, i);
						break;
					case 'reporting':
						result = await executeReporting.call(this, i);
						break;
					case 'webhook':
						result = await executeWebhook.call(this, i);
						break;
					case 'event':
						result = await executeEvent.call(this, i);
						break;
					case 'hold':
						result = await executeHold.call(this, i);
						break;
					case 'fee':
						result = await executeFee.call(this, i);
						break;
					case 'sandbox':
						result = await executeSandbox.call(this, i);
						break;
					case 'utility':
						result = await executeUtility.call(this, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				returnData.push(...result);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
