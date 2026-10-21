// ─────────────────────────────────────────────────────────────
// editorialSanitizer.ts
// CyberMedia Master Editorial Handbook & Stylesheet Sanitizer
// Enforces:
// 1. Sentence Case for DQ, Voice&Data, PCQuest (Title Case ONLY for CIOL)
// 2. Prohibition of em-dashes (— replaced with comma or period)
// 3. Search & Replace dictionary (from Dataquest & V&D Toolkits)
// 4. UK English (-ise, programme, centre, fibre, colour, etc.)
// 5. Salutation & corporate suffix stripping (Mr/Ms, Co/Ltd/Inc/Pvt/LLC)
// 6. Emphasis quote stripping around themes/slogans
// ─────────────────────────────────────────────────────────────

// Known proper nouns, acronyms, and company names that must preserve capitalization in Sentence Case
const PRESERVED_TERMS = new Set([
  // Core Acronyms & Tech
  "AI", "ML", "IT", "ICT", "CXO", "CXOS", "CXO'S", "CXOS'", "CEO", "CTO", "CIO", "COO", "CFO", "CMD",
  "GENAI", "LLM", "LLMS", "SAAS", "PAAS", "IAAS", "5G", "4G", "6G", "IOT", "M2M", "SD-WAN", "MPLS", "ORAN",
  "BTS", "AGR", "LEO", "GEO", "FWA", "WI-FI", "WIFI", "BFSI", "ATM", "ATMS", "API", "APIS", "RAG",
  "ERP", "CRM", "B2B", "B2C", "SMB", "SMBS", "SME", "SMES", "PC", "PCS", "GPU", "GPUS", "CPU", "CPUS",
  "RAM", "SSD", "SSDS", "DRAM", "ATMP", "FAB", "FABS", "DLI", "ISM", "GCC", "GCCS",

  // Currencies & Units
  "INR", "USD", "EUR", "GBP", "RS", "RS.", "B", "M", "T", "GB", "TB", "MB", "KB", "MHZ", "GHZ", "GBPS", "MBPS",

  // Entities, Orgs & Regulators
  "IIMBX", "IIM", "IIT", "MEITY", "NPCI", "UPI", "TRAI", "DOT", "BSNL", "MTNL", "ISRO",
  "DATAQUEST", "VOICE&DATA", "PCQUEST", "CYBERMEDIA", "CIOL", "DQ", "V&D", "PCQ",

  // Major Tech Companies & Products
  "HELIX", "PROJECT HELIX", "FWD", "FWD 2026",
  "GOOGLE", "MICROSOFT", "APPLE", "AMAZON", "AWS", "GCP", "AZURE", "META", "IBM", "HP", "HPE",
  "INTEL", "AMD", "NVIDIA", "QUALCOMM", "MEDIATEK", "MICRON", "SAMSUNG", "CISCO", "SERVICENOW",
  "SNOWFLAKE", "ANTHROPIC", "OPENAI", "CLOUDERA", "INFOR", "ORACLE", "SAP", "ZOHO", "XEBIA",
  "TATA", "RELIANCE", "JIO", "AIRTEL", "VI", "INFOSYS", "WIPRO", "TCS", "HCLTECH", "HCL", "TECH MAHINDRA",
  "COURSERA", "UDEMY", "DELL", "LENOVO", "ACER", "ASUS", "TEJAS NETWORKS", "TEJAS",

  // Geography
  "INDIA", "INDIAN", "KARNATAKA", "BENGALURU", "BANGALORE", "DELHI", "MUMBAI", "HYDERABAD",
  "CHENNAI", "PUNE", "KOLKATA", "MYSURU", "MYSORE", "MANDYA", "GUJARAT", "SANAND", "US", "UK", "EU", "APAC",

  // Institutions in PRs
  "ALLIANCE UNIVERSITY", "REVA UNIVERSITY", "CHRIST UNIVERSITY", "RV UNIVERSITY"
]);

/**
 * Converts a headline or subheading into Sentence Case:
 * - Only the first character and proper nouns / recognized acronyms are capitalized.
 * - Everything else is lowercased.
 */
