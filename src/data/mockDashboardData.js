/**
 * FeedbackIQ — Central Mock Data & Calculation Engine
 *
 * NOTE FOR BACKEND INTEGRATION:
 * The data structures below strictly mirror the Google Sheets schema:
 *   - mockProducts matches the 'Products' sheet
 *   - mockFeedbackRecords matches the 'Feedback' sheet
 *
 * In Phase 9, this file's calculation functions will accept real data fetched
 * via Google Apps Script without changing component props or data types.
 */

export const mockProducts = [
  {
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Description: 'Flagship ultrabook with OLED display',
    Is_Active: true,
  },
  {
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Description: 'Pro smartphone with triple-camera system',
    Is_Active: true,
  },
  {
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Description: 'Wireless noise-cancelling headphones',
    Is_Active: true,
  },
];

// Helper to generate past dates relative to now
const daysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockFeedbackRecords = [
  // ── Laptop X Records ──────────────────────────────────────────────────────────
  {
    Response_ID: 'FB-20261101-L01',
    Timestamp: daysAgo(2),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: 'Alex Rivera',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'The OLED screen is astonishingly sharp, and battery life easily lasts through an entire workday of coding.',
    Sentiment: 'Positive',
    Category: 'Product Quality',
    Summary: 'Exceptional display clarity and all-day battery life for software development.',
    Suggested_Action: 'Highlight battery longevity and display specs in developer marketing assets.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261102-L02',
    Timestamp: daysAgo(4),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 2,
    Comment: 'Thermal throttling kicks in within 15 minutes of video rendering, causing noticeable slowdowns and loud fan noise.',
    Sentiment: 'Negative',
    Category: 'Performance',
    Summary: 'Severe thermal throttling and excessive fan acoustics under heavy compute workloads.',
    Suggested_Action: 'Issue a firmware update with an aggressive fan curve and investigate thermal paste application.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261103-L03',
    Timestamp: daysAgo(6),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: 'Priya Sharma',
    Is_Anonymous: false,
    Rating: 4,
    Comment: 'Keyboard travel is super tactile and responsive. The trackpad is huge and reliable, though the chassis attracts finger smudges easily.',
    Sentiment: 'Positive',
    Category: 'Usability',
    Summary: 'Praised keyboard and trackpad responsiveness; minor criticism regarding smudge-prone chassis.',
    Suggested_Action: 'Consider an oleophobic coating in the next hardware revision.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261104-L04',
    Timestamp: daysAgo(9),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: 'Marcus Chen',
    Is_Anonymous: false,
    Rating: 3,
    Comment: 'Build quality is premium, but the pricing is definitely on the steeper side compared to competitors offering similar specs.',
    Sentiment: 'Mixed',
    Category: 'Pricing',
    Summary: 'Appreciates premium craftsmanship but notes uncompetitive pricing relative to market alternatives.',
    Suggested_Action: 'Evaluate introductory student discounts or bundled warranty options.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261105-L05',
    Timestamp: daysAgo(12),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 1,
    Comment: 'Package arrived with a crushed outer box and a hairline crack near the left hinge. Support took 4 days to respond.',
    Sentiment: 'Negative',
    Category: 'Customer Support',
    Summary: 'Shipping damage combined with unacceptably delayed customer service response time.',
    Suggested_Action: 'Audit courier handling standards and improve support ticketing triage priority for transit damages.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261106-L06',
    Timestamp: daysAgo(18),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: 'Jordan Vance',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'Speaker quality is best in class. Crisp highs and surprisingly rich bass for an ultrabook.',
    Sentiment: 'Positive',
    Category: 'Features',
    Summary: 'Highly impressed by sound stage, vocal clarity, and bass depth of internal speakers.',
    Suggested_Action: 'Showcase audio capability in creative and multimedia creator outreach.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261107-L07',
    Timestamp: daysAgo(24),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 4,
    Comment: 'Great port selection with HDMI and full-size USB-A, but missing a dedicated SD card slot.',
    Sentiment: 'Neutral',
    Category: 'Features',
    Summary: 'Commends I/O port diversity but requests integrated SD reader for photography workflows.',
    Suggested_Action: 'Log SD card reader request for subsequent product planning.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261108-L08',
    Timestamp: daysAgo(42),
    Product_ID: 'PROD-LAPTOP-X',
    Product_Name: 'Laptop X',
    Respondent_Name: 'Samantha Bell',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'Lightweight, charges quickly with 100W USB-C, and boots in under 4 seconds.',
    Sentiment: 'Positive',
    Category: 'Performance',
    Summary: 'Fast boot speeds, ultra-fast charging, and lightweight portability praised.',
    Suggested_Action: 'Emphasize portability and fast recharge in business executive briefs.',
    Processing_Status: 'Analyzed',
  },

  // ── Mobile Y Records ──────────────────────────────────────────────────────────
  {
    Response_ID: 'FB-20261101-M01',
    Timestamp: daysAgo(1),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: 'Liam O’Connor',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'Low-light photography on Mobile Y is unbelievable. Night mode captures crisp shadows without digital grain.',
    Sentiment: 'Positive',
    Category: 'Product Quality',
    Summary: 'Superb low-light camera capabilities and noise-free night photography.',
    Suggested_Action: 'Partner with mobile photographers for social feature campaign.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261102-M02',
    Timestamp: daysAgo(3),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 2,
    Comment: 'Battery life drains over 25% overnight even with Always-On Display switched off.',
    Sentiment: 'Negative',
    Category: 'Performance',
    Summary: 'Unexplained rapid idle battery drain overnight.',
    Suggested_Action: 'Investigate background app telemetry and push an OS battery optimization patch.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261103-M03',
    Timestamp: daysAgo(5),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: 'Devon Miller',
    Is_Anonymous: false,
    Rating: 4,
    Comment: 'Haptic feedback is crisp and satisfying. Software UI feels clean without bloated pre-installed apps.',
    Sentiment: 'Positive',
    Category: 'Usability',
    Summary: 'Satisfying haptics and bloatware-free clean operating system experience.',
    Suggested_Action: 'Continue prioritizing minimal stock-like UI design.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261104-M04',
    Timestamp: daysAgo(8),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: 'Fatima Al-Sayed',
    Is_Anonymous: false,
    Rating: 3,
    Comment: 'Camera is top notch, but the device gets quite warm around the camera module while recording 4K video.',
    Sentiment: 'Mixed',
    Category: 'Performance',
    Summary: 'High praise for camera output alongside thermal buildup during 4K recording.',
    Suggested_Action: 'Optimize camera ISP power consumption in high-resolution video modes.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261105-M05',
    Timestamp: daysAgo(14),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 5,
    Comment: 'Screen refresh rate at 120Hz feels buttery smooth. Outdoor sunlight visibility is outstanding.',
    Sentiment: 'Positive',
    Category: 'Product Quality',
    Summary: 'Exceptional 120Hz display fluidity and high outdoor peak brightness.',
    Suggested_Action: 'Feature display outdoor brightness benchmarks in product specs.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261106-M06',
    Timestamp: daysAgo(21),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: 'Ethan Clark',
    Is_Anonymous: false,
    Rating: 1,
    Comment: 'No charging brick in the retail box, and charging speed with older 18W adapters is painfully slow.',
    Sentiment: 'Negative',
    Category: 'Packaging',
    Summary: 'Frustration over omitted power brick and slow charging on standard adapters.',
    Suggested_Action: 'Offer subsidized charger bundle discount at checkout.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261107-M07',
    Timestamp: daysAgo(35),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 4,
    Comment: 'Fast fingerprint sensor and facial recognition unlock. Solid overall daily driver.',
    Sentiment: 'Positive',
    Category: 'Usability',
    Summary: 'Reliable and instantaneous biometric authentication experience.',
    Suggested_Action: 'Maintain current biometric sensor hardware in future generations.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261108-M08',
    Timestamp: daysAgo(60),
    Product_ID: 'PROD-MOBILE-Y',
    Product_Name: 'Mobile Y',
    Respondent_Name: 'Claire Wu',
    Is_Anonymous: false,
    Rating: 3,
    Comment: 'Price jumped 15% compared to Mobile X last year with only incremental feature improvements.',
    Sentiment: 'Neutral',
    Category: 'Pricing',
    Summary: 'Critique of price increase relative to incremental year-over-year feature updates.',
    Suggested_Action: 'Articulate unique silicon and sensor upgrades more clearly in value propositions.',
    Processing_Status: 'Analyzed',
  },

  // ── Headphones Z Records ──────────────────────────────────────────────────────
  {
    Response_ID: 'FB-20261101-H01',
    Timestamp: daysAgo(2),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: 'Daniel Kim',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'Active noise cancellation completely silences subway commuter chatter. Sound stage is wide and immersive.',
    Sentiment: 'Positive',
    Category: 'Product Quality',
    Summary: 'Class-leading ANC performance for public transit and wide acoustic sound stage.',
    Suggested_Action: 'Spotlight subway and commute noise cancellation in audio demo booths.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261102-H02',
    Timestamp: daysAgo(5),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 2,
    Comment: 'Earcups feel tight on larger heads after 45 minutes of wearing. Headband padding could be softer.',
    Sentiment: 'Negative',
    Category: 'Usability',
    Summary: 'Excessive ear cushion clamping pressure causes discomfort during extended listening.',
    Suggested_Action: 'Redesign ear cushion memory foam and relax headband clamp tension.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261103-H03',
    Timestamp: daysAgo(7),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: 'Maya Patel',
    Is_Anonymous: false,
    Rating: 5,
    Comment: 'Multipoint Bluetooth switches between my laptop and phone instantly without audio stuttering.',
    Sentiment: 'Positive',
    Category: 'Features',
    Summary: 'Flawless and instantaneous dual-device multipoint Bluetooth connectivity.',
    Suggested_Action: 'Emphasize seamless hybrid work multipoint audio switching in marketing.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261104-H04',
    Timestamp: daysAgo(11),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: 'George Evans',
    Is_Anonymous: false,
    Rating: 3,
    Comment: 'Audio quality is great, but the microphone sounds slightly muffled on Zoom conference calls.',
    Sentiment: 'Mixed',
    Category: 'Customer Support',
    Summary: 'Good music reproduction compromised by muffled microphone fidelity on voice calls.',
    Suggested_Action: 'Fine-tune microphone beamforming algorithm in next companion app update.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261105-H05',
    Timestamp: daysAgo(17),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 5,
    Comment: 'Battery life hit 38 hours on a single charge with ANC enabled. Incredible stamina.',
    Sentiment: 'Positive',
    Category: 'Performance',
    Summary: 'Exceeded advertised battery life with 38 hours continuous playback.',
    Suggested_Action: 'Promote 35+ hour verified battery runtime prominently.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261106-H06',
    Timestamp: daysAgo(28),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: 'Rachel Green',
    Is_Anonymous: false,
    Rating: 1,
    Comment: 'Right earbud began crackling after 3 weeks of gentle use. Replacement procedure was slow.',
    Sentiment: 'Negative',
    Category: 'Product Quality',
    Summary: 'Hardware defect: right driver audio crackle accompanied by cumbersome replacement RMA.',
    Suggested_Action: 'Investigate driver soldering in batch #2026-H and streamline RMA process.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261107-H07',
    Timestamp: daysAgo(48),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: '',
    Is_Anonymous: true,
    Rating: 4,
    Comment: 'The included hard travel case is compact and sturdy. Great value for frequent travelers.',
    Sentiment: 'Positive',
    Category: 'Packaging',
    Summary: 'Protective and compact hard travel shell case praised by frequent commuters.',
    Suggested_Action: 'Maintain current travel accessory bundle.',
    Processing_Status: 'Analyzed',
  },
  {
    Response_ID: 'FB-20261108-H08',
    Timestamp: daysAgo(75),
    Product_ID: 'PROD-HEADPHONES-Z',
    Product_Name: 'Headphones Z',
    Respondent_Name: 'Tyler Ward',
    Is_Anonymous: false,
    Rating: 2,
    Comment: 'Companion mobile app requires creating an account just to adjust custom EQ sliders. Unnecessary friction.',
    Sentiment: 'Negative',
    Category: 'Usability',
    Summary: 'Forced account registration to unlock basic hardware EQ functionality.',
    Suggested_Action: 'Allow guest mode in companion app for EQ adjustments without account creation.',
    Processing_Status: 'Analyzed',
  },
];

