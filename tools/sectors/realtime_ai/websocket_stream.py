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
    words = ["Ini", "adalah", "jawapan", "AI", "yang", "di-stream", "secara", "real-time", "sayang!"]
    for i, word in enumerate(words):
        await asyncio.sleep(0.1)
        is_last = (i == len(words) - 1)
        yield json.dumps({"token": word + " ", "is_last": is_last})

@app.websocket("/ws/v1/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")
    try:
        while True:
            data = await websocket.receive_text()
            request = StreamRequest.model_validate_json(data)
            async for chunk in mock_llm_stream(request.prompt, request.max_tokens):
                await websocket.send_text(chunk)
    except WebSocketDisconnect:
        print("Client disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))