export function toSentenceCase(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  if (!trimmed) return "";

  // Split into tokens while preserving delimiters (spaces, hyphens, slashes, punctuation)
  const tokens = trimmed.split(/(\s+|[-/])/);

  let isFirstWord = true;

  const convertedTokens = tokens.map((token) => {
    // Delimiters (spaces, hyphens)
    if (/^(\s+|[-/])$/.test(token)) {
      return token;
    }

    // Strip surrounding punctuation for matching
    const match = token.match(/^([^a-zA-Z0-9]*)([a-zA-Z0-9'’]+)([^a-zA-Z0-9]*)$/);
    if (!match) {
      return token;
    }

    const [, leadingPunct, word, trailingPunct] = match;
    const upperWord = word.toUpperCase();

    // Preserve words that are in our preserved terms list (e.g. AI, IIMBx, TRAI, Coursera)
    if (PRESERVED_TERMS.has(upperWord)) {
      // Find canonical casing if in preserved list or keep existing if camelCase like IIMBx / GenAI / WiFi
      let preserved = word;
      if (upperWord === "HELIX") preserved = "Helix";
      else if (upperWord === "FWD") preserved = "FWD";
      else if (upperWord === "IIMBX") preserved = "IIMBx";
      else if (upperWord === "GENAI") preserved = "GenAI";
      else if (upperWord === "WIFI" || upperWord === "WI-FI") preserved = "Wi-Fi";
      else if (upperWord === "VOICE&DATA") preserved = "Voice&Data";
      else if (upperWord === "DATAQUEST") preserved = "Dataquest";
      else if (upperWord === "PCQUEST") preserved = "PCquest";
      else if (upperWord === "HCLTECH") preserved = "HCLTech";
      else if (upperWord === "SERVICENOW") preserved = "ServiceNow";
      else if (upperWord === "SNOWFLAKE") preserved = "Snowflake";
      else if (upperWord === "CLOUDERA") preserved = "Cloudera";
      else if (upperWord === "COURSERA") preserved = "Coursera";
      else if (upperWord === "UDEMY") preserved = "Udemy";
      else if (upperWord === "INDIA" || upperWord === "INDIAN") preserved = upperWord === "INDIA" ? "India" : "Indian";
      else if (upperWord === "KARNATAKA") preserved = "Karnataka";
      else if (upperWord === "BENGALURU") preserved = "Bengaluru";
      else if (upperWord === "BANGALORE") preserved = "Bangalore";
      else if (upperWord === "MYSURU" || upperWord === "MYSORE") preserved = upperWord === "MYSURU" ? "Mysuru" : "Mysore";
      else if (upperWord === "MANDYA") preserved = "Mandya";
      else if (upperWord === "GUJARAT") preserved = "Gujarat";
      else if (upperWord === "SANAND") preserved = "Sanand";
      else if (upperWord === "DELHI") preserved = "Delhi";
      else if (upperWord === "MUMBAI") preserved = "Mumbai";
      else if (upperWord === "HYDERABAD") preserved = "Hyderabad";
      else if (upperWord === "CHENNAI") preserved = "Chennai";
      else if (upperWord === "PUNE") preserved = "Pune";
      else if (upperWord === "KOLKATA") preserved = "Kolkata";
      else if (upperWord === "MEITY") preserved = "MeitY";
      else if (upperWord === "JIO") preserved = "Jio";
      else if (upperWord === "AIRTEL") preserved = "Airtel";
      else if (upperWord === "TATA") preserved = "Tata";
      else if (upperWord === "RELIANCE") preserved = "Reliance";
      else if (upperWord === "INFOSYS") preserved = "Infosys";
      else if (upperWord === "WIPRO") preserved = "Wipro";
      else if (upperWord === "TCS") preserved = "TCS";
      else if (upperWord === "GOOGLE") preserved = "Google";
      else if (upperWord === "MICROSOFT") preserved = "Microsoft";
      else if (upperWord === "APPLE") preserved = "Apple";
      else if (upperWord === "AMAZON") preserved = "Amazon";
      else if (upperWord === "INTEL") preserved = "Intel";
      else if (upperWord === "AMD") preserved = "AMD";
      else if (upperWord === "NVIDIA") preserved = "NVIDIA";
      else if (upperWord === "MICRON") preserved = "Micron";
      else if (upperWord === "QUALCOMM") preserved = "Qualcomm";
      else if (upperWord === "MEDIATEK") preserved = "MediaTek";
      else if (upperWord === "ORACLE") preserved = "Oracle";
      else if (upperWord === "SAP") preserved = "SAP";
      else if (upperWord === "ZOHO") preserved = "Zoho";
      else if (upperWord === "XEBIA") preserved = "Xebia";
      else if (upperWord === "DELL") preserved = "Dell";
      else if (upperWord === "LENOVO") preserved = "Lenovo";
      else if (upperWord === "ACER") preserved = "Acer";
      else if (upperWord === "ASUS") preserved = "Asus";
      else if (upperWord === "CISCO") preserved = "Cisco";
      else if (upperWord === "RS" || upperWord === "RS.") preserved = "Rs";

      isFirstWord = false;
      return `${leadingPunct}${preserved}${trailingPunct}`;
    }

    // Preserve mixedCase words like iPhone, iPad, eBay
    if (/^[a-z]+[A-Z]/.test(word)) {
      isFirstWord = false;
      return `${leadingPunct}${word}${trailingPunct}`;
    }

    // First word of sentence: capitalize first char, lowercase rest
    if (isFirstWord) {
      isFirstWord = false;
      const cap = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      return `${leadingPunct}${cap}${trailingPunct}`;
    }

    // All subsequent words in sentence case: lowercased
    return `${leadingPunct}${word.toLowerCase()}${trailingPunct}`;
  });

  return convertedTokens.join("");
}

/**
 * Strips terminal punctuation from headlines (none of the 14 punctuation marks at end).
 */
export function cleanHeadlinePunctuation(headline: string): string {
  if (!headline) return "";
  return headline.replace(/[.,:;!?—–-]+$/, "").trim();
}

/**
 * Applies CyberMedia Search & Replace rules and UK English conversions to text/HTML.
 */
export function sanitizeCyberMediaText(text: string): string {
  if (!text) return "";

  let result = text;

  // 1. Remove em-dashes (—) and replace with comma or period (Rule: Avoid em-dashes in text)
  result = result.replace(/\s*—\s*/g, ", ");

  // 2. Remove emphasis single/double quotes around phrases (e.g. 'Human Skills. AI Scale.' -> Human Skills. AI Scale.)
  // Avoid stripping quotes from dialogue or spokesperson statements
  result = result.replace(/theme\s+['"‘“]([^'"’”]+)['"’”]/gi, "theme $1");
  result = result.replace(/\bunder\s+the\s+['"‘“]([^'"’”]+)['"’”]/gi, "under the $1");

  // 3. Remove unnecessary salutations (Mr., Ms., Mrs.)
  result = result.replace(/\b(Mr\.|Mr|Ms\.|Ms|Mrs\.|Mrs)\s+/g, "");

  // 4. Honorifics: Dr. -> Dr (no period)
  result = result.replace(/\bDr\.\s+/g, "Dr ");

  // 5. Corporate suffixes: Co, Ltd, Inc, LLC, Pvt
  result = result.replace(/\s*\b(Inc\.|Inc|Ltd\.|Ltd|Pvt\.|Pvt|LLC|Corp\.|Corp)\b\.?/g, "");

  // 6. UK English replacements (Official CyberMedia Search & Replace list)
  // -ize to -ise
  result = result.replace(/\bpersonalized\b/gi, "personalised")
                 .replace(/\bpersonalize\b/gi, "personalise")
                 .replace(/\bspecialized\b/gi, "specialised")
                 .replace(/\bspecializes\b/gi, "specialises")
                 .replace(/\bspecialize\b/gi, "specialise")
                 .replace(/\borganized\b/gi, "organised")
                 .replace(/\borganize\b/gi, "organise")
                 .replace(/\banalyzed\b/gi, "analysed")
                 .replace(/\banalyze\b/gi, "analyse")
                 .replace(/\bcustomized\b/gi, "customised")
                 .replace(/\bcustomize\b/gi, "customise")
                 .replace(/\bprioritized\b/gi, "prioritised")
                 .replace(/\bprioritize\b/gi, "prioritise")
                 .replace(/\boptimized\b/gi, "optimised")
                 .replace(/\boptimize\b/gi, "optimise")
                 .replace(/\butilize\b/gi, "utilise")
                 .replace(/\butilized\b/gi, "utilised")
                 .replace(/\brecognize\b/gi, "recognise")
                 .replace(/\brecognized\b/gi, "recognised")
                 .replace(/\bstandardize\b/gi, "standardise")
                 .replace(/\bstandardized\b/gi, "standardised")
                 .replace(/\bdigitization\b/gi, "digitisation");

  // program -> programme (preserve programming / programmer)
  result = result.replace(/\bprograms\b/gi, "programmes");
  result = result.replace(/\bprogram\b/gi, (match) => {
    return match === "program" ? "programme" : match === "Program" ? "Programme" : match;
  });

  // center -> centre
  result = result.replace(/\bdatacenter\b/gi, "data centre")
                 .replace(/\bdata center\b/gi, "data centre")
                 .replace(/\bcenter\b/gi, "centre")
                 .replace(/\bcenters\b/gi, "centres");

  // Other UK spellings
  result = result.replace(/\bfavor\b/gi, "favour")
                 .replace(/\blabor\b/gi, "labour")
                 .replace(/\bdefense\b/gi, "defence")
                 .replace(/\blicense\s+to\b/gi, "licence to")
                 .replace(/\boffense\b/gi, "offence")
                 .replace(/\btraveling\b/gi, "travelling")
                 .replace(/\blabeling\b/gi, "labelling")
                 .replace(/\bfiber\b/gi, "fibre")
                 .replace(/\banalog\b/gi, "analogue")
                 .replace(/\bEnrollment\b/g, "Enrolment")
                 .replace(/\benrollment\b/g, "enrolment")
                 .replace(/\bcyber\s+security\b/gi, "cybersecurity")
                 .replace(/\bcyber\s+attack\b/gi, "cyberattack");

  // Spoken English to Written English
  result = result.replace(/\bwhat's\b/gi, "what is")
                 .replace(/\bit's\b/gi, "it is")
                 .replace(/\bthat's\b/gi, "that is")
                 .replace(/\baren't\b/gi, "are not")
                 .replace(/\bcan't\b/gi, "cannot")
                 .replace(/\bisn't\b/gi, "is not");

  // Simplify terms
  result = result.replace(/\b24\/7\b/g, "24X7");
  result = result.replace(/\bper\s+cent\b/gi, "%")
                 .replace(/\bpercent\b/gi, "%");

  // Remove trademarks ™, ®, ©
  result = result.replace(/[™®©]/g, "");

  // Capitalize first letter of direct quotes after comma/colon (e.g. stated, "the -> stated, "The)
  result = result.replace(/([,:]\s*["“])([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  // Clean double spaces created by removals
  result = result.replace(/  +/g, " ");

  return result;
}

/**
 * Normalizes headings inside HTML (h1, h2, h3) to Sentence Case for DQ, V&D, and PCQ.
 */
export function sanitizeHtmlHeadings(html: string, isSentenceCase: boolean = true): string {
  if (!html) return "";
  if (!isSentenceCase) return html;

  return html.replace(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/gi, (match, tag, attrs, content) => {
    // If heading contains child HTML tags, extract text, sentence case it, or handle cleanly
    const plainText = content.replace(/<[^>]+>/g, "").trim();
    const converted = toSentenceCase(plainText);
    return `<${tag}${attrs}>${converted}</${tag}>`;
  });
}

export interface SanitizableArticlePackage {
  headline: string;
  subheadline?: string;
  article: string;
  faq?: { question: string; answer: string }[];
  seo_title?: string;
  tags?: string[];
}

/**
 * Master CyberMedia Stylesheet Processor for the complete article package.
 * Runs on backend output before streaming to UI.
 */
export function applyCyberMediaMasterStylesheet(
  articlePkg: SanitizableArticlePackage,
  publication: string = "Dataquest"
): SanitizableArticlePackage {
  const normPub = (publication || "").toLowerCase();
  // CIOL uses Title Case (initial upper case); Dataquest, Voice&Data, and PCQuest strictly use Sentence Case.
  const isSentenceCase = !normPub.includes("ciol");

  // 1. Sanitize Headline
  let cleanH1 = cleanHeadlinePunctuation(articlePkg.headline);
  if (isSentenceCase) {
    cleanH1 = toSentenceCase(cleanH1);
  }
  articlePkg.headline = cleanH1;

  // 2. Sanitize Subheadline / Excerpt
  if (articlePkg.subheadline) {
    articlePkg.subheadline = sanitizeCyberMediaText(articlePkg.subheadline);
  }

  // 3. Sanitize Article Body HTML
  if (articlePkg.article) {
    let cleanBody = sanitizeCyberMediaText(articlePkg.article);
    cleanBody = sanitizeHtmlHeadings(cleanBody, isSentenceCase);
    articlePkg.article = cleanBody;
  }

  // 4. Sanitize FAQs
  if (articlePkg.faq && Array.isArray(articlePkg.faq)) {
    articlePkg.faq = articlePkg.faq.map((item) => {
      let q = item.question ? sanitizeCyberMediaText(item.question) : "";
      if (isSentenceCase && q) {
        // Strip ending ? temporarily, convert, then re-add ?
        const hasQuestionMark = q.endsWith("?");
        q = toSentenceCase(q.replace(/\?$/, ""));
        if (hasQuestionMark) q += "?";
      }
      return {
        question: q,
        answer: item.answer ? sanitizeCyberMediaText(item.answer) : "",
      };
    });
  }

  // 5. Sanitize SEO Title
  if (articlePkg.seo_title && isSentenceCase) {
    articlePkg.seo_title = cleanHeadlinePunctuation(articlePkg.seo_title);
  }

  // 6. Sanitize Tags (convert -ize to -ise, program to programme, etc.)
  if (articlePkg.tags && Array.isArray(articlePkg.tags)) {
    articlePkg.tags = articlePkg.tags.map((t: string) => sanitizeCyberMediaText(t));
  }

  return articlePkg;
}
