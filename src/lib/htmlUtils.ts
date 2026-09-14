// ─────────────────────────────────────────────────────────────
// htmlUtils.ts
// Shared HTML formatting, citation mapping, and Also Read link normalization
// ─────────────────────────────────────────────────────────────

export interface CitationSource {
  id: string;
  url: string;
  title: string;
  snippet?: string;
}

/**
 * Normalizes article HTML:
 * 1. Converts markdown-style [Text](url) to underlined anchor tags.
 * 2. Maps bracket citation markers [id] directly to underlined source links.
 * 3. Extracts any "Also Read" / "Read More" links from the middle of the article text
 *    and appends them cleanly to the very END of the article with explicit underlines.
 */
export function formatHtmlForPreview(
  html: string,
  ragSources?: CitationSource[],
  accentHex: string = "#e30613"
): string {
  if (!html) return "";

  // 1. Convert markdown-style [Text](url) to HTML links with underline
  let clean = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    `<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80 font-medium" style="color: ${accentHex}; text-decoration: underline;"><u>$1</u></a>`
  );

  // 2. Map raw bracket citation markers like [vd_jio_1] directly to hyperlinked URLs with underline
  clean = clean.replace(/\[([a-zA-Z0-9_-]+)\]/g, (match, id) => {
    const src = ragSources?.find((s) => s.id === id);
    if (src && src.url) {
      return `<a href="${src.url}" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-80 font-medium ml-1" style="color: ${accentHex}; text-decoration: underline;" title="${src.title.replace(/"/g, '&quot;')}"><u>[Source]</u></a>`;
    }
    // If no matching source URL, strip the raw bracket tag so vd_jio_1 doesn't clutter published text
    return "";
  });

  // 3. Extract all "Also Read" / "Read More" occurrences from between paragraphs
  const alsoReadItems: { title: string; url: string }[] = [];

  // Match any paragraph containing "Also Read" or "Read More"
  const pRegex = /<p[^>]*>(?:<[^>]+>)*\s*(?:Also Read|Read More)\s*:\s*[\s\S]*?<\/p>/gi;

  clean = clean.replace(pRegex, (match) => {
    const aMatch = match.match(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/i);
    let url = "";
    let title = "";

    if (aMatch) {
      url = aMatch[1].trim();
      title = aMatch[2].replace(/<[^>]+>/g, "").trim();
    } else {
      const textOnly = match.replace(/<[^>]+>/g, "").trim();
      title = textOnly.replace(/^(?:Also Read|Read More)\s*:\s*/i, "").trim();

      if (ragSources && ragSources.length > 0) {
        const found = ragSources.find((s) => {
          if (!s.title) return false;
          const sLower = s.title.toLowerCase();
          const tLower = title.toLowerCase();
          return sLower.includes(tLower) || tLower.includes(sLower);
        });
        if (found?.url) {
          url = found.url;
        } else {
          const words = title.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
          const best = ragSources.find((s) => s.title && words.some((w) => s.title.toLowerCase().includes(w)));
          if (best?.url) url = best.url;
        }
      }
    }

    if (!url) url = "#";
    if (title) {
      alsoReadItems.push({ title, url });
    }
    return ""; // Remove from middle of the article body
  });

  // Also catch any standalone "Also Read:" lines not wrapped in <p> tags
  clean = clean.replace(/(?:^|\n)(?:<strong>)?\s*(?:Also Read|Read More)\s*:\s*(?:<\/strong>)?([^\n<]+)/gi, (match, rawTitle) => {
    const title = rawTitle.replace(/<[^>]+>/g, "").trim();
    let url = "#";
    if (ragSources && ragSources.length > 0) {
      const found = ragSources.find((s) => {
        if (!s.title) return false;
        const sLower = s.title.toLowerCase();
        const tLower = title.toLowerCase();
        return sLower.includes(tLower) || tLower.includes(sLower);
      });
      if (found?.url) url = found.url;
    }
    if (title) {
      alsoReadItems.push({ title, url });
    }
    return "";
  });

  // Deduplicate also-read items by title
  const seen = new Set<string>();
  const uniqueItems: { title: string; url: string }[] = [];
  for (const item of alsoReadItems) {
    const key = item.title.toLowerCase().trim();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }

  // Clean empty paragraphs left behind
  let result = clean.replace(/<p>\s*<\/p>/g, "").trim();

  // Append all "Also Read" links strictly to the very end of the article
  if (uniqueItems.length > 0) {
    const formattedLinks = uniqueItems
      .map(
        (item) =>
          `<p class="also-read-item" style="margin-top: 0.65rem; margin-bottom: 0.65rem; font-size: 0.95rem;"><strong style="font-weight: 700;">Also Read: </strong><a href="${item.url}" target="_blank" rel="noopener noreferrer" class="underline font-semibold hover:opacity-80" style="color: ${accentHex}; text-decoration: underline;"><u>${item.title}</u></a></p>`
      )
      .join("\n");

    result += `\n\n<div class="also-read-footer" style="margin-top: 1.75rem; padding-top: 1rem; border-top: 1px solid rgba(150, 150, 150, 0.25);">\n${formattedLinks}\n</div>`;
  }

  return result;
}
