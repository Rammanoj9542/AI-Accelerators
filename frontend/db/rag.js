const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const yaml = require('js-yaml');

// MongoDB connection setup
const mongoIp = process.env.mongo_ip;
const mongoPort = process.env.mongo_port;

// Constructing the MongoDB URI
const dbUri = `mongodb://${mongoIp}:${mongoPort}/`;

const client = new MongoClient(dbUri);


// Function to generate a random ID for various purposes
function generateID(length) {
    let result = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - LLM Functions - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// Function to get model names 
async function getRAGModelNames() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelNameCollection = db.collection("RAGmodelNames");
        const modelNamesCursor = modelNameCollection.find({}, { projection: { _id: 0 } });
        const modelNames = await modelNamesCursor.toArray();
        const modelNameList = modelNames.map(modelName => modelName.modelName);
        return modelNameList;
    } catch (e) {
        console.error(`Error in getRAGModelNames: ${e}`);
        return [];
    }
}

// Function to get device types
async function getRAGDeviceTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const deviceTypesCollection = db.collection("RAGdeviceTypes");
        const deviceTypesCursor = deviceTypesCollection.find({}, { projection: { _id: 0 } });
        const deviceTypes = await deviceTypesCursor.toArray();
        const deviceTypesList = deviceTypes.map(deviceType => deviceType.deviceType);
        return deviceTypesList;
    } catch (e) {
        console.error(`Error in getRAGDeviceTypes: ${e}`);
        return [];
    }
}

// Function to get Splitter types
async function getRAGSplitterTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const splitterTypesCollection = db.collection("RAGsplitterTypes");
        const splitterTypesCursor = splitterTypesCollection.find({}, { projection: { _id: 0 } });
        const splitterTypes = await splitterTypesCursor.toArray();
        const splitterTypesList = splitterTypes.map(splitterType => splitterType.splitterType);
        return splitterTypesList;
    } catch (e) {
        console.error(`Error in getRAGsplitterTypes: ${e}`);
        return [];
    }
}
// Function to add RAG model to the database
async function getRagModelIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");
        const existingModelIdsCursor = RAGModels.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, modelName: 0, deviceType: 0 } });
        const existingModelIds = await existingModelIdsCursor.toArray();
        const modelIds = existingModelIds.map(model => model.modelId);
        return modelIds;
    } catch (e) {
        console.error(`Error Fetching RAG 'ModelIds' table: ${e}`);
    }
}

// Function to retrieve RAG configuration IDs for a specific client API key
async function getRagConfigIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("RAGConfigs");
        const existingConfigIdsCursor = RAGConfigs.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, chunkSize: 0, chunkOverlap: 0 } });
        const existingConfigIds = await existingConfigIdsCursor.toArray();
        const configIds = existingConfigIds.map(config => config.configId);
        return configIds;
    } catch (e) {
        console.error(`Error Fetching RAG 'ModelIds' table: ${e}`);
    }
}

// Function to add RAG model to the database
async function addRagModel(organisation, clientApiKey, modelName, deviceType) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");

        let isModelIdNew = false;
        let modelId;

        do {
            modelId = generateID(4);
            isModelIdNew = await RAGModels.findOne({ clientApiKey: clientApiKey, modelId: modelId });
        } while (isModelIdNew);

        const timestamp = moment.utc().unix();
        const RAGModelsData = { clientApiKey: clientApiKey, modelId: modelId, modelName: modelName, deviceType: deviceType, timestamp: timestamp };
        await RAGModels.insertOne(RAGModelsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'RAGModels' table: ${e}`);
        return false;
    }
}

// Function to update an existing RAG model in the database
async function updateRagModel(organisation, clientApiKey, modelId, modelName, deviceType) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");
        const timestamp = moment.utc().unix();
        await RAGModels.updateOne(
            { clientApiKey: clientApiKey, modelId: modelId },
            { $set: { modelName: `${modelName}`, deviceType: `${deviceType}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating RAG Model : ${e}`);
        return false;
    }
}

// Function to retrieve RAG model details for a specific client API key
async function getRagModelDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");
        const modelDetailsCursor = await RAGModels.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

// Function to add RAG configuration to the database
async function addRagConfig(organisation, document) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("IngestConfig");
        let isConfigNew = false;
        do {
            var ingestId = generateID(4);
            isConfigNew = await RAGConfigs.findOne({ clientApiKey: document.clientApiKey, ingestId: ingestId });
        } while (isConfigNew);

        const timestamp = moment.utc().unix();
        document.timestamp = timestamp
        document.ingestId = ingestId
        await RAGConfigs.insertOne(document);
        return true;
    } catch (e) {
        console.error(`Error adding into 'RAGConfigs' table: ${e}`);
        return false;
    }
}

// Function to update an existing RAG configuration in the database
async function updateRagConfig(organisation,document) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("IngestConfig");
        const timestamp = moment.utc().unix();
        document.timestamp = timestamp

        await RAGConfigs.deleteOne(
            { clientApiKey: document.clientApiKey, ingestId: document.ingestId },
            );
        await RAGConfigs.insertOne(document);
        return true;
    } catch (e) {
        console.error(`Error Updating RAG Config : ${e}`);
        return false;
    }
}

// Function to retrieve RAG configuration details for a specific client API key
async function getRagConfigDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGConfigs = db.collection("IngestConfig");
        const configDetailsCursor = await RAGConfigs.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return configDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Config Details : ${e}`);
    }
}

