"use client";
import React, { useState, useEffect } from "react";
import { ClipboardDocumentCheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  variant?: "default" | "compact" | "pill";
  maxWidth?: string;
  showLineNumbers?: boolean;
  theme?: "light" | "dark" | "auto";
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = "javascript",
  variant = "default",
  maxWidth,
  showLineNumbers = false,
  theme = "auto"
}) => {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (theme === "auto") {
      const checkTheme = () => {
        setIsDark(document.documentElement.classList.contains('dark'));
      };
      
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      
      return () => observer.disconnect();
    } else {
      setIsDark(theme === "dark");
    }
  }, [theme]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (copied) {
      timer = setTimeout(() => setCopied(false), 2000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [copied]);

  // Determine styles based on variant
  const getContainerStyles = () => {
    const baseStyles = "relative group overflow-hidden transition-all duration-200";
    
    switch (variant) {
      case "compact":
        return `${baseStyles} bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800`;
      case "pill":
        return `${baseStyles} bg-zinc-800 border border-zinc-700 rounded-full hover:bg-zinc-700`;
      default:
        return `${baseStyles} bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md`;
    }
  };

  const getHighlighterStyles = () => {
    const currentTheme = isDark ? oneDark : oneLight;
    
    // Override specific styles for better integration
    const customStyle = {
      ...currentTheme,
      'pre[class*="language-"]': {
        ...currentTheme['pre[class*="language-"]'],
        margin: 0,
        padding: variant === "compact" ? "0.5rem" : variant === "pill" ? "0.25rem 0.75rem" : "1rem",
        background: "transparent",
        fontSize: variant === "pill" ? "0.75rem" : "0.875rem",
        fontFamily: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
        lineHeight: variant === "compact" ? "1.4" : "1.5",
      },
      'code[class*="language-"]': {
        ...currentTheme['code[class*="language-"]'],
        background: "transparent",
        fontSize: "inherit",
        fontFamily: "inherit",
      }
    };

    return customStyle;
  };

  if (variant === "pill") {
    return (
      <div 
        className={getContainerStyles()}
        style={{ maxWidth: maxWidth || "100%" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCopy}
        title={copied ? "Copied!" : "Click to copy"}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleCopy();
          }
        }}
      >
        <div className="flex items-center cursor-pointer">
          <pre className="text-xs font-mono text-zinc-300 truncate px-3 py-1 flex-1">
            <code>{code}</code>
          </pre>
          <div className="flex-shrink-0 px-2">
            {copied ? (
              <ClipboardDocumentCheckIcon className="h-3 w-3 text-green-400" />
            ) : (
              <ClipboardIcon className="h-3 w-3 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={getContainerStyles()}
      style={{ maxWidth: maxWidth || "100%" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        className={`
          absolute top-3 right-3 z-10 p-2 rounded-md transition-all duration-200
          ${copied 
            ? 'bg-green-500 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
          }
          ${isHovered || copied ? 'opacity-100' : 'opacity-0'}
        `}
        title={copied ? "Copied!" : "Copy code"}
      >
        {copied ? (
          <ClipboardDocumentCheckIcon className="h-4 w-4" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </button>

      {/* Syntax Highlighted Code */}
      <SyntaxHighlighter
        language={language}
        style={getHighlighterStyles()}
        showLineNumbers={showLineNumbers}
        wrapLines={true}
        wrapLongLines={true}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: "transparent",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