// ─── Pure Calculation Functions (Zero Hardcoded Derived Numbers) ─────────────

/**
 * Filter feedback records by selected product and date range.
 * @param {Array} records - Raw feedback records
 * @param {string} productId - Specific Product_ID or 'ALL'
 * @param {string} dateRange - '7d' | '30d' | '90d' | 'all'
 */
export function filterFeedback(records, productId = 'ALL', dateRange = '30d') {
  const now = new Date();
  let cutoffDate = null;

  if (dateRange === '7d') {
    cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (dateRange === '30d') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (dateRange === '90d') {
    cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  }

  return records.filter((item) => {
    // Product match (matches either Product_ID or Product_Name)
    if (productId !== 'ALL' && item.Product_ID !== productId && item.Product_Name !== productId) {
      return false;
    }

    // Date match
    if (cutoffDate) {
      if (!item.Timestamp) return false;
      const itemDate = new Date(item.Timestamp);
      if (isNaN(itemDate.getTime()) || itemDate < cutoffDate) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Calculate KPI summary figures dynamically from a list of feedback records.
 */
export function calculateKPIs(records) {
  const total = records.length;
  if (total === 0) {
    return {
      totalFeedback: 0,
      averageRating: '0.0',
      positiveCount: 0,
      positivePct: 0,
      negativeCount: 0,
      negativePct: 0,
    };
  }

  const sumRating = records.reduce((acc, curr) => acc + (Number(curr.Rating) || 0), 0);
  const avg = (sumRating / total).toFixed(1);

  const positiveCount = records.filter((r) => r.Sentiment === 'Positive').length;
  const negativeCount = records.filter((r) => r.Sentiment === 'Negative').length;

  return {
    totalFeedback: total,
    averageRating: avg,
    positiveCount,
    positivePct: Math.round((positiveCount / total) * 100),
    negativeCount,
    negativePct: Math.round((negativeCount / total) * 100),
  };
}

/**
 * Calculate sentiment shares for donut / pie charts.
 *
 * PHASE 6B NOTE: Before Gemini AI analysis runs, Sentiment fields are blank ('').
 * Blank sentiment is counted as 'Pending Analysis', NOT classified as Neutral or Unclear.
 * This prevents misleading charts while AI analysis has not yet been applied.
 */
export function calculateSentimentDistribution(records) {
  const total = records.length;
  if (total === 0) return [];

  const counts = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
    Mixed: 0,
    Unclear: 0,
    'Pending Analysis': 0,
  };

  records.forEach((r) => {
    const sentiment = (r.Sentiment || '').trim();
    if (sentiment === '') {
      counts['Pending Analysis']++;
    } else if (counts[sentiment] !== undefined) {
      counts[sentiment]++;
    } else {
      counts.Unclear++;
    }
  });

  return [
    { name: 'Positive',         count: counts.Positive,           pct: Math.round((counts.Positive / total) * 100),           color: '#10B981' },
    { name: 'Neutral',          count: counts.Neutral,            pct: Math.round((counts.Neutral / total) * 100),            color: '#F59E0B' },
    { name: 'Negative',         count: counts.Negative,           pct: Math.round((counts.Negative / total) * 100),           color: '#EF4444' },
    { name: 'Mixed',            count: counts.Mixed,              pct: Math.round((counts.Mixed / total) * 100),              color: '#8B5CF6' },
    { name: 'Unclear',          count: counts.Unclear,            pct: Math.round((counts.Unclear / total) * 100),            color: '#6B7280' },
    { name: 'Pending Analysis', count: counts['Pending Analysis'], pct: Math.round((counts['Pending Analysis'] / total) * 100), color: '#94A3B8' },
  ].filter((item) => item.count > 0);
}

/**
 * Calculate category breakdown counts.
 *
 * PHASE 6B NOTE: Before Gemini AI analysis runs, Category fields are blank ('').
 * Blank categories are shown as 'Pending Analysis', not silently grouped under 'Other'.
 */
export function calculateCategoryDistribution(records) {
  const map = {};

  records.forEach((r) => {
    const cat = (r.Category || '').trim();
    const displayCat = cat === '' ? 'Pending Analysis' : cat;
    map[displayCat] = (map[displayCat] || 0) + 1;
  });

  // Sort descending by count
  return Object.keys(map)
    .map((category) => ({
      category,
      count: map[category],
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Calculate feedback volume trend over time.
 * Groups by date (formatted as 'MMM D').
 * Records with missing or invalid timestamps are safely excluded from the timeline.
 */
export function calculateFeedbackTrend(records) {
  if (records.length === 0) return [];

  // Filter to records with valid parseable timestamps
  const validRecords = records.filter((r) => r.Timestamp && !isNaN(new Date(r.Timestamp).getTime()));
  if (validRecords.length === 0) return [];

  // Sort chronological
  const sorted = [...validRecords].sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

  const map = {};
  sorted.forEach((r) => {
    const d = new Date(r.Timestamp);
    const key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    map[key] = (map[key] || 0) + 1;
  });

  return Object.keys(map).map((date) => ({
    date,
    feedbackCount: map[date],
  }));
}

/**
 * Calculate rating distribution from 1 to 5 stars.
 */
export function calculateRatingDistribution(records) {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const total = records.length;

  records.forEach((r) => {
    const star = Math.min(Math.max(Number(r.Rating) || 0, 1), 5);
    counts[star] = (counts[star] || 0) + 1;
  });

  return [5, 4, 3, 2, 1].map((stars) => ({
    stars: `${stars} ★`,
    count: counts[stars],
    pct: total > 0 ? Math.round((counts[stars] / total) * 100) : 0,
  }));
}

/**
 * Calculate product comparison table when "All Products" is selected.
 */
export function calculateProductComparison(records, products) {
  return products.map((prod) => {
    const prodRecords = records.filter(
      (r) =>
        r.Product_ID === prod.Product_ID ||
        (r.Product_Name && prod.Product_Name && r.Product_Name.trim().toLowerCase() === prod.Product_Name.trim().toLowerCase())
    );
    const kpis = calculateKPIs(prodRecords);

    return {
      productId: prod.Product_ID,
      productName: prod.Product_Name,
      description: prod.Description,
      totalFeedback: kpis.totalFeedback,
      averageRating: kpis.averageRating,
      positivePct: kpis.positivePct,
      negativePct: kpis.negativePct,
    };
  });
}
