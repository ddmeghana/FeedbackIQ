/**
 * FeedbackIQ — Phase 11: Executive PDF Reports Page
 *
 * Full-featured executive report generation suite:
 *   - Live product registry and dynamic Google Sheets feedback records
 *   - Customizable title, product scope, and date-range filtering (including custom ranges)
 *   - Modular section toggles
 *   - Interactive browser preview
 *   - Client-side multi-page PDF generation via jsPDF
 */

import { useState, useCallback, useMemo } from 'react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import DashboardStatus from '../components/dashboard/DashboardStatus';
import ReportConfigForm, { DEFAULT_REPORT_TITLE } from '../components/reports/ReportConfigForm';
import ReportPreview from '../components/reports/ReportPreview';
import { useDashboardData } from '../hooks/useDashboardData';
import { buildReportData } from '../services/reportDataService';
import { clearSession } from '../services/adminAuthService';
import { ROUTES } from '../config/constants';

export default function ReportsPage() {
  const {
    products,
    allRecords,
    loading,
    error,
    sessionExpired,
    lastRefreshed,
    refresh,
  } = useDashboardData('ALL', 'all');

  // Handle session expiry
  const handleSessionExpired = useCallback(() => {
    clearSession();
    window.location.href = ROUTES.LOGIN;
  }, []);

  // Configuration state
  const [config, setConfig] = useState({
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

  // Current view: 'config' | 'preview'
  const [viewMode, setViewMode] = useState('config');
  const [reportData, setReportData] = useState(null);

  // Generate Report
  const handleGenerate = () => {
    const data = buildReportData({
      config,
      products,
      allRecords,
    });
    setReportData(data);
    setViewMode('preview');
  };

  const handleRegenerate = () => {
    const data = buildReportData({
      config,
      products,
      allRecords,
    });
    setReportData(data);
  };

  const handleBackToConfig = () => {
    setViewMode('config');
  };

  return (
    <DashboardLayout
      products={products}
      selectedProduct={config.productScope}
      onSelectProduct={(p) => setConfig((prev) => ({ ...prev, productScope: p }))}
      dateRange={config.dateRange}
      onSelectDateRange={(d) => setConfig((prev) => ({ ...prev, dateRange: d }))}
      lastRefreshed={lastRefreshed}
      onRefresh={refresh}
      loading={loading}
      pageTitle="Executive PDF Reports"
    >
      <div className="space-y-6">
        <DashboardStatus
          loading={loading}
          error={error}
          sessionExpired={sessionExpired}
          onRetry={refresh}
          onLogin={handleSessionExpired}
        />

        {!loading && !error && !sessionExpired && (
          <>
            {viewMode === 'config' ? (
              <ReportConfigForm
                config={config}
                onChangeConfig={setConfig}
                onGenerate={handleGenerate}
                products={products}
                loading={loading}
              />
            ) : (
              reportData && (
                <ReportPreview
                  reportData={reportData}
                  onBackToConfig={handleBackToConfig}
                  onRegenerate={handleRegenerate}
                />
              )
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
