/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	verifyWebhookSignature,
	generateWebhookSignature,
	parseSignatureHeader,
	buildSignatureHeader,
	isValidWebhookPayload,
	getEventType,
	eventMatchesFilter,
} from '../../nodes/Column/utils/signatureUtils';

describe('Signature Utils', () => {
	const testSecret = 'whsec_test123456789';
	const testPayload = JSON.stringify({ type: 'test.event', data: { id: '123' } });

	describe('generateWebhookSignature', () => {
		it('should generate a signature', () => {
			const timestamp = Math.floor(Date.now() / 1000).toString();
			const signature = generateWebhookSignature(testPayload, testSecret, timestamp);
			expect(signature).toBeTruthy();
			expect(typeof signature).toBe('string');
		});

		it('should generate consistent signatures', () => {
			const timestamp = '1234567890';
			const sig1 = generateWebhookSignature(testPayload, testSecret, timestamp);
			const sig2 = generateWebhookSignature(testPayload, testSecret, timestamp);
			expect(sig1).toBe(sig2);
		});

		it('should generate different signatures for different payloads', () => {
			const timestamp = '1234567890';
			const sig1 = generateWebhookSignature(testPayload, testSecret, timestamp);
			const sig2 = generateWebhookSignature('{"different": true}', testSecret, timestamp);
			expect(sig1).not.toBe(sig2);
		});
	});

	describe('verifyWebhookSignature', () => {
		it('should verify valid signature', () => {
			const timestamp = Math.floor(Date.now() / 1000).toString();
			const signature = generateWebhookSignature(testPayload, testSecret, timestamp);
			const isValid = verifyWebhookSignature(testPayload, signature, testSecret, timestamp);
			expect(isValid).toBe(true);
		});

		it('should reject invalid signature', () => {
			const timestamp = Math.floor(Date.now() / 1000).toString();
			const isValid = verifyWebhookSignature(testPayload, 'invalid_signature', testSecret, timestamp);
			expect(isValid).toBe(false);
		});

		it('should reject old timestamps', () => {
			const oldTimestamp = (Math.floor(Date.now() / 1000) - 400).toString(); // 400 seconds ago
			const signature = generateWebhookSignature(testPayload, testSecret, oldTimestamp);
			const isValid = verifyWebhookSignature(testPayload, signature, testSecret, oldTimestamp);
			expect(isValid).toBe(false);
		});
	});

	describe('parseSignatureHeader', () => {
		it('should parse signature header correctly', () => {
			const header = 'v1=abc123,t=1234567890';
			const parsed = parseSignatureHeader(header);
			expect(parsed.version).toBe('v1');
			expect(parsed.signature).toBe('abc123');
			expect(parsed.timestamp).toBe('1234567890');
		});

		it('should handle simple signature format', () => {
			const header = 'abc123';
			const parsed = parseSignatureHeader(header);
			expect(parsed.signature).toBe('abc123');
		});
	});

	describe('buildSignatureHeader', () => {
		it('should build signature header correctly', () => {
			const header = buildSignatureHeader('abc123', '1234567890');
			expect(header).toContain('v1=abc123');
			expect(header).toContain('t=1234567890');
		});
	});

	describe('isValidWebhookPayload', () => {
		it('should validate correct payload', () => {
			const payload = { type: 'test.event', data: { id: '123' } };
			expect(isValidWebhookPayload(payload)).toBe(true);
		});

		it('should reject payload without type', () => {
			const payload = { data: { id: '123' } };
			expect(isValidWebhookPayload(payload)).toBe(false);
		});

		it('should reject non-object payload', () => {
			expect(isValidWebhookPayload('string')).toBe(false);
			expect(isValidWebhookPayload(null)).toBe(false);
			expect(isValidWebhookPayload(undefined)).toBe(false);
		});
	});

	describe('getEventType', () => {
		it('should extract event type from payload', () => {
			const payload = { type: 'entity.created', data: {} };
			expect(getEventType(payload)).toBe('entity.created');
		});

		it('should return null for invalid payload', () => {
			expect(getEventType({})).toBeNull();
			expect(getEventType(null)).toBeNull();
		});
	});

	describe('eventMatchesFilter', () => {
		it('should match exact event type', () => {
			expect(eventMatchesFilter('entity.created', ['entity.created'])).toBe(true);
		});

		it('should match wildcard filter', () => {
			expect(eventMatchesFilter('entity.created', ['entity.*'])).toBe(true);
			expect(eventMatchesFilter('entity.updated', ['entity.*'])).toBe(true);
		});

		it('should match global wildcard', () => {
			expect(eventMatchesFilter('anything.here', ['*'])).toBe(true);
		});

		it('should not match different event types', () => {
			expect(eventMatchesFilter('entity.created', ['account.created'])).toBe(false);
		});

		it('should match if any filter matches', () => {
			expect(eventMatchesFilter('entity.created', ['account.created', 'entity.created'])).toBe(true);
		});

		it('should return true for empty filter (allow all)', () => {
			expect(eventMatchesFilter('anything', [])).toBe(true);
		});
	});
});
