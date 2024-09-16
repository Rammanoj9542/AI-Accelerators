import os
from cachetools import TTLCache
from langchain.chat_models import ChatOpenAI

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..", "..")
model_dir = os.path.join(project_directory, "LLMModels")
logdir = os.path.join(project_directory, "rag")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

import queue
q = queue.Queue()
stop_item = "###finish###"

from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import sys
class StreamingStdOutCallbackHandlerYield(StreamingStdOutCallbackHandler):
    def on_llm_start(
        self, serialized, prompts, **kwargs
    ) -> None:
        """Run when LLM starts running."""
        with q.mutex:
            q.queue.clear()

    def on_llm_new_token(self, token, **kwargs) -> None:
        """Run on new LLM token. Only available when streaming is enabled."""
        sys.stdout.write(token)
        sys.stdout.flush()
        q.put(token)

    def on_llm_end(self, response, **kwargs) -> None:
        """Run when LLM ends running."""
        q.put(stop_item)


class LLMModelLoader:
    _loaded_llm_models = TTLCache(maxsize=5000, ttl=600)

    def __init__(self, llmConfig, retrieval_device_type="cpu"):
        self.cache_folder = model_dir
        self.modelId = llmConfig.get("modelId")
        self.mode = llmConfig.get("mode")
        self.modelType = llmConfig.get("modelType")
        self.modelName = llmConfig.get("modelName")
        self.engine = llmConfig.get("engine")
        self.cloudAPIKey = llmConfig.get("cloudAPIKey")
        self.retrieval_device_type = retrieval_device_type

    def load_llm_models(self):
        cache_key = (self.modelId, self.retrieval_device_type, self.mode)
        if cache_key in self._loaded_llm_models:
            print(
                f"Model '{self.modelName}' with device type '{self.retrieval_device_type}' already loaded. Using cached version."
            )
            return self._loaded_llm_models[cache_key]
        else:
            if self.mode == "Cloud":
                llm = self._load_cloud_llm()
            elif self.mode == "Private":
                llm = self._load_private_llm()
            self._loaded_llm_models[cache_key] = llm
            return llm

    def _load_cloud_llm(self):
        if self.modelType == "OpenAI":
            api_key = os.getenv(self.cloudAPIKey)
            os.environ["OPENAI_API_KEY"] = api_key
            llm = ChatOpenAI(
                temperature=0,
                model=self.engine,
                streaming=True,
                callbacks=[StreamingStdOutCallbackHandlerYield()]
            )
            return llm
