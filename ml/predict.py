import pandas as pd
import json
from sklearn.neighbors import NearestNeighbors  # Example model class

def make_recommendations(user_id):
  """Makes recommendations for a given user."""

  # Load the trained model from JSON
  with open("ml/models/recommendationModel.json", "r") as f:
      model_dict = json.load(f)

  # Recreate the model instance based on the loaded information
  model_type = model_dict["model_type"]
  if model_type == "NearestNeighbors":
      model = NearestNeighbors(**model_dict["parameters"])
  else:
      raise ValueError(f"Unsupported model type: {model_type}")

  # Load user data (replace with your data loading logic)
  data = pd.read_csv("ml/data/user_data.csv") 

  # Get user's interaction history
  user_history = data[data['userId'] == user_id]

  # Get recommendations from the model
  recommendations = model.kneighbors(user_history[['filmId', 'genre', 'director']], n_neighbors=6) 

  return recommendations

if __name__ == "__main__":
  user_id = 123  # Replace with the actual user ID
  recommendations = make_recommendations(user_id)
  print(recommendations)