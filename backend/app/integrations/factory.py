"""
GovBridge Connector Factory
Instantiates the appropriate connector adapter according to protocol.
SIH26129 Interoperability Foundation
"""
import socket
from typing import Optional, Union

from app.models.models import Connector, ConnectorProtocol
from app.integrations.base import BaseConnector
from app.integrations.rest import RestConnector
from app.integrations.soap import SoapConnector
from app.integrations.database import DatabaseConnector
from app.integrations.webhook import WebhookConnector


def _resolve_base_url(raw_url: str) -> str:
    """
    Intelligently maps Docker-internal hostnames (mock-identity:8001) to localhost (127.0.0.1:8001)
    when running outside Docker container networks.
    """
    if not raw_url:
        return ""
    url = raw_url
    docker_map = {
        "mock-identity:8001": "127.0.0.1:8001",
        "mock-education:8002": "127.0.0.1:8002",
        "mock-employment:8003": "127.0.0.1:8003",
        "mock-skill:8004": "127.0.0.1:8004",
        "mock-revenue:8005": "127.0.0.1:8005",
        "mock-welfare:8006": "127.0.0.1:8006",
    }
    for docker_host, local_host in docker_map.items():
        if docker_host in url:
            host_name = docker_host.split(":")[0]
            try:
                socket.gethostbyname(host_name)
            except Exception:
                url = url.replace(docker_host, local_host)
    return url


class ConnectorFactory:
    """Factory to produce protocol-specific connector implementations"""

    @staticmethod
    def get_connector(connector: Connector) -> BaseConnector:
        protocol = connector.protocol
        base_url = _resolve_base_url(connector.base_url or "")

        if protocol in (ConnectorProtocol.REST_JSON, "REST_JSON"):
            return RestConnector(
                name=connector.name,
                code=connector.code,
                base_url=base_url,
                timeout_seconds=connector.timeout_seconds,
                auth_type=connector.auth_type,
                config=connector.config or {},
            )
        elif protocol in (ConnectorProtocol.SOAP_XML, "SOAP_XML"):
            return SoapConnector(
                name=connector.name,
                code=connector.code,
                base_url=base_url,
                timeout_seconds=connector.timeout_seconds,
                auth_type=connector.auth_type,
                config=connector.config or {},
            )
        elif protocol in (ConnectorProtocol.DATABASE, "DATABASE"):
            return DatabaseConnector(
                name=connector.name,
                code=connector.code,
                base_url=base_url,
                timeout_seconds=connector.timeout_seconds,
                auth_type=connector.auth_type,
                config=connector.config or {},
            )
        elif protocol in (ConnectorProtocol.WEBHOOK, "WEBHOOK"):
            return WebhookConnector(
                name=connector.name,
                code=connector.code,
                base_url=base_url,
                timeout_seconds=connector.timeout_seconds,
                auth_type=connector.auth_type,
                config=connector.config or {},
            )
        else:
            # Fallback to standard REST connector
            return RestConnector(
                name=connector.name,
                code=connector.code,
                base_url=base_url,
                timeout_seconds=connector.timeout_seconds,
                auth_type=connector.auth_type,
                config=connector.config or {},
            )
