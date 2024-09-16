from fastapi import FastAPI, HTTPException, Request, Response, Depends
from pydantic import BaseModel
from llamaIndex import EmbeddingModelLoader, DataReader, Ingestor
import os

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
data_dir = os.path.join(project_directory, "data")

app = FastAPI()

class IngestRequest(BaseModel):
    source_directory: str
    embed_model_name: str
    collection_name: str
    persist_directory: str

@app.post("/ingest")
def ingest_documents(request: IngestRequest):
    try:
        # Load embedding model
        print(request.embed_model_name)
        embed_loader = EmbeddingModelLoader(model_name=request.embed_model_name)
        embed_model = embed_loader.load_embedding_model()

        # Preprocess documents
        
        preprocessor = DataReader(source_directory=request.source_directory)
        text_docs = preprocessor.read_documents()

        print(text_docs)

        # Ingest documents into ChromaDB
        ingestor = Ingestor(embed_model=embed_model)
        persist_directory = request.persist_directory
        persist_directory = os.path.join(data_dir, persist_directory)
        index = ingestor.ingest_documents(text_docs, request.collection_name, persist_directory)

        return {"message": "Ingestion complete."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=9001, reload=True)
