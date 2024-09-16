import os
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.embeddings import HuggingFaceInstructEmbeddings
from langchain.embeddings import HuggingFaceBgeEmbeddings
from langchain.embeddings import HuggingFaceEmbeddings
from cachetools import TTLCache


current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..", "..")
model_dir = os.path.join(project_directory, "EmbeddingModels")
logdir = os.path.join(project_directory, "rag")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")


class EmbeddingModelLoader:
    _loaded_embeddings = TTLCache(maxsize=5000, ttl=600)

    def __init__(self, model_name, device_type="cuda"):
        self.cache_folder = model_dir
        self.model_name = model_name
        self.device_type = device_type

    def load_embeddings(self):
        cache_key = (self.model_name, self.device_type)
        if cache_key in self._loaded_embeddings:
            return self._loaded_embeddings[cache_key]
        else:
            embeddings = self._load_embeddings()
            self._loaded_embeddings[cache_key] = embeddings
            return embeddings

    def _load_embeddings(self):
        if "instructor" in self.model_name:
            embeddings = HuggingFaceInstructEmbeddings(
                cache_folder=self.cache_folder,
                model_name=self.model_name,
                model_kwargs={"device": self.device_type},
                embed_instruction="Represent the document for retrieval:",
                query_instruction="Represent the question for retrieving supporting documents:",
            )
        elif "bge" in self.model_name:
            embeddings = HuggingFaceBgeEmbeddings(
                cache_folder=self.cache_folder,
                model_name=self.model_name,
                model_kwargs={"device": self.device_type},
                query_instruction="Represent this sentence for searching relevant passages:",
            )
        else:
            embeddings = HuggingFaceEmbeddings(
                cache_folder=self.cache_folder,
                model_name=self.model_name,
                model_kwargs={"device": self.device_type},
            )
        return embeddings
