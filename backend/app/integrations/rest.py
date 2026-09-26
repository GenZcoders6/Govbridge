"""
GovBridge REST/JSON Connector Adapter
SIH26129 Interoperability Foundation
"""
import time
from typing import Any, Dict, Optional
import httpx

from app.integrations.base import BaseConnector, ConnectorResponse


class RestConnector(BaseConnector):
    """
    Adapter for standard REST/JSON government registries and departmental portals.
    Connects to endpoints like Identity Registry, Education Registry, Employment Registry, Welfare Registry.
    """
    PROTOCOL = "REST_JSON"

    def _get_headers(self) -> Dict[str, str]:
        headers = self.authenticate()
        headers["Accept"] = "application/json"
        headers["Content-Type"] = "application/json"
        return headers

    async def health_check(self) -> ConnectorResponse:
        url = f"{self.base_url}/health"
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                data = res.json() if is_json else {"content": res.text}
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"url": url, "method": "GET"},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="RestConnector.health_check", latency_ms=latency)

    async def fetch(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, params=params, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                data = res.json() if is_json else {"content": res.text}
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"url": url, "method": "GET", "params": params or {}},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="RestConnector.fetch", latency_ms=latency)

    async def send(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.post(url, json=payload, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                data = res.json() if is_json else {"content": res.text}
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"url": url, "method": "POST"},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="RestConnector.send", latency_ms=latency)
