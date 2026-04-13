import urllib.request
import tarfile
import os

url = "https://ftp.ncbi.nlm.nih.gov/blast/db/16S_ribosomal_RNA.tar.gz"
dest = "Dataset/16S_ribosomal_RNA.tar.gz"
extract_dir = "Dataset/16S_blastdb"

os.makedirs("Dataset", exist_ok=True)
print("Downloading 16S_ribosomal_RNA.tar.gz...")
urllib.request.urlretrieve(url, dest)
print("Download complete.")

print("Extracting...")
with tarfile.open(dest, "r:gz") as t:
    t.extractall(extract_dir)
    for member in t.getmembers():
        print("  -", member.name)

print("Extraction complete.")
