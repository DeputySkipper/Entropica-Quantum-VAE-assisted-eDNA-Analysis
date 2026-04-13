import os
from Bio import Entrez

Entrez.email = "ENTROPICA@quinfosys.com"

print("Searching GenBank for 16S rRNA sequences...")
handle = Entrez.esearch(db="nucleotide", term="16S ribosomal RNA[Title] AND bacteria[Filter]", retmax=1500)
record = Entrez.read(handle)
handle.close()

id_list = record["IdList"]
print(f"Discovered {len(id_list)} relevant sequences. Downloading in FASTA format...")

try:
    handle = Entrez.efetch(db="nucleotide", id=id_list, rettype="fasta", retmode="text")
    fasta_data = handle.read()
    handle.close()

    os.makedirs("Dataset", exist_ok=True)
    with open("Dataset/NCBI_16S_dataset.fasta", "w") as f:
        f.write(fasta_data)
    print("Download completed: Dataset/NCBI_16S_dataset.fasta")
    
    if os.path.exists("Dataset/mock_1.fasta"):
        os.remove("Dataset/mock_1.fasta")
    if os.path.exists("Dataset/mock_2.fasta"):
        os.remove("Dataset/mock_2.fasta")
        
except Exception as e:
    print("Error fetching sequences:", str(e))
