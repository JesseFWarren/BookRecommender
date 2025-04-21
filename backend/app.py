from flask import Flask, jsonify, request
from flask_cors import CORS
import pandas as pd
import numpy as np
import faiss
import os
from sentence_transformers import SentenceTransformer
import logging

app = Flask(__name__)
CORS(app)

MODEL_NAME = "all-mpnet-base-v2"

try:
    encoder = SentenceTransformer(MODEL_NAME)
    
    book_embeddings = np.load('../models/hybrid_book_embeddings.npy', allow_pickle=True)
    
    book_ids = np.load('../models/hybrid_book_ids.npy', allow_pickle=True)
    
    faiss_index = faiss.read_index('../models/faiss_index.idx')
except Exception as e:
    raise

def load_books():
    file_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'books_subset.csv')
    
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"CSV file not found at {file_path}")
    
    df = pd.read_csv(file_path)

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
    
    try:
        query_text = " ".join(user_preferences)
        
        query_embedding = encoder.encode([query_text])[0]
        query_embedding = query_embedding.astype('float32')
        
        distances, indices = faiss_index.search(query_embedding.reshape(1, -1), num_recommendations)
        
        recommended_titles = book_ids[indices[0]]
        
        all_books = load_books()

        title_to_book = {book['title'].lower().strip(): book for book in all_books}
        
        recommendations = []
        for title in recommended_titles:
            normalized_title = title.lower().strip()
            if normalized_title in title_to_book:
                recommendations.append(title_to_book[normalized_title])
        
        return recommendations
    except Exception as e:
        raise

@app.route('/api/books')
def get_books():
    try:
        books = load_books()
        return jsonify(books)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        user_preferences = request.json.get('preferences', [])
        
        if not user_preferences:
            return jsonify({'error': 'No preferences provided'}), 400
            
        recommendations = get_book_recommendations(user_preferences)
        return jsonify(recommendations)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    load_books()
    app.run(debug=True) 