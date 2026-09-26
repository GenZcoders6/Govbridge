"""
GovBridge Webhook Connector Adapter
Handles push-based integrations, asynchronous event notifications, and external webhook triggers.
SIH26129 Interoperability Foundation
"""
import hmac
import hashlib
import json
import time
from typing import Any, Dict, Optional
import httpx

from app.integrations.base import BaseConnector, ConnectorResponse


class WebhookConnector(BaseConnector):
    """
    Adapter for asynchronous push notifications and webhook callbacks to external departmental systems.
    Supports HMAC-SHA256 signature generation and delivery status verification.
    """
    PROTOCOL = "WEBHOOK"

    def _sign_payload(self, payload: bytes) -> str:
        secret = self.config.get("webhook_secret", "govbridge-default-signing-key")
        return hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

    async def health_check(self) -> ConnectorResponse:
        """
        Check if the webhook receiver URL endpoint is reachable.
        """
        url = f"{self.base_url}/health" if self.base_url else self.config.get("target_url", "")
        if not url:
            return ConnectorResponse(
                success=True,
                status_code=200,
                data={"status": "ready", "mode": "push_only"},
                source_protocol=self.PROTOCOL,
            )
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url)
                latency = int((time.monotonic() - start) * 1000)
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data={"target_reachable": res.status_code < 400, "status_code": res.status_code},
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="WebhookConnector.health_check", latency_ms=latency)

    async def fetch(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        """
        Webhooks are primarily push-based; fetching acts as a polling mechanism or callback status verification.
        """
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, params=params)
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=res.json() if is_json else {"content": res.text},
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="WebhookConnector.fetch", latency_ms=latency)

    async def send(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        """
        Deliver signed webhook payload to destination listener.
        """
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            body_bytes = json.dumps(payload, default=str).encode("utf-8")
            signature = self._sign_payload(body_bytes)
            headers = self.authenticate()
            headers.update({
                "Content-Type": "application/json",
                "X-GovBridge-Signature": f"sha256={signature}",
                "X-GovBridge-Event": payload.get("event_type", "data.exchange"),
            })
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.post(url, content=body_bytes, headers=headers)
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=res.json() if is_json else {"content": res.text},
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"signature": f"sha256={signature[:8]}...", "url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="WebhookConnector.send", latency_ms=latency)
