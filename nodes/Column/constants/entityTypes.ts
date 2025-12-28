/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/**
 * Column Entity Types
 * An Entity in Column represents either a Person or Business that is a direct customer of the bank
 */

export const ENTITY_TYPES = {
  PERSON: 'person',
  BUSINESS: 'business',
} as const;

export type EntityType = (typeof ENTITY_TYPES)[keyof typeof ENTITY_TYPES];

/**
 * Entity Status Values
 */
export const ENTITY_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  ARCHIVED: 'archived',
  REJECTED: 'rejected',
} as const;

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

/**
 * Business Entity Types
 */
export const BUSINESS_TYPES = {
  SOLE_PROPRIETORSHIP: 'sole_proprietorship',
  PARTNERSHIP: 'partnership',
  LLC: 'llc',
  CORPORATION: 'corporation',
  S_CORPORATION: 's_corporation',
  C_CORPORATION: 'c_corporation',
  NONPROFIT: 'nonprofit',
  TRUST: 'trust',
  GOVERNMENT: 'government',
  OTHER: 'other',
} as const;

export type BusinessType = (typeof BUSINESS_TYPES)[keyof typeof BUSINESS_TYPES];

/**
 * Person Entity Roles
 */
export const PERSON_ROLES = {
  OWNER: 'owner',
  BENEFICIAL_OWNER: 'beneficial_owner',
  CONTROL_PERSON: 'control_person',
  AUTHORIZED_USER: 'authorized_user',
  DIRECTOR: 'director',
  OFFICER: 'officer',
} as const;

export type PersonRole = (typeof PERSON_ROLES)[keyof typeof PERSON_ROLES];

/**
 * ID Document Types
 */
export const ID_DOCUMENT_TYPES = {
  DRIVERS_LICENSE: 'drivers_license',
  PASSPORT: 'passport',
  STATE_ID: 'state_id',
  MILITARY_ID: 'military_id',
  PERMANENT_RESIDENT_CARD: 'permanent_resident_card',
} as const;

export type IdDocumentType = (typeof ID_DOCUMENT_TYPES)[keyof typeof ID_DOCUMENT_TYPES];

/**
 * Verification Status
 */
export const VERIFICATION_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PENDING_REVIEW: 'pending_review',
  VERIFIED: 'verified',
  FAILED: 'failed',
  REQUIRES_ACTION: 'requires_action',
} as const;

export type VerificationStatus = (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

/**
 * Verification Types
 */
export const VERIFICATION_TYPES = {
  KYC: 'kyc',
  KYB: 'kyb',
  ID_VERIFICATION: 'id_verification',
  ADDRESS_VERIFICATION: 'address_verification',
  SSN_VERIFICATION: 'ssn_verification',
  EIN_VERIFICATION: 'ein_verification',
  BENEFICIAL_OWNERSHIP: 'beneficial_ownership',
  DOCUMENT_VERIFICATION: 'document_verification',
} as const;

export type VerificationType = (typeof VERIFICATION_TYPES)[keyof typeof VERIFICATION_TYPES];

/**
 * Entity options for n8n dropdowns
 */
export const ENTITY_TYPE_OPTIONS = [
  { name: 'Person', value: 'person' },
  { name: 'Business', value: 'business' },
];

export const ENTITY_STATUS_OPTIONS = [
  { name: 'Pending', value: 'pending' },
  { name: 'Active', value: 'active' },
  { name: 'Suspended', value: 'suspended' },
  { name: 'Archived', value: 'archived' },
  { name: 'Rejected', value: 'rejected' },
];

export const BUSINESS_TYPE_OPTIONS = [
  { name: 'Sole Proprietorship', value: 'sole_proprietorship' },
  { name: 'Partnership', value: 'partnership' },
  { name: 'LLC', value: 'llc' },
  { name: 'Corporation', value: 'corporation' },
  { name: 'S Corporation', value: 's_corporation' },
  { name: 'C Corporation', value: 'c_corporation' },
  { name: 'Nonprofit', value: 'nonprofit' },
  { name: 'Trust', value: 'trust' },
  { name: 'Government', value: 'government' },
  { name: 'Other', value: 'other' },
];

export const VERIFICATION_STATUS_OPTIONS = [
  { name: 'Not Started', value: 'not_started' },
  { name: 'In Progress', value: 'in_progress' },
  { name: 'Pending Review', value: 'pending_review' },
  { name: 'Verified', value: 'verified' },
  { name: 'Failed', value: 'failed' },
  { name: 'Requires Action', value: 'requires_action' },
];

export const US_STATE_OPTIONS = [
  { name: 'Alabama', value: 'AL' },
  { name: 'Alaska', value: 'AK' },
  { name: 'Arizona', value: 'AZ' },
  { name: 'Arkansas', value: 'AR' },
  { name: 'California', value: 'CA' },
  { name: 'Colorado', value: 'CO' },
  { name: 'Connecticut', value: 'CT' },
  { name: 'Delaware', value: 'DE' },
  { name: 'Florida', value: 'FL' },
  { name: 'Georgia', value: 'GA' },
  { name: 'Hawaii', value: 'HI' },
  { name: 'Idaho', value: 'ID' },
  { name: 'Illinois', value: 'IL' },
  { name: 'Indiana', value: 'IN' },
  { name: 'Iowa', value: 'IA' },
  { name: 'Kansas', value: 'KS' },
  { name: 'Kentucky', value: 'KY' },
  { name: 'Louisiana', value: 'LA' },
  { name: 'Maine', value: 'ME' },
  { name: 'Maryland', value: 'MD' },
  { name: 'Massachusetts', value: 'MA' },
  { name: 'Michigan', value: 'MI' },
  { name: 'Minnesota', value: 'MN' },
  { name: 'Mississippi', value: 'MS' },
  { name: 'Missouri', value: 'MO' },
  { name: 'Montana', value: 'MT' },
  { name: 'Nebraska', value: 'NE' },
  { name: 'Nevada', value: 'NV' },
  { name: 'New Hampshire', value: 'NH' },
  { name: 'New Jersey', value: 'NJ' },
  { name: 'New Mexico', value: 'NM' },
  { name: 'New York', value: 'NY' },
  { name: 'North Carolina', value: 'NC' },
  { name: 'North Dakota', value: 'ND' },
  { name: 'Ohio', value: 'OH' },
  { name: 'Oklahoma', value: 'OK' },
  { name: 'Oregon', value: 'OR' },
  { name: 'Pennsylvania', value: 'PA' },
  { name: 'Rhode Island', value: 'RI' },
  { name: 'South Carolina', value: 'SC' },
  { name: 'South Dakota', value: 'SD' },
  { name: 'Tennessee', value: 'TN' },
  { name: 'Texas', value: 'TX' },
  { name: 'Utah', value: 'UT' },
  { name: 'Vermont', value: 'VT' },
  { name: 'Virginia', value: 'VA' },
  { name: 'Washington', value: 'WA' },
  { name: 'West Virginia', value: 'WV' },
  { name: 'Wisconsin', value: 'WI' },
  { name: 'Wyoming', value: 'WY' },
  { name: 'District of Columbia', value: 'DC' },
];
