import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from difflib import get_close_matches
from scipy import sparse

books = pd.read_csv("../data/books_subset.csv", dtype=str)
books.columns = books.columns.str.strip().str.lower()
books = books.dropna(subset=["title"])
books["title"] = books["title"].str.strip().str.lower()
books["bookID"] = books.index.astype(str)

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(books["title"])

with open("../models/tfidf_vectorizer.pkl", "wb") as f:
    pickle.dump(vectorizer, f)

sparse.save_npz("../models/tfidf_matrix.npz", tfidf_matrix)

quiz_title = "harry potter and the sorcerer's stone".strip().lower()
titles = books["title"].tolist()

match = get_close_matches(quiz_title, titles, n=1, cutoff=0.6)
if not match:
    print("No match found for your book.")
    exit()

matched_title = match[0]
print(f"Using matched title: {matched_title}")

idx = books[books["title"] == matched_title].index[0]
cosine_similarities = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
similar_indices = cosine_similarities.argsort()[::-1][1:11]

recs_df = books.iloc[similar_indices][["bookID", "title"]]
print(f"\nTop 10 books similar to: {matched_title.title()}")
print(recs_df.to_string(index=False))

recs_df.to_csv("top10_classical.csv", index=False)
