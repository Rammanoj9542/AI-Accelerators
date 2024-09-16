import os
from llama_index.core import SimpleDirectoryReader

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..","..")
data_dir = os.path.join(project_directory, "data")

class DataReader:
    def __init__(self, source_directory):
        source_directory = source_directory
        self.source_directory = os.path.join(data_dir, source_directory)

    def read_documents(self):
        documents = SimpleDirectoryReader(self.source_dir).load_data()
        return documents