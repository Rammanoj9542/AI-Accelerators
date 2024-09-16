import os
from langchain.docstore.document import Document
from langchain.vectorstores import Chroma
from embedding_model_loader import EmbeddingModelLoader
from llm_model_loader import LLMModelLoader
from prompt_template_utils import get_prompt_template
from langchain.chains import RetrievalQA
from cachetools import TTLCache
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler 
from langchain.callbacks.manager import CallbackManager

callback_manager = CallbackManager([StreamingStdOutCallbackHandler()])

# Initialize cache
qa_cache = TTLCache(maxsize=5000, ttl=600)


class QARetriever:
    def __init__(
        self,
        clientApiKey,
        persist_directory,
        embedding_model_name,
        llmConfig,
        chain_type,
        history,
        uniqueId,
        systemPrompt,
        embedding_device_type="cpu",
        retrieval_device_type="cpu",
    ):
        self.clientApiKey = clientApiKey
        self.unique_id = uniqueId
        self.system_prompt = systemPrompt
        self.persist_directory = persist_directory
        self.embedding_model_name = embedding_model_name
        self.llmConfig = llmConfig
        self.chain_type = chain_type
        self.history = history
        self.device_type = embedding_device_type
        self.retrieval_device_type = retrieval_device_type
        self.model_loader = EmbeddingModelLoader(
            model_name=self.embedding_model_name, device_type=self.device_type
        )
        self.llm_model_loader = LLMModelLoader(
            llmConfig=self.llmConfig, retrieval_device_type=self.retrieval_device_type
        )
        self.promptTemplate_type = llmConfig.get("modelType")

    def retrieval_qa_pipline(self):
        embeddings = self.model_loader.load_embeddings()

        cache_db_key = (self.clientApiKey, self.persist_directory)
        cached_db_data = qa_cache.get(cache_db_key)

        if cached_db_data:
            retriever = cached_db_data.as_retriever()
        else:
            db = Chroma(
                persist_directory=self.persist_directory, embedding_function=embeddings
            )
            retriever = db.as_retriever()
            qa_cache[cache_db_key] = db

        cache_qa_key = (self.clientApiKey, self.unique_id)
        cache_qa_data = qa_cache.get(cache_qa_key)

        if cache_qa_data:
            qa = cache_qa_data
            return qa
        else:
            # get the prompt template and memory if set by the user.
            prompt, memory = get_prompt_template(
                system_prompt=self.system_prompt,
                promptTemplate_type=self.promptTemplate_type,
                history=self.history,
            )

            # load the llm pipeline
            llm = self.llm_model_loader.load_llm_models()

            if self.history:
                qa = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type=self.chain_type,  # try other chains types as well. refine, map_reduce, map_rerank
                    retriever=retriever,
                    callbacks=callback_manager,
                    return_source_documents=True,  # verbose=True,
                    chain_type_kwargs={"prompt": prompt, "memory": memory},
                )
            else:
                qa = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type=self.chain_type,  # try other chains types as well. refine, map_reduce, map_rerank
                    retriever=retriever,
                    return_source_documents=True,  # verbose=True,
                    callbacks=callback_manager,
                    chain_type_kwargs={
                        "prompt": prompt,
                    },
                )
            qa_cache[cache_qa_key] = qa
            return qa
