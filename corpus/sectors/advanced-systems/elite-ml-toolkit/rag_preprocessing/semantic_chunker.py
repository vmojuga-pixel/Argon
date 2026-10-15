import numpy as np
from typing import List, Dict
from sentence_transformers import SentenceTransformer
from sklearn.metrics import pairwise_distances

class SemanticChunker:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2", threshold_percentile: int = 80):
        self.model = SentenceTransformer(model_name)
        self.threshold_percentile = threshold_percentile

    def chunk_by_semantics(self, text: str, max_chunk_length: int = 1000) -> List[Dict]:
        # Split at sentence level
        import nltk
        nltk.download('punkt', quiet=True)
        sentences = nltk.sent_tokenize(text)

        if len(sentences) <= 1:
            return [{"text": text, "chunk_id": 0}]

        # Embed each sentence
        embeddings = self.model.encode(sentences)

        # Cosine distance between consecutive sentences
        distances = pairwise_distances(
            embeddings[:-1], embeddings[1:], metric='cosine'
        ).diagonal()

        # Threshold for split (e.g. 80th percentile)
        threshold = np.percentile(distances, self.threshold_percentile)

        chunks = []
        current_chunk = [sentences[0]]
        current_length = len(sentences[0])

        for i, distance in enumerate(distances):
            next_sentence = sentences[i + 1]

            if distance > threshold or (current_length + len(next_sentence)) > max_chunk_length:
                chunks.append({
                    "text": " ".join(current_chunk).strip(),
                    "chunk_id": len(chunks)
                })
                current_chunk = [next_sentence]
                current_length = len(next_sentence)
            else:
                current_chunk.append(next_sentence)
                current_length += len(next_sentence)

        if current_chunk:
            chunks.append({
                "text": " ".join(current_chunk).strip(),
                "chunk_id": len(chunks)
            })

        return chunks

if __name__ == "__main__":
    text = ("FastAPI adalah framework web yang sangat laju. "
            "Ia dibina di atas Starlette dan Pydantic. "
            "Machine learning memerlukan data yang bersih. "
            "Data yang kotor akan menghasilkan model yang buruk.")
    chunker = SemanticChunker()
    results = chunker.chunk_by_semantics(text)

    for i, chunk in enumerate(results):
        print(f"--- Chunk {i} ---")
        print(chunk["text"])
        print()
