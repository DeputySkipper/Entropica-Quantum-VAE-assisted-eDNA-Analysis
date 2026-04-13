import random
import os

# Create 3 distinct "taxa" structural sequences
base_seqs = [
    "ATGCGTACGTAGCTAGCTAGCTGATCGATCGTAGCTAGCTAGCTAGCTGATCGATCGTAGC",
    "CCGGTTTTAAAAGGGGCCCTTTAAAACCCGGGTTTTAAAAGGGGCCCTTTAAAACCCGGG",
    "GCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTAGCTA",
]

NUCLEOTIDES = ["A", "C", "G", "T"]

def mutate(seq, rate=0.05):
    res = []
    for ch in seq:
        if random.random() < rate:
            res.append(random.choice(NUCLEOTIDES))
        else:
            res.append(ch)
    return "".join(res)

os.makedirs("Dataset", exist_ok=True)
with open("Dataset/mock_1.fasta", "w") as f:
    for i in range(1000):
        # Pick one base sequence
        taxa_idx = random.choices([0, 1, 2], weights=[0.5, 0.3, 0.2])[0]
        base = base_seqs[taxa_idx]
        seq = mutate(base, rate=0.1)
        f.write(f">seq_{i}_taxa_{taxa_idx}\n")
        f.write(f"{seq}\n")

# Add some completely random sequences to represent "novel taxa"
with open("Dataset/mock_2.fasta", "w") as f:
    for i in range(50):
        seq = "".join(random.choices(NUCLEOTIDES, k=61))
        f.write(f">novel_{i}\n")
        f.write(f"{seq}\n")

print("Mock eDNA dataset successfully created in Dataset/")
