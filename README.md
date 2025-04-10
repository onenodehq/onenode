![CapyDB](static/capydb-badge.png)

[![Website](https://img.shields.io/badge/Website-capydb.com-blue?style=flat-square)](https://www.capydb.com)
[![Documentation](https://img.shields.io/badge/Docs-docs.capydb.com-informational?style=flat-square)](https://docs.capydb.com)
[![PyPI](https://img.shields.io/pypi/v/capydb?style=flat-square)](https://pypi.org/project/capydb)
[![npm](https://img.shields.io/npm/v/capydb?style=flat-square)](https://www.npmjs.com/package/capydb)
[![License](https://img.shields.io/github/license/capydb/capydb?style=flat-square)](LICENSE)
[![Twitter](https://img.shields.io/twitter/follow/itstomohiro?style=flat-square&logo=x)](https://x.com/itstomohiro)

# CapyDB

CapyDB is a **high-level database** built specifically for Large Language Model (LLM) applications. It provides a unified platform for working with structured data, unstructured content, and AI-ready embeddings, making it easy to create powerful semantic applications without complex infrastructure.

## Features

- **All-in-One Data Solution** — Store structured data, text, images, files, and vectors in one place
- **No External Embedding Steps** — Just insert text with `EmbText`, CapyDB does the rest!
- **Built-in Semantic Search** — Perform similarity-based queries without external services
- **Asynchronous by Default** — Get immediate responses while embedding, indexing, and processing happen in the background

## EmbJSON

CapyDB takes a unique approach to abstract away database complexity through EmbJSON. EmbJSON is a special extended JSON format that allows client-side developers to control database pipelines via JSON parameters. With traditional semantic search implementations, developers had to maintain backend pipelines. However, with EmbJSON, you can control your semantic search indexing and retrieval specifications through simple parameters from the client side.

## Python SDK Example

### Installation

```bash
pip install capydb
```

### Quick Start Example

```python
import os
from capydb import CapyDB, EmbText

# Load environment variables (for local development)
# In production, set these in your environment
os.environ["CAPY_API_KEY"] = "your-api-key"
os.environ["CAPY_PROJECT_ID"] = "your-project-id"

# Initialize the client
client = CapyDB()
db = client.db("your_db_name")
collection = db.collection("your_collection_name")

# Define a document with an EmbText field - no external embedding needed!
document = {
    "name": "Alice",
    "age": 7,
    "background": EmbText(
        "Through the Looking-Glass follows Alice as she steps into a fantastical world..."
    )
}

# Insert the document - returns immediately while processing happens asynchronously
result = collection.insert_one(document)
print(f"Inserted document with ID: {result.inserted_id}")

# Semantic search query
user_query = "What is Alice's story about?"
response = collection.query(user_query)

# Access search results
if response.matches:
    match = response.matches[0]
    print(f"Matched chunk: {match.chunk}")
    print(f"Field path: {match.path}")
    print(f"Similarity score: {match.score}")
    print(f"Document ID: {match.document._id}")
```

### Using Images with EmbImage

```python
from capydb import EmbImage, EmbModels, VisionModels
import base64

# Read an image file and convert to base64
with open("path/to/image.jpg", "rb") as f:
    image_data = base64.b64encode(f.read()).decode("utf-8")

# Storing an image with automatic vision model processing and embedding
document = {
    "title": "Product Image",
    "image": EmbImage(image_data,)
}

# Insert immediately returns while processing happens asynchronously
collection.insert_one(document)

# Now you can query for images semantically
results = collection.query("product with blue background")
```

## Quick Start

### Using Docker (Recommended)

The easiest way to get started with a self-hosted CapyDB instance:

1. Clone the repository:
   ```bash
   git clone https://github.com/capydb/capydb.git
   cd capydb
   ```

2. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   
3. Update the `.env` file with your configuration

4. Start the services:
   ```bash
   docker-compose up
   ```

This will start the complete CapyDB stack with all required services.

### Installation

For alternative installation methods and detailed setup instructions, visit our [documentation](https://docs.capydb.com/installation).

## Documentation

For comprehensive documentation, API references, and best practices, visit:

[https://docs.capydb.com](https://docs.capydb.com)

## SDKs

CapyDB provides official SDKs for multiple languages:

- **Python**: `pip install capydb`
- **JavaScript**: `npm install capydb`

## Development

### Testing

Run tests with:

```bash
pytest
```

## Deployment

For production deployment guides and best practices, visit our [deployment documentation](https://docs.capydb.com/deployment).

## Contributing

We welcome contributions from the community! Please see our [contributing guide](https://docs.capydb.com/contributing) for more information on how to get involved.

## Hosted Service

For those who prefer a managed solution, we offer CapyDB Cloud with premium features, dedicated support, and SLAs at [www.capydb.com](https://www.capydb.com).

## Research

If you use CapyDB in your research, please cite:

```bibtex
@software{capydb,
  author = {Tomohiro Kanazawa},
  title = {CapyDB: A High-Level Database for LLM Applications},
  url = {https://github.com/capydb/capydb},
  year = {2025},
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 