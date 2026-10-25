from datetime import datetime
from uuid import uuid4

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from models import ConversationMessage, ConversationSession


async def get_or_create_session(
    db: AsyncSession,
    session_id: str | None,
    channel: str,
    external_user_id: str | None,
) -> ConversationSession:
    if session_id:
        result = await db.execute(
            select(ConversationSession).where(ConversationSession.id == session_id)
        )
        session = result.scalar_one_or_none()
        if session:
            session.updated_at = datetime.utcnow()
            return session

    session = ConversationSession(
        id=uuid4().hex,
        channel=channel,
        external_user_id=external_user_id or uuid4().hex,
    )
    db.add(session)
    await db.flush()
    return session


async def save_message(
    db: AsyncSession,
    session_id: str,
    role: str,
    content: str,
    metadata: dict | None = None,
) -> None:
    db.add(
        ConversationMessage(
            session_id=session_id,
            role=role,
            content=content,
            metadata_json=metadata or {},
        )
    )


async def load_recent_messages(
    db: AsyncSession,
    session_id: str,
    limit: int = 12,
) -> list[dict[str, str]]:
    result = await db.execute(
        select(ConversationMessage)
        .where(ConversationMessage.session_id == session_id)
        .order_by(desc(ConversationMessage.created_at), desc(ConversationMessage.id))
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))
    return [{"role": message.role, "content": message.content} for message in messages]
