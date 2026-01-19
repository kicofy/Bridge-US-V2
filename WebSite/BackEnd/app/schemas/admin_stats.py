from pydantic import BaseModel


class AdminSummaryStats(BaseModel):
    total_users: int
    total_posts: int
    total_replies: int
    pending_reports: int
    resolved_reports: int
    active_today: int


class AdminSeriesPoint(BaseModel):
    label: str
    value: int


class AdminContentActivityPoint(BaseModel):
    label: str
    posts: int
    replies: int


class AdminCategoryPoint(BaseModel):
    name: str
    value: int


class AdminStatsResponse(BaseModel):
    summary: AdminSummaryStats
    user_growth: list[AdminSeriesPoint]
    content_activity: list[AdminContentActivityPoint]
    category_distribution: list[AdminCategoryPoint]

