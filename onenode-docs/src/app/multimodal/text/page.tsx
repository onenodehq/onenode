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

  const basicPythonCode = `from onenode import Text

# Step 1: Create Text instance
bio_text = Text("Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.")

# Step 2: Enable indexing
bio_text.enable_index()

# Step 3: Use in document
{
  "field_name": bio_text
}`;

  const basicTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Step 1: Create Text instance
const bioText = new Text("Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.");

// Step 2: Enable indexing
bioText.enableIndex();

// Step 3: Use in document
{
  field_name: bioText
}`;

  const indexingPythonCode = `from onenode import Text

# Enable indexing with default settings
{
  "field_name": Text("Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.").enable_index()
}`;

  const indexingTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Enable indexing with default settings
{
  field_name: new Text("Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing.").enableIndex()
}`;

  // Individual parameter examples
  const embModelPythonCode = `from onenode import Text, Models

# Using a specific embedding model for higher quality embeddings
content_text = Text("Research paper abstract on machine learning algorithms and their applications in healthcare.")

# Configure with a high-quality embedding model
emb_config = {
    "emb_model": Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
}

content_text.enable_index(**emb_config)

# Use in document
{
    "abstract": content_text
}`;

  const embModelTypescriptCode = `import { Text, Models } from "@onenodehq/onenode";

// Using a specific embedding model for higher quality embeddings
const contentText = new Text("Research paper abstract on machine learning algorithms and their applications in healthcare.");

// Configure with a high-quality embedding model
const embConfig = {
    embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
};

contentText.enableIndex(embConfig);

// Use in document
{
    abstract: contentText
}`;

  const maxChunkSizePythonCode = `from onenode import Text

# For short content - smaller chunks for precise matching
short_content = Text("Product description: High-quality wireless headphones with noise cancellation.")

short_config = {
    "max_chunk_size": 100  # Smaller chunks for short content
}

short_content.enable_index(**short_config)

# For long articles - larger chunks to maintain context
long_article = Text("""
Long article content here with multiple paragraphs discussing 
various aspects of artificial intelligence, machine learning, 
and their applications across different industries...
""")

long_config = {
    "max_chunk_size": 800  # Larger chunks for long content
}

long_article.enable_index(**long_config)

# Use in documents
{
    "product_description": short_content,
    "article_content": long_article
}`;

  const maxChunkSizeTypescriptCode = `import { Text } from "@onenodehq/onenode";

// For short content - smaller chunks for precise matching
const shortContent = new Text("Product description: High-quality wireless headphones with noise cancellation.");

const shortConfig = {
    maxChunkSize: 100  // Smaller chunks for short content
};

shortContent.enableIndex(shortConfig);

// For long articles - larger chunks to maintain context
const longArticle = new Text(\`
Long article content here with multiple paragraphs discussing 
various aspects of artificial intelligence, machine learning, 
and their applications across different industries...
\`);

const longConfig = {
    maxChunkSize: 800  // Larger chunks for long content
};

longArticle.enableIndex(longConfig);

// Use in documents
{
    product_description: shortContent,
    article_content: longArticle
}`;

  const chunkOverlapPythonCode = `from onenode import Text

# High overlap for better context preservation
technical_doc = Text("Technical documentation with interconnected concepts and cross-references between sections.")

high_overlap_config = {
    "max_chunk_size": 300,
    "chunk_overlap": 50  # High overlap to preserve context
}

technical_doc.enable_index(**high_overlap_config)

# Low overlap for distinct content sections
news_article = Text("News article with clear paragraph separations and distinct topics in each section.")

low_overlap_config = {
    "max_chunk_size": 300,
    "chunk_overlap": 10  # Low overlap for distinct sections
}

news_article.enable_index(**low_overlap_config)

# Use in documents
{
    "technical_documentation": technical_doc,
    "news_content": news_article
}`;

  const chunkOverlapTypescriptCode = `import { Text } from "@onenodehq/onenode";

// High overlap for better context preservation
const technicalDoc = new Text("Technical documentation with interconnected concepts and cross-references between sections.");

const highOverlapConfig = {
    maxChunkSize: 300,
    chunkOverlap: 50  // High overlap to preserve context
};

technicalDoc.enableIndex(highOverlapConfig);

// Low overlap for distinct content sections
const newsArticle = new Text("News article with clear paragraph separations and distinct topics in each section.");

const lowOverlapConfig = {
    maxChunkSize: 300,
    chunkOverlap: 10  // Low overlap for distinct sections
};

newsArticle.enableIndex(lowOverlapConfig);

// Use in documents
{
    technical_documentation: technicalDoc,
    news_content: newsArticle
}`;

  const separatorsPythonCode = `from onenode import Text

# Custom separators for structured content
structured_content = Text("""
Section 1: Introduction
This is the introduction section.

Section 2: Methods
This section describes the methods used.

Section 3: Results
Here are the results of our study.
""")

section_config = {
    "separators": ["Section \\d+:", "\\n\\n"],  # Split by sections and paragraphs
    "max_chunk_size": 200
}

structured_content.enable_index(**section_config)

# Different separators for code documentation
code_doc = Text("""
### Function: processData()
This function processes input data.

### Function: validateInput()
This function validates user input.

### Function: generateReport()
This function generates the final report.
""")

code_config = {
    "separators": ["### Function:", "\\n\\n"],  # Split by function headers
    "max_chunk_size": 150
}

code_doc.enable_index(**code_config)

# Use in documents
{
    "research_paper": structured_content,
    "api_documentation": code_doc
}`;

  const separatorsTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Custom separators for structured content
