'use client';

import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import CopyButton from './CopyButton';

interface CodeBlockProps {
  code: string;
  language?: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ 
  code, 
  language = 'python',
}) => {
  return (
    <div className="relative">
      <CopyButton code={code} />
      <div className="custom-code-block">
        <SyntaxHighlighter 
          language={language}
          style={prism}
          customStyle={{
            borderRadius: '0.75rem',
            padding: '2rem',
            fontSize: '0.75rem'
          }}
          PreTag={({ children, ...rest }) => (
            <pre {...rest}>{children}</pre>
          )}
          CodeTag={({ children, ...rest }) => {
            if (typeof children === 'string') {
              return (
                <code {...rest}>{children}</code>
              );
            }
            return <code {...rest}>{children}</code>;
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock; 