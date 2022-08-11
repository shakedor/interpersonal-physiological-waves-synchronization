import React, {useEffect, useState} from 'react';
import { HomePageDiv, MyExpSelectExpBox } from '../components/div.style';
import Logout from '../components/logout';
import Typography from '@mui/material/Typography';
import { Outlet, useNavigate } from 'react-router-dom';
import { List, ListItem, FormControl, Divider, AccordionActions, RadioGroup } from '@mui/material';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import axios from 'axios';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import EmailBox from '../components/EmailBox';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import ExportFile from '../components/ExportFile';
import CircularProgress from '@mui/material/CircularProgress';
import PropTypes from 'prop-types';
import { ExportMatrix, makeImg, downloadCSV } from '../components/ExportFile';

// progress circle for downloading files
function CircularProgressWithLabel(props) {
    return (
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="caption" component="div" color="text.secondary">
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
}
  
CircularProgressWithLabel.propTypes = {
/**
 * The value of the progress indicator for the determinate variant.
 * Value between 0 and 100.
 * @default 0
 */
value: PropTypes.number.isRequired,
};

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

function MyExperiments() {
    let navigate = useNavigate();

    // server requests:
    // request all the big expirements from the server
    const [big_experiments, setBigExpirements] = useState('');
    // request all the group results from the server
    const [groups_results, setGroupsResults] = useState('');
    // request all the shared big expirement from the server
    const [shared_big_experiments, setSharedBigExpirements] = useState('');
    // request all the shared group result from the server
    const [shared_groups_results, setSharedGroupsResults] = useState('');

    // radio buttons:
    // save the ID of the selected expirement
    const [expirement, setExpirement] = useState("");
    // save the ID of the selectes trial
    const [trialID, setTrialID] = useState("");
    // save the ID of the selected shared expirement
    const [shared_expirement, setSharedExpirement] = useState("");
    // save the ID for the selected shared trial
    const [shared_trial, setSharedTrial] = useState("");

    // open/close the accordion element
    const [expanded, setExpanded] = useState('panel1');
    const [shared_expanded, setSharedExpanded] = useState('panel1');

    // for the menu
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    // for the shared menu
    const [anchorElShared, setAnchorElShared] = useState(null);
    const openShared = Boolean(anchorElShared);

    // useStates for the different menus
    const [showShareExp, setShowShareExp] = useState(false);
    const [showEmailBox, setShowEmailBox] = useState(false);
    const [bigExpChosen, setBigExpChosen] = useState(false);
    const [sharedBigExpChosen, setSharedBigExpChosen] = useState(false);

    // save the ID of the expirement / group result that was clicked from the menu (not radio)
    const [currMenuClickBigExp, setCurrMenuClickBigExp] = useState('');
    const [currMenuClickGroupRes, setCurrMenuClickGroupRes] = useState('');
    const [currMenuClickSharedBigExp, setCurrMenuClickSharedBigExp] = useState('');
    const [currMenuClickShared, setCurrMenuClickShared] = useState('');


    // save the names of the big expirement that was clicked from the menu (not radio)
    const [currMenuClickBigExpName, setCurrMenuClickBigExpName] = useState('');
    const [currMenuClickSharedBigExpName, setCurrMenuClickSharedBigExpName] = useState('');

    // show progress
    const [loaded, setLoaded] = useState('');
    const [loadedCCF, setLoadedCCF] = useState('');
    const [loadedShared, setLoadedShared] = useState('');
    const [loadedCCFShared, setLoadedCCFShared] = useState('');

    const [userDetails, setUserDetails] = useState({
        _id: '',
        first_name: '',
        last_name: '',
        email: ''})

    useEffect(() => {
        async function getAllBigExp(){
            // get information about my uploaded expirements
            try{
                setUserDetails(JSON.parse(localStorage.getItem("user_details")));
                const userId = JSON.parse(localStorage.getItem("user_details"))._id;
                const token = localStorage.getItem("token");
                axios.defaults.headers.common['authorization'] = 'Bearer '+ token;
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

    // accordion changing pages - my uploads
    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    // accordion changing pages - shared expirements
    const handleChangeSharedExp = (panel) => (event, newExpanded) => {
        setSharedExpanded(newExpanded ? panel : false);
    };

    // handle function after selecting an expirement for my uploads
    const handleExpRadioButton = (expirement) => {
        getAllGroupsResults(expirement._id);
        setExpirement(expirement._id);
        setCurrMenuClickBigExpName(expirement.exp_name);
        setSharedExpirement('');
    }

    // handle function after selecting an expirement for shared ones
    const handleSharedExpRadioButton = (expirement) => {
        getAllSharedGroupsResults(expirement._id);
        setSharedExpirement(expirement._id);
        setCurrMenuClickSharedBigExpName(expirement.exp_name);
        setExpirement('');
    }

    // handle function after selecting a trial
    const handleTrialRadioButton = (trial) => {
        setTrialID(trial._id);
        setSharedTrial('');
    }

    // handle function after selecting a shared trial
    const handleSharedTrialRadioButton = (trial) => {
        setSharedTrial(trial._id);
    }

    // functions for handeling the close/open of the menu of each big expirement
    const handleClickBigExp = (exp) => (event) => {
        setCurrMenuClickBigExp(exp);
        setShowShareExp(true);
        setAnchorEl(event.currentTarget);
    };

    // functions for handeling the close/open of the menu of each group result
    const handleClickGroupRes = (exp) => (event) => {
        setCurrMenuClickGroupRes(exp);
        setShowShareExp(false);
        setAnchorEl(event.currentTarget);
    };

    // functions for handeling the close/open of the menu of each shared big expirement
    const handleClickSharedBigExp = (exp) => (event) => {
        setCurrMenuClickSharedBigExp(exp._id);
        setCurrMenuClickSharedBigExpName(exp.exp_name);
        setSharedBigExpChosen(false);
        setAnchorElShared(event.currentTarget);
    };

    // functions for handeling the close/open of the menu of each shared group result
    const handleClickShared = (exp) => (event) => {
        setCurrMenuClickShared(exp);
        setSharedBigExpChosen(true);
        setAnchorElShared(event.currentTarget);
    };

    // close the menu
    const handleClose = () => {
        setAnchorEl(null);
        EmailBox.prototype.clearEmailList();
    };

    // close the menu for shared expirements
    const handleCloseShared = () => {
        setShowShareExp(false);
        setAnchorElShared(null);
        EmailBox.prototype.clearEmailList();
    };

    // handle function for closing the menu of each expirement
    const handleCloseMenu = () => {
        setShowShareExp(false);
        setShowEmailBox(false);
        setAnchorEl(null);
        
        EmailBox.prototype.clearEmailList();
    };

    // handle function for selecting to share the expirement
    const handleShareExp = () => {
        setShowShareExp(false);
        setShowEmailBox(true);
    };

    // handle function for closing the email box (submit button)
    const handleCloseEmails = async() => {
        var emails = EmailBox.prototype.sendEmails();
        handleCloseMenu();
        setShowEmailBox(false);
        setAnchorEl(null);
        if (emails.length === 0){
            alert("no emails added.\nto add the email press enter and then submit");
            return;
        }
        try{
            const userId = userDetails._id;
            const bigexpid = currMenuClickBigExp._id;
            const data = {to_users_emails: emails}
            const res = await axios.patch('http://localhost:5000/bigexp/letAccess/'+userId+'/'+bigexpid, data);
            alert(res.data.message);    
        } catch(error){
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
                alert(error.response.data.message);
            }
        } 

        window.location.reload();
    };

    // delete a big expirement from my experiment
    const handleDeleteBigExp = async() => {
        setAnchorEl(null);
        try{
            const userId = userDetails._id;
            const bigexpid = currMenuClickBigExp._id;
            const res = await axios.delete('http://localhost:5000/bigexp/'+userId+'/'+bigexpid);
            alert(res.data.message);    
            window.location.reload();
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

    // delete a shared big experiment from my experiments
    const handleDeleteSharedBigExp = async() => {
        setAnchorElShared(null);
        try{
            const userId = userDetails._id;
            const bigexpid = currMenuClickSharedBigExp;
            const res = await axios.patch('http://localhost:5000/bigexp/removeSharedExp/'+userId+'/'+bigexpid);
            alert(res.data.message);    
            window.location.reload();
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

    // delete group result from a big experiment
    const handleDeleteGroupRes = async() => {
        setAnchorEl(null);
        try{
            const userId = userDetails._id;
            const bigexpid = expirement;
            const groupresid = currMenuClickGroupRes;
            const res = await axios.delete('http://localhost:5000/bigexp/groupres/'+userId+'/'+bigexpid+'/'+groupresid);
            alert(res.data.message);    
            window.location.reload();
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

    return (
        <HomePageDiv>
        <Logout/>

            <MyExpSelectExpBox>
                {/* headline */}
                <Typography sx={{color:'white', 
                            fontWeight: 'regular', 
                            fontSize: 30, 
                            textAlign: 'center', 
                            marginBottom:5}}>My experiments
                </Typography>
                <Box sx={{ width: '100%' }}>
                <Grid container rowSpacing={3} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                    <Grid item xs={6}>
                        <Typography sx={{color:'white', 
                                fontWeight: 'regular', 
                                fontSize: 20, 
                                textAlign: 'center', 
                                marginBottom:1}}>My uploads
                        </Typography>
                        {/* uploaded big experiments */}
                        <Accordion expanded={expanded === 'panel1'} onChange={() => {
                            handleChange('panel1');
                            setBigExpChosen(true);}}>
                            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                <Typography>Choose an experiment</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                            <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                                position: 'relative',
                                overflow: 'auto',
                                maxHeight: 300,
                                '& ul': { padding: 0 },
                                borderRadius: 5,
                            }}
                            subheader={<li />}
                            >
                                
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
                                        <IconButton 
                                        aria-label="more"
                                        id="long-button"
                                        aria-controls={open ? 'long-menu' : undefined}
                                        aria-expanded={open ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClickBigExp(big_experiments[item])}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                        {showShareExp?
                                            <Menu
                                            id="long-menu"
                                            MenuListProps={{
                                                'aria-labelledby': 'long-button',
                                            }}
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleCloseMenu}
                                            PaperProps={{
                                                style: {
                                                maxHeight: 48 * 4.5,
                                                width: '25ch',
                                                },
                                            }}>
                                                <MenuItem onClick={handleDeleteBigExp}>delete experiment</MenuItem>
                                                <MenuItem onClick={() => handleShareExp()}>share experiment</MenuItem>
                                                <MenuItem onClick={async() => {
                                                    handleCloseMenu();
                                                    let csvFile = await ExportFile(setLoadedCCF, userDetails._id, currMenuClickBigExp._id,"", 'bigExp', 'CCF');
                                                    downloadCSV(csvFile,"CCF_" + currMenuClickBigExp.exp_name);
                                                }}>export CCF
                                                </MenuItem>

                                                <MenuItem onClick={async() => {
                                                    handleCloseMenu();
                                                    // get MdRQA calculations
                                                    let csvFile = await ExportFile(setLoaded, userDetails._id, currMenuClickBigExp._id, "",'bigExp', 'MdRQA');
                                                    downloadCSV(csvFile, "MDRQA_" + currMenuClickBigExp.exp_name);
                                                }}>export MdRQA
                                                </MenuItem>
                                                <MenuItem onClick={() => { navigate("/settings",{replace: true, state:[currMenuClickBigExp._id]}) }}>settings</MenuItem>
                                            </Menu>
                                        :null}
                                        {showEmailBox?
                                            <Menu
                                            id="long-menu"
                                            MenuListProps={{
                                                'aria-labelledby': 'long-button',
                                                'justify-content': 'center',
                                                'align-items': 'center'
                                            }}
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleCloseMenu}
                                            PaperProps={{
                                                style: {
                                                maxHeight: 48 * 4.5,
                                                height: '30ch',
                                                width: '40ch',
                                                },
                                            }}>
                                                <EmailBox></EmailBox>
                                                <button type="button" className="btn btn-outline-primary" onClick={handleCloseEmails}>Submit</button>
                                            </Menu>
                                        :null}
                                    </ListItem>
                                ))}
                            </List>
                            <Divider/>
                                <AccordionActions>
                                    {loadedCCF !=='' ? <CircularProgressWithLabel value={loadedCCF} /> : null}
                                    {loaded !=='' ? <CircularProgressWithLabel value={loaded} /> : null}
                                    <Button size="small" onClick={() => {
                                        if(expirement !== ''){
                                            setBigExpChosen(true);
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

                        {/* uploaded group results */}
                        <Accordion expanded={expanded === 'panel2'} onChange={() => {
                            handleChange('panel2');
                            setBigExpChosen(false);}} >
                            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                <Typography>Choose a group</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List
                                sx={{
                                    width: '100%',
                                    maxWidth: 360,
                                    bgcolor: 'background.paper',
                                    position: 'relative',
                                    overflow: 'auto',
                                    maxHeight: 300,
                                    '& ul': { padding: 0 },
                                    borderRadius: 5,
                                }}
                                subheader={<li />}
                                >
                                    {Object.keys(groups_results).map((item, i)=>(
                                        <ListItem key={i}>
                                            <FormControl>
                                                <RadioGroup
                                                    aria-labelledby="demo-radio-buttons-group-label"
                                                    defaultValue="female"
                                                    name="radio-buttons-group"
                                                    value={trialID}
                                                    onChange={() => {handleTrialRadioButton(groups_results[item])}}
                                                >

                                                <FormControlLabel value={groups_results[item]._id} control={<Radio />} label={groups_results[item].group_name} />
                                                </RadioGroup>
                                            </FormControl>
                                        <IconButton 
                                        aria-label="more"
                                        id="long-button"
                                        aria-controls={open ? 'long-menu' : undefined}
                                        aria-expanded={open ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClickGroupRes(groups_results[item]._id)}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                        {bigExpChosen?
                                            <Menu
                                            id="long-menu"
                                            MenuListProps={{
                                                'aria-labelledby': 'long-button',
                                            }}
                                            anchorEl={anchorEl}
                                            open={open}
                                            onClose={handleClose}
                                            PaperProps={{
                                                style: {
                                                maxHeight: 48 * 4.5,
                                                width: '25ch',
                                                },
                                            }}>
                                                <MenuItem onClick={handleDeleteGroupRes}>delete group</MenuItem>
                                                <MenuItem onClick={async() => {
                                                    handleCloseMenu();
                                                    let csvFile = await ExportFile(setLoadedCCF, userDetails._id, expirement,currMenuClickGroupRes, 'trial', 'CCF');
                                                    const group_res = groups_results.find(group => group._id === currMenuClickGroupRes);
                                                    downloadCSV(csvFile, "CCF_" + currMenuClickBigExpName + "_" + group_res.group_name);
                                                }}>export CCF</MenuItem>

                                                <MenuItem onClick={async() => {
                                                    handleCloseMenu();
                                                    let csvFile = await ExportFile(setLoaded, userDetails._id,expirement, currMenuClickGroupRes, 'trial', 'MdRQA');
                                                    // get the MdRQA matrix
                                                    let matricesData =  await ExportMatrix(userDetails._id, currMenuClickGroupRes);
                                                    matricesData.forEach(async matrix =>{
                                                            // download the MdRQA matrix for each part and each measure
                                                            await makeImg(matrix.matrix, matrix.name) 
                                                    })
                                                    const group_res = groups_results.find(group => group._id === currMenuClickGroupRes);
                                                    downloadCSV(csvFile, "MDRQA_" + currMenuClickBigExpName + "_" + group_res.group_name);
                                                }}>export MdRQA</MenuItem>
                                            </Menu>
                                        :null}
                                        </ListItem>
                                    ))}
                                </List>
                                <Divider/>
                                    <AccordionActions>
                                        <Button size="small" onClick={() => {
                                            setBigExpChosen(false);
                                            setExpanded('panel1');
                                            handleChange('panel1');
                                        }
                                        }>choose another experiment</Button>
                                    </AccordionActions>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>

                    {/* shared information */}
                    <Grid item xs={6}>
                        <Typography sx={{color:'white', 
                                fontWeight: 'regular', 
                                fontSize: 20, 
                                textAlign: 'center', 
                                marginBottom:1}}>Shared experiments
                        </Typography>
                        {/* shared big experiment */}
                        <Accordion expanded={shared_expanded === 'panel1'} onChange={() => {
                            handleChangeSharedExp('panel1');}}>
                            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                <Typography>Choose an experiment</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                            <List
                            sx={{
                                width: '100%',
                                maxWidth: 360,
                                bgcolor: 'background.paper',
                                position: 'relative',
                                overflow: 'auto',
                                maxHeight: 300,
                                '& ul': { padding: 0 },
                                borderRadius: 5,
                            }}
                            subheader={<li />}
                            >

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
                                        <IconButton 
                                        aria-label="more"
                                        id="long-button"
                                        aria-controls={openShared ? 'long-menu' : undefined}
                                        aria-expanded={openShared ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClickSharedBigExp(shared_big_experiments[item])}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                        {!sharedBigExpChosen?
                                            <Menu
                                            id="long-menu"
                                            MenuListProps={{
                                                'aria-labelledby': 'long-button',
                                            }}
                                            anchorEl={anchorElShared}
                                            open={openShared}
                                            onClose={handleCloseShared}
                                            PaperProps={{
                                                style: {
                                                maxHeight: 48 * 4.5,
                                                width: '25ch',
                                                },
                                            }}>
                                                <MenuItem onClick={async() => {
                                                    handleCloseShared();
                                                    let csvFile = await ExportFile(setLoadedCCFShared, userDetails._id, currMenuClickSharedBigExp, "", 'bigExp', 'CCF');
                                                    downloadCSV(csvFile, "CCF_" + currMenuClickSharedBigExpName);
                                                }}>export CCF
                                                </MenuItem>
                                                <MenuItem onClick={async() => {
                                                    handleCloseShared();
                                                    let csvFile = await ExportFile(setLoadedShared, userDetails._id, currMenuClickSharedBigExp, "", 'bigExp', 'MdRQA');
                                                    downloadCSV(csvFile, "MDRQA_" + currMenuClickSharedBigExpName);
                                                }}>export MdRQA
                                                </MenuItem>
                                                <MenuItem onClick={handleDeleteSharedBigExp}>
                                                remove experiment
                                                </MenuItem>
                                            </Menu>
                                        :null}
                                    </ListItem>
                                ))}

                            </List>
                            <Divider/>
                                <AccordionActions>
                                    {loadedCCFShared !== '' ? <CircularProgressWithLabel value={loadedCCFShared} /> : null}
                                    {loadedShared !== '' ? <CircularProgressWithLabel value={loadedShared} /> : null}
                                    <Button size="small" onClick={() => {
                                        if(shared_expirement !== ''){
                                            setSharedBigExpChosen(true);
                                            setSharedExpanded('panel2');
                                            handleChangeSharedExp('panel2');
                                        }
                                        else{
                                            alert('No experiment selected');
                                        }
                                    }
                                        }>continue</Button>
                                </AccordionActions>
                            </AccordionDetails>
                        </Accordion>

                        {/* shared group results */}
                        <Accordion expanded={shared_expanded === 'panel2'} onChange={() => {
                            handleChangeSharedExp('panel2');}} >
                            <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                                <Typography>Choose a group</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List
                                sx={{
                                    width: '100%',
                                    maxWidth: 360,
                                    bgcolor: 'background.paper',
                                    position: 'relative',
                                    overflow: 'auto',
                                    maxHeight: 300,
                                    '& ul': { padding: 0 },
                                    borderRadius: 5,
                                }}
                                subheader={<li />}
                                >
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
                                        <IconButton 
                                        aria-label="more"
                                        id="long-button"
                                        aria-controls={openShared ? 'long-menu' : undefined}
                                        aria-expanded={openShared ? 'true' : undefined}
                                        aria-haspopup="true"
                                        onClick={handleClickShared(shared_groups_results[item]._id)}>
                                            <MoreVertIcon/>
                                        </IconButton>
                                        {sharedBigExpChosen?
                                            <Menu
                                            id="long-menu"
                                            MenuListProps={{
                                                'aria-labelledby': 'long-button',
                                            }}
                                            anchorEl={anchorElShared}
                                            open={openShared}
                                            onClose={handleCloseShared}
                                            PaperProps={{
                                                style: {
                                                maxHeight: 48 * 4.5,
                                                width: '25ch',
                                                },
                                            }}>
                                                <MenuItem onClick={async() => {
                                                    handleCloseShared();
                                                    let csvFile = await ExportFile(setLoadedCCFShared, userDetails._id,shared_expirement, currMenuClickShared, 'trial', 'CCF');
                                                    const group_res = shared_groups_results.find(group => group._id === currMenuClickShared);
                                                    downloadCSV(csvFile, "CCF_" + currMenuClickSharedBigExpName + "_" + group_res.group_name);
                                                }}>export CCF</MenuItem>
                                                <MenuItem onClick={async() => {
                                                    handleCloseShared();
                                                    let csvFile = await ExportFile(setLoadedShared, userDetails._id,shared_expirement, currMenuClickShared, 'trial', 'MdRQA');
                                                    // get the MdRQA matrix
                                                    let matricesData =  await ExportMatrix(userDetails._id, currMenuClickShared);
                                                    matricesData.forEach(async matrix =>{
                                                            // download the MdRQA matrix for each part and each measure
                                                            await makeImg(matrix.matrix, matrix.name) 
                                                    })
                                                    const group_res = shared_groups_results.find(group => group._id === currMenuClickShared);
                                                    downloadCSV(csvFile, "MDRQA_" + currMenuClickSharedBigExpName + "_" + group_res.group_name);
                                                }}>export MdRQA</MenuItem>
                                            </Menu>
                                        :null}
                                        </ListItem>
                                    ))}
                                </List>
                                <Divider/>
                                    <AccordionActions>
                                        <Button size="small" onClick={() => {
                                                setSharedBigExpChosen(false);
                                                setSharedExpanded('panel1');
                                                handleChange('panel1');
                                            }
                                        }>choose another experiment</Button>
                                    </AccordionActions>
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
                </Box>
            </MyExpSelectExpBox>
        <Outlet/>
        </HomePageDiv>
    )
}

export default MyExperiments;
