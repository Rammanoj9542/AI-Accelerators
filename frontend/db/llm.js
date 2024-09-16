const { MongoClient } = require('mongodb');
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const yaml = require('js-yaml');
const { Console } = require('console');

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

// Function to get language model mode types
async function getLLMModeTypes() {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modeTypesCollection = db.collection("modeTypes");
        const modeTypesCursor = modeTypesCollection.find({ type: "llm" }, { projection: { _id: 0 } });
        const modeTypes = await modeTypesCursor.toArray();
        const modeTypeList = modeTypes.map(modeType => modeType.modeType);
        return modeTypeList;
    } catch (e) {
        console.error(`Error in getModeType: ${e}`);
        return [];
    }
}

// Function to get language model based on mode type
async function getModels(mode) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelTypesCollection = db.collection("LLMmodelTypes");
        const modelTypesCursor = modelTypesCollection.find({ modeType: mode }, { projection: { _id: 0, modeType: 0 } });
        const modelTypes = await modelTypesCursor.toArray();
        const modelTypeList = modelTypes.map(modelType => modelType.modelType);
        return modelTypeList;
    } catch (e) {
        console.error(`Error in getModels: ${e}`);
        return [];
    }
}

// Function to get model names based on language model
async function getLLMModelNames(model) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const modelNameCollection = db.collection("LLMmodelNames");
        const modelNamesCursor = modelNameCollection.find({ modelType: model }, { projection: { _id: 0, modelType: 0, engine: 0 } });
        const modelNames = await modelNamesCursor.toArray();
        const modelNameList = modelNames.map(modelName => modelName.modelName);
        return modelNameList;
    } catch (e) {
        console.error(`Error in getLLMModelNames: ${e}`);
        return [];
    }
}

// Function to get engines based on model name
async function getEngines(modelName) {
    try {
        await client.connect();
        const db = client.db("aiAccelerator");
        const engineCollection = db.collection("LLMmodelNames");
        const engineCursor = engineCollection.find({ modelName: modelName }, { projection: { _id: 0, modelType: 0, modelName: 0 } });
        const engines = await engineCursor.toArray();
        const engineList = engines.map(engine => engine.engine);
        return engineList;
    } catch (e) {
        console.error(`Error in getEngines: ${e}`);
        return [];
    }
}

// Function to add a new language model to the database
async function addLlmModel(organisation, clientApiKey, mode, model, modelName, engine, cloudAPIKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMModels = db.collection("LLMModels");

        let isModelIdNew = false;
        let modelId;

        do {
            modelId = generateID(4);
            isModelIdNew = await LLMModels.findOne({ clientApiKey: clientApiKey, modelId: modelId });
        } while (isModelIdNew);

        if (mode === "Cloud") {
            cloudAPIKey == cloudAPIKey;
        } else {
            cloudAPIKey == "";
        }

        const timestamp = moment.utc().unix();
        const LLMModelsData = { clientApiKey: clientApiKey, modelId: modelId, mode: mode, modelType: model, modelName: modelName, engine: engine, cloudAPIKey: cloudAPIKey, timestamp: timestamp };
        await LLMModels.insertOne(LLMModelsData);
        return true;
    } catch (e) {
        console.error(`Error adding into 'LLMModels' table: ${e}`);
        return false;
    }
}

// Function to update an existing language model in the database
async function updateLlmModel(organisation, clientApiKey, modelId, mode, model, modelName, engine, cloudAPIKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("LLMModels");
        const timestamp = moment.utc().unix();

        if (mode === "Cloud") {
            cloudAPIKey = cloudAPIKey;
        } else {
            cloudAPIKey = "";
        }

        await STTModels.updateOne(
            { clientApiKey: clientApiKey, modelId: modelId },
            { $set: { mode: `${mode}`, modelType: `${model}`, modelName: `${modelName}`, engine: `${engine}`, cloudAPIKey: `${cloudAPIKey}`, timestamp: timestamp } }
        );
        return true;
    } catch (e) {
        console.error(`Error Updating STT Model : ${e}`);
        return false;
    }
}

// Function to get language model details based on the client API key
async function getLlmModelDetails(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMModels = db.collection("LLMModels");
        const modelDetailsCursor = await LLMModels.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return modelDetailsCursor;
    } catch (e) {
        console.error(`Error fetching Model Details : ${e}`);
    }
}

// Function to get language model IDs based on the client API key
async function getLlmModelIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const STTModels = db.collection("LLMModels");
        const existingModelIdsCursor = STTModels.find({ clientApiKey: clientApiKey }, { projection: { _id: 0, clientApiKey: 0, mode: 0, modelName: 0 } });
        const existingModelIds = await existingModelIdsCursor.toArray();
        const modelIds = existingModelIds.map(model => model.modelId);
        return modelIds;
    } catch (e) {
        console.error(`Error Fetching LLM 'ModelIds' table: ${e}`);
    }
}

