import pandas as pd
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from difflib import get_close_matches
from scipy import sparse
import os


def load_books(path: str) -> pd.DataFrame:
    """
    Loads and preprocesses the dataset.

    Args:
        path (str): Path to the CSV.

    Returns:
        pd.DataFrame: Cleaned dataframe.
    """
    books = pd.read_csv(path, dtype=str)
    books.columns = books.columns.str.strip().str.lower()
    books = books.dropna(subset=["title"])
    books["title"] = books["title"].str.strip().str.lower()
    books["bookID"] = books.index.astype(str)
    return books


def build_tfidf_model(books: pd.DataFrame) -> tuple:
    """
    Builds and saves the TF-IDF model from book titles.

    Args:
        books (pd.DataFrame): The books dataframe.

    Returns:
        tuple: TF-IDF vectorizer and matrix.
    """
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(books["title"])

    os.makedirs("../models", exist_ok=True)
    with open("../models/tfidf_vectorizer.pkl", "wb") as f:
        pickle.dump(vectorizer, f)
    sparse.save_npz("../models/tfidf_matrix.npz", tfidf_matrix)

    return vectorizer, tfidf_matrix


def find_similar_books(
    books: pd.DataFrame, tfidf_matrix, input_title: str, k: int = 10
) -> pd.DataFrame:
    """
    Finds similar books using cosine similarity on TF-IDF vectors.

    Args:
        books (pd.DataFrame): The books dataframe.
        tfidf_matrix: TF-IDF matrix.
        input_title (str): Title to match.
        k (int): Number of recommendations.

    Returns:
        pd.DataFrame: Top k recommended books.
    """
    titles = books["title"].tolist()
    match = get_close_matches(input_title, titles, n=1, cutoff=0.6)

    if not match:
        print("No match found for your book.")
        return pd.DataFrame()

    matched_title = match[0]
    print(f"Using matched title: {matched_title}")

    idx = books[books["title"] == matched_title].index[0]
    cosine_similarities = cosine_similarity(tfidf_matrix[idx], tfidf_matrix).flatten()
    similar_indices = cosine_similarities.argsort()[::-1][1:k+1]

    return books.iloc[similar_indices][["bookID", "title"]]


def main():
    books = load_books("../data/books_subset.csv")
    _, tfidf_matrix = build_tfidf_model(books)
    input_title = "The Hobbit".strip().lower()
    recommendations = find_similar_books(books, tfidf_matrix, input_title)

    if not recommendations.empty:
        print(f"\nTop 10 books similar to: {input_title.title()}")
        print(recommendations.to_string(index=False))
        #recommendations.to_csv("top10_classical.csv", index=False)


if __name__ == "__main__":
    main()
