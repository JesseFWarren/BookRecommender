import numpy as np
import glob
import os

DIR = "../models/batched_embeddings/"
OUT_EMB = "../models/hybrid_book_embeddings.npy"
OUT_IDS = "../models/hybrid_book_ids.npy"

def load_batched_files(directory: str):
    """
    Load and concatenate all embedding and title chunks.

    Args:
        directory (str): Path containing chunked .npy files.

    Returns:
        np.ndarray, np.ndarray: Combined embeddings and title arrays.
    """
    embeddings = []
    titles = []

    emb_paths = sorted(glob.glob(os.path.join(directory, "embeddings_chunk_*.npy")))
    title_paths = sorted(glob.glob(os.path.join(directory, "titles_chunk_*.npy")))

    for path in emb_paths:
        embeddings.append(np.load(path))
    for path in title_paths:
        titles.append(np.load(path, allow_pickle=True))

    full_embs = np.vstack(embeddings)
    full_ids = np.concatenate(titles)
    return full_embs, full_ids


def save_combined_arrays(embeddings: np.ndarray, ids: np.ndarray, emb_out: str, ids_out: str):
    """
    Save the combined arrays.

    Args:
        embeddings (np.ndarray): Full embedding matrix.
        ids (np.ndarray): Corresponding book title identifiers.
        emb_out (str): Path to save embeddings.
        ids_out (str): Path to save title IDs.
    """
    np.save(emb_out, embeddings)
    np.save(ids_out, ids)
    print(f"Saved final embeddings: {embeddings.shape}")


def main():
    full_embs, full_ids = load_batched_files(DIR)
    save_combined_arrays(full_embs, full_ids, OUT_EMB, OUT_IDS)


if __name__ == "__main__":
    main()