// Function to add a new prompt to the database
async function addPrompt(organisation, jsonData) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const prompts = db.collection("LLMPrompts");
        const clientApiKey = jsonData.clientApiKey;

        let isPromptIdNew = false;
        let promptId;

        do {
            promptId = generateID(4);
            isPromptIdNew = await prompts.findOne({ clientApiKey: clientApiKey, promptId: promptId });
        } while (isPromptIdNew);

        const timestamp = moment.utc().unix();
        jsonData.timestamp = timestamp;
        jsonData.promptId = promptId;

        if (jsonData.appType === 'simple') {
            delete jsonData.memoryType;
            delete jsonData.kValue;
            delete jsonData.tokenLimit;
        } else if (jsonData.appType === 'conversational') {
            if (jsonData.memoryType === 'buffer' || jsonData.memoryType === 'summarised') {
                delete jsonData.kValue;
                delete jsonData.tokenLimit;
            } else if (jsonData.memoryType === 'windowBuffer') {
                delete jsonData.tokenLimit;
            } else if (jsonData.memoryType === 'tokenBuffer') {
                delete jsonData.kValue;
            }
        }
        await prompts.insertOne(jsonData);
        return true;
    } catch (e) {
        console.error(`Error adding prompt: ${e}`);
        return false;
    }
}

// Function to get language model prompt IDs based on the client API key
async function getLlmPromptIds(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMPrompts = db.collection("LLMPrompts");
        const existingPromptIdsCursor = await LLMPrompts.find({ clientApiKey: clientApiKey }).toArray();
        const promptIds = existingPromptIdsCursor.map(prompt => prompt.promptId);
        return promptIds;
    } catch (e) {
        console.error(`Error Fetching LLM 'ModelIds' table: ${e}`);
    }
}

// Function to update an existing prompt in the database
async function updatePrompt(organisation, jsonData) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const prompts = db.collection("LLMPrompts");
        const clientApiKey = jsonData.clientApiKey;
        const promptId = jsonData.promptId;
        const deleteRecord = { clientApiKey: clientApiKey, promptId: promptId };
        await prompts.deleteOne(deleteRecord);

        if (jsonData.promptType === 'simple') {
            delete jsonData.systemMessage;
            delete jsonData.aiMessage;
            delete jsonData.humanMessage;
        } else if (jsonData.promptType === 'system') {
            delete jsonData.simplePrompt;
        }

        if (jsonData.appType === 'simple') {
            delete jsonData.memoryType;
            delete jsonData.kValue;
            delete jsonData.tokenLimit;
        } else if (jsonData.appType === 'conversational') {
            if (jsonData.memoryType === 'buffer' || jsonData.memoryType === 'summarised') {
                delete jsonData.kValue;
                delete jsonData.tokenLimit;
            } else if (jsonData.memoryType === 'windowBuffer') {
                delete jsonData.tokenLimit;
            } else if (jsonData.memoryType === 'tokenBuffer') {
                delete jsonData.kValue;
            }
        }
        const timestamp = moment.utc().unix();
        jsonData.timestamp = timestamp;

        await prompts.insertOne(jsonData);
        return true;
    } catch (e) {
        console.error(`Error updating prompt: ${e}`);
        return false;
    }
}

// Function to get language model prompts data based on the client API key
async function getLlmPromptsData(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMPrompts = db.collection("LLMPrompts");
        const LLMPromptsCursor = await LLMPrompts.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return LLMPromptsCursor;
    } catch (e) {
        console.error(`Error fetching Prompts Details : ${e}`);
    }
}
// Function to add LMM Inferance parameters
async function addLLMinferanceParams(organisation, document) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const inferanceConfig = db.collection("inferanceConfigs");
        let inferanceParametersIdNew = false;
        let inferanceId;
        const isname = await inferanceConfig.findOne({clientApiKey: document.clientApiKey, name: document.name });

        if (isname) {
            return 404
        } else {
            do {
                inferanceId = generateID(4);
                inferanceParametersIdNew = await inferanceConfig.findOne({ clientApiKey: document.clientApiKey, inferanceId: inferanceId });
            } while (inferanceParametersIdNew);

            const timestamp = moment.utc().unix();
            document.inferanceId = inferanceId;
            document.timestamp = timestamp;
            await inferanceConfig.insertOne(document);
            return 200;
        }
    } catch (e) {
        console.error(`Error adding parameters into Inferance Configs table: ${e}`);
        return 500;
    }
}
// Function to get language model Inferance parameters info based on the client API key
async function getLLMInferanceIdsInfo(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMInferanceParams = db.collection("inferanceConfigs");
        const LLMInferanceCursor = await LLMInferanceParams.find({ clientApiKey: clientApiKey }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return LLMInferanceCursor;
    } catch (e) {
        console.error(`Error fetching Prompts Details : ${e}`);
    }
}
// Function to update LMM Inferance parameters
async function updateLLMinferanceParams(organisation, document) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const inferanceConfig = db.collection("inferanceConfigs");
        if (document.oldName !== document.newName){     
            const isname = await inferanceConfig.findOne({clientApiKey: document.clientApiKey, name: document.newName });
            if(isname){
                return 404
            }
        }
        const timestamp = moment.utc().unix();
        await inferanceConfig.updateOne(
            { clientApiKey: document.clientApiKey, inferanceId: document.inferanceId},
            { $set: { name: document.newName , temprature: document.temprature, topK: document.topK, topP: document.topP, tokensLimit: document.tokensLimit, timestamp: timestamp } }
        );
        return 200;
    } catch (e) {
        console.error(`Error adding parameters into Inferance Configs table: ${e}`);
        return 500;
    }
}
// Function to get LMM Deploy model Info data based on the client API key and Model Id
async function getLLMDeployModelInfo(organisation, inputData) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMModelId = db.collection("LLMModels");
        const LLMModelIdCursor = await LLMModelId.find({ clientApiKey: inputData.clientApiKey, modelId: inputData.modelId }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return LLMModelIdCursor;
    } catch (e) {
        console.error(`Error fetching LLM Deploy Model info : ${e}`);
    }
}

