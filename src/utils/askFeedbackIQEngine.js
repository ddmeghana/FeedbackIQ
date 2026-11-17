/**
 * FeedbackIQ — Ask FeedbackIQ Intelligence Engine
 *
 * Provides deterministic, evidence-grounded question answering over the live
 * Google Sheets Feedback dataset.
 *
 * DYNAMIC DATABASE ARCHITECTURE:
 * - Zero dependency on specific product names (Laptop X, Mobile Y, etc.).
 * - Dynamically adapts to any product registry (Dataset A, B, C, etc.).
 * - Selected product and date range define the MAXIMUM permitted dataset.
 * - Questions may narrow the permitted dataset, but can NEVER expand it.
 * - Resolves unknown products and ambiguous component inquiries with clear guidance.
 * - Extracts qualified concerns from Neutral and Positive feedback comments.
 * - Classifies recommendations into 4 explicit actionable streams:
 *     1. Product Quality & Design Improvements
 *     2. Performance & Reliability Improvements
 *     3. Customer Experience Improvements
 *     4. Marketing & Communication Opportunities
 * - Zero new AI inference calls; uses deterministic calculations and stored Groq analysis.
 */

export const DOMAIN_REFUSAL_MESSAGE =
  "I'm designed specifically to analyse your organisation's customer feedback. Please ask me about product feedback, customer sentiment, recurring issues, comparisons or improvement recommendations.";

// Common standalone hardware / device product category nouns used to detect unregistered product queries
const PRODUCT_DEVICE_NOUNS = [
  'mouse', 'mice',
  'keyboard', 'keyboards',
  'printer', 'printers',
  'monitor', 'monitors',
  'smartwatch', 'smartwatches', 'watch', 'watches',
  'tablet', 'tablets',
  'laptop', 'laptops', 'notebook', 'notebooks', 'ultrabook',
  'mobile', 'mobiles', 'phone', 'phones', 'smartphone', 'smartphones',
  'headphone', 'headphones', 'earphone', 'earphones', 'earbuds', 'headset',
  'tv', 'television',
  'drone', 'drones',
  'camera', 'cameras',
  'router', 'routers',
  'console', 'consoles',
];

/**
 * Validates whether a query is in-domain, out-of-domain, or mixed.
 */
export function validateQueryDomain(query, products = []) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, isGreeting: false, isMixed: false, refusal: DOMAIN_REFUSAL_MESSAGE };
  }

  const q = query.trim().toLowerCase();

  // 1. Prompt Injection Defenses
  const injectionPatterns = [
    /ignore\s+(all\s+|any\s+)?(previous\s+|prior\s+)?instructions/i,
    /system\s*(prompt|instructions|override)/i,
    /you\s+are\s+now\s+(a\s+|an\s+)?(general|unrestricted|jailbroken|chatgpt|dan)/i,
    /bypass\s+(restrictions|guardrails|rules)/i,
    /pretend\s+to\s+be/i,
    /disregard\s+(all\s+|any\s+)?rules/i,
  ];
  if (injectionPatterns.some((pattern) => pattern.test(q))) {
    return { isValid: false, isGreeting: false, isMixed: false, refusal: DOMAIN_REFUSAL_MESSAGE };
  }

  // 2. Greeting / Empty Check
  const greetingPatterns = /^(hi|hello|hey|greetings|hola|test|ping|help)\b[\s!.?]*$/i;
  if (greetingPatterns.test(q)) {
    return {
      isValid: false,
      isGreeting: true,
      isMixed: false,
      greetingMessage:
        "Hello! I am FeedbackIQ's customer feedback analyst. Ask me about product feedback, customer sentiment, recurring issues, cross-product comparisons, or improvement recommendations.",
    };
  }

  // 3. Out-of-Domain Indicators
  const outOfDomainPatterns = [
    /\bcapital of\b/i,
    /\bweather in\b/i,
    /\b(cricket|football|basketball|soccer|tennis|golf|nfl|nba|ipl)\b/i,
    /\bwho won\b/i,
    /\bpresident of\b/i,
    /\bprime minister\b/i,
    /\bhow old is\b/i,
    /\bpopulation of\b/i,
    /\btallest mountain\b/i,
    /\bdistance between\b/i,
    /\bcurrency of\b/i,
    /\b(olympics|world cup)\b/i,
    /\b(write|generate|give me)\s+(a\s+)?(python|javascript|code|script|function|program|html|css|sql|regex)\b/i,
    /\bleetcode\b/i,
    /\b(write|generate|tell me)\s+(a\s+)?(poem|joke|story|essay|song|lyrics|riddle)\b/i,
    /\bwhat is (2\s*\+\s*2|quantum|photosynthesis)\b/i,
    /\bmarket price\b/i,
    /\bhow much does .* cost to buy\b/i,
    /\bwhere to buy\b/i,
    /\bstore locations\b/i,
  ];

  const hasOutOfDomainMatch = outOfDomainPatterns.some((p) => p.test(q));

  // 4. In-Domain Indicators (Comprehensive Product & Feedback Domain)
  const inDomainPatterns = [
    /\b(feedback|response|responses|comment|comments|review|reviews|opinion|opinions|verbatim)\b/i,
    /\b(quality|build quality|durability|durable|reliable|reliability|lifespan|life span|hardware|materials|weight|chassis|finish)\b/i,
    /\b(performance|usability|usable|speed|slow|fast|heating|overheat|overheating|thermal|fan|noise|loud|battery|charging|charger|screen|display|oled|trackpad|keyboard|camera|audio|speakers|sound|bass)\b/i,
    /\b(sentiment|positive|negative|neutral|mixed|happy|unhappy|satisfied|dissatisfied|satisfaction|dissatisfaction|like|dislike|hate|love|enjoy|delight)\b/i,
    /\b(complaint|complaints|complain|complaining|friction|issue|issues|problem|problems|defect|defects|bug|bugs|glitch|pain point|pain points|concern|concerns|praise|appreciation|appreciate|strengths|strength|weakness|weaknesses|favorite|favourite)\b/i,
    /\b(rating|ratings|rated|star|stars|score|scores|csat|nps|average rating|highest rated|lowest rated)\b/i,
    /\b(improve|improvement|improvements|maintain|maintaining|maintenance|recommend|recommendation|recommendations|action|actions|suggested action|fix|fixing|priority|priorities|next steps|focus on)\b/i,
    /\b(category|categories|categorized|topic|topics|theme|themes|breakdown|distribution|volume|most feedback)\b/i,
    /\b(compare|comparison|versus|vs|better than|worse than|rank|ranking|leaderboard|benchmark)\b/i,
    /\b(summarize|summary|overview|what are customers saying|what are people saying|customer thoughts)\b/i,
    /\b(analyzed|pending|failed|import|imported)\b/i,
  ];

  // Also check if any registered product name or ID is mentioned, or general device words
  const mentionsRegisteredProduct = products.some((p) => {
    const id = (p.Product_ID || '').toLowerCase();
    const name = (p.Product_Name || '').toLowerCase();
    return (id && q.includes(id)) || (name && q.includes(name));
  });

  const mentionsDeviceNoun = PRODUCT_DEVICE_NOUNS.some((dn) => new RegExp(`\\b${dn}\\b`, 'i').test(q));

  const hasInDomainKeyword = inDomainPatterns.some((p) => p.test(q));
  const isInDomain = hasInDomainKeyword || mentionsRegisteredProduct || mentionsDeviceNoun;

  // Check if query is about sales operations combined with quality/product
  const mentionsSales = /\bsales\b/i.test(q);
  const isSalesQualityQuestion = mentionsSales && isInDomain;

  // Mixed Query Handling
  if (hasOutOfDomainMatch && isInDomain) {
    return {
      isValid: true,
      isGreeting: false,
      isMixed: true,
      isSalesQuality: isSalesQualityQuestion,
      mixedNotice:
        "Notice: General knowledge or non-feedback queries cannot be answered. Here is the feedback intelligence for your inquiry:",
    };
  }

  if (hasOutOfDomainMatch || !isInDomain) {
    return { isValid: false, isGreeting: false, isMixed: false, refusal: DOMAIN_REFUSAL_MESSAGE };
  }

  return { isValid: true, isGreeting: false, isMixed: false, isSalesQuality: isSalesQualityQuestion };
}

