/**
 * FeedbackIQ — Report Configuration Form
 *
 * Allows the administrator to configure:
 *   - Report Title
 *   - Product Scope (All Products or dynamically populated products)
 *   - Reporting Period (All Time, 7d, 30d, 90d, Custom Range)
 *   - Sections to include
 */

import { useState } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  CheckSquare,
  Square,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Button from '../ui/Button';

export const DEFAULT_REPORT_TITLE = 'FeedbackIQ — Executive Customer Feedback Analysis Report';

export const SECTION_DEFINITIONS = [
  { id: 'overview',           label: 'Executive Overview',                desc: 'Strategic management summary synthesized from feedback' },
  { id: 'kpis',               label: 'Key Performance Indicators',         desc: 'Total volume, average rating, sentiment shares, and queue status' },
  { id: 'sentiment',          label: 'Sentiment Analysis',                desc: 'Granular positive, neutral, negative, mixed, and unknown distribution' },
  { id: 'ratings',            label: 'Rating Breakdown',                  desc: 'Star rating frequency distribution (1 to 5 stars) and average' },
  { id: 'categories',         label: 'Feedback Category Breakdown',       desc: 'Dynamically detected topic clusters and volume shares' },
  { id: 'praise_pain',        label: 'Customer Praise & Concerns',        desc: 'Verbatim positive highlights and recurring friction points' },
  { id: 'product_comparison', label: 'Cross-Product Comparison',          desc: 'Benchmark across the registered product portfolio (All Products scope only)' },
  { id: 'actions',            label: 'Suggested Improvement Actions',     desc: 'Prioritized tactical action streams with Response ID citations' },
  { id: 'references',         label: 'Supporting Feedback References',    desc: 'Structured evidence log of relevant individual feedback records' },
];

