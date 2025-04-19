import pandas as pd
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
import pickle

ratings = pd.read_csv(
    "../data/Books_rating.csv",
    usecols=["Id", "Title", "User_id", "review/score"],
    dtype={
        "Id": str,
        "Title": str,
        "User_id": str,
        "review/score": float
    }
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

def recommend(algo, user_id, trainset, k=10):
    all_books = set(ratings["bookID"].unique())
    seen_inner = {i for (i, _) in trainset.ur[trainset.to_inner_uid(user_id)]}
    seen_raw  = {trainset.to_raw_iid(i) for i in seen_inner}
    candidates = all_books - seen_raw
    preds = [(b, algo.predict(user_id, b).est) for b in candidates]
    preds.sort(key=lambda x: x[1], reverse=True)
    return preds[:k]

user = "A30TK6U7DNS82R"
top10 = recommend(algo, user, trainset, k=10)

recs_df = pd.DataFrame(top10, columns=["bookID", "est_rating"])
title_map = ratings[["bookID", "title"]].drop_duplicates()
recs_df = recs_df.merge(title_map, on="bookID", how="left")

recs_df["title"] = recs_df["title"].str.strip().str.lower()

meta = pd.read_csv("../data/books_data.csv", dtype=str)
meta.columns = meta.columns.str.strip().str.lower()
meta = meta.rename(columns={
    "title": "title",
    "authors": "authors",
    "categories": "categories"
})
meta["title"] = meta["title"].str.strip().str.lower()

recs = recs_df.merge(
    meta[["title", "authors", "categories"]],
    on="title",
    how="left"
)

print(f"Top 10 recommendations for {user}")
print(recs[["bookID", "title", "est_rating", "authors", "categories"]].to_string(index=False))
recs.to_csv("top10_classical.csv", index=False)