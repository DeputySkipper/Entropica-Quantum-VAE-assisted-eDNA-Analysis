"""
Core bioinformatics pipeline for ENTROPICA.

This module implements a simple end-to-end analysis pipeline:
1) Read FASTQ sequences
2) One-hot encode DNA
3) Load a VAE (placeholder) and encode sequences to latent vectors
4) Cluster latent vectors with DBSCAN
5) Compute counts and relative abundance per cluster

The public entrypoint is `run_analysis(fastq_file_path, metadata)` which returns
structured results for the web UI.

Notes:
- The VAE loader is a placeholder. Replace `load_pretrained_vae` with actual
  model deserialization for production.
- FASTQ parsing uses Biopython if available; otherwise a minimal fallback
  parser is attempted.
"""

from __future__ import annotations

import base64
import io
import json
import math
import os
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional

import numpy as np
import pandas as pd
from sklearn.cluster import DBSCAN

try:
    from Bio import SeqIO  # type: ignore
    _HAS_BIOPYTHON = True
except Exception:
    _HAS_BIOPYTHON = False

import torch
import torch.nn as nn

try:
    from src.quantum_core import QuantumRandomGenerator
except ImportError:
    from .quantum_core import QuantumRandomGenerator

NUCLEOTIDES = ["A", "C", "G", "T", "N"]
NUC_TO_INDEX = {n: i for i, n in enumerate(NUCLEOTIDES)}


def _clean_sequence(seq: str) -> str:
    """Uppercase and keep only valid nucleotide characters."""
    seq_up = seq.strip().upper()
    return "".join(ch if ch in NUCLEOTIDES else "N" for ch in seq_up)


def read_fastq_sequences(fastq_file_path: str, max_records: Optional[int] = None) -> List[str]:
    """Read sequences from a FASTQ file, returning a list of DNA strings.

    If Biopython is installed, use it; otherwise, try a minimal FASTQ parser
    that reads every 4th line as a sequence.
    """
    sequences: List[str] = []

    if _HAS_BIOPYTHON:
        with open(fastq_file_path, "r", encoding="utf-8") as handle:
            for i, record in enumerate(SeqIO.parse(handle, "fastq")):
                sequences.append(_clean_sequence(str(record.seq)))
                if max_records is not None and (i + 1) >= max_records:
                    break
        return sequences

    # Fallback minimal parser: FASTQ is blocks of 4 lines, 2nd line is sequence
    with open(fastq_file_path, "r", encoding="utf-8") as f:
        block: List[str] = []
        for i, line in enumerate(f):
            block.append(line.rstrip("\n"))
            if len(block) == 4:
                seq_line = block[1]
                sequences.append(_clean_sequence(seq_line))
                block = []
                if max_records is not None and len(sequences) >= max_records:
                    break
    return sequences


def read_fasta_sequences(fasta_file_path: str, max_records: Optional[int] = None) -> List[str]:
    """Read sequences from a FASTA file, returning a list of DNA strings."""
    sequences: List[str] = []
    if _HAS_BIOPYTHON:
        with open(fasta_file_path, "r", encoding="utf-8") as handle:
            for i, record in enumerate(SeqIO.parse(handle, "fasta")):
                sequences.append(_clean_sequence(str(record.seq)))
                if max_records is not None and (i + 1) >= max_records:
                    break
        return sequences

    # Minimal FASTA parser: '>' header lines; sequence lines follow until next header
    with open(fasta_file_path, "r", encoding="utf-8") as f:
        buf: List[str] = []
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith(">"):
                if buf:
                    sequences.append(_clean_sequence("".join(buf)))
                    buf = []
                    if max_records is not None and len(sequences) >= max_records:
                        break
            else:
                buf.append(line)
        if buf and (max_records is None or len(sequences) < max_records):
            sequences.append(_clean_sequence("".join(buf)))
    return sequences