// Function to retrieve RAG model ID info for a specific Model ID
async function getRagModelIdInfo(organisation, clientApiKey, modelId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");
        const modelInfoCursor = await RAGModels.find({ clientApiKey: clientApiKey, modelId : modelId }, { projection: { clientApiKey : 0, _id : 0, modelId : 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelInfoCursor[0];
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

// Function to retrieve RAG Ingest ID info for a specific Ingest ID
async function getRagIngestIdInfo(organisation, clientApiKey,ingestId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("IngestConfig");
        const modelInfoCursor = await RAGModels.find({ clientApiKey: clientApiKey, ingestId : ingestId }, { projection: { clientApiKey : 0, _id : 0, modelId : 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelInfoCursor[0];
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}
// Function to Add New Ingest Deploy Id
async function addIngestDeploy(organisation, data) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        let isDeployIdNew = false;
        let document = data
        let deployId;
        const isTagName = await deploymentConfig.findOne({clientApiKey: document.clientApiKey, service : 'ragIngest' , tagName: document.tagName });

        if (isTagName) {
            return 409
        } else {
            do {
                deployId = generateID(4);
                isDeployIdNew = await deploymentConfig.findOne({ clientApiKey: document.clientApiKey, deployId: deployId });
            } while (isDeployIdNew);
            document.deployId = deployId;
            document.timestamp = moment.utc().unix();
            document.service = 'ragIngest';
            document.serviceApi = '7001/rag/ingest'; 
            await deploymentConfig.insertOne(document);
            return 200;
        }
    } catch (e) {
        console.error(`Error adding into 'deploy config' table: ${e}`);
        return 500;
    }
}
// function to get All RAG Ingest Deploy Details using ApiKey
async function getIngestDeployDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const deployDetailsCursor = await deploymentConfig.find({ clientApiKey: clientApiKey, service : 'ragIngest' }, { projection: { clientApiKey: 0, _id: 0, service: 0, serviceUrl : 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return deployDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Ingest Deploy Details : ${e}`);
    }
}
// Function to Update existing Ingest Deploy Config
async function updateIngestDeploy(organisation, data) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const document = data
        const timestamp = moment.utc().unix();
        if (document.oldTagName !== document.newTagName){
            let isTagName = await deploymentConfig.findOne({clientApiKey: document.clientApiKey, service : 'ragIngest' , tagName: document.newTagName });
            if (isTagName) {
                return 409
            }
        }              
        await deploymentConfig.updateOne(
            { clientApiKey: document.clientApiKey, deployId: document.deployId, service : 'ragIngest'},
            { $set: { clientApiKey: `${document.clientApiKey}`,tagName: `${document.newTagName}`, modelId: `${document.modelId}`, ingestId: `${document.ingestId}`, timestamp: timestamp } }
        );
        return 200;
    } catch (e) {
        console.error(`Error Updating Ingest Deploy Config in 'deploy config' table: ${e}`);
        return 500;
    }
}
// function to get RAG Ingest Deploy Id Details using ApiKey and deploy Id
async function getIngestDeployIdInfo(organisation, clientApiKey,deployId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const deployIdInforCursor = await deploymentConfig.find({ clientApiKey: clientApiKey, deployId: deployId, service : 'ragIngest' }, { projection: { clientApiKey: 0, _id: 0, service: 0, serviceUrl : 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return deployIdInforCursor[0];
    } catch (e) {
        console.error(`Error fetching Ingest Deploy Id Info : ${e}`);
    }
}
// Function to get Rag retrieval types
async function getRAGretrievalTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const retivalTypesCollection = db.collection("RAGretrievalTypes");
        const retrievalTypesCursor = retivalTypesCollection.find({}, { projection: { _id: 0 } });
        const retrievalTypes = await retrievalTypesCursor.toArray();
        const retrievalTypesList = retrievalTypes.map(retrievalType => retrievalType.retrievalType);
        return retrievalTypesList;
    } catch (e) {
        console.error(`Error in getRAGretrievalTypes: ${e}`);
        return [];
    }
}
// Function to get for Rag retrieval technologies
async function getRAGretrievalTechs(retrievalType) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const retivalTypesCollection = db.collection("RAGretrievalTypes");
        const retrievalTechsCursor = retivalTypesCollection.find({retrievalType : retrievalType}, { projection: { _id: 0 } });
        const retrievalTechs = await retrievalTechsCursor.toArray();
        const retrievalTechsList = retrievalTechs.map(retrieval => retrieval.retrievalTechnique);
        return retrievalTechsList[0];
    } catch (e) {
        console.error(`Error in getRAGretrievalTechs: ${e}`);
        return [];
    }
}
// Function to get for Rag retrieval chain types
async function getRAGretrievalChainTypes(retrievalType) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const retivalTypesCollection = db.collection("RAGretrievalTypes");
        const retrievalTypesCursor = retivalTypesCollection.find({retrievalType : retrievalType}, { projection: { _id: 0 } });
        const retrievalChainTypes = await retrievalTypesCursor.toArray();
        const retrievalChainList = retrievalChainTypes.map(retrieval => retrieval.chainTypes);
        return retrievalChainList[0];
    } catch (e) {
        console.error(`Error in getRAGretrievalChainTypes: ${e}`);
        return [];
    }
}
// Function to get modelIds for Rag retrieval Config
async function getModelIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const llmModelsCollection = db.collection("LLMModels");
        const modelIdsCursor = llmModelsCollection.find({clientApiKey : clientApiKey}, { projection: { _id :0, modelId: 1 } })
        .sort({ timestamp: -1 }) // Sort by timestamp in descending order
        const modelIds = await modelIdsCursor.toArray();
        const modelIdsList = modelIds.map(model=>model.modelId)
        return modelIdsList;
    } catch (e) {
        console.error(`Error in getModelIds: ${e}`);
        return [];
    }
}
// Function to get QAretrieval type Prompt Ids for Rag Retrieval Config.
async function getPromptIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const llmPromptCollection = db.collection("LLMPrompts");
        const promptIdsCursor = llmPromptCollection.find({clientApiKey : clientApiKey, appType: 'QAretrieval'}, { projection: { _id :0, promptId: 1 } })
        .sort({ timestamp: -1 }) // Sort by timestamp in descending order
        const promptIds = await promptIdsCursor.toArray();
        const promptIdsList = promptIds.map(prompt=>prompt.promptId)
        return promptIdsList;
    } catch (e) {
        console.error(`Error in getPromptIds: ${e}`);
        return [];
    }
}
// Function to add a new Rag retrieval config
async function addRetrievalConfig(organisation, document) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const retrievalConfigCollection = db.collection("RetrievalConfig");
    let isConfigNew = false;
    do {
        var retrievalId = generateID(4);
        isConfigNew = await retrievalConfigCollection.findOne({ clientApiKey: document.clientApiKey, retrievalId: retrievalId });
    } while (isConfigNew);

    const timestamp = moment.utc().unix();
    document.timestamp = timestamp
    document.retrievalId = retrievalId
    await retrievalConfigCollection.insertOne(document);
    return true;
    } catch (e) {
        console.error(`Error in addRetrievalConfig: ${e}`);
        return [];
    }
}
// function to get All RAG Ingest Deploy Details using ApiKey
async function getRetrievalConfigDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const retrievalConfig = db.collection("RetrievalConfig");
        const configDetailsCursor = await retrievalConfig.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return configDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Retrieval Config Details : ${e}`);
    }
}
// Function to update existing Rag retrieval config
async function updateRetrievalConfig(organisation, document) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const retrievalConfigs = db.collection("RetrievalConfig");
        const timestamp = moment.utc().unix();
        document.timestamp = timestamp
        await retrievalConfigs.deleteOne(
            { clientApiKey: document.clientApiKey, retrievalId: document.retrievalId },
            );
        await retrievalConfigs.insertOne(document);
        return true;
    } catch (e) {
        console.error(`Error in updateRetrievalConfig: ${e}`);
        return false;
    }
}
// Function to add presist directory path.
async function addPresistDirPath(organisation, document) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const embeddedDataPathCollection = db.collection("embeddedDataPath");
    const persistDirectory = document.persistDirectory;
    let isPath = await embeddedDataPathCollection.findOne({persistDirectory: persistDirectory});
    if (isPath) {
        return 409;
    } else {
        document.timestamp = moment.utc().unix();
        await embeddedDataPathCollection.insertOne(document);
        return 200;
    }
    } catch (e) {
        console.error(`Error in addPresistDirPath: ${e}`);
        return [];
    }
}
// Function to get presist directory paths.
async function getPresistDirPaths(organisation, clientApiKey, userId) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const embeddedDataPathCollection = db.collection("embeddedDataPath");
    const presistDirPaths = await embeddedDataPathCollection.find({ingestedBy: userId }, { projection: {  _id: 0, persistDirectory: 1 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
    const presistDirPathsList = presistDirPaths.map(object=>object.persistDirectory)
        return presistDirPathsList;
    } catch (e) {
        console.error(`Error in getPresistDirPaths: ${e}`);
    }
}
// Function to get presist directory paths Info.
async function getPresistDirPathInfo(organisation, clientApiKey, userId, presistDir) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const embeddedDataPathCollection = db.collection("embeddedDataPath");
    const presistDirPathInfo = await embeddedDataPathCollection.find({ingestedBy: userId, persistDirectory: presistDir }, { projection: { modelId: 1, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return presistDirPathInfo[0].modelId;
    } catch (e) {
        console.error(`Error in getPresistDirPathInfo: ${e}`);
    }
}
// Function to add RAG model to the database
async function getModelIdInfo(organisation, clientApiKey, modelId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const RAGModels = db.collection("EmbeddingModels");
        const existingModelIdsCursor = RAGModels.find({ clientApiKey: clientApiKey, modelId: modelId }, { projection: { _id: 0, clientApiKey: 0, deviceType: 0 } });
        const existingModelIds = await existingModelIdsCursor.toArray();
        const modelName = existingModelIds.map(model => model.modelName);
        return modelName[0];
    } catch (e) {
        console.error(`Error Fetching RAG model Name for Presist Directory path: ${e}`);
    }
}
// Function to get RAG Retrieval Ids.
async function getRetrievalIds(organisation, clientApiKey) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const retrievalConfigCollection = db.collection("RetrievalConfig");
    const retrievalIds = await retrievalConfigCollection.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
            const retrievalIdsList = retrievalIds.map(object=>object.retrievalId)
        return retrievalIdsList;
    } catch (e) {
        console.error(`Error in getRetrievalIds: ${e}`);
    }
}
// Function to get RAG Retrieval Id Info.
async function getRetrievalIdInfo(organisation, clientApiKey, retrievalId) {
    try {
     await client.connect();
    const db = client.db(organisation);
    const retrievalConfigCollection = db.collection("RetrievalConfig");
    const retrievalIdInfo = await retrievalConfigCollection.find({ clientApiKey: clientApiKey, retrievalId: retrievalId }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return retrievalIdInfo[0];
    } catch (e) {
        console.error(`Error in getRetrievalIdInfo: ${e}`);
    }
}
// Function to Add New Retrival Deploy Id
async function addRetrievalDeploy(organisation, data) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        let isDeployIdNew = false;
        let document = data
        let deployId;
        const isTagName = await deploymentConfig.findOne({clientApiKey: document.clientApiKey, service : 'ragRetrieval' , tagName: document.tagName });

        if (isTagName) {
            return 409
        } else {
            do {
                deployId = generateID(4);
                isDeployIdNew = await deploymentConfig.findOne({ clientApiKey: document.clientApiKey, deployId: deployId });
            } while (isDeployIdNew);
            document.deployId = deployId;
            document.timestamp = moment.utc().unix();
            document.service = 'ragRetrieval';
            document.serviceApi = '7001/rag/inference'; 
            await deploymentConfig.insertOne(document);
            return 200;
        }
    } catch (e) {
        console.error(`Error adding into 'deploy config' table: ${e}`);
        return 500;
    }
} 
// function to get RAG Ingest Deploy Ids using ApiKey
async function getRetrievalDeployDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const deployIdsCursor = await deploymentConfig.find({ clientApiKey: clientApiKey, service : 'ragRetrieval' }, { projection: { clientApiKey: 0, _id: 0, service: 0, serviceUrl : 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return deployIdsCursor;
    } catch (e) {
        console.error(`Error fetching Ingest Deploy Id Info : ${e}`);
    }
}

module.exports = [getRAGModelNames, getRAGDeviceTypes, getRagModelIds, addRagModel, getRAGSplitterTypes, updateRagModel, getRagModelDetails, addRagConfig, getRagConfigIds, updateRagConfig, getRagConfigDetails, getRagModelIdInfo, getRagIngestIdInfo, addIngestDeploy, getIngestDeployDetails, updateIngestDeploy, getIngestDeployIdInfo, getRAGretrievalTypes, getRAGretrievalTechs, getRAGretrievalChainTypes, getModelIds, getPromptIds, addRetrievalConfig, getRetrievalConfigDetails, updateRetrievalConfig, addPresistDirPath, getPresistDirPaths, getPresistDirPathInfo, getModelIdInfo, getRetrievalIds, getRetrievalIdInfo, addRetrievalDeploy, getRetrievalDeployDetails];