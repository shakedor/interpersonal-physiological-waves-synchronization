import React, {useEffect, useState} from 'react';
import { styled, alpha } from '@mui/material/styles';
import { HomePageDiv, SelectExpBox} from '../components/div.style';
import Logout from '../components/logout';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import { AccordionActions } from '@mui/material';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { Divider } from '@mui/material';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import {useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';

// style for the menu of showing MdRQA
const StyledMenu = styled((props) => (
    <Menu
      elevation={0}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}
    />
  ))(({ theme }) => ({
    '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color:
        theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
      boxShadow:
        'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
        padding: '4px 0',
      },
      '& .MuiMenuItem-root': {
        '& .MuiSvgIcon-root': {
          fontSize: 18,
          color: theme.palette.text.secondary,
          marginRight: theme.spacing(1.5),
        },
        '&:active': {
          backgroundColor: alpha(
            theme.palette.primary.main,
            theme.palette.action.selectedOpacity,
          ),
        },
      },
    },
}));

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

// headline of the current accordion
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

// the body of the accordion
const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
    padding: theme.spacing(2),
    borderTop: '1px solid rgba(0, 0, 0, .125)',
}));

// possible shifts and their matching times (for the shifts menu)
const shiftsOptions = [
    '0 seconds = 0 shifts',
    '1 second = 2 shifts',
    '2 seconds = 4 shifts',
    '3 seconds = 6 shifts',
    '4 seconds = 8 shifts',
    '5 seconds = 10 shifts',
    '6 seconds = 12 shifts',
    '7 seconds = 14 shifts',
    '8 seconds = 16 shifts',
    '9 seconds = 18 shifts',
    '10 seconds = 20 shifts',
];

/**
 * The settings components allows the user to modify the settings of each experiment he uploaded to
 * the application. The user can change the experiment name, add a description for the experiment,
 * change the parameters for the CCF algorithm and for the MdRQA algorithm.
 */