/**
 * Applies date range filtering on a record array based on Timestamp.
 */
export function filterRecordsByDate(records, dateRange) {
  if (!dateRange || dateRange === 'all') {
    return records;
  }

  const now = new Date();
  let days = 30;
  if (dateRange === '7d') days = 7;
  else if (dateRange === '30d') days = 30;
  else if (dateRange === '90d') days = 90;

  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return records.filter((r) => {
    if (!r.Timestamp) return false;
    const t = new Date(r.Timestamp);
    return !isNaN(t.getTime()) && t >= cutoff;
  });
}

/**
 * Resolves product mentions in query against registered products.
 */
export function resolveMentionedProducts(query, products = []) {
  if (!query || products.length === 0) return [];
  const q = query.toLowerCase();

  const matched = [];
  products.forEach((p) => {
    const id = (p.Product_ID || '').toLowerCase();
    const name = (p.Product_Name || '').toLowerCase();

    // Check full ID or exact product name
    if (id && q.includes(id)) {
      matched.push(p);
      return;
    }
    if (name && q.includes(name)) {
      matched.push(p);
      return;
    }

    // Match word tokens of product name if length >= 3 and not generic
    const nameTokens = name.split(/\s+/).filter((t) => t.length >= 3);
    for (const token of nameTokens) {
      if (new RegExp(`\\b${token}\\b`, 'i').test(q)) {
        if (!matched.some((m) => m.Product_ID === p.Product_ID)) {
          matched.push(p);
        }
      }
    }
  });

  return matched;
}

/**
 * Detects whether the query explicitly mentions a hardware/device noun that is NOT in the registry.
 */
export function detectUnregisteredProductMention(query, products = []) {
  if (!query) return null;
  const q = query.toLowerCase();

  // Find all device nouns mentioned in query
  const foundDeviceNouns = PRODUCT_DEVICE_NOUNS.filter((noun) =>
    new RegExp(`\\b${noun}\\b`, 'i').test(q)
  );

  if (foundDeviceNouns.length === 0) return null;

  // For each found noun, check if ANY product in registry matches it
  for (const noun of foundDeviceNouns) {
    const matchesAnyRegistered = products.some((p) => {
      const pName = (p.Product_Name || '').toLowerCase();
      const pId = (p.Product_ID || '').toLowerCase();
      return pName.includes(noun) || pId.includes(noun);
    });

    if (!matchesAnyRegistered) {
      // E.g. 'mouse' mentioned, but no product has 'mouse' in its name/ID!
      return noun.charAt(0).toUpperCase() + noun.slice(1);
    }
  }

  return null;
}

