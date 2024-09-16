# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from cachetools import TTLCache
from database import MongoDBHandler
from embedding_model_loader import EmbeddingModelLoader
from qa_retrieval import QARetriever
from document_processor import DocumentProcessor
from fastapi.responses import StreamingResponse
import asyncio 

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
data_dir = os.path.join(project_directory, "data")
logdir = os.path.join(project_directory, "rag")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# config_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "config.yaml"))
mongo_ip = os.getenv("mongo_ip")
mongo_port = os.getenv("mongo_port")
mongodb_handler = MongoDBHandler(mongo_ip,mongo_port)

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Set rate limiter settings
times = "1000"
limiter = Limiter(key_func=get_remote_address)

# Initialize FastAPI app
app = FastAPI()

# Initialize cache
cache = TTLCache(maxsize=5000, ttl=600)

# Set up rate limiting and exception handling for RateLimitExceeded error
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# API endpoint for processing requests
@app.post("/rag/ingest")
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data["clientApiKey"]
        embeddingModelId = json_data["modelId"]
        ingestId = json_data["ingestId"]
        source_directory = json_data["sourceDirectory"]
        source_directory = os.path.join(data_dir, source_directory)
        persist_directory = json_data["persistDirectory"]
        persist_directory = os.path.join(data_dir, persist_directory)
        userId = json_data["userId"]
        uniqueId = clientApiKey + userId
        logger.info(
            f"Received request data: Client API Key: {clientApiKey}, Embedding Model ID: {embeddingModelId}, Source Directory: {source_directory}, Persist Directory: {persist_directory} ,User ID: {userId}"
        )

        cache_model_key = (clientApiKey, embeddingModelId)
        cached_model_data = cache.get(cache_model_key)

        if cached_model_data:
            # If model data is found in the cache, set model
            embedding_model_name = cached_model_data.get("modelName")
            embedding_deviceType = cached_model_data.get("deviceType")
        else:
            try:
                # Fetch model details from the database using client API key and embedding model ID
                modelDetails = mongodb_handler.getEmbeddingModelDetails(
                    clientApiKey, embeddingModelId
                )
                embedding_model_name = modelDetails.get("modelName")
                embedding_deviceType = modelDetails.get("deviceType")
                cache[cache_model_key] = modelDetails
            except Exception as e:
                logger.error(f"Error fetching embedding model details: {e}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Error fetching embedding model details: {e}",
                )

        cache_ingest_key = (clientApiKey, ingestId)
        cached_ingest_data = cache.get(cache_ingest_key)

        if cached_ingest_data:
            # If ingest config is found in the cache, set ingest config
            ingest_config = cached_ingest_data
        else:
            try:
                # Fetch ingest config from the database using client API key and Ingest ID
                ingest_config = mongodb_handler.getIngestConfig(clientApiKey, ingestId)
                cache[cache_ingest_key] = ingest_config
            except Exception as e:
                logger.error(f"Error fetching ingest config details: {e}")
                raise HTTPException(
                    status_code=404, detail=f"Error fetching ingest config details: {e}"
                )

        # Create a DocumentProcessor instance
        doc_processor = DocumentProcessor(
            persist_directory=persist_directory,
            source_directory=source_directory,
            embedding_model_name=embedding_model_name,
            ingest_config=ingest_config,
            device_type=embedding_deviceType,
        )

        # Process documents using DocumentProcessor
        result_db = doc_processor.process_documents()

        if result_db:
            return {"result": "Ingest Done Successfully"}
        else:
            logger.error("Ingest Failed")
            raise HTTPException(status_code=500, detail="Ingest Failed")

    except HTTPException as he:
        # If an HTTPException is raised, propagate it with the same status code and details
        logger.warning(f"HTTPException occurred: {he}")
        raise he
    except Exception as e:
        # Log the error using logging module, raise HTTPException with 500 status code and log the error
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post("/rag/inference")
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data["clientApiKey"]
        embeddingModelId = json_data["embeddingModelId"]
        retrievalId = json_data["retrievalId"]
        persist_directory = json_data["persistDirectory"]
        persist_directory = os.path.join(data_dir, persist_directory)
        query = json_data["query"]
        userId = json_data["userId"]
        uniqueId = json_data["uniqueId"]
        logger.info(
            f"Received request data: Client API Key: {clientApiKey}, Embedding Model ID: {embeddingModelId}, Persist Directory: {persist_directory} ,User ID: {userId}"
        )

        cache_model_key = (clientApiKey, embeddingModelId)
        cached_model_data = cache.get(cache_model_key)

        if cached_model_data:
            # If model data is found in the cache, set model
            embedding_model_name = cached_model_data.get("modelName")
            embedding_deviceType = cached_model_data.get("deviceType")
        else:
            try:
                # Fetch model details from the database using client API key and embedding model ID
                modelDetails = mongodb_handler.getEmbeddingModelDetails(
                    clientApiKey, embeddingModelId
                )
                embedding_model_name = modelDetails.get("modelName")
                embedding_deviceType = modelDetails.get("deviceType")
                cache[cache_model_key] = modelDetails
            except Exception as e:
                logger.error(f"Error fetching embedding model details: {e}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Error fetching embedding model details: {e}",
                )

        cache_retrieval_key = (clientApiKey, retrievalId)
        cached_retrieval_data = cache.get(cache_retrieval_key)

        if cached_retrieval_data:
            # If retrieval config is found in the cache, set retrieval config
            retrieval_config = cached_retrieval_data
        else:
            try:
                # Fetch retrieval config from the database using client API key and Retrieval ID
                retrieval_config = mongodb_handler.getRetrievalConfig(
                    clientApiKey, retrievalId
                )
                cache[cache_retrieval_key] = retrieval_config
            except Exception as e:
                logger.error(f"Error fetching retrieval config details: {e}")
                raise HTTPException(
                    status_code=404,
                    detail=f"Error fetching retrieval config details: {e}",
                )

        if retrieval_config["history"] == "true":
            use_history = True
        else:
            use_history = False

        if retrieval_config["retrievalType"] == "QAretrieval":
            cache_llm_key = (clientApiKey, retrieval_config["llmModelId"], "LLMData")
            cached_llm_data = cache.get(cache_llm_key)

            if cached_llm_data:
                # If llm config is found in the cache, set llm config
                llm_config = cached_llm_data
            else:
                try:
                    # Fetch llm config from the database using client API key and LLM Model ID
                    llm_config = mongodb_handler.getLlmModelDetails(
                        clientApiKey, retrieval_config["llmModelId"]
                    )
                    cache[cache_llm_key] = llm_config
                except Exception as e:
                    logger.error(f"Error fetching retrieval config details: {e}")
                    raise HTTPException(
                        status_code=404,
                        detail=f"Error fetching retrieval config details: {e}",
                    )

            cache_prompt_key = (
                clientApiKey,
                retrieval_config["llmPromptId"],
                "PromptData",
            )
            cache_prompt_data = cache.get(cache_prompt_key)

            if cache_prompt_data:
                # If prompt data is found in the cache, set prompt data
                prompt = cache_prompt_data
            else:
                try:
                    # Fetch prompt config from the database using client API key and Prompt ID
                    prompt = mongodb_handler.getPromptDetails(
                        clientApiKey, retrieval_config["llmPromptId"]
                    )
                    cache[cache_prompt_key] = prompt
                except Exception as e:
                    logger.error(f"Error fetching prompt details: {e}")
                    raise HTTPException(
                        status_code=404, detail=f"Error fetching prompt details: {e}"
                    )

            qa_pipeline = QARetriever(
                clientApiKey = clientApiKey,
                persist_directory = persist_directory,
                embedding_model_name = embedding_model_name,
                llmConfig = llm_config,
                chain_type = retrieval_config["chainType"],
                history = use_history,
                embedding_device_type = embedding_deviceType,
                retrieval_device_type = retrieval_config["deviceType"],
                systemPrompt = prompt,
                uniqueId = uniqueId,
            )
            qa = qa_pipeline.retrieval_qa_pipline()
            res = qa(query)
        return {"result": res}

    except HTTPException as he:
        # If an HTTPException is raised, propagate it with the same status code and details
        logger.warning(f"HTTPException occurred: {he}")
        raise he
    except Exception as e:
        # Log the error using logging module, raise HTTPException with 500 status code and log the error
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=7001, reload=True)
