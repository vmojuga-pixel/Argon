# Epoch 61 | ai-ml


---
## EPOCH #61 // 2026-10-16T04:31:38.351Z
### Topik
Production RAG Pipeline with Deterministic Vector Embeddings, Semantic Caching & AI Safety Guardrails
### Kod v1
```javascript
```python
import numpy as np
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, jsonify

app = Flask(__name__)

# Production RAG Pipeline
model = SentenceTransformer('all-MiniLM-L6-v2')

def semantic_search(query, corpus):
    query_embedding = model.encode(query)
    corpus_embeddings = model.encode(corpus)
    cos_scores = util.cos_sim(query_embedding, corpus_embeddings)
    return np.argmax(cos_scores)

# Semantic caching
cache = {}

def cached_semantic_search(query, corpus):
    if query in cache:
        return cache[query]
    else:
        result = semantic_search(query, corpus)
        cache[query] = result
        return result

# AI Safety Guardrails
def safety_guardrails(input_text):
    # Implement safety guardrails logic here
    return input_text

@app.route('/search', methods=['POST'])
def search():
    query = request.json['query']
    corpus = request.json['corpus']
    query = safety_guardrails(query)
    result = cached_semantic_search(query, corpus)
    return jsonify({'result': result})

if __name__ == '__main__':
    app.run(debug=True)
```
```
### Kritikan + Sandbox v1
1. Tidak ada penanganan error untuk input yang tidak lengkap atau tidak valid.
2. Cache tidak memiliki batasan ukuran, berpotensi menyebabkan memory leak.
3. Fungsi `safety_guardrails` tidak diimplementasikan.
Sandbox: Lulus static analysis (tiada pattern berbahaya)
### Kod v2
```javascript
```python
import numpy as np
from sentence_transformers import SentenceTransformer, util
from flask import Flask, request, jsonify
from functools import wraps

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')
cache = {}

def validate_input(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not request.json:
            return jsonify({'error': 'Invalid request, JSON expected'}), 400
        if 'query' not in request.json or 'corpus' not in request.json:
            return jsonify({'error': 'Missing query or corpus'}), 400
        return f(*args, **kwargs)
    return decorated_function

def limited_cache(max_size=100):
    cache = {}
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if len(cache) >= max_size:
                cache.pop(next(iter(cache)))
            result = func(*args, **kwargs)
            cache[args[0]] = result
            return result
        return wrapper
    return decorator

@limited_cache(max_size=100)
def cached_semantic_search(query, corpus):
    return semantic_search(query
```
Sandbox v2: Lulus static analysis (tiada pattern berbahaya)
### Breakthrough
1. Import libraries: numpy, sentence_transformers, Flask, functools.
2. Create Flask app, SentenceTransformer model, and cache.
3. Define validate_input decorator to check JSON request.
4. Define limited_cache decorator to limit cache size.
5. Implement cached_semantic_search function with caching.
