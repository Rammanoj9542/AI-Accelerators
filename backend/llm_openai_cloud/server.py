# Import necessary modules and classes
from fastapi import FastAPI, HTTPException, Request, Response, Depends
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import os
import logging
from prompt_template import PromptInitializer
from response import GenerateResponse
from cachetools import TTLCache
from database import MongoDBHandler
from get_prompt import GetPromptDetails
from get_model import GetModel

# Set up logging
current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..")
logdir = os.path.join(project_directory, "llm_openai_cloud")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

mongo_ip = os.getenv("mongo_ip")
mongo_port = os.getenv("mongo_port")
mongodb_handler = MongoDBHandler(mongo_ip,mongo_port)



# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
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
@app.post('/llm/server')
@limiter.limit(times + "/minute")  # Apply rate limiting to this endpoint
async def output(json_data: dict, request: Request, response: Response):
    try:
        # Extract data from JSON request and log the received data
        clientApiKey = json_data['clientApiKey']
        modelId = json_data['modelId']
        promptId = json_data['promptId']
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        logger.info(f"Received request data: Client API Key: {clientApiKey}, Model ID: {modelId}, Prompt ID: {promptId}, User ID: {userId}")

        cache_model_key = (clientApiKey, modelId)
        cached_model_data = cache.get(cache_model_key)

        if cached_model_data:
            # If model data is found in the cache, set mode and model
            mode, model = cached_model_data
        else:
            # Retrieve model data from GetModel class
            model_instance = GetModel(clientApiKey, modelId)
            mode, model, error_message = model_instance.get_model_data()
            cache[cache_model_key] = (mode, model)
            if not error_message:
                logger.info("Successfully retrieved model details.")
            else:
                logging.error(error_message)
                raise HTTPException(status_code=500, detail=error_message)


        # Retrieve prompt details from GetPromptDetails class
        cache_prompt_key = (clientApiKey, promptId)
        cached_prompt_data = cache.get(cache_prompt_key)

        if cached_prompt_data:
            # If prompt details are found in the cache, set the prompt_details_instance.
            prompt_details_instance = cached_prompt_data
        else: 
            prompt_details_instance = GetPromptDetails(clientApiKey, promptId)
            cache[cache_prompt_key] = (prompt_details_instance)
        
        if prompt_details_instance.get_error_message():
            error_message = prompt_details_instance.get_error_message()
            logging.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        else:
            prompt_details = prompt_details_instance.get_prompt_details()
            logger.info("Successfully retrieved model and prompt details.")

        
        inputData = prompt_details['inputData']
        systemPrompt = prompt_details['systemMessage']
        humanPrompt = prompt_details['humanMessage']

        if not len(inputData) == 0:
            # Initialize and format system message using PromptInitializer class
            prompt_initializer = PromptInitializer(prompt= systemPrompt)
            systemMessage, error_message = prompt_initializer.initialize_prompt(inputData)
            systemMessage = systemMessage[0].content
        else:
            systemMessage = systemPrompt


        # Initialize and format simple prompt using PromptInitializer class
        prompt_initializer = PromptInitializer(prompt= humanPrompt)
        query, error_message  = prompt_initializer.initialize_prompt(json_data["inputData"])
        query = query[0].content

        if error_message:
            logging.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        else:
            logger.info("Successfully Query Formated")

        if prompt_details['appType'] == "simple":
            response = GenerateResponse(
                model = model,
                systemMessage = systemMessage,
                humanMessage = query,
                appType = 'simple'
            )
        elif prompt_details['appType'] == "conversational":
            memoryType = prompt_details['memoryType']
            response = GenerateResponse(
                model = model,
                systemMessage = systemMessage,
                humanMessage = query,
                appType = 'conversational',
                uniqueId = uniqueId,
                memoryType = memoryType
            ) 
        if response.error:
            print(response.error)
            logger.error(f"Error in response: {response.error}")
            raise HTTPException(status_code=500, detail="Error in generating response.")
        else:
            output = response.response

            response = output[0]
            input_tokens = output[1]
            output_tokens = output[2]
            print(response, input_tokens, output_tokens)

            cache_input_tokens_key = (clientApiKey, modelId, "input_tokens")
            cached_input_tokens_data = cache.get(cache_input_tokens_key)

            if cached_input_tokens_data:
                total_input_tokens = cached_input_tokens_data + input_tokens
                cache[cache_input_tokens_key] = total_input_tokens
            else:
                cache[cache_input_tokens_key] = input_tokens

            cache_output_tokens_key = (clientApiKey, modelId, "output_tokens")
            cached_output_tokens_data = cache.get(cache_output_tokens_key)

            if cached_output_tokens_data:
                total_output_tokens = cached_output_tokens_data + output_tokens
                cache[cache_output_tokens_key] = total_output_tokens
            else:
                cache[cache_output_tokens_key] = output_tokens
            return {"result": response}
            
    except HTTPException as he:
        # If an HTTPException is raised, propagate it with the same status code and details
        logger.warning(f"HTTPException occurred: {he}")
        raise he
    except Exception as e:
        # Log the error using logging module, raise HTTPException with 500 status code and log the error
        print(str(e))
        logger.error(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@app.post('/llm/resetchat')
async def reset_chat(json_data: dict, request: Request, response: Response):
    try:
        clientApiKey = json_data['clientApiKey']
        userId = json_data['userId']
        uniqueId = clientApiKey + userId

        # Create an instance of GenerateResponse class
        response_generator = GenerateResponse(uniqueId=uniqueId)

        if response_generator.error:
            logger.error(f"Error in resetting chat: {response_generator.error}")
            raise HTTPException(status_code=500, detail="Error in resetting chart.")
        else:
            reset_result = response_generator._reset_chart()
            logger.info("Chart Reset successfully")
            return {"result": "Chart reset successful."}

    except HTTPException as he:
        logger.error(f"HTTP Exception occurred: {he.detail}")
        raise he
    except Exception as e:
        logger.exception(f"An error occurred: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

if __name__ == '__main__':
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0" ,port=6002,reload=True)