
---
## OVERLORD EPOCH #42 // 2026-10-15T07:45:10.356Z
- Topic: Hybrid BM25 + Dense Vector Reciprocal Rank Fusion (RRF) Search for RAG
- Services: 1

```javascript
Untuk implementasi pencarian hibrid BM25 + Dense Vector dengan menggunakan Reciprocal Rank Fusion (RRF) untuk Retrieval Augmented Generation (RAG), kita akan menggunakan library seperti `transformers` untuk model bahasa, `sentence-transformers` untuk dense vector, dan `rank_bm25` untuk perhitungan skor BM25. Berikut adalah contoh kode dasar untuk implementasi ini:

### Langkah 1: Instalasi Library

Pastikan Anda telah menginstal library yang diperlukan:

```bash
pip install transformers sentence-transformers rank_bm25
```

### Langkah 2: Implementasi

```python
import numpy as np
from sentence_transformers import SentenceTransformer
from rank_bm25 import BM25Okapi
from transformers import AutoModelForSequenceClassification, AutoTokenizer

class HybridBM25DenseVectorRRFSearch:
    def __init__(self, 
                 bm25_corpus=None, 
                 dense_model_name="sentence-transformers/all-MiniLM-L6-v2"):
        self.dense_model = SentenceTransformer(dense_model_name)
        self.bm25 = BM25Okapi(bm25_corpus)
        
    def get_dense_vectors(self, queries):
        return self.dense_model.encode(queries)
    
    def get_bm25_scores(self, query):
        return self.bm25.get_scores(query)
    
    def reciprocal_rank_fusion(self, scores_bm25, scores_dense, k=60):
        # Normalisasi skor
        scores_bm25_normalized = (scores_bm25 - np.min(scores_bm25)) / (np.max(scores_bm25) - np.min(scores_bm25) + 1e-10)
        scores_dense_normalized = (scores_dense - np.min(scores_dense)) / (np.max(scores_dense) - np.min(scores_dense) + 1e-10)
        
        # RRF
        fused_scores = []
        for i in range(len(scores_bm25)):
            score_bm25 = scores_bm25_normalized[i]
            score_dense = scores_dense_normalized[i]
            fused_score = 1 / ((1/k) * (1/score_bm25 + 1/score_dense))
            fused_scores.append(fused_score)
        return fused_scores

# Contoh penggunaan
if __name__ == "__main__":
    corpus = ["Contoh dokumen 1", "Contoh dokumen 2", "Contoh dokumen 3"]
    query = ["Contoh query pencarian"]
    
    hybrid_search = HybridBM25DenseVectorRRFSearch(corpus)
    
    # Skor BM25
    scores_bm25 = hybrid_search.get_bm25_scores(query[0])
    
    # Skor Dense Vector
    query_vector = hybrid_search.get_dense_vectors(query)
    corpus_vectors = hybrid_search.get_dense_vectors(corpus)
    scores_dense = np.dot(corpus_vectors, query_vector[0]) / (np.linalg.norm(corpus_vectors, axis=1) * np.linalg.norm(query_vector[0]))
    
    # Fusi dengan RRF
    fused_scores = hybrid_search.reciprocal_rank_fusion(scores_bm25, scores_dense)
    
    # Tampilkan hasil
    print("Hasil Pencarian:")
    for i, score in enumerate(fused_scores):
        print(f"Doc {i+1}: {corpus[i]} - Skor: {score}")
```

Kode di atas merupakan contoh dasar dan mungkin memerlukan penyesuaian tergantung pada kasus penggunaan spesifik Anda, seperti penyesuaian model, preprocessing teks, dan lain-lain. Pastikan untuk menyesuaikan dependensi dan envi
```
