import pandas as pd

def load_metadata(path: str) -> pd.DataFrame:
    """
    Load book metadata from a CSV file and validate columns.

    Args:
        path (str): Path to the metadata CSV.

    Returns:
        pd.DataFrame: Filtered DataFrame containing only required columns.
    """
    df = pd.read_csv(path, engine='python', on_bad_lines='skip')
    print("Loaded columns:", df.columns.tolist())

    df.columns = df.columns.str.strip().str.lower()

    required_cols = ['title', 'authors', 'average_rating', 'ratings_count']
    missing = [col for col in required_cols if col not in df.columns]
    if missing:
        raise ValueError(f"Missing columns: {missing}")

    return df[required_cols]


def get_top_books(df: pd.DataFrame, k: int = 10, min_ratings: int = 50) -> pd.DataFrame:
    """
    Return the top k books by average rating, filtered by minimum number of ratings.

    Args:
        df (pd.DataFrame): DataFrame of book metadata.
        k (int): Number of top books to return.
        min_ratings (int): Minimum number of ratings required to be considered.

    Returns:
        pd.DataFrame: Top k books meeting the rating threshold.
    """
    filtered = df[df['ratings_count'].astype(int) >= min_ratings].copy()
    sorted_df = filtered.sort_values(
        by=['average_rating', 'ratings_count'],
        ascending=[False, False]
    )
    return sorted_df.head(k).reset_index(drop=True)


def main():
    metadata_path = "../data/books.csv"
    output_path = "top10_naive.csv"

    meta = load_metadata(metadata_path)
    top10 = get_top_books(meta, k=10, min_ratings=100)

    print("\nTop 10 globally top-rated books:")
    print(top10)

    top10.to_csv(output_path, index=False)
    print(f"Saved top 10 list to {output_path}")


if __name__ == "__main__":
    main()
