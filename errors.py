class PathNotFoundError(Exception):
    def __init__(self, path):
        self.path = path
        self.message = f"Path '{path}' not found in the dictionary."
        super().__init__(self.message)


# Error handler
class AuthError(Exception):
    def __init__(self, error, status_code):
        self.error = error
        self.status_code = status_code
