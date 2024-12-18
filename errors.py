# Error handler
class AuthError(Exception):
    def __init__(self, message, status_code=401):
        self.message = message
        self.status_code = status_code


class CustomAPIError(Exception):
    def __init__(self, message, status_code=400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