export default function ReportConfigForm({
  config,
  onChangeConfig,
  onGenerate,
  products = [],
  loading = false,
  error = null,
}) {
  const [validationError, setValidationError] = useState('');

  const handleTitleChange = (e) => {
    onChangeConfig({ ...config, title: e.target.value });
    setValidationError('');
  };

  const handleScopeChange = (e) => {
    const newScope = e.target.value;
    onChangeConfig({
      ...config,
      productScope: newScope,
      // If switching away from 'ALL', disable product_comparison
      sections: {
        ...config.sections,
        product_comparison: newScope === 'ALL' ? config.sections.product_comparison : false,
      },
    });
  };

  const handlePeriodChange = (e) => {
    onChangeConfig({ ...config, dateRange: e.target.value });
    setValidationError('');
  };

  const handleCustomDateChange = (field, value) => {
    onChangeConfig({ ...config, [field]: value });
    setValidationError('');
  };

  const handleToggleSection = (sectionId) => {
    onChangeConfig({
      ...config,
      sections: {
        ...config.sections,
        [sectionId]: !config.sections[sectionId],
      },
    });
    setValidationError('');
  };

  const handleSelectAllSections = () => {
    const all = {};
    SECTION_DEFINITIONS.forEach((s) => {
      all[s.id] = s.id === 'product_comparison' ? config.productScope === 'ALL' : true;
    });
    onChangeConfig({ ...config, sections: all });
    setValidationError('');
  };

  const handleDeselectAllSections = () => {
    const none = {};
    SECTION_DEFINITIONS.forEach((s) => {
      none[s.id] = false;
    });
    onChangeConfig({ ...config, sections: none });
  };

  const handleResetDefaults = () => {
    onChangeConfig({
      title: DEFAULT_REPORT_TITLE,
      productScope: 'ALL',
      dateRange: '30d',
      customStartDate: '',
      customEndDate: '',
      sections: {
        overview: true,
        kpis: true,
        sentiment: true,
        ratings: true,
        categories: true,
        praise_pain: true,
        product_comparison: true,
        actions: true,
        references: true,
      },
    });
    setValidationError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!config.title || config.title.trim() === '') {
      setValidationError('Please enter a report title.');
      return;
    }

    if (config.dateRange === 'custom') {
      if (!config.customStartDate || !config.customEndDate) {
        setValidationError('Both start date and end date are required for a custom date range.');
        return;
      }
      const s = new Date(config.customStartDate);
      const end = new Date(config.customEndDate);
      if (s > end) {
        setValidationError('Custom start date cannot be later than end date.');
        return;
      }
    }

    const selectedCount = Object.values(config.sections).filter(Boolean).length;
    if (selectedCount === 0) {
      setValidationError('Please select at least one report section to include.');
      return;
    }

    setValidationError('');
    onGenerate();
  };

  const isScopeAll = config.productScope === 'ALL';

  return (
    <form onSubmit={handleSubmit} className="surface-card rounded-2xl border border-border p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-primary">Executive Report Configuration</h2>
          </div>
          <p className="text-xs text-muted">
            Configure report parameters, select reporting period and product scope, and customize executive sections.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={handleResetDefaults}
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset Defaults
        </Button>
      </div>

      {/* Validation Error Alert */}
      {(validationError || error) && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Section 1: Basic Information */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-2">
          <span>1. Report Title & Scope</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Report Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-primary">
              Report Title <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={config.title}
              onChange={handleTitleChange}
              placeholder="Enter executive report title..."
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-hidden text-primary transition-colors"
            />
          </div>

          {/* Product Scope */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-primary">
              Product Scope <span className="text-accent">*</span>
            </label>
            <div className="relative">
              <select
                value={config.productScope}
                onChange={handleScopeChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-hidden text-primary transition-colors cursor-pointer appearance-none pr-8"
              >
                <option value="ALL">All Products (Portfolio-wide)</option>
                {products.map((p) => (
                  <option key={p.Product_ID} value={p.Product_ID}>
                    {p.Product_Name} ({p.Product_ID})
                  </option>
                ))}
              </select>
              <Layers className="w-4 h-4 text-muted absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Reporting Period */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-2">
          <span>2. Reporting Period</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {[
            { id: 'all', label: 'All Time' },
            { id: '7d',  label: 'Last 7 Days' },
            { id: '30d', label: 'Last 30 Days' },
            { id: '90d', label: 'Last 90 Days' },
            { id: 'custom', label: 'Custom Range' },
          ].map((period) => (
            <button
              key={period.id}
              type="button"
              onClick={() => handlePeriodChange({ target: { value: period.id } })}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border text-center transition-all ${
                config.dateRange === period.id
                  ? 'bg-accent/15 border-accent text-accent font-semibold shadow-xs'
                  : 'border-border text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Custom Date Pickers */}
        {config.dateRange === 'custom' && (
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-border/80 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>Start Date</span>
              </label>
              <input
                type="date"
                value={config.customStartDate || ''}
                onChange={(e) => handleCustomDateChange('customStartDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-border focus:border-accent outline-hidden text-primary"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-primary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-accent" />
                <span>End Date</span>
              </label>
              <input
                type="date"
                value={config.customEndDate || ''}
                onChange={(e) => handleCustomDateChange('customEndDate', e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-border focus:border-accent outline-hidden text-primary"
              />
            </div>
          </div>
        )}
      </div>

      {/* Section 3: Sections to Include */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
            <span>3. Executive Sections to Include</span>
          </h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllSections}
              className="text-[11px] text-accent hover:underline font-medium"
            >
              Select All
            </button>
            <span className="text-muted/40">•</span>
            <button
              type="button"
              onClick={handleDeselectAllSections}
              className="text-[11px] text-muted hover:text-primary hover:underline font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SECTION_DEFINITIONS.map((sec) => {
            const isComparison = sec.id === 'product_comparison';
            const isDisabled = isComparison && !isScopeAll;
            const isChecked = Boolean(config.sections[sec.id]) && !isDisabled;

            return (
              <div
                key={sec.id}
                onClick={() => {
                  if (!isDisabled) handleToggleSection(sec.id);
                }}
                className={`p-3.5 rounded-xl border transition-all select-none ${
                  isDisabled
                    ? 'border-border/40 bg-zinc-100/50 dark:bg-zinc-800/20 opacity-50 cursor-not-allowed'
                    : isChecked
                    ? 'border-accent/40 bg-accent/5 cursor-pointer'
                    : 'border-border hover:border-border/80 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 text-accent">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 fill-accent/20" />
                    ) : (
                      <Square className="w-4 h-4 text-muted" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <span>{sec.label}</span>
                      {isDisabled && (
                        <span className="text-[9px] font-mono px-1 rounded bg-zinc-200 dark:bg-zinc-700 text-muted">
                          All Products only
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">{sec.desc}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Submit Button */}
      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className="text-xs text-muted">
          Generates a live preview using your filtered dataset and preps the PDF export document.
        </p>

        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={loading}
          leftIcon={<Play className="w-4 h-4 fill-zinc-950" />}
        >
          Generate Report Preview
        </Button>
      </div>
    </form>
  );
}
