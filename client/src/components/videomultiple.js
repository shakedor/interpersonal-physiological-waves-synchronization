
import React from "react";
import { Player, ControlBar, Shortcut } from 'video-react';
import 'video-react/dist/video-react.css';
import { Grid } from "@mui/material";


const findPart = (file_name, group_info) => {
  var spltName = file_name.split('.')[0].split('_')
  var part = ""
  spltName.forEach(a => {
    group_info.forEach(p => {
      if(p.part_name === a){
        part = a;
      }
    })
  })
  return part
}

/**
 * This component is responsible for loading all the videos of the experiment.
 * It gets all the videos paths, for each one it finds the part its related to by checkoing if the name contains the name of the part.
 * It saves an object that maps between a part and its associated videos.
 * At each part all the associated videos are loaded into the screen and then the user can controll the speed of the video,
 * the time point and can pause/play it.
 */
function Video(props) {
  const players = {}
  const [source, setSource] = React.useState(null);
  const [allSources, setAllSources] = React.useState([]);


  const uploadedVideoFiles = props.uploadedVideoFiles;
  const uploadedFilesZip = props.uploadedFilesZip;

  React.useEffect(() => {
    var sourcesList = {}
    // if the user uploaded zip file
    if(uploadedFilesZip.length > 0){
      let folder_name = uploadedVideoFiles[0].split('.')
      // remove the extention
      folder_name.pop()
      // the zip name is in uploadedVideoFiles and the files names are in uploadedFilesZip
      uploadedFilesZip[0].forEach((file_name)=>{
        var extention = file_name.split('.').pop()
        if(extention === "mp4"){
          var part = findPart(file_name, props.group_info)
          if(part.length > 0){
            var video_path = [ folder_name, file_name].join("/")
            // need to map between part name and source
            var x = sourcesList[part] === undefined ? sourcesList[part] = [] : null
            sourcesList[part].push(video_path)
          }
        }
      });
    }else{
      // the files names are in uploadedVideoFiles
      if(uploadedVideoFiles.length > 0){
        var paths = uploadedVideoFiles
        if(typeof paths[0] === "object"){
          paths = uploadedVideoFiles[0]
        }
        paths.forEach((file_name)=>{
          var extention = file_name.split('.').pop()
          if(extention === "mp4"){
            var part = findPart(file_name, props.group_info)
            if(part.length > 0){
              // need to map between part name and source
              var x = sourcesList[part] === undefined ? sourcesList[part] = [] : null
              sourcesList[part].push(file_name)
            }
          }
        });
      }

    }
    setAllSources(sourcesList);
    // move across the parts in the group info and check if the have source or not
      const videoparts = {}
      props.group_info.map(part => sourcesList[part.part_name] === undefined ? videoparts[part.part_name]=0 : videoparts[part.part_name] = sourcesList[part.part_name].length)
      props.updateVideoFilesDict(videoparts)
      
    // set the source to be the current part
    if(Object.keys(sourcesList).length > 0){
      if(sourcesList[props.part] !== undefined){
        try{
          const src = []
        
          sourcesList[props.part].map(vidFile => src.push(require('../videos/'+ vidFile)))
          setSource(src)
        }
        catch(error){
        //   if(
        //     error.response &&
        //     error.response.status >= 400 &&
        //     error.response.status <= 500
        // ){
        //   alert(error.response.data.message);
        // }
        }
      }
    }
  }, []);

  React.useEffect(() => {
    // empty the players array
    var playersKeys = Object.keys(players)
    if(playersKeys.length > 0){
        playersKeys.map( player => delete players[player])
    }
    if(allSources){
      if(Object.keys(allSources).length > 0){
        // set the source to be the current part
        if(allSources[props.part] !== undefined){
          try{
              const src = []
              allSources[props.part].map(vidFile => src.push(require('../videos/'+ vidFile)))
              setSource(src)
          }
          catch(error){
            // if(
            //   error.response &&
            //   error.response.status >= 400 &&
            //   error.response.status <= 500
            // ){
            //   alert(error.response.data.message);
            // }
            setSource(null)

          }
        }
        else{
          // if there is no matching video, set the source to be null
          setSource(null)
        }
      }
    }

  }, [props.part]);

  React.useEffect(() => {
      props.pause ? play() : pause()
  }, [props.pause]);


  React.useEffect(() => {
      changePlaybackRateRate(props.speed)

  }, [props.speed]);


  React.useEffect(() => {
    var Fs = 1/2
    var value = Math.floor(props.seek * Fs)
    seek(value)
  }, [props.seek]);

  const play = ()=> {
    if(Object.keys(players).length > 0){
        Object.keys(players).map(player => players[player].play())
    }
  };

  const pause = ()=> {
    if(Object.keys(players).length > 0){
        Object.keys(players).map(player => players[player].pause())
    }
  };


  const seek = (seconds)=> {
    if(Object.keys(players).length > 0){
        Object.keys(players).map(player => players[player].seek(seconds))
    }
  };

  const changePlaybackRateRate = (rate)=> {
    if(Object.keys(players).length > 0){
        Object.keys(players).map(player => players[player].playbackRate = rate)
    }

  };


    return (
    <div key={source}>
      <Grid container direction="row" justifyContent="space-around" alignItems="flex-start">
      {source? 
    source.map((src,idx) =>{
        return(
          <Grid item width={"30%"} height={"20%"}>
            <Player 
            className="player" key ={idx}
            ref={player => {
                players[idx] = player;
            }}
              autoPlay={true}
              paused={false}
              muted={true}
            >
              <source src={source[idx]} />
              <ControlBar disableCompletely={true} />
              <Shortcut clickable={false} />
                </Player>
            </Grid>
        )
    })
        : null}
          </Grid>
      </div>
    );
  
}

export default Video;
