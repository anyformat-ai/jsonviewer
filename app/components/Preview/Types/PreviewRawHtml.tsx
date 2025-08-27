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

  // Enhanced CSS for better HTML rendering - matching user's design palette
  const enhancedCSS = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
      
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        line-height: 1.6;
        color: #1f2937;
        margin: 16px;
        font-size: 14px;
        font-weight: 400;
        background: #ffffff;
      }
      
      /* Typography */
      h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 0.75em;
        font-weight: 600;
        line-height: 1.3;
        color: #111827;
        font-family: 'Inter', sans-serif;
      }
      h1 { font-size: 1.875rem; font-weight: 700; }
      h2 { font-size: 1.5rem; font-weight: 600; }
      h3 { font-size: 1.25rem; font-weight: 600; }
      h4 { font-size: 1.125rem; font-weight: 500; }
      h5 { font-size: 1rem; font-weight: 500; }
      h6 { font-size: 0.875rem; font-weight: 500; }
      
      /* Paragraphs and spacing */
      p {
        margin-bottom: 1em;
        margin-top: 0;
        color: #374151;
        line-height: 1.65;
      }
      
      /* Links - matching your blue palette */
      a {
        color: #2563eb;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.2s ease;
      }
      a:hover {
        color: #1d4ed8;
        text-decoration: underline;
        text-decoration-color: #1d4ed8;
        text-underline-offset: 2px;
      }
      
      /* Lists */
      ul, ol {
        margin-bottom: 1em;
        padding-left: 1.5em;
        color: #374151;
      }
      li {
        margin-bottom: 0.5em;
        line-height: 1.6;
      }
      
      /* Code - clean styling matching your interface */
      code {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        padding: 0.25rem 0.375rem;
        border-radius: 0.375rem;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
        font-size: 0.875em;
        color: #2563eb;
        font-weight: 500;
      }
      
      pre {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 0.5rem;
        padding: 1.25rem;
        overflow-x: auto;
        margin-bottom: 1.5em;
        font-size: 0.875rem;
        line-height: 1.5;
      }
      
      pre code {
        background: none;
        border: none;
        padding: 0;
        color: #1e293b;
        font-weight: 400;
      }
      
      /* Tables - clean professional styling */
      table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5em;
        border: 1px solid #e5e7eb;
        border-radius: 0.5rem;
        overflow: hidden;
      }
      th, td {
        border-bottom: 1px solid #e5e7eb;
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.875rem;
      }
      th {
        background: #f8fafc;
        font-weight: 600;
        color: #374151;
        border-bottom: 1px solid #d1d5db;
      }
      td {
        color: #4b5563;
      }
      tr:last-child td {
        border-bottom: none;
      }
      
      /* Blockquotes */
      blockquote {
        border-left: 3px solid #2563eb;
        padding-left: 1.25rem;
        margin-left: 0;
        margin-bottom: 1.5em;
        font-style: italic;
        color: #4b5563;
        background: #f8fafc;
        padding: 1rem 1.25rem;
        border-radius: 0 0.5rem 0.5rem 0;
      }
      
      /* Images */
      img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin-bottom: 1em;
        border: 1px solid #e5e7eb;
      }
      
      /* Forms - matching your interface style */
      input, textarea, select {
        border: 1px solid #d1d5db;
        border-radius: 0.375rem;
        padding: 0.75rem;
        font-size: 0.875rem;
        font-family: 'Inter', sans-serif;
        background: #ffffff;
        color: #374151;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      
      input:focus, textarea:focus, select:focus {
        outline: none;
        border-color: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      }
      
      /* Buttons */
      button {
        background: #2563eb;
        color: #ffffff;
        border: none;
        border-radius: 0.375rem;
        padding: 0.75rem 1.5rem;
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 0.875rem;
        cursor: pointer;
        transition: background-color 0.2s ease;
      }
      
      button:hover {
        background: #1d4ed8;
      }
      
      /* Utility classes */
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .font-bold { font-weight: 700; }
      .italic { font-style: italic; }
      .underline { text-decoration: underline; }
      
      /* Strong and emphasis */
      strong {
        font-weight: 600;
        color: #111827;
      }
      
      em {
        font-style: italic;
        color: #374151;
      }
      
      /* Horizontal rules */
      hr {
        border: none;
        border-top: 1px solid #e5e7eb;
        margin: 2rem 0;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        body {
          margin: 12px;
          font-size: 13px;
        }
        h1 { font-size: 1.5rem; }
        h2 { font-size: 1.25rem; }
        h3 { font-size: 1.125rem; }
        
        table {
          font-size: 0.8rem;
        }
        
        th, td {
          padding: 0.5rem;
        }
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
          <Body className="font-medium text-gray-900 dark:text-slate-300">
            HTML Content
          </Body>
          <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-slate-600">
            {renderModeButtons.map(({ mode, label, icon: Icon, title }) => (
              <button
                key={mode}
                onClick={() => setRenderMode(mode)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  renderMode === mode
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-900 dark:hover:text-slate-200'
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
        <div className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden bg-white dark:bg-slate-800">
          {renderMode === 'iframe' && (
            <div>
              <iframe
                ref={iframeRef}
                className="w-full border-0"
                style={{ minHeight: '200px', maxHeight: '600px' }}
                sandbox="allow-same-origin"
                title="HTML Preview"
              />
              <div className="p-3 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  HTML content rendered in secure sandbox mode
                </div>
              </div>
            </div>
          )}
          
          {renderMode === 'inline' && (
            <div className="p-6">
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                style={{ color: 'inherit', fontFamily: 'Inter, sans-serif' }}
                dangerouslySetInnerHTML={{ __html: value }}
              />
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-600 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  Basic inline rendering - some styles may not display correctly
                </div>
              </div>
            </div>
          )}
          
          {renderMode === 'source' && (
            <div className="p-6">
              <pre className="text-sm text-gray-800 dark:text-slate-300 whitespace-pre-wrap break-words font-mono overflow-x-auto bg-gray-50 dark:bg-slate-900 p-4 rounded-md border border-gray-200 dark:border-slate-700">
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
