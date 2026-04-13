"""
Train a Variational Autoencoder (VAE) on FASTQ/FASTA datasets for ENTROPICA.

Usage (examples):
  python -m src.train_vae --data_dir ./data/fastq --epochs 15 --latent_dim 16 --out models/vae.pt

This script aggregates all sequences in the directory (files ending with .fastq/.fq/.fa/.fasta/.fna)
and trains the SimpleVAE from src.pipeline, saving weights and config.
"""

from __future__ import annotations

import argparse
import glob
import os
from typing import List

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

from src.pipeline import (
    read_fastq_sequences,
    read_fasta_sequences,
    one_hot_encode_sequences,
    SimpleVAE,
    _flatten_encoded,
)


class SeqDataset(Dataset):
    def __init__(self, data_dir: str, max_records: int | None = None) -> None:
        patterns = ["*.fastq", "*.fq", "*.fa", "*.fasta", "*.fna"]
        files: List[str] = []
        for p in patterns:
            files.extend(glob.glob(os.path.join(data_dir, p)))
        sequences: List[str] = []
        for f in files:
            lf = f.lower()
            if lf.endswith((".fa", ".fasta", ".fna")):
                sequences.extend(read_fasta_sequences(f, max_records=max_records))
            else:
                sequences.extend(read_fastq_sequences(f, max_records=max_records))
        if len(sequences) == 0:
            raise RuntimeError("No sequences found in provided data_dir.")
        enc, _ = one_hot_encode_sequences(sequences)
        self.x = _flatten_encoded(enc).astype(np.float32)

    def __len__(self) -> int:
        return len(self.x)

    def __getitem__(self, i: int) -> np.ndarray:
        return self.x[i]


def loss_fn(recon: torch.Tensor, x: torch.Tensor, mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    bce = nn.functional.binary_cross_entropy(recon, x, reduction="mean")
    kld = -0.5 * torch.mean(1 + logvar - mu.pow(2) - logvar.exp())
    return bce + kld


def main(
    data_dir: str,
    out_path: str = "models/vae.pt",
    latent_dim: int = 16,
    batch_size: int = 128,
    epochs: int = 10,
    lr: float = 1e-3,
    max_records: int | None = None,
) -> None:
    ds = SeqDataset(data_dir, max_records=max_records)
    dl = DataLoader(ds, batch_size=batch_size, shuffle=True, drop_last=len(ds) > batch_size)

    input_dim = ds.x.shape[1]
    model = SimpleVAE(input_dim=input_dim, latent_dim=latent_dim)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    model.train()

    for epoch in range(epochs):
        total_loss = 0.0
        num_batches = 0
        for xb in dl:
            xb = xb.float()
            recon, mu, logvar = model(xb)
            loss = loss_fn(recon, xb, mu, logvar)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item())
            num_batches += 1
        avg = total_loss / max(1, num_batches)
        print(f"epoch {epoch+1}/{epochs}  loss={avg:.4f}")

    torch.save({
        "state_dict": model.state_dict(),
        "input_dim": input_dim,
        "latent_dim": latent_dim,
    }, out_path)
    print(f"saved weights -> {out_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data_dir", required=True)
    parser.add_argument("--out", default="models/vae.pt")
    parser.add_argument("--latent_dim", type=int, default=16)
    parser.add_argument("--batch_size", type=int, default=128)
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--lr", type=float, default=1e-3)
    parser.add_argument("--max_records", type=int, default=None)
    args = parser.parse_args()
    main(
        data_dir=args.data_dir,
        out_path=args.out,
        latent_dim=args.latent_dim,
        batch_size=args.batch_size,
        epochs=args.epochs,
        lr=args.lr,
        max_records=args.max_records,
    )


