import numpy as np
import faiss

EMB_PATH = "../models/hybrid_book_embeddings.npy"
INDEX_PATH = "../models/faiss_index.idx"

def load_embeddings(path: str) -> np.ndarray:
    """
    Load precomputed book embeddings from the .npy file.
    
    Args:
        path (str): Path to the .npy file.
    
    Returns:
        np.ndarray: Embedding matrix as float32.
    """
    embeddings = np.load(path).astype("float32")
    print(f"Loaded {embeddings.shape[0]} embeddings of dimension {embeddings.shape[1]}")
    return embeddings


def build_faiss_index(embeddings: np.ndarray) -> faiss.IndexFlatL2:
    """
    Build a FAISS index from book embeddings.
    
    Args:
        embeddings (np.ndarray): Matrix of shape (n_samples, embedding_dim).
    
    Returns:
        faiss.IndexFlatL2: Trained FAISS index.
    """
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    print(f"Added {index.ntotal} vectors to the index.")
    return index


def save_index(index: faiss.IndexFlatL2, path: str):
    """
    Save the FAISS index.
    
    Args:
        index (faiss.IndexFlatL2): The FAISS index to save.
        path (str): Output file path.
    """
    faiss.write_index(index, path)
    print(f"Saved FAISS index to {path}")


def main():
    embeddings = load_embeddings(EMB_PATH)
    index = build_faiss_index(embeddings)
    save_index(index, INDEX_PATH)


if __name__ == "__main__":
    main()
