import numpy as np
import glob

DIR = "../models/batched_embeddings/"
OUT_EMB = "../models/hybrid_book_embeddings.npy"
OUT_IDS = "../models/hybrid_book_ids.npy"

embeddings = []
titles = []

for emb_path in sorted(glob.glob(f"{DIR}/embeddings_chunk_*.npy")):
    embeddings.append(np.load(emb_path))
for title_path in sorted(glob.glob(f"{DIR}/titles_chunk_*.npy")):
    titles.append(np.load(title_path, allow_pickle=True))

full_embs = np.vstack(embeddings)
full_ids = np.concatenate(titles)

np.save(OUT_EMB, full_embs)
np.save(OUT_IDS, full_ids)

print(f"Saved final embeddings: {full_embs.shape}")
