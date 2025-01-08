import pandas as pd

def load_and_preprocess_data():
    """Loads and preprocesses the user-item interaction data."""

    # Load data
    interaction_df = pd.read_json("ml/data/interactionData.json") 
    film_metadata_df = pd.read_json("ml/data/filmMetadata.json")

    # Preprocessing steps (example)
    # 1. Handle missing values
    interaction_df.fillna(0, inplace=True) 

    # 2. Feature engineering (example)
    # Create a new feature: number of interactions per user
    user_interaction_counts = interaction_df.groupby('userId').size()
    interaction_df = interaction_df.join(user_interaction_counts, on='userId', rsuffix='_count')

    # 3. Join with film metadata (example)
    interaction_df = pd.merge(interaction_df, film_metadata_df, on='filmId', how='left')

    # 4. ... more preprocessing steps as needed

    return interaction_df

if __name__ == "__main__":
    processed_data = load_and_preprocess_data()
    processed_data.to_csv("ml/data/processed_data.csv", index=False)