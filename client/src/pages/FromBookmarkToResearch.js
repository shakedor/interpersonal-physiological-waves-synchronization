import React, {Fragment, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomePageDiv, SelectExpBox } from '../components/div.style';
import Logout from '../components/logout';
import axios from 'axios';
import FormControl from '@mui/material/FormControl';
import { SubmitButton } from '../components/button.style';
import Message from '../components/message.style';
import { Button } from '@mui/material';
import { Typography } from '@mui/material';

function FromBookmarkToResearch() {
    const navigate = useNavigate();
    const location = useLocation();
    // message for uploading the videos
    const [vidMessage, setVidMessage] = useState('');
    // initiallize the uploading files
    const [files, setFiles] = useState([]);
    // saving details on the uploading files
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [uploadedFilesTemp, setUploadedFilesTemp] = useState([]);
    const [uploadedFilesPath, setUploadedFilesPath] = useState([]);
    const [helperState, setHelperState] = useState([]);

    // save the current bookmark
    let currBookmark = location.state[0];

    // catch the uploded files
    const onInputChange = (e) => {
        setFiles(e.target.files);
    };

    // helper function to save the files and paths of the uploaded files
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

    // go to the research page
    function nextPage(){
        // save all parameter needed to the research page
        let allBookmarkData = currBookmark;
        allBookmarkData.uploadedVideoFiles = uploadedFiles;
        allBookmarkData.uploadedFilesZip = uploadedFilesTemp;
        allBookmarkData.isBookmark = true;
        navigate('/research',{replace: true, state:[allBookmarkData]});
    }

    return (
        <HomePageDiv>
            <Logout/>
            <SelectExpBox>
                <Typography sx={{color:'white', 
                            fontWeight: 'regular', 
                            fontSize: 30, 
                            textAlign: 'center', 
                            marginBottom:3}}>upload videos
                </Typography>
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
                    {/* continue button */}
                    <Button sx={{marginTop: 3}} variant="contained" onClick={() => {nextPage()}}>Let's Go!</Button>
                </FormControl>
            </SelectExpBox>
        </HomePageDiv>
    )
}

export default FromBookmarkToResearch;