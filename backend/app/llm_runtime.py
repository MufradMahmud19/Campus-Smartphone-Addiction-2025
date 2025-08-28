import os
import threading
from typing import List, Dict, Optional

import torch
from transformers import (
    AutoTokenizer,
    AutoModelForCausalLM,
    BitsAndBytesConfig,
    GenerationConfig,
)
from peft import PeftModel


# ----------- Config via env or sensible defaults -----------
BASE_MODEL = os.getenv("BASE_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")
ADAPTER_DIR = os.getenv(
    "ADAPTER_DIR",
    os.path.join(os.path.dirname(__file__), "..", "modelsllm"),
)
HF_HOME = os.getenv("HF_HOME", None)  # you can set this in Docker to mount/cache
LOAD_4BIT = os.getenv("LOAD_4BIT", "1") == "1"  # set LOAD_4BIT=0 to force full precision
# Force CPU disables CUDA entirely regardless of availability
FORCE_CPU = os.getenv("FORCE_CPU", "0") == "1"
DTYPE = torch.float16
HF_TOKEN = os.getenv("HF_TOKEN") or os.getenv("HUGGING_FACE_HUB_TOKEN")

# Generation defaults
GEN_MAX_NEW_TOKENS = int(os.getenv("GEN_MAX_NEW_TOKENS", "256"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.2"))
TOP_P = float(os.getenv("TOP_P", "0.9"))
TOP_K = int(os.getenv("TOP_K", "50"))
REPETITION_PENALTY = float(os.getenv("REPETITION_PENALTY", "1.1"))

# Singleton state
_model_lock = threading.Lock()
_model = None
_tokenizer = None


def _quant_config(use_cuda: bool) -> Optional[BitsAndBytesConfig]:
    if not LOAD_4BIT or not use_cuda:
        return None
    try:
        return BitsAndBytesConfig(
            load_in_4bit=True,
            bnb_4bit_compute_dtype=DTYPE,
            bnb_4bit_use_double_quant=True,
            bnb_4bit_quant_type="nf4",
        )
    except Exception:
        # bitsandbytes not available → fall back to no quant
        return None


def load_model() -> None:
    """Idempotent loader for base + LoRA adapter."""
    global _model, _tokenizer
    if _model is not None and _tokenizer is not None:
        return
    with _model_lock:
        if _model is not None and _tokenizer is not None:
            return

        # Decide execution device
        use_cuda = torch.cuda.is_available() and not FORCE_CPU
        if not use_cuda:
            os.environ["CUDA_VISIBLE_DEVICES"] = ""

        # Use fp32 on CPU to avoid unsupported fp16 ops
        dtype = DTYPE if use_cuda else torch.float32

        qconf = _quant_config(use_cuda)

        if HF_HOME:
            os.environ["HF_HOME"] = HF_HOME

        token_kwargs = {"token": HF_TOKEN} if HF_TOKEN else {}

        _tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL, use_fast=True, **token_kwargs)
        if _tokenizer.pad_token is None:
            _tokenizer.pad_token = _tokenizer.eos_token
        _tokenizer.padding_side = "right"

        _model = AutoModelForCausalLM.from_pretrained(
            BASE_MODEL,
            device_map=("auto" if use_cuda else None),
            quantization_config=qconf,
            torch_dtype=dtype,
            low_cpu_mem_usage=not use_cuda,
            **token_kwargs,
        )
        _model = PeftModel.from_pretrained(_model, ADAPTER_DIR)
        if not use_cuda:
            _model = _model.to("cpu")
        _model.eval()


def generate_text(prompt: str, max_new_tokens: Optional[int] = None, **overrides) -> str:
    """Simple single-turn text generation."""
    load_model()
    max_new = max_new_tokens or GEN_MAX_NEW_TOKENS

    gen_cfg = GenerationConfig(
        max_new_tokens=max_new,
        temperature=overrides.get("temperature", TEMPERATURE),
        top_p=overrides.get("top_p", TOP_P),
        top_k=overrides.get("top_k", TOP_K),
        repetition_penalty=overrides.get("repetition_penalty", REPETITION_PENALTY),
        do_sample=overrides.get("do_sample", False),
        pad_token_id=_tokenizer.eos_token_id,
        eos_token_id=_tokenizer.eos_token_id,
    )

    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)
    with torch.no_grad():
        out = _model.generate(**inputs, generation_config=gen_cfg)
    return _tokenizer.decode(out[0], skip_special_tokens=True)


def chat_completion(
    messages: List[Dict[str, str]],
    max_new_tokens: Optional[int] = None,
    **overrides,
) -> str:
    """
    Chat endpoint helper. 'messages' is a list of {role: system|user|assistant, content: str}.
    """
    load_model()
    max_new = max_new_tokens or GEN_MAX_NEW_TOKENS

    prompt = _tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
    )

    gen_cfg = GenerationConfig(
        max_new_tokens=max_new,
        temperature=overrides.get("temperature", TEMPERATURE),
        top_p=overrides.get("top_p", TOP_P),
        top_k=overrides.get("top_k", TOP_K),
        repetition_penalty=overrides.get("repetition_penalty", REPETITION_PENALTY),
        do_sample=overrides.get("do_sample", False),
        pad_token_id=_tokenizer.eos_token_id,
        eos_token_id=_tokenizer.eos_token_id,
    )

    inputs = _tokenizer(prompt, return_tensors="pt").to(_model.device)
    with torch.no_grad():
        out = _model.generate(**inputs, generation_config=gen_cfg)
    text = _tokenizer.decode(out[0], skip_special_tokens=True)

    return text.split("[/INST]")[-1].strip()


