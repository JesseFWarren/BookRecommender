import os
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer

META_PATH = "../data/books_data.csv"
RATINGS_PATH = "../data/Books_rating.csv"
OUT_DIR = "../models/batched_embeddings/"
OUT_SUBSET = "../data/books_subset.csv"
MODEL_NAME = "all-mpnet-base-v2"
SUBSET_SIZE = 50000
BATCH_SIZE = 1000

os.makedirs(OUT_DIR, exist_ok=True)

meta = pd.read_csv(META_PATH, dtype=str)
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

ratings = pd.read_csv(
    RATINGS_PATH,
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
books = pd.merge(meta, reviews_agg, on="title", how="left").fillna("")

if len(books) > SUBSET_SIZE:
    books = books.sample(n=SUBSET_SIZE, random_state=42).reset_index(drop=True)
print(f"Sampling {len(books)} books for embedding")

books.to_csv(OUT_SUBSET, index=False)

books["text_to_embed"] = (
    books["title"].fillna("") + ". " +
    books["description"].fillna("") + ". " +
    books["agg_reviews"]
)

encoder = SentenceTransformer(MODEL_NAME)

for i in range(0, len(books), BATCH_SIZE):
    end = i + BATCH_SIZE
    chunk = books.iloc[i:end]
    emb_path = os.path.join(OUT_DIR, f"embeddings_chunk_{i}.npy")
    ids_path = os.path.join(OUT_DIR, f"titles_chunk_{i}.npy")

    if os.path.exists(emb_path) and os.path.exists(ids_path):
        print(f"Skipping batch {i}-{end} (already processed)")
        continue

    print(f"Encoding batch {i}-{end}...")
    embs = encoder.encode(chunk["text_to_embed"].tolist(), show_progress_bar=True)
    np.save(emb_path, np.array(embs, dtype="float32"))
    np.save(ids_path, chunk["title"].to_numpy())

print("All batches processed and saved.")
