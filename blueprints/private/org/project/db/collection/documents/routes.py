from flask import Blueprint, g, request
from auth.api_key_decorator import require_admin_api_key
from auth.auth_decorator import requires_auth
from bson import json_util, ObjectId
from blueprints.private.org.project.db.collection.documents.services import list_documents_service
from blueprints.v0.project.db.collection.document.find.services import find_docs_service
from blueprints.private.services import check_project_permission
from blueprints.v0.project.db.collection.document.query.services import query_chunks_service
from blueprints.v0.project.db.collection.document.services import delete_docs_service, update_docs_service
from blueprints.v0.utils.mongo_operations import get_client_collection
from blueprints.v0.utils.mongo_setup import mongo_orgs
from errors import CustomAPIError

private_blueprint_document = Blueprint(
    "private_document",
    __name__,
    url_prefix="/<string:collection_name>/document",
)


@private_blueprint_document.route("/list", methods=["GET"])
@requires_auth
def list_documents(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    # Get organization to access plan
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    if org and "plan" in org:
        g.plan = org["plan"].get("type", "free")
    else:
        g.plan = "free"
    
    page_num = int(request.args.get("page", 1))
    page_size = int(request.args.get("limit", 20))

    documents = list_documents_service(
        project_id,
        db_name,
        collection_name,
        page_num,
        page_size
    )

    return json_util.dumps(documents), 200

@private_blueprint_document.route("/find", methods=["POST"])
@requires_auth
def find_documents(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    # Get organization to access plan
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    if org and "plan" in org:
        g.plan = org["plan"].get("type", "free")
    else:
        g.plan = "free"
    
    data = request.get_json() 
    page_num = int(data.get("page", 1))
    page_size = int(data.get("limit", 0))
    filter = data.get("filter")
    projection = data.get("projection")
    sort = data.get("sort")
    
    # Calculate skip value based on page number and size
    skip = (page_num - 1) * page_size
    limit = page_size
    
    # Get documents using find_docs_service
    docs = find_docs_service(
        project_id,
        db_name,
        collection_name,
        filter,
        projection,
        sort,
        skip,
        limit,
    )
    
    mongo_collection = get_client_collection(project_id, db_name, collection_name)
    total_count = mongo_collection.count_documents(filter)
    
    # Calculate total pages
    total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 0
    
    pagination = {
        "total_count": total_count,
        "total_pages": total_pages,
        "current_page": page_num
    }
    
    documents = {
        "documents": docs,
        "pagination": pagination
    }

    return json_util.dumps(documents), 200


@private_blueprint_document.route("", methods=["DELETE"])
@requires_auth
@require_admin_api_key
def delete_docs(
    org_id: str,
    project_id: str,
    db_name: str,
    collection_name: str,
):
    user_id = g.user_id
    check_project_permission(user_id, org_id, project_id)

    # Get organization to access plan
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    if org and "plan" in org:
        g.plan = org["plan"].get("type", "free")
    else:
        g.plan = "free"

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")

    if filter is None:
        raise CustomAPIError(
            "Missing 'filter' field in the request data. 'None' is not allowed."
        )

    result = delete_docs_service(
        filter,
        project_id,
        db_name,
        collection_name,
    )

    return json_util.dumps(result), 200


@private_blueprint_document.route("", methods=["PUT"])
@requires_auth
@require_admin_api_key
def update_docs(
    org_id: str,
    project_id: str,
    db_name: str,
    collection_name: str,
):
    user_id = g.user_id
    check_project_permission(user_id, org_id, project_id)

    # Get organization to access plan
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    if org and "plan" in org:
        g.plan = org["plan"].get("type", "free")
    else:
        g.plan = "free"

    data = json_util.loads(request.get_data(as_text=True))
    filter = data.get("filter")
    update = data.get("update")

    if not filter:
        raise CustomAPIError(message="Missing 'filter' field in the request data.")
    if not update:
        raise CustomAPIError(message="Missing 'update' field in the request data.")

    try:
        result = update_docs_service(
            filter,
            update,
            project_id,
            db_name,
            collection_name,
        )
    except ValueError as e:
        # Catch PyMongo validation errors and convert to API errors
        if "update only works with $ operators" in str(e):
            raise CustomAPIError(
                message="Invalid update operation. All update operations must use MongoDB operators that start with '$'. "
                        "Use operators like $set, $inc, $push, $unset, etc. "
                        "Example: {\"$set\": {\"field\": \"value\"}} instead of {\"field\": \"value\"}",
                status_code=400
            )
        else:
            # Re-raise other ValueError instances
            raise e

    return json_util.dumps(result), 200

@private_blueprint_document.route("/query", methods=["POST"])
@requires_auth
@require_admin_api_key
def query_documents(org_id, project_id, db_name, collection_name):
    user_id = g.user_id

    check_project_permission(user_id, org_id, project_id)

    # Get organization to access plan
    org = mongo_orgs.find_one({"_id": ObjectId(org_id)})
    if org and "plan" in org:
        g.plan = org["plan"].get("type", "free")
    else:
        g.plan = "free"
    
    data = request.get_json() 
    filter = data.get("filter")
    projection = data.get("projection")
    query = data.get("query")
    top_k = int(data.get("top_k", 10))
    emb_model = data.get("emb_model", "text-embedding-3-small")
    
    # Get documents using find_docs_service
    data = query_chunks_service(
        project_id,
        db_name,
        collection_name,
        query,
        filter,
        top_k,
        projection,
        False,
        emb_model,
    )
    
    response = {
        "matches": data,
    }

    return json_util.dumps(response), 200