function Settings() {
    let navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = React.useState('panel1');
    const [userID, setUserId] = useState('');
    const [bigExp, setBigExp] = useState('');

    // general settings:
    const [expName, setExpName] = useState("");
    const [description, setDescription] = useState("");

    // CCF Settings:
    // save the window size the user chose
    const[windowSize, setWindowSize] = useState(10 * 2);
    // how much shifts you want to set the data to
    const [numOfShifts, setNumOfShifts] = useState(6);
    // how to calculate the sync? max or mean
    const [syncCalc, setSyncCalc] = useState('maximum');
    // for the number of shifts
    const [anchorElShifts, setAnchorElShifts] = useState(null);
    const openShifts = Boolean(anchorElShifts);
    // for the way to calculate the sync
    const [anchorElCalc, setAnchorElCalc] = useState(null);
    const openCalc = Boolean(anchorElCalc);

    // MdRQA Settings:
    const [radius, setRadius] = useState('');
    const [minSeq, setMinSeq] = useState('');
    const [embedding, setEmbedding] = useState('');
    const [delay, setDelay] = useState('');
    const [zscore, setZscore] = useState('no');
    const [anchorElNorm, setAnchorElNorm] = useState(null);
    const openNorm = Boolean(anchorElNorm);

    // when loading the settings page - save the current parameters of the experiment
    useEffect(() => {

        // the function takes the current parameters of the experiment
        async function getCurrentParameters(){
          try{
            // set the userId and bigExpId
            const userId = JSON.parse(localStorage.getItem("user_details"))._id;
            setUserId(userId);
            const bigExpId = location.state[0];
            setBigExp(bigExpId);
            // make all the requests from this page with the relevant header
            const token = localStorage.getItem("token");
            axios.defaults.headers.common['authorization'] = 'Bearer '+ token;
            // get the bigexp from db using the server request
            const res = await axios.get("http://localhost:5000/bigexp/"+ userId + "/"+bigExpId +"/getexp/"); 
            const bigexp = res.data.data;
            // set all the settings to be the current parameters.
            setExpName(bigexp.exp_name);
            setDescription(bigexp.description);
            // set CCF parameters
            const cur_ccf_params = bigexp.ccf_params;
            setWindowSize(cur_ccf_params.window_size);
            setNumOfShifts(cur_ccf_params.shift);
            if(cur_ccf_params.max == 1){
                setSyncCalc('maximum');
            }
            else {
                setSyncCalc('mean');
            }
            // set MdRQA parameters
            const curr_mdrqa_params = bigexp.mdrqa_params;
            setRadius(curr_mdrqa_params.threshold);
            setMinSeq(curr_mdrqa_params.min_seq);
            setEmbedding(curr_mdrqa_params.embedding);
            setDelay(curr_mdrqa_params.delay);
            if(curr_mdrqa_params.zscore == 1){
                setZscore('yes');
            }
            else {
                setZscore('no');
            }

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
        getCurrentParameters();
    }, []);

    
    // CCF functions:

    // accordion changing pages
    const handleChange = (panel) => (event, newExpanded) => {
        setExpanded(newExpanded ? panel : false);
    };

    // handle functions for the the way to calc the sync
    const handleClickCalc = (event) => {
        setAnchorElCalc(event.currentTarget);
    };

    // close the dropdown of the calc menu
    const handleCloseCalc = () => {
        setAnchorElCalc(null);
    };

    // close the menu of the way to sync the calc when chosing the mean value
    const handleCloseMean = () => {
        setSyncCalc('mean');
        setAnchorElCalc(null);
    };

    // close the menu of the way to sync the calc when chosing the maximum value
    const handleCloseMax = () => {
        setSyncCalc('maximum');
        setAnchorElCalc(null);
    };

    // handle function for the number of shifts
    const handleClickShifts = (event) => {
        setAnchorElShifts(event.currentTarget);
    };

    // handle function for closing the shifts menu
    const handleCloseShifts = () => {
        setAnchorElShifts(null);
    };

    // handle function to close the menu after selecting a shift value
    const handleCloseShiftsNum = (num) => {
        setNumOfShifts(num * 2);
        setAnchorElShifts(null);
    };

    // MdRQA functions:

    // set the chosen redius value
    const handleClickRadius = (event) => {
        setRadius(event.target.value);
    };

    // set the chosen min sequence value
    const handleClickMinSeq = (event) => {
        setMinSeq(event.target.value);
    };

    // set the chosen embedded value
    const handleClickEmbed = (event) => {
        setEmbedding(event.target.value);
    };

    // set the chosen delay value
    const handleClickDelay = (event) => {
        setDelay(event.target.value);
    };

    // if the user chose not to mormalize the data for the MdRQA algorithm
    const handleCloseNoNorm = () => {
        setZscore('no');
        setAnchorElNorm(null);
    };

    // if the user chose to mormalize the data for the MdRQA algorithm
    const handleCloseYesNorm = () => {
        setZscore('yes');
        setAnchorElNorm(null);
    };

    // handle functions for opening the menu of normaliztion
    const handleClickNorm = (event) => {
        setAnchorElNorm(event.currentTarget);
    };

    // close the dropdown of the normaliztion menu
    const handleCloseNorm = () => {
        setAnchorElNorm(null);
    };

    // The function saves the changes for the CCF parameters of the experiment to the DB
    const saveChangesCCF = async() => {
        // save the new parameters
        var maximum;
        if( syncCalc == 'maximum'){
            maximum = 1;
        }
        if(syncCalc == 'mean'){
            maximum = 0;
        }
        const new_ccf_params = {
            window_size: windowSize,
            shift: numOfShifts,
            max: maximum
        };
        const body = {new_ccf_params: new_ccf_params};
        // send the new parameters to the DB
        try{
            const res = await axios.patch("http://localhost:5000/bigexp/changeCCFparams/" + userID + "/" + bigExp, body);
            const msg = res.data.message;
            alert(msg);
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

    };

    // The function saves the changes for the MdRQA parameters of the experiment to the DB
    const saveChangesMDRQA = async() => {
        // save the new parameters
        var Zscore = 0;
        if(zscore == 'yes'){
            Zscore = 1;
        }
        const new_mdrqa_params = {
            threshold: radius,
            min_seq: minSeq,
            embedding: embedding,
            zscore: Zscore,
            delay: delay
        }
        const body = {new_mdrqa_params: new_mdrqa_params};
        // send the new parameters to the DB
        try{
            const res = await axios.patch("http://localhost:5000/bigexp/changeMDRQAparams/" + userID + "/" + bigExp, body);
            const msg = res.data.message;
            alert(msg);
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

    };

    // The function saves the changes for the experiment name or description to the DB
    const saveChangesNameDes = async()=>{
        // save the new parameters
        const new_name_desc = {
            name: expName,
            description: description
        }
        const body = {new_name_desc: new_name_desc};
        // send the new parameters to the DB
        try{
            const res = await axios.patch("http://localhost:5000/bigexp/changeName/" + userID + "/" + bigExp, body);
            const msg = res.data.message;
            alert(msg);
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

    }

    return (
    <HomePageDiv>
        <Logout/>
            <SelectExpBox>
                {/* settings headline */}
                <Typography sx={{color:'white', fontWeight: 'regular', fontSize: 40, textAlign: 'center', marginBottom:3}}>Settings</Typography>

                <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    {/* general headline */}
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                            <Typography>General settings</Typography>
                    </AccordionSummary>

                    <AccordionDetails>

                        {/* change name and description */}
                        <Grid container spacing={2} justify="center" alignItems="center" sx={{mb:2}}>
                            <Grid item xs={12}>
                                <TextField id="outlined-basic" 
                                    label={expName} 
                                    variant="outlined" 
                                    onChange={(event)=>{setExpName(event.target.value)}} 
                                    helperText="change the expirement name" 
                                    focused fullWidth  />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField id="outlined-basic" 
                                    label={description} 
                                    variant="outlined" 
                                    onChange={(event)=>{setDescription(event.target.value)}} 
                                    helperText="Add description to the expirement" 
                                    focused fullWidth />
                            </Grid>
                        </Grid>

                        <Divider/>
                        <AccordionActions>
                            <Button size="small" onClick={saveChangesNameDes}>save changes</Button>
                        </AccordionActions>
                    </AccordionDetails>
                </Accordion>

                <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    {/* CCF headling */}
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                        <Typography>CCF Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>

                        <Grid container spacing={2} justify="center" alignItems="center">
                            {/* shifts */}
                            <Grid item xs={6}>
                                <Typography>How much shifts do you want to use?</Typography>
                                <Typography>{"(2 seconds = 4 shifts)"}</Typography>
                                <div>
                                    <Button
                                    id="demo-customized-button"
                                    aria-controls={openShifts ? 'demo-customized-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openShifts ? 'true' : undefined}
                                    variant="contained"
                                    disableElevation
                                    onClick={handleClickShifts}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    >
                                        {numOfShifts + ' shifts'}
                                    </Button>
                                    <StyledMenu
                                        id="demo-customized-menu"
                                        MenuListProps={{
                                        'aria-labelledby': 'demo-customized-button',
                                        }}
                                        anchorEl={anchorElShifts}
                                        open={openShifts}
                                        onClose={handleCloseShifts}
                                    >
                                        {shiftsOptions.map((option, index) => (
                                            <MenuItem key={option} onClick={() => {handleCloseShiftsNum(index)}} disableRipple>{option}</MenuItem >
                                        ))}
                                    </StyledMenu>
                                </div>
                            </Grid>

                            {/* calculate synchronization */}
                            <Grid item xs={6}>
                                <Typography>How do you want to calculate the synchronization?</Typography>
                                <div>
                                    <Button
                                        id="demo-customized-button"
                                        aria-controls={openCalc ? 'demo-customized-menu' : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={openCalc ? 'true' : undefined}
                                        variant="contained"
                                        disableElevation
                                        onClick={handleClickCalc}
                                        endIcon={<KeyboardArrowDownIcon />}
                                    >
                                        {syncCalc}
                                    </Button>
                                    <StyledMenu
                                        id="demo-customized-menu"
                                        MenuListProps={{
                                        'aria-labelledby': 'demo-customized-button',
                                        }}
                                        anchorEl={anchorElCalc}
                                        open={openCalc}
                                        onClose={handleCloseCalc}
                                    >
                                        <MenuItem onClick={handleCloseMax} disableRipple>by maximum</MenuItem>
                                        <MenuItem onClick={handleCloseMean} disableRipple>by mean</MenuItem>
                                    </StyledMenu>
                                </div>
                            </Grid>

                            {/* window size */}
                            <Grid item xs={3}></Grid>
                            <Grid item xs={6}>
                                <Typography>Choose window size in seconds</Typography>
                                <Typography>{"(10 secs = 20 time-steps)"}</Typography>
                                <Slider min={5} max={100} step={5} marks value={windowSize} valueLabelDisplay="auto" onChange={(event, value) => {setWindowSize(value)}}/>
                            </Grid>
                        </Grid>
                        <Divider/>
                        <AccordionActions>
                            <Button size="small" onClick={saveChangesCCF}>Save changes</Button>
                        </AccordionActions>
                    </AccordionDetails>
                </Accordion>

                <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
                    {/* MdRQA headline */}
                    <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                            <Typography>MdRQA Settings</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2} justify="center" alignItems="center" sx={{mb:2}}>
                            {/* radius */}
                            <Grid item xs={6}>
                                <TextField value={radius} id="outlined-basic" label="Radius" variant="outlined" onChange={handleClickRadius}/>
                            </Grid>
                            {/* minimum sequense */}
                            <Grid item xs={6}>
                                <TextField value={minSeq} id="outlined-basic" label="Min sequence" variant="outlined" onChange={handleClickMinSeq}/>
                            </Grid>
                            {/* embedding value */}
                            <Grid item xs={6}>
                                <TextField value={embedding} id="outlined-basic" label="Embedding" variant="outlined" onChange={handleClickEmbed}/>
                            </Grid>
                            {/* delay value */}
                            <Grid item xs={6}>
                                <TextField value={delay} id="outlined-basic" label="Delay" variant="outlined" onChange={handleClickDelay}/>
                            </Grid>

                            {/* normalize data */}
                            <Grid item xs={3}></Grid>
                            <Grid item xs={6}>
                                <Typography>Would you like to normalize the data?</Typography>
                                <div>
                                    <Button
                                    id="demo-customized-button"
                                    aria-controls={openNorm ? 'demo-customized-menu' : undefined}
                                    aria-haspopup="true"
                                    aria-expanded={openNorm ? 'true' : undefined}
                                    variant="contained"
                                    disableElevation
                                    onClick={handleClickNorm}
                                    endIcon={<KeyboardArrowDownIcon />}
                                    >
                                        {zscore}
                                    </Button>
                                    <StyledMenu
                                        id="demo-customized-menu"
                                        MenuListProps={{
                                        'aria-labelledby': 'demo-customized-button',
                                        }}
                                        anchorEl={anchorElNorm}
                                        open={openNorm}
                                        onClose={handleCloseNorm}
                                    >
                                        <MenuItem onClick={handleCloseNoNorm} disableRipple>No</MenuItem>
                                        <MenuItem onClick={handleCloseYesNorm} disableRipple>Yes</MenuItem>
                                    </StyledMenu>
                                </div>
                            </Grid>
                        </Grid>
                        <Divider/>
                        <AccordionActions>
                            <Button size="small" onClick={saveChangesMDRQA}>Save changes</Button>
                        </AccordionActions>
                    </AccordionDetails>
                </Accordion>

                <Button sx={{marginTop: 3}} variant="contained" onClick={() => navigate("/homepage")}>Back to homepage</Button>

                
            </SelectExpBox>

    </HomePageDiv>
    )
}

export default Settings;