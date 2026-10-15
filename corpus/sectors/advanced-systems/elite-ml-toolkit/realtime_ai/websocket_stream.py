import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import AsyncGenerator

app = FastAPI(title="Real-Time AI WebSocket Server")

class StreamRequest(BaseModel):
    user_id: str
    prompt: str
    max_tokens: int = 256

async def mock_llm_stream(prompt: str, max_tokens: int) -> AsyncGenerator[str, None]:
    """Mock streaming. Replace with vLLM/OpenAI async client in production."""
    words = ["Ini", "adalah", "jawapan", "AI", "yang", "di-stream", "real-time."]
    for i, word in enumerate(words):
        await asyncio.sleep(0.1)
        is_last = (i == len(words) - 1)
        yield json.dumps({"token": word + " ", "is_last": is_last})

@app.websocket("/ws/v1/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    print("CLIENT CONNECTED")

    try:
        while True:
            data = await websocket.receive_text()
            request = StreamRequest.model_validate_json(data)

            async for chunk in mock_llm_stream(request.prompt, request.max_tokens):
                await websocket.send_text(chunk)

    except WebSocketDisconnect:
        print("CLIENT DISCONNECTED")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))

# Run: uvicorn realtime_ai.websocket_stream:app --reload
