import os
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer


def load_and_clean_metadata(meta_path: str) -> pd.DataFrame:
    """
    Load and clean the metadata CSV.
    """
    meta = pd.read_csv(meta_path, dtype=str)
    meta.columns = meta.columns.str.strip().str.lower()
    meta = meta.rename(columns={
        "title": "title",
        "description": "description",
        "authors": "authors",
        "categories": "categories",
        "ratingscount": "ratingscount",
        "previewlink": "previewlink"
    })
    meta["title"] = meta["title"].str.strip().str.lower()
    return meta


def load_and_aggregate_reviews(ratings_path: str) -> pd.DataFrame:
    """
    Load the Amazon reviews and compute top 5 most helpful reviews per title.
    """
    ratings = pd.read_csv(
        ratings_path,
        usecols=["Id", "Title", "review/text", "review/helpfulness"],
        dtype=str
    ).rename(columns={
        "Id": "bookid",
        "Title": "title",
        "review/text": "review_text",
        "review/helpfulness": "helpfulness"
    })
    ratings["title"] = ratings["title"].str.strip().str.lower()

    def parse_helpfulness(x):
        try:
            num, den = map(int, x.split("/"))
            return num / den if den else 0.0
        except:
            return 0.0

    ratings["helpful_frac"] = ratings["helpfulness"].apply(parse_helpfulness)

    def agg_top_reviews(group):
        top5 = group.sort_values("helpful_frac", ascending=False)["review_text"].head(5)
        return " ".join(top5)

    reviews_agg = ratings.groupby("title").apply(agg_top_reviews).reset_index(name="agg_reviews")
    return reviews_agg


def build_book_subset(meta: pd.DataFrame, reviews: pd.DataFrame, subset_size: int, output_path: str) -> pd.DataFrame:
    """
    Merge metadata with reviews and save a sampled subset.
    """
    books = pd.merge(meta, reviews, on="title", how="left").fillna("")

    if len(books) > subset_size:
        books = books.sample(n=subset_size, random_state=42).reset_index(drop=True)

    books.to_csv(output_path, index=False)
    print(f"Saved subset of {len(books)} books to {output_path}")
    return books


def encode_books_in_batches(books: pd.DataFrame, model_name: str, out_dir: str, batch_size: int):
    """
    Batch encode books and save embeddings and corresponding titles.
    """
    os.makedirs(out_dir, exist_ok=True)
    books["text_to_embed"] = (
        books["title"].fillna("") + ". " +
        books["description"].fillna("") + ". " +
        books["agg_reviews"]
    )

    encoder = SentenceTransformer(model_name)

    for i in range(0, len(books), batch_size):
        end = i + batch_size
        chunk = books.iloc[i:end]
        emb_path = os.path.join(out_dir, f"embeddings_chunk_{i}.npy")
        ids_path = os.path.join(out_dir, f"titles_chunk_{i}.npy")

        if os.path.exists(emb_path) and os.path.exists(ids_path):
            print(f"Skipping batch {i}-{end} (already processed)")
            continue

        print(f"Encoding batch {i}-{end}...")
        embs = encoder.encode(chunk["text_to_embed"].tolist(), show_progress_bar=True)
        np.save(emb_path, np.array(embs, dtype="float32"))
        np.save(ids_path, chunk["title"].to_numpy())

    print("All batches processed and saved.")


def main():
    META_PATH = "../data/books_data.csv"
    RATINGS_PATH = "../data/Books_rating.csv"
    OUT_DIR = "../models/batched_embeddings/"
    OUT_SUBSET = "../data/books_subset.csv"
    MODEL_NAME = "all-mpnet-base-v2"
    SUBSET_SIZE = 50000
    BATCH_SIZE = 1000

    meta = load_and_clean_metadata(META_PATH)
    reviews = load_and_aggregate_reviews(RATINGS_PATH)
    books = build_book_subset(meta, reviews, SUBSET_SIZE, OUT_SUBSET)
    encode_books_in_batches(books, MODEL_NAME, OUT_DIR, BATCH_SIZE)


if __name__ == "__main__":
    main()
