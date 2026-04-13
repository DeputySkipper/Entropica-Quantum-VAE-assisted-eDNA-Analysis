# ENTROPICA: Quantum-Driven eDNA Discovery Engine

ENTROPICA is a quantum-focused hackathon project that demonstrates how **Quantum Random Number Generation (QRNG)** can be integrated into a **Variational Autoencoder (VAE)** to improve stochastic latent-space sampling for biological sequence analysis.

This repository is not just "AI for biology"; it is a practical prototype of **quantum-classical hybrid computation** where quantum randomness directly influences model behavior during representation learning.

## Our Thesis

Classical VAEs depend on pseudo-random number generators (PRNGs) in the reparameterization step:

- `z = mu + sigma * eps`, where `eps ~ N(0, I)` from PRNG.

ENTROPICA replaces this stochastic core with a QRNG-backed pathway:

- `eps` is drawn from `QuantumRandomGenerator` in `src/quantum_core.py`.
- `SimpleVAE.reparameterize()` in `src/pipeline.py` consumes these quantum-derived samples.

The main contribution is therefore:

- **same model family (VAE), different randomness regime (QRNG instead of PRNG)**,
- enabling a direct experimental comparison of quantum vs classical stochasticity in latent encoding.

## Why Quantum Here?

Deep-sea eDNA is inherently uncertain: sparse references, unknown taxa, noisy reads, and high diversity. In this setting, latent-space quality depends strongly on how stochastic sampling behaves.

Using QRNG in the VAE targets three hackathon goals:

- **Quantum integration**: real insertion point in model internals, not cosmetic usage.
- **Algorithmic relevance**: randomness controls latent exploration during encoding/decoding.
- **Measurable impact path**: cluster separability, novelty signals, and embedding stability can be benchmarked against PRNG baselines.

## Quantum-First System Design

1. Input reads are parsed from FASTA/FASTQ.
2. Sequences are one-hot encoded into tensors.
3. VAE encoder computes `mu` and `logvar`.
4. **QRNG supplies Gaussian-like noise** for reparameterization.
5. Latent vectors are clustered (DBSCAN) for abundance and novelty interpretation.

Although the application domain is eDNA, the architectural pattern is generalizable to any VAE-based workload where stochastic latent sampling matters.

## Quantum Implementation Map

- `src/quantum_core.py`
  - quantum random source abstraction and normal-tensor generation utilities.
- `src/pipeline.py`
  - `SimpleVAE.reparameterize()` uses QRNG tensors for latent sampling.
  - `run_analysis()` executes end-to-end inference and clustering.
- `src/train_vae.py`
  - training utility for generating model checkpoints.

## What Makes This a Quantum Computing Project

- Quantum logic is placed in the mathematically critical path of VAE inference/training behavior.
- The project supports direct PRNG-vs-QRNG experimental framing.
- The biological use case (deep-sea biodiversity discovery) is high-impact and uncertainty-heavy, making stochastic-method innovation meaningful.

## Quick Start

```bash
python -m pip install -r requirements.txt
python app.py
```

Open:

- [http://127.0.0.1:8050](http://127.0.0.1:8050)

Use sample datasets in `Dataset/`:

- `sample_test_dataset.fasta`
- `strong_separation_test_dataset.fasta`
- `ncbi_style_diverse_16s_test.fasta`

## Optional: Train a Checkpoint

```bash
python -m src.train_vae --data_dir Dataset --out models/vae.pt --epochs 10
```

If no compatible checkpoint is found, the pipeline still runs using fallback embeddings so the demo remains robust.

## Suggested Testing Metrics

- Latent cluster compactness/separation (QRNG vs PRNG).
- Number and consistency of detected outlier/noise points.
- Stability across repeated runs.
- Downstream biodiversity proxy metrics (cluster diversity, abundance distribution entropy).

## Project Positioning

ENTROPICA showcases a concrete quantum-classical hybrid pattern:

- **Quantum randomness as a model primitive**, not an external add-on.
- **Machine learning architecture with a replaceable stochastic engine**.
- **Applied to a real scientific challenge with discovery potential**.

## Demo Video Link
- https://drive.google.com/drive/folders/1SeKRYocj6UuqUzjn7MY4y_eAIUKus0Tp?usp=sharing
