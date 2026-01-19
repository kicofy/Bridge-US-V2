"""add profile language preference

Revision ID: f2a4c8d1a7b3
Revises: 8f9d1b5c3f21
Create Date: 2026-01-19
"""

from alembic import op
import sqlalchemy as sa


revision = "f2a4c8d1a7b3"
down_revision = "8f9d1b5c3f21"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_cols = {col["name"] for col in inspector.get_columns("profiles")}
    if "language_preference" not in existing_cols:
        op.add_column(
            "profiles",
            sa.Column("language_preference", sa.String(length=8), nullable=False, server_default="en"),
        )
    if bind.dialect.name != "sqlite":
        op.alter_column("profiles", "language_preference", server_default=None)


def downgrade() -> None:
    op.drop_column("profiles", "language_preference")

