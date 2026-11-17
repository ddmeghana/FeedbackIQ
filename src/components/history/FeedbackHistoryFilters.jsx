import { Search, Filter, X } from 'lucide-react';

export default function FeedbackHistoryFilters({
  searchQuery,
  onSearchChange,
  sentimentFilter,
  onSentimentChange,
  categoryFilter,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  ratingFilter,
  onRatingChange,
  categories = [],
  onClearFilters,
  isFiltered = false,
}) {
  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 border border-border space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search comments, respondents, or IDs..."
            aria-label="Search feedback records"
            className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted hover:text-primary"
              aria-label="Clear search text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* 1. Sentiment Filter */}
          <div className="relative">
            <select
              value={sentimentFilter}
              onChange={(e) => onSentimentChange(e.target.value)}
              aria-label="Filter by sentiment"
              className="appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
            >
              <option value="ALL">All Sentiments</option>
              <option value="Positive">Positive</option>
              <option value="Neutral">Neutral</option>
              <option value="Negative">Negative</option>
              <option value="Mixed">Mixed</option>
              <option value="Pending">Pending Analysis</option>
            </select>
          </div>

          {/* 2. Category Filter (Dynamically populated from database records) */}
          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              aria-label="Filter by category"
              className="appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs max-w-[160px] truncate"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Processing Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value)}
              aria-label="Filter by processing status"
              className="appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
            >
              <option value="ALL">All Statuses</option>
              <option value="Analyzed">Analyzed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* 4. Rating Filter */}
          <div className="relative">
            <select
              value={ratingFilter}
              onChange={(e) => onRatingChange(e.target.value)}
              aria-label="Filter by rating"
              className="appearance-none pl-3 pr-7 py-2 text-xs font-medium rounded-xl bg-card text-primary border border-border hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent transition-colors cursor-pointer shadow-xs"
            >
              <option value="ALL">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
              <option value="unrated">Unrated / Missing</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={onClearFilters}
              className="px-2.5 py-2 rounded-xl text-xs font-medium text-muted hover:text-primary hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent shadow-xs"
              title="Reset search and filters"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
