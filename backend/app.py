from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import faiss
import os
import time
from sentence_transformers import SentenceTransformer
from huggingface_hub import hf_hub_download

app = Flask(__name__)
CORS(app)

# Model and Hugging Face configuration
MODEL_NAME = "all-mpnet-base-v2"
HF_REPO = "JesseFWarrenV/BookRecommender"

# Lazy-loaded globals
encoder = None
book_embeddings = None
book_ids = None
faiss_index = None
subset_path = None

def lazy_load():
    """
    Loads the SentenceTransformer model, embeddings, book titles, FAISS index,
    and metadata from Hugging Face. Ensures components are loaded only once.
    """
    global encoder, book_embeddings, book_ids, faiss_index, subset_path
    if encoder is not None:
        return

    print("Loading SentenceTransformer...")
    start = time.time()
    encoder = SentenceTransformer(MODEL_NAME)
    print(f"Model loaded in {time.time() - start:.2f}s")

    print("Downloading files from Hugging Face...")
    emb_path = hf_hub_download(repo_id=HF_REPO, filename="hybrid_book_embeddings.npy", repo_type="dataset")
    ids_path = hf_hub_download(repo_id=HF_REPO, filename="hybrid_book_ids.npy", repo_type="dataset")
    faiss_path = hf_hub_download(repo_id=HF_REPO, filename="faiss_index.idx", repo_type="dataset")
    subset_path = hf_hub_download(repo_id=HF_REPO, filename="books_subset.csv", repo_type="dataset")

    print("Loading data files...")
    book_embeddings = np.load(emb_path, allow_pickle=True)
    book_ids = np.load(ids_path, allow_pickle=True)
    faiss_index = faiss.read_index(faiss_path)
    print("All resources loaded.")

def load_books():
    """
    Loads metadata from books_subset.csv and returns a list of dictionaries for each book.

    Returns:
        List[Dict]: List of book metadata dictionaries.
    """
    lazy_load()
    df = pd.read_csv(subset_path)

    required_columns = ['title', 'authors', 'categories', 'description']
    missing_columns = [col for col in required_columns if col not in df.columns]
    if missing_columns:
        raise ValueError(f"Missing required columns: {missing_columns}")

    df = df.fillna('')
    df['title'] = df['title'].str.lower().str.strip()

    books = []
    for _, row in df.iterrows():
        book = {
            'title': row['title'],
            'authors': row['authors'],
            'categories': row['categories'],
            'average_rating': float(row.get('average_rating', 0)),
            'description': row['description'],
            'thumbnail': row.get('thumbnail', 'https://via.placeholder.com/200x300?text=No+Cover')
        }
        books.append(book)

    return books

def get_book_recommendations(user_preferences, num_recommendations=20):
    """
    Given a list of user preferences from the user quiz, returns top book recommendations using FAISS.

    Args:
        user_preferences (List[str]): Keywords or titles from the user.
        num_recommendations (int): Number of books to recommend.

    Returns:
        List[Dict]: Recommended books.
    """
    lazy_load()

    try:
        query_text = " ".join([p for p in user_preferences if len(p.strip()) > 2])
        query_embedding = encoder.encode([query_text])[0].astype('float32')

        distances, indices = faiss_index.search(query_embedding.reshape(1, -1), num_recommendations)
        recommended_titles = book_ids[indices[0]]

        all_books = load_books()
        title_to_book = {book['title']: book for book in all_books}

        recommendations = []
        for title in recommended_titles:
            normalized_title = title.lower().strip()
            if normalized_title in title_to_book:
                recommendations.append(title_to_book[normalized_title])

        return recommendations
    except Exception as e:
        raise RuntimeError(f"Error generating recommendations: {e}")

@app.route('/api/books')
def get_books():
    """
    Endpoint to return all book metadata.
    """
    try:
        books = load_books()
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """
    Endpoint to return personalized book recommendations based on user input.
    """
    try:
        user_preferences = request.json.get('preferences', [])
        if not user_preferences:
            return jsonify({'error': 'No preferences provided'}), 400

        recommendations = get_book_recommendations(user_preferences)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.before_first_request
def warm_up():
    """
    Ensures models and indexes are loaded before the first request.
    """
    lazy_load()

def main():
    lazy_load()
    app.run(debug=True)

if __name__ == '__main__':
    main()
