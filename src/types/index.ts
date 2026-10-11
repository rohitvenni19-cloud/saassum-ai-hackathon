export type Stage =
  | 'ingest-and-profile'
  | 'ai-cleaning-copilot'
  | 'review-and-approval'
  | 'diff-and-export'
  | 'audit-and-judge-guide';

export interface CustomerRecord {
  id: string; // row id e.g. "001"
  customer_id: string; // e.g. "CUST-1049"
  full_name: string;
  email: string;
  phone_number: string;
  signup_date: string;
  city: string;
  account_tier: 'Free' | 'Pro' | 'Enterprise';
  annual_revenue: number | null | string;
  // flags
  has_duplicate_id?: boolean;
  has_whitespace_name?: boolean;
  has_uppercase_email?: boolean;
  has_unnormalized_phone?: boolean;
  has_unparsed_date?: boolean;
  has_unnormalized_city?: boolean;
  has_missing_revenue?: boolean;
  has_formula_injection?: boolean;
}

export interface ColumnProfile {
  name: string;
  inferredType: string;
  completeness: number; // 0 to 100
  validFormat: number; // 0 to 100
  topIssues: string;
  anomalyLevel: 'Low' | 'Medium' | 'High';
  quickAction: string;
  icon: string;
}

export interface CleaningOperation {
  id: number;
  func: string;
  columns: string[];
  parameters: Record<string, any>;
  affectedRecords: number;
  affectedPercentage: number;
  safetyRisk: 'Very Low' | 'Low' | 'Medium' | 'High';
  riskLabel: string;
  description: string;
  astSpec: string;
  status: 'pre_approved' | 'review_suggested' | 'flagged' | 'approved';
}

export interface DuplicatePair {
  id: string;
  clusterId: string;
  name: string;
  confidence: number;
  confidenceBadge: string;
  matchDetail: string;
  warningTriggered?: string;
  warningExplanation?: string;
  primaryRecord: {
    rowId: string;
    fullName: string;
    email: string;
    phone: string;
    city: string;
    signupDate: string;
    organization?: string;
    role?: string;
  };
  secondaryRecord: {
    rowId: string;
    fullName: string;
    cleanedName?: string;
    email: string;
    matchPct?: string;
    phone: string;
    phoneMatchNote?: string;
    city: string;
    cityAliasNote?: string;
    signupDate: string;
    organization?: string;
    role?: string;
  };
  resolutionStatus: 'pending' | 'merged' | 'distinct' | 'linked' | 'forced';
}

export interface QueuedTransformation {
  id: string;
  rowId: string;
  field: string;
  originalValue: string;
  proposedValue: string;
  reason: string;
  category: 'email' | 'date' | 'phone' | 'city' | 'revenue';
  state: 'APPROVED' | 'REVIEWING' | 'DISCARDED';
}

export interface DiffRow {
  rowNum: string;
  customerId: string;
  customerName: { original: string; repaired?: string; changed: boolean };
  email: { original: string; repaired?: string; changed: boolean };
  phone: { original: string; repaired?: string; changed: boolean };
  signupDate: { original: string; repaired?: string; changed: boolean };
  arr: string;
  isRetainedNull?: boolean;
  ruleName: string;
  ruleTooltip: string;
}

export interface DatasetMeta {
  filename: string;
  rowCount: number;
  columnCount: number;
  sizeKb: string;
  checksum: string;
  bufferStatus: string;
}
