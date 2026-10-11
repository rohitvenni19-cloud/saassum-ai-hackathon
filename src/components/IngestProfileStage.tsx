import React, { useState } from 'react';
import { CustomerRecord, ColumnProfile, DatasetMeta } from '../types';

interface IngestProfileStageProps {
  meta: DatasetMeta;
  records: CustomerRecord[];
  columnProfiles: ColumnProfile[];
  onOpenUpload: () => void;
  onSelectDemoScenario: (scenario: 'customers' | 'b2b') => void;
  onNavigateToCopilot: () => void;
}

export const IngestProfileStage: React.FC<IngestProfileStageProps> = ({
  meta,
  records,
  columnProfiles,
  onOpenUpload,
  onSelectDemoScenario,
  onNavigateToCopilot,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);

  const pageSize = 7;
  const totalPages = Math.ceil(records.length / pageSize);
  const paginatedRecords = records.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const filteredColumns = columnProfiles.filter(col =>
    col.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
    col.inferredType.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleQuickAction = (action: string, colName: string) => {
    setQuickActionNotice(`Staged "${action}" for column "${colName}". Proceeding to Copilot will compile this operation.`);
    setTimeout(() => {
      setQuickActionNotice(null);
    }, 3500);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-[1720px] mx-auto w-full">
      {/* Toast Notification */}
      {quickActionNotice && (
        <div className="bg-[#004ac6] text-white px-4 py-2.5 rounded-lg text-sm shadow-lg flex items-center justify-between gap-3 animate-fade-in fixed bottom-24 right-8 z-50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">info</span>
            <span>{quickActionNotice}</span>
          </div>
          <button onClick={() => setQuickActionNotice(null)} className="text-white/80 hover:text-white">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Ingestion Hub Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-5 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-5">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-[#eff4ff] flex items-center justify-center shrink-0 border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-[#004ac6] text-[32px]">dataset</span>
          </div>
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-lg text-[#0b1c30] truncate">{meta.filename}</span>
              <span className="font-mono text-xs uppercase bg-[#6ffbbe]/40 text-[#005236] px-2.5 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#007d55] animate-ping"></span>
                {meta.bufferStatus}
              </span>
              <span className="font-mono text-xs bg-[#dce9ff] text-[#0b1c30] px-2 py-0.5 rounded">CSV (UTF-8)</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs text-[#64748b]">
              <span>Rows: <strong className="text-[#0b1c30] font-semibold">{meta.rowCount} records</strong></span>
              <span>•</span>
              <span>Columns: <strong className="text-[#0b1c30] font-semibold">{meta.columnCount} attributes</strong></span>
              <span>•</span>
              <span>Size: <strong className="text-[#0b1c30] font-semibold">{meta.sizeKb}</strong></span>
              <span>•</span>
              <span>Checksum: <span className="text-[#004ac6] font-mono">{meta.checksum}</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end xl:self-center">
          <button
            onClick={onOpenUpload}
            className="px-4 py-2 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0b1c30] rounded-lg text-sm font-medium flex items-center gap-2 transition-colors border border-[#cbd5e1]/60 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px] text-[#004ac6]">upload_file</span>
            <span>Upload New File (.csv, .xlsx)</span>
          </button>

          {/* Quick presets dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-4 py-2 bg-[#004ac6] text-white rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#003ea8] transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">stacks</span>
              <span>One-Click Demo Datasets</span>
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-68 bg-white rounded-xl shadow-xl border border-[#cbd5e1] p-2 z-30">
                <div className="px-3 py-1 font-mono text-[11px] font-bold uppercase text-[#64748b]">
                  Available Scenarios
                </div>
                <button
                  onClick={() => {
                    onSelectDemoScenario('customers');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex flex-col p-2.5 rounded-lg hover:bg-[#eff4ff] transition-colors"
                >
                  <span className="text-sm font-medium text-[#0b1c30]">synthetic_customers_messy.csv</span>
                  <span className="font-mono text-xs text-[#64748b]">84 rows • Customer CRM</span>
                </button>
                <button
                  onClick={() => {
                    onSelectDemoScenario('b2b');
                    setDropdownOpen(false);
                  }}
                  className="w-full text-left flex flex-col p-2.5 rounded-lg hover:bg-[#eff4ff] transition-colors"
                >
                  <span className="text-sm font-medium text-[#0b1c30]">b2b_leads_unstructured.xlsx</span>
                  <span className="font-mono text-xs text-[#64748b]">120 rows • Pipeline Telemetry</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Overview & Deterministic Formula Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Quality Score Radial Widget */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#ffdad6]/40 rounded-full blur-3xl pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs uppercase tracking-wider text-[#64748b] font-semibold">
                Deterministic Health Index
              </span>
              <span className="bg-[#ffdad6] text-[#ba1a1a] font-mono text-xs uppercase px-2.5 py-0.5 rounded-full font-bold">
                Critical Drift
              </span>
            </div>
            <h3 className="text-xl font-bold text-[#0b1c30]">Dataset Hygiene Score</h3>
          </div>

          <div className="my-5 flex items-center gap-6">
            {/* Radial Progress SVG Gauge */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  className="text-[#e2e8f0] fill-none"
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="10"
                ></circle>
                <circle
                  className="text-[#ba1a1a] fill-none transition-all duration-1000 ease-out"
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeDasharray="314.159"
                  strokeDashoffset="100.5"
                  strokeLinecap="round"
                  strokeWidth="10"
                ></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-extrabold text-[#0b1c30] tracking-tighter">68</span>
                <span className="font-mono text-xs text-[#64748b] -mt-1">/100</span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#ba1a1a]"></span>
                <span className="font-semibold text-base text-[#0b1c30]">Poor Cleanliness</span>
              </div>
              <p className="text-xs text-[#64748b]">57 distinct anomalies detected in 756 total cell evaluations.</p>
              <div className="mt-1 flex items-center gap-1 text-[#004ac6] font-mono text-xs font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>100% Deterministic Eval</span>
              </div>
            </div>
          </div>

          {/* Formula Callout */}
          <div className="bg-[#eff4ff] rounded-lg p-3 border border-[#cbd5e1]/40">
            <div className="flex items-center justify-between text-[#64748b] font-mono text-[11px] uppercase mb-1 font-semibold">
              <span>Scoring Computation Equation</span>
              <span className="text-[#004ac6] font-mono">v1.2-Strict</span>
            </div>
            <div className="font-mono text-xs text-[#0b1c30] bg-white p-2 rounded border border-[#cbd5e1]/50 overflow-x-auto select-all">
              Score = 100 - [ (14×1.5 + 13×2.0 + 8×3.0 + 22×1.0) / 756 ] × 100 = 68.2
            </div>
          </div>
        </div>

        {/* Anomaly Diagnostics Metric Bento */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Metric 1: Total Anomalies */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Total Anomalies</span>
              <span className="p-1.5 rounded-lg bg-[#ffdad6] text-[#ba1a1a]">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">57</div>
              <div className="text-xs text-[#ba1a1a] font-medium mt-0.5">Across 6 of 9 active columns</div>
            </div>
            <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#ba1a1a] h-full rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>

          {/* Metric 2: Missing Values */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Missing / Nulls</span>
              <span className="p-1.5 rounded-lg bg-[#dce9ff] text-[#004ac6]">
                <span className="material-symbols-outlined text-[18px]">block</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">14</div>
              <div className="text-xs text-[#64748b] mt-0.5">phone (14), annual_revenue (10)</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span>Null rate:</span>
              <span className="text-[#0b1c30] font-semibold">1.85% of grid</span>
            </div>
          </div>

          {/* Metric 3: Whitespace & Format */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Formatting &amp; Whitespace</span>
              <span className="p-1.5 rounded-lg bg-[#c7c3fe] text-[#514f81]">
                <span className="material-symbols-outlined text-[18px]">space_bar</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">22</div>
              <div className="text-xs text-[#64748b] mt-0.5">Padded emails, mixed ISO date formats</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span>Syntactic drift:</span>
              <span className="text-[#5b598c] font-semibold">High variance</span>
            </div>
          </div>

          {/* Metric 4: Duplicate Candidates */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Duplicate Records</span>
              <span className="p-1.5 rounded-lg bg-[#dbe1ff] text-[#00174b]">
                <span className="material-symbols-outlined text-[18px]">content_copy</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">8</div>
              <div className="text-xs text-[#004ac6] font-medium mt-0.5">2 Exact • 6 Fuzzy (Email/Phone)</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span>Candidate ratio:</span>
              <span className="text-[#0b1c30] font-semibold">9.5% dataset impact</span>
            </div>
          </div>

          {/* Metric 5: Entity Inconsistencies */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Entity Normalization</span>
              <span className="p-1.5 rounded-lg bg-[#d3e4fe] text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px]">location_city</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">13</div>
              <div className="text-xs text-[#64748b] mt-0.5">Hyderabad / HYD / Secunderabad aliases</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span>Clustering:</span>
              <span className="text-[#007d55] font-semibold">5 Levenshtein variants</span>
            </div>
          </div>

          {/* Metric 6: Total Processed Records */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#e2e8f0] flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-[#64748b] font-semibold">Ingestion Readiness</span>
              <span className="p-1.5 rounded-lg bg-[#6ffbbe] text-[#002113]">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </span>
            </div>
            <div className="my-3">
              <div className="text-3xl font-extrabold text-[#0b1c30] tracking-tight">84 / 84</div>
              <div className="text-xs text-[#007d55] font-medium mt-0.5">Schema Parsed Successfully</div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#64748b]">
              <span>Pipeline status:</span>
              <span className="text-[#0b1c30] font-semibold">Awaiting AI Clean</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Column Profile Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 bg-[#eff4ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#cbd5e1]/40">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#004ac6] text-[24px]">view_column</span>
            <div>
              <h3 className="font-semibold text-base text-[#0b1c30]">Attribute Schema &amp; Column Profile</h3>
              <p className="text-xs text-[#64748b]">Per-attribute completeness, syntactic validity, and AI repair vectors.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <div className="relative flex-1 md:w-64">
              <input
                type="text"
                value={filterQuery}
                onChange={e => setFilterQuery(e.target.value)}
                placeholder="Filter attributes..."
                className="w-full bg-white rounded-lg px-3 py-1.5 pl-8 font-mono text-xs text-[#0b1c30] placeholder:text-[#94a3b8] border border-[#cbd5e1] focus:outline-none focus:ring-2 focus:ring-[#004ac6]"
              />
              <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-[#94a3b8]">filter_list</span>
            </div>
            <span className="font-mono text-xs text-[#64748b] bg-[#e2e8f0] px-2 py-1 rounded">
              {filteredColumns.length} Active Columns
            </span>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8fafc] font-mono text-xs uppercase text-[#64748b] tracking-wider border-b border-[#e2e8f0]">
                <th className="py-3 px-4">Column Name</th>
                <th className="py-3 px-4">Inferred Type</th>
                <th className="py-3 px-4">Completeness</th>
                <th className="py-3 px-4">Valid Format</th>
                <th className="py-3 px-4">Top Issues Detected</th>
                <th className="py-3 px-4 text-center">Anomaly Level</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] font-mono text-xs">
              {filteredColumns.map((col) => {
                const isHigh = col.anomalyLevel === 'High';
                return (
                  <tr
                    key={col.name}
                    className={`hover:bg-[#eff4ff]/60 transition-colors ${isHigh ? 'bg-[#ffdad6]/10' : ''}`}
                  >
                    <td className="py-3 px-4 font-medium text-[#0b1c30]">
                      <div className="flex items-center gap-2 font-semibold">
                        <span className={`material-symbols-outlined text-[16px] ${isHigh ? 'text-[#ba1a1a]' : 'text-[#64748b]'}`}>
                          {col.icon}
                        </span>
                        <span>{col.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#f1f5f9] px-2 py-0.5 rounded text-[#0b1c30] text-xs font-mono">
                        {col.inferredType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-[#e2e8f0] rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${col.completeness < 90 ? 'bg-[#ba1a1a]' : 'bg-[#007d55]'}`}
                            style={{ width: `${col.completeness}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${col.completeness < 90 ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                          {col.completeness}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={col.validFormat < 80 ? 'text-[#ba1a1a] font-semibold' : 'text-[#007d55] font-semibold'}>
                        {col.validFormat.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#475569] max-w-xs">
                      {col.topIssues}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono uppercase text-[10px] font-bold ${
                          col.anomalyLevel === 'High'
                            ? 'bg-[#ffdad6] text-[#ba1a1a]'
                            : col.anomalyLevel === 'Medium'
                            ? 'bg-[#d3e4fe] text-[#444173]'
                            : 'bg-[#6ffbbe] text-[#002113]'
                        }`}
                      >
                        {col.anomalyLevel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {col.quickAction === 'No Action' ? (
                        <span className="text-[#94a3b8] font-medium">No Action</span>
                      ) : (
                        <button
                          onClick={() => handleQuickAction(col.quickAction, col.name)}
                          className="text-[#004ac6] hover:text-[#003ea8] font-semibold hover:underline"
                        >
                          {col.quickAction}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Raw Data Preview with Messy Cells Highlighting */}
      <div className="bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-5 bg-[#eff4ff] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#cbd5e1]/40">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#004ac6] text-[24px]">table_rows</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#0b1c30]">
                  Raw Ingestion Preview with Dynamic Anomaly Tracing
                </h3>
                <span className="font-mono text-xs bg-[#e2e8f0] text-[#0b1c30] px-1.5 py-0.5 rounded">
                  Showing rows {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, records.length)} of {records.length}
                </span>
              </div>
              <p className="text-xs text-[#64748b]">Highlighted cells indicate deterministic rule failures and flagged parsing conflicts.</p>
            </div>
          </div>

          {/* Legend for Cell Status */}
          <div className="flex flex-wrap items-center gap-4 font-mono text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#ffdad6] border-l-2 border-[#ba1a1a]"></span>
              <span className="text-[#64748b]">Format / Dupe (Red)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#d3e4fe] border-l-2 border-[#737686]"></span>
              <span className="text-[#64748b]">Null / Missing (Muted)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-[#6ffbbe]/40 border-l-2 border-[#007d55]"></span>
              <span className="text-[#64748b]">Valid (Clear)</span>
            </div>
          </div>
        </div>

        {/* High-Density Raw Grid */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-[#f1f5f9] text-[#64748b] font-mono text-xs uppercase border-b border-[#e2e8f0]">
                <th className="py-2.5 px-4 w-12">#</th>
                <th className="py-2.5 px-4">customer_id</th>
                <th className="py-2.5 px-4">full_name</th>
                <th className="py-2.5 px-4">email</th>
                <th className="py-2.5 px-4">phone_number</th>
                <th className="py-2.5 px-4">signup_date</th>
                <th className="py-2.5 px-4">city</th>
                <th className="py-2.5 px-4">account_tier</th>
                <th className="py-2.5 px-4 text-right">annual_revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0] text-[#0b1c30]">
              {paginatedRecords.map((r, idx) => {
                const rowNum = (currentPage - 1) * pageSize + idx + 1;
                const isDupe = r.has_duplicate_id;

                return (
                  <tr key={r.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="py-2 px-4 text-[#94a3b8] font-mono">
                      {String(rowNum).padStart(3, '0')}
                    </td>

                    {/* customer_id */}
                    <td
                      className={`py-2 px-4 ${
                        isDupe
                          ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-semibold'
                          : ''
                      }`}
                    >
                      <span className="inline-flex items-center gap-1" title={isDupe ? 'Exact Duplicate ID Detected' : ''}>
                        {r.customer_id}
                        {isDupe && (
                          <span className="material-symbols-outlined text-[14px]">warning</span>
                        )}
                      </span>
                    </td>

                    {/* full_name */}
                    <td
                      className={`py-2 px-4 ${
                        r.has_whitespace_name || r.full_name.includes('"')
                          ? 'bg-[#ffdad6]/20'
                          : ''
                      }`}
                      title={r.has_whitespace_name ? 'Whitespace padding present' : ''}
                    >
                      {r.has_whitespace_name ? `"${r.full_name}"` : r.full_name}
                    </td>

                    {/* email */}
                    <td
                      className={`py-2 px-4 ${
                        r.has_uppercase_email
                          ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-semibold'
                          : ''
                      }`}
                      title={r.has_uppercase_email ? 'Uppercase domain violation (RFC 5322)' : ''}
                    >
                      {r.email}
                    </td>

                    {/* phone_number */}
                    <td
                      className={`py-2 px-4 ${
                        !r.phone_number
                          ? 'bg-[#eff4ff] text-[#94a3b8] italic font-sans'
                          : r.has_unnormalized_phone
                          ? 'bg-[#ffdad6]/25'
                          : ''
                      }`}
                    >
                      {r.phone_number ? r.phone_number : '<NULL / EMPTY>'}
                    </td>

                    {/* signup_date */}
                    <td
                      className={`py-2 px-4 ${
                        r.has_unparsed_date ? 'bg-[#ffdad6]/25 text-[#0b1c30]' : ''
                      }`}
                      title={r.has_unparsed_date ? 'Ambiguous date format' : ''}
                    >
                      {r.signup_date}
                    </td>

                    {/* city */}
                    <td
                      className={`py-2 px-4 ${
                        r.has_unnormalized_city
                          ? 'bg-[#ffdad6]/40 text-[#ba1a1a] font-medium'
                          : ''
                      }`}
                      title={r.has_unnormalized_city ? 'Unnormalized city alias' : ''}
                    >
                      {r.city}
                    </td>

                    {/* account_tier */}
                    <td className="py-2 px-4 text-[#0b1c30]">
                      {r.account_tier}
                    </td>

                    {/* annual_revenue */}
                    <td
                      className={`py-2 px-4 text-right font-mono ${
                        r.has_missing_revenue
                          ? 'bg-[#eff4ff] text-[#94a3b8] italic font-sans'
                          : ''
                      }`}
                    >
                      {r.annual_revenue !== null && r.annual_revenue !== undefined ? (
                        typeof r.annual_revenue === 'number' ? (
                          `$${r.annual_revenue.toLocaleString()}`
                        ) : (
                          r.annual_revenue
                        )
                      ) : (
                        '<NaN>'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3 bg-[#eff4ff]/50 flex items-center justify-between font-mono text-xs text-[#64748b] border-t border-[#cbd5e1]/40">
          <span>{records.length - paginatedRecords.length} additional rows held in memory buffer</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 bg-white border border-[#cbd5e1] rounded hover:bg-[#e2e8f0] text-[#0b1c30] disabled:opacity-40"
            >
              &lt; Prev
            </button>
            <span className="px-2 py-1 bg-white border border-[#cbd5e1] rounded text-[#0b1c30] font-medium">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 bg-white border border-[#cbd5e1] rounded hover:bg-[#e2e8f0] text-[#0b1c30] disabled:opacity-40"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>

      {/* AI Remediation Plan Sticky Floating Banner */}
      <div className="bg-white rounded-xl shadow-lg border border-[#cbd5e1] p-5 flex flex-col lg:flex-row items-center justify-between gap-5 sticky bottom-4 z-20">
        <div className="flex items-start md:items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-[#004ac6] text-white flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[28px]">auto_fix_high</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-base text-[#0b1c30]">
                Copilot Remediation Blueprint Generated
              </span>
              <span className="bg-[#dbe1ff] text-[#00174b] font-mono text-[11px] uppercase px-2 py-0.5 rounded font-bold">
                4 Micro-Operations Ready
              </span>
            </div>
            <p className="text-xs text-[#64748b]">
              Standardize ISO dates • Strip Whitespace &amp; Canonicalize Emails • Fuzzy-Match Cities • Resolve Duplicate IDs
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
          {/* Safety Protocol Chip */}
          <div className="hidden sm:flex items-center gap-2 bg-[#eff4ff] px-3.5 py-2 rounded-lg text-[#475569] font-mono text-xs border border-[#cbd5e1]/40">
            <span className="material-symbols-outlined text-[18px] text-[#007d55]">gavel</span>
            <span>AI Proposes • Python Executes • Human Approves</span>
          </div>

          {/* Launch Button */}
          <button
            onClick={onNavigateToCopilot}
            className="w-full sm:w-auto px-6 py-3 bg-[#004ac6] hover:bg-[#003ea8] text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md group"
            type="button"
          >
            <span>Launch AI Cleaning Copilot</span>
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
