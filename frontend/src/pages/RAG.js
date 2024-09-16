import HeaderUser from "../components/HeaderUser";
import RAG from "../components/RAG";
import configData from '../constants/config.json';

export default function RAGPage() {
    return (
        <div style={{ height:'600px', width:'100%'}} className="flex flex-col justify-center items-center mt-4">
            <div style={{maxHeight:'60px'}}>
            <HeaderUser
                heading={configData.RAG.Heading}
            />
            </div >
            <div style={{MaxHeight:'540px', width:'100%'}} >
            <RAG />
            </div>
        </div>
    )
}