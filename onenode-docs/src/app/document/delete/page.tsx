'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import Link from 'next/link';
import CodeBlock from '@/components/CodeBlock';
import ContactUs from '@/components/ContactUs';

export default function DeletePage() {
  const pythonCode = `# Filter to match the document(s) to delete
filter_criteria = {
    "name": "Alice Smith"
}

# Sending the request
response = collection.delete(filter_criteria)`;

  const typescriptCode = `// Filter to match the document(s) to delete
const filter = {
  name: "Alice Smith",
};

const response = collection.delete(filter);`;

  const jsonResponse = `{
  "deleted_count": 1
}`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Delete</PageTitle>
        
        <LanguageToggle />
        
        <p>
          OneNode provides a straightforward way to delete documents from a collection using operations similar to MongoDB's delete functionality. 
          You can delete one or multiple documents that match a specified filter.
        </p>
        
        <h2>Delete Operation</h2>
        
        <p>
          The <code>delete</code> operation allows you to remove documents from a collection that match a specified filter. 
          This operation is permanent and cannot be undone.
        </p>
        
        <h3>Example Python Code for <code>delete</code></h3>
        
        <p>Here's how you can delete documents using Python:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={pythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={typescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Delete Response</h3>
        
        <p>
          A successful delete operation will return a JSON response containing information about the number of documents deleted. 
          Here's an example response:
        </p>
        
        <CodeBlock code={jsonResponse} language="json" />
        
        <h2>Parameters for Delete Operations</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Parameter</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>filter</strong></td>
              <td className="border border-gray-300 px-4 py-2">
                A query object to match the documents to delete. This works the same way as MongoDB filters, 
                allowing you to specify conditions to find the documents. For more details, refer to the 
                <Link href="/syntax/filter" className="text-blue-600 hover:underline"> filter operator syntax</Link>.
              </td>
            </tr>
          </tbody>
        </table>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 