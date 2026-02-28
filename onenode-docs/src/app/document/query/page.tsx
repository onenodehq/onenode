'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import CodeBlock from '@/components/CodeBlock';
import InfoCard from '@/components/InfoCard';

export default function QueryPage() {
  const basicPythonCode = `# Simple query example
query_text = "Software engineer with expertise in AI"

response = collection.query(query_text)

# Process the results - response is now a list of QueryMatch objects
for match in response:
    print(f"Match: {match.chunk} (Score: {match.score})")`;

  const basicTypescriptCode = `// Simple query example
const queryText = "Software engineer with expertise in AI";

const response = await collection.query(queryText);

// Process the results - response is now an array of QueryMatch objects
response.forEach(match => {
  console.log(\`Match: \${match.chunk} (Score: \${match.score})\`);
});`;

  const advancedPythonCode = `# Advanced query with optional parameters
from onenode import Models

query_text = "Software engineer with expertise in AI"
emb_model = Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_SMALL  # Optional

projection = {
    "mode": "include",
    "fields": ["name", "bio"]
}  # Optional

response = collection.query(
    query_text, 
    filter={"status": "active"}, 
    projection=projection,
    emb_model=emb_model, 
    top_k=3,  # Optional
    include_embedding=True  # Optional
)

# Process the results - response is now a list of QueryMatch objects
for match in response:
    print(f"Match: {match.chunk} (Score: {match.score})")
    print(f"From document: {match.document['_id']}")
    print(f"Path: {match.path}, Chunk: {match.chunk_n}")
    if match.embedding:  # Optional embedding values
        print(f"Embedding dimensions: {len(match.embedding)}")`;

  const advancedTypescriptCode = `// Advanced query with optional parameters
import { Models } from "onenode";

const queryText = "Software engineer with expertise in AI";
const embModel = Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_SMALL; // Optional
const includeEmbedding = true; // Optional
const projection = {
  mode: "include",
  fields: ["name", "bio"],
}; // Optional

const response = await collection.query(queryText, {
  filter: { status: "active" },
  projection,
  embModel,
  topK: 3, // Optional
  includeEmbedding,
});

// Process the results - response is now an array of QueryMatch objects
response.forEach(match => {
  console.log(\`Match: \${match.chunk} (Score: \${match.score})\`);
  console.log(\`From document: \${match.document._id}\`);
  console.log(\`Path: \${match.path}, Chunk: \${match.chunk_n}\`);
  if (match.embedding) { // Optional embedding values
    console.log(\`Embedding dimensions: \${match.embedding.length}\`);
  }
});`;

  const jsonResponse = `[
  {
    "chunk": "John is a software engineer with expertise in AI.",
    "path": "bio",
    "chunk_n": 0,
    "score": 0.95,
    "document": {
      "_id": ObjectId("64d2f8f01234abcd5678ef90")
      // All document fields are returned here (name, bio, skills, etc.)
    }
  },
  {
    "chunk": "Alice is a data scientist with a background in machine learning.",
    "path": "bio",
    "chunk_n": 1,
    "score": 0.89,
    "document": {
      "_id": ObjectId("64d2f8f01234abcd5678ef91")
      // Complete document data is returned by default
    }
  }
]`;

  const jsonDetailedResponse = `[
  {
    "path": "bio",
    "chunk": "John is a software engineer with expertise in AI.",
    "chunk_n": 0,
    "score": 0.95,
    "embedding": [
      0.123, 0.456, 0.789, ...
    ],
    "document": {
      "_id": ObjectId("64d2f8f01234abcd5678ef90"),
      "name": "John Doe",
      "bio": Text("John is a software engineer with expertise in AI.")
    }
  },
  {
    "path": "bio",
    "chunk": "Alice is a data scientist with a background in machine learning.",
    "chunk_n": 1,
    "score": 0.89,
    "embedding": [
      0.234, 0.567, 0.890, ...
    ],
    "document": {
      "_id": ObjectId("64d2f8f01234abcd5678ef91"),
      "name": "Alice Smith",
      "bio": Text("Alice is a data scientist with a background in machine learning.")
    }
  }
]`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Query</PageTitle>
        
        <LanguageToggle />
        
        <p>
          This guide explains how to perform <strong>semantic queries</strong> on documents in OneNode. 
          Semantic queries retrieve documents by matching the meaning of the provided query text with <strong>indexed multimodal data</strong> in the database.
        </p>
        
        <InfoCard title="Semantic Search Out of the Box!">
          <p className="mb-2">
            OneNode provides <strong>semantic search capabilities</strong> right out of the box, no complex setup required:
          </p>
          <ul className="mt-2 ml-4">
            <li>• <strong>Semantic Search Support</strong> - Intelligent meaning-based queries that understand context and intent</li>
            <li>• <strong>Multimodal Data Support</strong> - Search across text, images, and other data types seamlessly</li>
            <li>• <strong>Zero Configuration</strong> - Start searching immediately without complex embedding setup</li>
            <li>• <strong>High Performance</strong> - Optimized vector search with automatic indexing</li>
          </ul>
        </InfoCard>
        
        <h2>Basic Query Operation</h2>
        
        <p>
          The simplest way to use the <code>query</code> operation is to just provide the query text.
          This offers an easy and intuitive way to search your data semantically without worrying about additional parameters.
        </p>
        
        <h3>Basic Example</h3>
        
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
        
        <h3>Default Response</h3>
        
        <p>
          A successful query operation will return a JSON array containing the matching documents. 
          By default, the response includes the matched text chunks, their location in the document, similarity scores, and basic document metadata:
        </p>
        
        <CodeBlock
          code={jsonResponse}
          language="json"
        />
        
        <p>
          By default, the system will:
        </p>
        <ul>
          <li>Use OpenAI's text-embedding-3-small as the embedding model</li>
          <li>Return the top 10 matching results</li>
          <li>Exclude the vector values from the response</li>
          <li>Return the whole document data, not just minimal metadata</li>
        </ul>
        
        <h2>Advanced Query Operation</h2>
        
        <p>
          For more control over your semantic searches, you can customize the query operation with additional parameters.
          These parameters allow you to fine-tune the search behavior, filter results, and specify what data to include in the response.
        </p>
        
        <h3>Using Filters</h3>
        
        <p>
          The <code>filter</code> parameter allows you to apply MongoDB-style query filters to narrow down documents before performing semantic search.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Query with filter to search only active users
query_text = "Software engineer with expertise in AI"

response = collection.query(
    query_text,
    filter={"status": "active", "experience": {"$gte": 3}}
)

for match in response:
    print(f"Match: {match.chunk} (Score: {match.score})")
    print(f"User status: {match.document['status']}")`}
            language="python"
            />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`// Query with filter to search only active users
const queryText = "Software engineer with expertise in AI";

const response = await collection.query(queryText, {
  filter: { status: "active", experience: { $gte: 3 } }
});

response.forEach(match => {
  console.log(\`Match: \${match.chunk} (Score: \${match.score})\`);
  console.log(\`User status: \${match.document.status}\`);
});`}
            language="typescript"
            />
        </LanguageContent>
        
        <InfoCard title="📖 Learn More">
          <p>
            For detailed filter syntax and examples, see our <a href="/document/filter-syntax" className="underline hover:no-underline">Filter Syntax Guide</a>.
          </p>
        </InfoCard>
        
        <h3>Using Projection</h3>
        
        <p>
          The <code>projection</code> parameter controls which fields are included or excluded in the returned documents.
        </p>
        
        <p className="mt-2 text-sm">
            <strong>Note:</strong> When using projection, the matched chunk may not be available in the response if it comes from a field that's excluded by the projection.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Query with projection to include only specific fields
query_text = "Data scientist with machine learning experience"

projection = {
    "mode": "include",
    "fields": ["name", "bio", "skills"]
}

response = collection.query(query_text, projection=projection)

for match in response:
         print(f"Match: {match.chunk}") # This will be None if the chunk field is excluded by the projection
    print(f"Name: {match.document.get('name')}")
    print(f"Skills: {match.document.get('skills')}")`}
            language="python"
            />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`// Query with projection to include only specific fields
const queryText = "Data scientist with machine learning experience";

const projection = {
  mode: "include", 
  fields: ["name", "bio", "skills"]
};

const response = await collection.query(queryText, { projection });

response.forEach(match => {
     console.log(\`Match: \${match.chunk}\`); // This will be null if the chunk field is excluded by the projection
  console.log(\`Name: \${match.document.name}\`);
  console.log(\`Skills: \${match.document.skills}\`);
});`}
            language="typescript"
            />
        </LanguageContent>
        
        <InfoCard title="📖 Learn More">
          <p>
            For comprehensive projection syntax and advanced examples, see our <a href="/document/projection-syntax" className="underline hover:no-underline">Projection Syntax Guide</a>.
          </p>
        </InfoCard>
        
        <h3>Using Custom Embedding Model</h3>
        
        <p>
          The <code>emb_model</code> parameter allows you to specify which embedding model to use for the query.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Query with custom embedding model
from onenode import Models

query_text = "Frontend developer with React expertise"

response = collection.query(
    query_text,
    emb_model=Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
)

for match in response:
    print(f"Match: {match.chunk} (Score: {match.score})")
    print(f"Document ID: {match.document['_id']}")`}
            language="python"
            />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`// Query with custom embedding model
import { Models } from "onenode";

const queryText = "Frontend developer with React expertise";

const response = await collection.query(queryText, {
  embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
});

response.forEach(match => {
  console.log(\`Match: \${match.chunk} (Score: \${match.score})\`);
  console.log(\`Document ID: \${match.document._id}\`);
});`}
            language="typescript"
            />
        </LanguageContent>
        
        <InfoCard title="📖 Learn More">
          <p>
            For a complete list of available embedding models and their specifications, see our <a href="/document/embedding-models" className="underline hover:no-underline">Embedding Models Guide</a>.
          </p>
        </InfoCard>
        
        <h3>Limiting Results with top_k</h3>
        
        <p>
          The <code>top_k</code> parameter controls the maximum number of results returned from the query.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Query with limited results
query_text = "Python developer with Django experience"

response = collection.query(query_text, top_k=5)

print(f"Found {len(response)} matches:")
for i, match in enumerate(response, 1):
    print(f"{i}. {match.chunk} (Score: {match.score:.3f})")`}
            language="python"
            />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`// Query with limited results
const queryText = "Python developer with Django experience";

const response = await collection.query(queryText, { topK: 5 });

console.log(\`Found \${response.length} matches:\`);
response.forEach((match, index) => {
  console.log(\`\${index + 1}. \${match.chunk} (Score: \${match.score.toFixed(3)})\`);
});`}
            language="typescript"
            />
        </LanguageContent>
        
        <h3>Including Embedding Values</h3>
        
        <p>
          The <code>include_embedding</code> parameter determines whether to include the raw embedding vector values in the response.
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Query with embedding values included
query_text = "DevOps engineer with Kubernetes skills"

response = collection.query(query_text, include_embedding=True)

for match in response:
    print(f"Match: {match.chunk} (Score: {match.score})")
    if match.embedding:
        print(f"Embedding dimensions: {len(match.embedding)}")
        print(f"First few values: {match.embedding[:5]}")`}
            language="python"
            />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`// Query with embedding values included
const queryText = "DevOps engineer with Kubernetes skills";

const response = await collection.query(queryText, { 
  includeEmbedding: true 
});

response.forEach(match => {
  console.log(\`Match: \${match.chunk} (Score: \${match.score})\`);
  if (match.embedding) {
    console.log(\`Embedding dimensions: \${match.embedding.length}\`);
    console.log(\`First few values: \${match.embedding.slice(0, 5)}\`);
  }
});`}
            language="typescript"
            />
        </LanguageContent>
        

        <h2>Parameters for Query Operations</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Parameter</th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>query</strong></td>
              <td className="border border-gray-300 px-4 py-2">
                The text to be embedded and matched against stored indexed fields. This parameter is required.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>filter</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                MongoDB-style query filter to apply to documents before semantic search. 
                This helps narrow down the document set before performing the semantic search.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>projection</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                Specifies which fields to include or exclude in the returned documents.
                Format: <code>{"{"}"mode": "include", "fields": ["field1", "field2"]{"}"}</code> or 
                <code>{"{"}"mode": "exclude", "fields": ["field3"]{"}"}</code>.
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>emb_model</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                The embedding model used for the query. Defaults to OpenAI's text-embedding-3-small. 
                Users can select from supported embedding models. 
                If the specified model does not match those used in the stored data, only matching fields will be targeted.
                <br/><em>Note: Use <code>embModel</code> in TypeScript/JavaScript.</em>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>top_k</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                The maximum number of matches to return. Defaults to 10. Increase this value to get more results,
                decrease it to improve performance and reduce response size.
                <br/><em>Note: Use <code>topK</code> in TypeScript/JavaScript.</em>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><strong>include_embedding</strong> (optional)</td>
              <td className="border border-gray-300 px-4 py-2">
                Whether to include the embedding vector values in the response. Defaults to false.
                Set to true if you need the raw vector data for further processing.
                <br/><em>Note: Use <code>includeEmbedding</code> in TypeScript/JavaScript.</em>
              </td>
            </tr>
          </tbody>
        </table>
        

        <Feedback />
      </div>
    </DocLayout>
  );
} 