import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import ContactUs from '@/components/ContactUs';
import CodeBlock from '@/components/CodeBlock';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import InfoCard from '@/components/InfoCard';

export default function Page() {
  const basicPythonExample = `from onenode import Text, Image

# Step 1: Create Text instance
description_text = Text("This is a detailed description that will be embedded for semantic search")

# Step 2: Enable indexing for Text
description_text.enable_index()

# Step 3: Create Image instance (file type auto-detected from extension)
thumbnail_image = Image("thumbnail.jpg")

# Step 4: Enable indexing for Image
thumbnail_image.enable_index()

# Step 5: Create document with multimodal fields
document = {
    "title": "My First Document",
    "description": description_text,
    "thumbnail": thumbnail_image
}

# Step 6: Store in OneNode
collection.insert([document])

# Step 7: Search semantically across all embedded fields
results = collection.find({"$semanticSearch": "design principles"})`;

  const basicTypescriptExample = `import { Text, Image } from "@onenodehq/onenode";

// Step 1: Create Text instance
const descriptionText = new Text("This is a detailed description that will be embedded for semantic search");

// Step 2: Enable indexing for Text
descriptionText.enableIndex();

// Step 3: Create Image instance (file type auto-detected from File object)
const thumbnailImage = new Image(fileInput.files[0]);

// Step 4: Enable indexing for Image
thumbnailImage.enableIndex();

// Step 5: Create document with multimodal fields
const document = {
    title: "My First Document",
    description: descriptionText,
    thumbnail: thumbnailImage
};

// Step 6: Store in OneNode
await collection.insert([document]);

// Step 7: Search semantically across all embedded fields
const results = await collection.find({"$semanticSearch": "design principles"});`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Multimodal Data Types</PageTitle>
        
        <p>
          <strong>OneNode</strong> supports multimodal data types that make working with AI and embeddings 
          simple. With built-in multimodal data types, you can store text, images, and other media in your database and have them automatically 
          embedded for semantic search.
        </p>
        
        <h2>What Multimodal Data Types Do For You</h2>
        
        <ul>
          <li><strong>Automatic Embedding</strong>: Just wrap your content in a multimodal data type, and OneNode handles the embedding process</li>
          <li><strong>Semantic Search Across Different Modalities</strong>: Query text, images, and other media types using natural language in a single search</li>
          <li><strong>No External Media Storage Needed</strong>: Store your media directly in OneNode—no need for separate file storage systems or CDNs</li>
          <li><strong>Async by Default</strong>: All embedding and processing happens asynchronously, keeping your application fast and responsive</li>
        </ul>
        
        <h2>Quick Example</h2>
        
        <p>See how easy it is to use multimodal data types in your applications:</p>
        
        <LanguageToggle />
        
        <LanguageContent language="python">
          <CodeBlock
            code={basicPythonExample}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={basicTypescriptExample}
            language="typescript"
          />
        </LanguageContent>
        
        <h2>Available Multimodal Data Types</h2>
        
        <ul>
          <li><a href="/emb_json/emb_text" className="text-blue-600 hover:underline"><strong>Text</strong></a>: For text data ranging from short phrases to long documents</li>
          <li><a href="/emb_json/emb_image" className="text-blue-600 hover:underline"><strong>Image</strong></a>: For images (accepts files, binary data, and base64 encoded data)</li>
          <li><strong>Coming Soon</strong>: EmbVideo, EmbFile, EmbAudio, and Emb3D for additional media types</li>
        </ul>
        
        <InfoCard title="Pro Tip" icon="💡">
          <p className="m-0">Multimodal data types handle customization options like chunk sizes and embedding models. 
          Start simple and refine as your needs evolve.</p>
        </InfoCard>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 