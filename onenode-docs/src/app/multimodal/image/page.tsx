'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import CodeBlock from '@/components/CodeBlock';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';
import { useLanguage } from '@/context/LanguageContext';
import { MagnifyingGlassIcon, DocumentTextIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function Page() {
  const { language: contextLanguage } = useLanguage();

  const basicPythonCode = `from onenode import Image

# Step 1: Create Image instance
product_image = Image("product.jpg")

# Step 2: Enable indexing
product_image.enable_index()

# Step 3: Use in document
{
  "field_name": product_image
}`;

  const basicTypescriptCode = `import { Image } from "@onenodehq/onenode";

// Step 1: Create Image instance
const productImage = new Image(file);

// Step 2: Enable indexing
productImage.enableIndex();

// Step 3: Use in document
{
  field_name: productImage
}`;

  const indexingPythonCode = `from onenode import Image

# Enable indexing with default settings
{
  "field_name": Image("product.jpg").enable_index()
}`;

  const indexingTypescriptCode = `import { Image } from "@onenodehq/onenode";

// Enable indexing with default settings
{
  field_name: new Image(file).enableIndex()
}`;

  // Individual parameter examples
  const visionModelPythonCode = `from onenode import Image, Models

# Using a specific vision model for higher quality image analysis
hero_image = Image("hero_banner.jpg")

# Configure with a high-quality vision model
vision_config = {
    "vision_model": Models.ImageToText.OpenAI.GPT_4O
}

hero_image.enable_index(**vision_config)

# Use in document
{
    "hero_banner": hero_image
}`;

  const visionModelTypescriptCode = `import { Image, Models } from "@onenodehq/onenode";

// Using a specific vision model for higher quality image analysis
const heroImage = new Image(file);

// Configure with a high-quality vision model
const visionConfig = {
    visionModel: Models.ImageToText.OpenAI.GPT_4O
};

heroImage.enableIndex(visionConfig);

// Use in document
{
    hero_banner: heroImage
}`;

  const embModelPythonCode = `from onenode import Image, Models

# Configure both vision and embedding models
gallery_image = Image("gallery_1.jpg")

# High-quality models for important visual content
quality_config = {
    "vision_model": Models.ImageToText.OpenAI.GPT_4O,
    "emb_model": Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
}

gallery_image.enable_index(**quality_config)

# Use in document
{
    "gallery_image": gallery_image
}`;

  const embModelTypescriptCode = `import { Image, Models } from "@onenodehq/onenode";

// Configure both vision and embedding models
const galleryImage = new Image(file);

// High-quality models for important visual content
const qualityConfig = {
    visionModel: Models.ImageToText.OpenAI.GPT_4O,
    embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
};

galleryImage.enableIndex(qualityConfig);

// Use in document
{
    gallery_image: galleryImage
}`;

  const maxChunkSizePythonCode = `from onenode import Image

# For detailed images - larger chunks to maintain context
detailed_diagram = Image("architecture_diagram.jpg")

detailed_config = {
    "max_chunk_size": 800  # Larger chunks for complex descriptions
}

detailed_diagram.enable_index(**detailed_config)

# For simple product images - smaller chunks for precise matching
product_thumb = Image("product_thumbnail.jpg")

simple_config = {
    "max_chunk_size": 200  # Smaller chunks for simple descriptions
}

product_thumb.enable_index(**simple_config)

# Use in documents
{
    "architecture_diagram": detailed_diagram,
    "product_thumbnail": product_thumb
}`;

  const maxChunkSizeTypescriptCode = `import { Image } from "@onenodehq/onenode";

// For detailed images - larger chunks to maintain context
const detailedDiagram = new Image(diagramFile);

const detailedConfig = {
    maxChunkSize: 800  // Larger chunks for complex descriptions
};

detailedDiagram.enableIndex(detailedConfig);

// For simple product images - smaller chunks for precise matching
const productThumb = new Image(thumbFile);

const simpleConfig = {
    maxChunkSize: 200  // Smaller chunks for simple descriptions
};

productThumb.enableIndex(simpleConfig);

// Use in documents
{
    architecture_diagram: detailedDiagram,
    product_thumbnail: productThumb
}`;

  const chunkOverlapPythonCode = `from onenode import Image

# High overlap for complex visual content with interconnected elements
technical_image = Image("technical_schematic.jpg")

high_overlap_config = {
    "max_chunk_size": 400,
    "chunk_overlap": 80  # High overlap to preserve context between visual elements
}

technical_image.enable_index(**high_overlap_config)

# Low overlap for images with distinct sections
infographic = Image("business_infographic.jpg")

low_overlap_config = {
    "max_chunk_size": 400,
    "chunk_overlap": 20  # Low overlap for distinct visual sections
}

infographic.enable_index(**low_overlap_config)

# Use in documents
{
    "technical_schematic": technical_image,
    "business_infographic": infographic
}`;

  const chunkOverlapTypescriptCode = `import { Image } from "@onenodehq/onenode";

// High overlap for complex visual content with interconnected elements
const technicalImage = new Image(schematicFile);

const highOverlapConfig = {
    maxChunkSize: 400,
    chunkOverlap: 80  // High overlap to preserve context between visual elements
};

technicalImage.enableIndex(highOverlapConfig);

// Low overlap for images with distinct sections
const infographic = new Image(infographicFile);

const lowOverlapConfig = {
    maxChunkSize: 400,
    chunkOverlap: 20  // Low overlap for distinct visual sections
};

infographic.enableIndex(lowOverlapConfig);

// Use in documents
{
    technical_schematic: technicalImage,
    business_infographic: infographic
}`;

  const separatorsPythonCode = `from onenode import Image

# Custom separators for structured visual content descriptions
screenshot_image = Image("dashboard_screenshot.jpg")

# Split by UI sections in the visual description
ui_config = {
    "separators": ["Section:", "Panel:", "\\n\\n"],  # Split by UI elements and paragraphs
    "max_chunk_size": 300
}

screenshot_image.enable_index(**ui_config)

# Different separators for step-by-step visual content
tutorial_image = Image("tutorial_steps.jpg")

step_config = {
    "separators": ["Step \\d+:", "Figure \\d+:", "\\n\\n"],  # Split by steps and figures
    "max_chunk_size": 250
}

tutorial_image.enable_index(**step_config)

# Use in documents
{
    "dashboard_screenshot": screenshot_image,
    "tutorial_visual": tutorial_image
}`;

  const separatorsTypescriptCode = `import { Image } from "@onenodehq/onenode";

// Custom separators for structured visual content descriptions
const screenshotImage = new Image(screenshotFile);

// Split by UI sections in the visual description
const uiConfig = {
    separators: ["Section:", "Panel:", "\\n\\n"],  // Split by UI elements and paragraphs
    maxChunkSize: 300
};

screenshotImage.enableIndex(uiConfig);

// Different separators for step-by-step visual content
const tutorialImage = new Image(tutorialFile);

const stepConfig = {
    separators: ["Step \\d+:", "Figure \\d+:", "\\n\\n"],  // Split by steps and figures
    maxChunkSize: 250
};

tutorialImage.enableIndex(stepConfig);

// Use in documents
{
    dashboard_screenshot: screenshotImage,
    tutorial_visual: tutorialImage
}`;

  const accessingKeyDataPythonCode = `# After processing, access key properties of your Image
documents = collection.find({"_id": "document_id"})
document = documents[0]  # find() returns a list
image_obj = document["field_name"]

# Access the image URL (where it's stored)
print(image_obj.data)
# Output: "https://media.onenode.com/your-project/your-db/your-collection/doc-id/field_name.jpg"

# Access the vision-generated text chunks (most important for understanding search)
print(image_obj.chunks)
# Output: [
#   "A high-quality wireless headphone with noise cancellation technology",
#   "displayed on white background with modern design"
# ]

# Access the detected MIME type
print(image_obj.mime_type)
# Output: "image/jpeg"

# Check if indexing is enabled
print(image_obj.index_enabled)
# Output: True`;

  const accessingKeyDataTypescriptCode = `// After processing, access key properties of your Image
const documents = await collection.find({ _id: "document_id" });
const document = documents[0];
const imageObj = document.field_name;

// Access the image URL (where it's stored)
console.log(imageObj.data);
// Output: "https://media.onenode.com/your-project/your-db/your-collection/doc-id/field_name.jpg"

// Access the vision-generated text chunks (most important for understanding search)
console.log(imageObj.chunks);
// Output: [
//   "A high-quality wireless headphone with noise cancellation technology",
//   "displayed on white background with modern design"
// ]

// Access the detected MIME type
console.log(imageObj.mimeType);
// Output: "image/jpeg"

// Check if indexing is enabled
console.log(imageObj.indexEnabled);
// Output: true`;

  const visualSemanticSearchPythonCode = `# Visual semantic search targets chunks from AI-generated image descriptions
# This allows you to find images based on their visual content

# Insert a document with an image
product_image = Image("product_headphones.jpg").enable_index()

collection.insert([{
    "name": "Premium Headphones",
    "category": "Electronics",
    "image": product_image
}])

# Use collection.query() for visual semantic search
results = collection.query("wireless headphones with noise cancellation")

# The search will match based on what the AI vision model saw in the image
for match in results:
    print(f"Found image described as: {match.chunk}")
    print(f"In product: {match.document['name']}")
    print(f"Match score: {match.score}")
    
    # Access the full Image object from the document
    image_obj = match.document["image"]
    print(f"Image URL: {image_obj.data}")
    print(f"All image descriptions: {image_obj.chunks}")`;

  const visualSemanticSearchTypescriptCode = `// Visual semantic search targets chunks from AI-generated image descriptions
// This allows you to find images based on their visual content

// Insert a document with an image
const productImage = new Image(imageFile).enableIndex();

await collection.insert([{
    name: "Premium Headphones",
    category: "Electronics",
    image: productImage
}]);

// Use collection.query() for visual semantic search
const results = await collection.query("wireless headphones with noise cancellation");

// The search will match based on what the AI vision model saw in the image
for (const match of results) {
    console.log(\`Found image described as: \${match.chunk}\`);
    console.log(\`In product: \${match.document.name}\`);
    console.log(\`Match score: \${match.score}\`);
    
    // Access the full Image object from the document
    const imageObj = match.document.image;
    console.log(\`Image URL: \${imageObj.data}\`);
    console.log(\`All image descriptions: \${imageObj.chunks}\`);
}`;

  const nestedFieldsPythonCode = `from onenode import Image

# Step 1: Create Image instance for product gallery
hero_image = Image("hero_product.jpg")

# Step 2: Enable indexing
hero_image.enable_index()

# Step 3: Use in nested document structure
{
  "product": {
    "name": "Smart Watch",
    "hero_image": hero_image,
    "gallery": [Image("gallery_1.jpg").enable_index(), Image("gallery_2.jpg").enable_index()]
  }
}`;

  const nestedFieldsTypescriptCode = `import { Image } from "@onenodehq/onenode";

// Step 1: Create Image instance for product gallery
const heroImage = new Image(heroFile);

// Step 2: Enable indexing
heroImage.enableIndex();

// Step 3: Use in nested document structure
{
  product: {
    name: "Smart Watch",
    hero_image: heroImage,
    gallery: [new Image(gallery1File).enableIndex(), new Image(gallery2File).enableIndex()]
  }
}`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Image</PageTitle>
        
        <LanguageToggle />
        
        <h2>Overview</h2>
        
        <p>
          OneNode uses AI-powered vision models to understand and index image content for semantic search. 
          The <code>Image</code> class provides intelligent image processing capabilities with automatic format detection,
          enabling powerful visual search across your image content.
        </p>

        <p>
          <strong>Note:</strong> The <code>Image</code> class is designed specifically for semantic search.
          For simple image storage without search capabilities, use regular file uploads instead.
        </p>
        
        <p><strong>Key Features</strong>:</p>
        
        <ul>
          <li><strong>Semantic Indexing</strong>: Enable intelligent image understanding with the fluent <code>.enableIndex()</code> method.</li>
          <li><strong>Automatic Format Detection</strong>: Supports multiple image formats with magic byte detection.</li>
          <li><strong>AI Vision Processing</strong>: Converts images to searchable text descriptions using advanced vision models.</li>
          <li><strong>Asynchronous Processing</strong>: Image analysis happens in the background without blocking your application.</li>
          <li><strong>Multiple Input Types</strong>: Accept files, URLs, base64, binary data, and more.</li>
          <li><strong>Server Defaults</strong>: Unspecified parameters automatically use optimized server-side defaults.</li>
        </ul>
        
        <h2>Basic Usage</h2>
        
        <p>The <code>Image</code> class should be used with the <code>.enableIndex()</code> method to enable semantic search capabilities:</p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? basicPythonCode : basicTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <p>
          This creates an <code>Image</code> object with semantic indexing enabled using server defaults for 
          the vision model, embedding model, and text processing strategy.
        </p>

        <InfoCard title="🔗 Automatic URL Generation">
          <p className="m-0">
            When you insert an Image into your collection, OneNode automatically uploads your image to secure cloud storage 
            and generates a publicly accessible URL. This URL is then assigned to the image object, making it easy to 
            display your images in applications while keeping them searchable.
          </p>
        </InfoCard>

        <h2>Input Methods</h2>
        
        <p>The <code>Image</code> class accepts multiple input formats with automatic type detection:</p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={`from onenode import Image

# From file path (type detected from extension)
image = Image("path/to/image.jpg")

# From binary data (type detected from magic bytes)
with open("image.jpg", "rb") as f:
    image = Image(f.read())

# From file-like object (type detected from magic bytes)
with open("image.jpg", "rb") as f:
    image = Image(f)

# From base64 string (type detected from magic bytes)
image = Image("base64_encoded_data")

# From data URL (type extracted from URL)
image = Image("data:image/jpeg;base64,...")

# From URL (type detected from extension)
image = Image("https://example.com/image.png")

# Enable indexing
image.enable_index()`}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={`import { Image } from "@onenodehq/onenode";

// From File object (type from file.type or filename)
const image = new Image(fileInput.files[0]);

// From Blob (type from blob.type or magic bytes)
const image = new Image(blob);

// From ArrayBuffer (type detected from magic bytes)
const image = new Image(arrayBuffer);

// From base64 string (type detected from magic bytes)
const image = new Image("base64_encoded_data");

// From data URL (type extracted from URL)
const image = new Image("data:image/jpeg;base64,...");

// From URL (type detected from extension)
const image = new Image("https://example.com/image.png");

// Enable indexing
image.enableIndex();`}
            language="typescript"
          />
        </LanguageContent>
        
        <hr className="my-6" />
        
        <h2>Configuration Reference</h2>
        
        <p>
          <strong>Note:</strong> All configuration parameters are completely optional and recommended only for advanced users. 
          OneNode automatically uses optimized defaults that work well for most use cases.
        </p>

        <div className="overflow-x-auto my-6">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Parameter</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Default</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>vision_model</code></td>
                <td className="border border-gray-300 px-4 py-2">string</td>
                <td className="border border-gray-300 px-4 py-2">Vision model for image analysis</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>emb_model</code></td>
                <td className="border border-gray-300 px-4 py-2">string</td>
                <td className="border border-gray-300 px-4 py-2">Embedding model for text vectors</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>max_chunk_size</code></td>
                <td className="border border-gray-300 px-4 py-2">number</td>
                <td className="border border-gray-300 px-4 py-2">Maximum chunk size for descriptions</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>chunk_overlap</code></td>
                <td className="border border-gray-300 px-4 py-2">number</td>
                <td className="border border-gray-300 px-4 py-2">Character overlap between chunks</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>separators</code></td>
                <td className="border border-gray-300 px-4 py-2">string[]</td>
                <td className="border border-gray-300 px-4 py-2">Text splitting patterns for descriptions</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>is_separator_regex</code></td>
                <td className="border border-gray-300 px-4 py-2">boolean</td>
                <td className="border border-gray-300 px-4 py-2">Enable regex in separators</td>
                <td className="border border-gray-300 px-4 py-2">false</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>keep_separator</code></td>
                <td className="border border-gray-300 px-4 py-2">boolean</td>
                <td className="border border-gray-300 px-4 py-2">Preserve separators in chunks</td>
                <td className="border border-gray-300 px-4 py-2">false</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Advanced Customization</h2>
        
        <p>
          The following examples show how to customize Image indexing behavior for specific use cases.
          These configurations are optional and should only be used when you need specific behavior.
        </p>
        
        <h3>Vision Model</h3>
        
        <p>Specify a specific vision model for quality, speed, or cost optimization:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={visionModelPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={visionModelTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Embedding Model</h3>
        
        <p>Configure both vision and embedding models for optimal results:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={embModelPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={embModelTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Chunk Size</h3>
        
        <p>Control chunk size for different image complexity levels:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={maxChunkSizePythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={maxChunkSizeTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Chunk Overlap</h3>
        
        <p>Configure overlap between chunks to preserve visual context:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={chunkOverlapPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={chunkOverlapTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Custom Separators</h3>
        
        <p>Define how image descriptions should be split for structured visual content:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={separatorsPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={separatorsTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <InfoCard title="💡 Pro Tip">
          <p className="m-0">
            Start with server defaults and only customize when you have specific requirements. 
            You can combine any parameters for your use case.
          </p>
        </InfoCard>
        
        <hr className="my-6" />
        
        <h2>After Processing</h2>
        
        <p>
          Once your document is saved and processed, you can access key properties of the <code>Image</code> object.
          Focus on these essential properties:
        </p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? accessingKeyDataPythonCode : accessingKeyDataTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <h3>Visual Semantic Search Targeting Image Descriptions</h3>
        
        <p>
          <strong>Important:</strong> Visual semantic search works by having AI vision models analyze your images
          and generate descriptive text chunks. Search then targets these text descriptions, allowing you to find
          images based on their visual content using natural language queries.
        </p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? visualSemanticSearchPythonCode : visualSemanticSearchTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <hr className="my-6" />
        
        <h2>Nested Fields</h2>
        
        <p><code>Image</code> objects can be used in nested structures:</p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? nestedFieldsPythonCode : nestedFieldsTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <hr className="my-6" />

        <h2>How It Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🔍</div>
            <h4 className="font-semibold text-sm">Auto-Detection</h4>
            <p className="text-xs text-gray-600">Detects image format automatically</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">👁️</div>
            <h4 className="font-semibold text-sm">Vision Analysis</h4>
            <p className="text-xs text-gray-600">AI describes image content</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">✂️</div>
            <h4 className="font-semibold text-sm">Text Chunking</h4>
            <p className="text-xs text-gray-600">Breaks descriptions into pieces</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🧮</div>
            <h4 className="font-semibold text-sm">Embedding</h4>
            <p className="text-xs text-gray-600">Converts text to vectors</p>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🔗</div>
            <h4 className="font-semibold text-sm">URL Generation</h4>
            <p className="text-xs text-gray-600">Creates accessible image URLs</p>
          </div>
        </div>

        <h2>Supported Formats</h2>
        
        <div className="flex flex-wrap gap-2 my-4">
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm"><code>image/jpeg</code></span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm"><code>image/jpg</code></span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm"><code>image/png</code></span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm"><code>image/gif</code></span>
          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm"><code>image/webp</code></span>
        </div>

        <h3>File Type Detection</h3>
        
        <p>The Image class automatically detects file types using multiple methods:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Detection Methods</h4>
            <ul className="text-sm space-y-1">
              <li><strong>Magic bytes:</strong> Binary file headers</li>
              <li><strong>File extensions:</strong> .jpg, .png, .gif, .webp</li>
              <li><strong>Data URLs:</strong> Extracted from data: URLs</li>
              <li><strong>File objects:</strong> From file.type or filename</li>
            </ul>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-3">Magic Byte Signatures</h4>
            <ul className="text-sm space-y-1 font-mono">
              <li><strong>JPEG:</strong> FF D8 FF</li>
              <li><strong>PNG:</strong> 89 50 4E 47 0D 0A 1A 0A</li>
              <li><strong>GIF:</strong> 47 49 46 38 [37|39] 61</li>
              <li><strong>WebP:</strong> 52 49 46 46 ... 57 45 42 50</li>
            </ul>
          </div>
        </div>
        
        <InfoCard title="Learn More About Image Search" icon="">
          <p className="mb-6">
            Once your images are indexed, explore powerful search capabilities and learn about related operations to get the most out of your indexed content.
          </p>
          
          <div className="grid md:grid-cols-3 gap-3">
            <a 
              href="/document/query" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Query Documents
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Visual semantic search with $search operator
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/document/find" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Find Documents
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Retrieve and filter your documents
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
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
                    Text processing, semantic embeddings, and search
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
          </div>
        </InfoCard>

        <h2>Best Practices</h2>
        
        <ul>
          <li><strong>Use Image for semantic search only</strong>: For simple image storage, use regular file uploads instead.</li>
          <li><strong>Always use .enableIndex()</strong>: Required to enable semantic search features.</li>
          <li><strong>Start with defaults</strong>: Server defaults work well for most use cases.</li>
          <li><strong>Customize sparingly</strong>: Only adjust parameters when you have specific requirements.</li>
          <li><strong>Let auto-detection work</strong>: Trust the automatic format detection instead of manually specifying types.</li>
        </ul>
        
        <ContactUs />
        <Feedback />
      </div>
    </DocLayout>
  );
} 