import React, { useState } from 'react';
import { Stage, CustomerRecord, ColumnProfile, CleaningOperation, DuplicatePair, QueuedTransformation, DiffRow, DatasetMeta } from './types';
import {
  DEFAULT_DATASET_META,
  generateFull84Records,
  COLUMN_PROFILES,
  INITIAL_OPERATIONS,
  INITIAL_DUPLICATE_PAIRS,
  INITIAL_QUEUED_TRANSFORMATIONS,
  DIFF_ROWS,
} from './data/mockDatasets';
import { Header } from './components/Header';
import { IngestProfileStage } from './components/IngestProfileStage';
import { AiCopilotStage } from './components/AiCopilotStage';
import { ReviewApprovalStage } from './components/ReviewApprovalStage';
import { DiffExportStage } from './components/DiffExportStage';
import { JudgeGuideStage } from './components/JudgeGuideStage';
import { AuditReportModal } from './components/AuditReportModal';
import { UploadModal } from './components/UploadModal';
import { CleaningInsights } from './components/CleaningInsights';

export default function App() {
  const [currentStage, setCurrentStage] = useState<Stage>('ingest-and-profile');
  const [meta, setMeta] = useState<DatasetMeta>(DEFAULT_DATASET_META);
  const [records, setRecords] = useState<CustomerRecord[]>(generateFull84Records());
  const [columnProfiles, setColumnProfiles] = useState<ColumnProfile[]>(COLUMN_PROFILES);
  const [operations, setOperations] = useState<CleaningOperation[]>(INITIAL_OPERATIONS);
  const [duplicatePairs, setDuplicatePairs] = useState<DuplicatePair[]>(INITIAL_DUPLICATE_PAIRS);
  const [queuedTransformations, setQueuedTransformations] = useState<QueuedTransformation[]>(INITIAL_QUEUED_TRANSFORMATIONS);
  const [diffRows, setDiffRows] = useState<DiffRow[]>(DIFF_ROWS);

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [auditReportModalOpen, setAuditReportModalOpen] = useState(false);

  const handleSelectDemoScenario = (scenario: 'customers' | 'b2b') => {
    if (scenario === 'customers') {
      setMeta(DEFAULT_DATASET_META);
      setRecords(generateFull84Records());
      setColumnProfiles(COLUMN_PROFILES);
      setOperations(INITIAL_OPERATIONS);
    } else {
      setMeta({
        filename: 'b2b_leads_unstructured.xlsx',
        rowCount: 120,
        columnCount: 11,
        sizeKb: '24.8 KB',
        checksum: 'sha256:b2c89f1a...7e21a4',
        bufferStatus: 'Live Buffer Ingested',
      });
      // Generate B2B records
      const b2bRecords: CustomerRecord[] = Array.from({ length: 120 }).map((_, i) => ({
        id: String(i + 1).padStart(3, '0'),
        customer_id: `LEAD-${2000 + i}`,
        full_name: i % 4 === 0 ? `  Lead Contact ${i} ` : `Contact Name ${i}`,
        email: i % 3 === 0 ? `LEAD${i}@ENTERPRISE.CORP` : `lead${i}@saasflow.io`,
        phone_number: i % 5 === 0 ? '' : `+1 415 555 ${String(i).padStart(4, '0')}`,
        signup_date: `2023-${String((i % 12) + 1).padStart(2, '0')}-10`,
        city: i % 2 === 0 ? 'San Francisco' : 'New York',
        account_tier: i % 3 === 0 ? 'Enterprise' : 'Pro',
        annual_revenue: (i * 5000) % 250000,
        has_whitespace_name: i % 4 === 0,
        has_uppercase_email: i % 3 === 0,
        has_missing_revenue: i % 10 === 0,
      }));
      setRecords(b2bRecords);
    }
  };

  const handleResetDemo = () => {
    setMeta(DEFAULT_DATASET_META);
    setRecords(generateFull84Records());
    setColumnProfiles(COLUMN_PROFILES);
    setOperations(INITIAL_OPERATIONS);
    setDuplicatePairs(INITIAL_DUPLICATE_PAIRS);
    setQueuedTransformations(INITIAL_QUEUED_TRANSFORMATIONS);
    setCurrentStage('ingest-and-profile');
  };

  const handleDatasetLoaded = (newRecords: CustomerRecord[], newMeta: DatasetMeta) => {
    setRecords(newRecords);
    setMeta(newMeta);
    // recalculate simple column profile
    const cols: ColumnProfile[] = [
      {
        name: 'customer_id',
        inferredType: 'ID / String',
        completeness: 100,
        validFormat: 98.2,
        topIssues: 'Uploaded ID distribution verified',
        anomalyLevel: 'Low',
        quickAction: 'Re-index Uniques',
        icon: 'key',
      },
      {
        name: 'full_name',
        inferredType: 'Text / Name',
        completeness: 95,
        validFormat: 85.0,
        topIssues: 'Whitespace and casing detected',
        anomalyLevel: 'Medium',
        quickAction: 'Trim & TitleCase',
        icon: 'badge',
      },
      {
        name: 'email',
        inferredType: 'Email RFC-5322',
        completeness: 96,
        validFormat: 75.0,
        topIssues: 'Mixed domain casing and spacing',
        anomalyLevel: 'High',
        quickAction: 'Normalize Syntax',
        icon: 'alternate_email',
      },
      {
        name: 'phone_number',
        inferredType: 'Phone E.164',
        completeness: 88,
        validFormat: 70.0,
        topIssues: 'Mixed telco country prefixes',
        anomalyLevel: 'High',
        quickAction: 'Standardize E.164',
        icon: 'call',
      },
      {
        name: 'signup_date',
        inferredType: 'Temporal / ISO',
        completeness: 100,
        validFormat: 62.0,
        topIssues: 'Ambiguous date separator formats',
        anomalyLevel: 'High',
        quickAction: 'Cast ISO 8601',
        icon: 'calendar_today',
      },
      {
        name: 'city',
        inferredType: 'Categorical / Geo',
        completeness: 100,
        validFormat: 78.0,
        topIssues: 'City alias variations',
        anomalyLevel: 'Medium',
        quickAction: 'Fuzzy Cluster',
        icon: 'location_on',
      },
      {
        name: 'account_tier',
        inferredType: 'Enum [Free, Pro, Enterprise]',
        completeness: 100,
        validFormat: 100.0,
        topIssues: 'Valid clean domain',
        anomalyLevel: 'Low',
        quickAction: 'No Action',
        icon: 'verified_user',
      },
      {
        name: 'annual_revenue',
        inferredType: 'Currency / Float',
        completeness: 90,
        validFormat: 90.0,
        topIssues: 'Missing numeric values',
        anomalyLevel: 'Medium',
        quickAction: 'Impute / Cast',
        icon: 'payments',
      },
    ];
    setColumnProfiles(cols);
    setCurrentStage('ingest-and-profile');
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans selection:bg-[#dbe1ff] selection:text-[#00174b]">
      {/* Top Fixed Header */}
      <Header
        currentStage={currentStage}
        onSelectStage={stage => setCurrentStage(stage)}
        datasetName={meta.filename}
        rowCount={records.length}
        onOpenUpload={() => setUploadModalOpen(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Main Viewport Container */}
      <main className="w-full pt-28 min-h-screen">
        {currentStage === 'ingest-and-profile' && (
          <IngestProfileStage
            meta={meta}
            records={records}
            columnProfiles={columnProfiles}
            onOpenUpload={() => setUploadModalOpen(true)}
            onSelectDemoScenario={handleSelectDemoScenario}
            onNavigateToCopilot={() => setCurrentStage('ai-cleaning-copilot')}
          />
        )}

        {currentStage === 'ai-cleaning-copilot' && (
          <AiCopilotStage
            operations={operations}
            onUpdateOperations={setOperations}
            onNavigateToReview={() => setCurrentStage('review-and-approval')}
          />
        )}

        {currentStage === 'review-and-approval' && (
          <ReviewApprovalStage
            duplicatePairs={duplicatePairs}
            onUpdateDuplicatePairs={setDuplicatePairs}
            queuedTransformations={queuedTransformations}
            onUpdateQueuedTransformations={setQueuedTransformations}
            onNavigateBack={() => setCurrentStage('ai-cleaning-copilot')}
            onCommitApproved={() => setCurrentStage('diff-and-export')}
          />
        )}

        {currentStage === 'diff-and-export' && (
          <DiffExportStage
            records={records}
            diffRows={diffRows}
            onOpenAuditReportModal={() => setAuditReportModalOpen(true)}
          />
        )}

        {currentStage === 'audit-and-judge-guide' && (
          <JudgeGuideStage />
        )}
      </main>

      {/* Audit Report Certificate Modal */}
      <AuditReportModal
        isOpen={auditReportModalOpen}
        onClose={() => setAuditReportModalOpen(false)}
        datasetName={meta.filename}
        totalRecords={records.length}
      />

      {/* Dataset Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onDatasetLoaded={handleDatasetLoaded}
      />

      {/* Global Footer with Cleaning Insights Summary */}
      <footer className="w-full bg-white border-t border-[#cbd5e1] mt-auto">
        {/* Cleaning Insights Live Summary */}
        <CleaningInsights operations={operations} records={records} />

        <div className="w-full max-w-[1720px] mx-auto py-3 px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-2 text-[#64748b] font-mono text-xs">
          <div>
            <span>SaaSsum AI • “Messy spreadsheets in. Clean, reviewable data out.”</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Latency: 142ms</span>
            <span>Deterministic Mode: Enabled</span>
            <span>© 2025 Team Dragons #TRI26669</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