/**
 * Enhanced Concern Detector:
 * Identifies complaints and friction from:
 * 1. Negative & Mixed sentiment records.
 * 2. Neutral records containing qualified concerns or contrastive clauses.
 * 3. Positive records containing qualified criticism.
 */
export function extractFeedbackConcerns(records) {
  const negativeRecords = [];
  const qualifiedNeutral = [];
  const qualifiedPositive = [];

  const contrastiveRegex = /\b(but|however|although|though|except|could be|should be|wish|rather than|needs improvement)\b/i;
  const frictionRegex = /\b(slow|heavy|hot|heat|loud|noisy|fan|throttling|smudge|scratch|drain|drains|draining|lag|lags|laggy|flicker|glitch|dim|stiff|loose|bulky|expensive|confusing|bug|bugs|problem|problems|issue|issues|defect|defects|poor|bad|disappointing|disappointed|stuck|delay)\b/i;

  records.forEach((r) => {
    const st = (r.Processing_Status || '').toLowerCase();
    if (st === 'failed' || st === 'error') return;

    const sent = (r.Sentiment || '').toLowerCase();
    const comment = `${r.Comment || ''} ${r.Summary || ''}`;

    if (sent === 'negative' || sent === 'mixed') {
      negativeRecords.push(r);
    } else if (sent === 'neutral') {
      if (contrastiveRegex.test(comment) || frictionRegex.test(comment)) {
        qualifiedNeutral.push(r);
      }
    } else if (sent === 'positive') {
      if (contrastiveRegex.test(comment) && frictionRegex.test(comment)) {
        qualifiedPositive.push(r);
      }
    }
  });

  return {
    negativeRecords,
    qualifiedNeutral,
    qualifiedPositive,
    allConcerns: [...negativeRecords, ...qualifiedNeutral, ...qualifiedPositive],
  };
}

/**
 * Classifies recommendations into 4 explicit actionable streams:
 * 1. Product Quality & Design Improvements
 * 2. Performance & Reliability Improvements
 * 3. Customer Experience Improvements
 * 4. Marketing & Communication Opportunities
 */
export function classifyRecommendation(actionText, category = '', comment = '') {
  const text = `${actionText} ${category} ${comment}`.toLowerCase();

  if (/\b(market|marketing|highlight|promote|showcase|advertise|communication|educate|messaging|positioning|sales asset|feature in)\b/i.test(text)) {
    return 'Marketing & Communication Opportunities';
  }
  if (/\b(performance|thermal|fan|cooling|firmware|battery|power|speed|fast|throttle|charge|charging|drain|optimize|heat|driver|software update|patch|lag|slow)\b/i.test(text)) {
    return 'Performance & Reliability Improvements';
  }
  if (/\b(quality|design|hardware|chassis|coating|material|materials|display|screen|oled|keyboard|trackpad|hinge|durability|build|speaker|audio|bezel|finish|oleophobic|tactile|weight|ergonomic)\b/i.test(text)) {
    return 'Product Quality & Design Improvements';
  }
  return 'Customer Experience Improvements';
}

/**
 * Core Answer Generator with Dynamic Database Support & Strict Scope Enforcement
 */
