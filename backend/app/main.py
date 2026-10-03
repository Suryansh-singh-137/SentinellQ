from fastapi import FastAPI

app = FastAPI(
    title="SentinelIQ API",
    version="0.1.0",
    description="AI-powered financial risk intelligence platform",
)


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "sentineliq-api",
    }
