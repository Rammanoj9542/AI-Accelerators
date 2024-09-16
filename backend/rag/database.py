from pymongo.mongo_client import MongoClient
import yaml


class MongoDBHandler:
    def __init__(self, mongo_ip, mongo_port):
        db_uri = "mongodb://"+mongo_ip+":"+mongo_port+"/"
        self.db_uri = db_uri
        self._connect_to_mongodb()

    def _connect_to_mongodb(self):
        self.client = MongoClient(self.db_uri)

        # Send a ping to confirm a successful connection
        try:
            self.client.admin.command("ping")
        except Exception as e:
            print(e)

    def get_org_id(self, client_api_key):
        try:
            db = self.client["aiAccelerator"]
            clientAPIKeys = db["clientApiKeys"]
            user_id_cursor = clientAPIKeys.find_one(
                {"clientApiKey": client_api_key},
                {"clientApiKey": 0, "_id": 0, "timestamp": 0},
            )
            user_id = user_id_cursor.get("userid")
            userDetails = db["userDetails"]
            organisation_cursor = userDetails.find_one(
                {"userid": user_id},
                {
                    "_id": 0,
                    "userid": 0,
                    "firstname": 0,
                    "lastname": 0,
                    "username": 0,
                    "password": 0,
                    "email": 0,
                    "number": 0,
                    "role": 0,
                    "tempOTP": 0,
                    "tempOTPtimestamp": 0,
                    "OTPattempts": 0,
                    "OTPlocked": 0,
                    "OTPlockedtill": 0,
                },
            )
            organisation = organisation_cursor.get("organisation")
            return organisation
        except Exception as e:
            print(f"Error fetching organisation: {e}")
            return None  # Return None in case of error

    def getEmbeddingModelDetails(self, clientApiKey, modelId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]
            if db is not None:
                EmbeddingModels = db["EmbeddingModels"]
                model_details_cursor = EmbeddingModels.find_one(
                    {"clientApiKey": clientApiKey, "modelId": modelId},
                    {"clientApiKey": 0, "_id": 0, "modelId": 0},
                )
                return model_details_cursor
            print("Error fetching Embedding Model details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'ModeDetails' : {e}")

    def getIngestConfig(self, clientApiKey, ingestId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]
            if db is not None:
                IngestConfig = db["IngestConfig"]
                IngestData = IngestConfig.find_one(
                    {"clientApiKey": clientApiKey, "ingestId": ingestId},
                    {"clientApiKey": 0, "_id": 0, "ingestId": 0},
                )
                return IngestData
            print("Error fetching Ingest Config details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'IngestData' : {e}")

    def getRetrievalConfig(self, clientApiKey, retrievalId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]
            if db is not None:
                RetrievalConfig = db["RetrievalConfig"]
                RetrievalData = RetrievalConfig.find_one(
                    {"clientApiKey": clientApiKey, "retrievalId": retrievalId},
                    {"clientApiKey": 0, "_id": 0, "retrievalId": 0},
                )
                return RetrievalData
            print("Error fetching Retrieval Config details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'RetrievalData' : {e}")

    def getLlmModelDetails(self, clientApiKey, modelId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]  # Use get() to handle missing org
            if db is not None:
                LLMModels = db["LLMModels"]
                model_details_cursor = LLMModels.find_one(
                    {"clientApiKey": clientApiKey, "modelId": modelId},
                    {"clientApiKey": 0, "_id": 0, "modelId": 0},
                )
                return model_details_cursor
            print("Error fetching LLM model details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'ModeDetails' : {e}")
            return None

    def getPromptDetails(self, clientApiKey, promptId):
        try:
            org = self.get_org_id(clientApiKey)
            if org:
                db = self.client[org]
            if db is not None:
                PromptConfig = db["LLMPrompts"]
                prompt_details_cursor = PromptConfig.find_one(
                    {"clientApiKey": clientApiKey, "promptId": promptId},
                    {"clientApiKey": 0, "_id": 0, "promptId": 0},
                )
                return prompt_details_cursor["systemMessage"]
            print("Error fetching Prompt details or missing data")
            return None
        except Exception as e:
            print(f"Error Fetching 'PromptDetails' : {e}")
            return None
