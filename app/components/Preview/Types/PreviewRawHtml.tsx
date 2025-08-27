import { useState } from "react";
import { Body } from "~/components/Primitives/Body";
import { PreviewBox } from "../PreviewBox";
import { EyeIcon, EyeOffIcon } from "@heroicons/react/outline";

export type PreviewRawHtmlProps = {
  value: string;
};

// Simple HTML detection - looks for common HTML patterns
function isLikelyHTML(str: string): boolean {
  if (typeof str !== 'string' || str.length < 3) return false;
  
  // Quick check: if it doesn't contain < or &, it's probably not HTML
  if (!str.includes('<') && !str.includes('&')) return false;
  
  // Check for common HTML patterns
  const htmlPatterns = [
    /<[a-z]+(\s+[^>]*)?>/i,           // Opening tags like <div>, <p class="...">
    /<\/[a-z]+>/i,                    // Closing tags like </div>, </p>
    /&[a-z]+;/i,                      // HTML entities like &nbsp;, &amp;
    /<br\s*\/?>/i,                    // Self-closing br tags
    /<img\s+[^>]*src\s*=/i,           // Image tags with src
    /<a\s+[^>]*href\s*=/i,            // Anchor tags with href
    /<(h[1-6]|strong|em|code|pre)>/i, // Common text formatting tags
    /<(ul|ol|li)>/i,                  // List tags
    /<(table|tr|td|th)>/i,            // Table tags
    /<(article|section|header|footer|main|nav)>/i, // Semantic HTML5 tags
  ];
  
  // Count how many patterns match
  const matchCount = htmlPatterns.filter(pattern => pattern.test(str)).length;
  
  // If multiple patterns match, it's very likely HTML
  if (matchCount >= 2) return true;
  
  // If only one pattern matches, check if it's a substantial match
  if (matchCount === 1) {
    // Look for paired tags (opening and closing)
    const pairedTagPattern = /<([a-z]+)(\s+[^>]*)?>[^<]*<\/\1>/i;
    if (pairedTagPattern.test(str)) return true;
    
    // Look for multiple instances of the same tag
    const tagMatches = str.match(/<[a-z]+/gi);
    if (tagMatches && tagMatches.length >= 2) return true;
  }
  
  return false;
}

export function PreviewRawHtml({ value }: PreviewRawHtmlProps) {
  const [showRendered, setShowRendered] = useState(true);
  
  // Only show this component if the value looks like HTML
  if (!isLikelyHTML(value)) {
    return null;
  }

  return (
    <PreviewBox>
      <div className="space-y-3">
        {/* Toggle button */}
        <div className="flex justify-between items-center">
          <Body className="font-medium text-slate-700 dark:text-slate-300">
            HTML Content
          </Body>
          <button
            onClick={() => setShowRendered(!showRendered)}
            className="flex items-center gap-1 px-2 py-1 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            title={showRendered ? "Show HTML source" : "Show rendered HTML"}
          >
            {showRendered ? (
              <>
                <EyeOffIcon className="w-4 h-4" />
                Source
              </>
            ) : (
              <>
                <EyeIcon className="w-4 h-4" />
                Rendered
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="border rounded-md p-3 bg-white dark:bg-slate-800">
          {showRendered ? (
            <div className="max-w-none">
              {/* Security note: dangerouslySetInnerHTML should only be used with trusted content */}
              <div 
                className="prose prose-sm dark:prose-invert prose-slate"
                style={{
                  // Override prose styles for better integration
                  color: 'inherit',
                  maxWidth: 'none'
                }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
              <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                ⚠️ This HTML content is rendered as-is. Only view content from trusted sources.
              </div>
            </div>
          ) : (
            <pre className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words font-mono overflow-x-auto">
              {value}
            </pre>
          )}
        </div>
      </div>
    </PreviewBox>
  );
}

// Export the HTML detection function for use elsewhere
export { isLikelyHTML };
