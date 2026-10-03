"""
SentinelIQ – Authentication & RBAC API Routes.
Provides role-based login for Analysts (Dashboard access) and Customers (Shop & Retail Checkout access).
"""

from fastapi import APIRouter, Depends, HTTPException, Header, status
from typing import Annotated

from app.core.security import create_access_token, decode_access_token
from app.schemas.auth import DemoAccount, LoginRequest, LoginResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

# ── In-Memory Demo Users Store ────────────────────────────────
DEMO_USERS: dict[str, dict] = {
    "analyst": {
        "id": "usr-analyst-001",
        "username": "analyst",
        "email": "analyst@sentineliq.ai",
        "password": "analyst123",
        "full_name": "Elena Vance (Lead Risk Analyst)",
        "role": "analyst",
        "customer_id": None,
        "permissions": [
            "dashboard:view",
            "cases:investigate",
            "cases:action",
            "mule:graph",
            "loans:restructure",
            "governance:manage",
        ],
        "description": "Risk Operations Lead with full clearance to case queues, model metrics, and network graph.",
    },
    "customer": {
        "id": "usr-cust-001",
        "username": "customer",
        "email": "customer@sentineliq.ai",
        "password": "customer123",
        "full_name": "Aarav Sharma",
        "role": "customer",
        "customer_id": "CUST-001",
        "permissions": [
            "shop:view",
            "shop:checkout",
            "transactions:history",
            "step_up:confirm",
        ],
        "description": "Retail Banking Customer with access to e-commerce checkout, UPI pre-check, and personal safety hub.",
    },
}


def _find_user(email_or_username: str, role_hint: str | None = None) -> dict | None:
    query = email_or_username.strip().lower()
    for user in DEMO_USERS.values():
        if user["username"].lower() == query or user["email"].lower() == query:
            if role_hint and user["role"].lower() != role_hint.lower():
                continue
            return user
    # Fallback convenience match: if querying "analyst" or "customer"
    if query in DEMO_USERS:
        return DEMO_USERS[query]
    return None


@router.post("/login", response_model=LoginResponse)
async def login(payload: LoginRequest):
    """
    Authenticate analyst or customer credentials.
    Returns signed JWT access token and user role profile.
    """
    user = _find_user(payload.email_or_username, payload.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or email address",
        )

    if payload.password != user["password"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password. For testing, use password provided in demo credentials.",
        )

    # Encode token with user info and role
    token_claims = {
        "sub": user["id"],
        "username": user["username"],
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "customer_id": user.get("customer_id"),
        "permissions": user["permissions"],
    }
    access_token = create_access_token(data=token_claims)

    user_resp = UserResponse(
        id=user["id"],
        username=user["username"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        customer_id=user.get("customer_id"),
        permissions=user["permissions"],
    )

    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_resp,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(authorization: Annotated[str | None, Header()] = None):
    """
    Validate token and return current session user with role permissions.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
        )

    token = authorization.split("Bearer ", 1)[1].strip()
    claims = decode_access_token(token)
    if not claims or "sub" not in claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token expired or invalid",
        )

    return UserResponse(
        id=claims["sub"],
        username=claims.get("username", "unknown"),
        email=claims.get("email", ""),
        full_name=claims.get("full_name", ""),
        role=claims.get("role", "customer"),
        customer_id=claims.get("customer_id"),
        permissions=claims.get("permissions", []),
    )


@router.get("/demo-accounts", response_model=list[DemoAccount])
async def list_demo_accounts():
    """
    Returns available mock accounts for analyst and customer quick login.
    """
    return [
        DemoAccount(
            role=u["role"],
            username=u["username"],
            email=u["email"],
            password=u["password"],
            full_name=u["full_name"],
            description=u["description"],
        )
        for u in DEMO_USERS.values()
    ]