def one_hot_encode_sequences(sequences: List[str], max_len: Optional[int] = None) -> Tuple[np.ndarray, np.ndarray]:
    """One-hot encode DNA sequences to shape (num_sequences, max_len, 5).

    - Pads with all-zero rows for positions beyond sequence length.
    - Unknown characters mapped to index for "N".
    - Returns (encoded_array, lengths_array)
    """
    if not sequences:
        return np.zeros((0, 0, len(NUCLEOTIDES)), dtype=np.float32), np.zeros((0,), dtype=np.int32)

    if max_len is None:
        max_len = max(len(s) for s in sequences)

    depth = len(NUCLEOTIDES)
    encoded = np.zeros((len(sequences), max_len, depth), dtype=np.float32)
    lengths = np.zeros((len(sequences),), dtype=np.int32)

    for i, seq in enumerate(sequences):
        trimmed = seq[:max_len]
        lengths[i] = len(trimmed)
        for j, ch in enumerate(trimmed):
            k = NUC_TO_INDEX.get(ch, NUC_TO_INDEX["N"])
            encoded[i, j, k] = 1.0

    return encoded, lengths


class SimpleVAE(nn.Module):
    """A minimal VAE-like encoder-decoder with accessible encoder for embeddings.

    This is a placeholder architecture; in production, replace with your trained
    VAE and load weights from disk/cloud.
    """

    def __init__(self, input_dim: int, latent_dim: int = 16, hidden_dim: int = 256) -> None:
        super().__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim
        
        # Instantiate the Quantum QRNG buffer map
        self.qrng = QuantumRandomGenerator()

        self.encoder = nn.Sequential(
            nn.Linear(input_dim, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.ReLU(),
        )
        self.mu = nn.Linear(hidden_dim // 2, latent_dim)
        self.logvar = nn.Linear(hidden_dim // 2, latent_dim)

        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, hidden_dim // 2),
            nn.ReLU(),
            nn.Linear(hidden_dim // 2, hidden_dim),
            nn.ReLU(),
            nn.Linear(hidden_dim, input_dim),
            nn.Sigmoid(),
        )

    def encode(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        h = self.encoder(x)
        return self.mu(h), self.logvar(h)

    def reparameterize(self, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
        std = torch.exp(0.5 * logvar)
        
        # Pull normalized vectors dynamically from the pre-generated quantum state buffer
        eps = self.qrng.get_normal_tensor(std.shape).to(std.device)
        
        return mu + eps * std

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        mu, logvar = self.encode(x)
        z = self.reparameterize(mu, logvar)
        recon = self.decoder(z)
        return recon, mu, logvar


def load_pretrained_vae(input_dim: int, latent_dim: int = 16) -> SimpleVAE:
    """Load a pretrained VAE model.

    Attempts to load weights from ENTROPICA_VAE_WEIGHTS or models/vae.pt. If no
    weights are found, returns a randomly-initialized model in eval mode.
    """
    weights_path = os.environ.get("ENTROPICA_VAE_WEIGHTS")
    if not weights_path:
        default_path = os.path.join(os.getcwd(), "models", "vae.pt")
        if os.path.exists(default_path):
            weights_path = default_path

    model = SimpleVAE(input_dim=input_dim, latent_dim=latent_dim)
    if weights_path and os.path.exists(weights_path):
        try:
            ckpt = torch.load(weights_path, map_location="cpu")
            ckpt_input_dim = ckpt.get("input_dim", input_dim)
            ckpt_latent_dim = ckpt.get("latent_dim", latent_dim)
            # Rebuild to match checkpoint config if needed
            if ckpt_input_dim != input_dim or ckpt_latent_dim != latent_dim:
                model = SimpleVAE(input_dim=ckpt_input_dim, latent_dim=ckpt_latent_dim)
            state = ckpt.get("state_dict", ckpt)
            model.load_state_dict(state, strict=False)
        except Exception:
            # Fall back to random init if load fails
            pass
    model.eval()
    return model


def _flatten_encoded(encoded: np.ndarray) -> np.ndarray:
    """Flatten (L, 5) one-hot into a single vector of length L*5."""
    if encoded.ndim != 3:
        raise ValueError("Expected encoded tensor with shape (N, L, 5)")
    n, l, d = encoded.shape
    return encoded.reshape(n, l * d)


def _cluster_dbscan(embeddings: np.ndarray, eps: float = 0.5, min_samples: int = 5) -> np.ndarray:
    """Cluster embeddings using DBSCAN. Returns label array of shape (N,)."""
    if embeddings.shape[0] == 0:
        return np.zeros((0,), dtype=np.int32)
    db = DBSCAN(eps=eps, min_samples=min_samples, metric="euclidean")
    labels = db.fit_predict(embeddings)
    return labels.astype(np.int32)


def _compute_cluster_stats(labels: np.ndarray, lengths: np.ndarray) -> Tuple[pd.DataFrame, Dict[str, int]]:
    """Compute counts, relative abundance, and mean length per cluster.

    Returns (clusters_df, summary_counts)
    """
    total = len(labels)
    if total == 0:
        empty_df = pd.DataFrame(columns=["cluster_id", "count", "relative_abundance", "mean_length"])  # type: ignore[arg-type]
        return empty_df, {"total_sequences": 0, "num_clusters": 0, "potential_novel_taxa": 0}

    series = pd.Series(labels, name="cluster")
    counts = series.value_counts().sort_index()

    # Exclude noise label -1 from number of clusters and abundance calc
    cluster_ids = [cid for cid in counts.index.tolist() if cid != -1]
    cluster_rows: List[Dict[str, float]] = []
    for cid in cluster_ids:
        idx = np.where(labels == cid)[0]
        cnt = len(idx)
        rel = float(cnt) / float(total)
        mean_len = float(lengths[idx].mean()) if cnt > 0 else 0.0
        cluster_rows.append({
            "cluster_id": int(cid),
            "count": int(cnt),
            "relative_abundance": rel,
            "mean_length": mean_len,
        })

    clusters_df = pd.DataFrame(cluster_rows).sort_values(by="count", ascending=False)

    # Define potential novel taxa heuristically: small clusters (<= min_samples) plus noise presence
    small_threshold = 5
    small_clusters = sum(1 for r in cluster_rows if r["count"] <= small_threshold)
    has_noise = int((-1) in counts.index)
    potential_novel = small_clusters + has_noise

    summary_counts = {
        "total_sequences": int(total),
        "num_clusters": int(len(cluster_ids)),
        "potential_novel_taxa": int(potential_novel),
    }

    return clusters_df, summary_counts


def run_analysis(fastq_file_path: str, metadata: Optional[Dict] = None) -> Dict:
    """Run the full analysis pipeline and return results for the UI.

    Parameters
    - fastq_file_path: Path to the FASTQ file.
    - metadata: Optional dictionary with run metadata (e.g., sample id, notes).

    Returns a dictionary with keys:
    - summary: dict with total_sequences, num_clusters, potential_novel_taxa
    - clusters_table: list of row dicts for the data table
    - abundance_chart: dict with x (cluster ids as strings) and y (abundance)
    - notes: optional string with additional info
    """
    # Select parser based on file extension
    lower = fastq_file_path.lower()
    if lower.endswith((".fa", ".fasta", ".fna", ".fa.gz", ".fasta.gz")):
        sequences = read_fasta_sequences(fastq_file_path)
    else:
        sequences = read_fastq_sequences(fastq_file_path)

    # Early return if no sequences
    if len(sequences) == 0:
        return {
            "summary": {"total_sequences": 0, "num_clusters": 0, "potential_novel_taxa": 0},
            "clusters_table": [],
            "abundance_chart": {"x": [], "y": []},
            "notes": "No sequences detected in the provided FASTQ.",
        }

    encoded, lengths = one_hot_encode_sequences(sequences)
    flat = _flatten_encoded(encoded)

    # Load VAE and compute latent embeddings (use mu as deterministic embedding)
    vae = load_pretrained_vae(input_dim=flat.shape[1], latent_dim=16)
    with torch.no_grad():
        x = torch.from_numpy(flat)
        mu, logvar = vae.encode(x)
        embeddings = mu.cpu().numpy()

    labels = _cluster_dbscan(embeddings, eps=0.8, min_samples=5)

    clusters_df, summary_counts = _compute_cluster_stats(labels, lengths)

    # Prepare outputs
    if not clusters_df.empty:
        x_ids = [str(int(cid)) for cid in clusters_df["cluster_id"].tolist()]
        y_vals = clusters_df["relative_abundance"].tolist()
        table_rows = clusters_df.to_dict(orient="records")
    else:
        x_ids = []
        y_vals = []
        table_rows = []

    result = {
        "summary": summary_counts,
        "clusters_table": table_rows,
        "abundance_chart": {"x": x_ids, "y": y_vals},
        "notes": None,
    }

    # Attach metadata echo for traceability
    if metadata is not None:
        try:
            result["metadata"] = metadata
        except Exception:
            result["metadata"] = {"_raw": str(metadata)}

    return result


