import DocLayout from '@/components/DocLayout';
import { DocumentTextIcon, PhotoIcon, CpuChipIcon, MagnifyingGlassIcon, Square3Stack3DIcon, BeakerIcon } from '@heroicons/react/24/outline';

export default function OverviewPage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-light tracking-tight text-red-500">OneNode Is a Database for Semantic Search</h1>
        </div>

        {/* Introduction */}
        <p className="text-lg text-gray-600 mb-12">
          OneNode is a database designed for AI applications that need to search by meaning, not just keywords. 
          Store text, images, and structured data together, then query them using natural language. 
          OneNode handles embeddings, vector storage, and semantic search automatically.
        </p>

        {/* Key Features */}
        <section className="mb-16">
          <h2>Key Features</h2>
          
          <div className="grid md:grid-cols-2 gap-6 not-prose">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Multimodal Data Types</h3>
              <p className="text-gray-600 text-sm">
                Built-in <code className="text-sm">Text</code> and <code className="text-sm">Image</code> classes that automatically generate embeddings for semantic search. 
                No external embedding services required.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Natural Language Queries</h3>
              <p className="text-gray-600 text-sm">
                Search your data using plain English. OneNode understands context and meaning, 
                returning results based on semantic similarity rather than exact matches.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">MongoDB-Compatible Syntax</h3>
              <p className="text-gray-600 text-sm">
                Familiar query syntax for filters, projections, and updates. 
                If you know MongoDB, you already know how to use OneNode.
              </p>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Automatic Processing</h3>
              <p className="text-gray-600 text-sm">
                Embeddings are generated asynchronously in the background. 
                Your application stays fast while OneNode handles the AI processing.
              </p>
            </div>
          </div>
        </section>

        {/* Core Operations */}
        <section className="mb-16">
          <h2>Core Operations</h2>
          
          <p>OneNode provides standard database operations with built-in semantic capabilities:</p>
          
          <div className="overflow-x-auto my-6">
            <table className="min-w-full border border-gray-300 not-prose">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">Operation</th>
                  <th className="border border-gray-300 px-4 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>insert</code></td>
                  <td className="border border-gray-300 px-4 py-2">Add documents with Text and Image fields. Embeddings are generated automatically.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>find</code></td>
                  <td className="border border-gray-300 px-4 py-2">Retrieve documents using MongoDB-style filters, projections, and sorting.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>query</code></td>
                  <td className="border border-gray-300 px-4 py-2">Semantic search using natural language. Returns results ranked by similarity.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>update</code></td>
                  <td className="border border-gray-300 px-4 py-2">Modify documents. Updated Text and Image fields are re-embedded automatically.</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2"><code>delete</code></td>
                  <td className="border border-gray-300 px-4 py-2">Remove documents from a collection.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Multimodal Types */}
        <section className="mb-16">
          <h2>Multimodal Data Types</h2>
          
          <p>
            OneNode provides special data types for content that needs semantic indexing:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium">Text</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                For text content that needs semantic search. Automatically chunked and embedded.
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Text("content").enable_index()</code>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-3">
                <PhotoIcon className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-medium">Image</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">
                For images that need visual search. Analyzed by vision AI and embedded.
              </p>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">Image("file.jpg").enable_index()</code>
            </div>
          </div>
          
          <p>
            Use regular string fields for text that doesn't need semantic search. 
            The multimodal types are specifically for content you want to search by meaning.
          </p>
        </section>

        {/* SDK Support */}
        <section className="mb-16">
          <h2>SDK Support</h2>
          
          <p>
            OneNode provides official SDKs for Python and TypeScript/JavaScript:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 my-6 not-prose">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Python</h3>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded block">pip install onenode</code>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">TypeScript / JavaScript</h3>
              <code className="text-sm bg-gray-100 px-3 py-2 rounded block">npm install @onenodehq/onenode</code>
            </div>
          </div>
        </section>

        {/* Get Started */}
        <section className="mb-16">
          <h2>Get Started</h2>
          
          <p>
            Explore our comprehensive documentation to learn how OneNode can power your next AI application.
            Start with the core concepts and dive deeper into specific features.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 my-6 not-prose">
            <a 
              href="/document" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <DocumentTextIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    Core Operations
                  </h4>
                  <p className="text-xs text-gray-600">
                    Insert, find, update, and delete documents
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/multimodal" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <PhotoIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    Multimodal Types
                  </h4>
                  <p className="text-xs text-gray-600">
                    Text and Image classes with semantic indexing
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/collection" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <Square3Stack3DIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    Collections
                  </h4>
                  <p className="text-xs text-gray-600">
                    Create and manage document collections
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/syntax" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    Query Syntax
                  </h4>
                  <p className="text-xs text-gray-600">
                    Filters, projections, and update operators
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/llm_models" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <CpuChipIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    LLM Models
                  </h4>
                  <p className="text-xs text-gray-600">
                    Available embedding and vision models
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/document/insert" 
              className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm !border-b-gray-200 hover:!border-b-gray-300"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                  <BeakerIcon className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-900 group-hover:text-black transition-colors">
                    Quick Start
                  </h4>
                  <p className="text-xs text-gray-600">
                    Jump right in with your first insert
                  </p>
                </div>
                <div className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors">
                  →
                </div>
              </div>
            </a>
          </div>
        </section>
      </div>
    </DocLayout>
  );
}
