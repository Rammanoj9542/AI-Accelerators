from langchain.chains import ConversationChain
from langchain.memory import ConversationBufferMemory
from langchain.prompts.prompt import PromptTemplate
from cachetools import TTLCache
import tiktoken
import sys

# Initialize a cache with a maximum size of 5000 entries and a time-to-live (TTL) of 600 seconds
cache = TTLCache(maxsize=5000, ttl=600)

encoding = tiktoken.get_encoding("cl100k_base")

# The cache variable is now ready to store conversation history data with a maximum size of 5000 entries
# and each entry will be automatically removed from the cache after 600 seconds (10 minutes).

class GenerateResponse:
    def __init__(
            self,
            model = None,  # The language model used for generating responses
            appType = None,  # Type of application, e.g., "simple", "conversational"
            systemMessage = None,  # System message for conversational applications
            humanMessage = None,  # User input for conversational applications
            aiMessage = None,
            uniqueId = None,  # Unique identifier for the conversation
            memoryType = None  # Type of memory to use, e.g., "BufferMemory"
            ):
        """
        Initializes the GenerateResponse object with the provided parameters.

        Args:
            mode (str): Mode of operation, e.g., "private", "cloud".
            model: The language model used for generating responses.
            appType (str): Type of application, e.g., "simple", "conversational".
            promptType (str): Type of prompt, e.g., "user", "system".
            simplePrompt: Prompt for simple applications.
            systemMessage: System message for conversational applications.
            humanMessage: User input for conversational applications.
            aiMessage: Placeholder for AI-generated messages (not used in the provided code).
            uniqueId (str): Unique identifier for the conversation.
            memoryType (str): Type of memory to use, e.g., "BufferMemory".

        Attributes:
            mode (str): Mode of operation.
            model: The language model used for generating responses.
            promptType (str): Type of prompt.
            appType (str): Type of application.
            simplePrompt: Prompt for simple applications.
            systemPrompt (str): System message for conversational applications.
            systemTemplate (str): Template for system message with placeholders for history, input, and AI response.
            humanMessage: User input for conversational applications.
            memoryType (str): Type of memory.
            uniqueId (str): Unique identifier for the conversation.
            error (str): Variable to store error messages.
            response: Variable to store the generated response.
        """
        self.model = model
        self.appType = appType
        self.uniqueId = uniqueId
        self.systemMessage = systemMessage
        self.query = humanMessage
        self.error = None  # Variable to store error message

        # Check the application type and initialize prompt and response accordingly
        if self.appType == 'simple':
            self.response = self._simple_response()
        elif self.appType == 'conversational':
            # System template with placeholders for conversation history, user input, and AI response
            self.systemTemplate = systemMessage + """Current conversation:{history}
                                Human: {input}
                                AI:"""
            self.memoryType = memoryType
            self.response = self._conversational_response()

    def formate_prompt(self, systemPrompt, query):
        prompt = f"""
            ### [INST] 
            Instruction: {systemPrompt}
            [/INST]

            ### Query:
            {query} 
        """
        return prompt

    def _simple_response(self):
        """
        Generates a simple response based on the provided inputs and handles error conditions.

        Args:
            None

        Returns:
            str or None: Generated response for the simple prompt, or None in case of error.
        """
        try:

            if not self.systemMessage == None:
                query = self.formate_prompt(systemPrompt= self.systemMessage, query= self.query)
            # Check the mode of operation (Cloud or other mode)
            input_token_integr = encoding.encode(query)
            input_tokens = len(input_token_integr)

            # Generate a response using the language model and the provided prompt
            response = self.model.generate_response(query= query)
            
            # If response is None , return None
            if response is None:
                return None

            # Return the generated response
            output_token_integr = encoding.encode(response)
            output_tokens = len(output_token_integr)
            return response, input_tokens, output_tokens

        # Handle exceptions that might occur during the process
        except Exception as e:
            # Set the error attribute with the error message
            self.error = f"Error in simple response generation: {str(e)}"
            # Return None to indicate an error occurred during response generation
            return None


    def _conversational_response(self):
        """
        Generates a conversational response based on the provided inputs and handles caching of conversation history.

        Args:
            None

        Returns:
            str or None: Generated response for the conversational prompt, or None in case of error.
        """
        try:
            # Create a cache memory key using the unique identifier
            cache_memory_key = (self.uniqueId)

            # Retrieve cached chat history data using the cache memory key
            cached_memory_data = cache.get(cache_memory_key)

            # If cached chat history data is found
            if cached_memory_data:
                # Set the memory attribute with the cached chat history
                self.memory = cached_memory_data
            else:
                # If no cached data is found and memory type is BufferMemory, initialize a new ConversationBufferMemory
                if self.memoryType == "buffer":
                    self.memory = ConversationBufferMemory()

            # Generate a conversational response using the language model and provided inputs
            input_token_integr = encoding.encode(self.query)
            input_tokens = len(input_token_integr)

            response, memory = self.model.generate_conversational_response(
                memoryhistory= self.memory,
                query= self.query,
                systemTemplate= self.systemTemplate
            )

            # Update the cache with the latest conversation history
            cache[cache_memory_key] = memory

            # Return the generated response
            output_token_integr = encoding.encode(response)
            output_tokens = len(output_token_integr)
            return response, input_tokens, output_tokens

        # Handle exceptions that might occur during the process
        except Exception as e:
            # Set the error attribute with the error message
            self.error = f"Error in conversational response generation: {str(e)}"
            # Return None to indicate an error occurred during response generation
            return None


    def _reset_chart(self):
        """
        Resets the chat history stored in the cache based on the unique identifier.

        Args:
            None

        Returns:
            str or None: Success message if chat is reset successfully, or None in case of error.
        """
        try:
            # Create a cache memory key using the unique identifier
            cache_memory_key = (self.uniqueId)

            # Retrieve cached chat history data using the cache memory key
            cached_memory_data = cache.get(cache_memory_key)

            # If chat history is found in the cache
            if cached_memory_data:
                # Set the memory attribute with the cached chat history
                self.memory = cached_memory_data
                # Clear the chat history from the memory
                self.memory.clear()

                # Return success message indicating chat reset
                return "Chat Reset Successfully"
            else:
                # If no chat history is found in the cache, return a message indicating so
                return "No Chat found to reset"

        # Handle exceptions that might occur during the process
        except Exception as e:
            # Set the error attribute with the error message
            self.error = f"Error in resetting chat: {str(e)}"
            # Return None to indicate an error occurred during chat reset
            return None
