'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import CodeBlock from '@/components/CodeBlock';

export default function DropPage() {
  const pythonCode = `from onenode import OneNode
from dotenv import load_dotenv

load_dotenv()
onenode = OneNode()
db = onenode.db("your_db_name")
collection = db.collection("your_collection_name")

# Drop the entire collection
collection.drop()`;

  const typescriptCode = `import { OneNode } from "@onenodehq/onenode";
import dotenv from "dotenv";

dotenv.config();
const onenode = new OneNode();
const db = onenode.db("your_db_name");
const collection = db.collection("your_collection_name");

// Drop the entire collection
await collection.drop();`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Drop Collection</PageTitle>
        
        <LanguageToggle />
        
        <p>
          OneNode provides a method to completely remove a collection including all of its documents, indexes, and metadata.
          This operation is permanent and cannot be undone.
        </p>
        
        <h2>Drop Operation</h2>
        
        <p>
          The <code>drop</code> operation deletes the entire collection. Use this with caution as it will permanently remove all data
          in the collection.
        </p>
        
        <h3>Example Python Code for <code>drop</code></h3>
        
        <p>Here's how you can drop a collection using Python:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={pythonCode} language="python" />
        </LanguageContent>
        
        <h3>Example TypeScript Code for <code>drop</code></h3>
        
        <p>Here's how you can drop a collection using TypeScript:</p>
        
        <LanguageContent language="typescript">
          <CodeBlock code={typescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Response</h3>
        
        <p>
          The <code>drop</code> method doesn't return any meaningful content on success (HTTP 204 No Content response).
          If there is an error, appropriate exceptions will be thrown.
        </p>
        
        <h2>Important Considerations</h2>
        
        <ul>
          <li>The <code>drop</code> operation is permanent and cannot be undone</li>
          <li>All documents and indexes in the collection will be deleted</li>
          <li>Consider creating backups before dropping collections in a production environment</li>
        </ul>
        
        <Feedback />
      </div>
    </DocLayout>
  );
} 