from blueprints.v0.utils.mongo_operations import get_client_db


def list_documents_service(
    project_id: str, 
    db_name: str, 
    collection_name: str,
    page_num: int = 1,
    page_size: int = 10
):
    db = get_client_db(project_id, db_name)
    collection = db.get_collection(collection_name)
    
    # Calculate skip value based on page number and size
    skip = (page_num - 1) * page_size
    
    # Get total document count
    total_count = collection.count_documents({})
    
    # Get paginated results
    documents = list(collection.find({}).skip(skip).limit(page_size))
    
    # Calculate total pages
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
    
    pagination = {
        "total_count": total_count,
        "total_pages": total_pages,
        "current_page": page_num
    }
    
    return {
        "documents": documents,
        "pagination": pagination
    }