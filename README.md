# OneNode

> **The AI-Native Database for Modern Applications**

OneNode is a general-purpose database designed specifically for AI applications, unifying text, images, video, audio, semantic search, and asynchronous processing in a single platform. No more juggling multiple database systems, object storage, or vector databases.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python SDK](https://img.shields.io/badge/Python%20SDK-0.8.6-blue.svg)](https://pypi.org/project/onenode/)
[![JavaScript SDK](https://img.shields.io/badge/JavaScript%20SDK-0.8.7-green.svg)](https://www.npmjs.com/package/@onenodehq/onenode)
[![Public Beta](https://img.shields.io/badge/Status-Public%20Beta-orange.svg)](https://console.onenode.ai)

## 🚀 What is OneNode?

OneNode eliminates the complexity of modern data infrastructure by providing a single database that handles everything:

- **🧠 AI-Native**: Built with semantic understanding at its core
- **🎯 Multimodal**: Native support for text, images, video, and audio
- **🔍 Semantic Search**: Find content based on meaning, not just keywords
- **⚡ Asynchronous Processing**: Background workers built-in
- **🔄 MongoDB Compatible**: Familiar API with AI superpowers
- **🏗️ Unified Platform**: Replace multiple databases with one solution

## ✨ Key Features

### AI-Powered Data Processing
```python
from onenode import Text, Image

# Semantic text indexing
content = Text("Machine learning revolutionizes data analysis")
content.enable_index()

# AI vision processing for images
diagram = Image("architecture_diagram.png")
diagram.enable_index()

# Store everything together
db.users.insert_one({
    "name": "Alice",
    "bio": content,
    "profile_image": diagram
})
```

### Instant Semantic Search
```javascript
// Find documents by meaning, not exact keywords
const results = await collection.find({
    bio: { $semantic: "artificial intelligence expert" }
});
```

## 🎯 Why OneNode?

### Traditional Approach ❌
- Configure multiple database systems
- Set up separate object storage
- Implement vector search infrastructure
- Build background job queues
- Manage complex integrations

### OneNode Approach ✅
- **One database, everything included**
- **Ship features, not infrastructure**
- **Focus on your application logic**

## 📦 Installation

### Python
```bash
pip install onenode
```

### JavaScript/TypeScript
```bash
npm install @onenodehq/onenode
```

## 🏃‍♀️ Quick Start

### Option 1: Instant Start (No Signup Required)
Perfect for prototyping and learning:

```python
from onenode import OneNode

# Initialize without API key - completely free
client = OneNode()
db = client.database("my_app")
collection = db.collection("users")

# Start using immediately
collection.insert_one({
    "name": "Bob",
    "email": "bob@example.com"
})
```

### Option 2: Production Setup
Get your free API key at [console.onenode.ai](https://console.onenode.ai):

```python
import os
from onenode import OneNode

client = OneNode(api_key=os.getenv("ONENODE_API_KEY"))
```

## 🏗️ Architecture

OneNode unifies three storage layers under a single API:

| Layer | Purpose | Technology |
|-------|---------|------------|
| **Document Store** | JSON documents with flexible schemas | MongoDB-compatible |
| **Vector Search** | Semantic search with embeddings | High-performance vector engine |
| **Object Storage** | Scalable file storage with AI analysis | Automatic content processing |

## 🌟 Use Cases

- **RAG Applications**: Build intelligent chatbots and Q&A systems
- **Content Management**: Semantic search across documents and images
- **E-commerce**: Visual and text-based product search
- **Knowledge Bases**: AI-powered documentation systems
- **Media Applications**: Multimodal content discovery

## 📚 Documentation

- **[Quick Start Guide](https://docs.onenode.ai)** - Get up and running in minutes
- **[API Reference](https://docs.onenode.ai/document)** - Complete API documentation
- **[Multimodal Guide](https://docs.onenode.ai/multimodal)** - Working with images and text
- **[Examples](https://docs.onenode.ai/overview)** - Real-world implementation examples

## 🛠️ Project Structure

This repository contains the complete OneNode ecosystem:

```
onenode/
├── onenode/              # Core API server (Python/Flask)
├── onenode-js/           # JavaScript/TypeScript SDK
├── onenode-py/           # Python SDK
├── onenode-console/      # Web console (Next.js)
├── onenode-docs/         # Documentation site
├── onenode-web/          # Marketing website
├── capybaradb-admin/     # Admin dashboard
└── test/                 # Integration tests
```

## 💰 Pricing

| Plan | Price | Features |
|------|-------|----------|
| **Free** | $0/month | 100MB storage, 500 requests, perfect for prototyping |
| **Standard** | $25/month | 10GB+ storage, 10K+ requests, production ready |
| **Enterprise** | Custom | Unlimited scale, dedicated support |

[View detailed pricing →](https://onenode.ai/pricing)

## 🐛 Public Beta & Bug Bounty

OneNode is currently in **public beta**. Help us improve by reporting bugs and earn **$10** for each verified bug you discover!

[Report a bug →](https://onenode.ai/contact)

## 🤝 Contributing

We welcome contributions to OneNode! Here's how you can help:

1. **Report Issues**: Found a bug? [Open an issue](https://github.com/onenodehq/onenode/issues)
2. **Feature Requests**: Have an idea? [Start a discussion](https://github.com/onenodehq/onenode/discussions)
3. **Documentation**: Help improve our docs
4. **Testing**: Try OneNode with your use cases and share feedback

### Development Setup

```bash
# Clone the repository
git clone https://github.com/onenodehq/onenode.git
cd onenode

# Follow individual component READMEs for setup instructions
```

## 📞 Support & Community

- **Documentation**: [docs.onenode.ai](https://docs.onenode.ai)
- **Dashboard**: [console.onenode.ai](https://console.onenode.ai)
- **Issues**: [GitHub Issues](https://github.com/onenodehq/onenode/issues)
- **Contact**: [Contact Form](https://onenode.ai/contact)
- **Email**: [tomo@onenode.ai](mailto:tomo@onenode.ai)

## 📄 License

OneNode is released under the [MIT License](LICENSE). See individual SDK licenses for specific terms.

## 🙏 Built On

OneNode is built on proven, reliable technologies:

- **MongoDB** - Document storage
- **Pinecone** - Vector search
- **Redis** - Caching and queues  
- **Amazon S3** - Object storage

---

<div align="center">

**Ready to eliminate database complexity?**

[Get Started Free](https://console.onenode.ai) • [View Documentation](https://docs.onenode.ai) • [See Examples](https://docs.onenode.ai/overview)

</div> 