const structuredContent = new Text(\`
Section 1: Introduction
This is the introduction section.

Section 2: Methods
This section describes the methods used.

Section 3: Results
Here are the results of our study.
\`);

const sectionConfig = {
    separators: ["Section \\d+:", "\\n\\n"],  // Split by sections and paragraphs
    maxChunkSize: 200
};

structuredContent.enableIndex(sectionConfig);

// Different separators for code documentation
const codeDoc = new Text(\`
### Function: processData()
This function processes input data.

### Function: validateInput()
This function validates user input.

### Function: generateReport()
This function generates the final report.
\`);

const codeConfig = {
    separators: ["### Function:", "\\n\\n"],  // Split by function headers
    maxChunkSize: 150
};

codeDoc.enableIndex(codeConfig);

// Use in documents
{
    research_paper: structuredContent,
    api_documentation: codeDoc
}`;

  const regexSeparatorPythonCode = `from onenode import Text

# Using regex patterns for complex splitting
email_content = Text("""
From: alice@example.com
Subject: Project Update
Date: 2024-01-15

Hello team,
Here's the weekly project update...

From: bob@example.com  
Subject: Meeting Notes
Date: 2024-01-16

Meeting summary from today...
""")

# Use regex to split by email headers
regex_config = {
    "separators": ["^From: .+@.+\\..+$"],  # Regex pattern for email headers
    "is_separator_regex": True,  # Enable regex mode
    "max_chunk_size": 300
}

email_content.enable_index(**regex_config)

# Use in document
{
    "email_thread": email_content
}`;

  const regexSeparatorTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Using regex patterns for complex splitting
const emailContent = new Text(\`
From: alice@example.com
Subject: Project Update
Date: 2024-01-15

Hello team,
Here's the weekly project update...

From: bob@example.com  
Subject: Meeting Notes
Date: 2024-01-16

Meeting summary from today...
\`);

// Use regex to split by email headers
const regexConfig = {
    separators: ["^From: .+@.+\\..+$"],  // Regex pattern for email headers
    isSeparatorRegex: true,  // Enable regex mode
    maxChunkSize: 300
};

emailContent.enableIndex(regexConfig);

// Use in document
{
    email_thread: emailContent
}`;

  const keepSeparatorPythonCode = `from onenode import Text

# Keep separators for context preservation
dialogue_content = Text("""
Speaker A: What are your thoughts on AI development?
Speaker B: I think it's progressing rapidly.
Speaker A: Do you see any concerns?
Speaker B: Yes, particularly around ethics and safety.
""")

# Keep speaker labels for context
dialogue_config = {
    "separators": ["Speaker [AB]:"],
    "keep_separator": True,  # Keep the speaker labels in chunks
    "max_chunk_size": 100
}

dialogue_content.enable_index(**dialogue_config)

# Remove separators for cleaner chunks
content_with_headers = Text("""
=== Chapter 1 ===
This is the content of chapter 1.

=== Chapter 2 ===  
This is the content of chapter 2.
""")

clean_config = {
    "separators": ["=== Chapter \\d+ ==="],
    "keep_separator": False,  # Remove chapter headers from chunks
    "max_chunk_size": 150
}

content_with_headers.enable_index(**clean_config)

# Use in documents
{
    "interview_transcript": dialogue_content,
    "book_content": content_with_headers
}`;

  const keepSeparatorTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Keep separators for context preservation
const dialogueContent = new Text(\`
Speaker A: What are your thoughts on AI development?
Speaker B: I think it's progressing rapidly.
Speaker A: Do you see any concerns?
Speaker B: Yes, particularly around ethics and safety.
\`);

// Keep speaker labels for context
const dialogueConfig = {
    separators: ["Speaker [AB]:"],
    keepSeparator: true,  // Keep the speaker labels in chunks
    maxChunkSize: 100
};

dialogueContent.enableIndex(dialogueConfig);

// Remove separators for cleaner chunks
const contentWithHeaders = new Text(\`
=== Chapter 1 ===
This is the content of chapter 1.

=== Chapter 2 ===  
This is the content of chapter 2.
\`);

const cleanConfig = {
    separators: ["=== Chapter \\d+ ==="],
    keepSeparator: false,  // Remove chapter headers from chunks
    maxChunkSize: 150
};

contentWithHeaders.enableIndex(cleanConfig);

// Use in documents
{
    interview_transcript: dialogueContent,
    book_content: contentWithHeaders
}`;

  const accessingKeyDataPythonCode = `# After processing, access key properties of your Text
documents = collection.find({"_id": "document_id"})
document = documents[0]  # find() returns a list
text_obj = document["field_name"]

# Access the original text
print(text_obj.text)
# Output: "Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing."

# Access the chunks (most important for understanding how search works)
print(text_obj.chunks)
# Output: [
#   "Alice is a data scientist with expertise in AI and machine learning.",
#   "She has led several projects in natural language processing."
# ]

# Check if indexing is enabled
print(text_obj.index_enabled)
# Output: True`;

  const accessingKeyDataTypescriptCode = `// After processing, access key properties of your Text
const documents = await collection.find({ _id: "document_id" });
const document = documents[0];
const textObj = document.field_name;

// Access the original text
console.log(textObj.text);
// Output: "Alice is a data scientist with expertise in AI and machine learning. She has led several projects in natural language processing."

// Access the chunks (most important for understanding how search works)
console.log(textObj.chunks);
// Output: [
//   "Alice is a data scientist with expertise in AI and machine learning.",
//   "She has led several projects in natural language processing."
// ]

// Check if indexing is enabled
console.log(textObj.index);
// Output: true`;

  const semanticSearchPythonCode = `# Semantic search targets individual chunks, not the whole text
# This allows precise matching even in long documents

# Insert a document with long text content
article_text = Text("""
Machine learning has revolutionized data science in recent years. 
Companies are now able to extract valuable insights from large datasets. 
Natural language processing enables computers to understand human language. 
Deep learning models can process complex patterns in data.
""").enable_index()

collection.insert([{
    "title": "AI Article",
    "content": article_text
}])

# Use collection.query() for semantic search - it targets individual chunks
results = collection.query("language processing")

# The search will match the specific chunk containing "language processing"
# rather than returning the entire long text
for match in results:
    print(f"Matched chunk: {match.chunk}")
    print(f"From document: {match.document['title']}")
    print(f"Score: {match.score}")
    
    # Access the full Text object from the document if needed
    text_obj = match.document["content"]
    print(f"Total chunks in text: {len(text_obj.chunks)}")`;

  const semanticSearchTypescriptCode = `// Semantic search targets individual chunks, not the whole text
// This allows precise matching even in long documents

// Insert a document with long text content
const articleText = new Text(\`
Machine learning has revolutionized data science in recent years. 
Companies are now able to extract valuable insights from large datasets. 
Natural language processing enables computers to understand human language. 
Deep learning models can process complex patterns in data.
\`).enableIndex();

await collection.insert([{
    title: "AI Article",
    content: articleText
}]);

// Use collection.query() for semantic search - it targets individual chunks
const results = await collection.query("language processing");

// The search will match the specific chunk containing "language processing"
// rather than returning the entire long text
for (const match of results) {
    console.log(\`Matched chunk: \${match.chunk}\`);
    console.log(\`From document: \${match.document.title}\`);
    console.log(\`Score: \${match.score}\`);
    
    // Access the full Text object from the document if needed
    const textObj = match.document.content;
    console.log(\`Total chunks in text: \${textObj.chunks.length}\`);
}`;

  const nestedFieldsPythonCode = `from onenode import Text

# Step 1: Create Text instance for bio
bio_text = Text("Bob has over a decade of experience in AI, focusing on neural networks and deep learning.")

# Step 2: Enable indexing
bio_text.enable_index()

# Step 3: Use in nested document structure
{
  "profile": {
    "name": "Bob",
    "bio": bio_text
  }
}`;

  const nestedFieldsTypescriptCode = `import { Text } from "@onenodehq/onenode";

// Step 1: Create Text instance for bio
const bioText = new Text("Bob has over a decade of experience in AI, focusing on neural networks and deep learning.");

// Step 2: Enable indexing
bioText.enableIndex();

// Step 3: Use in nested document structure
{
  profile: {
    name: "Bob",
    bio: bioText
  }
}`;



  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Text</PageTitle>
        
        <LanguageToggle />
        
        <h2>Overview</h2>
        
        <p>
          OneNode uses vector embeddings to understand the meaning of text beyond simple keyword matching. 
          The <code>Text</code> class provides semantic indexing capabilities with a fluent builder pattern,
          enabling powerful contextual and conceptual search across your text content.
        </p>

        <p>
          <strong>Note:</strong> The <code>Text</code> class is designed specifically for semantic search.
          For simple text storage without search capabilities, use regular string fields instead.
        </p>
        
        <p><strong>Key Features</strong>:</p>
        
        <ul>
          <li><strong>Semantic Indexing</strong>: Enable intelligent text understanding with the fluent <code>.enableIndex()</code> method.</li>
          <li><strong>Automatic Chunking</strong>: Large text is intelligently split into smaller pieces for efficient embeddings.</li>
          <li><strong>Asynchronous Processing</strong>: Embeddings are generated in the background without blocking your application.</li>
          <li><strong>Contextual Search</strong>: Find content based on meaning and context, not just keywords.</li>
          <li><strong>Server Defaults</strong>: Unspecified parameters automatically use optimized server-side defaults.</li>
        </ul>
        
        <h2>Basic Usage</h2>
        
        <p>The <code>Text</code> class should be used with the <code>.enableIndex()</code> method to enable semantic search capabilities:</p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? basicPythonCode : basicTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <p>
          This creates a <code>Text</code> object with semantic indexing enabled using server defaults for 
          the embedding model and chunking strategy.
        </p>
        
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
                <td className="border border-gray-300 px-4 py-2"><code>emb_model</code></td>
                <td className="border border-gray-300 px-4 py-2">string</td>
                <td className="border border-gray-300 px-4 py-2">Embedding model to use</td>
                <td className="border border-gray-300 px-4 py-2">Server optimized</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2"><code>max_chunk_size</code></td>
                <td className="border border-gray-300 px-4 py-2">number</td>
                <td className="border border-gray-300 px-4 py-2">Maximum chunk size in characters</td>
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
                <td className="border border-gray-300 px-4 py-2">Text splitting patterns</td>
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
          The following examples show how to customize Text indexing behavior for specific use cases.
          These configurations are optional and should only be used when you need specific behavior.
        </p>
        
        <h3>Embedding Model</h3>
        
        <p>Specify a specific embedding model for quality, speed, or cost optimization:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={embModelPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={embModelTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Chunk Size</h3>
        
        <p>Control chunk size for different content types:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={maxChunkSizePythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={maxChunkSizeTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Chunk Overlap</h3>
        
        <p>Configure overlap between chunks to preserve context:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={chunkOverlapPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={chunkOverlapTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Custom Separators</h3>
        
        <p>Define how text should be split for structured content:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={separatorsPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={separatorsTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Regex Separators</h3>
        
        <p>Use regex patterns for complex text splitting:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={regexSeparatorPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={regexSeparatorTypescriptCode} language="typescript" />
        </LanguageContent>
        
        <h3>Preserve Separators</h3>
        
        <p>Control whether to keep or remove separator text in chunks:</p>
        
        <LanguageContent language="python">
          <CodeBlock code={keepSeparatorPythonCode} language="python" />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock code={keepSeparatorTypescriptCode} language="typescript" />
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
          Once your document is saved and processed, you can access key properties of the <code>Text</code> object. 
          Focus on these essential properties:
        </p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? accessingKeyDataPythonCode : accessingKeyDataTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <h3>Semantic Search Targeting Chunks</h3>
        
        <p>
          <strong>Important:</strong> Semantic search targets individual chunks, not the entire Text object. 
          This means you get precise matches even from long documents, making search more accurate and relevant.
        </p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? semanticSearchPythonCode : semanticSearchTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <hr className="my-6" />
        
        <h2>Nested Fields</h2>
        
        <p><code>Text</code> objects can be used in nested structures:</p>
        
        <CodeBlock
          code={contextLanguage === 'python' ? nestedFieldsPythonCode : nestedFieldsTypescriptCode}
          language={contextLanguage === 'python' ? 'python' : 'typescript'}
        />
        
        <hr className="my-6" />
        
        <InfoCard title="Learn More About Text Search" icon="">
          <p className="mb-6">
            Once your text is indexed, explore powerful search capabilities and learn about related operations to get the most out of your indexed content.
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
                    Semantic search with $search operator
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
          </div>
        </InfoCard>

        <h2>Best Practices</h2>
        
        <ul>
          <li><strong>Use Text for semantic search only</strong>: For simple text storage, use regular string fields instead.</li>
          <li><strong>Always use .enableIndex()</strong>: Required to enable semantic search features.</li>
          <li><strong>Start with defaults</strong>: Server defaults work well for most use cases.</li>
          <li><strong>Customize sparingly</strong>: Only adjust parameters when you have specific requirements.</li>
        </ul>
        
        <ContactUs />
        <Feedback />
      </div>
    </DocLayout>
  );
} 