import os
from langchain.document_loaders import (
    CSVLoader,
    PDFMinerLoader,
    TextLoader,
    UnstructuredExcelLoader,
    Docx2txtLoader,
    PyPDFLoader,
    JSONLoader,
)
from langchain.document_loaders import (
    UnstructuredFileLoader,
    UnstructuredMarkdownLoader,
)
from langchain.docstore.document import Document
from langchain.text_splitter import (
    RecursiveCharacterTextSplitter,
    CharacterTextSplitter,
    TokenTextSplitter,
    MarkdownHeaderTextSplitter,
)
from langchain.vectorstores import Chroma
from embedding_model_loader import EmbeddingModelLoader
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor, as_completed


class DocumentProcessor:
    def __init__(
        self,
        persist_directory,
        embedding_model_name,
        source_directory,
        ingest_config,
        device_type="cuda",
    ):
        self.persist_directory = persist_directory
        self.embedding_model_name = embedding_model_name
        self.source_directory = source_directory
        self.device_type = device_type
        self.splitter_type = ingest_config.get("splitterType")
        self.chunk_size = ingest_config.get("chunkSize")
        self.chunk_overlap = ingest_config.get("chunkOverlap")
        self.headers_to_split = ingest_config.get("headers")
        self.model_loader = EmbeddingModelLoader(
            model_name=self.embedding_model_name, device_type=self.device_type
        )

    DOCUMENT_MAP = {
        ".txt": TextLoader,
        ".md": UnstructuredMarkdownLoader,
        ".py": TextLoader,
        ".pdf": PDFMinerLoader,
        # ".pdf": UnstructuredFileLoader,
        ".csv": CSVLoader,
        ".xls": UnstructuredExcelLoader,
        ".xlsx": UnstructuredExcelLoader,
        ".docx": Docx2txtLoader,
        ".doc": Docx2txtLoader,
        ".json": JSONLoader,
    }

    INGEST_THREADS = os.cpu_count() or 8

    def load_single_document(self, file_path: str) -> Document:
        # Loads a single document from a file path
        try:
            file_extension = os.path.splitext(file_path)[1]
            loader_class = self.DOCUMENT_MAP.get(file_extension)
            if loader_class:
                if loader_class is CSVLoader:
                    print(file_path + " loaded.")
                    loader = loader_class(
                        file_path, encoding="utf-8", csv_args={"delimiter": ","}
                    )
                elif loader_class is JSONLoader:
                    print(file_path + " loaded.")
                    loader = loader_class(jq_schema='.Sheet1[]',file_path=file_path,text_content=False)
                    return loader.load()
                else:
                    print(file_path + " loaded.")
                    loader = loader_class(file_path)
            else:
                print(file_path + " document type is undefined.")
                raise ValueError("Document type is undefined")
            return loader.load()
        except Exception as ex:
            print("%s loading error: \n%s" % (file_path, ex))
            return None

    def load_document_batch(self, filepaths):
        # create a thread pool
        with ThreadPoolExecutor(len(filepaths)) as exe:
            # load files
            futures = [
                exe.submit(self.load_single_document, name) for name in filepaths
            ]
            # collect data
            if futures is None:
                return None
            else:
                data_list = [future.result() for future in futures]
                # return data and file paths
                return (data_list, filepaths)

    def load_documents(self) -> list[Document]:
        # Loads all documents from the source documents directory, including nested folders
        paths = []
        for root, _, files in os.walk(self.source_directory):
            for file_name in files:
                print("Importing: " + file_name)
                file_extension = os.path.splitext(file_name)[1]
                source_file_path = os.path.join(root, file_name)
                if file_extension in self.DOCUMENT_MAP.keys():
                    paths.append(source_file_path)

        # Have at least one worker and at most INGEST_THREADS workers
        n_workers = min(self.INGEST_THREADS, max(len(paths), 1))
        chunksize = round(len(paths) / n_workers)
        docs = []
        with ProcessPoolExecutor(n_workers) as executor:
            futures = []
            # split the load operations into chunks
            for i in range(0, len(paths), chunksize):
                # select a chunk of filenames
                filepaths = paths[i : (i + chunksize)]
                # submit the task
                try:
                    future = executor.submit(self.load_document_batch, filepaths)
                except Exception as ex:
                    future = None
                if future is not None:
                    futures.append(future)
            # process all results
            for future in as_completed(futures):
                # open the file and load the data
                try:
                    contents, _ = future.result()
                    docs.extend(contents)
                except Exception as ex:
                    print("Exception: %s" % (ex))

        return docs

    def split_documents(
        self, documents: list[Document]
    ) -> tuple[list[Document], list[Document]]:
        # Splits documents for correct Text Splitter
        text_docs, json_documents = [], []
        for document in documents:
            for doc in document:
                if doc is not None:
                    file_extension = os.path.splitext(doc.metadata["source"])[1]
                    if file_extension == ".json":
                        json_documents.append(doc)
                    else:
                        text_docs.append(doc)
        return text_docs, json_documents

    def process_documents(self):
        documents = self.load_documents()
        text_documents, json_documents = self.split_documents(documents)
        print(text_documents)
        print(json_documents)

        embeddings = self.model_loader.load_embeddings()
        
        if text_documents:
            if self.splitter_type in {
                "CharacterTextSplitter",
                "RecursiveCharacterTextSplitter",
                "TokenTextSplitter",
            }:
                splitter_class = {
                    "CharacterTextSplitter": CharacterTextSplitter,
                    "RecursiveCharacterTextSplitter": RecursiveCharacterTextSplitter,
                    "TokenTextSplitter": TokenTextSplitter,
                }.get(self.splitter_type)

                text_splitter = splitter_class(
                    chunk_size=self.chunk_size,
                    chunk_overlap=self.chunk_overlap,
                    length_function=len,
                )

                text = text_splitter.split_documents(text_documents)
            else:
                try:
                    headers_dict = self.headers_to_split
                    headers_list = [(key, value) for key, value in headers_dict.items()]
                    text_splitter = MarkdownHeaderTextSplitter(
                        headers_to_split_on=headers_list
                    )

                    data = text_documents[0].page_content

                    text = text_splitter.split_documents(data)

                except Exception as e:
                    print(f"Error Fetching 'IngestData' : {e}")
            
            db = Chroma.from_documents(
                text,
                embeddings,
                persist_directory=self.persist_directory,
            )
        
        if json_documents:
            db = Chroma.from_documents(
                json_documents,
                embeddings,
                persist_directory=self.persist_directory,
            )
   
            

        if db:
            return True
        else:
            return False
