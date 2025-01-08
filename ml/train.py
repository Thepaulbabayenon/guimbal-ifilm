import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import NearestNeighbors

def train_model():
    """Trains an item-based collaborative filtering model."""

    data = pd.read_csv("ml/data/processed_data.csv")

    # Prepare data for model training
    X = data[['filmId', 'genre', 'director']]  # Features for item similarity
    y = data['userId']  # Target variable (user IDs)

    # Split data into training and testing sets
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Create and train the model
    model = NearestNeighbors(n_neighbors=5, metric='cosine') 
    model.fit(X_train)

    # Save the trained model
    # joblib.dump(model, "ml/models/recommendation_model.pkl") 

if __name__ == "__main__":
    train_model()