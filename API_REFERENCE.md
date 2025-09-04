# OneNode Community Edition API Reference

> **Complete API documentation for OneNode Community Edition - the open-source multi-modal semantic search framework**

![OneNode Theme](static/onenode-theme.png)

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [URL Structure](#url-structure)
- [Data Types](#data-types)
- [Projection Format](#projection-format)
- [Response Formats](#response-formats)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## Overview

OneNode Community Edition provides a REST API that orchestrates MongoDB, Pinecone, MinIO storage, Redis, and LLM services through a unified interface. The API enables multi-modal document storage, semantic search, and intelligent query processing.

### Key Features
- **Multi-modal storage**: Store text and images with automatic semantic indexing
- **Semantic search**: Vector-based similarity search across all content types
- **MongoDB compatibility**: Familiar query patterns with AI enhancements
- **Automatic processing**: Background embedding generation and image analysis
- **File handling**: Multipart form data support for binary content

## Base URL

```
http://localhost:8000
```

All API endpoints are relative to this base URL when running OneNode locally with Docker Compose.

## Authentication

OneNode Community Edition currently runs without authentication. All endpoints are publicly accessible on your local instance.

> **Note**: This is different from the hosted OneNode service which requires API keys.

## URL Structure

OneNode uses a hierarchical URL structure that mirrors MongoDB's organization:

```
/v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document
```

### Path Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `project_id` | Unique identifier for your project | `my_app` |
| `db_name` | Database name (similar to MongoDB database) | `products` |
| `collection_name` | Collection name (similar to MongoDB collection) | `items` |

### Example URLs

```bash
# Document operations
POST /v0/project/my_app/db/products/collection/items/document

# Semantic search
POST /v0/project/my_app/db/products/collection/items/document/query

# MongoDB-style find
POST /v0/project/my_app/db/products/collection/items/document/find

# Collection management
DELETE /v0/project/my_app/db/products/collection/items
```

## Data Types

OneNode introduces special data types for AI-enhanced content processing:

### xText - Enhanced Text Processing

The `xText` data type enables automatic text chunking, embedding generation, and semantic indexing.

#### Structure
```json
{
  "field_name": {
    "xText": {
      "text": "Your text content here",
      "index": true,
      "emb_model": "text-embedding-3-small",
      "max_chunk_size": 200,
      "chunk_overlap": 20,
      "separators": ["\n\n", "\n", " "],
      "is_separator_regex": false,
      "keep_separator": false
    }
  }
}
```

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `text` | string | **required** | The text content to process |
| `index` | boolean | `true` | Whether to generate embeddings and enable semantic search |
| `emb_model` | string | `"text-embedding-3-small"` | OpenAI embedding model to use |
| `max_chunk_size` | integer | `200` | Maximum size of text chunks (in tokens) |
| `chunk_overlap` | integer | `20` | Overlap between consecutive chunks |
| `separators` | array | `null` | Custom separators for text splitting |
| `is_separator_regex` | boolean | `false` | Whether separators are regex patterns |
| `keep_separator` | boolean | `false` | Whether to keep separators in chunks |

#### Supported Embedding Models
- `text-embedding-3-small` (default)
- `text-embedding-3-large`
- `text-embedding-ada-002`

### xImage - Enhanced Image Processing

The `xImage` data type enables automatic image analysis, text extraction, and semantic indexing.

#### Structure
```json
{
  "field_name": {
    "xImage": {
      "mime_type": "image/jpeg",
      "index": true,
      "emb_model": "text-embedding-3-small",
      "vision_model": "gpt-4o-mini",
      "max_chunk_size": 200,
      "chunk_overlap": 20
    }
  }
}
```

> **Note**: Binary image data is sent via multipart form fields, not in JSON.

#### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `mime_type` | string | **required** | MIME type of the image |
| `index` | boolean | `true` | Whether to analyze image and enable semantic search |
| `emb_model` | string | `"text-embedding-3-small"` | Embedding model for extracted text |
| `vision_model` | string | `"gpt-4o-mini"` | Vision model for image analysis |
| `max_chunk_size` | integer | `200` | Maximum size of text chunks from image analysis |
| `chunk_overlap` | integer | `20` | Overlap between consecutive chunks |

#### Supported MIME Types
- `image/jpeg`
- `image/jpg`
- `image/png`
- `image/gif`
- `image/webp`

#### Supported Vision Models
- `gpt-4o-mini` (default)
- `gpt-4o`
- `o1`
- `o1-pro`
- `o3`
- `o4-mini`
- `gpt-4.1`
- `gpt-4.1-mini`
- `gpt-4.1-nano`

#### Multipart Field Naming

For images, binary data is sent using specific field names in multipart form data:

```
doc_{index}.{field_path}.xImage.data
```

**Examples:**
- Single document, root level image: `doc_0.image.xImage.data`
- Multiple documents: `doc_0.thumbnail.xImage.data`, `doc_1.photo.xImage.data`
- Nested field: `doc_0.product.images.main.xImage.data`

## Projection Format

OneNode uses a structured projection format that differs from standard MongoDB projections:

### Structure
```json
{
  "mode": "include" | "exclude",
  "fields": ["field1", "field2", "field3"]
}
```

### Parameters
- `mode` (required): Either `"include"` or `"exclude"`
- `fields` (optional): Array of field names to include or exclude

### Examples

**Include specific fields:**
```json
{
  "mode": "include",
  "fields": ["title", "description", "created_at"]
}
```

**Exclude specific fields:**
```json
{
  "mode": "exclude", 
  "fields": ["internal_data", "temp_field"]
}
```

**Include all fields (equivalent to no projection):**
```json
{
  "mode": "include"
}
```

**Exclude all fields except _id:**
```json
{
  "mode": "exclude"
}
```

## Response Formats

### Semantic Query Response Structure

Semantic queries return **chunk-centric** results, where each item represents a matching text chunk:

```json
[
  {
    "chunk": "actual matching text content",
    "path": "field#path#to#xText",
    "chunk_n": 0,
    "score": 0.95,
    "embedding": [0.1, 0.2, ...], // only if include_embedding=true
    "document": {
      "_id": "document_id",
      // ... complete document based on projection
    }
  }
]
```

**Field Descriptions:**
- `chunk`: The actual text content that matched the query
- `path`: Location of the matching content within the document (uses `#` separator)
- `chunk_n`: Index of the chunk within the field's chunk array
- `score`: Similarity score (0.0 to 1.0, higher is better)
- `embedding`: Vector embedding (only included if `include_embedding=true`)
- `document`: The source document containing the matching chunk

### Find Response Structure

Find operations return **document-centric** results - complete documents matching the filter:

```json
[
  {
    "_id": "document_id",
    "title": "Document Title",
    // ... other document fields based on projection
  }
]
```

## API Endpoints

### Document Operations

#### Create Documents

Create one or more documents with automatic semantic indexing.

**Endpoint:** `POST /v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `documents` (required): JSON array of documents to create

**Request Example:**
```python
import requests
import json

API_BASE = "http://localhost:8000"

documents = [{
    "title": "Product Guide",
    "description": {
        "xText": {
            "text": "This is a comprehensive guide to our products",
            "index": True
        }
    },
    "thumbnail": {
        "xImage": {
            "mime_type": "image/jpeg",
            "index": True
        }
    },
    "category": "documentation",
    "created_at": "2024-01-15"
}]

form_data = {
    'documents': json.dumps(documents)
}

files = {
    'doc_0.thumbnail.xImage.data': open('thumbnail.jpg', 'rb')
}

response = requests.post(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides/document",
    data=form_data,
    files=files
)

print(response.json())
```

**Response:**
```json
{
  "inserted_ids": ["507f1f77bcf86cd799439011"]
}
```

#### Update Documents

Update existing documents with MongoDB-style update operators.

**Endpoint:** `PUT /v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `filter` (required): JSON filter to match documents
- `update` (required): JSON update operations using MongoDB operators
- `upsert` (optional): Boolean, create document if not found (default: false)

**Request Example:**
```python
filter_data = {"category": "documentation"}
update_data = {
    "$set": {
        "updated_at": "2024-01-16",
        "status": "published"
    },
    "$inc": {
        "view_count": 1
    }
}

form_data = {
    'filter': json.dumps(filter_data),
    'update': json.dumps(update_data),
    'upsert': 'false'
}

response = requests.put(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides/document",
    data=form_data
)
```

**Response:**
```json
{
  "matched_count": 2,
  "modified_count": 2,
  "upserted_id": null
}
```

#### Delete Documents

Delete documents matching a filter.

**Endpoint:** `DELETE /v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `filter` (required): JSON filter to match documents for deletion

**Request Example:**
```python
filter_data = {"status": "draft"}

form_data = {
    'filter': json.dumps(filter_data)
}

response = requests.delete(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides/document",
    data=form_data
)
```

**Response:**
```json
{
  "deleted_count": 3
}
```

### Search Operations

#### Semantic Query

Perform semantic search across text and image content using natural language queries.

**Endpoint:** `POST /v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document/query`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `query` (required): Natural language search query
- `filter` (optional): JSON filter to restrict search scope
- `top_k` (optional): Number of results to return (default: 10)
- `projection` (optional): JSON projection to limit returned fields (see Projection Format below)
- `include_embedding` (optional): Include embedding vectors in response (default: false)
- `emb_model` (optional): Embedding model to use (default: "text-embedding-3-small")

**Request Example:**
```python
search_data = {
    "query": "product documentation with images",
    "top_k": "5",
    "filter": json.dumps({"category": "documentation"}),
    "projection": json.dumps({
        "mode": "include",
        "fields": ["title", "description", "created_at"]
    })
}

response = requests.post(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides/document/query",
    data=search_data
)

results = response.json()
```

**Response:**
```json
[
  {
    "chunk": "This is a comprehensive guide to our products",
    "path": "description#xText",
    "chunk_n": 0,
    "score": 0.95,
    "document": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Product Guide",
      "description": {
        "xText": {
          "text": "This is a comprehensive guide to our products",
          "index": true
        }
      },
      "created_at": "2024-01-15"
    }
  }
]
```

> **Note**: Semantic query responses are **chunk-centric** - each result represents a matching text chunk with its source document, score, and location path. This differs from find operations which return complete documents.

#### MongoDB-Style Find

Perform traditional MongoDB find operations with optional AI enhancements.

**Endpoint:** `POST /v0/project/{project_id}/db/{db_name}/collection/{collection_name}/document/find`

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `filter` (optional): JSON filter criteria
- `projection` (optional): JSON projection to limit returned fields (see Projection Format below)
- `sort` (optional): JSON sort specification
- `skip` (optional): Number of documents to skip
- `limit` (optional): Maximum number of documents to return

**Request Example:**
```python
find_data = {
    "filter": json.dumps({"category": "documentation", "status": "published"}),
    "projection": json.dumps({
        "mode": "include",
        "fields": ["title", "created_at"]
    }),
    "sort": json.dumps([["created_at", -1]]),
    "limit": "10"
}

response = requests.post(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides/document/find",
    data=find_data
)

documents = response.json()
```

**Response:**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Product Guide",
    "created_at": "2024-01-15"
  },
  {
    "_id": "507f1f77bcf86cd799439012", 
    "title": "API Documentation",
    "created_at": "2024-01-14"
  }
]
```

### Collection Management

#### Delete Collection

Delete an entire collection and all associated data (MongoDB, Pinecone vectors, MinIO objects).

**Endpoint:** `DELETE /v0/project/{project_id}/db/{db_name}/collection/{collection_name}`

**Request Example:**
```python
response = requests.delete(
    f"{API_BASE}/v0/project/my_app/db/docs/collection/guides"
)

# Returns HTTP 204 No Content on success
```

## Error Handling

OneNode returns structured error responses for all failures:

### Error Response Format

```json
{
  "status": "error",
  "code": 400,
  "message": "Detailed error description"
}
```

### Common HTTP Status Codes

| Code | Description | Common Causes |
|------|-------------|---------------|
| `400` | Bad Request | Invalid JSON, missing required fields, invalid data types |
| `404` | Not Found | Invalid endpoint URL |
| `405` | Method Not Allowed | Wrong HTTP method for endpoint |
| `500` | Internal Server Error | Server-side processing errors |

### Example Error Responses

**Missing Required Field:**
```json
{
  "status": "error", 
  "code": 400,
  "message": "Missing 'documents' field. Request must include a 'documents' array containing at least one document."
}
```

**Invalid Data Type:**
```json
{
  "status": "error",
  "code": 400, 
  "message": "Invalid Text format: 'text' must be a string, got int"
}
```

**Unsupported Model:**
```json
{
  "status": "error",
  "code": 400,
  "message": "Invalid emb_model: 'invalid-model' is not supported. Supported models are: text-embedding-3-small, text-embedding-3-large, text-embedding-ada-002"
}
```

## Code Examples

### Python Examples

#### Basic Document Creation
```python
import requests
import json

API_BASE = "http://localhost:8000"

# Simple text document
documents = [{
    "title": "Getting Started Guide",
    "content": {
        "xText": {
            "text": "Welcome to OneNode! This guide will help you get started with semantic search.",
            "index": True
        }
    },
    "tags": ["guide", "tutorial"],
    "published": True
}]

form_data = {'documents': json.dumps(documents)}

response = requests.post(
    f"{API_BASE}/v0/project/docs/db/help/collection/guides/document",
    data=form_data
)

print("Created documents:", response.json())
```

#### Multi-Modal Document with Images
```python
import requests
import json

# Document with both text and image
documents = [{
    "product_name": "Wireless Headphones",
    "description": {
        "xText": {
            "text": "Premium noise-canceling wireless headphones with 30-hour battery life",
            "index": True,
            "max_chunk_size": 100
        }
    },
    "main_image": {
        "xImage": {
            "mime_type": "image/jpeg",
            "index": True,
            "vision_model": "gpt-4o-mini"
        }
    },
    "gallery": [
        {
            "xImage": {
                "mime_type": "image/jpeg", 
                "index": True
            }
        }
    ],
    "price": 299.99,
    "category": "electronics"
}]

form_data = {'documents': json.dumps(documents)}
files = {
    'doc_0.main_image.xImage.data': open('headphones-main.jpg', 'rb'),
    'doc_0.gallery.0.xImage.data': open('headphones-side.jpg', 'rb')
}

response = requests.post(
    f"{API_BASE}/v0/project/shop/db/catalog/collection/products/document",
    data=form_data,
    files=files
)

print("Created product:", response.json())
```

#### Advanced Semantic Search
```python
# Search with filters and projections
search_data = {
    "query": "wireless audio devices with long battery life",
    "filter": json.dumps({
        "category": "electronics",
        "price": {"$lt": 500}
    }),
    "projection": json.dumps({
        "mode": "include",
        "fields": ["product_name", "description", "price"]
    }),
    "top_k": "3",
    "emb_model": "text-embedding-3-large"
}

response = requests.post(
    f"{API_BASE}/v0/project/shop/db/catalog/collection/products/document/query",
    data=search_data
)

results = response.json()
for result in results:
    document = result['document']
    print(f"Product: {document['product_name']}")
    print(f"Score: {result['score']}")
    print(f"Price: ${document['price']}")
    print(f"Matching text: {result['chunk']}")
    print("---")
```

#### Batch Operations
```python
# Create multiple documents efficiently
batch_documents = [
    {
        "title": f"Article {i}",
        "content": {
            "xText": {
                "text": f"This is the content for article number {i}",
                "index": True
            }
        },
        "article_number": i
    }
    for i in range(1, 11)
]

form_data = {'documents': json.dumps(batch_documents)}

response = requests.post(
    f"{API_BASE}/v0/project/blog/db/content/collection/articles/document",
    data=form_data
)

print(f"Created {len(response.json()['inserted_ids'])} articles")
```

### JavaScript/Node.js Examples

#### Basic Document Creation
```javascript
const API_BASE = "http://localhost:8000";

async function createDocument() {
    const documents = [{
        title: "JavaScript Guide",
        content: {
            xText: {
                text: "Learn JavaScript with practical examples and best practices",
                index: true
            }
        },
        language: "javascript",
        level: "beginner"
    }];

    const formData = new FormData();
    formData.append('documents', JSON.stringify(documents));

    const response = await fetch(`${API_BASE}/v0/project/tutorials/db/programming/collection/guides/document`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    console.log('Created documents:', result);
}

createDocument();
```

#### Image Upload with Fetch
```javascript
async function createProductWithImage() {
    const documents = [{
        name: "Gaming Laptop",
        specs: {
            xText: {
                text: "High-performance gaming laptop with RTX 4080 GPU and 32GB RAM",
                index: true
            }
        },
        image: {
            xImage: {
                mime_type: "image/png",
                index: true
            }
        },
        price: 2499.99
    }];

    const formData = new FormData();
    formData.append('documents', JSON.stringify(documents));
    
    // Add image file
    const imageFile = document.getElementById('image-input').files[0];
    formData.append('doc_0.image.xImage.data', imageFile);

    const response = await fetch(`${API_BASE}/v0/project/store/db/inventory/collection/laptops/document`, {
        method: 'POST',
        body: formData
    });

    const result = await response.json();
    console.log('Product created:', result);
}
```

#### Semantic Search
```javascript
async function searchProducts(query) {
    const searchData = new FormData();
    searchData.append('query', query);
    searchData.append('top_k', '5');
    searchData.append('filter', JSON.stringify({ 
        category: 'electronics',
        in_stock: true 
    }));
    searchData.append('projection', JSON.stringify({
        mode: 'include',
        fields: ['name', 'price', 'category']
    }));

    const response = await fetch(`${API_BASE}/v0/project/store/db/inventory/collection/products/document/query`, {
        method: 'POST',
        body: searchData
    });

    const results = await response.json();
    
    results.forEach(result => {
        const product = result.document;
        console.log(`${product.name} (Score: ${result.score})`);
        console.log(`Matching text: ${result.chunk}`);
    });
    
    return results;
}

// Usage
searchProducts("laptop for gaming and video editing");
```

### cURL Examples

#### Create Document
```bash
curl -X POST "http://localhost:8000/v0/project/my_app/db/content/collection/posts/document" \
  -F 'documents=[{"title":"Hello World","body":{"xText":{"text":"This is my first post","index":true}}}]'
```

#### Semantic Search
```bash
curl -X POST "http://localhost:8000/v0/project/my_app/db/content/collection/posts/document/query" \
  -F 'query=hello world posts' \
  -F 'top_k=5'
```

#### Upload Image with Document
```bash
curl -X POST "http://localhost:8000/v0/project/gallery/db/photos/collection/uploads/document" \
  -F 'documents=[{"title":"Sunset Photo","image":{"xImage":{"mime_type":"image/jpeg","index":true}}}]' \
  -F 'doc_0.image.xImage.data=@sunset.jpg'
```

## Best Practices

### Document Design

1. **Use Semantic Fields**: Leverage `xText` and `xImage` for content you want to search semantically
2. **Structured Metadata**: Keep searchable metadata as regular fields alongside semantic content
3. **Consistent Schema**: Maintain consistent document structure within collections

```python
# Good: Mixed approach
document = {
    "title": "Product Manual",           # Regular field for exact matching
    "content": {                         # Semantic field for search
        "xText": {
            "text": "Detailed product instructions...",
            "index": True
        }
    },
    "category": "documentation",         # Regular field for filtering
    "created_at": "2024-01-15",         # Regular field for sorting
    "version": "1.2"                    # Regular field for exact matching
}
```

### Performance Optimization

1. **Batch Operations**: Create multiple documents in single requests
2. **Selective Indexing**: Only set `index: true` for content you'll search
3. **Appropriate Chunk Sizes**: Tune `max_chunk_size` based on your content
4. **Use Projections**: Limit returned fields in queries to reduce response size

```python
# Efficient batch creation
documents = [create_document(i) for i in range(100)]
form_data = {'documents': json.dumps(documents)}
response = requests.post(endpoint, data=form_data)

# Efficient search with projection
search_data = {
    "query": "search terms",
    "projection": json.dumps({
        "mode": "include",
        "fields": ["title", "summary"]  # Only return needed fields
    }),
    "top_k": "10"
}
```

### Error Handling

1. **Check Status Codes**: Always verify HTTP response codes
2. **Parse Error Messages**: OneNode provides detailed error descriptions
3. **Validate Input**: Check data types and required fields before sending

```python
def safe_create_documents(documents):
    try:
        form_data = {'documents': json.dumps(documents)}
        response = requests.post(endpoint, data=form_data)
        
        if response.status_code == 200:
            return response.json()
        else:
            error_data = response.json()
            print(f"Error {error_data['code']}: {error_data['message']}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Network error: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"JSON parsing error: {e}")
        return None
```

### Security Considerations

1. **Input Validation**: Validate all user inputs before sending to OneNode
2. **File Size Limits**: Implement reasonable limits for image uploads
3. **Content Filtering**: Sanitize user-generated content before indexing

### Monitoring and Debugging

1. **Log Requests**: Keep logs of API requests for debugging
2. **Monitor Performance**: Track response times and success rates
3. **Check Background Tasks**: Verify that embedding and image processing complete successfully

---

## Support and Contributing

- **Issues**: [GitHub Issues](https://github.com/onenodehq/onenode/issues)
- **Documentation**: [OneNode Docs](https://docs.onenode.ai)
- **Community**: [Discord Server](https://discord.gg/onenode)

---

*This API reference is for OneNode Community Edition. For the hosted version with additional features, see [console.onenode.ai](https://console.onenode.ai).*
