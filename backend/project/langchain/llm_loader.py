import torch
from huggingface_hub import hf_hub_download
from langchain.llms import LlamaCpp
from transformers import AutoModelForCausalLM, AutoTokenizer, LlamaForCausalLM, LlamaTokenizer, BitsAndBytesConfig, GenerationConfig, pipeline
from langchain.llms import HuggingFacePipeline
from langchain.chat_models import ChatOpenAI
import sys
import os
import logging

if sys.platform != "darwin":
    from auto_gptq import AutoGPTQForCausalLM

current_directory = os.path.join(os.path.dirname(__file__))
project_directory = os.path.join(current_directory, "..", "..","..")
model_dir = os.path.join(project_directory, "LLMModels")

logdir = os.path.join(project_directory, "ai_platform")
log_sttdir = os.path.join(logdir, "logs")
log_file_path = os.path.join(log_sttdir, "logger.log")

# Configure logging settings
logging.basicConfig(
    filename=log_file_path,  # Set the log file name
    level=logging.INFO,  # Set the desired log level (e.g., logging.DEBUG, logging.INFO)
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

class LLMModelLoader:
    def __init__(self, model_id, model_basename, device_type, task, cloudAPIKey, context_window=3900, max_new_tokens=256, temperature=0.1, top_k=50, top_p=0.95, repetition_penalty = 1.15):
        self.model_id = model_id
        self.model_basename = model_basename
        self.device_type = device_type
        self.context_window = context_window
        self.max_new_tokens = max_new_tokens
        self.temperature = temperature
        self.top_k = top_k
        self.top_p = top_p
        self.repetition_penalty = repetition_penalty
        self.MODELS_PATH = model_dir
        self.task = task
        self.cloudAPIKey = cloudAPIKey

    def load_model(self):
        if self.mode == "local":
            if self.model_basename is not None:
                if ".gguf" in self.model_basename.lower():
                    local_llm = self.load_quantized_model_gguf_ggml()
                    return local_llm
                elif ".ggml" in self.model_basename.lower():
                    model, tokenizer = self.load_quantized_model_gguf_ggml()
                elif ".awq" in self.model_basename.lower():
                    model, tokenizer = self.load_quantized_model_awq()
                else:
                    model, tokenizer = self.load_quantized_model_qptq()
            else:
                model, tokenizer = self.load_full_model()

            generation_config = GenerationConfig.from_pretrained(self.model_id, cache_dir = self.MODELS_PATH, resume_download = True)

            pipe = pipeline(
                task = self.task,
                model = model,
                tokenizer = tokenizer,
                max_length = self.max_new_tokens,
                temperature = self.temperature,
                top_p = self.top_p,
                repetition_penalty = self.repetition_penalty,
                generation_config = generation_config,
            )

            local_llm = HuggingFacePipeline(pipeline=pipe)

            return local_llm
        
        if self.mode == "cloud":
            if self.model_basename is not None:
                if "openai" in self.model_basename.lower():
                    cloud_llm = self.load_openai_model()

    def load_quantized_model_gguf_ggml(self):
        try:
            model_path = hf_hub_download(
                repo_id = self.model_id,
                filename = self.model_basename,
                resume_download = True,
                cache_dir = self.MODELS_PATH,
            )
            kwargs = {
                "model_path": model_path,
                "n_ctx": self.context_window,
                "max_tokens": self.max_new_tokens,
                "n_batch": 512,  # set this based on your GPU & CPU RAM
            }
            if self.device_type.lower() == "mps":
                kwargs["n_gpu_layers"] = 1
            if self.device_type.lower() == "cuda":
                kwargs["n_gpu_layers"] = 100  # set this based on your GPU

            return LlamaCpp(**kwargs)
        except TypeError:
            return None
    
    def load_quantized_model_awq(self):
        if sys.platform == "darwin":
            logging.INFO("AWQ models will NOT work on Mac devices. Please choose a different model.")
            return None, None

        # The code supports all huggingface models that ends with AWQ.
        logging.info("Using AutoModelForCausalLM for AWQ quantized models")

        tokenizer = AutoTokenizer.from_pretrained(self.model_id, use_fast=True, resume_download = True, cache_dir = self.MODELS_PATH)

        model = AutoModelForCausalLM.from_pretrained(
            self.model_id,
            cache_dir = self.MODELS_PATH,
            use_safetensors=True,
            resume_download=True,
            trust_remote_code=True,
            device_map="auto",
        )
        return model, tokenizer
    
    def load_quantized_model_qptq(self):
        if sys.platform == "darwin":
            logging.INFO("GPTQ models will NOT work on Mac devices. Please choose a different model.")
            return None, None

        # The code supports all huggingface models that ends with GPTQ and have some variation
        # of .no-act.order or .safetensors in their HF repo.
        logging.info("Using AutoGPTQForCausalLM for quantized models")

        if ".safetensors" in model_basename:
            # Remove the ".safetensors" ending if present
            model_basename = model_basename.replace(".safetensors", "")

        tokenizer = AutoTokenizer.from_pretrained(self.model_id, use_fast=True, cache_dir = self.MODELS_PATH, resume_download = True)
        logging.info("Tokenizer loaded")

        model = AutoGPTQForCausalLM.from_quantized(
            self.model_id,
            model_basename = self.model_basename,
            save_dir = self.MODELS_PATH,
            use_safetensors = True,
            trust_remote_code = True,
            device_map = "auto",
            use_triton = False,
            quantize_config = None
        )
        return model, tokenizer

    def load_full_model(self):
        if self.device_type.lower() in ["mps", "cpu"]:
            logging.info("Using AutoModelForCausalLM")
            model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                torch_dtype = torch.bfloat16,
                device_map = "auto",
                cache_dir = self.MODELS_PATH,
                resume_download = True
            )
            tokenizer = AutoTokenizer.from_pretrained(self.model_id, cache_dir = self.MODELS_PATH, resume_download = True)
        else:
            logging.info("Using AutoModelForCausalLM for full models")
            tokenizer = AutoTokenizer.from_pretrained(self.model_id, cache_dir = self.MODELS_PATH, resume_download = True)
            logging.info("Tokenizer loaded")
            bnb_config = BitsAndBytesConfig(
                    load_in_4bit = True,
                    bnb_4bit_use_double_quant = True,
                    bnb_4bit_quant_type = "nf4",
                    bnb_4bit_compute_dtype = torch.float16
                )
            model = AutoModelForCausalLM.from_pretrained(
                self.model_id,
                device_map = "auto",
                torch_dtype = torch.float16,
                low_cpu_mem_usage = True,
                cache_dir = self.MODELS_PATH,
                resume_download = True,
                trust_remote_code = True,  # set these if you are using NVIDIA GPU
                quantization_config = bnb_config
            )

            model.tie_weights()
        return model, tokenizer

    def load_openai_model(self):
        api_key = os.getenv(self.cloudAPIKey)
        os.environ["OPENAI_API_KEY"] = api_key
        llm = ChatOpenAI(
            temperature=self.temperature,
            model=self.engine,
        )
        return llm