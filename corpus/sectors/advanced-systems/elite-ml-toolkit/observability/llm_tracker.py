import os
import time
from langfuse import Langfuse
from langfuse.decorators import observe, langfuse_context

langfuse = Langfuse(
    public_key=os.getenv("LANGFUSE_PUBLIC_KEY", "pk-lf-replace-me"),
    secret_key=os.getenv("LANGFUSE_SECRET_KEY", "sk-lf-replace-me"),
    host=os.getenv("LANGFUSE_HOST", "https://cloud.langfuse.com")
)

class LLMTracker:
    @observe(name="rag_pipeline_execution", version="1.2.0")
    def process_user_query(self, user_id: str, query: str) -> str:
        # Step 1: Retrieval (mocked)
        with langfuse_context.start_as_current_span("retrieval_step") as retrieval_span:
            retrieval_span.update(input={"query": query})
            time.sleep(0.1)
            context = "Dokumen rahsia: Untung bersih tahun ini RM 5 Juta."
            retrieval_span.update(output={"retrieved_context": context})

        # Step 2: LLM generation (mocked)
        with langfuse_context.start_as_current_span("llm_generation_step") as llm_span:
            llm_span.update(input={"prompt": f"Konteks: {context} Soalan: {query}"})
            time.sleep(0.2)
            answer = "Untung bersih tahun ini RM 5 Juta."
            llm_span.end(
                output={"answer": answer},
                usage={"input": 50, "output": 20, "unit": "TOKENS"},
                model="gpt-4o"
            )

        return answer

if __name__ == "__main__":
    tracker = LLMTracker()
    answer = tracker.process_user_query(
        user_id="user_12345",
        query="Berapa untung syarikat tahun ini?"
    )
    print(f"Answer: {answer}")
    print("Check Langfuse dashboard for trace, latency, cost.")

    langfuse.flush()
