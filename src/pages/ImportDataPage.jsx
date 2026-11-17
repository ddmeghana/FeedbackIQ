import { useState, useRef } from 'react';
import {
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import Button from '../components/ui/Button';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import {
  parseCSVFile,
  parseExcelFile,
  detectColumnMappings,
  validateDataset,
} from '../utils/fileImportParser';
import DataPreviewTable from '../components/import/DataPreviewTable';
import ColumnMapper from '../components/import/ColumnMapper';
import ValidationSummary from '../components/import/ValidationSummary';
import ImportResultView from '../components/import/ImportResultView';
import { importAdminFeedback } from '../services/adminDataService';

/**
 * Format raw byte size into human-readable format (e.g. "45.2 KB").
 */
function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImportDataPage() {
  const { products, selectedProduct, setSelectedProduct, dateRange, setDateRange } =
    useDashboardFilters();

  // Excel / CSV Ingestion Pipeline State
  const [activeWorkflow, setActiveWorkflow] = useState(false); // true once a file is parsed
  const [workflowStep, setWorkflowStep] = useState(1); // 1: Preview, 2: Mapping, 3: Validate, 4: Result

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);

  // Parsed File Data
  const [parsedData, setParsedData] = useState(null); // { headers, rows, totalRows, sheetNames, activeSheet }
  const [mappings, setMappings] = useState({});
  const [validationResult, setValidationResult] = useState(null);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [importResult, setImportResult] = useState(null);

  const fileInputRef = useRef(null);

  // Parse File
  const handleFileProcess = async (file) => {
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError(null);
    setSubmitError(null);

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx') {
      setParseError('Unsupported file type. Please upload a .csv or .xlsx file.');
      setIsParsing(false);
      return;
    }

    try {
      let data;
      if (ext === 'csv') {
        data = await parseCSVFile(file);
      } else {
        data = await parseExcelFile(file);
      }

      setParsedData(data);
      // Automatically detect column mappings
      const initialMappings = detectColumnMappings(data.headers);
      setMappings(initialMappings);

      setActiveWorkflow(true);
      setWorkflowStep(1); // Start at Preview
    } catch (err) {
      setParseError(err.message || 'Failed to read and parse the uploaded file.');
    } finally {
      setIsParsing(false);
    }
  };

  // Switch Excel Worksheet
  const handleSelectWorksheet = async (sheetName) => {
    if (!selectedFile || selectedFile.name.endsWith('.csv')) return;
    setIsParsing(true);
    try {
      const data = await parseExcelFile(selectedFile, sheetName);
      setParsedData(data);
      const initialMappings = detectColumnMappings(data.headers);
      setMappings(initialMappings);
      setValidationResult(null);
    } catch (err) {
      setParseError(err.message || 'Failed to switch worksheet.');
    } finally {
      setIsParsing(false);
    }
  };

  // File Drop / Selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  // Mapping changes
  const handleMappingChange = (canonKey, newHeader) => {
    setMappings((prev) => ({
      ...prev,
      [canonKey]: newHeader,
    }));
    // Invalidate validation result when mapping changes
    setValidationResult(null);
  };

  // Run validation
  const handleRunValidation = () => {
    if (!parsedData || !parsedData.rows) return;
    const result = validateDataset(parsedData.rows, mappings);
    setValidationResult(result);
    setWorkflowStep(3); // Move to Validate step
  };

  // Final Submit to Backend
  const handleConfirmImport = async () => {
    if (!validationResult || validationResult.validCount === 0) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const recordsToSend = validationResult.validRecords.map((vr) => vr.record);

    try {
      const res = await importAdminFeedback(recordsToSend);

      if (!res.success) {
        setSubmitError(res.message || 'Server rejected the import batch.');
        setIsSubmitting(false);
        return;
      }

      setImportResult(res);
      setWorkflowStep(4); // Move to Result step
    } catch (err) {
      setSubmitError('Network failure: Unable to reach Google Apps Script to complete import.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset entire wizard
  const handleResetWizard = () => {
    setActiveWorkflow(false);
    setWorkflowStep(1);
    setSelectedFile(null);
    setParsedData(null);
    setMappings({});
    setValidationResult(null);
    setImportResult(null);
    setParseError(null);
    setSubmitError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isProductMapped = Boolean(mappings.Product_Name);
  const isCommentMapped = Boolean(mappings.Comment);
  const canValidate = isProductMapped && isCommentMapped;

  return (
    <DashboardLayout
      products={products}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Import Data"
    >
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="space-y-1.5 pb-2 border-b border-border/80">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
              Feedback Ingestion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
            Import Customer Feedback
          </h1>
          <p className="text-sm text-muted max-w-2xl">
            Upload customer feedback from an Excel (.xlsx) or CSV (.csv) file to import into the central database.
          </p>
        </div>

        {/* ─── ACTIVE WORKFLOW: 4-Step Stepper ──────────────────────────────── */}
        {activeWorkflow ? (
          <div className="space-y-6">
            {/* Stepper Navigation Bar */}
            <div className="surface-card rounded-2xl p-4 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetWizard}
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="Cancel and choose a different file"
                  aria-label="Cancel and choose a different file"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-primary truncate max-w-xs">
                    {selectedFile?.name}
                  </div>
                  <div className="text-[11px] text-muted font-mono">
                    {formatFileSize(selectedFile?.size)} · {parsedData?.totalRows || 0} rows
                  </div>
                </div>
              </div>

              {/* Steps Progress Pills */}
              <div className="flex items-center gap-1 text-xs">
                {[
                  { step: 1, label: 'Preview' },
                  { step: 2, label: 'Mapping' },
                  { step: 3, label: 'Validate' },
                  { step: 4, label: 'Result' },
                ].map((s) => {
                  const isActive = workflowStep === s.step;
                  const isDone = workflowStep > s.step;

                  return (
                    <div key={s.step} className="flex items-center">
                      <span
                        className={`px-3 py-1 rounded-lg font-mono text-[11px] transition-colors ${
                          isActive
                            ? 'bg-accent text-zinc-950 font-bold shadow-xs'
                            : isDone
                            ? 'bg-emerald-500/15 text-emerald-500 font-medium'
                            : 'text-muted/60 bg-zinc-100 dark:bg-zinc-800/40'
                        }`}
                      >
                        {s.step}. {s.label}
                      </span>
                      {s.step < 4 && <span className="mx-1 text-muted/30">/</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Callout if submission fails */}
            {submitError && (
              <div
                role="alert"
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2.5"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold">Import Submission Error</p>
                  <p>{submitError}</p>
                </div>
              </div>
            )}

            {/* STEP 1: PREVIEW */}
            {workflowStep === 1 && (
              <div className="surface-card rounded-2xl p-6 border border-border space-y-6">
                <div>
                  <h2 className="text-base font-bold text-primary">Data Preview</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Inspect the columns and rows parsed from your uploaded file before mapping.
                  </p>
                </div>

                <DataPreviewTable
                  headers={parsedData?.headers || []}
                  rows={parsedData?.rows || []}
                  totalRows={parsedData?.totalRows || 0}
                  sheetNames={parsedData?.sheetNames || []}
                  activeSheet={parsedData?.activeSheet || ''}
                  onSelectSheet={handleSelectWorksheet}
                />

                <div className="pt-2 flex justify-between items-center border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleResetWizard}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Choose Different File
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setWorkflowStep(2)}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Proceed to Column Mapping
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 2: COLUMN MAPPING */}
            {workflowStep === 2 && (
              <div className="surface-card rounded-2xl p-6 border border-border space-y-6">
                <div>
                  <h2 className="text-base font-bold text-primary">Map Source Columns</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Match headers from your file to the canonical FeedbackIQ schema. Required fields
                    are highlighted.
                  </p>
                </div>

                <ColumnMapper
                  headers={parsedData?.headers || []}
                  mappings={mappings}
                  onMappingChange={handleMappingChange}
                />

                <div className="pt-2 flex justify-between items-center border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={() => setWorkflowStep(1)}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Back to Preview
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    disabled={!canValidate}
                    onClick={handleRunValidation}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Validate Records ({parsedData?.totalRows || 0})
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: VALIDATION & REVIEW */}
            {workflowStep === 3 && (
              <div className="surface-card rounded-2xl p-6 border border-border space-y-6">
                <div>
                  <h2 className="text-base font-bold text-primary">Validation & Confirmation</h2>
                  <p className="text-xs text-muted mt-0.5">
                    Review valid records, invalid rows, and intra-file duplicate entries before importing.
                  </p>
                </div>

                <ValidationSummary validationResult={validationResult} />

                <div className="pt-2 flex justify-between items-center border-t border-border/80">
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={isSubmitting}
                    onClick={() => setWorkflowStep(2)}
                    leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
                  >
                    Edit Column Mapping
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !validationResult || validationResult.validCount === 0}
                    onClick={handleConfirmImport}
                    rightIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    {isSubmitting
                      ? 'Importing into Database...'
                      : `Import ${validationResult?.validCount || 0} Valid Records`}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: IMPORT RESULT */}
            {workflowStep === 4 && (
              <ImportResultView
                result={importResult}
                totalSourceRows={parsedData?.totalRows || 0}
                onReset={handleResetWizard}
              />
            )}
          </div>
        ) : (
          /* ─── INITIAL SOURCE SELECTION: Upload Excel or CSV (Single Unified Option) ─── */
          <div className="max-w-3xl mx-auto w-full">
            <div className="surface-card rounded-2xl p-6 sm:p-8 border border-border space-y-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 border border-accent/20 text-accent flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-primary">Upload Excel or CSV</h2>
                    <p className="text-xs sm:text-sm text-muted mt-0.5">
                      Upload an existing customer feedback dataset from your computer.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-accent/15 text-accent font-semibold shrink-0">
                  Ready to Upload
                </span>
              </div>

              {/* Parsing Error Callout */}
              {parseError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 flex items-start gap-2.5"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed font-medium">{parseError}</p>
                </div>
              )}

              {/* File Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv"
                onChange={handleFileChange}
                className="hidden"
                id="feedback-file-input"
              />

              <label
                htmlFor="feedback-file-input"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                className={`block w-full rounded-2xl border-2 border-dashed p-10 sm:p-12 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-accent bg-accent/10 scale-[1.01]'
                    : 'border-border hover:border-accent/60 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center shadow-xs">
                    {isParsing ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <Upload className="w-7 h-7" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm sm:text-base font-bold text-primary">
                      {isParsing ? 'Reading & Parsing File...' : 'Click to browse or drag and drop file here'}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      Supports .csv and .xlsx formats (Max 10 MB)
                    </p>
                  </div>
                </div>
              </label>

              {/* Format Badges & Ingestion Pipeline Note */}
              <div className="pt-4 border-t border-border/70 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted font-mono">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Excel (.xlsx) & CSV (.csv) compatible
                  </span>
                  <span>10 MB max size</span>
                  <span>Auto-detects headers</span>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-border/80 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-muted leading-relaxed">
                    <strong className="text-primary font-medium">Standardized Central Storage:</strong> Your
                    data will be validated, previewed, and mapped to the central 13-column schema before
                    saving to the FeedbackIQ Google Sheets database.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
