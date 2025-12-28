/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	isValidRoutingNumber,
	isValidAccountNumber,
	isValidAmount,
	amountToCents,
	centsToAmount,
	isValidEmail,
	isValidPhoneNumber,
	formatPhoneE164,
	isValidSSN,
	formatSSN,
	isValidEIN,
	formatEIN,
	isValidDateOfBirth,
	isValidStateCode,
	isValidZipCode,
	generateIdempotencyKey,
} from '../../nodes/Column/utils/validationUtils';

describe('Validation Utils', () => {
	describe('isValidRoutingNumber', () => {
		it('should validate correct routing numbers', () => {
			// Bank of America
			expect(isValidRoutingNumber('026009593')).toBe(true);
			// Chase
			expect(isValidRoutingNumber('021000021')).toBe(true);
			// Wells Fargo
			expect(isValidRoutingNumber('121000248')).toBe(true);
		});

		it('should reject invalid routing numbers', () => {
			expect(isValidRoutingNumber('123456789')).toBe(false);
			expect(isValidRoutingNumber('12345678')).toBe(false);
			expect(isValidRoutingNumber('1234567890')).toBe(false);
			expect(isValidRoutingNumber('abcdefghi')).toBe(false);
			expect(isValidRoutingNumber('')).toBe(false);
		});
	});

	describe('isValidAccountNumber', () => {
		it('should validate correct account numbers', () => {
			expect(isValidAccountNumber('1234567890')).toBe(true);
			expect(isValidAccountNumber('1234')).toBe(true);
			expect(isValidAccountNumber('12345678901234567')).toBe(true);
		});

		it('should reject invalid account numbers', () => {
			expect(isValidAccountNumber('123')).toBe(false);
			expect(isValidAccountNumber('123456789012345678')).toBe(false);
			expect(isValidAccountNumber('abcdefgh')).toBe(false);
			expect(isValidAccountNumber('')).toBe(false);
		});
	});

	describe('isValidAmount', () => {
		it('should validate positive amounts', () => {
			expect(isValidAmount(100)).toBe(true);
			expect(isValidAmount(1)).toBe(true);
			expect(isValidAmount(1000000)).toBe(true);
		});

		it('should reject invalid amounts', () => {
			expect(isValidAmount(0)).toBe(false);
			expect(isValidAmount(-100)).toBe(false);
			expect(isValidAmount(NaN)).toBe(false);
		});
	});

	describe('amountToCents', () => {
		it('should convert dollars to cents', () => {
			expect(amountToCents(1)).toBe(100);
			expect(amountToCents(10.50)).toBe(1050);
			expect(amountToCents(99.99)).toBe(9999);
			expect(amountToCents(0.01)).toBe(1);
		});
	});

	describe('centsToAmount', () => {
		it('should convert cents to dollars', () => {
			expect(centsToAmount(100)).toBe(1);
			expect(centsToAmount(1050)).toBe(10.50);
			expect(centsToAmount(9999)).toBe(99.99);
			expect(centsToAmount(1)).toBe(0.01);
		});
	});

	describe('isValidEmail', () => {
		it('should validate correct email addresses', () => {
			expect(isValidEmail('test@example.com')).toBe(true);
			expect(isValidEmail('user.name@domain.org')).toBe(true);
			expect(isValidEmail('user+tag@subdomain.domain.com')).toBe(true);
		});

		it('should reject invalid email addresses', () => {
			expect(isValidEmail('invalid')).toBe(false);
			expect(isValidEmail('invalid@')).toBe(false);
			expect(isValidEmail('@domain.com')).toBe(false);
			expect(isValidEmail('')).toBe(false);
		});
	});

	describe('isValidPhoneNumber', () => {
		it('should validate US phone numbers', () => {
			expect(isValidPhoneNumber('4155551234')).toBe(true);
			expect(isValidPhoneNumber('14155551234')).toBe(true);
			expect(isValidPhoneNumber('+14155551234')).toBe(true);
			expect(isValidPhoneNumber('415-555-1234')).toBe(true);
			expect(isValidPhoneNumber('(415) 555-1234')).toBe(true);
		});

		it('should reject invalid phone numbers', () => {
			expect(isValidPhoneNumber('123')).toBe(false);
			expect(isValidPhoneNumber('abcdefghij')).toBe(false);
			expect(isValidPhoneNumber('')).toBe(false);
		});
	});

	describe('formatPhoneE164', () => {
		it('should format phone numbers to E.164', () => {
			expect(formatPhoneE164('4155551234')).toBe('+14155551234');
			expect(formatPhoneE164('14155551234')).toBe('+14155551234');
			expect(formatPhoneE164('+14155551234')).toBe('+14155551234');
			expect(formatPhoneE164('415-555-1234')).toBe('+14155551234');
		});
	});

	describe('isValidSSN', () => {
		it('should validate SSN formats', () => {
			expect(isValidSSN('123-45-6789')).toBe(true);
			expect(isValidSSN('123456789')).toBe(true);
		});

		it('should reject invalid SSNs', () => {
			expect(isValidSSN('000-00-0000')).toBe(false);
			expect(isValidSSN('123-45-678')).toBe(false);
			expect(isValidSSN('12345678')).toBe(false);
			expect(isValidSSN('')).toBe(false);
		});
	});

	describe('formatSSN', () => {
		it('should format SSN with dashes', () => {
			expect(formatSSN('123456789')).toBe('123-45-6789');
			expect(formatSSN('123-45-6789')).toBe('123-45-6789');
		});
	});

	describe('isValidEIN', () => {
		it('should validate EIN formats', () => {
			expect(isValidEIN('12-3456789')).toBe(true);
			expect(isValidEIN('123456789')).toBe(true);
		});

		it('should reject invalid EINs', () => {
			expect(isValidEIN('12-345678')).toBe(false);
			expect(isValidEIN('1234567890')).toBe(false);
			expect(isValidEIN('')).toBe(false);
		});
	});

	describe('formatEIN', () => {
		it('should format EIN with dash', () => {
			expect(formatEIN('123456789')).toBe('12-3456789');
			expect(formatEIN('12-3456789')).toBe('12-3456789');
		});
	});

	describe('isValidDateOfBirth', () => {
		it('should validate dates of birth', () => {
			expect(isValidDateOfBirth('1990-01-15')).toBe(true);
			expect(isValidDateOfBirth('1950-12-31')).toBe(true);
		});

		it('should reject invalid dates of birth', () => {
			expect(isValidDateOfBirth('2025-01-01')).toBe(false); // Future date
			expect(isValidDateOfBirth('1800-01-01')).toBe(false); // Too old
			expect(isValidDateOfBirth('invalid')).toBe(false);
			expect(isValidDateOfBirth('')).toBe(false);
		});
	});

	describe('isValidStateCode', () => {
		it('should validate US state codes', () => {
			expect(isValidStateCode('CA')).toBe(true);
			expect(isValidStateCode('NY')).toBe(true);
			expect(isValidStateCode('TX')).toBe(true);
		});

		it('should reject invalid state codes', () => {
			expect(isValidStateCode('XX')).toBe(false);
			expect(isValidStateCode('California')).toBe(false);
			expect(isValidStateCode('')).toBe(false);
		});
	});

	describe('isValidZipCode', () => {
		it('should validate US zip codes', () => {
			expect(isValidZipCode('94102')).toBe(true);
			expect(isValidZipCode('94102-1234')).toBe(true);
		});

		it('should reject invalid zip codes', () => {
			expect(isValidZipCode('9410')).toBe(false);
			expect(isValidZipCode('941021234')).toBe(false);
			expect(isValidZipCode('')).toBe(false);
		});
	});

	describe('generateIdempotencyKey', () => {
		it('should generate unique keys', () => {
			const key1 = generateIdempotencyKey();
			const key2 = generateIdempotencyKey();
			expect(key1).not.toBe(key2);
		});

		it('should generate keys with correct format', () => {
			const key = generateIdempotencyKey();
			expect(key).toMatch(/^[a-f0-9-]{36}$/);
		});
	});
});
