/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	calculateMonthlyPayment,
	calculateTotalInterest,
	calculatePayoffAmount,
	calculateAccruedInterest,
	calculateAPR,
	calculateDaysPastDue,
	getDelinquencyStatus,
	generateAmortizationSchedule,
	calculateMinimumPayment,
	calculateAvailableCredit,
	calculateUtilization,
	validateLoanParameters,
} from '../../nodes/Column/utils/loanUtils';

describe('Loan Utils', () => {
	describe('calculateMonthlyPayment', () => {
		it('should calculate monthly payment correctly', () => {
			// $10,000 loan at 5% for 12 months
			const payment = calculateMonthlyPayment(10000, 5, 12);
			expect(payment).toBeCloseTo(856.07, 2);
		});

		it('should handle 0% interest rate', () => {
			const payment = calculateMonthlyPayment(10000, 0, 12);
			expect(payment).toBeCloseTo(833.33, 2);
		});

		it('should handle larger loans', () => {
			// $100,000 loan at 6% for 360 months (30 years)
			const payment = calculateMonthlyPayment(100000, 6, 360);
			expect(payment).toBeCloseTo(599.55, 2);
		});
	});

	describe('calculateTotalInterest', () => {
		it('should calculate total interest correctly', () => {
			// $10,000 loan at 5% for 12 months
			const interest = calculateTotalInterest(10000, 5, 12);
			expect(interest).toBeGreaterThan(0);
			expect(interest).toBeLessThan(10000);
		});
	});

	describe('calculatePayoffAmount', () => {
		it('should calculate payoff amount correctly', () => {
			// Full balance with no payments made
			const payoff = calculatePayoffAmount(10000, 5, 0, 12);
			expect(payoff).toBeGreaterThan(10000);
		});

		it('should decrease with payments', () => {
			const payoff6 = calculatePayoffAmount(10000, 5, 6, 12);
			const payoff12 = calculatePayoffAmount(10000, 5, 11, 12);
			expect(payoff12).toBeLessThan(payoff6);
		});
	});

	describe('calculateAccruedInterest', () => {
		it('should calculate daily interest correctly', () => {
			const interest = calculateAccruedInterest(10000, 5, 30);
			expect(interest).toBeGreaterThan(0);
			expect(interest).toBeCloseTo(41.10, 0);
		});

		it('should return 0 for 0 days', () => {
			const interest = calculateAccruedInterest(10000, 5, 0);
			expect(interest).toBe(0);
		});
	});

	describe('calculateAPR', () => {
		it('should calculate APR with fees', () => {
			const apr = calculateAPR(10000, 5, 12, 500);
			expect(apr).toBeGreaterThan(5);
		});

		it('should equal interest rate with no fees', () => {
			const apr = calculateAPR(10000, 5, 12, 0);
			expect(apr).toBeCloseTo(5, 0);
		});
	});

	describe('calculateDaysPastDue', () => {
		it('should calculate days past due correctly', () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 10);
			const days = calculateDaysPastDue(pastDate.toISOString());
			expect(days).toBe(10);
		});

		it('should return 0 for future dates', () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 10);
			const days = calculateDaysPastDue(futureDate.toISOString());
			expect(days).toBe(0);
		});
	});

	describe('getDelinquencyStatus', () => {
		it('should return current for 0 days', () => {
			expect(getDelinquencyStatus(0)).toBe('current');
		});

		it('should return grace for 1-15 days', () => {
			expect(getDelinquencyStatus(10)).toBe('grace');
		});

		it('should return delinquent_30 for 16-30 days', () => {
			expect(getDelinquencyStatus(25)).toBe('delinquent_30');
		});

		it('should return delinquent_60 for 31-60 days', () => {
			expect(getDelinquencyStatus(45)).toBe('delinquent_60');
		});

		it('should return delinquent_90 for 61-90 days', () => {
			expect(getDelinquencyStatus(75)).toBe('delinquent_90');
		});

		it('should return charge_off for 90+ days', () => {
			expect(getDelinquencyStatus(100)).toBe('charge_off');
		});
	});

	describe('generateAmortizationSchedule', () => {
		it('should generate correct number of payments', () => {
			const schedule = generateAmortizationSchedule(10000, 5, 12);
			expect(schedule.length).toBe(12);
		});

		it('should have decreasing balance', () => {
			const schedule = generateAmortizationSchedule(10000, 5, 12);
			for (let i = 1; i < schedule.length; i++) {
				expect(schedule[i].balance).toBeLessThan(schedule[i - 1].balance);
			}
		});

		it('should end with zero balance', () => {
			const schedule = generateAmortizationSchedule(10000, 5, 12);
			const lastPayment = schedule[schedule.length - 1];
			expect(lastPayment.balance).toBeCloseTo(0, 0);
		});
	});

	describe('calculateMinimumPayment', () => {
		it('should calculate minimum payment correctly', () => {
			const minPayment = calculateMinimumPayment(10000, 2);
			expect(minPayment).toBe(200);
		});

		it('should respect minimum floor', () => {
			const minPayment = calculateMinimumPayment(100, 2, 25);
			expect(minPayment).toBe(25);
		});
	});

	describe('calculateAvailableCredit', () => {
		it('should calculate available credit correctly', () => {
			const available = calculateAvailableCredit(10000, 3000);
			expect(available).toBe(7000);
		});

		it('should return 0 when fully utilized', () => {
			const available = calculateAvailableCredit(10000, 10000);
			expect(available).toBe(0);
		});

		it('should handle over-limit', () => {
			const available = calculateAvailableCredit(10000, 12000);
			expect(available).toBe(0);
		});
	});

	describe('calculateUtilization', () => {
		it('should calculate utilization percentage correctly', () => {
			const utilization = calculateUtilization(10000, 3000);
			expect(utilization).toBe(30);
		});

		it('should handle 0 balance', () => {
			const utilization = calculateUtilization(10000, 0);
			expect(utilization).toBe(0);
		});

		it('should cap at 100%', () => {
			const utilization = calculateUtilization(10000, 15000);
			expect(utilization).toBe(150);
		});
	});

	describe('validateLoanParameters', () => {
		it('should validate correct parameters', () => {
			const result = validateLoanParameters(10000, 5, 12);
			expect(result.valid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should reject negative principal', () => {
			const result = validateLoanParameters(-10000, 5, 12);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should reject negative interest rate', () => {
			const result = validateLoanParameters(10000, -5, 12);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it('should reject 0 term', () => {
			const result = validateLoanParameters(10000, 5, 0);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});
	});
});