// Function to get LMM Deploy model Info data based on the client API key and Model Id
async function getLLMDeployPromptInfo(organisation, inputData) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const LLMPromptsId = db.collection("LLMPrompts");
        const LLMPromptIdCursor = await LLMPromptsId.find({ clientApiKey: inputData.clientApiKey, promptId: inputData.promptId }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return LLMPromptIdCursor;
    } catch (e) {
        console.error(`Error fetching LLM Deploy Model info : ${e}`);
    }

}

// Function to add LMM Deployment Id 
async function addLLMDeployment(organisation, tagName, clientApiKey, modelId, promptId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        let isDeployIdNew = false;
        let deployId;
        const isTagName = await deploymentConfig.findOne({clientApiKey: clientApiKey, tagName: tagName });

        if (isTagName) {
            return false
        } else {
            do {
                deployId = generateID(4);
                isDeployIdNew = await deploymentConfig.findOne({ clientApiKey: clientApiKey, deployId: deployId });
            } while (isDeployIdNew);

            const timestamp = moment.utc().unix();
            const LLMDeployData = { tagName: tagName, clientApiKey: clientApiKey, deployId: deployId, modelId: modelId, promptId: promptId, serviceApi: '6002/llm/server', service: 'LLM', timestamp: timestamp };
            await deploymentConfig.insertOne(LLMDeployData);
            return true;
        }
    } catch (e) {
        console.error(`Error adding into Deploy Id table: ${e}`);
        return false;
    }
}

// Function to get LMM Deployment Info data based on the client API key and Deploy Id
async function getLLMDeployIdsInfo(organisation, clientApiKey) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const LLMDeployIdsCursor = await deploymentConfig.find({ clientApiKey: clientApiKey, service:'LLM' }, { projection: { clientApiKey: 0, _id: 0 } })
            .sort({ timestamp: -1 }) // Sort by timestamp in descending order
            .toArray();
        return LLMDeployIdsCursor;
    } catch (e) {
        console.error(`Error fetching LLM Deploy Ids info : ${e}`);
    }
}
// Function to update an existing language model Deploy ID Details in the database
async function updateLLMDeployIdInfo(organisation, oldTagName, newTagName, clientApiKey, deployId, modelId, promptId) {
    try {
        await client.connect();
        const db = client.db(organisation);
        const deploymentConfig = db.collection("DeploymentConfig");
        const timestamp = moment.utc().unix();

        if (oldTagName !== newTagName){     
            const isNewTag = await deploymentConfig.findOne({clientApiKey: clientApiKey, tagName: newTagName, service: 'LLM'})
            if(isNewTag){
                return 409
            }
        }
        await deploymentConfig.updateOne(
            { clientApiKey: clientApiKey, deployId: deployId, service: 'LLM' },
            { $set: { tagName: `${newTagName}`, modelId: `${modelId}`, promptId: `${promptId}`, timestamp: timestamp } }
        );
        return 200;
    } catch (e) {
        console.error(`Error Updating LLM Deploy ID Details : ${e}`);
        return 500;
    }
}

module.exports = [getLLMModeTypes, getModels, getLLMModelNames, getEngines, addLlmModel, getLlmModelDetails, getLlmModelIds, updateLlmModel, addPrompt, getLlmPromptsData, getLlmPromptIds, updatePrompt, addLLMinferanceParams, getLLMInferanceIdsInfo, updateLLMinferanceParams, getLLMDeployModelInfo, getLLMDeployPromptInfo, addLLMDeployment, getLLMDeployIdsInfo, updateLLMDeployIdInfo];