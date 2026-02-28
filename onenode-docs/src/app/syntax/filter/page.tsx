import CodeBlock from '@/components/CodeBlock';
import DocLayout from '@/components/DocLayout';
import PageTitle from '@/components/PageTitle';
import Feedback from '@/components/Feedback';
import ContactUs from '@/components/ContactUs';
export default function FilterPage() {
  return (
    <DocLayout>
      <div className="prose max-w-none">
        <PageTitle>Filter Syntax</PageTitle>
        
        <p>
          <strong>OneNode</strong> utilizes a filter syntax fully compatible with MongoDB, 
          enabling flexible and intuitive querying of data.
        </p>
        
        <hr className="my-6" />
        
        <h2>1: Exact Match</h2>
        
        <p>Filter documents where a field equals a specific value.</p>
        
        <CodeBlock
          code={`{ "field": "value" }`}
          language="json"
        />
        
        <hr className="my-6" />
        
        <h2>2: Comparison Operators</h2>
        
        <p>Use comparison operators to match documents based on relative values.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$gt</code></td>
              <td className="border border-gray-300 px-4 py-2">Greater than</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$gt": 18 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$lt</code></td>
              <td className="border border-gray-300 px-4 py-2">Less than</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$lt": 30 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$gte</code></td>
              <td className="border border-gray-300 px-4 py-2">Greater or equal</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$gte": 18 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$lte</code></td>
              <td className="border border-gray-300 px-4 py-2">Less or equal</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$lte": 30 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$eq</code></td>
              <td className="border border-gray-300 px-4 py-2">Equal to</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$eq": 25 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$ne</code></td>
              <td className="border border-gray-300 px-4 py-2">Not equal</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$ne": 25 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$in</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches any value in a list</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "status": { "$in": ["active", "pending"] } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$nin</code></td>
              <td className="border border-gray-300 px-4 py-2">Does not match values in a list</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "status": { "$nin": ["inactive", "archived"] } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>3: Logical Operators</h2>
        
        <p>Combine multiple conditions for more advanced filtering.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$and</code></td>
              <td className="border border-gray-300 px-4 py-2">All conditions are met</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$and": [ { "age": { "$gte": 18 } }, { "status": "active" } ] }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$or</code></td>
              <td className="border border-gray-300 px-4 py-2">Any condition is met</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$or": [ { "age": { "$lt": 18 } }, { "status": "inactive" } ] }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$not</code></td>
              <td className="border border-gray-300 px-4 py-2">Negates a condition</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "age": { "$not": { "$gte": 18 } } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$nor</code></td>
              <td className="border border-gray-300 px-4 py-2">None of the conditions are met</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$nor": [ { "age": { "$lt": 18 } }, { "status": "active" } ] }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>4: Array Filters</h2>
        
        <p>Query array fields with specialized operators.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$all</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches all specified values</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "tags": { "$all": ["python", "mongodb"] } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$size</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches arrays of a size</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "tags": { "$size": 3 } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$elemMatch</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches elements in an array</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "scores": { "$elemMatch": { "math": { "$gt": 90 } } } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$exists</code></td>
              <td className="border border-gray-300 px-4 py-2">Checks if a field exists</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "nickname": { "$exists": true } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>5: Regular Expressions</h2>
        
        <p>Match string fields using regular expressions.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$regex</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches a pattern in a string</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "name": { "$regex": "^A" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$options</code></td>
              <td className="border border-gray-300 px-4 py-2">Adds regex options (e.g., case insensitive)</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "name": { "$regex": "smith", "$options": "i" } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>6: Projection Filters</h2>
        
        <p>Control which fields are returned in the query results.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>mode: "include"</code></td>
              <td className="border border-gray-300 px-4 py-2">Include specific fields</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "include", "fields": ["name", "age"] }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>mode: "exclude"</code></td>
              <td className="border border-gray-300 px-4 py-2">Exclude specific fields</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "mode": "exclude", "fields": ["password"] }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>7: Text Search</h2>
        
        <p>Perform full-text searches on string fields.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$text</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches text using a search index</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$text": { "$search": "mongodb" } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$language</code></td>
              <td className="border border-gray-300 px-4 py-2">Specify a language for text search</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "$text": { "$search": "data", "$language": "en" } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <hr className="my-6" />
        
        <h2>8: Geospatial Filters</h2>
        
        <p>Query location-based data.</p>
        
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
              <td className="border border-gray-300 px-4 py-2"><code>$geoWithin</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches points within a geometry</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "location": { "$geoWithin": { "$centerSphere": [ [ 50, 50 ], 10 ] } } }`}</code></td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2"><code>$near</code></td>
              <td className="border border-gray-300 px-4 py-2">Matches points near a location</td>
              <td className="border border-gray-300 px-4 py-2"><code>{`{ "location": { "$near": { "$geometry": { "type": "Point", "coordinates": [ 50, 50 ] }, "$maxDistance": 5000 } } }`}</code></td>
            </tr>
          </tbody>
        </table>
        
        <h3>How can we improve this documentation?</h3>
        
        <Feedback />
        
        <ContactUs />
      </div>
    </DocLayout>
  );
} 