from llama_index.core.node_parser import SentenceSplitter
from llama_index.core import Settings
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.storage import StorageContext
from llama_index.core import VectorStoreIndex
import chromadb

class Ingestor:
    def __init__(self, embed_model, chunk_size=512, chunk_overlap=20):
        self.embed_model = embed_model
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def ingest_documents(self, documents, collection_name, db_filepath):
        Settings.node_parser = SentenceSplitter(chunk_size=self.chunk_size, chunk_overlap=self.chunk_overlap)
        db = chromadb.PersistentClient(path=db_filepath)
        chroma_collection = db.get_or_create_collection(collection_name)
        vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
        storage_context = StorageContext.from_defaults(vector_store=vector_store)

        index = VectorStoreIndex.from_documents(
            documents, storage_context=storage_context, embed_model=self.embed_model
        )
        return index
