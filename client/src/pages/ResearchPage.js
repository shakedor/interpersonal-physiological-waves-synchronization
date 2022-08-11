import React, { useState } from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import { HomePageDiv } from '../components/div.style';
import '../components/ExperimentPage.css';
import Clock from '../graphs/Clock';
import axios from 'axios';

function ResearchPage() {
    const location = useLocation();
    let navigate = useNavigate();
    const [groupInfo, setGroupInfo] = useState(undefined);
    const [part, setPart] = useState(undefined);
    const [timeStep, setTimeStep] = useState(undefined);
    const [mdrqaParams, setMdrqaParams] = useState(undefined);
    const [ccfParams, setCCFParams] = useState(undefined);
    const [expName, setExpName] = useState('');
    const [groupName, setGroupName] = useState('');
    const [videoFilesFlag, setVideoFilesFlag] = useState(false);

    // save the researcher details
    const currInfo = location.state[0];
    const userId = currInfo.userId;
    const groupId = currInfo.groupId;
    const bigExpId = currInfo.expId; 
    const uploadedVideoFiles = currInfo.uploadedVideoFiles; 
    const uploadedFilesZip = currInfo.uploadedFilesZip;

    React.useEffect(async () =>  {
        // get the mdrqa parameters and ccf parameters from bigExp
        const token = localStorage.getItem("token");
        try{
            // get the big experiment
            const res1 = await axios.get('http://localhost:5000/bigexp/'+ userId +"/"+ bigExpId+"/getexp/", { 
                    headers: { 
                    'authorization': 'Bearer '+ token 
                    }, 
            });
            setExpName(res1.data.data.exp_name)
            setCCFParams(res1.data.data.ccf_params)
            setMdrqaParams(res1.data.data.mdrqa_params)
        }
        catch(error){
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
        }
    }, []);


    React.useEffect(() => {
        if(currInfo.isBookmark === true){
            setTimeStep(currInfo.timeStep);
            setPart(currInfo.part);
        }
        else{
            setTimeStep(0);
            setPart(0);
        }
    }, []);


    React.useEffect(async() => {
        
        if( part === undefined || timeStep === undefined){
            return
        }
        const data = new FormData();
        data.append("userId", userId)
        data.append("groupId", groupId)
        await axios.post("http://localhost:5000/groupInfo",data)
        .then((response) => {
            if(part !== 0){
                // need to convert from part name to part index
                response.data.info.map((p, idx) => part === p.part_name ? setPart(idx) : null  )               
            }
            setGroupInfo(response.data)
            setGroupName(response.data.groupName)
        }
        ,(error) => {
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
        });
    }, [part, timeStep]);

    
    React.useEffect( async() => {
        if(mdrqaParams === undefined){
            return
        }
        const data = new FormData();
        data.append("userID", userId)
        data.append("groupId", groupId)
        Object.keys(mdrqaParams).map(parameter =>  data.append(parameter, mdrqaParams[parameter]))

        await axios.post("http://localhost:5000/computemdrqa",data)
        .then((response) => {}
        ,(error) => {
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
        });
    }, [mdrqaParams]);


    React.useEffect(async () => {
        if(uploadedFilesZip.length > 0 || uploadedVideoFiles.length > 0){
            const delay = async (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms))
            // give time to the videos to load
            for (let i=0 ; i<5; i++){
                await delay(1000)
            }
        }

        setVideoFilesFlag(true)


    }, []);


    if (groupInfo === undefined || part === undefined || timeStep === undefined || ccfParams === undefined || videoFilesFlag === false){
        return(
            <HomePageDiv>
                <div style={{display: 'flex',  justifyContent:'center', alignItems:'center', height: '100vh'}}>
                    <h1> Loading Experiment... </h1>
                </div>
            </HomePageDiv>
        );
    }

    const finishPage = () =>{
        const userInfo = {};
        userInfo.userId = userId;
        userInfo.expId = bigExpId;
        userInfo.groupId = groupId;
        userInfo.expName = expName;
        userInfo.groupName = groupName;
        navigate('/finishPage', {replace: true, state:[userInfo]});
    }


    return (
        <HomePageDiv>
            <div className="clock">
                <Clock userId={userId} bigexpId={bigExpId} expId={groupId} group_info={groupInfo} 
                 shift={ccfParams.shift} takeMax={ccfParams.max} windowSize={ccfParams.window_size}
                  uploadedVideoFiles={uploadedVideoFiles} uploadedFilesZip={uploadedFilesZip}
                   part_num ={part} timeStep={timeStep} finish={finishPage}/>
            </div>
        </HomePageDiv>
    );
}

export default ResearchPage;