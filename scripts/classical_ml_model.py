import pandas as pd
import numpy as np
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
import pickle

ratings = pd.read_csv(
    "../data/Books_rating.csv",
    usecols=["Id", "Title", "User_id", "review/score"],
    dtype={"Id": str, "Title": str, "User_id": str, "review/score": float}
).rename(columns={
    "Id": "bookID",
    "Title": "title",
    "User_id": "userID",
    "review/score": "rating"
})

user_counts = ratings["userID"].value_counts()
book_counts = ratings["bookID"].value_counts()
ratings = ratings[
    ratings["userID"].isin(user_counts[user_counts >= 5].index) &
    ratings["bookID"].isin(book_counts[book_counts >= 20].index)
]

reader = Reader(rating_scale=(0, 5))
data = Dataset.load_from_df(ratings[["userID", "bookID", "rating"]], reader)
trainset, testset = train_test_split(data, test_size=0.2, random_state=42)

algo = SVD(n_factors=50, n_epochs=20, lr_all=0.005, reg_all=0.02)
algo.fit(trainset)

with open("../models/svd_model.pkl", "wb") as f:
    pickle.dump(algo, f)

meta = pd.read_csv("../data/books_data.csv", dtype=str)
meta.columns = meta.columns.str.strip().str.lower()
meta = meta.rename(columns={"title": "title", "authors": "authors", "categories": "categories"})
meta["title"] = meta["title"].str.strip().str.lower()

def recommend_based_on_book(algo, liked_book_id, k=10):
    all_books = set(trainset._raw2inner_id_items.keys())
    if liked_book_id not in all_books:
        raise ValueError(f"Book ID {liked_book_id} not found in training set.")
    
    liked_inner_id = trainset.to_inner_iid(liked_book_id)
    liked_vec = algo.qi[liked_inner_id]

    all_vecs = algo.qi
    norms = np.linalg.norm(all_vecs, axis=1) * np.linalg.norm(liked_vec)
    sims = np.dot(all_vecs, liked_vec) / norms

    similar_inner_ids = np.argsort(sims)[::-1]
    similar_inner_ids = [i for i in similar_inner_ids if i != liked_inner_id][:k]
    similar_book_ids = [trainset.to_raw_iid(i) for i in similar_inner_ids]
    
    return similar_book_ids

quiz_title = "dune"
title_to_id = ratings[["title", "bookID"]].drop_duplicates().set_index("title").to_dict()["bookID"]
liked_book_id = title_to_id.get(quiz_title.strip().lower())

if liked_book_id:
    top_books = recommend_based_on_book(algo, liked_book_id, k=10)

    recs_df = pd.DataFrame(top_books, columns=["bookID"])
    title_map = ratings[["bookID", "title"]].drop_duplicates()
    recs_df = recs_df.merge(title_map, on="bookID", how="left")
    recs_df["title"] = recs_df["title"].str.strip().str.lower()

    recs = recs_df.merge(meta[["title", "authors", "categories"]], on="title", how="left")
    print(f"\nTop 10 books similar to: {quiz_title.title()}")
    print(recs[["bookID", "title", "authors", "categories"]].to_string(index=False))
    recs.to_csv("top10_classical_from_title.csv", index=False)
else:
    print(f"Could not find a matching bookID for: {quiz_title}")

