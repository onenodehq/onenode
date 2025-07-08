from functools import wraps
from flask import request
import re
from celery_tasks.stats_tasks import track_api_call_stats
from utils.email import notify_admin


def track_v0_document_stats(f):
    """
    Decorator to track daily API call statistics for v0 document endpoints.
    
    This decorator:
    - Extracts project_id from function arguments or URL parameters
    - Identifies the endpoint type (document, find, query)
    - Tracks HTTP method
    - Sends stats to Celery for async processing to minimize response delay
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            # Extract project_id from function arguments (URL parameters)
            project_id = kwargs.get('project_id')
            
            # Determine endpoint type from the request path
            endpoint = determine_endpoint_type(request.path)
            method = request.method
            
            # Extract db_name and collection_name from kwargs if available
            db_name = kwargs.get('db_name')
            collection_name = kwargs.get('collection_name')
            
            # Only track if we have a project_id and this is a v0 document endpoint
            if project_id and endpoint:
                # Send to Celery for async processing to avoid blocking the response
                track_api_call_stats.delay(
                    project_id=project_id,
                    endpoint=endpoint,
                    method=method,
                    db_name=db_name,
                    collection_name=collection_name
                )
        
        except Exception as e:
            notify_admin(f"Stats tracking failed for {request.path}: {str(e)}")
            pass
        
        # Call the original function
        return f(*args, **kwargs)
    
    return decorated_function


def determine_endpoint_type(path: str) -> str:
    """
    Determine the endpoint type from the request path.
    
    Args:
        path: The request path
        
    Returns:
        String identifying the endpoint type or None if not a tracked endpoint
    """
    # Remove query parameters and normalize the path
    path = path.split('?')[0].rstrip('/')
    
    # Check for v0 document endpoints
    if '/v0/' in path:
        if re.search(r'/document/query/?$', path):
            return 'document_query'
        elif re.search(r'/document/find/?$', path):
            return 'document_find'
        elif re.search(r'/document/?$', path):
            return 'document'
        elif re.search(r'/collection/[^/]+/?$', path):
            return 'collection'
    
    return None 