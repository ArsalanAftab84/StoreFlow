# Use the official Miniconda image as the base
FROM continuumio/miniconda3 AS runtime

WORKDIR /app

# Copy the environment file first to leverage Docker's layer caching
COPY environment.yml .

# Create the Conda environment
RUN conda env create -f environment.yml

# Copy the application code
COPY . .

# Expose the standard FastAPI port
EXPOSE 8000

# Use conda run to execute uvicorn within the isolated environment securely. 
# In production, increasing --workers to match CPU cores handles higher traffic.
ENTRYPOINT ["conda", "run", "--no-capture-output", "-n"]
# NOTE: Modify the environment name below for each specific service's Dockerfile
CMD ["ecommerce-ai-service", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]