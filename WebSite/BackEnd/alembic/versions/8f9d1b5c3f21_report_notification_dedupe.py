"""add report original status and notification dedupe key

Revision ID: 8f9d1b5c3f21
Revises: 2ad3d1e25b44
Create Date: 2026-01-18
"""

from alembic import op
import sqlalchemy as sa


revision = "8f9d1b5c3f21"
down_revision = "2ad3d1e25b44"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("original_status", sa.String(length=32), nullable=True))
    op.add_column("notifications", sa.Column("dedupe_key", sa.String(length=64), nullable=True))


def downgrade() -> None:
    op.drop_column("notifications", "dedupe_key")
    op.drop_column("reports", "original_status")

