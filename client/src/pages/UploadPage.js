import React, { useState, Fragment, useEffect } from 'react';
import Message from '../components/message.style';
import { HomePageDiv, MyExpSelectExpBox } from '../components/div.style';
import { SubmitButton, UploadButton } from '../components/button.style';
import axios from 'axios';
import { Outlet, useNavigate } from 'react-router-dom';
import Logout from '../components/logout';
import ListItem from '@mui/material/ListItem';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { UploadQuestionDiv } from '../components/div.style';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ListSubheader from '@mui/material/ListSubheader';
import { Box } from '@mui/system';
import { Typography } from '@mui/material';
import { Divider } from '@mui/material';
import { UploadBox } from '../components/div.style';


function UploadPage() {
    const navigate = useNavigate();
    // initiallize the uploading files
    const [files, setFiles] = useState([]);
    // saving details on the uploading files
    const [uploadedFiles, setUploadedFiles] = useState({});
    // send messages according to the files uploding state
    const [message, setMessage] = useState('');
    // names of all existing expirements
    const [big_experiments, setBigExpirements] = useState('');
    // states for showing and hiding parts of the page
    const [showUploadNew, setShowUploadNew] = useState(false);
    const [showUploadExisting, setShowUploadExisting] = useState(false);
    const [showButtons, setShowButtons] = useState(true);
    const [expID, setExpID] = useState('');
    const [showUpdateMenu, setShowUpdateMenu] = useState(false);
    // save the experiment ID after uploading a new expriment
    const [uploadExpId, setUploadExpId] = useState();
      

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
        }
        getAllBigExp();
    }, []);


    // catch the uploded files
    const onInputChange = (e) => {
        setFiles(e.target.files);
    };

    // handle function after selecting an expirement
    const handleExpRadioButton = (expirement) => {
        setExpID(expirement._id);
    };


    // upload the files into the server using axios
    const onSubmit = async e => {
        e.preventDefault();
        const data = new FormData();

        for(let i = 0; i < files.length; i++){
            // save the data for the server
            data.append('file', files[i]);
        }

        // extract the file extention
        let extention = files[0].name.split('.').pop();
        // check how much files were uploaded
        if(files.length > 1){
            alert('Please upload one file at a time')
        }
        // check for the file extention
        else if(!extention.match('zip')){
            alert('Please upload zip file');
        }
        else{
            setMessage('Loading...');
            data.append('researcher',JSON.parse(localStorage.getItem("user_details"))._id)
            // save the uploaded file - server request
            try {
                const token = localStorage.getItem("token");
                const res = await axios.post('http://localhost:5000/uploads/upload', data, {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                    'authorization': 'Bearer '+ token
                  },
    
                });
    
                // save information about the uploaded files
                const { fileName, filePath } = res.data;
                const expId = res.data.expId;
                console.log(expId)
                
                setUploadedFiles({fileName, filePath});
                setUploadExpId(expId);
        
                setMessage('File/s uploaded successfully');
    
            } catch (err){
                if(err.response.status === 500){
                    alert('There was a problem with the server');
                } else {
                    alert(err.response.data.message);
                }
            }
        }


    };

    // upload the files into the server using axios
    const onSubmitExisting = async e => {

        e.preventDefault();
        const data = new FormData();

        for(let i = 0; i < files.length; i++){
            // send the data
            data.append('file', files[i]);
        }

        // extract the file extention
        let extention = files[0].name.split('.').pop();
        // check how much files were uploaded
        if(files.length > 1){
            alert('Please upload one file at a time')
        }
        // check for the file extention
        else if(!extention.match('zip')){
            alert('Please upload zip file');
        }
        else{
            setMessage('Loading...');

            data.append('researcher',JSON.parse(localStorage.getItem("user_details"))._id)
            data.append('bigExpId', expID)
    
    
            try {
                // save the uploaded file - server request
                const token = localStorage.getItem("token");
                const res = await axios.post('http://localhost:5000/uploads/uploadGroup', data, {
                    headers: {
                    'Content-Type': 'multipart/form-data',
                    'authorization': 'Bearer '+ token
                    },
    
                });
    
                // save inforantion about the file
                const { fileName, filePath } = res.data;
                
                setUploadedFiles({fileName, filePath});
        
                setMessage('File/s uploaded successfully');
    
            } catch (err){
                if(err.response.status === 500){
                    alert('There was a problem with the server');
                } else {
                    alert(err.response.data.message);
                }
            }
        }

    };

    // navigate to the next page when uploading big experiment
    const nextPage = () => {
        if(files.length !== 0){
            navigate('/settings', {replace: true, state:[uploadExpId]});
        }
        else{
            alert('No files uploaded');
        }
    }

    // navigate to the next page when uploading group result
    const nextPageGroupRes = () => {
        navigate('/homepage');
    }

    // Handle function for going back to the upload menu page
    const handleUploadMenu = () => {
        setShowUpdateMenu(false);
        setShowButtons(true);
        window.location.reload();
        if(showUploadExisting){
            setShowUploadExisting(false);
        }
        else{
            setShowUploadNew(false);
        }
    }


    return (
        <HomePageDiv>
            <Logout/>
                    {/* Add new expirement */}
                    {showUploadNew?
                        <MyExpSelectExpBox>
                            <div className='container mt-4 text-center'>
                                <Fragment>
                                    {/* message for the file status */}
                                    {message ? <Message msg={message} /> : null}

                                    <Typography sx={{color:'white', 
                                        fontWeight: 'regular', 
                                        fontSize: 30, 
                                        textAlign: 'center', 
                                        marginBottom:3}}>Upload new experiment
                                    </Typography>
                                                                
                                    <form method="post" onSubmit={onSubmit}>
                                        
                                        <div className="mb-3">
                                            <input className="form-control" type="file" id="formFileMultiple" multiple onChange={onInputChange}/>
                                        </div>
                                
                                        {/* submit button */}
                                        <UploadButton type="Submit" className="btn btn-primary btn-lg btn-block">Upload</UploadButton>
                                
                                    </form>
                                </Fragment>
                                <SubmitButton type="button" className="btn btn-primary btn-lg btn-block" onClick={()=>{nextPage()}}>Continue to experiment settings</SubmitButton>
                            </div>
                            {/* Back to upload menu button */}
                            {showUpdateMenu?
                                <div className='container mt-4 text-center'>
                                    <Button variant="contained" onClick={() => {handleUploadMenu()}}>Back to upload menu</Button>
                                </div>
                            :null}
                        </MyExpSelectExpBox>

                    :null}
                
                    {/* Add experiment to existing one */}
                    {showUploadExisting?
                        <MyExpSelectExpBox>
                            <div className='container mt-4 text-center'>
                                <Typography sx={{color:'white', 
                                    fontWeight: 'regular', 
                                    fontSize: 30, 
                                    textAlign: 'center', 
                                    marginBottom:3}}>Upload to existing experiment
                                </Typography>
                                <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <List
                                sx={{
                                    width: '100%',
                                    maxWidth: 500,
                                    bgcolor: 'background.paper',
                                    position: 'relative',
                                    overflow: 'auto',
                                    maxHeight: 200,
                                    '& ul': { padding: 0 },
                                    marginBottom: 2,
                                    opacity: '90%',
                                }}
                                subheader={<li />}
                                >
                                    <ListSubheader>Select the experiment to which you want to add a group</ListSubheader>
                                    <Divider/>
                                    {Object.keys(big_experiments).map((item, i)=>(
                                        <ListItem key={i}>
                                            <FormControl>
                                            <RadioGroup
                                                aria-labelledby="demo-radio-buttons-group-label"
                                                defaultValue="female"
                                                name="radio-buttons-group"
                                                value={expID}
                                                onChange={()=>{handleExpRadioButton(big_experiments[item])}}
                                            >
                                                <FormControlLabel value={big_experiments[item]._id} control={<Radio />} label={big_experiments[item].exp_name} />
                                            </RadioGroup>
                                            </FormControl>
                                        </ListItem>
                                    ))}
                                </List>
                                </Box>
                                
                                <Fragment>
                                    {message ? <Message msg={message} /> : null}

                                    <form method="post" onSubmit={onSubmitExisting}>

                                        <div className="mb-3">
                                            <input className="form-control" type="file" id="formFileMultiple" multiple onChange={onInputChange}/>
                                        </div>

                                        {/* submit button */}
                                        <UploadButton type="Submit" className="btn btn-primary btn-lg btn-block">Upload</UploadButton>

                                    </form>
                                </Fragment>


                                <SubmitButton type="button" className="btn btn-primary btn-lg btn-block" onClick={()=>{nextPageGroupRes()}}>Back to homepage</SubmitButton>

                            </div>

                            {/* Back to upload menu button */}
                            {showUpdateMenu?
                                <div className='container mt-4 text-center'>
                                    <Button variant="contained" onClick={() => {handleUploadMenu()}}>Back to upload menu</Button>
                                </div>
                            :null}
                        </MyExpSelectExpBox>
                    :null}

                    {/* The menu of the upload page */}
                    {showButtons?
                        <UploadBox>
                            <div className='container mt-4 text-center position-absolute top-50 start-50 translate-middle'>
                                <Typography sx={{color:'white', 
                                    fontWeight: 'regular', 
                                    fontSize: 40, 
                                    textAlign: 'center', 
                                    marginBottom:3}}>which file/s do you want to upload?
                                </Typography>
                                <UploadQuestionDiv className='container mt-4 text-center'>
                                    <Button variant="contained" sx={{marginRight: 3, marginBottom:3}} onClick={() => {setShowUploadNew(true); setShowButtons(false); setShowUpdateMenu(true)}}>Upload new experiment</Button>
                                    <Button variant="contained" sx={{marginBottom:3}} onClick={() => {setShowUploadExisting(true); setShowButtons(false); setShowUpdateMenu(true)}}>Add to existing experiment</Button>
                                </UploadQuestionDiv>
                            </div>
                        </UploadBox>
                    :null}

            <Outlet />
        </HomePageDiv>

    )
}

export default UploadPage;