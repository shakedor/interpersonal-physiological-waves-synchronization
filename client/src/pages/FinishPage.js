import React, {useState} from 'react';
import { HomePageDiv, SelectExpBox } from '../components/div.style';
import {useNavigate, useLocation} from 'react-router-dom';
import { Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { ExportMatrix, makeImg, downloadCSV } from '../components/ExportFile';
import ExportFile from '../components/ExportFile';


function FinishPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // save the info of the user 
    const userInfo = location.state[0];

    const [helperState, setHelperState] = useState('');

    return (
    <HomePageDiv>
        <SelectExpBox>
            <Typography sx={{color:'white', 
                        fontWeight: 'regular', 
                        fontSize: 50, 
                        textAlign: 'center', 
                        marginBottom:5}}>Research Finished!
            </Typography>

            <Typography sx={{color:'white', 
                        fontWeight: 'regular', 
                        fontSize: 30, 
                        textAlign: 'center', 
                        marginBottom:5}}>Do you want to export the expirement?
            </Typography>
            <Button sx={{marginRight: 5}} 
                    variant="contained"
                    onClick={async() => {
                        // export CCF
                        let csvFile = await ExportFile(setHelperState, userInfo.userId, userInfo.expId, userInfo.groupId, 'trial', 'CCF');
                        downloadCSV(csvFile, "CCF_" + userInfo.expName + "_" + userInfo.groupName);

                        // export MDRQA
                        let csvFileMDRQA = await ExportFile(setHelperState, userInfo.userId, userInfo.expId, userInfo.groupId, 'trial', 'MdRQA');
                        // get the MdRQA matrix
                        let matricesData =  await ExportMatrix(userInfo.userId, userInfo.groupId);
                        matricesData.forEach(async matrix =>{
                                // download the MdRQA matrix for each part and each measure
                                await makeImg(matrix.matrix, matrix.name) 
                        })
                        downloadCSV(csvFileMDRQA, "MDRQA_" + userInfo.expName + "_" + userInfo.groupName);
                    }}>Export expirement data</Button>

            <Button variant="contained" onClick={() => navigate('/homePage')}>Back to homePage</Button>

        </SelectExpBox>
    </HomePageDiv>
    )
}

export default FinishPage;