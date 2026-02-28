import CodeBlock from '@/components/CodeBlock';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import ContactUs from '@/components/ContactUs';
export default function UpdatePage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Update Syntax</PageTitle>
        
        <p>
          <strong>OneNode</strong> supports a robust and flexible update syntax fully compatible with MongoDB, 
          allowing you to modify, add, or remove fields and elements in your documents.
        </p>
        
        <hr className="my-6" />
        
        <h2>1: Field Update Operators</h2>
        
        <p>Modify or remove specific fields in a document.</p>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Operator</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Description</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Example</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$set</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates the value of a field.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$set": { "name": "Alice" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$unset</code></td>
              <td className="border border-gray-300 px-4 py-2">Removes a field from the document.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$unset": { "age": "" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$rename</code></td>
              <td className="border border-gray-300 px-4 py-2">Renames a field.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$rename": { "oldName": "newName" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$inc</code></td>
              <td className="border border-gray-300 px-4 py-2">Increments the value of a field.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$inc": { "score": 5 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$mul</code></td>
              <td className="border border-gray-300 px-4 py-2">Multiplies the value of a field.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$mul": { "price": 1.2 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$min</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates the field if the new value is smaller.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$min": { "age": 18 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$max</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates the field if the new value is greater.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$max": { "age": 30 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$setOnInsert</code></td>
              <td className="border border-gray-300 px-4 py-2">Sets a field only if the document is inserted (used with <code>upsert</code>).</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$setOnInsert": { "joined": true } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>2: Array Update Operators</h2>
        
        <p>Modify fields that are arrays, allowing for dynamic manipulation of their contents.</p>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Operator</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Description</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Example</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$push</code></td>
              <td className="border border-gray-300 px-4 py-2">Adds an item to an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$push": { "tags": "mongodb" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$pull</code></td>
              <td className="border border-gray-300 px-4 py-2">Removes items matching a condition from an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$pull": { "tags": "deprecated" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$addToSet</code></td>
              <td className="border border-gray-300 px-4 py-2">Adds an item to an array only if it does not exist.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$addToSet": { "tags": "uniqueTag" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$pop</code></td>
              <td className="border border-gray-300 px-4 py-2">Removes the first or last item from an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$pop": { "comments": -1 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$pullAll</code></td>
              <td className="border border-gray-300 px-4 py-2">Removes all matching values from an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$pullAll": { "tags": ["oldTag", "unusedTag"] } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$each</code></td>
              <td className="border border-gray-300 px-4 py-2">Adds multiple values to an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$push": { "tags": { "$each": ["tag1", "tag2"] } } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$slice</code></td>
              <td className="border border-gray-300 px-4 py-2">Limits the size of an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$push": { "tags": { "$each": ["newTag"], "$slice": 5 } } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$sort</code></td>
              <td className="border border-gray-300 px-4 py-2">Sorts array elements.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$push": { "scores": { "$each": [], "$sort": -1 } } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>3: Bitwise Update Operators</h2>
        
        <p>Perform bitwise operations on numeric fields.</p>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Operator</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Description</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Example</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$bit</code></td>
              <td className="border border-gray-300 px-4 py-2">Performs bitwise operations.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$bit": { "flags": { "and": 5 } } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>4: Positional Array Operators</h2>
        
        <p>Update specific elements in arrays using positional or filtered criteria.</p>
        
        <table className="w-full border-collapse my-4">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Operator</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Description</strong></th>
              <th className="border border-gray-300 px-4 py-2 bg-gray-100"><strong>Example</strong></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates the first matching array element.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$set": { "items.$": "updatedValue" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$[]</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates all elements in an array.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$set": { "scores.$[]": 100 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$[&lt;identifier&gt;]</code></td>
              <td className="border border-gray-300 px-4 py-2">Updates array elements that match a filter.</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$set": { "scores.$[passing]": 100 } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <p><strong>Array Filter Example</strong>: Use with <code>$[&lt;identifier&gt;]</code> to target specific elements:</p>
        
        <CodeBlock
          code={`{
  "arrayFilters": [{ "passing": { "$gte": 50 } }]
}`}
          language="json"
        />
        
        <hr className="my-6" />
        
        <h2>5: Document Replacement</h2>
        
        <p>Replace an entire document with a new one, retaining the <code>_id</code> field.</p>
        
        <CodeBlock
          code={`{
  "name": "Alice",
  "age": 30,
  "status": "active"
}`}
          language="json"
        />
        
        <hr className="my-6" />
        
        <h2>6: Combining Multiple Updates</h2>
        
        <p>Use multiple update operators in a single operation for complex modifications.</p>
        
        <CodeBlock
          code={`{
  "$set": { "status": "active" },
  "$inc": { "score": 10 },
  "$unset": { "oldField": "" }
}`}
          language="json"
        />
        
        <hr className="my-6" />
        
        <h2>Usage Notes</h2>
        
        <ul>
          <li><strong>Atomic Operations</strong>: Updates are applied atomically to a document.</li>
          <li><strong>Upsert</strong>: Use the <code>upsert</code> option to insert a document if no matching document is found.</li>
          <li><strong>Array Filters</strong>: Use <code>arrayFilters</code> to target specific elements in arrays when using <code>$[]</code> or <code>$[&lt;identifier&gt;]</code>.</li>
          <li><strong>Document Replacement</strong>: Fields not included in the replacement document will be removed (except <code>_id</code>).</li>
        </ul>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 