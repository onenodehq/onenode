'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import Link from 'next/link';
import CodeBlock from '@/components/CodeBlock';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';

export default function FindPage() {
  const basicPythonCode = `# Simple find - get all documents
all_docs = collection.find({})
print(f"Found {len(all_docs)} documents")

# Find with a basic filter
adults = collection.find({"age": {"$gte": 18}})
for doc in adults:
    print(f"Name: {doc['name']}, Age: {doc['age']}")`;

  const basicTypescriptCode = `// Simple find - get all documents
const allDocs = await collection.find({});
console.log(\`Found \${allDocs.length} documents\`);

// Find with a basic filter
const adults = await collection.find({ age: { $gte: 18 } });
adults.forEach(doc => {
  console.log(\`Name: \${doc.name}, Age: \${doc.age}\`);
});`;

  const jsonResponse = `[
  {
    "_id": ObjectId("64d2f8f01234abcd5678ef90"),
    "name": "Alice Smith",
    "age": 29,
    "city": "New York"
  },
  {
    "_id": ObjectId("64d2f8f01234abcd5678ef91"),
    "name": "Bob Johnson",
    "age": 40,
    "city": "New York"
  }
]`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Find</PageTitle>
        
        <LanguageToggle />
        
        <p>
          OneNode allows you to query and retrieve documents from a collection using the same syntax as MongoDB's <code>find()</code> functionality. 
          Start with simple queries and add complexity as needed.
        </p>
        
        <h2>Basic Find Operations</h2>
        
        <p>
          The simplest way to get started is to find all documents or use basic filters:
        </p>
        
        <LanguageContent language="python">
          <CodeBlock code={basicPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={basicTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Basic Response</h3>
        
        <p>
          A successful find operation will return a JSON array containing the matching documents in the collection. 
          Here's an example response:
        </p>
        
        <CodeBlock code={jsonResponse} language="json" />
        
        <h2>Advanced Find Operations</h2>
        
        <p>
          For more control over your queries, you can customize the find operation with additional parameters.
          These parameters allow you to control which fields are returned, sort results, and implement pagination.
        </p>
        
        <h3>Using Projection</h3>
        
        <p>
          The <code>projection</code> parameter controls which fields are included or excluded in the returned documents.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock code={`# Find with projection to include only specific fields
filter_criteria = {"age": {"$gt": 25}}

projection = {
    "mode": "include",
    "fields": ["name", "age"]
}

response = collection.find(filter_criteria, projection)

for doc in response:
    print(f"Name: {doc['name']}, Age: {doc['age']}")
    # Note: Other fields like 'city' will not be included`} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={`// Find with projection to include only specific fields
const filter = { age: { $gt: 25 } };

const response = await collection.find(filter, {
  projection: {
    mode: "include",
    fields: ["name", "age"]
  }
});

response.forEach(doc => {
  console.log(\`Name: \${doc.name}, Age: \${doc.age}\`);
  // Note: Other fields like 'city' will not be included
});`} language="typescript" />
        </LanguageContent>
        
        <InfoCard title="📖 Learn More">
          <p>
            For comprehensive projection syntax and advanced examples, see our <Link href="/syntax/projection" className="underline hover:no-underline">Projection Syntax Guide</Link>.
          </p>
        </InfoCard>
        
        <h3>Using Sort</h3>
        
        <p>
          The <code>sort</code> parameter allows you to specify the sort order for the result set.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock code={`# Find with sort - ascending and descending order
filter_criteria = {"city": "New York"}

# Sort by age in descending order
sort = {"age": -1}

response = collection.find(filter_criteria, sort=sort)

for doc in response:
    print(f"Name: {doc['name']}, Age: {doc['age']}")
    
# Multiple field sorting
sort_multiple = {"age": -1, "name": 1}  # Age desc, then name asc
response = collection.find(filter_criteria, sort=sort_multiple)`} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={`// Find with sort - ascending and descending order
const filter = { city: "New York" };

// Sort by age in descending order
const response = await collection.find(filter, {
  sort: { age: -1 }
});

response.forEach(doc => {
  console.log(\`Name: \${doc.name}, Age: \${doc.age}\`);
});

// Multiple field sorting
const responseMultiple = await collection.find(filter, {
  sort: { age: -1, name: 1 } // Age desc, then name asc
});`} language="typescript" />
        </LanguageContent>
        
        <h3>Using Limit</h3>
        
        <p>
          The <code>limit</code> parameter controls the maximum number of documents returned.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock code={`# Find with limit to get only top results
filter_criteria = {"status": "active"}
limit = 5

response = collection.find(filter_criteria, limit=limit)

print(f"Found {len(response)} documents (limited to {limit})")
for doc in response:
    print(f"Name: {doc['name']}, Status: {doc['status']}")`} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={`// Find with limit to get only top results
const filter = { status: "active" };

const response = await collection.find(filter, {
  limit: 5
});

console.log(\`Found \${response.length} documents (limited to 5)\`);
response.forEach(doc => {
  console.log(\`Name: \${doc.name}, Status: \${doc.status}\`);
});`} language="typescript" />
        </LanguageContent>
        
        <h3>Using Skip for Pagination</h3>
        
        <p>
          The <code>skip</code> parameter allows you to skip a specified number of documents, which is useful for implementing pagination.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock code={`# Find with skip for pagination
filter_criteria = {"department": "Engineering"}
limit = 10
skip = 20  # Skip first 20 documents (page 3 if 10 per page)

response = collection.find(filter_criteria, limit=limit, skip=skip)

print(f"Page 3 results (skipped {skip}, showing up to {limit}):")
for i, doc in enumerate(response, 1):
    print(f"{skip + i}. {doc['name']} - {doc['department']}")
    
# Helper function for pagination
def get_page(page_num, page_size=10):
    skip_count = (page_num - 1) * page_size
    return collection.find({}, limit=page_size, skip=skip_count)`} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={`// Find with skip for pagination
const filter = { department: "Engineering" };

const response = await collection.find(filter, {
  limit: 10,
  skip: 20 // Skip first 20 documents (page 3 if 10 per page)
});

console.log(\`Page 3 results (skipped 20, showing up to 10):\`);
response.forEach((doc, index) => {
  console.log(\`\${20 + index + 1}. \${doc.name} - \${doc.department}\`);
});

// Helper function for pagination
const getPage = async (pageNum: number, pageSize = 10) => {
  const skipCount = (pageNum - 1) * pageSize;
  return await collection.find({}, {
    limit: pageSize,
    skip: skipCount
  });
};`} language="typescript" />
        </LanguageContent>
        
        <h2>Parameters for Find Operations</h2>
        
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
                A query object to match the documents to retrieve. This works the same way as MongoDB filters, 
                allowing you to specify conditions to find the documents. For more details, refer to the 
                <Link href="/syntax/filter" className="text-blue-600 hover:underline"> filter operator syntax</Link>.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>projection</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                A field specification object to control which fields are returned in the result set. 
                Uses OneNode's simplified projection syntax with <code>mode</code> and <code>fields</code>. For more details, refer to the 
                <Link href="/syntax/projection" className="text-blue-600 hover:underline"> projection operator syntax</Link>.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>sort</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                An object specifying the sort order for the result set (e.g., <code>{`{ "age": 1 }`}</code> to sort by <code>age</code> in ascending order, 
                or <code>{`{ "age": -1 }`}</code> for descending).
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>limit</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                A number to limit the number of documents returned.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>skip</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                A number to skip the first <code>n</code> documents in the result set, useful for pagination.
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