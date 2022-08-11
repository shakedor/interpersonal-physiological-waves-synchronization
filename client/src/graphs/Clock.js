import React from 'react';
import Chart from '../graphs/Chart';
import '../components/ExperimentPage.css';
import TimeSlider from '../components/timeSlider';
import Video from '../components/videomultiple';
import Logout from '../components/logout';
import { Grid } from '@mui/material';



/**
 * Clock is responsible for the page of the experiment.
 * It controls all the components in the page: all the graphs, the videos and the time slider.
 * It manage the time so every x seconds (depend on the interval) all the components will update.
 * If the user changes the timeslider it will update the clock and then the clock will update all the components.
 * It applies to stop/play, changing the time, changing the speed.
 */
class Clock extends React.Component {
    constructor(props) {
      super(props);

      this.timestep_handler = this.timestep_handler.bind(this)
      this.pause_handler = this.pause_handler.bind(this)
      this.speed_handler = this.speed_handler.bind(this)
      this.part_handler = this.part_handler.bind(this)
      this.updateVideoFilesDict = this.updateVideoFilesDict.bind(this)
      this.group = props.group
      this.group_info = props.group_info.info
      this.userId = props.userId
      this.expId = props.expId
      this.bigexpId = props.bigexpId
      this.shift = props.shift
      var part = this.group_info[props.part_num]["part_name"]
      var part_length = this.group_info[props.part_num]["part_length"]
      var personsNames = props.group_info.personsNames
      var calcs = props.calcs
      var rec_plot = props.rec_plot
      this.takeMax = props.takeMax
      this.windowSize = props.windowSize
      this.uploadedFilesZip = props.uploadedFilesZip
      this.uploadedVideoFiles = props.uploadedVideoFiles
      this.finish_exp = props.finish

      this.state = {speed: 1, timestep: parseInt(props.timeStep), pause:true, part_num: props.part_num, part_length: part_length,
         part: part,seek:parseInt(props.timeStep) ,personsNames: personsNames, clacs: calcs, rec_plot: rec_plot, countVideosAtParts: null};


    }

    timestep_handler(new_timestep) {
      this.setState({
        timestep: new_timestep,
        seek: new_timestep
      });
    }

    speed_handler(s) {
      this.setState({
        speed: s
      });

      if(this.state.pause){
        clearInterval(this.timerID);
        this.timerID = setInterval(
          () => this.tick(),
          Math.floor(1000/s)
        );
      }
    }

    pause_handler(paused){
      this.setState({
        pause: paused
      });
      if(!paused){
        clearInterval(this.timerID);
      }
      else{
        this.timerID = setInterval(
          () => this.tick(),
          Math.floor(1000/this.state.speed)
        );
      }

    }

    part_handler(direction){

      if(direction == 1){
        this.nextPart(1)
      }
      if(direction == -1){
        this.nextPart(-1)
      }

    }
  
    componentDidMount() {
      this.timerID = setInterval(
        () => this.tick(),
        Math.floor(1000/this.state.speed)
        );
    }
  
    componentWillUnmount() {
      clearInterval(this.timerID);
    }
  
    tick() {
      this.setState({
        // + 2 because each second has two samples.
        timestep: this.state.timestep + 2
      });
      if(this.state.timestep >= this.state.part_length){
        this.nextPart(1)
      }
    }

    nextPart(direction){
      // direction = 1 if next part , -1 if previous part
      var new_part = this.state.part_num +direction
      if(new_part >= this.group_info.length){
        this.setState({timestep: this.state.part_length});
        this.finish_exp();
        return null
      }
      if(new_part < 0){
        this.setState({timestep: 0});
        return null
      }
      this.setState({
        timestep: 0,
        seek:0,
        part_num: new_part,
        part_length: this.group_info[new_part].part_length,
        part: this.group_info[new_part].part_name
      });

    }

    updateVideoFilesDict(countVideosAtParts){
      this.setState({
        countVideosAtParts : countVideosAtParts
      });
    }
  
    render() {

      return (
        <div className="components">
          <Grid container spacing={0.5} justifyContent="space-around" height={'100vh'} >

            {/* menu bar */}
            <Grid container justifyContent="space-between" alignItems="baseline" marginRight={2} marginLeft={2}>
                <Grid item>
                  <Logout/>
                </Grid>
                <Grid item>
                  <h3><span className="badge rounded-pill bg-primary text-light">Part: {this.state.part}</span></h3>
                </Grid>
            </Grid>

            {/* videos */}
            <Grid item xs={12}>
              <Video pause={this.state.pause} speed={this.state.speed} seek={this.state.seek} uploadedVideoFiles={this.uploadedVideoFiles} uploadedFilesZip={this.uploadedFilesZip} group_info={this.group_info} part={this.state.part} updateVideoFilesDict={this.updateVideoFilesDict}/>
            </Grid>

            {/* graphs */}
            <Grid container direction="row" spacing={1} >
              <Grid item xs={6} width={"60%"} height={"99%"}>
                <Chart timestep={this.state.timestep} measure="HRV" part={this.state.part} userId={this.userId} expId={this.expId} personsNames={this.state.personsNames} shift={this.shift} takeMax={this.takeMax} windowSize={this.windowSize}/>
              </Grid>
              <Grid item xs={6} width={"60%"} height={"99%"}>
                <Chart timestep={this.state.timestep} measure="EDA" part={this.state.part} userId={this.userId} expId={this.expId} personsNames={this.state.personsNames} shift={this.shift} takeMax={this.takeMax} windowSize={this.windowSize}/>
              </Grid>
            </Grid>

            {/* time-slider */}
            <Grid item xs={12} >
              <TimeSlider timestep={this.state.timestep} timestep_handler={this.timestep_handler} pause_handler={this.pause_handler} speed_handler={this.speed_handler} part_length={this.state.part_length} part_handler={this.part_handler} part={this.state.part} userId={this.userId} groupId={this.expId} bigexpId={this.bigexpId}/>
            </Grid>

          </Grid>
            
        </div> 
      );
      
    }
  }

  export default Clock;
