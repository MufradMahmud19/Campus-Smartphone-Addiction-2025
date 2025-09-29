import os
import time
from typing import Any, Dict, Optional, Tuple
import httpx

class LLMClient:
    """
    Async HTTP client with retries/backoff for the Puhti LLM APIs.
    """

    def __init__(self) -> None:
        self.base_url = os.getenv("LLM_API_BASE", "http://127.0.0.1:8003")

        # Timeouts (seconds)
        self.connect_timeout = float(os.getenv("LLM_API_CONNECT_TIMEOUT", "10"))
        self.read_timeout = float(os.getenv("LLM_API_TIMEOUT", "90"))           # long read for shard warmup
        self.write_timeout = float(os.getenv("LLM_API_WRITE_TIMEOUT", "20"))
        self.pool_timeout = float(os.getenv("LLM_API_POOL_TIMEOUT", "10"))

        # Retry policy
        self.retries = int(os.getenv("LLM_API_RETRIES", "2"))                   # total attempts = retries + 1
        self.backoff_s = float(os.getenv("LLM_API_BACKOFF_S", "2.0"))

    def _timeout(self) -> httpx.Timeout:
        return httpx.Timeout(
            connect=self.connect_timeout,
            read=self.read_timeout,
            write=self.write_timeout,
            pool=self.pool_timeout,
        )

    async def _healthz_quiet(self, client: httpx.AsyncClient) -> bool:
        try:
            r = await client.get(f"{self.base_url}/healthz")
            r.raise_for_status()
            return True
        except Exception:
            return False

    async def _post(self, path: str, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        url = f"{self.base_url}{path}"
        attempt = 0
        t0 = time.perf_counter()
        last_exc: Optional[Exception] = None

        async with httpx.AsyncClient(timeout=self._timeout()) as client:
            while True:
                try:
                    r = await client.post(url, json=payload)
                    r.raise_for_status()
                    latency_ms = int((time.perf_counter() - t0) * 1000)
                    return r.json(), latency_ms
                except (httpx.ReadTimeout, httpx.RequestError, httpx.HTTPStatusError) as e:
                    last_exc = e
                    if attempt >= self.retries:
                        raise
                    # If it's a ReadTimeout during warmup, try a quick health probe
                    if isinstance(e, httpx.ReadTimeout):
                        await self._healthz_quiet(client)

                    backoff = self.backoff_s * (2 ** attempt)
                    await asyncio.sleep(backoff)
                    attempt += 1

    async def _get(self, path: str) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        attempt = 0

        async with httpx.AsyncClient(timeout=self._timeout()) as client:
            while True:
                try:
                    r = await client.get(url)
                    r.raise_for_status()
                    return r.json()
                except (httpx.ReadTimeout, httpx.RequestError, httpx.HTTPStatusError) as e:
                    if attempt >= self.retries:
                        raise
                    if isinstance(e, httpx.ReadTimeout):
                        await self._healthz_quiet(client)
                    backoff = self.backoff_s * (2 ** attempt)
                    await asyncio.sleep(backoff)
                    attempt += 1
        
    # -------- Public methods mapping to your LLM API --------

    async def healthz(self) -> Dict[str, Any]:
        return await self._get("/healthz")

    async def generate(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        # maps to /v1/generate on LLM
        return await self._post("/v1/generate", payload)

    async def chat(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        # maps to /v1/chat on LLM
        return await self._post("/v1/chat", payload)

    async def answer_feedback(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        # maps to /v1/survey/answer_feedback on LLM
        return await self._post("/v1/survey/answer_feedback", payload)

    async def final_feedback(self, payload: Dict[str, Any]) -> Tuple[Dict[str, Any], int]:
        # maps to /v1/survey/final_feedback on LLM
        return await self._post("/v1/survey/final_feedback", payload)
