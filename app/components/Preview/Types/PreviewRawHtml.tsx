import { useState, useRef, useEffect } from "react";
import { Body } from "~/components/Primitives/Body";
import { PreviewBox } from "../PreviewBox";
import { EyeIcon, EyeOffIcon, CodeIcon, DesktopComputerIcon } from "@heroicons/react/outline";

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

type RenderMode = 'iframe' | 'inline' | 'source';

export function PreviewRawHtml({ value }: PreviewRawHtmlProps) {
  const [renderMode, setRenderMode] = useState<RenderMode>('iframe');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Only show this component if the value looks like HTML
  if (!isLikelyHTML(value)) {
    return null;
  }

  // Enhanced CSS for better HTML rendering
  const enhancedCSS = `
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #374151;
        margin: 16px;
        font-size: 14px;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.5em;
        font-weight: 600;
        line-height: 1.25;
        color: #111827;
      }
      h1 { font-size: 1.875rem; }
      h2 { font-size: 1.5rem; }
      h3 { font-size: 1.25rem; }
      h4 { font-size: 1.125rem; }
      h5 { font-size: 1rem; }
      h6 { font-size: 0.875rem; }
      
      /* Paragraphs and spacing */
      p {
        margin-bottom: 1em;
        margin-top: 0;
      }
      
      /* Links */
      a {
        color: #3b82f6;
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      a:hover {
        color: #1d4ed8;
        text-decoration-color: #1d4ed8;
      }
      
      /* Lists */
      ul, ol {
        margin-bottom: 1em;
        padding-left: 1.5em;
      }
      li {
        margin-bottom: 0.25em;
      }
      
      /* Code */
      code {
        background: #f3f4f6;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-family: 'SF Mono', Monaco, Inconsolata, 'Roboto Mono', Consolas, 'Courier New', monospace;
        font-size: 0.875em;
        color: #dc2626;
      }
      
      pre {
        background: #f9fafb;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        padding: 1rem;
        overflow-x: auto;
        margin-bottom: 1em;
      }
      
      pre code {
        background: none;
        padding: 0;
        color: inherit;
      }
      
      /* Tables */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1em;
      }
      th, td {
        border: 1px solid #e5e7eb;
        padding: 0.5rem;
        text-align: left;
      }
      th {
        background: #f9fafb;
        font-weight: 600;
      }
      
      /* Blockquotes */
      blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 1rem;
        margin-left: 0;
        margin-bottom: 1em;
        font-style: italic;
        color: #6b7280;
      }
      
      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.25rem;
        margin-bottom: 1em;
      }
      
      /* Forms */
      input, textarea, select {
        border: 1px solid #d1d5db;
        border-radius: 0.25rem;
        padding: 0.5rem;
        font-size: 0.875rem;
      }
      
      /* Utility classes */
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: 700; }
      .italic { font-style: italic; }
      .underline { text-decoration: underline; }
      
      /* Responsive design */
      @media (max-width: 768px) {
        body {
          margin: 8px;
          font-size: 13px;
        }
        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.25rem; }
        h3 { font-size: 1.125rem; }
      }
    </style>
  `;

  // Create full HTML document for iframe
  const createFullHTML = (content: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HTML Preview</title>
  ${enhancedCSS}
</head>
<body>
  ${content}
</body>
</html>`;
  };

  // Update iframe content when value changes
  useEffect(() => {
    if (iframeRef.current && renderMode === 'iframe') {
      const iframe = iframeRef.current;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(createFullHTML(value));
        doc.close();
        
        // Auto-resize iframe to content height
        const resizeIframe = () => {
          const contentHeight = doc.documentElement.scrollHeight;
          iframe.style.height = `${Math.min(contentHeight + 20, 600)}px`;
        };
        
        // Wait for content to load then resize
        setTimeout(resizeIframe, 100);
        
        // Also resize on window resize
        window.addEventListener('resize', resizeIframe);
        return () => window.removeEventListener('resize', resizeIframe);
      }
    }
  }, [value, renderMode]);

  const renderModeButtons = [
    { mode: 'iframe' as RenderMode, label: 'Enhanced', icon: DesktopComputerIcon, title: 'Enhanced HTML rendering with styling' },
    { mode: 'inline' as RenderMode, label: 'Inline', icon: EyeIcon, title: 'Basic inline HTML rendering' },
    { mode: 'source' as RenderMode, label: 'Source', icon: CodeIcon, title: 'View HTML source code' },
  ];

  return (
    <PreviewBox>
      <div className="space-y-3">
        {/* Mode selector */}
        <div className="flex justify-between items-center">
          <Body className="font-medium text-slate-700 dark:text-slate-300">
            HTML Content
          </Body>
          <div className="flex rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600">
            {renderModeButtons.map(({ mode, label, icon: Icon, title }) => (
              <button
                key={mode}
                onClick={() => setRenderMode(mode)}
                className={`flex items-center gap-1 px-3 py-1.5 text-sm transition-colors ${
                  renderMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                title={title}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="border rounded-md overflow-hidden bg-white dark:bg-slate-800">
          {renderMode === 'iframe' && (
            <div>
              <iframe
                ref={iframeRef}
                className="w-full border-0"
                style={{ minHeight: '200px', maxHeight: '600px' }}
                sandbox="allow-same-origin"
                title="HTML Preview"
              />
              <div className="p-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
                ⚠️ HTML content rendered in secure sandbox mode
              </div>
            </div>
          )}
          
          {renderMode === 'inline' && (
            <div className="p-4">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                style={{ color: 'inherit' }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
              <div className="mt-4 pt-3 border-t text-xs text-amber-600 dark:text-amber-400">
                ⚠️ Basic inline rendering - some styles may not display correctly
              </div>
            </div>
          )}
          
          {renderMode === 'source' && (
            <div className="p-4">
              <pre className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words font-mono overflow-x-auto bg-slate-50 dark:bg-slate-900 p-3 rounded border">
                {value}
              </pre>
            </div>
          )}
        </div>
      </div>
    </PreviewBox>
  );
}

// Export the HTML detection function for use elsewhere
export { isLikelyHTML };
