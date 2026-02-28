import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import CodeBlock from '@/components/CodeBlock';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';

export default function HomePage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Quick Start</PageTitle>
        
        <LanguageToggle />
        
        <p>
          Welcome to <strong>OneNode</strong>! The chillest AI-native database out there! Get started instantly without any setup or signup - just install the SDK and start saving documents. 
          Whether you're prototyping, learning, or exploring our features, you can begin using OneNode immediately.
        </p>
        
        <h2>Step 1: Install SDK</h2>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`pip install onenode`}
            language="bash"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`npm install @onenodehq/onenode`}
            language="bash"
          />
        </LanguageContent>
        
        <h2>Step 2: Initialize the Client</h2>
        
        <p>Choose how you want to initialize OneNode based on your needs:</p>
        
        <h3>Option A: Without API Key (Temporary Data/Prototyping)</h3>
        
        <p>No environment variables, no API keys, no configuration - just start using OneNode immediately. <strong>Completely free</strong> with no signup required:</p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`from onenode import OneNode, Text, Image

# Initialize client in anonymous mode - works instantly!
client = OneNode()
db = client.db("your_database")
collection = db.collection("your_collection")`}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`import { OneNode, Text, Image } from "@onenodehq/onenode";

// Initialize client in anonymous mode - works instantly!
const client = new OneNode();
const db = client.db("your_database");
const collection = db.collection("your_collection");`}
            language="typescript"
          />
        </LanguageContent>
        
        <h3>Option B: With API Key (Persistent Data)</h3>
        
        <p>For production applications and persistent data, initialize with your API key. <strong>Free to use</strong> - just sign up to generate your API key:</p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`from onenode import OneNode, Text, Image
import os

# Initialize client with API key
client = OneNode(api_key="your_api_key_here")
# Or use environment variable
# client = OneNode(api_key=os.getenv("ONENODE_API_KEY"))

db = client.db("your_database")
collection = db.collection("your_collection")`}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`import { OneNode, Text, Image } from "@onenodehq/onenode";

// Initialize client with API key
const client = new OneNode({ apiKey: "your_api_key_here" });
// Or use environment variable
// const client = new OneNode({ apiKey: process.env.ONENODE_API_KEY });

const db = client.db("your_database");
const collection = db.collection("your_collection");`}
            language="typescript"
          />
        </LanguageContent>
        
        <InfoCard title="Anonymous vs API Key Usage" icon="ℹ️">
          <ul className="space-y-2">
            <li><strong>Anonymous Mode (Option A)</strong>: Perfect for prototyping, learning, and testing. Data is temporary and automatically cleaned up. <strong>Completely free</strong> with no signup required - works instantly!</li>
            <li><strong>API Key Mode (Option B)</strong>: Required for production applications. Data persists permanently, higher rate limits, access to advanced features like the developer console. <strong>Free to use</strong> - just requires signup to generate API key.</li>
          </ul>
        </InfoCard>
        
        <h2>Step 3: Save Documents</h2>
        
        <h3>Example: Insert a Document</h3>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`# Create text instance
background_text = Text(
    "Through the Looking-Glass follows Alice as she steps into a fantastical world..."
).enable_index()

# Create image instance (file type auto-detected from extension)
profile_image = Image("alice-profile.jpg").enable_index()

# Define the document to be inserted
docs = [
    {
        "name": "Alice",
        "age": "7",
        "background": background_text,
        "profile_picture": profile_image,
    }
]

# Make the POST request to insert the document
response = collection.insert(docs)
print("Document inserted successfully!")`}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <p>Use TypeScript to insert a doc into the collection:</p>
          
          <CodeBlock
            code={`async function main() {
  // Create text instance
  const backgroundText = new Text(
    "Through the Looking-Glass follows Alice as she steps into a fantastical world..."
  ).enableIndex();

  // Create image instance (file type auto-detected from File object)
  const profileImage = new Image(profileImageFile).enableIndex();

  // Define the document to be inserted
  const docs = [
    {
      name: "Alice",
      age: "7",
      background: backgroundText,
      profile_picture: profileImage,
    },
  ];

  const result = await collection.insert(docs);
  console.log("Document inserted successfully!");
}

main();`}
            language="typescript"
          />
        </LanguageContent>
        
        <h2>Step 4: Querying the Data</h2>
        
        <h3>Built-in Semantic Search</h3>
        
        <LanguageContent language="python">
          <p>Here's how to perform a query using Python:</p>
          
          <CodeBlock
            code={`query = "Alice in a fantastical world"
filter_dict = {"category": "fiction"}  # Optional
projection = {"mode": "include", "fields": ["title", "content"]}  # Optional

matches = collection.query(query, filter_dict, projection)

# Access results using attribute-style syntax
for match in matches:
    print(f"Match: {match.chunk} (Similarity Score: {match.score})")
    print(f"Document: {match.document}")`}
            language="python"
          />
        </LanguageContent>



        
        <LanguageContent language="typescript">
          <p>Here's how to perform a query using TypeScript:</p>
          
          <CodeBlock
            code={`async function main() {
  // Define the query
  const query = "Alice in a fantastical world";

  // Execute the query with optional parameters
  const matches = await collection.query(query, {
    filter: {category: "fiction"}, // Optional
    projection: {mode: "include", fields: ["title", "content"]} // Optional
  });
  
  // Access results using attribute-style syntax
  matches.forEach(match => {
    console.log(\`Match: \${match.chunk} (Similarity Score: \${match.score})\`);
    console.log(\`Document: \${match.document}\`);
  });
}

main();`}
            language="typescript"
          />
        </LanguageContent>
        
        <h3>Traditional Search</h3>
        
        <p>For non-semantic, traditional database queries, use the <code>find</code> method. This works just like MongoDB queries and is perfect for exact matches, filtering by specific values, and structured data retrieval.</p>
        
        <LanguageContent language="python">
          <p>Here's how to perform traditional search using Python:</p>
          
          <CodeBlock
            code={`filter_dict = {"name": "Alice"}  # Simple filter
projection = {"mode": "include", "fields": ["name", "age"]}  # Optional
sort = {"age": -1}  # Optional

results = collection.find(filter_dict, projection, sort)

# Process results
for document in results:
    print(f"Found: {document}")`}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <p>Here's how to perform traditional search using TypeScript:</p>
          
          <CodeBlock
            code={`async function main() {
  // Define the filter
  const filter = {name: "Alice"};
  
  // Execute the find with optional parameters
  const results = await collection.find(filter, {
    projection: {mode: "include", fields: ["name", "age"]}, // optional
    sort: {age: -1}, // optional
    limit: 10 // optional
  });
  
  // Process results
  results.forEach(document => {
    console.log(\`Found: \${document}\`);
  });
}

main();`}
            language="typescript"
          />
        </LanguageContent>
        
        <h3>Traditional vs Semantic Search</h3>
        
        <p>Choose the right method for your use case:</p>
        
        <ul>
          <li><strong>Traditional search (<code>find</code>)</strong>: Perfect for exact matches, filtering by known values, structured queries, and when you need predictable results.</li>
          <li><strong>Semantic search (<code>query</code>)</strong>: Ideal for finding content by meaning, natural language queries, and discovering related information even when exact keywords don't match.</li>
        </ul>
        
        {/* Sign Up Benefits Card */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 my-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Ready for Production?</h3>
          <p className="text-gray-600 mb-4">
            Sign up for additional benefits when building production applications:
          </p>
          <ul className="text-gray-600 space-y-1 mb-6 text-sm">
            <li>• <strong>Permanent data storage</strong> - your data never expires</li>
            <li>• <strong>Higher rate limits</strong> - scale your applications</li>
            <li>• <strong>Production features</strong> - collection management, user permissions</li>
            <li>• <strong>Developer console</strong> - visual data management and monitoring</li>
          </ul>
          <a 
            href="https://onenode.ai" 
            className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition-colors !text-white"
          >
            Sign Up for Free
          </a>
        </div>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 