'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useApiLanguage } from '../context/ApiLanguageContext';

interface CopyPageButtonProps {
  className?: string;
}

export default function CopyPageButton({ className = '' }: CopyPageButtonProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { language } = useLanguage();
  const { language: apiLanguage } = useApiLanguage();

  const extractPageContent = () => {
    try {
      // Get the main content area - try multiple selectors
      const mainContent = document.querySelector('main .docs-content') ||
                         document.querySelector('main .prose') || 
                         document.querySelector('main [data-content]') || 
                         document.querySelector('main div.max-w-none') ||
                         document.querySelector('main .grid > div:first-child') ||
                         document.querySelector('main');
      
      if (!mainContent) {
        console.warn('Could not find main content area');
        return 'Unable to extract page content - main content area not found.';
      }

      let markdown = '';
      const pageTitle = document.title.replace(' - OneNode Docs', '').trim();
      if (pageTitle) {
        markdown += `# ${pageTitle}\n\n`;
      }

      const processNode = (node: Node, depth = 0): string => {
        // Prevent infinite recursion
        if (depth > 50) {
          console.warn('Maximum depth reached in processNode');
          return '';
        }
        
        let result = '';
        
        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent?.trim();
          return text ? text + ' ' : '';
        }
        
        if (node.nodeType !== Node.ELEMENT_NODE) return '';
        
        const element = node as Element;
        
        // Skip hidden elements
        try {
          const style = window.getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') {
            return '';
          }
        } catch (e) {
          // Continue if getComputedStyle fails
        }

        // Check if this element or its parent has language restrictions
        const hasLanguageAttr = element.hasAttribute('data-language');
        const hasApiLanguageAttr = element.hasAttribute('data-api-language');
        
        if (hasLanguageAttr) {
          const contentLanguage = element.getAttribute('data-language');
          if (contentLanguage && contentLanguage !== language) {
            return '';
          }
        }
        
        if (hasApiLanguageAttr) {
          const contentApiLanguage = element.getAttribute('data-api-language');
          if (contentApiLanguage && contentApiLanguage !== apiLanguage) {
            return '';
          }
        }

        // Skip elements that are inside non-matching language containers
        const languageParent = element.closest('[data-language]');
        const apiLanguageParent = element.closest('[data-api-language]');
        
        if (languageParent && !hasLanguageAttr) {
          const parentLanguage = languageParent.getAttribute('data-language');
          if (parentLanguage && parentLanguage !== language) {
            return '';
          }
        }
        
        if (apiLanguageParent && !hasApiLanguageAttr) {
          const parentApiLanguage = apiLanguageParent.getAttribute('data-api-language');
          if (parentApiLanguage && parentApiLanguage !== apiLanguage) {
            return '';
          }
        }

      // Handle different element types
      const tagName = element.tagName.toLowerCase();
      
      switch (tagName) {
        case 'h1':
          result += `# ${element.textContent?.trim()}\n\n`;
          break;
        case 'h2':
          result += `## ${element.textContent?.trim()}\n\n`;
          break;
        case 'h3':
          result += `### ${element.textContent?.trim()}\n\n`;
          break;
        case 'h4':
          result += `#### ${element.textContent?.trim()}\n\n`;
          break;
        case 'h5':
          result += `##### ${element.textContent?.trim()}\n\n`;
          break;
        case 'h6':
          result += `###### ${element.textContent?.trim()}\n\n`;
          break;
        case 'p':
          const pText = element.textContent?.trim();
          if (pText) {
            result += `${pText}\n\n`;
          }
          break;
        case 'pre':
          // Handle code blocks
          const codeElement = element.querySelector('code');
          const codeText = codeElement?.textContent || element.textContent;
          const codeLanguage = codeElement?.className.match(/language-(\w+)/)?.[1] || '';
          result += `\`\`\`${codeLanguage}\n${codeText?.trim()}\n\`\`\`\n\n`;
          break;
        case 'code':
          // Inline code (if not inside pre)
          if (!element.closest('pre')) {
            return `\`${element.textContent?.trim()}\``;
          }
          break;
        case 'ul':
        case 'ol':
          const listItems = Array.from(element.children).filter(child => child.tagName.toLowerCase() === 'li');
          listItems.forEach((li, index) => {
            const bullet = tagName === 'ul' ? '-' : `${index + 1}.`;
            const liText = processNode(li, depth + 1).trim();
            if (liText) {
              result += `${bullet} ${liText}\n`;
            }
          });
          result += '\n';
          break;
        case 'li':
          // Process children but don't add markup here (handled by ul/ol)
          Array.from(element.childNodes).forEach(child => {
            result += processNode(child, depth + 1);
          });
          break;
        case 'blockquote':
          const quoteText = element.textContent?.trim();
          if (quoteText) {
            result += `> ${quoteText}\n\n`;
          }
          break;
        case 'a':
          const href = element.getAttribute('href');
          const linkText = element.textContent?.trim();
          if (href && linkText) {
            return `[${linkText}](${href})`;
          }
          return linkText || '';
        case 'strong':
        case 'b':
          return `**${element.textContent?.trim()}**`;
        case 'em':
        case 'i':
          return `*${element.textContent?.trim()}*`;
        case 'br':
          return '\n';
        case 'hr':
          result += '---\n\n';
          break;
        case 'table':
          // Basic table handling
          const rows = Array.from(element.querySelectorAll('tr'));
          rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            const cellTexts = cells.map(cell => cell.textContent?.trim() || '');
            result += `| ${cellTexts.join(' | ')} |\n`;
            
            // Add header separator for first row if it contains th elements
            if (rowIndex === 0 && row.querySelector('th')) {
              const separator = cells.map(() => '---').join(' | ');
              result += `| ${separator} |\n`;
            }
          });
          result += '\n';
          break;
        default:
          // For other elements, process children
          Array.from(element.childNodes).forEach(child => {
            result += processNode(child, depth + 1);
          });
          break;
      }
      
      return result;
    };

    // Process all child nodes
    Array.from(mainContent.childNodes).forEach(child => {
      markdown += processNode(child, 0);
    });

    // Clean up extra whitespace
    markdown = markdown.replace(/\n\s*\n\s*\n/g, '\n\n').trim();
    
    return markdown;
    
    } catch (error) {
      console.error('Error extracting page content:', error);
      return 'Error occurred while extracting page content.';
    }
  };

  const copyPageToClipboard = async () => {
    try {
      const pageContent = extractPageContent();
      console.log('Extracted content:', pageContent.substring(0, 500) + '...');
      console.log('Current language:', language);
      console.log('Current API language:', apiLanguage);
      
      await navigator.clipboard.writeText(pageContent);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy page content: ', err);
    }
  };

  return (
    <motion.button
      onClick={copyPageToClipboard}
      className={`
        px-4 py-2
        rounded-lg
        font-medium
        text-sm
        transition-colors
        duration-200
        flex items-center justify-center gap-2
        w-48
        ${isCopied 
          ? 'bg-green-500/20 text-green-400 border-green-400/50' 
          : 'bg-app-tertiary text-app-primary hover:bg-app-secondary border-app-primary'
        }
        border
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      title={`Copy page content in Markdown format (${language}${apiLanguage !== 'curl' ? `/${apiLanguage}` : ''})`}
    >
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3 }}
              />
            </svg>
            <span>Copied This Page!</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Copy This Page</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
} 