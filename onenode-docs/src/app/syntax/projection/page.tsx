import CodeBlock from '@/components/CodeBlock';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import ContactUs from '@/components/ContactUs';
export default function ProjectionPage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>OneNode Projection Syntax (Simplified Guide)</PageTitle>
        
        <p>Here's a simple and concise guide to OneNode projection syntax for quick reference:</p>
        
        <hr className="my-6" />
        
        <h2>1. Include Fields</h2>
        
        <p>Specify fields to include in the query response by setting the <code>mode</code> to <code>include</code> and listing fields.</p>
        
        <CodeBlock
          code={`{
"mode": "include",
"fields": ["field1", "field2"]
}`}
          language="json"
        />
        
        <p>Example:</p>
        
        <CodeBlock
          code={`{
  "mode": "include",
  "fields": ["name", "bio"]
}`}
          language="json"
        />
        
        <p>Explanation: Only the <code>name</code> and <code>bio</code> fields will be returned.</p>
        
        <hr className="my-6" />
        
        <h2>2. Exclude Fields</h2>
        
        <p>Specify fields to exclude in the query response by setting the <code>mode</code> to <code>exclude</code> and listing fields.</p>
        
        <CodeBlock
          code={`{
  "mode": "exclude",
  "fields": ["field1", "field2"]
}`}
          language="json"
        />
        
        <p>Example:</p>
        
        <CodeBlock
          code={`{
  "mode": "exclude",
  "fields": ["password", "creditCard"]
}`}
          language="json"
        />
        
        <p>Explanation: All fields except <code>password</code> and <code>creditCard</code> will be returned.</p>
        
        <hr className="my-6" />
        
        <h2>3. Default Behavior</h2>
        
        <p>If no projection is specified:</p>
        
        <ul>
          <li>The entire document will be included in the response by default.</li>
          <li>Only the <code>_id</code> field will be included if the <code>mode</code> is <code>exclude</code> with no fields specified.</li>
        </ul>
        
        <p>Example:</p>
        
        <CodeBlock
          code={`{
  "mode": "exclude"
}`}
          language="json"
        />
        
        <p>Explanation: Only the <code>_id</code> field is returned.</p>
        
        <hr className="my-6" />
        
        <h2>4. Nested Fields</h2>
        
        <p>Use dot notation to specify nested fields.</p>
        
        <CodeBlock
          code={`{
  "mode": "include",
  "fields": ["address.city", "address.zip"]
}`}
          language="json"
        />
        
        <p>Explanation: Only the <code>city</code> and <code>zip</code> fields within <code>address</code> will be included.</p>
        
        <hr className="my-6" />
        
        <h2>Projection Parameter Scenarios</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Example Projection Value</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Result</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "include" }`}</code></td>
              <td className="border border-gray-300 px-4 py-2">The entire document is returned.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "include", "fields": ["title", "author"] }`}</code></td>
              <td className="border border-gray-300 px-4 py-2">Only the <code>title</code> and <code>author</code> fields are returned.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "exclude" }`}</code></td>
              <td className="border border-gray-300 px-4 py-2">Only the <code>_id</code> field is returned.</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "exclude", "fields": ["title", "author"] }`}</code></td>
              <td className="border border-gray-300 px-4 py-2">All fields except <code>title</code> and <code>author</code> are returned.</td>
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