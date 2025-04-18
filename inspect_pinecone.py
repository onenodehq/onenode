#!/usr/bin/env python3
from blueprints.v0.utils.pinecone_setup import pc_index_1536, pc_index_3072
from blueprints.v0.utils.pinecone_operations import generate_pc_namespace

# Project details
project_id = "67fdc6e9d531f6aacf47e841"
db_name = "test_db_1744686115"
collection_name = "test_db_1744686115"

# Generate prefix and namespace
prefix = f"{project_id}#{db_name}#{collection_name}#"
namespace = generate_pc_namespace(project_id, db_name)

print(f"Checking Pinecone index with prefix: {prefix}")
print(f"Namespace: {namespace}")

# Check without namespace (how delete_collection is implemented)
print("\nWithout namespace:")
vectors_no_namespace = []
for ids in pc_index_1536.list(prefix=prefix):
    vectors_no_namespace.extend(ids)
print(f"Found {len(vectors_no_namespace)} vectors without namespace")
if vectors_no_namespace:
    print("First 5 IDs:", vectors_no_namespace[:5])

# Check with namespace (how other operations are implemented)
print("\nWith namespace:")
vectors_with_namespace = []
for ids in pc_index_1536.list(prefix=prefix, namespace=namespace):
    vectors_with_namespace.extend(ids)
print(f"Found {len(vectors_with_namespace)} vectors with namespace")
if vectors_with_namespace:
    print("First 5 IDs:", vectors_with_namespace[:5])

if __name__ == "__main__":
    print("Script executed directly") 