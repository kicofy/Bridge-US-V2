from __future__ import annotations

import logging
import smtplib
import ssl
from email.message import EmailMessage

import anyio
try:
    import certifi
except Exception:  # pragma: no cover - optional dependency
    certifi = None

from app.core.config import settings
from app.core.errors import AppError

logger = logging.getLogger(__name__)

def _resolve_smtp_settings() -> tuple[str | None, int, str | None, str | None, bool, bool, str | None]:
    host = settings.smtp_host or settings.email_smtp_host or settings.email_host
    if settings.smtp_host:
        port = settings.smtp_port
        user = settings.smtp_user
        password = settings.smtp_password
        use_tls = settings.smtp_use_tls
        use_ssl = settings.smtp_use_ssl
    elif settings.email_smtp_host:
        port = settings.email_smtp_port
        user = settings.email_username or settings.email_user
        password = settings.email_password
        secure = (settings.email_smtp_secure or "").lower()
        use_ssl = secure == "ssl"
        use_tls = not use_ssl
    else:
        port = settings.email_port
        user = settings.email_user
        password = settings.email_password
        use_tls = settings.email_use_tls
        use_ssl = settings.email_use_ssl

    sender = settings.smtp_from or settings.email_from or user
    return host, port, user, password, use_tls, use_ssl, sender


def _build_message(to_email: str, subject: str, content: str, html: str | None = None) -> EmailMessage:
    msg = EmailMessage()
    msg["Subject"] = subject
    _, _, user, _, _, _, sender = _resolve_smtp_settings()
    msg["From"] = sender or user or "no-reply@bridge-us.org"
    msg["To"] = to_email
    msg.set_content(content)
    if html:
        msg.add_alternative(html, subtype="html")
    return msg


def _create_ssl_context() -> ssl.SSLContext:
    context = ssl.create_default_context()
    if certifi is not None:
        try:
            context.load_verify_locations(certifi.where())
        except Exception:
            # Fall back to system certs if certifi cannot be loaded
            pass
    return context


def _send_email_sync(to_email: str, subject: str, content: str, html: str | None = None) -> None:
    host, port, user, password, use_tls, use_ssl, _ = _resolve_smtp_settings()
    if not host:
        raise AppError(code="email_not_configured", message="Email not configured", status_code=500)
    msg = _build_message(to_email, subject, content, html)
    masked_password = "set" if password else "empty"
    logger.info(
        "Email send start: host=%s port=%s user=%s tls=%s ssl=%s from=%s to=%s password=%s",
        host,
        port,
        user,
        use_tls,
        use_ssl,
        msg["From"],
        to_email,
        masked_password,
    )

    try:
        if use_ssl:
            context = _create_ssl_context()
            with smtplib.SMTP_SSL(host, port, context=context) as server:
                if user and password:
                    server.login(user, password)
                server.send_message(msg)
        else:
            with smtplib.SMTP(host, port) as server:
                if use_tls:
                    context = _create_ssl_context()
                    server.starttls(context=context)
                if user and password:
                    server.login(user, password)
                server.send_message(msg)
        logger.info("Email send success to=%s subject=%s", to_email, subject)
    except Exception:
        logger.exception("Email send failed to=%s subject=%s", to_email, subject)
        raise


async def send_email(to_email: str, subject: str, content: str, html: str | None = None) -> None:
    await anyio.to_thread.run_sync(_send_email_sync, to_email, subject, content, html)

