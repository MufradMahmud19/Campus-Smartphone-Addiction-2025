# Puhti LLM Connection Guide

This guide explains how to run the LLM service on **CSC Puhti** and connect your **local FastAPI backend** to it via an SSH tunnel.

## Overview

```
Frontend (React)
      ↓
Backend (FastAPI, localhost:8000)
      ↓
SSH tunnel (localhost:8003 → Puhti compute node:8001)
      ↓
Puhti (GPU) — uvicorn + Mistral-7B-Instruct + adapter
```

---

## 1) Run the LLM service on Puhti (GPU node)

> You run the service **inside** an interactive GPU allocation, then start Uvicorn.

```bash
# 1) Request an interactive GPU job
srun -A project_2014961 -p gpu --time=24:00:00 --gres=gpu:v100:1 --cpus-per-task=4 --mem=16G --pty bash

# 2) Load PyTorch (or your module stack)
module load pytorch

# 3) Activate your venv for the LLM
source /projappl/project_2014961/venv/llm/bin/activate

# 4) (Recommended) point caches to scratch (per-user)
export HF_HOME=/scratch/project_2014961/$USER/.cache/huggingface
export TRANSFORMERS_CACHE=$HF_HOME

# 5) Hugging Face token (if needed for gated/model pulls)
export HUGGINGFACE_TOKEN=hf_********************************

# 6) CUDA allocator hints (helps with fragmentation)
export PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True,max_split_size_mb:512,garbage_collection_threshold:0.85"

# 7) Show the actual compute node hostname (use this in your SSH tunnel)
HOSTNAME=$(hostname)
echo "Compute node: $HOSTNAME"

# 8) Start the LLM API (FastAPI/Uvicorn)
#    Your app file on Puhti is 'api.py' with a FastAPI 'app'
python -m uvicorn api:app --host 0.0.0.0 --port 8001
```

**Notes**
- Keep this session running; it hosts the LLM on port **8001** of the compute node.
- The **first request** may take longer while model shards load into GPU memory.

---

## 2) Create an SSH tunnel from your local machine

From your **local machine** (not Puhti):

```bash
# Replace <compute-node> with the printed hostname (e.g., r18g03.bullx)
ssh -L 8003:<compute-node>:8001 puhti
```

- This binds **localhost:8003** (on your machine) to **<compute-node>:8001** (on Puhti).
- Keep this SSH session open while you use the app.

---

## 3) Configure your backend to use the tunnel
# need to implement
Set these environment variables for the FastAPI backend (e.g., in your `backend/.env`):

```env
# LLM base (your local end of the tunnel)
LLM_API_BASE=http://127.0.0.1:8003

# Timeouts & retries (we hardened the client for Puhti warmup)
LLM_API_TIMEOUT=90             # read timeout (first call can be slow)
LLM_API_RETRIES=2              # number of retries on timeout/transport errors
LLM_API_BACKOFF_S=2.0          # exponential backoff base

# Optional fine-grained timeouts
LLM_API_CONNECT_TIMEOUT=10
LLM_API_WRITE_TIMEOUT=20
LLM_API_POOL_TIMEOUT=10

# Startup health gate (backend waits for LLM /healthz)
LLM_HEALTH_RETRIES=24          # ~2 minutes with 5s interval
LLM_HEALTH_INTERVAL=5
```

Then run your backend:

```bash
cd backend
uvicorn app.main:app --reload
```

On startup the backend will:
1. Check the DB and sync questions.
2. **Poll the LLM `/healthz`** until it’s ready (or fail startup if it never becomes ready).
3. Serve endpoints under `http://localhost:8000`.

---

## 4) Quick verification

With the SSH tunnel open and the backend running:

**Health check (through the tunnel):**
```bash
curl http://localhost:8003/healthz
```

**Backend → LLM roundtrip (example):**
```bash
curl -X POST http://localhost:8000/v1/generate   -H "Content-Type: application/json"   -d '{
    "instruction": "Summarize this:",
    "input": "Phones distract me at lectures and I sleep late due to scrolling."
  }'
```

You should get a JSON response containing a generated `output` string.

---

## 5) Common issues & fixes

### A) First call times out (`ReadTimeout`)
- **Cause:** model shards are still loading on Puhti.
- **Fix:** we added retries/backoff and long read timeouts in the backend (`app/llm_client.py`). Just retry the operation; the backend now returns **503/504** with friendly messages if it still can’t reach LLM.

### B) Wrong compute node in SSH tunnel
- Ensure you use the exact node printed by `hostname` inside the GPU shell (e.g., `r18g03.bullx`).
- If the job is rescheduled or ends, the node changes—recreate the tunnel accordingly.

### C) Tunnel not forwarding
- Check you don’t already have something on port **8003** locally.
- Use `-v` with `ssh` for verbose output and confirm the bind:
  ```bash
  ssh -v -L 8003:<compute-node>:8001 puhti
  ```

### D) Hangs or crashes on Puhti
- Check GPU memory: `nvidia-smi`
- Clear/refresh HF cache if corrupted: remove problematic model dirs under `$HF_HOME`.
- Ensure `module load pytorch` matches your venv CUDA/torch versions, or rely entirely on your venv stack.

---

## 6) Operational tips

- **Keep the SSH tunnel window open** while using the app.
- For **long sessions**, consider `tmux` on Puhti to keep the LLM alive:
  ```bash
  tmux new -s llm
  # run uvicorn inside tmux
  # detach: Ctrl-b then d
  ```
- If you restart the LLM, your **first call** will be slower; the backend will retry automatically.

---

## 7) Security

- The tunnel exposes the LLM **only on your local machine** (`127.0.0.1:8003`).
- Never commit tokens (Hugging Face) to the repo.
- Keep your `~/.ssh/id_rsa` private (`chmod 600`).

---

## 8) Quick reference (copy/paste)

**On Puhti (GPU shell):**
```bash
srun -A project_2014961 -p gpu --time=24:00:00 --gres=gpu:v100:1 --cpus-per-task=4 --mem=16G --pty bash
module load pytorch
source /projappl/project_2014961/venv/llm/bin/activate
export HF_HOME=/scratch/project_2014961/$USER/.cache/huggingface
export TRANSFORMERS_CACHE=$HF_HOME
export HUGGINGFACE_TOKEN=hf_********************************
export PYTORCH_CUDA_ALLOC_CONF="expandable_segments:True,max_split_size_mb:512,garbage_collection_threshold:0.85"
HOSTNAME=$(hostname); echo "Compute node: $HOSTNAME"
python -m uvicorn api:app --host 0.0.0.0 --port 8001
```

**On local machine:**
```bash
ssh -L 8003:<compute-node>:8001 puhti
# keep this open
```

**Backend (.env):**
```env
LLM_API_BASE=http://127.0.0.1:8003
LLM_API_TIMEOUT=90
LLM_API_RETRIES=2
LLM_API_BACKOFF_S=2.0
LLM_API_CONNECT_TIMEOUT=10
LLM_API_WRITE_TIMEOUT=20
LLM_API_POOL_TIMEOUT=10
LLM_HEALTH_RETRIES=24
LLM_HEALTH_INTERVAL=5
```
