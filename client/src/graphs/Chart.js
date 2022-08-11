import React from "react";
import '../components/graphs.css';
import get_chart from "./line-chart.js";
import axios from 'axios';
import Synchronization from '../graphs/Sync';
import { SettingsButton } from '../components/button.style';

import {Grid, Popover} from '@mui/material';




/**
 * Display the chart with the data of the subject on a given measure.
 * Also enables the option to choose from a checklist the subgroups of subject to watch synchronization between.
 * The data of the chart changes every second.
 */

function Chart(props) {

  const maptoidx = {}
  const persons = props.personsNames
  persons.map((per,i) => (maptoidx[per] = i))
  const checkList = getAllSubsets(persons).filter(subset => subset.length > 1)
  // as default, the checklist will start with the synchronization of the whole group
  const allpersonssync = checkList[checkList.length - 1].map(per => maptoidx[per])
  const [checked, setChecked] = React.useState([allpersonssync.join('-')]); 

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [data, setData] = React.useState(null);

  React.useEffect( () => {

    const userId = props.userId
    const expId = props.expId

    const req = new FormData();
    req.append("exp_part", props.part )
    req.append("measure", props.measure )
    req.append("userId", userId)
    req.append("expId", expId)

    // get the chart data from the server 
    axios.post( "http://localhost:5000/chart",req)
    .then((response) => {
      setData(response.data.chart)

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
  }, [props.part]);


  var chart = "Loading..."
  if(data){
    if(data.length <= props.timestep){
      var chart = "Finished"
    }
    else {
      var time_interval = data.length > 20 ? 20 : data.length - props.timestep 
      var time_end = props.timestep  + time_interval
      // slice from the whole chart only the required time interval
      chart = get_chart(data.slice(props.timestep , time_end), "measure")

    }
  }



  // settings button and synchronization couples list
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;


  // Add/Remove checked item from list
  const handleCheck = (event) => {
    var updatedList = [...checked];
    if (event.target.checked) {
      updatedList = [...checked, event.target.value];
    } else {
      updatedList.splice(checked.indexOf(event.target.value), 1);
    }
    setChecked(updatedList);
  };

  // Return classes based on whether item is checked
  var isChecked = (item) =>
    checked.includes(item) ? "checked-item" : "not-checked-item";



  return (
    <div className="App-header" >
       
        <div className="titleandsettings">
          <h2>{props.measure}</h2>
          <SettingsButton onClick={handleClick} > 
          </SettingsButton>
            <Popover
             id={id}
             open={open}
             anchorEl={anchorEl}
             onClose={handleClose}
             anchorOrigin={{
               vertical: 'bottom',
               horizontal: 'left',
             }}>

              <Grid container direction="column-reverse">
              <div className="list-container">
                {checkList.map((item, index) => (
                  <div key={index}>
                    <input value={item.map(per => maptoidx[per]).join('-')} type="checkbox" onChange={handleCheck} defaultChecked={checked.includes(item.map(per => maptoidx[per]).join('-'))} />
                    <span className={isChecked(item)}>{item.join('-')}</span>
                  </div>
                ))}
              </div> 
 
              </Grid>
             </Popover>
        </div>
        

      <div className="single-chart" style={{flex: "1"}}>
            <Synchronization 
            timestep={props.timestep}
            measure={props.measure} 
            part={props.part}
            userId={props.userId}
              expId={props.expId}
              couples={checked}
              shift={props.shift}
              takeMax={props.takeMax}
              windowSize={props.windowSize}
              />
        </div>
        <div className="single-chart" style={{flex: "1.5"}}> {chart}</div>

      </div>



  );
}

function getAllSubsets(array) {
  const subsets = [[]];
  
  for (const el of array) {
      const last = subsets.length-1;
      for (let i = 0; i <= last; i++) {
          subsets.push( [...subsets[i], el] );
      }
  }
  
  return subsets;
}

export default Chart;
