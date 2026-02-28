'use client';

import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import Feedback from '@/components/Feedback';
import CodeBlock from '@/components/CodeBlock';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';
import { DocumentTextIcon, PhotoIcon, CpuChipIcon } from '@heroicons/react/24/outline';

export default function InsertPage() {
  const pythonCode = `from onenode import Text, Image

# Create multimodal data instances first
bio_text = Text("John is a software engineer with expertise in AI.").enable_index()
profile_image = Image("path/to/profile.jpg").enable_index()

bio_text_2 = Text("Jane is a data scientist specializing in machine learning.").enable_index()
profile_image_2 = Image("path/to/jane_profile.jpg").enable_index()

# Create documents with the instances
docs = [{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "age": 30,
    "bio": bio_text,
    "profile_picture": profile_image
}, {
    "name": "Jane Smith",
    "email": "janesmith@example.com", 
    "age": 28,
    "bio": bio_text_2,
    "profile_picture": profile_image_2
}]

# Insert the documents
response = collection.insert(docs)

print(response.inserted_ids)`;

  const typescriptCode = `import { Text, Image } from "@onenodehq/onenode";

// Create multimodal data instances first
const bioText = new Text("John is a software engineer with expertise in AI.").enableIndex();
const profileImage = new Image("path/to/profile.jpg").enableIndex();

const bioText2 = new Text("Jane is a data scientist specializing in machine learning.").enableIndex();
const profileImage2 = new Image("path/to/jane_profile.jpg").enableIndex();

// Create documents with the instances
const docs = [
  {
    name: "John Doe",
    email: "johndoe@example.com",
    age: 30,
    bio: bioText,
    profilePicture: profileImage,
  },
  {
    name: "Jane Smith",
    email: "janesmith@example.com",
    age: 28,
    bio: bioText2,
    profilePicture: profileImage2,
  },
];

// Insert the documents
const response = await collection.insert(docs);
console.log(response.inserted_ids);`;

  const jsonResponse = `{
  "inserted_ids": [
    ObjectId("64d2f8f01234abcd5678ef90"), // BSON ObjectId
    ObjectId("64d2f8f01234abcd5678ef91") // BSON ObjectId
  ]
}`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Insert</PageTitle>
        
        <LanguageToggle />
        
        <p>
          Inserting documents into OneNode is straightforward. You can save a single document or multiple documents at once with multimodal data types.
        </p>
        
        <h3>Example Code for <code>insert</code> Operation</h3>
        
        <LanguageContent language="python">
          <p>
            Here's an example of how to insert documents using Python. You can insert a single document or multiple 
            documents using the same method:
          </p>
          
          <CodeBlock code={pythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <p>
            Here's an example of how to insert documents using TypeScript with the <code>fetch</code> API. 
            You can insert a single document or multiple documents using the same method:
          </p>
          
          <CodeBlock code={typescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Using Custom Embedding Models</h3>
        
        <p>
          You can specify custom embedding models when creating Text and Image instances to optimize for specific use cases.
          This allows you to use different embedding models for different types of content or to match the models used in your queries.
        </p>
        
        <LanguageContent language="python">
          <p>
            Here's how to use custom embedding models when creating Text and Image instances in Python:
          </p>
          
          <CodeBlock code={`from onenode import Text, Image, Models

# Create Text instance with custom embedding model
bio_text = Text("John is a software engineer with expertise in AI.").enable_index(
    emb_model=Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
)

# Create Image instance with custom vision model  
profile_image = Image("path/to/profile.jpg").enable_index(
    vision_model=Models.ImageToText.OpenAI.GPT_4O
)

# Create document with custom embedding instances
doc = [{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "age": 30,
    "bio": bio_text,
    "profile_picture": profile_image
}]

# Insert the document
response = collection.insert(doc)
print(response.inserted_ids)`} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <p>
            Here's how to use custom embedding models when creating Text and Image instances in TypeScript:
          </p>
          
          <CodeBlock code={`import { Text, Image, Models } from "@onenodehq/onenode";

// Create Text instance with custom embedding model
const bioText = new Text("John is a software engineer with expertise in AI.").enableIndex({
  embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
});

// Create Image instance with custom vision model
const profileImage = new Image("path/to/profile.jpg").enableIndex({
  visionModel: Models.ImageToText.OpenAI.GPT_4O
});

// Create document with custom embedding instances
const doc = [{
  name: "John Doe",
  email: "johndoe@example.com",
  age: 30,
  bio: bioText,
  profilePicture: profileImage,
}];

// Insert the document
const response = await collection.insert(doc);
console.log(response.inserted_ids);`} language="typescript" />
        </LanguageContent>
        
        <InfoCard title="Learn More About Multimodal Data Types" icon="">
          <p className="mb-6">
            Dive deeper into how Text and Image classes work, and explore the available embedding models to unlock the full potential of multimodal search and indexing.
          </p>
          
          <div className="grid md:grid-cols-3 gap-3">
            <a 
              href="/multimodal/text" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Text Class
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Text processing, embeddings, and search
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/multimodal/image" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <PhotoIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Image Class
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Image processing, visual embeddings, and similarity
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/llm_models/embedding" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <CpuChipIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Embedding Models
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Available models and their specifications
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
          </div>
        </InfoCard>
        
        <h3>Insert Response</h3>
        
        <p>A successful insert operation will return the following JSON response:</p>
        
        <CodeBlock code={jsonResponse} language="json" />
        
        <InfoCard title="Auto-generated Document IDs" icon="🔑">
          <p className="mb-2">
            <strong>ObjectId</strong> is a unique 12-byte identifier used by MongoDB-style databases. 
            It consists of a timestamp, machine identifier, and a counter, ensuring uniqueness across distributed systems.
          </p>
          <p className="m-0">
            When you insert documents without specifying an <code>_id</code> field, OneNode automatically generates 
            a unique ObjectId and assigns it as the document's <code>_id</code>. This ensures every document has 
            a unique identifier for future queries and updates.
          </p>
        </InfoCard>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 