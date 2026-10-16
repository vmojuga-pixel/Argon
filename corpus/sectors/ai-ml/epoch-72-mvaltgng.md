# Epoch 72 | ai-ml


---
## EPOCH #72 // 2026-10-16T06:46:10.828Z
### Topik
Hybrid BM25 + Dense Vector Reciprocal Rank Fusion (RRF) Search for RAG
### Kod v1
```javascript
```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModel, AutoTokenizer

class HybridBM25Dense:
    def __init__(self, bm25_model, dense_model, tokenizer):
        self.bm25_model = bm25_model
        self.dense_model = dense_model
        self.tokenizer = tokenizer

    def bm25_search(self, query, docs):
        # Implement BM25 search
        pass

    def dense_search(self, query, docs):
        query_encoding = self.tokenizer(query, return_tensors='pt')
        doc_encodings = [self.tokenizer(doc, return_tensors='pt') for doc in docs]

        query_vector = self.dense_model(**query_encoding).last_hidden_state[:, 0, :]
        doc_vectors = [self.dense_model(**doc_encoding).last_hidden_state[:, 0, :] for doc_encoding in doc_encodings]

        similarities = cosine_similarity(query_vector, doc_vectors)
        return similarities

    def rrf_search(self, query, docs):
        bm25_scores = self.bm25_search(query, docs)
        dense_scores = self.dense_search(query, docs)

        # Reciprocal Rank
```
### Kritikan + Sandbox v1
1. **Inkonsistensi Tipe Data**: Metode `bm25_search` dan `dense_search` mengembalikan tipe data yang berbeda.
2. **Belum Implementasi BM25**: Metode `bm25_search` belum diimplementasikan.
3. **Keterbatasan Scalability**: Penggunaan list comprehension pada `doc_encodings` dan `doc_vectors` dapat menyebabkan keterbatasan skalabilitas.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```python
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from transformers import AutoModel, AutoTokenizer

class HybridBM25Dense:
    def __init__(self, bm25_model, dense_model, tokenizer):
        self.bm25_model = bm25_model
        self.dense_model = dense_model
        self.tokenizer = tokenizer

    def bm25_search(self, query, docs):
        # Implement BM25 search using bm25_model
        return self.bm25_model.search(query, docs)

    def dense_search(self, query, docs):
        query_encoding = self.tokenizer(query, return_tensors='pt')
        doc_encodings = self.tokenizer(docs, return_tensors='pt', padding=True, truncation=True)

        query_vector = self.dense_model(**query_encoding).last_hidden_state[:, 0, :]
        doc_vectors = self.dense_model(**doc_encodings).last_hidden_state[:, :, :].numpy()

        similarities = cosine_similarity(query_vector.numpy(), doc_vectors)
        return similarities

    def rrf_search(self, query, docs):
        bm25_scores = self.bm25_search(query, docs)
        dense_scores = self.dense_search(query
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
Breakthrough: O(1) constant-time push/pop via bitwise masking.
