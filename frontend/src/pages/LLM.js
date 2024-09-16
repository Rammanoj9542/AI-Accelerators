import HeaderUser from "../components/HeaderUser";
import LLM from "../components/LLM";
import configData from '../constants/config.json';

export default function LLMPage() {
    return (
        <div style={{ height:'600px', width:'100%'}} className="flex flex-col justify-center items-center mt-4">
            <div style={{maxHeight:'60px'}}>
            <HeaderUser
                heading={configData.LLM.Heading}
            />
            </div >
            <div style={{MaxHeight:'540px', width:'100%'}} >
            <LLM />
            </div>
        </div>
    )
}