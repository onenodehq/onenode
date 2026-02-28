import React from 'react';

interface ContactUsProps {
  // Optional variant to support both "Got question?" and "Got a question?" formats
  variant?: 'default' | 'with-a';
}

export default function ContactUs({ variant = 'default' }: ContactUsProps) {
  const questionText = variant === 'with-a' ? 'Got a question?' : 'Got question?';
  
  return (
    <h3>
      {questionText}{' '}
      <a 
        href="mailto:founders@onenode.ai" 
        className="text-blue-600 hover:underline"
      >
        Email us
      </a>
      {' '}and we'll get back to you within 24 hours.
    </h3>
  );
} 