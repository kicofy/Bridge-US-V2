"""add reply content field

Revision ID: 9f2b7f9a2f19
Revises: 4b8b2b7e7f2c
Create Date: 2026-01-18
"""

from alembic import op
import sqlalchemy as sa


revision = "9f2b7f9a2f19"
down_revision = "4b8b2b7e7f2c"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "replies",
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
    )


def downgrade() -> None:
    op.drop_column("replies", "content")

