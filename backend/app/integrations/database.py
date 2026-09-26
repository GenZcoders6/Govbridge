"""
GovBridge Database Connector Adapter
Simulates direct database / registry connector integration for legacy SQL data sources.
SIH26129 Interoperability Foundation
"""
import time
from typing import Any, Dict, Optional
import httpx

from app.integrations.base import BaseConnector, ConnectorResponse


class DatabaseConnector(BaseConnector):
    """
    Adapter simulating direct database query integration for departments that expose
    read-only DB views / database gateways (e.g. Revenue & Land records).
    In this interoperability layer, queries are routed through the simulated database service gateway.
    """
    PROTOCOL = "DATABASE"

    def _get_headers(self) -> Dict[str, str]:
        headers = self.authenticate()
        headers["Accept"] = "application/json"
        headers["X-Database-Connection-Pool"] = "GovBridge-Pooled-Gateway"
        return headers

    async def health_check(self) -> ConnectorResponse:
        url = f"{self.base_url}/health"
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                data = res.json() if "application/json" in res.headers.get("content-type", "") else {"raw": res.text}
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"connector_type": "database_adapter", "url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="DatabaseConnector.health_check", latency_ms=latency)

    async def fetch(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, params=params, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                data = res.json() if "application/json" in res.headers.get("content-type", "") else res.text
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"query_simulation": True, "url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="DatabaseConnector.fetch", latency_ms=latency)

    async def send(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.post(url, json=payload, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                data = res.json() if "application/json" in res.headers.get("content-type", "") else res.text
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"statement": "INSERT/UPDATE simulation", "url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="DatabaseConnector.send", latency_ms=latency)
