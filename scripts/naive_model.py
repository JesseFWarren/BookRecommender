import pandas as pd

def load_metadata(path: str) -> pd.DataFrame:
    df = pd.read_csv(
        path,
        engine='python',
        on_bad_lines='skip'
    )

    print("Loaded columns:", df.columns.tolist())

    df.columns = df.columns.str.strip().str.lower()

    needed = ['title', 'authors', 'average_rating', 'ratings_count']
    missing = [c for c in needed if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")
    return df[needed]

def get_top_books(df: pd.DataFrame, k: int = 10, min_ratings: int = 50) -> pd.DataFrame:
    df = df[df['ratings_count'] >= min_ratings].copy()
    df = df.sort_values(
        by=['average_rating', 'ratings_count'],
        ascending=[False, False]
    )
    return df.head(k).reset_index(drop=True)

if __name__ == "__main__":
    meta = load_metadata("../data/books.csv")
    top10 = get_top_books(meta, k=10, min_ratings=100)
    print(top10)
    top10.to_csv("top10_naive.csv", index=False)
