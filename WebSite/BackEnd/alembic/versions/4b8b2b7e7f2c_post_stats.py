"""add post stats fields

Revision ID: 4b8b2b7e7f2c
Revises: e0e5817862bd
Create Date: 2026-01-18
"""

from alembic import op
import sqlalchemy as sa


revision = "4b8b2b7e7f2c"
down_revision = "e0e5817862bd"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column("helpful_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "posts",
        sa.Column("accuracy_avg", sa.Float(), nullable=False, server_default=sa.text("0")),
    )
    op.add_column(
        "posts",
        sa.Column("accuracy_count", sa.Integer(), nullable=False, server_default=sa.text("0")),
    )


def downgrade() -> None:
    op.drop_column("posts", "accuracy_count")
    op.drop_column("posts", "accuracy_avg")
    op.drop_column("posts", "helpful_count")

