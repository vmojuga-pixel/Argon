# Advanced Systems — Part 2: AI War (Speed + Cost + Custom Brain)

## Strategy 3-Pronged
1. Speed: Speculative Decoding (2-3x faster)
2. Cost: AWQ 4-bit quantization (5x cheaper)
3. Quality: DPO fine-tuning (domain expert)

## 1. Speculative Decoding (vLLM)
Idea: small draft model (Llama-3-8B) teka 5 tokens laju,
big target model (Llama-3-70B-AWQ) verify serentak.

Config AsyncEngineArgs:
  - model = target (70B-AWQ)
  - speculative_model = draft (8B)
  - num_speculative_tokens = 5
  - tensor_parallel_size = 2 (2x GPU)
  - enable_chunked_prefill = True
  - gpu_memory_utilization = 0.90

Result: 2x-3x throughput gain vs vanilla decoding.
OpenAI-compatible response format (drop-in replacement).

## 2. AWQ 4-bit Quantization
- 70B model: 4x A100 (USD 10/jam) => 2x RTX 3090/4090 (USD 2/jam)
- bitsandbytes nf4 config: load_in_4bit, bnb_4bit_quant_type="nf4"
- bnb_4bit_compute_dtype=torch.bfloat16
- 5x margin advantage vs OpenAI API reseller

## 3. DPO Fine-Tuning (Direct Preference Optimization)
- More stable than RLHF, no separate reward model
- Dataset format: {prompt, chosen, rejected}
- TRL DPOTrainer + PEFT LoRA (r=16, alpha=32, targets q/k/v/o_proj)
- DPOConfig: lr=5e-6, beta=0.1, max_steps=500, paged_adamw_8bit
- Result: model learns your domain (Halal, adat, tone bisnes)

## Killer Advantage
- 2x responsive vs ChatGPT (users feel speed)
- 5x margin (cost down)
- Domain expert (DPO on Halal data)
