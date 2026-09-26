"""
GovBridge Event Bus & Queue Subsystem
SIH26129 Cross-Department Workflow Engine & Event-Driven Processing

Handles:
- Event publishing to Redis channels / stream
- Queue management for retries, failed tasks, and manual review (Redis LPUSH/RPOP)
- Automatic persistence to PostgreSQL `events` table
- Transparent in-memory fallback when Redis is offline in local dev environments
"""
import asyncio
import json
from collections import defaultdict, deque
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis_client import get_redis
from app.models.models import Event, EventSeverity

log = structlog.get_logger()

# ── Event Types Enum / Constants ──────────────────────────────────────────
class EventType:
    APPLICATION_CREATED = "APPLICATION_CREATED"
    WORKFLOW_STARTED = "WORKFLOW_STARTED"
    CONSENT_GRANTED = "CONSENT_GRANTED"
    IDENTITY_VERIFIED = "IDENTITY_VERIFIED"
    EDUCATION_VERIFIED = "EDUCATION_VERIFIED"
    SKILL_VERIFIED = "SKILL_VERIFIED"
    EMPLOYMENT_VERIFIED = "EMPLOYMENT_VERIFIED"
    INCOME_VERIFIED = "INCOME_VERIFIED"
    CONNECTOR_FAILED = "CONNECTOR_FAILED"
    RETRY_STARTED = "RETRY_STARTED"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"
    WORKFLOW_COMPLETED = "WORKFLOW_COMPLETED"
    APPLICATION_COMPLETED = "APPLICATION_COMPLETED"


# ── In-Memory Fallback Queue & Event Bus (when Redis server is not local) ─
class _InMemoryRedisBus:
    def __init__(self):
        self._queues: Dict[str, deque] = defaultdict(deque)
        self._events: List[Dict[str, Any]] = []

    def lpush(self, key: str, value: str):
        self._queues[key].appendleft(value)

    def rpop(self, key: str) -> Optional[str]:
        q = self._queues[key]
        return q.pop() if q else None

    def llen(self, key: str) -> int:
        return len(self._queues[key])

    def lrange(self, key: str, start: int, stop: int) -> List[str]:
        items = list(self._queues[key])
        if stop == -1:
            return items[start:]
        return items[start:stop + 1]

    def record_event(self, event_data: Dict[str, Any]):
        self._events.append(event_data)


_memory_bus = _InMemoryRedisBus()


class EventBus:
    """
    Unified Event Bus and Task Queue manager for GovBridge interoperability workflows.
    """

    CHANNEL = "govbridge:events"
    STREAM_KEY = "govbridge:event_stream"
    QUEUE_PREFIX = "govbridge:queue:"

    @classmethod
    async def publish(
        cls,
        event_type: str,
        payload: Dict[str, Any],
        application_id: Optional[UUID] = None,
        source: str = "workflow_engine",
        severity: EventSeverity = EventSeverity.INFO,
        db: Optional[AsyncSession] = None,
    ) -> Event:
        """
        Publishes event to Redis pub/sub & stream, and persists into PostgreSQL.
        """
        event_id = uuid4()
        timestamp = datetime.now(timezone.utc)

        event_envelope = {
            "id": str(event_id),
            "event_type": event_type,
            "application_id": str(application_id) if application_id else None,
            "source": source,
            "severity": severity.value if hasattr(severity, "value") else str(severity),
            "payload": payload,
            "created_at": timestamp.isoformat(),
        }

        # 1. Publish to Redis (with in-memory fallback)
        try:
            r = await get_redis()
            payload_str = json.dumps(event_envelope, default=str)
            await r.publish(cls.CHANNEL, payload_str)
            await r.lpush(cls.STREAM_KEY, payload_str)
        except Exception:
            # Fallback to local memory bus
            _memory_bus.lpush(cls.STREAM_KEY, json.dumps(event_envelope, default=str))
            _memory_bus.record_event(event_envelope)

        log.info("event.published", event_type=event_type, application_id=str(application_id))

        # 2. Persist to PostgreSQL if db session provided
        db_event = Event(
            id=event_id,
            event_type=event_type,
            source=source,
            severity=severity,
            payload=payload,
            is_processed=True,
            processed_at=timestamp,
            application_id=application_id,
            correlation_id=str(application_id) if application_id else None,
        )

        if db is not None:
            db.add(db_event)
            await db.flush()

        return db_event

    @classmethod
    async def push_queue(cls, queue_name: str, task_data: Dict[str, Any]) -> None:
        """
        Push a task/retry payload into Redis queue (LPUSH)
        """
        key = f"{cls.QUEUE_PREFIX}{queue_name}"
        serialized = json.dumps(task_data, default=str)
        try:
            r = await get_redis()
            await r.lpush(key, serialized)
        except Exception:
            _memory_bus.lpush(key, serialized)
        log.info("queue.push", queue=queue_name, data=task_data.get("task_id") or task_data.get("application_id"))

    @classmethod
    async def pop_queue(cls, queue_name: str) -> Optional[Dict[str, Any]]:
        """
        Pop next task from Redis queue (RPOP)
        """
        key = f"{cls.QUEUE_PREFIX}{queue_name}"
        try:
            r = await get_redis()
            item = await r.rpop(key)
        except Exception:
            item = _memory_bus.rpop(key)

        if item:
            try:
                return json.loads(item)
            except Exception:
                return {"raw": item}
        return None

    @classmethod
    async def get_queue_size(cls, queue_name: str) -> int:
        """
        Return count of items waiting in queue
        """
        key = f"{cls.QUEUE_PREFIX}{queue_name}"
        try:
            r = await get_redis()
            return await r.llen(key)
        except Exception:
            return _memory_bus.llen(key)

    @classmethod
    async def get_queue_items(cls, queue_name: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Peek at pending items in queue
        """
        key = f"{cls.QUEUE_PREFIX}{queue_name}"
        try:
            r = await get_redis()
            raw_items = await r.lrange(key, 0, limit - 1)
        except Exception:
            raw_items = _memory_bus.lrange(key, 0, limit - 1)

        result = []
        for it in raw_items:
            try:
                result.append(json.loads(it))
            except Exception:
                result.append({"raw": it})
        return result
