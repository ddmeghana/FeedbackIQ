/**
 * ManageProductsPage — Protected admin page for viewing, adding, and removing products.
 *
 * Route: /products (requires admin auth via RequireAdminAuth)
 *
 * Features:
 * - Lists products from the Google Sheets Products registry with active/inactive status.
 * - Tab filter: All, Active, Inactive.
 * - "Add New Product" modal/form for creating new products.
 * - "Remove" action for active products with confirmation dialog.
 * - Safe deactivation: Never deletes historical feedback, AI fields, or Response_IDs.
 * - Handles: network failure, lock contention, session expiry, and in-flight states.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  Trash2,
  ShieldAlert,
  Archive,
} from 'lucide-react';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { useDashboardFilters } from '../hooks/useDashboardFilters';
import {
  fetchAdminProducts,
  addAdminProduct,
  removeAdminProduct,
} from '../services/adminDataService';

export default function ManageProductsPage() {
  const {
    products: filterProducts,
    selectedProduct,
    setSelectedProduct,
    dateRange,
    setDateRange,
  } = useDashboardFilters();

  // ─── Product list state ───────────────────────────────────────────────────
  const [products, setProducts]       = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError]     = useState(null);
  const [filterTab, setFilterTab]     = useState('active'); // 'all' | 'active' | 'inactive'

  // ─── Add-product form state ───────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [formName, setFormName]       = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [formError, setFormError]     = useState(null);
  const [successMsg, setSuccessMsg]   = useState(null);

  // ─── Remove-product confirmation state ────────────────────────────────────
  const [productToRemove, setProductToRemove] = useState(null);
  const [removing, setRemoving]               = useState(false);
  const [removeError, setRemoveError]         = useState(null);

  // ─── Load products ────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    const result = await fetchAdminProducts({ all: true });
    setListLoading(false);

    if (!result.success) {
      setListError(result.message || 'Failed to load products.');
      return;
    }
    setProducts(Array.isArray(result.data) ? result.data : []);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // ─── Open / close add form ────────────────────────────────────────────────
  const openAddForm = () => {
    setFormName('');
    setFormError(null);
    setSuccessMsg(null);
    setShowAddForm(true);
  };

  const closeAddForm = () => {
    setShowAddForm(false);
    setFormName('');
    setFormError(null);
  };

  // ─── Submit new product ───────────────────────────────────────────────────
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const trimmed = formName.trim();

    if (!trimmed) {
      setFormError('Product name is required.');
      return;
    }
    if (trimmed.length > 100) {
      setFormError('Product name must not exceed 100 characters.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setSuccessMsg(null);

    const result = await addAdminProduct(trimmed);
    setSubmitting(false);

    if (!result.success) {
      setFormError(result.message || 'Failed to add product. Please try again.');
      return;
    }

    setSuccessMsg(
      `Product "${result.productName}" added with ID ${result.productId}.`
    );
    setShowAddForm(false);
    setFormName('');
    loadProducts();
  };

  // ─── Remove Product Modal & Execution ─────────────────────────────────────
  const openRemoveModal = (product) => {
    setProductToRemove(product);
    setRemoveError(null);
  };

  const closeRemoveModal = () => {
    if (removing) return;
    setProductToRemove(null);
    setRemoveError(null);
  };

  const handleConfirmRemove = async () => {
    if (!productToRemove || !productToRemove.productId) return;

    setRemoving(true);
    setRemoveError(null);

    const result = await removeAdminProduct(productToRemove.productId);
    setRemoving(false);

    if (!result.success) {
      setRemoveError(result.message || 'Failed to remove product. Please try again.');
      return;
    }

    const removedName = productToRemove.productName || productToRemove.productId;
    setSuccessMsg(
      `Product "${removedName}" has been removed. Historical feedback records associated with it are preserved.`
    );
    setProductToRemove(null);
    loadProducts();
  };

  // ─── Filtered products list ───────────────────────────────────────────────
  const filteredProducts = products.filter((p) => {
    const status = String(p.status || 'Active').toLowerCase();
    if (filterTab === 'active') return status === 'active';
    if (filterTab === 'inactive') return status === 'inactive';
    return true;
  });

  const activeCount = products.filter(
    (p) => String(p.status || 'Active').toLowerCase() === 'active'
  ).length;
  const inactiveCount = products.filter(
    (p) => String(p.status || 'Active').toLowerCase() === 'inactive'
  ).length;

  return (
    <DashboardLayout
      products={filterProducts}
      selectedProduct={selectedProduct}
      onSelectProduct={setSelectedProduct}
      dateRange={dateRange}
      onSelectDateRange={setDateRange}
      pageTitle="Manage Products"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/25">
              <Package className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight">
                Manage Products
              </h1>
              <p className="text-xs text-muted mt-0.5">
                View, register, and manage products in the organization's feedback registry
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadProducts}
              disabled={listLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-50"
              aria-label="Refresh product list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm shadow-accent/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New Product
            </button>
          </div>
        </div>

        {/* Success banner */}
        {successMsg && (
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1 text-xs sm:text-sm">{successMsg}</span>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="ml-auto shrink-0 text-emerald-500 hover:text-emerald-700"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add Product Form Modal / Box */}
        {showAddForm && (
          <div className="surface-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-primary">Add New Product</h2>
              <button
                type="button"
                onClick={closeAddForm}
                className="p-1 rounded-lg text-muted hover:text-primary"
                aria-label="Close form"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="product-name-input"
                  className="block text-xs font-medium text-muted mb-1.5"
                >
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="product-name-input"
                  type="text"
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormError(null);
                  }}
                  placeholder="e.g. Laptop Pro X"
                  maxLength={100}
                  disabled={submitting}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-canvas text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent disabled:opacity-60 transition-colors"
                  autoFocus
                />
                <p className="mt-1 text-[11px] text-muted">
                  A unique product name. The Product ID will be generated automatically.
                </p>
              </div>

              {formError && (
                <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeAddForm}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formName.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-accent text-zinc-950 hover:bg-amber-400 transition-colors shadow-sm shadow-accent/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Adding…
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Add Product
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/50 p-1 rounded-xl w-fit border border-border">
          <button
            type="button"
            onClick={() => setFilterTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'active'
                ? 'bg-card text-primary shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            Active Products ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'inactive'
                ? 'bg-card text-primary shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            Inactive / Removed ({inactiveCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterTab === 'all'
                ? 'bg-card text-primary shadow-xs font-semibold'
                : 'text-muted hover:text-primary'
            }`}
          >
            All ({products.length})
          </button>
        </div>

        {/* Product List Table */}
        <div className="surface-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {listLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-muted text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading products…
            </div>
          ) : listError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="text-sm text-red-500">{listError}</p>
              <button
                type="button"
                onClick={loadProducts}
                className="text-xs text-accent underline underline-offset-2 hover:text-amber-500"
              >
                Try again
              </button>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center px-6">
              <Package className="w-8 h-8 text-muted/50" />
              <p className="text-sm text-muted">
                {filterTab === 'inactive'
                  ? 'No inactive or removed products.'
                  : 'No products found.'}
              </p>
              {filterTab === 'active' && (
                <p className="text-xs text-muted/60">
                  Add your first product using the button above.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Product ID
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Product Name
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Status
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-muted">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProducts.map((product) => {
                    const isActive =
                      String(product.status || 'Active').toLowerCase() === 'active';

                    return (
                      <tr
                        key={product.productId}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-lg border border-accent/20">
                            {product.productId}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-medium text-primary">
                          {product.productName}
                        </td>
                        <td className="px-5 py-3.5">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                              <Archive className="w-3 h-3 text-zinc-400" />
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {isActive ? (
                            <button
                              type="button"
                              onClick={() => openRemoveModal(product)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-500/10 border border-red-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 cursor-pointer"
                              title={`Remove ${product.productName}`}
                              aria-label={`Remove ${product.productName}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-muted italic">
                              Historical only
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
                <span className="text-[11px] text-muted/60 font-mono">
                  Products Sheet · Single Source of Truth
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Removal Confirmation Modal ─────────────────────────────────────── */}
        {productToRemove && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-modal-title"
          >
            <div className="surface-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-500 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 id="remove-modal-title" className="text-base font-bold text-primary">
                    Remove Product
                  </h3>
                  <p className="text-xs font-mono text-accent">
                    {productToRemove.productName} ({productToRemove.productId})
                  </p>
                </div>
              </div>

              {/* Consequence statement */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs leading-relaxed space-y-2">
                <p className="font-semibold">
                  Are you sure you want to remove this product? This product will no longer appear as an active product in product management. Historical feedback records associated with it will be preserved.
                </p>
                <p className="text-[11px] text-muted">
                  The product will be marked inactive in the Products sheet. Past customer submissions, Groq AI summaries, sentiments, and Response IDs are never deleted or modified.
                </p>
              </div>

              {removeError && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{removeError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={closeRemoveModal}
                  disabled={removing}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRemove}
                  disabled={removing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm shadow-red-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {removing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Removing…
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Confirm Removal
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
