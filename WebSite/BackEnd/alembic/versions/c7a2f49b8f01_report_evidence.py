"""add report evidence

Revision ID: c7a2f49b8f01
Revises: b13a62b1a9d2
Create Date: 2026-01-18
"""

from alembic import op
import sqlalchemy as sa


revision = "c7a2f49b8f01"
down_revision = "b13a62b1a9d2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("reports", sa.Column("evidence", sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column("reports", "evidence")

