import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import Link from 'next/link';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';
import { DocumentTextIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function LLMModelsPage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>LLM Models</PageTitle>
        
        <p>
          OneNode uses a two-step embedding architecture to enable true multimodal search across text and images.
        </p>

        <h2>The Two-Step Process</h2>

        <p>
          OneNode's unique approach uses two specialized models working in sequence:
        </p>

        <div className="space-y-6 my-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
            <div>
              <h3>Vision Model: Visual → Text</h3>
              <p>Converts images into detailed text descriptions that capture visual content, context, and relationships.</p>
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400 my-4">
                <h4 className="font-medium text-purple-800 mb-2">Example</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Input:</strong> [Image of a red Tesla in parking lot]</div>
                  <div><strong>Vision Model Output:</strong></div>
                  <div className="ml-4 text-purple-700 italic">
                    "A red Tesla Model 3 electric sedan parked in an outdoor parking lot with white painted lines. 
                    The vehicle features sleek aerodynamic design, chrome door handles, and LED headlights."
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
            <div>
              <h3>Embedding Model: Text → Vectors</h3>
              <p>Converts all text (original + vision-generated) into semantic vectors for mathematical comparison.</p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 my-4">
                <h4 className="font-medium text-blue-800 mb-2">Example</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Text Input 1:</strong> "I bought a red Tesla last month"</div>
                  <div><strong>Text Input 2:</strong> "A red Tesla Model 3 electric sedan parked..." (from vision)</div>
                  <div><strong>Result:</strong> Both get similar embedding vectors → semantically related</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2>Step-by-Step: Document Processing</h2>
        
        <p>Here's exactly what happens when you store multimodal data:</p>

        <div className="space-y-4 my-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
            <div className="text-sm">
              <strong>Submit Document:</strong> Upload document with Text and Image objects
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
            <div className="text-sm">
              <strong>Vision Processing:</strong> Each Image object → detailed text description via vision model
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
            <div className="text-sm">
              <strong>Text Consolidation:</strong> Original text + vision descriptions = unified text format
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
            <div className="text-sm">
              <strong>Embedding Generation:</strong> All text → semantic vectors via embedding model
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
            <div className="text-sm">
              <strong>Unified Search:</strong> Single query finds content across all modalities
            </div>
          </div>
        </div>

        <InfoCard title="Why Two Steps?" icon="🤔">
          <p className="mb-4">
            <strong>Simplicity:</strong> One embedding model handles all final processing
            <br /><strong>Interpretability:</strong> You can see the text description that caused a match
            <br /><strong>Extensibility:</strong> Add new modalities by converting them to text
            <br /><strong>Efficiency:</strong> Reuses mature text processing infrastructure
          </p>
        </InfoCard>
        
        <InfoCard title="Learn More About Specific Models" icon="">
          <p className="mb-6">
            Dive deeper into the specific models available in OneNode and learn how to optimize them for your use cases.
          </p>
          
          <div className="grid md:grid-cols-2 gap-3">
            <a 
              href="/llm_models/embedding" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <DocumentTextIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Embedding Models
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Text embedding models for semantic search capabilities
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
            
            <a 
              href="/llm_models/vision" 
              className="group block p-3 bg-white rounded-lg border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-neutral-100 rounded-md flex items-center justify-center">
                  <EyeIcon className="w-4 h-4 text-neutral-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-black transition-colors">
                    Vision Models
                  </h4>
                  <p className="text-xs text-neutral-600">
                    Image processing and visual understanding models
                  </p>
                </div>
                <div className="flex-shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                  →
                </div>
              </div>
            </a>
          </div>
        </InfoCard>
        
        <hr className="my-6" />
        
        <h2>How can we improve this documentation?</h2>
        
        <Feedback />
        
        <ContactUs variant="with-a" />
      </div>
    </DocLayout>
  );
} 