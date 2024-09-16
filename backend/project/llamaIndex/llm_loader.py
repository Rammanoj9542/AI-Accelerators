import torch
from transformers import BitsAndBytesConfig
from llama_index.llms.huggingface import HuggingFaceLLM

class LLMModelLoader:
    def __init__(self, model_name, tokenizer_name, context_window=3900, max_new_tokens=256, temperature=0.7, top_k=50, top_p=0.95):
        self.model_name = model_name
        self.tokenizer_name = tokenizer_name
        self.context_window = context_window
        self.max_new_tokens = max_new_tokens
        self.temperature = temperature
        self.top_k = top_k
        self.top_p = top_p

    def load_model(self):
        quantization_config = BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=torch.float16,
            bnb_4bit_quant_type="nf4",
            bnb_4bit_use_double_quant=True,
        )

        llm = HuggingFaceLLM(
            model_name=self.model_name,
            tokenizer_name=self.tokenizer_name,
            context_window=self.context_window,
            max_new_tokens=self.max_new_tokens,
            model_kwargs={"quantization_config": quantization_config},
            generate_kwargs={"temperature": self.temperature, "top_k": self.top_k, "top_p": self.top_p},
            device_map="auto",
        )
        return llm
