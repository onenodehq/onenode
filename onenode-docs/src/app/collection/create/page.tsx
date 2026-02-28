'use client';

import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import ContactUs from '@/components/ContactUs';

export default function CreateCollectionPage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Create Collection</PageTitle>
        
        <p>
          <strong>There is no explicit <code>collection.create()</code> method in OneNode.</strong>
        </p>
        
        <p>
          Collections are created automatically when you insert your first document.
        </p>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 