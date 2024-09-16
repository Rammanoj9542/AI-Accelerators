import { useState } from 'react';
import Input from "./Input";

export default function LLM() {
    // Set up state variables for each form step
    const [addLLMModelState, setAddLLMModelState] = useState({
        APIKey: '',
        mode: '',
        model: '',
        modelName: '',
        cloudAPIKey: ''
    });

    const [updateLLMModelState, setUpdateLLMModelState] = useState({
        APIKey: '',
        ModelID: '',
        mode: '',
        model: '',
        modelName: '',
        engine: '',
        cloudAPIKey: ''
    });

    const [viewLLMModelsState, setViewLLMModelsState] = useState({
        APIKey: ''
    });

    const [addLLMPromptState, setAddLLMPromptState] = useState({
        APIKey: '',
        appType: '',
        memoryType: '',
        kValue: '',
        tokenLimit: '',
        systemMessage: '',
        aiMessage: '',
        humanMessage: ''
    });

    const [updateLLMPromptState, setUpdateLLMPromptState] = useState({
        APIKey: '',
        promptId: '',

        appType: '',
        memoryType: '',
        kValue: '',
        tokenLimit: '',

        promptType: '',
        simplePrompt: '',
        systemMessage: '',
        aiMessage: '',
        humanMessage: ''
    });

    const [viewLLMPromptsState, setViewLLMPromptsState] = useState({
        APIKey: ''
    });

    const [addLLMDeploymentState, setAddLLMDeploymentState] = useState({
        tag: '',
        APIKey: '',
        modelId: '',
        promptId: '',
    });

    const [updateLLMDeployIdState, setUpdateLLMDeployIdState] = useState({
        APIKey: '',
        deployId: '',
        modelId: '',
        promptId: '',
    });

    const [viewLLMDeploymentsState, setViewLLMDeploymentsState] = useState({
        APIKey: ''
    });

    const [addLLMInferanceParamState, setAddLLMInferanceParamState] = useState({
        name: '',
        clientApiKey: '',
        temprature: 0,
        topP: 0,
        topK: 0,
        tokensLimit: 100
    });
    const [updateLLMInferanceParamState, setUpdateLLMInferanceParamState] = useState({
        newName: '',
        inferanceId: '',
        clientApiKey: '',
        temprature: 0,
        topP: 0,
        topK: 0,
        tokensLimit: 100
    });
    const [viewLLMInferanceParamsState, setViewLLMInferanceParamsState] = useState({
        clientApiKey: ''
    });
    // State to control flash messages
    const [flashMessage, setFlashMessage] = useState({
        text: "",
        success: false,
        failure: false,
    });

    const [divNumber, setDivNumber] = useState(0); // State to track the form number
    const [menuNumber, setMenuNumber] = useState(0); // State to track the menu/options number

    const [APIKeys, setAPIKeys] = useState([]);
    const [Modes, setModes] = useState([]);
    const [Models, setModels] = useState([]);
    const [ModelNames, setModelNames] = useState([]);
    const [Engines, setEngines] = useState([]);
    const [ModelIDs, setModelIDs] = useState([]);
    const [modelsData, setModelsData] = useState([]);
    const [PromptIDs, setPromptIDs] = useState([]);
    const [promptsData, setPromptsData] = useState([]);
    const [deploymentsData, setDeploymentsData] = useState([]);
    const [inferanceParamsData, setInferanceParamsData] = useState([]);

    const [RAGconfigIDs, setRAGConfigIDs] = useState([]);
    const [deploymentIDs, setDeploymentIDs] = useState([]);

    const [numFields, setNumFields] = useState(1); // State to keep track of the number of fields
    const [fieldsData, setFieldsData] = useState([]); // State to store key-value pairs

    // LMM Deploy States
    const [deployModelData, setDeployModelData] = useState({})
    const [deployPromptData, setDeployPromptData] = useState({})
    // Event handlers for handling form input changes
    const handleChange1 = (e) => {
        const { id, value } = e.target;
        if (id === 'mode') {
            getModels(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                modelName: ''
            }));
        } else if (id === 'model') {
            getModelNames(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else if (id === 'modelName') {
            getEngines(value);
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else {
            setAddLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange2 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMModelState({ ...updateLLMModelState, [id]: value });
        if (id === "APIKey") {
            getLLMClientModelIDs(value);
        } else if (id === 'mode') {
            getModels(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                modelName: '',
                engine: ''
            }));
        } else if (id === 'model') {
            getModelNames(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value,
                engine: ''
            }));
        } else if (id === 'modelName') {
            getEngines(value);
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        } else {
            setUpdateLLMModelState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange3 = (e) => {
        const { id, value } = e.target;
        setViewLLMModelsState({ ...viewLLMModelsState, [id]: value });
        if (id === "APIKey") {
            getFullModelDetails(value);
        }
    }
    const handleChange4 = (e) => {
        const { id, value } = e.target;
        if (id === "kValue") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 100) {
                handleFlashMessage("Max k value limit is 100", false, 1000);
                return;
            }
            setAddLLMPromptState({ ...addLLMPromptState, [id]: onlyNums });
        } else if (id === "tokenLimit") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 5000) {
                handleFlashMessage("Max token limit is 1000", false, 1000);
                return;
            }
            setAddLLMPromptState({ ...addLLMPromptState, [id]: onlyNums });
        } else {
            setAddLLMPromptState({ ...addLLMPromptState, [id]: value });
        }
    };
    const handleChange5 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: value });
        if (id === "APIKey") {
            getLLMClientPromptIDs(value);
        } else if (id === "kValue") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 100) {
                handleFlashMessage("Max k value limit is 100", false, 1000);
                return;
            }
            setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: onlyNums });
        } else if (id === "tokenLimit") {
            const onlyNums = value.replace(/[^0-9]/g, ''); // Remove any non-numeric characters
            if (parseInt(onlyNums) < 1 || parseInt(onlyNums) > 5000) {
                handleFlashMessage("Max token limit is 1000", false, 1000);
                return;
            }
            setUpdateLLMPromptState({ ...updateLLMPromptState, [id]: onlyNums });
        } else {
            setUpdateLLMPromptState((prevState) => ({
                ...prevState,
                [id]: value
            }));
        }
    };
    const handleChange6 = (e) => {
        const { id, value } = e.target;
        setViewLLMPromptsState({ ...viewLLMPromptsState, [id]: value });
        if (id === "APIKey") {
            getFullPromptsData(value);
        }
    };
    const handleChangeKeyValue = (event, index, field) => {
        const { value } = event.target;
        setFieldsData((prevFieldsData) => {
            const updatedFieldsData = { ...prevFieldsData };
            if (!updatedFieldsData[index]) {
                updatedFieldsData[index] = {};
            }
            updatedFieldsData[index][field] = value;
            return updatedFieldsData;
        });
    };
    const handleChange7 = (e) => {
        const { id, value } = e.target;
        setAddLLMDeploymentState({ ...addLLMDeploymentState, [id]: value });
        if (id === "APIKey") {
            getLLMClientModelIDs(value);
            getLLMClientPromptIDs(value);
        } else if (id === "modelId") {
            getLLMDeployModelinfo(addLLMDeploymentState.APIKey, value)
        } else if (id === "promptId") {
            getLLMDeployPromptinfo(addLLMDeploymentState.APIKey, value)
        }
    };
    const handleChange8 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMDeployIdState({ ...updateLLMDeployIdState, [id]: value });
        if (id === "APIKey") {
            getLLMClientModelIDs(value);
            getLLMClientPromptIDs(value);
        } else if (id === "modelId") {
            getLLMDeployModelinfo(updateLLMDeployIdState.APIKey, value)
        } else if (id === "promptId") {
            getLLMDeployPromptinfo(updateLLMDeployIdState.APIKey, value)
        }
    };
    const handleChange9 = (e) => {
        const { id, value } = e.target;
        setViewLLMDeploymentsState({ ...viewLLMDeploymentsState, [id]: value });
        if (id === "APIKey") {
            getDeployIdsDetails(value);
        }
    };
    const handleChange10 = (e) => {
        const { id, value } = e.target;
        setAddLLMInferanceParamState({ ...addLLMInferanceParamState, [id]: value });
    };
    const handleChange11 = (e) => {
        const { id, value } = e.target;
        setUpdateLLMInferanceParamState({ ...updateLLMInferanceParamState, [id]: value });
    };
    const handleChange12 = (e) => {
        const { id, value } = e.target;
        setViewLLMInferanceParamsState({ ...viewLLMInferanceParamsState, [id]: value });
        if (id === "clientApiKey") {
            getInferanceIdsDetails(value);
        }
    };
    // Function to handle flash messages
    const handleFlashMessage = (text, success, time) => {
        setFlashMessage({ text, success, failure: !success });
        setTimeout(() => setFlashMessage({ text: "", success: false, failure: false }), time);
    };

    // Function to get API Keys
    async function getclientAPIKeys() {
        try {
            const response = await fetch("/clientApiKeys", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setAPIKeys(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching keys:", error);
        }
    }

    async function getModes() {
        try {
            const response = await fetch("/llm/getModes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setModes(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getModels(mode) {
        try {
            const response = await fetch("/llm/getModels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mode: mode,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModels(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getModelNames(model) {
        try {
            const response = await fetch("/llm/getModelNames", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelNames(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching modes:", error);
        }
    }

    async function getEngines(modelName) {
        try {
            const response = await fetch("/llm/getEngines", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    modelName: modelName,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setEngines(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching engines:", error);
        }
    }

    // Function to get model IDs
    async function getLLMClientModelIDs(clientApiKey) {
        try {
            const response = await fetch("/llm/getModelIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setModelIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model IDs:", error);
        }
    };

    // Function to get prompt IDs
    async function getLLMClientPromptIDs(clientApiKey) {
        try {
            const response = await fetch("/llm/getPromptIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setPromptIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching prompt IDs:", error);
        }
    };

    // Function to get deployment IDs
    async function getDeploymentIDs(clientApiKey) {
        try {
            const response = await fetch("/getDeploymentIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    type: 'llm'
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setDeploymentIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching deployment IDs:", error);
        }
    }

    // Function to add new model
    const handleNewModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMModelState.APIKey || !addLLMModelState.mode || !addLLMModelState.model || !addLLMModelState.modelName) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Check if cloud API key is entered in cloud ode
        if (addLLMModelState.mode === "Cloud" && !addLLMModelState.cloudAPIKey) {
            handleFlashMessage("Please enter the Cloud API Key.", false, 2000);
            return;
        }

        // Retrieve selected API key, mode, model and model name
        var apikey = addLLMModelState.APIKey;
        var selectedMode = addLLMModelState.mode;
        var selectedModel = addLLMModelState.model;
        var selectedModelName = addLLMModelState.modelName;
        var enteredCloudAPIKey = addLLMModelState.cloudAPIKey;

        // Send data to server.js using fetch
        fetch("/llm/addNewModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                mode: selectedMode,
                model: selectedModel,
                modelName: selectedModelName,
                engine: Engines,
                cloudAPIKey: enteredCloudAPIKey
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding model:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    // Function to update existing model
    const handleUpdateModelButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMModelState.APIKey || !updateLLMModelState.ModelID || !updateLLMModelState.mode || !updateLLMModelState.model || !updateLLMModelState.modelName) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Check if cloud API key is entered in cloud ode
        if (updateLLMModelState.mode === "Cloud" && !updateLLMModelState.cloudAPIKey) {
            handleFlashMessage("Please enter the Cloud API Key.", false, 2000);
            return;
        }

        // Retrieve selected API key, model ID and model
        var apikey = updateLLMModelState.APIKey;
        var modelid = updateLLMModelState.ModelID;
        var selectedMode = updateLLMModelState.mode;
        var selectedModel = updateLLMModelState.model;
        var selectedModelName = updateLLMModelState.modelName;
        var enteredCloudAPIKey = updateLLMModelState.cloudAPIKey;

        // Send data to server.js using fetch
        fetch("/llm/updateModel", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                apikey: apikey,
                modelid: modelid,
                mode: selectedMode,
                model: selectedModel,
                modelName: selectedModelName,
                engine: Engines,
                cloudAPIKey: enteredCloudAPIKey
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Model updated successfully", true, 2000);
                    resetForms();
                } else if (response.status === 400) {
                    resetForms();
                    handleFlashMessage("Model couldnt be updated. Pls try again.", false, 2000);
                } else {
                    resetForms();
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating model:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(3);
            });
    }

    // Function to get all models data
    async function getFullModelDetails(clientApiKey) {
        try {
            const response = await fetch("/llm/getFullModelDetails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setModelsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching model details:", error);
        }
    };

    const handleNewPromptButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMPromptState.APIKey || !addLLMPromptState.appType) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const formattedFieldsData = {};
        Object.keys(fieldsData).forEach((index) => {
            const key = fieldsData[index].key;
            const value = fieldsData[index].value;
            formattedFieldsData[key] = value;
        });

        // Retrieve all the form data
        var apikey = addLLMPromptState.APIKey;

        var selectedAppType = addLLMPromptState.appType;
        var selectedMemoryType = addLLMPromptState.memoryType;
        var enteredkValue = addLLMPromptState.kValue;
        var enteredTokenLimit = addLLMPromptState.tokenLimit;

        var enteredsystemMessage = addLLMPromptState.systemMessage;
        var enteredaiMessage = addLLMPromptState.aiMessage;
        var enteredhumanMessage = addLLMPromptState.humanMessage;

        var formattedInputData = formattedFieldsData;

        fetch("/llm/addPrompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clientApiKey: apikey,
                promptId: '',

                appType: selectedAppType,
                memoryType: selectedMemoryType,
                kValue: enteredkValue,
                tokenLimit: enteredTokenLimit,

                systemMessage: enteredsystemMessage,
                aiMessage: enteredaiMessage,
                humanMessage: enteredhumanMessage,

                inputData: formattedInputData
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Prompt added successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Prompt ID already exists. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding prompt:", error);
            })
            .finally(() => {
                resetForms();
            });
    }

    const handleUpdatePromptButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMPromptState.APIKey || !updateLLMPromptState.promptId) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        const formattedFieldsData = {};
        Object.keys(fieldsData).forEach((index) => {
            const key = fieldsData[index].key;
            const value = fieldsData[index].value;
            formattedFieldsData[key] = value;
        });

        // Retrieve all the form data
        var apikey = updateLLMPromptState.APIKey;
        var promptID = updateLLMPromptState.promptId;

        var selectedAppType = updateLLMPromptState.appType;
        var selectedMemoryType = updateLLMPromptState.memoryType;
        var enteredkValue = updateLLMPromptState.kValue;
        var enteredTokenLimit = updateLLMPromptState.tokenLimit;

        var selectedPromptType = updateLLMPromptState.promptType;
        var enteredsimplePrompt = updateLLMPromptState.simplePrompt;
        var enteredsystemMessage = updateLLMPromptState.systemMessage;
        var enteredaiMessage = updateLLMPromptState.aiMessage;
        var enteredhumanMessage = updateLLMPromptState.humanMessage;

        var formattedInputData = formattedFieldsData;

        fetch("/llm/updatePrompt", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                clientApiKey: apikey,
                promptId: promptID,

                appType: selectedAppType,
                memoryType: selectedMemoryType,
                kValue: enteredkValue,
                tokenLimit: enteredTokenLimit,

                promptType: selectedPromptType,
                simplePrompt: enteredsimplePrompt,
                systemMessage: enteredsystemMessage,
                aiMessage: enteredaiMessage,
                humanMessage: enteredhumanMessage,

                inputData: formattedInputData
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Prompt updated successfully", true, 2000);
                } else if (response.status === 400) {
                    handleFlashMessage("Prompt couldnt be updated. Pls try again.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updated prompt:", error);
            })
            .finally(() => {
                resetForms();
                setDivNumber(6);
            });
    };

    // Function to get all prompts data
    async function getFullPromptsData(clientApiKey) {
        try {
            const response = await fetch("/llm/getFullPromptsData", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPromptsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching prompts details:", error);
        }
    };

    const addKeyValueField = () => {
        setNumFields(numFields + 1); // Increment the number of fields
    };

    // Function to get config IDs
    async function getRAGClientConfigIDs(clientApiKey) {
        try {
            const response = await fetch("/rag/getConfigIds", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setRAGConfigIDs(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching config IDs:", error);
        }
    };
    // LLM Deployment Functions
    // Function to get LLM ModelId Info
    async function getLLMDeployModelinfo(clientApiKey, modelId) {
        try {
            const response = await fetch("/llm/getLLMDeployModelInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    modelId: modelId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDeployModelData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching LLM Deploy Model Info:", error);
        }
    };
    // Function to get LLM Prompt Info
    async function getLLMDeployPromptinfo(clientApiKey, promptId) {
        try {
            const response = await fetch("/llm/getLLMDeployPromptInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                    promptId: promptId
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDeployPromptData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching LLM Deploy Prompt Info:", error);
        }
    };

    // Function to Add LLM Deployment Id
    const handleNewDeploymentButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMDeploymentState.tag || !addLLMDeploymentState.APIKey || !addLLMDeploymentState.modelId || !addLLMDeploymentState.promptId) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve all the form data
        var tag = addLLMDeploymentState.tag;
        var apikey = addLLMDeploymentState.APIKey;
        var selectedLLMModelID = addLLMDeploymentState.modelId;
        var selectedLLMPromptID = addLLMDeploymentState.promptId;

        // Send data to server.js using fetch
        fetch("/addLLMDeployment", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                tag: tag,
                apikey: apikey,
                llmModelID: selectedLLMModelID,
                llmPromptID: selectedLLMPromptID,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("LLM Deployment added successfully", true, 2000);
                    resetForms();
                } else if (response.status === 404) {
                    handleFlashMessage("Tag name already exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding LLM Deployment:", error);
            })
    };

    // Function to update existing deployment
    const handleUpdateDeploymentButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!updateLLMDeployIdState.newTagName || !updateLLMDeployIdState.APIKey || !updateLLMDeployIdState.deployId || !updateLLMDeployIdState.modelId || !updateLLMDeployIdState.promptId) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve selected details
        var oldTagName = updateLLMDeployIdState.oldTagName
        var newTagName = updateLLMDeployIdState.newTagName
        var apikey = updateLLMDeployIdState.APIKey;
        var selectedDeployId = updateLLMDeployIdState.deployId
        var selectedLLMModelId = updateLLMDeployIdState.modelId;
        var selectedLLMPromptId = updateLLMDeployIdState.promptId;

        // Send data to server.js using fetch
        fetch("/updateLLMDeployIdInfo", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                oldTagName: oldTagName,
                newTagName: newTagName,
                apiKey: apikey,
                deployId: selectedDeployId,
                modelId: selectedLLMModelId,
                promptId: selectedLLMPromptId,
            }),
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("Deploy Id Info updated successfully", true, 2000);
                    resetForms();
                    setDivNumber(9);
                } else if (response.status === 409) {
                    handleFlashMessage("Tag Name already exists.", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating deployment:", error);
            })

    }

    // Function to get all deployments data
    async function getDeployIdsDetails(clientApiKey) {
        try {
            const response = await fetch("/getLLMDeployIdsInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setDeploymentsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching deployments details:", error);
        }
    };

    // Function to Add LLM Inferance Parameters 
    const handleNewInferanceParamstButton = (e) => {
        e.preventDefault();

        // Check if required fields are selected
        if (!addLLMInferanceParamState.name || !addLLMInferanceParamState.clientApiKey) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve all the form data
        const data = {
            name: addLLMInferanceParamState.name,
            clientApiKey: addLLMInferanceParamState.clientApiKey,
            temprature: Number(addLLMInferanceParamState.temprature),
            topK: Number(addLLMInferanceParamState.topK),
            topP: Number(addLLMInferanceParamState.topP),
            tokensLimit: Number(addLLMInferanceParamState.tokensLimit)
        }


        // Send data to server.js using fetch
        fetch("/addLLMinferanceParams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data })
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("LLM Inferance Parameters added successfully", true, 2000);
                    resetForms();
                } else if (response.status === 404) {
                    handleFlashMessage(" name already exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error adding LLM Inferance Parameters:", error);
            })
    };
    // Function to get all Inferance Ids data
    async function getInferanceIdsDetails(clientApiKey) {
        try {
            const response = await fetch("/getLLMInferanceIdsInfo", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    clientApiKey: clientApiKey,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setInferanceParamsData(data);
            } else {
                console.error("Server error. Please try again.");
                handleFlashMessage("Server error. Please try again.", false, 3000);
            }
        } catch (error) {
            console.error("Error fetching Inferance Ids details:", error);
        }
    };
    // Function to update LLM Inferance Parameters 
    const handleUpdateInferanceParamstButton = (e) => {
        e.preventDefault();
        // Check if required fields are selected
        if (!updateLLMInferanceParamState.newName || !updateLLMInferanceParamState.clientApiKey) {
            handleFlashMessage("Please select all required fields.", false, 2000);
            return;
        }

        // Retrieve all the form data
        const data = {
            oldName: updateLLMInferanceParamState.oldName,
            newName: updateLLMInferanceParamState.newName,
            clientApiKey: updateLLMInferanceParamState.clientApiKey,
            inferanceId: updateLLMInferanceParamState.inferanceId,
            temprature: Number(updateLLMInferanceParamState.temprature),
            topK: Number(updateLLMInferanceParamState.topK),
            topP: Number(updateLLMInferanceParamState.topP),
            tokensLimit: Number(updateLLMInferanceParamState.tokensLimit)
        }


        // Send data to server.js using fetch
        fetch("/updateLLMinferanceParams", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ data })
        })
            .then((response) => {
                if (response.ok) {
                    handleFlashMessage("LLM Inferance Parameters updateded successfully", true, 2000);
                    resetForms();
                    setDivNumber(12);
                } else if (response.status === 404) {
                    handleFlashMessage(" name already exists", false, 2000);
                } else {
                    console.error("Server error. Please try again.");
                    handleFlashMessage("Server error. Please try again.", false, 3000);
                }
            })
            .catch((error) => {
                console.error("Error updating LLM Inferance Parameters:", error);
            })
    };
    // Update the click handler for deployment IDs
    const handleInferanceIdClick = async (oldName, clientApiKey, inferanceId, temprature, topK, topP, tokensLimit) => {
        setDivNumber(11);
        setUpdateLLMInferanceParamState({
            oldName: oldName,
            newName: oldName,
            clientApiKey: clientApiKey,
            inferanceId: inferanceId,
            temprature: temprature,
            topK: topK,
            topP: topP,
            tokensLimit: tokensLimit
        });
    };
    // Function to reset the forms to its initial state
    const resetForms = () => {
        setAddLLMModelState({
            APIKey: '',
            mode: '',
            model: '',
            modelName: ''
        });
        setUpdateLLMModelState({
            APIKey: '',
            ModelID: '',
            mode: '',
            model: '',
            modelName: '',
            engine: ''
        });
        setViewLLMModelsState({
            APIKey: ''
        });
        setAddLLMPromptState({
            APIKey: '',
            appType: '',
            promptType: '',
            simplePrompt: '',
            systemMessage: '',
            aiMessage: '',
            humanMessage: '',
            inputData: ''
        });
        setUpdateLLMPromptState({
            APIKey: '',
            promptId: '',
            appType: '',
            promptType: '',
            simplePrompt: '',
            systemMessage: '',
            aiMessage: '',
            humanMessage: '',
            inputData: ''
        });
        setViewLLMPromptsState({
            APIKey: ''
        });
        setAddLLMInferanceParamState({
            clientApiKey: '',
            name: '',
            temprature: 0,
            topP: 0,
            topK: 0,
            tokensLimit: 100
        })
        setViewLLMInferanceParamsState({
            clientApiKey: ''
        });
        setUpdateLLMInferanceParamState({
            newName: '',
            inferanceId: '',
            clientApiKey: '',
            temprature: 0,
            topK: 0,
            topP: 0,
            tokensLimit: 100
        })
        setAddLLMDeploymentState({
            tag: '',
            APIKey: '',
            modelId: '',
            promptId: ''
        });
        setDeployModelData({
            mode: '',
            modelType: '',
            modelName: '',
            engine: '',
            cloudAPIKey: ''
        });
        setDeployPromptData({
            appType: '',
            systemMessage: '',
            aiMessage: '',
            humanMessage: '',
            inputData: ''
        });
        setUpdateLLMDeployIdState({
            APIKey: '',
            deployId: '',
            modelId: '',
            promptId: '',
        });
        setViewLLMDeploymentsState({
            APIKey: ''
        });
        setEngines([]);
        setNumFields(1);
        setFieldsData([]);
    };

    // CSS class for buttons
    const buttonClass = "group relative flex items-center justify-center py-5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500";

    const submitButtonClass = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 mt-5";

    const h1Style = {
        textAlign: 'center',
        fontWeight: 'bold',
        marginTop: '5px'
    };

    const handleLLMModelsButton = () => {
        setMenuNumber(1);
        setDivNumber(3);
        getclientAPIKeys();
        getModes();
        resetForms();
    };

    const handleLLMPromptsButton = () => {
        setMenuNumber(2);
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const handleInferanceParaButton = () => {
        setMenuNumber(4);
        setDivNumber(12);
        getclientAPIKeys();
        resetForms();
    };

    const handleDeploymentButton = () => {
        setMenuNumber(3);
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };

    const showAddLLMModelForm = () => {
        setDivNumber(1);
        getclientAPIKeys();
        resetForms();
    };

    const viewAllLLMModels = () => {
        setDivNumber(3);
        getclientAPIKeys();
        resetForms();
    };

    const showAddLLMPromptForm = () => {
        setDivNumber(4);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllLLMPrompts = () => {
        setDivNumber(6);
        getclientAPIKeys();
        resetForms();
    };

    const showAddInferanceParamForm = () => {
        setDivNumber(10);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllInferanceParams = () => {
        setDivNumber(12);
        getclientAPIKeys();
        resetForms();
    };
    const showAddDeploymentForm = () => {
        setDivNumber(7);
        getclientAPIKeys();
        resetForms();
    };

    const ViewAllDeployments = () => {
        setDivNumber(9);
        getclientAPIKeys();
        resetForms();
    };

    // Update the click handler for model IDs
    const handleModelClick = async (APIKey, ModelID, mode, modelType, modelName, engine, cloudAPIKey) => {
        setDivNumber(2);

        await getLLMClientModelIDs(APIKey);
        await getModels(mode);
        await getModelNames(modelType);
        await getEngines(modelName);

        setUpdateLLMModelState({
            APIKey: APIKey,
            ModelID: ModelID,
            mode: mode,
            model: modelType,
            modelName: modelName,
            engine: engine,
            cloudAPIKey: cloudAPIKey
        });
    };

    // Update the click handler for prompt IDs
    const handlePromptClick = async (ApiKey, PromptID, AppType, MemoryType, KValue, TokenLimit, SystemMessage, AIMessage, HumanMessage, InputData) => {
        setDivNumber(5);

        await getLLMClientPromptIDs(ApiKey);

        setUpdateLLMPromptState({
            APIKey: ApiKey,
            promptId: PromptID,

            appType: AppType,
            memoryType: MemoryType,
            kValue: KValue,
            tokenLimit: TokenLimit,

            systemMessage: SystemMessage,
            aiMessage: AIMessage,
            humanMessage: HumanMessage
        });

        // Extract key-value pairs from InputData and convert them to an array of objects
        const extractedFieldsData = Object.entries(InputData).map(([key, value]) => ({ key, value }));

        // Set the state with the extracted key-value pairs
        setNumFields(extractedFieldsData.length);
        setFieldsData(extractedFieldsData);
    };

    // Update the click handler for deployment IDs
    const handleDeployIdClick = async (oldTagName, APIKey, deployId, modelId, promptId) => {
        setDivNumber(8);

        await getDeployIdsDetails(APIKey);
        await getLLMDeployModelinfo(APIKey, modelId)
        await getLLMDeployPromptinfo(APIKey, promptId)
        await getLLMClientModelIDs(APIKey);
        await getLLMClientPromptIDs(APIKey);

        setUpdateLLMDeployIdState({
            oldTagName: oldTagName,
            newTagName: oldTagName,
            APIKey: APIKey,
            deployId: deployId,
            modelId: modelId,
            promptId: promptId,
        });
    };


    return (
        <div style={{ width: '100%' }}>

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handleLLMModelsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Models
                </button>
                <button
                    onClick={handleLLMPromptsButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Prompts
                </button>
                <button
                    onClick={handleInferanceParaButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Inferance Params
                </button>
                <button
                    onClick={handleDeploymentButton}
                    className={buttonClass}
                    style={{ height: '40px' }}>
                    Deployment
                </button>
            </div>

            {/* Displaying success flash message */}
            {flashMessage.success && (
                <div id="successFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Displaying failure flash message */}
            {flashMessage.failure && (
                <div id="failFlashMsg" style={{ marginTop: '15px' }}>
                    {flashMessage.text}
                </div>
            )}

            {/* Models Menu */}
            {menuNumber === 1 && (
                <div id='LLMModels' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddLLMModelForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={viewAllLLMModels}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Prompts Menu */}
            {menuNumber === 2 && (
                <div id='LLMPrompts' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddLLMPromptForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllLLMPrompts}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* Deployments Menu */}
            {menuNumber === 3 && (
                <div id='Deployments' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddDeploymentForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllDeployments}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}
            {menuNumber === 4 && (
                <div id='Deployments' className="flex justify-center space-x-10" style={{ margin: '10px 0px 10px 0px' }}>
                    <button
                        onClick={showAddInferanceParamForm}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        Add
                    </button>
                    <button
                        onClick={ViewAllInferanceParams}
                        className="font-medium text-purple-600 hover:text-purple-500">
                        View
                    </button>
                </div>
            )}

            {/* New Model div */}
            {divNumber === 1 && (
                <div>
                    <h1 style={h1Style}>Add New Model</h1>

                    <form className="mt-6 space-y-6">
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addLLMModelState.APIKey}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="mode"
                                    name="mode"
                                    value={addLLMModelState.mode}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Mode</option>
                                    {Modes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="model"
                                    name="model"
                                    value={addLLMModelState.model}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model</option>
                                    {Models.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={addLLMModelState.modelName}
                                    onChange={handleChange1}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Name</option>
                                    {ModelNames.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {addLLMModelState.modelName && Engines[0] !== '' && (
                                <div className="mb-2">
                                    <Input
                                        id="engine"
                                        name="engine"
                                        type="text"
                                        value={Engines}
                                        handleChange={handleChange1}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        isDisabled="true"
                                    />
                                </div>
                            )}
                            {addLLMModelState.mode === "Cloud" && (
                                <Input
                                    id="cloudAPIKey"
                                    name="cloudAPIKey"
                                    key="cloudAPIKey"
                                    handleChange={handleChange1}
                                    value={addLLMModelState.cloudAPIKey}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Cloud API Key"
                                />
                            )}
                        </div>
                        <button className={submitButtonClass} onClick={handleNewModelButton}>Add</button>
                    </form>
                </div>
            )}

            {/* Update Existing Model div */}
            {divNumber === 2 && (
                <div>
                    <h1 style={h1Style}>Update Existing Model - {updateLLMModelState.ModelID}</h1>

                    <form className="mt-6 space-y-6">
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateLLMModelState.APIKey}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="mode"
                                    name="mode"
                                    value={updateLLMModelState.mode}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Mode</option>
                                    {Modes.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="model"
                                    name="model"
                                    value={updateLLMModelState.model}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model</option>
                                    {Models.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="modelName"
                                    name="modelName"
                                    value={updateLLMModelState.modelName}
                                    onChange={handleChange2}
                                    className="mt-1 p-2 border rounded-md w-full">
                                    <option value="">Select Model Name</option>
                                    {ModelNames.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {updateLLMModelState.modelName && Engines[0] !== '' && (
                                <div className="mb-2">
                                    <Input
                                        id="engine"
                                        name="engine"
                                        type="text"
                                        value={Engines}
                                        onChange={handleChange2}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        isDisabled="true"
                                    />
                                </div>
                            )}
                            {updateLLMModelState.mode === "Cloud" && (
                                <Input
                                    id="cloudAPIKey"
                                    name="cloudAPIKey"
                                    key="cloudAPIKey"
                                    handleChange={handleChange2}
                                    value={updateLLMModelState.cloudAPIKey}
                                    type="text"
                                    isRequired="true"
                                    placeholder="Enter Cloud API Key"
                                />
                            )}
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateModelButton}>Update</button>
                    </form>
                </div>
            )}

            {/* View All Models Data div */}
            {divNumber === 3 && (
                <div>
                    <h1 style={h1Style}>All Models</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-2">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMModelsState.APIKey}
                                onChange={handleChange3}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewLLMModelsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model Name</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Engine</th>
                                    </tr>
                                </thead>
                                {/* Table body with configs data */}
                                <tbody>
                                    {modelsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        modelsData.map((model, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleModelClick(viewLLMModelsState.APIKey, model.modelId, model.mode, model.modelType, model.modelName, model.engine, model.cloudAPIKey)}
                                                >
                                                    {model.modelId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelType}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.modelName}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{model.engine === '' ? '-' : model.engine}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Prompt div */}
            {divNumber === 4 && (
                <div>
                    <h1 style={h1Style}>Add New Prompt</h1>

                    <form className="mt-3 space-y-6" >
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={addLLMPromptState.APIKey}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="appType"
                                    name="appType"
                                    value={addLLMPromptState.appType}
                                    onChange={handleChange4}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select App Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="conversational">Conversational</option>
                                    <option value='QAretrieval'>QAretrieval</option>
                                </select>
                            </div>

                            {addLLMPromptState.appType === "conversational" && (
                                <div>
                                    <div className="mb-2">
                                        <select
                                            id="memoryType"
                                            name="memoryType"
                                            value={addLLMPromptState.memoryType}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Memory Type</option>
                                            <option value="buffer">Buffer</option>
                                            <option value="windowBuffer">Window Buffer</option>
                                            <option value="tokenBuffer">Token Buffer</option>
                                            <option value="summarised">Summarised</option>
                                        </select>
                                    </div>
                                    {addLLMPromptState.memoryType === "windowBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="kValue"
                                                name="kValue"
                                                type="text"
                                                onChange={handleChange4}
                                                value={addLLMPromptState.kValue}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter k Value"
                                            />
                                        </div>
                                    )}
                                    {addLLMPromptState.memoryType === "tokenBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="tokenLimit"
                                                name="tokenLimit"
                                                type="text"
                                                onChange={handleChange4}
                                                value={addLLMPromptState.tokenLimit}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter Tokens Limit"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div>
                                <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                    <textarea
                                        id="systemMessage"
                                        name="systemMessage"
                                        value={addLLMPromptState.systemMessage}
                                        onChange={handleChange4}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder="Enter System Message"
                                        required
                                    />
                                </div>
                                {addLLMPromptState.appType !== 'QAretrieval' && (<div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="aiMessage"
                                            name="aiMessage"
                                            value={addLLMPromptState.aiMessage}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter AI Message"
                                            required
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="humanMessage"
                                            name="humanMessage"
                                            value={addLLMPromptState.humanMessage}
                                            onChange={handleChange4}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder="Enter Human Message"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                            {[...Array(numFields)].map((_, index) => (
                                                <div key={index}>
                                                    <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`key-${index}`}
                                                                name={`key-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                                value={fieldsData[index] ? fieldsData[index].key : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Key"
                                                            />
                                                        </div>
                                                        <div className="mb-2" style={{ flex: 1 }}>
                                                            <input
                                                                id={`value-${index}`}
                                                                name={`value-${index}`}
                                                                type="text"
                                                                onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                                value={fieldsData[index] ? fieldsData[index].value : ''}
                                                                className="mt-1 p-2 border rounded-md w-full"
                                                                required
                                                                placeholder="Value"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                onClick={addKeyValueField}
                                                className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                                Add Fields
                                            </button>
                                        </div>
                                    </div>
                                </div>)}
                            </div>
                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleNewPromptButton}>Add Prompt</button>
                </div>
            )}

            {/* Update Existing Prompt div */}
            {divNumber === 5 && (
                <div>
                    <h1 style={h1Style}>Update Existing Prompt - {updateLLMPromptState.promptId} </h1>

                    <form className="mt-3 space-y-6" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="APIKey"
                                    name="APIKey"
                                    value={updateLLMPromptState.APIKey}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-2">
                                <select
                                    id="appType"
                                    name="appType"
                                    value={updateLLMPromptState.appType}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select App Type</option>
                                    <option value="simple">Simple</option>
                                    <option value="conversational">Conversational</option>
                                    <option value='QAretrieval'>QAretrieval</option>
                                </select>
                            </div>

                            {updateLLMPromptState.appType === "conversational" && (
                                <div>
                                    <div className="mb-2">
                                        <select
                                            id="memoryType"
                                            name="memoryType"
                                            value={updateLLMPromptState.memoryType}
                                            onChange={handleChange5}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            required>
                                            <option value="">Select Memory Type</option>
                                            <option value="buffer">Buffer</option>
                                            <option value="windowBuffer">Window Buffer</option>
                                            <option value="tokenBuffer">Token Buffer</option>
                                            <option value="summarised">Summarised</option>
                                        </select>
                                    </div>

                                    {updateLLMPromptState.memoryType === "windowBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="kValue"
                                                name="kValue"
                                                type="text"
                                                onChange={handleChange5}
                                                value={updateLLMPromptState.kValue}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter k Value"
                                            />
                                        </div>
                                    )}

                                    {updateLLMPromptState.memoryType === "tokenBuffer" && (
                                        <div className="mb-2">
                                            <input
                                                id="tokenLimit"
                                                name="tokenLimit"
                                                type="text"
                                                onChange={handleChange5}
                                                value={updateLLMPromptState.tokenLimit}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                required
                                                placeholder="Enter Tokens Limit"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                <textarea
                                    id="systemMessage"
                                    name="systemMessage"
                                    value={updateLLMPromptState.systemMessage}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    placeholder="Enter System Message"
                                    required
                                />
                            </div>
                            {updateLLMPromptState.appType !== 'QAretrieval' &&(<div><div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                <textarea
                                    id="aiMessage"
                                    name="aiMessage"
                                    value={updateLLMPromptState.aiMessage}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    placeholder="Enter AI Message"
                                    required
                                />
                            </div>
                            <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                <textarea
                                    id="humanMessage"
                                    name="humanMessage"
                                    value={updateLLMPromptState.humanMessage}
                                    onChange={handleChange5}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    placeholder="Enter Human Message"
                                    required
                                />
                            </div>
                            <div>
                                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                    {[...Array(numFields)].map((_, index) => (
                                        <div key={index}>
                                            <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                <div className="mb-2" style={{ flex: 1 }}>
                                                    <input
                                                        id={`key-${index}`}
                                                        name={`key-${index}`}
                                                        type="text"
                                                        onChange={(e) => handleChangeKeyValue(e, index, 'key')}
                                                        value={fieldsData[index] ? fieldsData[index].key : ''}
                                                        className="mt-1 p-2 border rounded-md w-full"
                                                        required
                                                        placeholder="Key"
                                                    />
                                                </div>
                                                <div className="mb-2" style={{ flex: 1 }}>
                                                    <input
                                                        id={`value-${index}`}
                                                        name={`value-${index}`}
                                                        type="text"
                                                        onChange={(e) => handleChangeKeyValue(e, index, 'value')}
                                                        value={fieldsData[index] ? fieldsData[index].value : ''}
                                                        className="mt-1 p-2 border rounded-md w-full"
                                                        required
                                                        placeholder="Value"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={addKeyValueField}
                                        className="font-medium text-purple-600 hover:text-purple-500 text-center text-sm mt-1">
                                        Add Fields
                                    </button>
                                </div>
                            </div></div>)}

                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleUpdatePromptButton}>Update</button>
                </div>
            )}

            {/* View All Prompts Data div */}
            {divNumber === 6 && (
                <div>
                    <h1 style={h1Style}>All Prompts</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-4">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMPromptsState.APIKey}
                                onChange={handleChange6}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewLLMPromptsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>App Type</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Memory Type</th>
                                    </tr>
                                </thead>
                                {/* Table body with prompts data */}
                                {promptsData.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                    </tr>
                                ) : (
                                    promptsData.map((config, index) => (
                                        <tr key={index}>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                title={config.promptType === 'simple' ? `Prompt: ${config.simplePrompt}` : `System Message: ${config.systemMessage}\nAI Message: ${config.aiMessage}\nHuman Message: ${config.humanMessage}`}
                                                onClick={() => handlePromptClick(viewLLMPromptsState.APIKey, config.promptId, config.appType, config.memoryType, config.kValue, config.tokenLimit, config.systemMessage, config.aiMessage, config.humanMessage, config.inputData)}
                                            >
                                                {config.promptId}
                                            </td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{config.appType}</td>
                                            <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }} >
                                                {config.appType === 'simple' ? '-' : config.memoryType}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* New Deployment div */}
            {divNumber === 7 && (
                <div>
                    <h1 style={h1Style}>Add New Deployment</h1>

                    <form className="mt-6 space-y-6">
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className='mb-4'>
                                <input
                                    type='text'
                                    id="tag"
                                    name="tag"
                                    value={addLLMDeploymentState.tag}
                                    onChange={handleChange7}
                                    placeholder='Enter Tag Name'
                                    className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <div className="">
                                <div className="mb-2">
                                    <select
                                        id="APIKey"
                                        name="APIKey"
                                        value={addLLMDeploymentState.APIKey}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="modelId"
                                        name="modelId"
                                        value={addLLMDeploymentState.modelId}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Model ID</option>
                                        {ModelIDs.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="mode"
                                        name="mode"
                                        value={deployModelData.mode}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Mode'
                                        disabled
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="model"
                                        name="model"
                                        value={deployModelData.modelType}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Model'
                                        disabled
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="modelName"
                                        name="modelName"
                                        value={deployModelData.modelName}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Model Name'
                                        disabled />
                                </div>
                                {deployModelData.modelName && deployModelData.engine !== '' && (
                                    <div className="mb-2">
                                        <input
                                            id="engine"
                                            name="engine"
                                            type="text"
                                            value={deployModelData.engine}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=' Engine'
                                            disabled
                                        />
                                    </div>
                                )}
                                {deployModelData.mode === "Cloud" && (
                                    <div className="mb-2">
                                        <input
                                            id="cloudAPIKey"
                                            name="cloudAPIKey"
                                            value={deployModelData.cloudAPIKey}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            type="text"
                                            placeholder="Cloud API Key"
                                            disabled
                                        />
                                    </div>
                                )}
                                <div className="mb-2">
                                    <select
                                        id="promptId"
                                        name="promptId"
                                        value={addLLMDeploymentState.promptId}
                                        onChange={handleChange7}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Prompt ID</option>
                                        {PromptIDs.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-2">
                                    <input
                                        id="appType"
                                        name="appType"
                                        value={deployPromptData.appType}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        disabled
                                        placeholder='App Type'
                                    />
                                </div>

                                {deployPromptData.appType === "conversational" && (
                                    <div>
                                        <div className="mb-2">
                                            <input
                                                id="memoryType"
                                                name="memoryType"
                                                value={deployPromptData.memoryType}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder=' Memory Type'
                                                disabled />
                                        </div>

                                        {deployPromptData.memoryType === "windowBuffer" && (
                                            <div className="mb-2">
                                                <input
                                                    id="kValue"
                                                    name="kValue"
                                                    type="text"
                                                    value={deployPromptData.kValue}
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    disabled
                                                    placeholder=" K Value"
                                                />
                                            </div>
                                        )}

                                        {deployPromptData.memoryType === "tokenBuffer" && (
                                            <div className="mb-2">
                                                <input
                                                    id="tokenLimit"
                                                    name="tokenLimit"
                                                    type="text"
                                                    value={deployPromptData.tokenLimit}
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    disabled
                                                    placeholder=" Tokens Limit"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="systemMessage"
                                            name="systemMessage"
                                            value={deployPromptData.systemMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" System Message"
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="aiMessage"
                                            name="aiMessage"
                                            value={deployPromptData.aiMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" AI Message"
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="humanMessage"
                                            name="humanMessage"
                                            value={deployPromptData.humanMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" Human Message"
                                            disabled
                                        />
                                    </div>
                                </div>

                                {deployPromptData.inputData && (
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {Object.entries(deployPromptData.inputData).map(([key, value], index) => (
                                            <div key={index}>
                                                <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`key-${index}`}
                                                            name={`key-${index}`}
                                                            type="text"
                                                            value={key}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            disabled
                                                            placeholder=" Key"
                                                        />
                                                    </div>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`value-${index}`}
                                                            name={`value-${index}`}
                                                            type="text"
                                                            value={value}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            disabled
                                                            placeholder=" Value"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleNewDeploymentButton}>Add</button>
                    </form>
                </div>
            )}

            {/* Update Existing Deployment div */}
            {divNumber === 8 && (
                <div>
                    <h1 style={h1Style}>Update LLM Deploy ID {updateLLMDeployIdState.deployId}</h1>

                    <form className="mt-6 space-y-6">
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className='mb-4'>
                                <input
                                    type='text'
                                    id="newTagName"
                                    name="newTagName"
                                    value={updateLLMDeployIdState.newTagName}
                                    onChange={handleChange8}
                                    placeholder='Enter Tag Name'
                                    className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <div className="">
                                <div className="mb-2">
                                    <select
                                        id="APIKey"
                                        name="APIKey"
                                        value={updateLLMDeployIdState.APIKey}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full">
                                        <option value="">Select API Key</option>
                                        {APIKeys.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <select
                                        id="modelId"
                                        name="modelId"
                                        value={updateLLMDeployIdState.modelId}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Model ID</option>
                                        {ModelIDs.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="mode"
                                        name="mode"
                                        value={deployModelData.mode}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Mode'
                                        disabled
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="model"
                                        name="model"
                                        value={deployModelData.modelType}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Model'
                                        disabled
                                    />
                                </div>
                                <div className="mb-2">
                                    <input
                                        id="modelName"
                                        name="modelName"
                                        value={deployModelData.modelName}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        placeholder=' Model Name'
                                        disabled />
                                </div>
                                {deployModelData.modelName && deployModelData.engine !== '' && (
                                    <div className="mb-2">
                                        <input
                                            id="engine"
                                            name="engine"
                                            type="text"
                                            value={deployModelData.engine}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=' Engine'
                                            disabled
                                        />
                                    </div>
                                )}
                                {deployModelData.mode === "Cloud" && (
                                    <div className="mb-2">
                                        <input
                                            id="cloudAPIKey"
                                            name="cloudAPIKey"
                                            value={deployModelData.cloudAPIKey}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            type="text"
                                            placeholder="Cloud API Key"
                                            disabled
                                        />
                                    </div>
                                )}



                                <div className="mb-2">
                                    <select
                                        id="promptId"
                                        name="promptId"
                                        value={updateLLMDeployIdState.promptId}
                                        onChange={handleChange8}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        required>
                                        <option value="">Select Prompt ID</option>
                                        {PromptIDs.map((data) => (
                                            <option key={data} value={data}>
                                                {data}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-2">
                                    <input
                                        id="appType"
                                        name="appType"
                                        value={deployPromptData.appType}
                                        className="mt-1 p-2 border rounded-md w-full"
                                        disabled
                                        placeholder='App Type'
                                    />
                                </div>

                                {deployPromptData.appType === "conversational" && (
                                    <div>
                                        <div className="mb-2">
                                            <input
                                                id="memoryType"
                                                name="memoryType"
                                                value={deployPromptData.memoryType}
                                                className="mt-1 p-2 border rounded-md w-full"
                                                placeholder=' Memory Type'
                                                disabled />
                                        </div>

                                        {deployPromptData.memoryType === "windowBuffer" && (
                                            <div className="mb-2">
                                                <input
                                                    id="kValue"
                                                    name="kValue"
                                                    type="text"
                                                    value={deployPromptData.kValue}
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    disabled
                                                    placeholder=" K Value"
                                                />
                                            </div>
                                        )}

                                        {deployPromptData.memoryType === "tokenBuffer" && (
                                            <div className="mb-2">
                                                <input
                                                    id="tokenLimit"
                                                    name="tokenLimit"
                                                    type="text"
                                                    value={deployPromptData.tokenLimit}
                                                    className="mt-1 p-2 border rounded-md w-full"
                                                    disabled
                                                    placeholder=" Tokens Limit"
                                                />
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="systemMessage"
                                            name="systemMessage"
                                            value={deployPromptData.systemMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" System Message"
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="aiMessage"
                                            name="aiMessage"
                                            value={deployPromptData.aiMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" AI Message"
                                            disabled
                                        />
                                    </div>
                                    <div className="mb-1" style={{ maxHeight: '80px', overflowY: 'auto' }}>
                                        <textarea
                                            id="humanMessage"
                                            name="humanMessage"
                                            value={deployPromptData.humanMessage}
                                            className="mt-1 p-2 border rounded-md w-full"
                                            placeholder=" Human Message"
                                            disabled
                                        />
                                    </div>
                                </div>

                                {deployPromptData.inputData && (
                                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {Object.entries(deployPromptData.inputData).map(([key, value], index) => (
                                            <div key={index}>
                                                <div id={`keyValueFields-${index}`} style={{ display: 'flex', gap: '1rem' }}>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`key-${index}`}
                                                            name={`key-${index}`}
                                                            type="text"
                                                            value={key}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            disabled
                                                            placeholder=" Key"
                                                        />
                                                    </div>
                                                    <div className="mb-2" style={{ flex: 1 }}>
                                                        <input
                                                            id={`value-${index}`}
                                                            name={`value-${index}`}
                                                            type="text"
                                                            value={value}
                                                            className="mt-1 p-2 border rounded-md w-full"
                                                            disabled
                                                            placeholder=" Value"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <button className={submitButtonClass} onClick={handleUpdateDeploymentButton}>Add</button>
                    </form>
                </div>
            )}

            {/* View All Deployments Data div */}
            {divNumber === 9 && (
                <div>
                    <h1 style={h1Style}>All Deployments</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-2">
                            <select
                                id="APIKey"
                                name="APIKey"
                                value={viewLLMDeploymentsState.APIKey}
                                onChange={handleChange9}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewLLMDeploymentsState.APIKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Tag Name</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Deployment ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Model ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Prompt ID</th>
                                    </tr>
                                </thead>
                                {/* Table body with deployments data */}
                                <tbody>
                                    {deploymentsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        deploymentsData.map((deployment, index) => (
                                            <tr key={index}>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.tagName}</td>

                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleDeployIdClick(deployment.tagName, viewLLMDeploymentsState.APIKey, deployment.deployId, deployment.modelId, deployment.promptId)}
                                                >
                                                    {deployment.deployId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.modelId}</td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{deployment.promptId}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {divNumber === 10 && (
                <div>
                    <h1 style={h1Style}>Add New Inferance Parameters</h1>

                    <form className="mt-3 space-y-6" >
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="clientApiKey"
                                    name="clientApiKey"
                                    value={addLLMInferanceParamState.clientApiKey}
                                    onChange={handleChange10}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='mb-2'>
                                <input
                                    type='name'
                                    id="name"
                                    name="name"
                                    value={addLLMInferanceParamState.name}
                                    onChange={handleChange10}
                                    placeholder='Enter  Name'
                                    className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <table className='mt-1 w-full'>
                                <tbody>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="temprature" className='p-2 text-m '>Temprature</label>
                                        </td>
                                        <td>
                                            <input
                                                id="temprature"
                                                name="temprature"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={addLLMInferanceParamState.temprature}
                                                onChange={handleChange10}
                                            />
                                        </td>
                                        <td><span className='p-2'>{addLLMInferanceParamState.temprature}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="topK" className='p-2 text-m '>Top K Value</label>
                                        </td>
                                        <td>
                                            <input
                                                id="topK"
                                                name="topK"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={addLLMInferanceParamState.topK}
                                                onChange={handleChange10}
                                            />
                                        </td>
                                        <td><span className='p-2'>{addLLMInferanceParamState.topK}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="topP" className='p-2 text-m '>Top P Value</label>
                                        </td>
                                        <td>
                                            <input
                                                id="topP"
                                                name="topP"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={addLLMInferanceParamState.topP}
                                                onChange={handleChange10}
                                            />
                                        </td>
                                        <td><span className='p-2'>{addLLMInferanceParamState.topP}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="temprature" className='p-2 text-m '>Max Tokens Limit</label>
                                        </td>
                                        <td>
                                            <input
                                                id="tokensLimit"
                                                name="tokensLimit"
                                                type='range'
                                                min={100}
                                                max={10000}
                                                step={50}
                                                value={addLLMInferanceParamState.tokensLimit}
                                                onChange={handleChange10}
                                            />
                                        </td>
                                        <td><span>{addLLMInferanceParamState.tokensLimit}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleNewInferanceParamstButton}>Add Prompt</button>
                </div>
            )}
            {divNumber === 11 && (
                <div>
                    <h1 style={h1Style}>Update Inferance Parameters Info - {updateLLMInferanceParamState.inferanceId}</h1>

                    <form className="mt-3 space-y-6" >
                        <div style={{ maxHeight: '350px', overflow: 'auto', scrollbarWidth: 'thin' }}>
                            <div className="mb-2">
                                <select
                                    id="clientApiKey"
                                    name="clientApiKey"
                                    value={updateLLMInferanceParamState.clientApiKey}
                                    onChange={handleChange11}
                                    className="mt-1 p-2 border rounded-md w-full"
                                    required>
                                    <option value="">Select API Key</option>
                                    {APIKeys.map((data) => (
                                        <option key={data} value={data}>
                                            {data}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='mb-2'>
                                <input
                                    type='newName'
                                    id="newName"
                                    name="name"
                                    value={updateLLMInferanceParamState.newName}
                                    onChange={handleChange11}
                                    placeholder='Enter  Name'
                                    className="mt-1 p-2 border rounded-md w-full" />
                            </div>
                            <table className='mt-1 w-full'>
                                <tbody>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="temprature" className='p-2 text-m '>Temprature</label>
                                        </td>
                                        <td>
                                            <input
                                                id="temprature"
                                                name="temprature"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={updateLLMInferanceParamState.temprature}
                                                onChange={handleChange11}
                                            />
                                        </td>
                                        <td><span className='p-2'>{updateLLMInferanceParamState.temprature}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="topK" className='p-2 text-m '>Top K Value</label>
                                        </td>
                                        <td>
                                            <input
                                                id="topK"
                                                name="topK"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={updateLLMInferanceParamState.topK}
                                                onChange={handleChange11}
                                            />
                                        </td>
                                        <td><span className='p-2'>{updateLLMInferanceParamState.topK}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="topP" className='p-2 text-m '>Top P Value</label>
                                        </td>
                                        <td>
                                            <input
                                                id="topP"
                                                name="topP"
                                                type='range'
                                                min={0}
                                                max={1}
                                                step={0.010}
                                                value={updateLLMInferanceParamState.topP}
                                                onChange={handleChange11}
                                            />
                                        </td>
                                        <td><span className='p-2'>{updateLLMInferanceParamState.topP}</span></td>
                                    </tr>
                                    <tr className="mt-5 p-2">
                                        <td >
                                            <label for="temprature" className='p-2 text-m '>Max Tokens Limit</label>
                                        </td>
                                        <td>
                                            <input
                                                id="tokensLimit"
                                                name="tokensLimit"
                                                type='range'
                                                min={100}
                                                max={10000}
                                                step={50}
                                                value={updateLLMInferanceParamState.tokensLimit}
                                                onChange={handleChange11}
                                            />
                                        </td>
                                        <td><span>{updateLLMInferanceParamState.tokensLimit}</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </form>
                    <button className={submitButtonClass} onClick={handleUpdateInferanceParamstButton}>Add Prompt</button>
                </div>
            )}
            {divNumber === 12 && (
                <div>
                    <h1 style={h1Style}>All Inferance Parameters</h1>

                    <form className="mt-6 space-y-6">
                        <div className="mb-2">
                            <select
                                id="clientApiKey"
                                name="clientApiKey"
                                value={viewLLMInferanceParamsState.clientApiKey}
                                onChange={handleChange12}
                                className="mt-1 p-2 border rounded-md w-full"
                                required>
                                <option value="">Select API Key</option>
                                {APIKeys.map((data) => (
                                    <option key={data} value={data}>
                                        {data}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </form>

                    {viewLLMInferanceParamsState.clientApiKey && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                                <thead style={{ position: 'sticky', top: 0, background: 'rgba(255, 255, 255, 1)' }}>
                                    <tr>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}> Inferance ID</th>
                                        <th style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inferanceParamsData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>No records found</td>
                                        </tr>
                                    ) : (
                                        inferanceParamsData.map((inferance, index) => (
                                            <tr key={index}>
                                                <td
                                                    style={{ border: '1.5px solid #ddd', textAlign: 'center', cursor: 'pointer', color: 'blue' }}
                                                    onClick={() => handleInferanceIdClick(inferance.name, viewLLMInferanceParamsState.clientApiKey, inferance.inferanceId, inferance.temprature, inferance.topK, inferance.topP, inferance.tokensLimit)}
                                                >
                                                    {inferance.inferanceId}
                                                </td>
                                                <td style={{ border: '1.5px solid #ddd', textAlign: 'center' }}>{inferance.name}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
    )
}