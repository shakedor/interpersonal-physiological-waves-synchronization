import React, {useEffect, useState, Fragment} from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { HomePageDiv, SelectExpBox} from '../components/div.style';
import Logout from '../components/logout';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { AccordionActions } from '@mui/material';
import Typography from '@mui/material/Typography';
import Message from '../components/message.style';
import Button from '@mui/material/Button';
import axios from 'axios';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import { Divider } from '@mui/material';
import { SubmitButton } from '../components/button.style';
import ListSubheader from '@mui/material/ListSubheader';

// Accordion style:
const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
    ))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
      borderBottom: 0,
    },
    '&:before': {
      display: 'none',
    },
}));
  
const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
        {...props}
    />
    ))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
        ? 'rgba(255, 255, 255, .05)'
        : 'rgba(0, 0, 0, .03)',
    flexDirection: 'row-reverse',
    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
        transform: 'rotate(90deg)',
    },
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));
  
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));


function SelectExpPage() {
    const navigate = useNavigate();
    // message for uploading the videos
    const [vidMessage, setVidMessage] = useState('');
    // selectes expirement
    const [expirement, setExpirement] = useState("");
    // selected shared expirement
    const [shared_expirement, setSharedExpirement] = useState("");
    const [shared_expirement_id, setSharedExpirementID] = useState("");
    // selected trial
    const [trial, setTrial] = useState("");
    const [shared_trial, setSharedTrial] = useState("");
    const [trialID, setTrialID] = useState("");
    const [sharedTrialID, setSharedTrialID] = useState("");
    const [expanded, setExpanded] = React.useState('panel1');
    const [expID, setExpID] = useState('');
    // initiallize the uploading files
    const [files, setFiles] = useState([]);
    // saving details on the uploading files
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedFilesTemp, setUploadedFilesTemp] = useState([]);
    const [uploadedFilesPath, setUploadedFilesPath] = useState([]);
    const [helperState, setHelperState] = useState([]);
    // show the group results of my uploads 
    const[showGropusResults, setShowGroupResults] = useState(false);
    // show the group results of my shared expirements
    const[showSharedGropusResults, setShowSharedGroupResults] = useState(false);


    /////////////////////////////////////////
    const [big_experiments, setBigExpirements] = useState('');
    const [shared_big_experiments, setSharedBigExpirements] = useState('');
    const [groups_results, setGroupsResults] = useState('');
    const [shared_groups_results, setSharedGroupsResults] = useState('');
    const [userDetails, setUserDetails] = useState({
        _id: '',
        first_name: '',
        last_name: '',
        email: ''})

    useEffect(() => {
        async function getAllBigExp(){
            try{
                setUserDetails(JSON.parse(localStorage.getItem("user_details")));
                const userId = JSON.parse(localStorage.getItem("user_details"))._id;
                const token = localStorage.getItem("token");
                axios.defaults.headers.common['authorization'] = 'Bearer '+ token
                const {data: res} = await axios.get('http://localhost:5000/bigexp/'+userId);
                const allBigExp = res.data;
                setBigExpirements(allBigExp);
            } catch(error){
                if(
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status <= 500
                ){
                    alert(error.response.data.message);
                }
            }
            // get information about expirements that shared with me
            try{
                setUserDetails(JSON.parse(localStorage.getItem("user_details")));
                const userId = JSON.parse(localStorage.getItem("user_details"))._id;
                const token = localStorage.getItem("token");
                axios.defaults.headers.common['authorization'] = 'Bearer '+ token
                const {data: res} = await axios.get('http://localhost:5000/bigexp/hasaccess/'+userId);
                const sharedBigExp = res.data;
                setSharedBigExpirements(sharedBigExp);
            } catch(error){
                if(
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status <= 500
                ){
                    alert(error.response.data.message);
                }
            }

        }
        getAllBigExp();
    }, []);

    // get information about group result of expirements i uploaded
    const getAllGroupsResults = async(bigexpID)=> {
        try{
            const userId = userDetails._id;
            // take information about my expirements
            const {data: res} = await axios.get('http://localhost:5000/bigexp/'+userId+'/'+bigexpID);
            const groupsResults = res.data;
            setGroupsResults(groupsResults);
        } catch(error){
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
                alert(error.response.data.message);
            }
        }   
    };

    // get information about group results that were shared with me
    const getAllSharedGroupsResults = async(bigexpID)=> {
        try{
            const userId = userDetails._id;
            const {data: res} = await axios.get('http://localhost:5000/bigexp/'+userId+'/'+bigexpID);
            const sharedGroupsResults = res.data;
            setSharedGroupsResults(sharedGroupsResults);       
        } catch(error){
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
                alert(error.response.data.message);
            }
        } 
    };

    // catch the uploded files
    const onInputChange = (e) => {
        setFiles(e.target.files);
    };

    // helper function for saving the uploaded videos
    const addFileData = React.useCallback((fileName, filePath) => {
        const tempFilesName = uploadedFiles;
        const tempFilePaths = uploadedFilesPath;
        tempFilesName.push(fileName);
        tempFilePaths.push(filePath);
        setHelperState(uploadedFiles => uploadedFiles.concat(tempFilesName));
        setHelperState(uploadedFilesPath => uploadedFilesPath.concat(tempFilePaths));
    })

    /**
     * The function uploads video files the user inesertes from the server. First the function checks 
     * if the files are valid, and then sends the request to the server.
     */   
    const onSubmit = async e => {
        e.preventDefault();
        const data = new FormData();

        for(let i = 0; i < files.length; i++){
            // send the data
            data.append('file', files[i]);
        }

        // extract the extention of the file
        let extention = files[0].name.split('.').pop();
        // in case more then one zip uploaded
        if((files.length > 1) && extention.match('zip')){
            alert('Please upload one zip file at a time');
        }
        // in case the file wasn't mp4 or zip
        else if((files.length === 1) && (!extention.match('mp4') && (!extention.match('zip')))){
            alert('Please upload several mp4 files or a zip files with all videos')
        }
        else{
            setVidMessage('Uploading...');

            data.append('researcher',JSON.parse(localStorage.getItem("user_details"))._id)

            try {
                const token = localStorage.getItem("token");
                // save the files from the server
                const res = await axios.post('http://localhost:5000/uploads/selectExp', data, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    'authorization': 'Bearer '+ token
                    },
                });
    
                // save the uploaded file's data
                let { fileName, filePath } =  await res.data;
                addFileData(fileName, filePath);

                // unzip the videos if needed
                if(files.length === 1 && extention.match('zip')){
                    try{
                        // request from the server to unzip the uploded file
                        const token = localStorage.getItem("token");
                        data.append('namesForUnzip', uploadedFiles[uploadedFiles.length - 1])
                        let res = await axios.post("http://localhost:5000/uploads/unzipsingle", data, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'authorization': 'Bearer '+ token
                            },
                        })
                        // save the unzipped videos
                        const zipFilesNames  = res.data.names;
                        const tempZipNames = uploadedFilesTemp;
                        tempZipNames.push(zipFilesNames);
                        setHelperState(uploadedFilesTemp => [...uploadedFilesTemp, tempZipNames]);
                    }
                    catch(err){
                        if(err.response.status === 500){
                            setVidMessage('There was a problem with the server');
                        } else {
                            setVidMessage(err.response.data.message);
                        }
                        return
                    } 
                }

                setVidMessage('Videos uploaded successfully');
    
            } catch (err){
                if(err.response.status === 500){
                    setVidMessage('There was a problem with the server');
                } else {
                    setVidMessage(err.response.data.message);
                }
            }
        }


    };

    // accordion changing pages
    const handleChange = (panel) => (event, newExpanded) => {
      setExpanded(newExpanded ? panel : false);
    };
    
    // save the data the user chose for the research page
    const nextPage = () => {
        if((expirement !== "" || shared_expirement !== "") && (trial !== "" || shared_trial !== "")){
            // my uploads
            if(trial !== ""){
                let allData = {};
                allData.userId = userDetails._id;
                allData.groupId = trialID;
                allData.expId = expID;
                allData.uploadedVideoFiles = uploadedFiles;
                allData.uploadedFilesZip = uploadedFilesTemp;
                allData.isBookmark = false;
                navigate('/research',{replace: true, state:[allData]});
            }
            // shared experimant
            else{
                let allData = {};
                allData.userId = userDetails._id;
                allData.groupId = sharedTrialID;
                allData.expId = shared_expirement_id;
                allData.uploadedVideoFiles = uploadedFiles;
                allData.uploadedFilesZip = uploadedFilesTemp;
                allData.isBookmark = false;
                navigate('/research',{replace: true, state:[allData]});
            }
            
        }
        else{
            alert('One or more of the fields was not selected');
        }
    };

    // handle function after selecting an expirement for my uploads
    const handleExpRadioButton = (expirement) => {
        setShowGroupResults(true);
        setShowSharedGroupResults(false);
        getAllGroupsResults(expirement._id);
        setExpirement(expirement._id);
        setExpID(expirement._id)
        setSharedExpirement('');
    };

    // handle function after selecting an expirement for shared ones
    const handleSharedExpRadioButton = (expirement) => {
        setShowSharedGroupResults(true);
        setShowGroupResults(false);
        getAllSharedGroupsResults(expirement._id);
        setSharedExpirement(expirement._id);
        setSharedExpirementID(expirement._id);
        setExpirement('');
    };

    // handle function after selecting a trial
    const handleTrialRadioButton = (trial) => {
        setTrial(trial._id);
        setTrialID(trial._id);
        setSharedTrialID('');
        setSharedTrial('');
    };

    // handle function after selecting a shared trial
    const handleSharedTrialRadioButton = (trial) => {
        setSharedTrial(trial._id);
        setSharedTrialID(trial._id);
        setTrialID('');
        setTrial('');
    };

    return (
        <HomePageDiv>
            <Logout/>
            <SelectExpBox>
                <Typography sx={{color:'white', fontWeight: 'regular', fontSize: 25, textAlign: 'center', marginBottom:3}}>Please choose the expirement properties</Typography>
                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Choose an expirement</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    <List
                    sx={{
                        width: '100%',
                        maxWidth: 450,
                        bgcolor: 'background.paper',
                        position: 'relative',
                        overflow: 'auto',
                        maxHeight: 300,
                        '& ul': { padding: 0 },
                        borderRadius: 5,
                        marginBottom: 3,
                    }}
                    subheader={<li />}
                    >
                    <ListSubheader>My uploads</ListSubheader>
                        {Object.keys(big_experiments).map((item, i)=>(
                            <ListItem key={i}>
                                <FormControl>
                                <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue="female"
                                    name="radio-buttons-group"
                                    value={expirement}
                                    onChange={()=>{handleExpRadioButton(big_experiments[item])}}
                                >
                                    <FormControlLabel value={big_experiments[item]._id} control={<Radio />} label={big_experiments[item].exp_name} />
                                </RadioGroup>
                                </FormControl>
                            </ListItem>
                        ))}
                        <Divider/>
                        <ListSubheader>Shared expirements</ListSubheader>
                        {Object.keys(shared_big_experiments).map((item, i)=>(
                            <ListItem key={i}>
                                <FormControl>
                                <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue="female"
                                    name="radio-buttons-group"
                                    value={shared_expirement}
                                    onChange={()=>{handleSharedExpRadioButton(shared_big_experiments[item])}}
                                >
                                    <FormControlLabel value={shared_big_experiments[item]._id} control={<Radio />} label={shared_big_experiments[item].exp_name} />
                                </RadioGroup>
                                </FormControl>
                            </ListItem>
                        ))}
                    </List>
                    <Divider/>
                    <AccordionActions>
                            <Button size="small" onClick={() => {
                                if(expirement !== '' || shared_expirement !== ''){
                                    setExpanded('panel2');
                                    handleChange('panel2');
                                }
                                else{
                                    alert('No experiment selected');
                                }
                            }
                                }>continue</Button>
                        </AccordionActions>
                    </AccordionDetails>
                </Accordion>
                
                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')} >
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Choose a trial</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <List
                        sx={{
                            width: '100%',
                            maxWidth: 450,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'auto',
                            maxHeight: 300,
                            '& ul': { padding: 0 },
                            borderRadius: 5,
                            marginBottom: 3,
                        }}
                        subheader={<li />}
                        >
                            {showGropusResults?
                                <div>
                                    {Object.keys(groups_results).map((item, i)=>(
                                        <ListItem key={i}>
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="demo-radio-buttons-group-label"
                                                    defaultValue="female"
                                                    name="radio-buttons-group"
                                                    value={trial}
                                                    onChange={() => {handleTrialRadioButton(groups_results[item])}}
                                                >
                                                    <FormControlLabel value={groups_results[item]._id} control={<Radio />} label={groups_results[item].group_name} />
                                                </RadioGroup>
                                            </FormControl>
                                        </ListItem>
                                    ))}
                                </div>
                            :null}
                            {showSharedGropusResults?
                                <div>
                                    {Object.keys(shared_groups_results).map((item, i)=>(
                                        <ListItem key={i}>
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="demo-radio-buttons-group-label"
                                                    defaultValue="female"
                                                    name="radio-buttons-group"
                                                    value={shared_trial}
                                                    onChange={() => {handleSharedTrialRadioButton(shared_groups_results[item])}}
                                                >
                                                    <FormControlLabel value={shared_groups_results[item]._id} control={<Radio />} label={shared_groups_results[item].group_name} />
                                                </RadioGroup>
                                            </FormControl>
                                        </ListItem>
                                    ))}
                                </div>
                            :null}
                        </List>
                        <Divider/>
                        <AccordionActions>
                            <Button size="small" onClick={() => {
                                if(trial !== '' || shared_trial !== ''){
                                    setExpanded('panel3');
                                    handleChange('panel3');
                                }
                                else{
                                    alert('No trial selected');
                                }
                                }}>continue</Button>
                        </AccordionActions>
                    </AccordionDetails>
                </Accordion>

                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>Upload video files</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <FormControl>
                            <div className='container mt-4 text-center'>
                                <Fragment>
                                    {/* message for the file status */}
                                    {vidMessage ? <Message msg={vidMessage} /> : null}
                                    <form method="post" onSubmit={onSubmit}>
                                        
                                        <div className="mb-3">
                                            <input className="form-control" type="file" id="formFileMultiple" multiple onChange={onInputChange}/>
                                        </div>
                                
                                        {/* submit button */}
                                        <SubmitButton type="Submit" className="btn btn-primary btn-lg btn-block">Upload</SubmitButton>
                                
                                    </form>
                                </Fragment>

                            </div>
                        </FormControl>
                    </AccordionDetails>
                </Accordion>

                {/* continue button */}
                <Button sx={{marginTop: 3}} variant="contained" onClick={() => {nextPage()}}>Let's Go!</Button>
            </SelectExpBox>


        <Outlet/> 
        </HomePageDiv>
    )
}

export default SelectExpPage;

