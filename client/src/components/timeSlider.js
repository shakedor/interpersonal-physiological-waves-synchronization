import React, {useState} from 'react';
import {Outlet} from 'react-router-dom';
import {Typography, Grid, Button, styled, Slider, IconButton, Popover} from '@mui/material';
import { makeStyles } from '@mui/styles';
import Tooltip from '@mui/material/Tooltip';
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded';
import PauseRounded from '@mui/icons-material/PauseRounded';
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined';
import ArrowCircleLeftOutlinedIcon from '@mui/icons-material/ArrowCircleLeftOutlined';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { TextField } from '@mui/material';
import axios from 'axios';

const useStyles = makeStyles({
    controlsWrapper: {
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
    },
});

const Widget = styled('div')(({ theme }) => ({
    padding: 16,
    borderRadius: 16,
    width: 343,
    maxWidth: '100%',
    margin: 'auto',
    position: 'relative',
    zIndex: 1,
}));


function TimeSlider(props) {
    const classes = useStyles();
    //** put the time of the session instead **/
    const [duration, setDuration] = useState(props.part_length);
    const [anchorEl, setAnchorEl] = useState(null);
    const [anchorElFav, setAnchorElFav] = useState(null);
    const [paused, setPaused] = useState(false);
    const [position, setPosition] = useState(props.timestep);
    const [PlaybackRate, setRate] = useState(1);
    const [favDescription, setfavDescription] = useState('');

    // Whenever the time step in the clock changes, so is the position in the time slider
    React.useEffect(() => {
        setPosition(props.timestep)
    }, [props.timestep]);

    React.useEffect(() => {
        setPosition(props.timestep)
        setDuration(props.part_length)
    }, [props.part_length]);



    // calculates the durration of the current part in the expirement
    function formatDuration(value) {
        var Fs = 1/2
        value = Math.floor(value * Fs)
        const minute = Math.floor(value / 60);
        const secondLeft = value - minute * 60;
        return `${minute}:${secondLeft <= 9 ? `0${secondLeft}` : secondLeft}`;
    }

    // set the speed 
    const handlePlaybackRate = (rate) => {
        setRate(rate);
        props.speed_handler(rate)

    };

    const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

  
    const handleClose = () => {
      setAnchorEl(null);
    };

    // handle function for stopping the time when opening the bookmark window
    const handleClickFav = (event) => {
        if(!paused){
            setPaused(true);
            props.pause_handler(paused);
        }
        setAnchorElFav(event.currentTarget);
    };

    // handle function for closing the bookmark window
    const handleCloseFav = () => {
        setPaused(false);
        props.pause_handler(paused)
        setAnchorElFav(null);
    };

    // handle function for adding a bookmark
    const handleAddToFav = async(event) => {
        const description = favDescription;
        const data = {
            user_id: props.userId ,
            exp_id: props.bigexpId,
            group_id: props.groupId,
            part: props.part ,
            time_stamp: props.timestep,
            description: description,
            color: 'yellow'
        };
        try{
            const res = await axios.post("http://localhost:5000/bookmarks/",data);
            setfavDescription('');
            alert(res.data.message);
        }
        catch(error){
            alert(error);
        }
        handleCloseFav();
    };

  
    const open = Boolean(anchorEl);
    const id = open ? 'playbackrate-popover' : undefined;

    const openFav = Boolean(anchorElFav);
    const idFav = openFav ? 'descriptionfav-popover' : undefined;


    // slider component 
    const PrettoSlider = styled(Slider)({
        color: '#52af77',
        height: 10,
        '& .MuiSlider-track': {
          border: 'none',
        },
        '& .MuiSlider-thumb': {
          height: 24,
          width: 24,
          backgroundColor: '#fff',
          border: '2px solid currentColor',
          '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
            boxShadow: 'inherit',
          },
          '&:before': {
            display: 'none',
          },
        },
        '& .MuiSlider-valueLabel': {
          lineHeight: 1.2,
          fontSize: 12,
          background: 'unset',
          padding: 0,
          width: 32,
          height: 32,
          borderRadius: '50% 50% 50% 0',
          backgroundColor: '#52af77',
          transformOrigin: 'bottom left',
          transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
          '&:before': { display: 'none' },
          '&.MuiSlider-valueLabelOpen': {
            transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
          },
          '& > *': {
            transform: 'rotate(45deg)',
          },
        },
    });

    const bottomIcons = {
        color: '#999',
        padding: '0 0 0 0',
        "&:hover": {
            color: "#fff",
        },
    }


    return (
        <div className={classes.controlsWrapper}>
            <Grid container justifyContent="space-between" direction="row" alignItems="center" style={{paddingLeft: 30, paddingRight:30}}>
                <PrettoSlider
                size="small"
                value={position}
                min={0}
                step={1}
                max={duration}
                onChange={(_, value) => {
                    props.timestep_handler(value)
                    setPosition(value)
                }}
                />

                <Grid container alignItems='center' direction='row' justifyContent="space-between">
                    <Grid item >

                        {/* play icon */}
                        <IconButton sx={bottomIcons}
                            aria-label={paused ? 'play' : 'pause'}
                            onClick={() => {
                                setPaused(!paused)
                                props.pause_handler(paused)
                            }}
                        >
                            {paused ? (
                            <PlayArrowRounded
                                sx={{ fontSize: '3rem' }}
                            />
                            ) : (
                            <PauseRounded sx={{ fontSize: '3rem' }} />
                            )}
                        </IconButton>

                        
                        {/* time remaining */}
                        <Button variant='text' style={{color:'#fff', marginLeft:16}}>
                            <Typography>{formatDuration(position)}/{formatDuration(duration)}</Typography>
                        </Button>

                        {/* move parts */}
                        <Tooltip title="previous part" onClick={()=>{props.part_handler(-1)}}>
                                <IconButton>
                                    <ArrowCircleLeftOutlinedIcon sx={{fontSize: 40, color:'#999'}}></ArrowCircleLeftOutlinedIcon>
                                </IconButton>
                        </Tooltip>

                        <Tooltip title="next part" onClick={()=>{props.part_handler(1)}}>
                                <IconButton>
                                    <ArrowCircleRightOutlinedIcon sx={{fontSize: 40, color:'#999', }}></ArrowCircleRightOutlinedIcon>
                                </IconButton>
                        </Tooltip>

                    </Grid>

                    <Grid>
                        {/* add bookmarks */}
                        <Tooltip title="add to favorites">
                            <IconButton onClick={handleClickFav}>
                                <StarBorderIcon sx={{fontSize: 30, color:'#999'}}></StarBorderIcon>
                            </IconButton>
                        </Tooltip>
                            <Popover
                            id={idFav}
                            open={openFav}
                            trigger='focus'
                            anchorEl={anchorElFav}
                            onClose={handleCloseFav}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                            }}
                            >
                                <Grid container direction="column-reverse">
                                    <TextField value={favDescription} onChange={(event)=>setfavDescription(event.target.value)} id="standard-basic" label="enter description" />
                                    <Button onClick={()=> handleAddToFav()} variant="text">
                                        <Typography color='black' >add</Typography>
                                    </Button>
                                </Grid>
                            </Popover>
                        

                        {/* speed */}
                        <Button onClick={handleClick} vairant='text' sx={bottomIcons}>
                            <Typography>{PlaybackRate}X</Typography>
                        </Button>
                        <Popover
                            id={id}
                            open={open}
                            anchorEl={anchorEl}
                            onClose={handleClose}
                            anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                            }}
                        >
                            <Grid container direction="column-reverse">
                                {[0.5, 1, 1.5, 2].map((rate) => (
                                <Button onClick={()=> handlePlaybackRate(rate)} variant="text">
                                    <Typography color='black' >{rate}</Typography>
                                </Button>))}
                            </Grid>
                        </Popover>
                    </Grid>

                </Grid>

                <Grid container>

                </Grid>
            </Grid>
            <Outlet />
        </div>  
    );
}

export default TimeSlider;