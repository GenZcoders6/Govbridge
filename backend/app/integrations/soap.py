"""
GovBridge SOAP/XML Connector Adapter
Handles communication with legacy XML/SOAP systems and transforms XML payloads into JSON structures.
SIH26129 Interoperability Foundation
"""
import time
from typing import Any, Dict, Optional
import httpx

try:
    from lxml import etree
except ImportError:
    import xml.etree.ElementTree as etree

from app.integrations.base import BaseConnector, ConnectorResponse


def _xml_to_dict(element) -> Any:
    """Recursively convert an XML element tree to a Python dictionary, stripping namespaces"""
    children = list(element)
    tag_clean = element.tag.split("}")[-1] if "}" in element.tag else element.tag

    if not children:
        text = element.text
        return text.strip() if text is not None else None

    result: Dict[str, Any] = {}
    for child in children:
        child_tag = child.tag.split("}")[-1] if "}" in child.tag else child.tag
        child_data = _xml_to_dict(child)

        if child_tag in result:
            if isinstance(result[child_tag], list):
                result[child_tag].append(child_data)
            else:
                result[child_tag] = [result[child_tag], child_data]
        else:
            result[child_tag] = child_data
    return result


class SoapConnector(BaseConnector):
    """
    Adapter for legacy government systems that communicate over SOAP/XML.
    Interprets SOAP envelopes, parses XML data, and maps it to standard GovBridge payloads.
    """
    PROTOCOL = "SOAP_XML"

    def _get_headers(self) -> Dict[str, str]:
        headers = self.authenticate()
        headers["Accept"] = "application/xml, text/xml, application/json"
        return headers

    async def health_check(self) -> ConnectorResponse:
        url = f"{self.base_url}/health"
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)
                is_json = "application/json" in res.headers.get("content-type", "")
                data = res.json() if is_json else {"raw": res.text}
                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=data,
                    raw_response=res.text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="SoapConnector.health_check", latency_ms=latency)

    async def fetch(self, path: str, params: Optional[Dict[str, Any]] = None) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.get(url, params=params, headers=self._get_headers())
                latency = int((time.monotonic() - start) * 1000)

                parsed_data = None
                raw_text = res.text
                if raw_text.strip().startswith("<"):
                    try:
                        root = etree.fromstring(res.content)
                        parsed_data = _xml_to_dict(root)
                    except Exception as parse_err:
                        parsed_data = {"raw_xml": raw_text, "parse_error": str(parse_err)}
                elif "application/json" in res.headers.get("content-type", ""):
                    parsed_data = res.json()

                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=parsed_data or {"content": raw_text},
                    raw_response=raw_text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"transformation": "xml_to_dict", "url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="SoapConnector.fetch", latency_ms=latency)

    async def send(self, path: str, payload: Dict[str, Any]) -> ConnectorResponse:
        clean_path = path.lstrip("/")
        url = f"{self.base_url}/{clean_path}" if self.base_url else path
        start = time.monotonic()
        try:
            # Build minimal SOAP envelope wrapper
            soap_body = "".join(f"<{k}>{v}</{k}>" for k, v in payload.items())
            soap_envelope = (
                f'<?xml version="1.0" encoding="utf-8"?>'
                f'<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">'
                f'<soap:Body>{soap_body}</soap:Body>'
                f'</soap:Envelope>'
            )
            headers = self.authenticate()
            headers.update({
                "Content-Type": "text/xml; charset=utf-8",
                "SOAPAction": '""',
                "Accept": "application/xml, text/xml",
            })
            async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
                res = await client.post(url, content=soap_envelope, headers=headers)
                latency = int((time.monotonic() - start) * 1000)
                parsed_data = None
                raw_text = res.text
                if raw_text.strip().startswith("<"):
                    try:
                        root = etree.fromstring(res.content)
                        parsed_data = _xml_to_dict(root)
                    except Exception as parse_err:
                        parsed_data = {"raw_xml": raw_text, "parse_error": str(parse_err)}
                elif "application/json" in res.headers.get("content-type", ""):
                    parsed_data = res.json()

                return ConnectorResponse(
                    success=res.status_code < 400,
                    status_code=res.status_code,
                    data=parsed_data or {"content": raw_text},
                    raw_response=raw_text,
                    latency_ms=latency,
                    source_protocol=self.PROTOCOL,
                    metadata={"url": url},
                )
        except Exception as e:
            latency = int((time.monotonic() - start) * 1000)
            return self.handle_error(e, context="SoapConnector.send", latency_ms=latency)
