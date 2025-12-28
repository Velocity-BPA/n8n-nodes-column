/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Calculate monthly payment for a term loan (amortizing)
 * Uses the standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 *
 * @param principal - Loan principal amount
 * @param annualRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @param termMonths - Loan term in months
 * @returns Monthly payment amount
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }

  // Handle zero interest rate
  if (annualRate === 0) {
    return principal / termMonths;
  }

  const monthlyRate = annualRate / 12;
  const factor = Math.pow(1 + monthlyRate, termMonths);
  const payment = (principal * monthlyRate * factor) / (factor - 1);

  return Math.round(payment * 100) / 100;
}

/**
 * Calculate total interest paid over loan term
 */
export function calculateTotalInterest(
  principal: number,
  annualRate: number,
  termMonths: number,
): number {
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const totalPaid = monthlyPayment * termMonths;
  return Math.round((totalPaid - principal) * 100) / 100;
}

/**
 * Calculate loan payoff amount
 * @param currentBalance - Current principal balance
 * @param dailyRate - Daily interest rate as decimal
 * @param daysToPayoff - Number of days until payoff
 * @returns Payoff amount including accrued interest
 */
export function calculatePayoffAmount(
  currentBalance: number,
  dailyRate: number,
  daysToPayoff: number,
): number {
  const accruedInterest = currentBalance * dailyRate * daysToPayoff;
  return Math.round((currentBalance + accruedInterest) * 100) / 100;
}

/**
 * Calculate accrued interest
 * @param principal - Current principal balance
 * @param annualRate - Annual interest rate as decimal
 * @param days - Number of days to accrue
 * @returns Accrued interest amount
 */
export function calculateAccruedInterest(
  principal: number,
  annualRate: number,
  days: number,
): number {
  const dailyRate = annualRate / 365;
  return Math.round(principal * dailyRate * days * 100) / 100;
}

/**
 * Calculate APR (Annual Percentage Rate) including fees
 * This is a simplified calculation - actual APR calculation may vary
 */
export function calculateAPR(
  principal: number,
  annualRate: number,
  termMonths: number,
  fees: number,
): number {
  const effectivePrincipal = principal - fees;
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const totalPaid = monthlyPayment * termMonths;
  const totalInterest = totalPaid - principal + fees;

  // Simple APR approximation
  const averageBalance = principal / 2;
  const termYears = termMonths / 12;
  const apr = (totalInterest / averageBalance) / termYears;

  return Math.round(apr * 10000) / 10000;
}

/**
 * Calculate days past due
 */
export function calculateDaysPastDue(dueDate: Date): number {
  const now = new Date();
  const diff = now.getTime() - dueDate.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Determine loan delinquency status
 */
export function getDelinquencyStatus(daysPastDue: number): string {
  if (daysPastDue === 0) {
    return 'current';
  } else if (daysPastDue <= 30) {
    return 'delinquent_30';
  } else if (daysPastDue <= 60) {
    return 'delinquent_60';
  } else if (daysPastDue <= 90) {
    return 'delinquent_90';
  } else if (daysPastDue <= 120) {
    return 'delinquent_120';
  } else {
    return 'default';
  }
}

/**
 * Generate amortization schedule
 */
export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number,
): AmortizationRow[] {
  const schedule: AmortizationRow[] = [];
  const monthlyPayment = calculateMonthlyPayment(principal, annualRate, termMonths);
  const monthlyRate = annualRate / 12;

  let balance = principal;

  for (let period = 1; period <= termMonths; period++) {
    const interestPayment = Math.round(balance * monthlyRate * 100) / 100;
    const principalPayment = Math.min(
      Math.round((monthlyPayment - interestPayment) * 100) / 100,
      balance,
    );
    balance = Math.max(0, Math.round((balance - principalPayment) * 100) / 100);

    schedule.push({
      period,
      payment: period === termMonths ? principalPayment + interestPayment : monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance,
    });
  }

  return schedule;
}

/**
 * Calculate line of credit minimum payment
 * Typically: Greater of (interest + 1% of principal) or $25
 */
export function calculateMinimumPayment(
  balance: number,
  annualRate: number,
  minimumAmount = 25,
): number {
  if (balance <= 0) {
    return 0;
  }

  const monthlyInterest = (balance * annualRate) / 12;
  const principalPortion = balance * 0.01;
  const calculated = monthlyInterest + principalPortion;

  return Math.max(Math.round(calculated * 100) / 100, Math.min(minimumAmount, balance));
}

/**
 * Calculate available credit on a line of credit
 */
export function calculateAvailableCredit(creditLimit: number, currentBalance: number): number {
  return Math.max(0, creditLimit - currentBalance);
}

/**
 * Calculate credit utilization ratio
 */
export function calculateUtilization(currentBalance: number, creditLimit: number): number {
  if (creditLimit <= 0) {
    return 0;
  }
  return Math.round((currentBalance / creditLimit) * 10000) / 10000;
}

/**
 * Validate loan parameters
 */
export function validateLoanParameters(
  principal: number,
  annualRate: number,
  termMonths: number,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (principal <= 0) {
    errors.push('Principal must be greater than 0');
  }
  if (annualRate < 0 || annualRate > 1) {
    errors.push('Annual rate must be between 0 and 1 (0% to 100%)');
  }
  if (termMonths <= 0 || termMonths > 360) {
    errors.push('Term must be between 1 and 360 months');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
