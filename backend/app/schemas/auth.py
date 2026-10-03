"""
SentinelIQ – Authentication & RBAC Schemas.
"""

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email_or_username: str = Field(..., description="Analyst/Customer username or email")
    password: str = Field(..., description="Plaintext password")
    role: str | None = Field(None, description="Optional target role filter: 'analyst' or 'customer'")


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str  # "analyst" or "customer"
    customer_id: str | None = None  # populated if role == "customer"
    permissions: list[str] = []


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DemoAccount(BaseModel):
    role: str
    username: str
    email: str
    password: str
    full_name: str
    description: str
