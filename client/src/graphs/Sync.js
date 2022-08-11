import React from "react";
import axios from 'axios';
import '../components/graphs.css';
import get_chart from "./line-chart.js";

// Display the chart of the synchronization between subjects.
function Synchronization(props) {

    const [sync, setSync] = React.useState(null);

    React.useEffect(() => {

        const userId = props.userId
        const expId = props.expId

        const data = new FormData();
        data.append("exp_part", props.part )
        data.append("measure", props.measure )
        data.append("userId", userId)
        data.append("expId", expId)
        data.append("window_size", props.windowSize)
        data.append("couples", props.couples)
        data.append("shift", props.shift)
        data.append("takeMax", props.takeMax)


        try{
          // get the chart of synchronization of the chosen couples
          axios.post('http://localhost:5000/sync/sync',data).then((response) => {setSync(response.data.sync)}
          ,(error) => {
            if(
              error.response &&
              error.response.status >= 400 &&
              error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
          });
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


    }, [props.couples, props.part]);


  var chart = "Loading..."
  if(sync && props.couples.length > 0){
    if(Object.keys(sync).length === 0){ // check if sync != {}
      var chart = "Choose couples in the settings button to see synchronization"
    }
    else if(sync.length <= props.timestep){
      var chart = "Finished"
    }
    else{
      var time_interval = sync.length > 20 ? 20 : sync.length - props.timestep 
      var time_end = props.timestep  + time_interval
      // slice from the whole chart only the required time interval
      var values = sync.slice(props.timestep , time_end)
      chart = get_chart(values,"sync")

    }
  }
  else{
    var chart = "Choose couples in the settings button to see synchronization"

  }

    return (

      <React.Fragment >{chart}</React.Fragment>

    );
}


export default Synchronization;
