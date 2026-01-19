import uuid

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)

from app.models.base import Base


def uuid_str():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=uuid_str)
    email = Column(String(255), unique=True, nullable=True)
    phone = Column(String(32), unique=True, nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(32), default="user", nullable=False)
    status = Column(String(32), default="active", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False)
    device_info = Column(String(255), nullable=True)
    ip = Column(String(64), nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class EmailVerificationCode(Base):
    __tablename__ = "email_verification_codes"

    id = Column(String(36), primary_key=True, default=uuid_str)
    email = Column(String(255), nullable=False)
    purpose = Column(String(32), nullable=False)
    code = Column(String(12), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AIUsage(Base):
    __tablename__ = "ai_usages"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    usage_date = Column(Date, nullable=False)
    count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Profile(Base):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    display_name = Column(String(100), nullable=False)
    avatar_url = Column(String(512), nullable=True)
    school_level = Column(String(32), nullable=True)
    location = Column(String(100), nullable=True)
    bio = Column(Text, nullable=True)
    language_preference = Column(String(8), default="en", nullable=False)
    credibility_score = Column(Integer, default=0, nullable=False)
    helpfulness_score = Column(Integer, default=0, nullable=False)
    accuracy_score = Column(Integer, default=0, nullable=False)
    badges = Column(JSON, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class File(Base):
    __tablename__ = "files"

    id = Column(String(36), primary_key=True, default=uuid_str)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    purpose = Column(String(32), nullable=False)
    url = Column(String(1024), nullable=False)
    mime = Column(String(128), nullable=True)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deleted_at = Column(DateTime(timezone=True), nullable=True)


class VerificationRequest(Base):
    __tablename__ = "verification_requests"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    status = Column(String(32), default="pending", nullable=False)
    docs_file_id = Column(String(36), ForeignKey("files.id"), nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, default=uuid_str)
    name = Column(String(64), nullable=False)
    slug = Column(String(64), unique=True, nullable=False)
    sort_order = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="active", nullable=False)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=uuid_str)
    name = Column(String(64), nullable=False)
    slug = Column(String(64), unique=True, nullable=False)


class Post(Base):
    __tablename__ = "posts"

    id = Column(String(36), primary_key=True, default=uuid_str)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    category_id = Column(String(36), ForeignKey("categories.id"), nullable=True)
    original_language = Column(String(8), default="en", nullable=False)
    status = Column(String(32), default="draft", nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    accuracy_avg = Column(Float, default=0, nullable=False)
    accuracy_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    published_at = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PostTranslation(Base):
    __tablename__ = "post_translations"
    __table_args__ = (UniqueConstraint("post_id", "language"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    language = Column(String(8), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    translated_by = Column(String(32), default="ai", nullable=False)
    model = Column(String(64), nullable=True)
    status = Column(String(32), default="ready", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Reply(Base):
    __tablename__ = "replies"

    id = Column(String(36), primary_key=True, default=uuid_str)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    author_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    status = Column(String(32), default="visible", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class ReplyTranslation(Base):
    __tablename__ = "reply_translations"
    __table_args__ = (UniqueConstraint("reply_id", "language"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    reply_id = Column(String(36), ForeignKey("replies.id"), nullable=False)
    language = Column(String(8), nullable=False)
    content = Column(Text, nullable=False)
    translated_by = Column(String(32), default="ai", nullable=False)
    status = Column(String(32), default="ready", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PostTag(Base):
    __tablename__ = "post_tags"

    post_id = Column(String(36), ForeignKey("posts.id"), primary_key=True)
    tag_id = Column(String(36), ForeignKey("tags.id"), primary_key=True)


class HelpfulnessVote(Base):
    __tablename__ = "helpfulness_votes"
    __table_args__ = (UniqueConstraint("user_id", "target_type", "target_id"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String(36), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AccuracyFeedback(Base):
    __tablename__ = "accuracy_feedbacks"
    __table_args__ = (UniqueConstraint("user_id", "post_id"),)

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class PostView(Base):
    __tablename__ = "post_views"

    id = Column(String(36), primary_key=True, default=uuid_str)
    post_id = Column(String(36), ForeignKey("posts.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    ip = Column(String(64), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class SavedPost(Base):
    __tablename__ = "saved_posts"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    post_id = Column(String(36), ForeignKey("posts.id"), primary_key=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=uuid_str)
    reporter_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String(36), nullable=False)
    reason = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    original_status = Column(String(32), nullable=True)
    status = Column(String(32), default="pending", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)


class ModerationAction(Base):
    __tablename__ = "moderation_actions"

    id = Column(String(36), primary_key=True, default=uuid_str)
    moderator_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String(36), nullable=False)
    action = Column(String(32), nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ModerationLog(Base):
    __tablename__ = "moderation_logs"

    id = Column(String(36), primary_key=True, default=uuid_str)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String(36), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    risk_score = Column(Integer, nullable=False, default=0)
    labels = Column(JSON, nullable=True)
    decision = Column(String(16), nullable=False)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Appeal(Base):
    __tablename__ = "appeals"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_type = Column(String(16), nullable=False)
    target_id = Column(String(36), nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String(16), default="pending", nullable=False)
    reviewer_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=uuid_str)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    type = Column(String(64), nullable=False)
    dedupe_key = Column(String(64), nullable=True)
    payload = Column(JSON, nullable=True)
    read_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


__all__ = [
    "User",
    "UserSession",
    "EmailVerificationCode",
    "AIUsage",
    "Profile",
    "File",
    "VerificationRequest",
    "Category",
    "Tag",
    "Post",
    "PostTranslation",
    "Reply",
    "ReplyTranslation",
    "PostTag",
    "HelpfulnessVote",
    "AccuracyFeedback",
    "PostView",
    "SavedPost",
    "Report",
    "ModerationAction",
    "ModerationLog",
    "Appeal",
    "Notification",
]

