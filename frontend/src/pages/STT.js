import HeaderUser from "../components/HeaderUser";
import STT from "../components/STT";
import configData from '../constants/config.json';

export default function STTPage() {
    return (
        <div style={{ height:'600px', width:'100%'}} className="flex flex-col justify-center items-center mt-4">
        
            <div style={{maxHeight:'60px'}}>
            <HeaderUser
                heading={configData.STT.Heading}
            />
            </div >
            <div style={{MaxHeight:'540px', width:'100%'}} >
            <STT />
            </div>
        </div>
    )
}