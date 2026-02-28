'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import Link from 'next/link';
import CodeBlock from '@/components/CodeBlock';
import ContactUs from '@/components/ContactUs';

export default function UpdatePage() {
  const basicPythonCode = `# Filter to match the document(s) to update
filter_criteria = {
    "name": "Alice Smith"
}

# Update operations to apply
update_operations = {
    "$set": {
        "age": 30,
        "email": "alice.smith@example.com"
    },
    "$inc": {
        "login_count": 1
    }
}

# Sending the request
response = collection.update(filter_criteria, update_operations)`;

  const basicTypescriptCode = `// Filter to match the document(s) to update
const filter = {
  name: "Alice Smith",
};

// Update operations to apply
const update = {
  $set: {
    age: 30,
    email: "alice.smith@example.com",
  },
  $inc: {
    login_count: 1,
  },
};

const response = await collection.update(filter, update);`;

  const upsertPythonCode = `# Filter to match the document(s) to update
filter_criteria = {
    "name": "Bob Johnson"
}

# Update operations to apply
update_operations = {
    "$set": {
        "age": 25,
        "email": "bob.johnson@example.com",
        "status": "active"
    }
}

# Enable upsert to create document if no match is found
upsert = True

# Sending the request with upsert
response = collection.update(filter_criteria, update_operations, upsert)`;

  const upsertTypescriptCode = `// Filter to match the document(s) to update
const filter = {
  name: "Bob Johnson",
};

// Update operations to apply
const update = {
  $set: {
    age: 25,
    email: "bob.johnson@example.com",
    status: "active",
  },
};

// Enable upsert to create document if no match is found
const response = await collection.update(filter, update, { upsert: true });`;

  const basicJsonResponse = `{
  "matched_count": 1,
  "modified_count": 1,
  "upserted_id": null
}`;

  const upsertJsonResponse = `{
  "matched_count": 0,
  "modified_count": 0,
  "upserted_id": ObjectId("507f1f77bcf86cd799439011")
}`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Update</PageTitle>
        
        <LanguageToggle />
        
        <p>
          OneNode provides a flexible way to update documents in a collection using the same syntax as MongoDB's update functionality. 
          You can use various update operators to modify fields, and optionally create new documents if no matches are found.
        </p>
        
        <h2>Basic Update Operation</h2>
        
        <p>
          The <code>update</code> operation allows you to modify existing documents in a collection that match a specified filter. 
          You can use different update operators like <code>$set</code>, <code>$inc</code>, <code>$push</code>, and others to perform various modifications.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={basicPythonCode}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={basicTypescriptCode}
            language="typescript"
          />
        </LanguageContent>
        
        <h3>Basic Update Response</h3>
        
        <p>
          A successful update operation will return a JSON response containing information about the operation's results:
        </p>

        <CodeBlock
          code={basicJsonResponse}
          language="json"
        />
        
        <h2>Upsert Operation</h2>
        
        <p>
          The <code>upsert</code> parameter allows you to create a new document if no documents match the filter criteria. 
          When set to <code>true</code>, the operation will insert a new document with the specified update operations if no matches are found.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={upsertPythonCode}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={upsertTypescriptCode}
            language="typescript"
          />
        </LanguageContent>
        
        <h3>Upsert Response</h3>
        
        <p>
          When a document is created via upsert, the response will include the <code>upserted_id</code> of the new document as a MongoDB ObjectId:
        </p>

        <CodeBlock
          code={upsertJsonResponse}
          language="json"
        />
        
        <h2>Parameters</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Parameter</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Type</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Required</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>filter</strong></td>
              <td className="border border-gray-300 px-4 py-2">Object</td>
              <td className="border border-gray-300 px-4 py-2">Yes</td>
              <td className="border border-gray-300 px-4 py-2">
                A query object to match the documents to update. For more details, refer to the 
                <Link href="/syntax/filter" className="text-blue-600 hover:underline"> filter operator syntax</Link>.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>update</strong></td>
              <td className="border border-gray-300 px-4 py-2">Object</td>
              <td className="border border-gray-300 px-4 py-2">Yes</td>
              <td className="border border-gray-300 px-4 py-2">
                An object containing update operators that specify the modifications to apply. For more details, refer to the 
                <Link href="/syntax/update" className="text-blue-600 hover:underline"> update operator syntax</Link>.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>upsert</strong></td>
              <td className="border border-gray-300 px-4 py-2">Boolean</td>
              <td className="border border-gray-300 px-4 py-2">No</td>
              <td className="border border-gray-300 px-4 py-2">
                When set to <code>true</code>, creates a new document if no documents match the filter criteria. 
                Defaults to <code>false</code>.
              </td>
            </tr>
          </tbody>
        </table>
        
        <h2>Response Fields</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Field</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Type</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>matched_count</strong></td>
              <td className="border border-gray-300 px-4 py-2">Number</td>
              <td className="border border-gray-300 px-4 py-2">
                The number of documents that matched the filter criteria.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>modified_count</strong></td>
              <td className="border border-gray-300 px-4 py-2">Number</td>
              <td className="border border-gray-300 px-4 py-2">
                The number of documents that were actually modified by the update operation.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>upserted_id</strong></td>
              <td className="border border-gray-300 px-4 py-2">ObjectId | null</td>
              <td className="border border-gray-300 px-4 py-2">
                The MongoDB ObjectId of the document created during an upsert operation. 
                Returns <code>null</code> if no document was upserted.
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