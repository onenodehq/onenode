class PathNotFoundError(Exception):
    def __init__(self, path):
        self.path = path
        self.message = f"Path '{path}' not found in the dictionary."
        super().__init__(self.message)