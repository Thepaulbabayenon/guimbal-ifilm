import pandas as pd
from sklearn.metrics import accuracy_score
import json
from sklearn.neighbors import NearestNeighbors  # Example model class

def evaluate_model():
  """Evaluates the trained model's performance."""

  # Load the trained model from JSON
  with open("ml/models/recommendationModel.json", "r") as f:
      model_dict = json.load(f)

  # Recreate the model instance based on the loaded information
  model_type = model_dict["model_type"]  # Assuming model type is stored in JSON
  if model_type == "NearestNeighbors": 
      model = NearestNeighbors(**model_dict["parameters"])  # Create model with parameters from JSON
  else:
      raise ValueError(f"Unsupported model type: {model_type}") 

  # Load test data
  test_data = pd.read_csv("ml/data/test_data.csv") 

  # Make predictions on test data
  predictions = model.predict(test_data) 

  # Calculate evaluation metrics
  accuracy = accuracy_score(test_data['userId'], predictions)
  print(f"Accuracy: {accuracy}")

if __name__ == "__main__":
  evaluate_model()