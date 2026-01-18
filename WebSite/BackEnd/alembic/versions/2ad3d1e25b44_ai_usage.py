"""add ai usage tracking

Revision ID: 2ad3d1e25b44
Revises: c7a2f49b8f01
Create Date: 2026-01-18
"""

from alembic import op
import sqlalchemy as sa


revision = "2ad3d1e25b44"
down_revision = "c7a2f49b8f01"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "ai_usages",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=False),
        sa.Column("usage_date", sa.Date(), nullable=False),
        sa.Column("count", sa.Integer(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )


def downgrade() -> None:
    op.drop_table("ai_usages")