export function generateFeedbackAnswer(query, context, conversationHistory = []) {
  const {
    products = [],
    allRecords = [],
    selectedProduct = 'ALL',
    dateRange = '30d',
    dateRangeLabel = 'Last 30 Days',
  } = context;

  // ── STEP 1: VALIDATE DOMAIN ──────────────────────────────────────────────
  const domainValidation = validateQueryDomain(query, products);
  if (!domainValidation.isValid) {
    if (domainValidation.isGreeting) {
      return {
        answer: domainValidation.greetingMessage,
        type: 'greeting',
        groundedRecords: [],
      };
    }
    return {
      answer: domainValidation.refusal,
      type: 'refusal',
      groundedRecords: [],
    };
  }

  const q = query.trim().toLowerCase();

  // ── STEP 2: BUILD MAXIMUM PERMITTED DATASET FROM SELECTED SCOPE ──────────
  // Rule: Selected scope defines the maximum permitted dataset.
  let permittedRecords = allRecords;

  const isIndividualScope = selectedProduct !== 'ALL' && Boolean(selectedProduct);
  const currentScopeProduct = isIndividualScope
    ? products.find((p) => p.Product_ID === selectedProduct) || null
    : null;

  if (isIndividualScope) {
    const targetId = (selectedProduct || '').trim();
    const targetName = (currentScopeProduct?.Product_Name || '').trim().toLowerCase();

    permittedRecords = allRecords.filter((r) => {
      if (r.Product_ID && r.Product_ID.trim() === targetId) return true;
      if (targetName && r.Product_Name && r.Product_Name.trim().toLowerCase() === targetName) return true;
      return false;
    });
  }

  // Apply selected date range
  permittedRecords = filterRecordsByDate(permittedRecords, dateRange);

  // ── STEP 3: CHECK FOR UNREGISTERED PRODUCT QUERY ─────────────────────────
  const unregisteredNoun = detectUnregisteredProductMention(q, products);
  const mentionedProducts = resolveMentionedProducts(q, products);

  if (unregisteredNoun && mentionedProducts.length === 0) {
    const prodList = products.map((p) => `• **${p.Product_Name}** (${p.Product_ID})`).join('\n') || '*(No products currently registered)*';
    return {
      answer:
        `### [Unregistered Product] Product Not Found in Current Database\n\n` +
        `**${unregisteredNoun}** is not found in your organisation's current product registry.\n\n` +
        `The registered products currently available in FeedbackIQ are:\n${prodList}\n\n` +
        `Ask FeedbackIQ can only evaluate customer feedback for products that exist in your database. Please ask about one of your registered products or add ${unregisteredNoun} in Manage Products.`,
      type: 'unknown_product',
      targetProductId: null,
      groundedRecords: [],
    };
  }

  // ── STEP 4: AMBIGUOUS COMPONENT / SHORT QUERY HANDLING ───────────────────
  // E.g. Single-word query like "mobile?" or "smartwatch?"
  const isShortProductQuery = /^[a-z0-9\s-]{2,20}\?*$/i.test(q) && q.split(/\s+/).length <= 2;
  if (isShortProductQuery && mentionedProducts.length === 1 && !/\b(complain|praise|rating|improve|unhappy|good|bad)\b/i.test(q)) {
    const prod = mentionedProducts[0];
    return {
      answer:
        `### [Product Reference] ${prod.Product_Name} Clarification\n\n` +
        `You referenced **${prod.Product_Name}** (${prod.Product_ID}). What aspect would you like to analyze?\n\n` +
        `**Suggested inquiries for ${prod.Product_Name}:**\n` +
        `• *"What are customer complaints about ${prod.Product_Name}?"*\n` +
        `• *"What do customers appreciate most about ${prod.Product_Name}?"*\n` +
        `• *"What is the average rating for ${prod.Product_Name}?"*\n` +
        `• *"What are the recommended improvement actions for ${prod.Product_Name}?"*`,
      type: 'product_clarification',
      targetProductId: prod.Product_ID,
      groundedRecords: [],
    };
  }

  // Generic component ambiguity: E.g. "How to maintain speaker bass?" when no specific product was named
  const isComponentInquiry = /\b(speaker|speakers|bass|camera|cameras|screen|display|trackpad|keyboard|battery|charger)\b/i.test(q);
  if (isComponentInquiry && mentionedProducts.length === 0 && !isIndividualScope && products.length > 1) {
    // Check if previous turn established a product
    const lastTurn = conversationHistory.length > 0 ? conversationHistory[conversationHistory.length - 1] : null;
    if (!lastTurn || !lastTurn.targetProductId) {
      const compWord = q.match(/\b(speaker bass|speaker|bass|camera|screen|display|trackpad|keyboard|battery|charger)\b/i)?.[0] || 'component';
      const prodList = products.map((p) => `• **${p.Product_Name}** (${p.Product_ID})`).join('\n');
      return {
        answer:
          `### [Ambiguous Component Reference] Product Clarification Needed\n\n` +
          `Your question regarding **${compWord}** could relate to several products in your active portfolio.\n\n` +
          `Which registered product would you like to inspect?\n${prodList}\n\n` +
          `Please specify the product (for example: *"How is the ${compWord} on ${products[0].Product_Name}?"*).`,
        type: 'ambiguous_clarification',
        targetProductId: null,
        groundedRecords: [],
      };
    }
  }

  // ── STEP 5: ENFORCE SCOPE BOUNDARIES (Individual Scope Restriction) ───────
  if (isIndividualScope) {
    const scopeId = currentScopeProduct?.Product_ID;
    const scopeName = currentScopeProduct?.Product_Name || selectedProduct;

    // Check if user is asking to compare products or asking about a different product
    const otherMentioned = mentionedProducts.filter((p) => p.Product_ID !== scopeId);
    const isComparisonQuery = /\b(compare|comparison|versus|vs|difference between)\b/i.test(q);

    if (otherMentioned.length > 0 || (isComparisonQuery && mentionedProducts.length > 1)) {
      const foreignNames = otherMentioned.map((p) => p.Product_Name).join(', ') || 'other products';
      return {
        answer:
          `### [Scope Restriction] Out-of-Scope Product Requested\n\n` +
          `**${foreignNames}** is outside your currently selected product scope (**${scopeName}**).\n\n` +
          `Ask FeedbackIQ cannot access or disclose customer feedback for other products while an individual product filter is active. ` +
          `To analyze or compare feedback across multiple products, please switch your dashboard scope to **All Products** or select ${foreignNames} in the header dropdown.`,
        type: 'scope_refusal',
        targetProductId: scopeId,
        groundedRecords: [],
      };
    }
  }

  // ── STEP 6: QUESTION-LEVEL NARROWING (All Products Scope Only) ────────────
  let finalRecords = permittedRecords;
  let targetProduct = isIndividualScope ? currentScopeProduct : null;
  let comparedProducts = [];

  if (!isIndividualScope) {
    if (mentionedProducts.length === 1) {
      targetProduct = mentionedProducts[0];
      finalRecords = permittedRecords.filter(
        (r) =>
          r.Product_ID === targetProduct.Product_ID ||
          (r.Product_Name && r.Product_Name.toLowerCase() === targetProduct.Product_Name.toLowerCase())
      );
    } else if (mentionedProducts.length > 1) {
      comparedProducts = mentionedProducts;
      finalRecords = permittedRecords.filter((r) =>
        mentionedProducts.some(
          (mp) =>
            r.Product_ID === mp.Product_ID ||
            (r.Product_Name && r.Product_Name.toLowerCase() === mp.Product_Name.toLowerCase())
        )
      );
    } else if (conversationHistory.length > 0) {
      // Follow-up context inheritance
      const lastTurn = conversationHistory[conversationHistory.length - 1];
      if (lastTurn && lastTurn.targetProductId) {
        const prevProd = products.find((p) => p.Product_ID === lastTurn.targetProductId);
        if (prevProd) {
          targetProduct = prevProd;
          finalRecords = permittedRecords.filter(
            (r) =>
              r.Product_ID === targetProduct.Product_ID ||
              (r.Product_Name && r.Product_Name.toLowerCase() === targetProduct.Product_Name.toLowerCase())
          );
        }
      }
    }
  }

  const scopeLabel = targetProduct
    ? targetProduct.Product_Name
    : comparedProducts.length > 0
    ? comparedProducts.map((p) => p.Product_Name).join(' vs ')
    : isIndividualScope
    ? currentScopeProduct?.Product_Name || selectedProduct
    : 'All Products (Portfolio-Wide)';

  // ── STEP 7: DATA PARTITIONING OVER PERMITTED RECORDS ──────────────────────
  const analyzed = [];
  const pending = [];
  const failed = [];
  const positive = [];
  const neutral = [];
  const negative = [];
  const mixed = [];

  finalRecords.forEach((r) => {
    const st = (r.Processing_Status || '').trim().toLowerCase();
    const sent = (r.Sentiment || '').trim().toLowerCase();

    if (st === 'failed' || st === 'error') {
      failed.push(r);
      return;
    }
    if (st === 'pending' || st === 'processing') {
      pending.push(r);
      return;
    }
    if (st === 'analyzed' || (st === '' && sent !== '')) {
      analyzed.push(r);
      if (sent === 'positive') positive.push(r);
      else if (sent === 'neutral') neutral.push(r);
      else if (sent === 'negative') negative.push(r);
      else if (sent === 'mixed') mixed.push(r);
      return;
    }
    pending.push(r);
  });

  const validRatings = finalRecords.filter(
    (r) => typeof r.Rating === 'number' && !isNaN(r.Rating) && r.Rating >= 1 && r.Rating <= 5
  );
  const avgRating =
    validRatings.length > 0
      ? (validRatings.reduce((sum, r) => sum + r.Rating, 0) / validRatings.length).toFixed(1)
      : 'N/A';

  // ── STEP 8: EMPTY DATASET HANDLING ───────────────────────────────────────
  if (finalRecords.length === 0) {
    let emptyMsg = `### No Feedback Available: ${scopeLabel}\n\n` +
      `No feedback records were found for **${scopeLabel}** matching the selected date range (**${dateRangeLabel}**).\n\n` +
      `• Total verified records in this scope: **0**\n` +
      `• Suggestion: Try adjusting your date filter to **All Time** or selecting a different product scope.`;

    if (domainValidation.isMixed) {
      emptyMsg = `${domainValidation.mixedNotice}\n\n${emptyMsg}`;
    }

    return {
      answer: emptyMsg,
      type: 'empty',
      targetProductId: targetProduct?.Product_ID || null,
      groundedRecords: [],
    };
  }

  // Sales disclaimer prefix if query inquired about sales operations
  let salesDisclaimer = '';
  if (domainValidation.isSalesQuality) {
    salesDisclaimer =
      `*Clarification: FeedbackIQ evaluates product quality, customer satisfaction, and complaints based on customer feedback. It does not track internal sales figures, sales targets, or retail transaction pipelines.*\n\n`;
  }

  // ── STEP 9: INTENT EVALUATION & GROUNDED GENERATION ───────────────────────
  let answerContent = '';
  const groundedRecords = [];

  // Extract concerns (including qualified concerns from neutral and positive records)
  const { negativeRecords, qualifiedNeutral, qualifiedPositive, allConcerns } = extractFeedbackConcerns(finalRecords);

  // ── INTENT A: COMPLAINTS / UNHAPPY / FRICTION / DEFECTS / RECURRING ISSUES ──
  const isComplaintsQuery =
    /\b(unhappy|complaint|complaints|complain|complaining|friction|issue|issues|problem|problems|worst|dislike|hate|poor|bad|bug|glitch|negative|concern|concerns|defect|defects|recurring|dissatisfied|weakness|weaknesses)\b/i.test(q);

  if (isComplaintsQuery) {
    if (allConcerns.length === 0) {
      answerContent =
        `### Customer Concerns & Friction: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** Total responses analyzed: **${analyzed.length}** | Negative/Friction feedback: **0 (0%)**\n\n` +
        `There are **no negative customer feedback records or qualified friction points** recorded for ${scopeLabel} in the **${dateRangeLabel}** dataset.\n\n` +
        (pending.length > 0
          ? `*Note: ${pending.length} record(s) are currently pending AI processing.*`
          : '');
    } else {
      groundedRecords.push(...allConcerns);

      // Group concerns by category
      const catGroups = {};
      allConcerns.forEach((r) => {
        const cat = r.Category || 'General Experience';
        if (!catGroups[cat]) catGroups[cat] = [];
        catGroups[cat].push(r);
      });

      const catList = Object.entries(catGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([cat, recs]) => {
          const count = recs.length;
          const countLabel = count === 1 ? '1 isolated report' : `${count} reports`;
          const examples = recs
            .map((r) => {
              const sentLabel = (r.Sentiment || '').toLowerCase() === 'neutral'
                ? ' [Neutral with qualified concern]'
                : (r.Sentiment || '').toLowerCase() === 'positive'
                ? ' [Positive with qualified friction]'
                : '';
              return `  - **[${r.Response_ID || 'ID'}]** (${r.Product_Name || scopeLabel}, ${r.Rating ? `${r.Rating}★` : 'No rating'}${sentLabel}): "${r.Summary || r.Comment}"` +
                (r.Suggested_Action ? `\n    *Action:* ${r.Suggested_Action}` : '');
            })
            .join('\n');
          return `• **${cat}** (${countLabel}):\n${examples}`;
        })
        .join('\n\n');

      const isLimitedEvidence = allConcerns.length === 1;

      answerContent =
        `### Customer Concerns & Friction: ${scopeLabel}\n\n` +
        `**1. Customer Feedback:**\n` +
        `Across **${analyzed.length}** analyzed submissions in **${dateRangeLabel}**, **${allConcerns.length}** customer submission(s) identified areas of friction or criticism (${Math.round((allConcerns.length / (analyzed.length || 1)) * 100)}% of analyzed feedback):\n` +
        `• Explicit Negative Sentiment: **${negativeRecords.length}**\n` +
        (qualifiedNeutral.length > 0 ? `• Qualified Concerns in Neutral Feedback: **${qualifiedNeutral.length}**\n` : '') +
        (qualifiedPositive.length > 0 ? `• Qualified Caveats in Positive Reviews: **${qualifiedPositive.length}**\n` : '') +
        `\n**2. Key Observations & Categories:**\n` +
        `${catList}\n\n` +
        `**3. Evidence Assessment:**\n` +
        (isLimitedEvidence
          ? `*Notice: Only 1 isolated customer concern is recorded in this scope. This represents an individual report rather than a confirmed recurring defect across the product line.*`
          : `*Identified from ${allConcerns.length} distinct customer submissions across ${Object.keys(catGroups).length} category areas.*`) +
        (pending.length > 0 ? `\n\n*(${pending.length} response(s) are still pending AI processing).*` : '');
    }
  }

  // ── INTENT B: PRAISE / APPRECIATION / STRENGTHS / BEST / POSITIVE ─────────
  else if (
    /\b(appreciate|praise|love|strengths|strength|good|great|best|happy|positive|delight|favorite|favourite|enjoy)\b/i.test(q)
  ) {
    if (positive.length === 0) {
      answerContent =
        `### What Customers Appreciate: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** Analyzed responses: **${analyzed.length}** | Positive feedback: **0 (0%)**\n\n` +
        `No positive feedback records are recorded for ${scopeLabel} in the **${dateRangeLabel}** dataset.\n\n` +
        (pending.length > 0 ? `*(${pending.length} records are pending analysis).*` : '');
    } else {
      groundedRecords.push(...positive);

      const praiseGroups = {};
      positive.forEach((r) => {
        const cat = r.Category || 'General Experience';
        if (!praiseGroups[cat]) praiseGroups[cat] = [];
        praiseGroups[cat].push(r);
      });

      const praiseList = Object.entries(praiseGroups)
        .sort((a, b) => b[1].length - a[1].length)
        .map(([cat, recs]) => {
          const count = recs.length;
          const phrase = count === 1 ? '1 customer comment' : `${count} customer comments`;
          const examples = recs
            .map(
              (r) =>
                `  - **[${r.Response_ID || 'ID'}]** (${r.Product_Name || scopeLabel}, ${r.Rating ? `${r.Rating}★` : 'No rating'}): "${r.Summary || r.Comment}"`
            )
            .join('\n');
          return `• **${cat}** (${phrase}):\n${examples}`;
        })
        .join('\n\n');

      answerContent =
        `### What Customers Appreciate: ${scopeLabel}\n\n` +
        `**1. Feedback Summary:**\n` +
        `**${positive.length}** of **${analyzed.length}** analyzed responses expressed positive sentiment (${Math.round((positive.length / (analyzed.length || 1)) * 100)}%).\n\n` +
        `**2. Customer Praise Attributes:**\n` +
        `${praiseList}\n\n` +
        (pending.length > 0 ? `*(${pending.length} records currently pending analysis).*` : '');
    }
  }

  // ── INTENT C: RATINGS / SCORES / STARS / CSAT ──────────────────────────────
  else if (/\b(rating|ratings|rate|rated|stars|star|score|scores|csat|nps)\b/i.test(q)) {
    if (validRatings.length === 0) {
      answerContent =
        `### Rating Analysis: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** Average Rating: **N/A** (0 valid 1–5 star ratings recorded out of ${finalRecords.length} total responses in ${dateRangeLabel}).\n\n` +
        `None of the current records contain a valid numeric rating between 1 and 5.`;
    } else if (!isIndividualScope && !targetProduct && products.length > 1) {
      // Dynamic portfolio leaderboard
      const prodRatings = products.map((prod) => {
        const pRecs = finalRecords.filter(
          (r) =>
            r.Product_ID === prod.Product_ID ||
            (r.Product_Name && r.Product_Name.toLowerCase() === prod.Product_Name.toLowerCase())
        );
        const pValid = pRecs.filter(
          (r) => typeof r.Rating === 'number' && !isNaN(r.Rating) && r.Rating >= 1 && r.Rating <= 5
        );
        const pAvg =
          pValid.length > 0
            ? (pValid.reduce((sum, r) => sum + r.Rating, 0) / pValid.length).toFixed(1)
            : 'N/A';
        return { product: prod, avg: pAvg, count: pValid.length, total: pRecs.length };
      });

      prodRatings.sort((a, b) => {
        if (a.avg === 'N/A') return 1;
        if (b.avg === 'N/A') return -1;
        return Number(b.avg) - Number(a.avg);
      });

      const highest = prodRatings[0];
      const lowest = prodRatings.filter((p) => p.avg !== 'N/A').slice(-1)[0] || highest;

      const rankingText = prodRatings
        .map(
          (p, idx) =>
            `${idx + 1}. **${p.product.Product_Name}** (${p.product.Product_ID}): **${p.avg !== 'N/A' ? `${p.avg} / 5.0` : 'No ratings'}** (${p.count} ratings, ${p.total} responses)`
        )
        .join('\n');

      answerContent =
        `### Product Rating Benchmark (${dateRangeLabel})\n\n` +
        `**[Calculated Metric]** Portfolio Average Rating: **${avgRating} / 5.0** (based on ${validRatings.length} verified ratings across all products).\n\n` +
        `• **Highest Rated Product:** **${highest.product.Product_Name}** (${highest.avg} / 5.0)\n` +
        (lowest.product.Product_ID !== highest.product.Product_ID
          ? `• **Lowest Rated Product:** **${lowest.product.Product_Name}** (${lowest.avg} / 5.0)\n\n`
          : '\n') +
        `**Product Leaderboard:**\n${rankingText}`;
    } else {
      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      validRatings.forEach((r) => starCounts[r.Rating]++);

      const breakdown = [5, 4, 3, 2, 1]
        .map(
          (star) =>
            `• **${star} Stars:** ${starCounts[star]} (${Math.round((starCounts[star] / validRatings.length) * 100)}%)`
        )
        .join('\n');

      answerContent =
        `### Rating Breakdown: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** Average Rating: **${avgRating} / 5.0** based on **${validRatings.length}** verified customer ratings (${dateRangeLabel}).\n\n` +
        `**Rating Distribution:**\n${breakdown}`;
    }
  }

  // ── INTENT D: IMPROVEMENT & 4-STREAM RECOMMENDATIONS ──────────────────────
  else if (
    /\b(maintain|maintaining|quality|improve|improvement|recommend|recommendation|recommendations|action|actions|suggested action|how can we|what should we|fix|durable|reliable)\b/i.test(q)
  ) {
    const recordsWithActions = analyzed.filter(
      (r) => r.Suggested_Action && r.Suggested_Action.trim() !== ''
    );
    groundedRecords.push(...recordsWithActions, ...allConcerns);

    // Group recommendations into 4 explicit streams
    const streamGroups = {
      'Product Quality & Design Improvements': [],
      'Performance & Reliability Improvements': [],
      'Customer Experience Improvements': [],
      'Marketing & Communication Opportunities': [],
    };

    recordsWithActions.forEach((r) => {
      const stream = classifyRecommendation(r.Suggested_Action, r.Category, r.Comment);
      streamGroups[stream].push({
        action: r.Suggested_Action.trim(),
        product: r.Product_Name || scopeLabel,
        responseId: r.Response_ID,
      });
    });

    const formattedStreams = Object.entries(streamGroups)
      .filter(([_, items]) => items.length > 0)
      .map(([streamName, items]) => {
        // Group identical action texts
        const groupedMap = {};
        items.forEach((item) => {
          if (!groupedMap[item.action]) {
            groupedMap[item.action] = { action: item.action, products: new Set(), ids: [] };
          }
          groupedMap[item.action].products.add(item.product);
          groupedMap[item.action].ids.push(item.responseId);
        });

        const list = Object.values(groupedMap)
          .map((g) => {
            const prods = Array.from(g.products).join(', ');
            const refs = g.ids.slice(0, 3).join(', ');
            const countStr = g.ids.length === 1 ? '1 response' : `${g.ids.length} responses`;
            return `  - **${g.action}**\n    *Target Product(s):* ${prods} | *Evidence:* ${countStr} (${refs})`;
          })
          .join('\n');

        return `• **${streamName}:**\n${list}`;
      })
      .join('\n\n');

    const frictionSnippets = allConcerns
      .slice(0, 3)
      .map(
        (r) =>
          `• "${r.Summary || r.Comment}" — *${r.Product_Name || scopeLabel} [${r.Response_ID}]*`
      )
      .join('\n');

    answerContent =
      `### Quality Improvement & Maintenance Strategy: ${scopeLabel}\n\n` +
      `**1. Customer Feedback & Friction Points:**\n` +
      (allConcerns.length > 0
        ? `${frictionSnippets}\n\n`
        : `No negative quality defects or complaints are reported in this scope.\n\n`) +
      `**2. Key Observations:**\n` +
      `• Analyzed feedback volume: **${analyzed.length}** | Average Rating: **${avgRating} / 5.0**\n` +
      `• Positive Sentiment: **${analyzed.length > 0 ? Math.round((positive.length / analyzed.length) * 100) : 0}%** | Negative Sentiment: **${analyzed.length > 0 ? Math.round((negative.length / analyzed.length) * 100) : 0}%**\n\n` +
      `**3. Recommended Actions (Classified into Actionable Streams):**\n` +
      (formattedStreams
        ? `${formattedStreams}\n\n`
        : `• Monitor ongoing customer reviews and maintain existing manufacturing standards.\n\n`) +
      `**4. Evidence & Traceability:**\n` +
      `Based on ${analyzed.length} authentic responses stored in Google Sheets for ${scopeLabel} (${dateRangeLabel}).`;
  }

  // ── INTENT E: CATEGORIES & TOPICS ─────────────────────────────────────────
  else if (/\b(category|categories|topic|topics|theme|themes|most feedback|volume)\b/i.test(q)) {
    const catCounts = {};
    let categorizedCount = 0;

    analyzed.forEach((r) => {
      const cat = (r.Category || '').trim();
      if (!cat) return;
      categorizedCount++;
      catCounts[cat] = (catCounts[cat] || 0) + 1;
    });

    if (categorizedCount === 0) {
      answerContent =
        `### Feedback Category Patterns: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** No category classifications are currently recorded for ${scopeLabel} in ${dateRangeLabel}.\n\n` +
        (pending.length > 0 ? `*${pending.length} record(s) are awaiting AI classification.*` : '');
    } else {
      const sortedCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);
      const topCat = sortedCats[0];

      const catBreakdown = sortedCats
        .map(([cat, count]) => {
          const pct = Math.round((count / categorizedCount) * 100);
          return `• **${cat}**: ${count} response(s) (${pct}%)`;
        })
        .join('\n');

      answerContent =
        `### Feedback Categories: ${scopeLabel}\n\n` +
        `**[Calculated Metric]** Total categorized responses: **${categorizedCount}** across **${sortedCats.length}** distinct categories.\n\n` +
        `• **Top Category:** **${topCat[0]}** with **${topCat[1]}** responses (${Math.round((topCat[1] / categorizedCount) * 100)}% of categorized feedback).\n\n` +
        `**Category Distribution:**\n${catBreakdown}`;
    }
  }

  // ── INTENT F: COMPARISON (All Products Scope Only) ─────────────────────────
  else if (/\b(compare|comparison|versus|vs|difference|better)\b/i.test(q)) {
    const targetProductsList = comparedProducts.length > 0 ? comparedProducts : products;

    if (targetProductsList.length < 2) {
      answerContent =
        `### Product Comparison\n\n` +
        `At least two products are required for cross-product benchmarking. Only **${targetProductsList.length}** product is currently eligible under this selection.`;
    } else {
      const summaryTable = targetProductsList
        .map((p) => {
          const pRecs = permittedRecords.filter(
            (r) =>
              r.Product_ID === p.Product_ID ||
              (r.Product_Name && r.Product_Name.toLowerCase() === p.Product_Name.toLowerCase())
          );
          const pAnalyzed = pRecs.filter(
            (r) => (r.Processing_Status || '').toLowerCase() === 'analyzed' || (r.Sentiment || '').trim() !== ''
          );
          const pPos = pAnalyzed.filter((r) => (r.Sentiment || '').toLowerCase() === 'positive').length;
          const pPosPct = pAnalyzed.length > 0 ? `${Math.round((pPos / pAnalyzed.length) * 100)}%` : 'N/A';
          const pRatings = pRecs.filter(
            (r) => typeof r.Rating === 'number' && !isNaN(r.Rating) && r.Rating >= 1 && r.Rating <= 5
          );
          const pAvg =
            pRatings.length > 0
              ? `${(pRatings.reduce((sum, r) => sum + r.Rating, 0) / pRatings.length).toFixed(1)} / 5.0`
              : 'N/A';
          return `• **${p.Product_Name}** (${p.Product_ID}): Submissions: **${pRecs.length}** | Analyzed: **${pAnalyzed.length}** | Positive: **${pPosPct}** | Rating: **${pAvg}**`;
        })
        .join('\n');

      answerContent =
        `### Cross-Product Feedback Comparison (${dateRangeLabel})\n\n` +
        `**[Calculated Metric]** Performance comparison across eligible products:\n\n` +
        `${summaryTable}\n\n` +
        `*Click on any individual product in Product Analysis to inspect detailed verbatim responses.*`;
    }
  }

  // ── INTENT G: GENERAL EXECUTIVE OVERVIEW ──────────────────────────────────
  else {
    const posPct = analyzed.length > 0 ? Math.round((positive.length / analyzed.length) * 100) : 0;
    const negPct = analyzed.length > 0 ? Math.round((negative.length / analyzed.length) * 100) : 0;
    const neuPct = analyzed.length > 0 ? Math.round((neutral.length / analyzed.length) * 100) : 0;

    answerContent =
      `### Executive Feedback Summary: ${scopeLabel}\n\n` +
      `**1. Overview & Metrics (${dateRangeLabel}):**\n` +
      `• Total Feedback Submissions: **${finalRecords.length}**\n` +
      `• Analyzed: **${analyzed.length}** | Pending: **${pending.length}** | Failed: **${failed.length}**\n` +
      `• Average Rating: **${avgRating !== 'N/A' ? `${avgRating} / 5.0` : 'N/A'}** (${validRatings.length} verified ratings)\n` +
      `• Sentiment Split: **${posPct}% Positive**, **${neuPct}% Neutral**, **${negPct}% Negative**\n\n` +
      `**2. Key Highlights:**\n` +
      (positive.length > 0
        ? `• **Praise Highlight:** "${positive[0].Summary || positive[0].Comment}" *[${positive[0].Response_ID}]*\n`
        : '') +
      (allConcerns.length > 0
        ? `• **Friction Highlight:** "${allConcerns[0].Summary || allConcerns[0].Comment}" *[${allConcerns[0].Response_ID}]*\n`
        : '') +
      (allConcerns.length === 0 && positive.length === 0
        ? `• No analyzed praise or concerns are recorded in this scope yet.\n`
        : '') +
      `\n*Ask more specific questions such as "What are customers unhappy about?", "How to maintain product quality?", or "What should we improve first?".*`;
  }

  // Prepend notices if present
  if (salesDisclaimer) {
    answerContent = `${salesDisclaimer}${answerContent}`;
  }
  if (domainValidation.isMixed) {
    answerContent = `${domainValidation.mixedNotice}\n\n${answerContent}`;
  }

  return {
    answer: answerContent,
    type: 'answer',
    targetProductId: targetProduct?.Product_ID || null,
    groundedRecords,
  };
}
