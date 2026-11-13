# fastapi imports
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# custom imports
from routes import chat_route
from routes import playbook_route
from routes import auth_route
from routes import vault_route


app = FastAPI(title="PlayGenie")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_route.router, prefix="/api/auth")
app.include_router(vault_route.router, prefix="/api/vault")
app.include_router(chat_route.router, prefix="/api")
app.include_router(playbook_route.router, prefix="/api/playbook")


@app.get("/")
def home():
    return "Hello home page"
