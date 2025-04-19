import numpy as np
import faiss

EMB_PATH   = "../models/hybrid_book_embeddings_subset.npy"
INDEX_PATH = "../models/faiss_index_subset.idx"

def main():
    embeddings = np.load(EMB_PATH).astype("float32")
    dim = embeddings.shape[1]

    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    print(f"Added {index.ntotal} vectors of dim {dim}")

    faiss.write_index(index, INDEX_PATH)
    print(f"Saved FAISS index to {INDEX_PATH}")

if __name__ == "__main__":
    main()
