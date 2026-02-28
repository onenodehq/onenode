'use client';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import Link from 'next/link';
import CodeBlock from '@/components/CodeBlock';
import LanguageToggle from '@/components/LanguageToggle';
import LanguageContent from '@/components/LanguageContent';
import ContactUs from '@/components/ContactUs';
import InfoCard from '@/components/InfoCard';
export default function VisionModelsPage() {
  const pythonBasicExample = `from onenode import Image, Models

{
    "product_image": Image("product.jpg", mime_type="image/jpeg").enable_index(
        vision_model=Models.ImageToText.OpenAI.GPT_4O
    )
    # Or from base64 string:
    # "product_image": Image(
    #     "base64_encoded_image_data",
    #     mime_type="image/jpeg"
    # ).enable_index(vision_model=Models.ImageToText.OpenAI.GPT_4O)
}`;

  const typescriptBasicExample = `import { Image, Models } from "@onenodehq/onenode";

{
    product_image: new Image(fileObject).enableIndex({
        visionModel: Models.ImageToText.OpenAI.GPT_4O
    })
    // Or from base64 string:
    // product_image: new Image(
    //     "base64_encoded_image_data",
    //     "image/jpeg"
    // ).enableIndex({ visionModel: Models.ImageToText.OpenAI.GPT_4O })
}`;

  const pythonCombinedExample = `from onenode import Image, Models

{
    "product_image": Image("product.jpg", mime_type="image/jpeg").enable_index(
        vision_model=Models.ImageToText.OpenAI.GPT_4O,
        emb_model=Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
    )
    # Or from binary data:
    # with open("product.jpg", "rb") as f:
    #     "product_image": Image(f.read(), mime_type="image/jpeg").enable_index(
    #         vision_model=Models.ImageToText.OpenAI.GPT_4O,
    #         emb_model=Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
    #     )
}`;

  const typescriptCombinedExample = `import { Image, Models } from "@onenodehq/onenode";

{
    product_image: new Image(fileObject).enableIndex({
        visionModel: Models.ImageToText.OpenAI.GPT_4O,
        embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
    })
    // Or from Blob/ArrayBuffer:
    // product_image: new Image(blob, "image/jpeg").enableIndex({
    //     visionModel: Models.ImageToText.OpenAI.GPT_4O,
    //     embModel: Models.TextToEmbedding.OpenAI.TEXT_EMBEDDING_3_LARGE
    // })
}`;

  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Vision Models</PageTitle>
        
        <LanguageToggle />
        
        <p>
          Vision models enable OneNode to process and understand image content, creating semantic 
          representations that can be used for advanced image search and analysis. These models 
          extract features and context from images, similar to how embedding models work with text.
        </p>
        
        <p>
          When working with <Link href="/emb_json/emb_image" className="text-blue-600 hover:underline">Image</Link> in OneNode, 
          you can specify which vision model to use via the <code>vision_model</code> parameter.
        </p>
        
        <h2>Supported Vision Models</h2>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Model</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Provider</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Description</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2">gpt-4o</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">High-quality multimodal model capable of understanding images with excellent detail recognition and contextual understanding</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">gpt-4o-mini</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Smaller, more cost-effective version of GPT-4o with good performance for most image processing tasks</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">o4-mini</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Advanced mini vision model optimized for efficiency and performance</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">o3</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Next-generation vision model with enhanced reasoning capabilities</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">o1</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Advanced vision model optimized for high-fidelity understanding of complex visual content</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">o1-pro</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Professional-grade version of O1 with enhanced capabilities for production use</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">gpt-4.1</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Latest iteration of GPT-4 with improved vision understanding capabilities</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">gpt-4.1-mini</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Compact version of GPT-4.1 optimized for cost-effective vision processing</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2">gpt-4.1-nano</td>
              <td className="border border-gray-300 px-4 py-2">OpenAI</td>
              <td className="border border-gray-300 px-4 py-2">Ultra-lightweight version of GPT-4.1 for high-volume image processing</td>
            </tr>
          </tbody>
        </table>
        
        <h2>Using Vision Models in OneNode</h2>
        
        <p>
          To specify a vision model when working with <code>Image</code>, use the <code>vision_model</code> parameter:
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={pythonBasicExample}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={typescriptBasicExample}
            language="typescript"
          />
        </LanguageContent>
        
        <LanguageContent language="python">
          <p>
            In the example above, we're using the <code>GPT_4O</code> model from OpenAI to process and understand the image content.
          </p>
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <p>
            In the example above, we're using the <code>GPT_4O</code> model from OpenAI to process and understand the image content.
            Note that in TypeScript, we use camelCase for parameter names and pass parameters as an object.
          </p>
        </LanguageContent>
        
        <h2>Combined Usage with Embedding Models</h2>
        
        <p>
          You can use both vision models and embedding models together with <code>Image</code> to get the benefits of both:
        </p>
        
        <LanguageContent language="python">
          <CodeBlock
            code={pythonCombinedExample}
            language="python"
          />
        </LanguageContent>
        
        <LanguageContent language="typescript">
          <CodeBlock
            code={typescriptCombinedExample}
            language="typescript"
          />
        </LanguageContent>
        
        <p>
          This combination allows OneNode to extract both visual features (via the vision model) and encode textual descriptions 
          (via the embedding model) for comprehensive multimodal search capabilities.
        </p>

        <h2>Best Practices</h2>
        
        <ul>
          <li>Use <code>gpt-4o-mini</code> or <code>o4-mini</code> for cost-efficient image processing where the highest level of detail recognition is not required.</li>
          <li>Choose <code>gpt-4o</code> for high-quality image understanding in production applications.</li>
          <li>Consider <code>o3</code> or <code>o1</code> for applications that require the most advanced image understanding capabilities.</li>
          <li>Use <code>gpt-4.1-nano</code> for high-volume image processing where cost optimization is critical.</li>
          <li>When working with a large number of images, be mindful of processing costs and consider using a more economical vision model for initial processing.</li>
        </ul>
        
        <hr className="my-6" />
        
        <h2>How can we improve this documentation?</h2>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 