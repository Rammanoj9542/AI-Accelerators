# AI Accelerators

This project consists of multiple services to create an AI Accelerators Platform. The services include backend servers, frontend applications, and various AI-related services, all orchestrated using Docker Compose.

## Prerequisites

- Docker Desktop
- Node
- Npm
- Ubuntu or Windows Subsystem for Linux (WSL)

## Services

- `server`: The main backend server.
- `llm_openai_cloud`: Backend service for handling OpenAI requests.
- `stt_wispher`: Speech-to-Text service.
- `stt_openai_cpu_local`: CPU-based local STT service.
- `stt_openai_gpu_local`: GPU-based local STT service.
- `rag`: Retrieval-Augmented Generation service.
- `frontend`: The frontend application.
- `mongo`: MongoDB database.
- `redis`: Redis cache.
- `redis_insight`: Redis Insight for monitoring Redis.

## Environment Variables

### Setting Environment Variables
   
   To set the required environment variables, follow these steps:
   
   1. Open the `~/.bashrc` file in a text editor with superuser permissions:

      ```shell
      sudo nano ~/.bashrc
      ```

   2. Add the following lines to the end of the ~/.bashrc file:

      ```shell
      export mongo_ip=YOUR_MONGO_IP
      export mongo_port=YOUR_MONGO_PORT
      export AIServicesIp=YOUR_AI_SERVICES_IP
      export AIServerPort=YOUR_AI_SERVER_PORT
      export OpenAiApiKey=YOUR_OPENAI_API_KEY
      ```

   3. Save the file and exit the editor (press CTRL+O to save, then CTRL+X to exit).

   4. Apply the changes to your current session:

      ```shell
      source ~/.bashrc
      ```

### Editing Environment Variables

If you need to change any environment variable (e.g., IP addresses or ports):

   1. Open the ~/.bashrc file in a text editor with superuser permissions:

      ```shell
      sudo nano ~/.bashrc
      ```

   2. Modify the desired variables.

   3. Save the file and exit the editor.

   4. Apply the changes to your current session:

      ```shell
      source ~/.bashrc
      ```
## Directory Structure

- `backend/server`: Contains the main backend server code.
- `backend/llm_openai_cloud`: Contains the OpenAI backend service code.
- `backend/stt_wispher`: Contains the Wispher STT service code.
- `backend/stt_openai_cpu_local`: Contains the local CPU STT service code.
- `backend/stt_openai_gpu_local`: Contains the local GPU STT service code.
- `backend/rag`: Contains the RAG service code.
- `frontend`: Contains the frontend application code.

## Volumes

- `/home/ubuntu/ai-tutor-bucket`: Base directory for persistent data.
- `/home/ubuntu/ai-tutor-db`: Base directory for MongoDB data.
- `redis_volume_data`: Volume for Redis data.
- `redis_insight_volume_data`: Volume for Redis Insight data.

## How to Run

   1. Clone the Repository
      
         ```shell
         git clone https://github.com/KumarBrillius/AI-Accelerators.git
         cd AI-Accelerators
         ```

   2. Set the Environment Variables

      Follow the steps in the [Setting Environment Variables](#setting-environment-variables) section to set up your environment variables.

   3. Build and Start the Services
      
      #### To Build and Run All Services

      To build and run all services at once:

         ```shell
         docker-compose up --build
         ```

      #### To Build and Run Individual Services

      To build and run each service individually, you can specify the service name after the up command. For example, to build and run only the server service:

         ```shell
         docker-compose up --build server
         ```

   4. Ensure MongoDB and Redis are Running

      All services will depend on the MongoDB and Redis services being up and running. Docker Compose will handle this dependency.

## Service ports

- `server`: 4001
- `llm_openai_cloud`: 6002
- `stt_wispher`: 5004
- `stt_openai_cpu_local`: 5005
- `stt_openai_gpu_local`: 5006
- `rag`: 7001
- `frontend`: 3001
- `mongo`: 27017
- `redis`: 6379
- `redis_insight`: 8001

## Accessing the Services

- `Frontend`: Open your browser and go to `http://localhost:3001`.
- `MongoDB`: Connect to `localhost:27017`.
- `Redis`: Connect to `localhost:6379`.
- `Redis` Insight: Open your browser and go to `http://localhost:8001`.

## Stopping the Services

   To stop the services, run:

   ```shell
   docker-compose down
   ```

   This command will stop all running containers and remove the associated networks.

## Logs

Logs for each service are available in the respective directories under /home/ubuntu/ai-tutor-bucket/platform/backend/.

## Notes

- Make sure you have the necessary permissions to access the directories used as volumes.
- Adjust the ports in the `docker-compose.yml` file if there are any conflicts with existing services on your host machine.
- This setup assumes you are running on an Ubuntu machine or using WSL. Adjust paths accordingly if using a different OS.

## Troubleshooting

- `Docker Permission Issues`: Ensure your user is added to the Docker group or use `sudo` to run Docker commands.
- `Environment Variables`: Double-check the values in your `.bashrc` file.
- `Network Issues`: Ensure Docker has the necessary permissions to create and manage networks.
