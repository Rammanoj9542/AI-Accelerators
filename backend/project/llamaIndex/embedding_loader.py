from llama_index.embeddings.huggingface import HuggingFaceEmbedding
import os

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..", "..", "..")
model_dir = os.path.join(project_directory, "EmbeddingModels")

class EmbeddingModelLoader:
    def __init__(self, model_name):
        self.model_name = model_name
        self.cache_folder = model_dir
        
    def load_embedding_model(self):
        embed_model = HuggingFaceEmbedding(model_name=self.model_name, cache_folder=self.cache_folder)
        return embed_model
