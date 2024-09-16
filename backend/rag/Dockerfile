FROM tensorflow/tensorflow:latest-gpu

# Install Git
RUN apt-get update && apt-get install -y git

# Upgrade pip
RUN python3 -m pip install --upgrade pip

# Upgrade pip
RUN python -m pip install --upgrade pip

# Set the working directory inside the container to /app
WORKDIR /app

# Copy the requirements.txt file into the container
COPY ./requirements.txt .

RUN pip install pysqlite3-binary

RUN apt-get update && apt-get install libgl1 -y

RUN pip3 install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Install the Python dependencies specified in requirements.txt
RUN pip install  -r requirements.txt

# Copy the current directory into the container at /app
COPY . .

# Start the Flask application when the container starts
CMD ["python", "server.py"]

