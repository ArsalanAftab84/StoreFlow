from sentence_transformers import SentenceTransformer

class MLService:
    def __init__(self):
        self.model = None

    def load_model(self):
        # all-MiniLM-L6-v2 is fast, lightweight, and outputs the exact 384-dimension vectors we defined in our schema.
        print("Loading Hugging Face model into memory...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        print("Model loaded successfully.")

    def get_embedding(self, text: str) -> list[float]:
        if not self.model:
            raise RuntimeError("Model is not initialized.")
        # encode() returns a numpy array, we convert it to a standard Python list for pgvector
        return self.model.encode(text).tolist()

# Instantiate the singleton
ml_service = MLService()