FROM ubuntu:22.04

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl gnupg ca-certificates software-properties-common && \
    rm -rf /var/lib/apt/lists/*

# Install Ollama
RUN curl -fsSL https://ollama.com/install.sh | sh

# Copy your custom Modelfile
COPY modelfile /Modelfile

# Expose the Ollama API port
EXPOSE 11434

# Run Ollama, pull model, create your model, and keep the server alive
CMD ollama serve & \
    sleep 5 && \
    ollama pull llama3:3.2 && \
    ollama create zenobot -f /Modelfile && \
    tail -f /dev/null
