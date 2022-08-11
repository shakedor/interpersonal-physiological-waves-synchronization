import "../components/chartstyle.css";
import moment from 'moment'
import React from "react";


import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Brush,
  ResponsiveContainer,
  Label
} from "recharts";




export default function get_chart(chart,type) { //type = "sync" / "measure"
  chart.forEach(element => {
      element["x_value"] = moment(element["x_value"],"mm:ss").format('mm:ss')
    });
    const data = chart
    // Assuming that in a regular experiment there are 2-3 participants. We give here the option for max 7 participants.
    // pink, purple, green, blue ,yellow, dark green, baby-blue
    var colors = ["#e12386","#8884d8","#82ca9d", "#2c09e9","#e6e35e","#0f9a38", "#1896cd",] 

    var domain = []
    var tickLine = true
    var legendType= 'line'
    var hide = false
    var height = 300
    var aspect=3
    var yLabel = ""

    if(type == "sync"){
      tickLine = false
      domain = [-1, 1]
      legendType='line'
      hide= true
      height = 200
      aspect=4
      colors = colors.reverse()
      yLabel = "corr"
    }
    else{
      domain = ['dataMin - 5', 'dataMax + 5']
    }

    const keys = Object.keys(data[0])
    const x_values_key = "x_value"
    keys.splice(keys.indexOf("x_value"),1)
    
    return (

      <ResponsiveContainer width="95%" height="100%">

      <LineChart data={data} margin={ {top: 10, right: 10, bottom: 10, left: 30} }>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={x_values_key} fontSize="20px" domain={['dataMin', 'dataMax']} tickLine={tickLine} hide={hide}/>
      <YAxis type="number" domain={domain} fontSize="15px" label={{value:yLabel, angle: -90, position: 'insideBottomLeft', fill:'white'}} />
      <Legend />
      {keys.map(((line,i)=><Line key={line} type="monotone" dataKey={line} stroke={colors[i]} strokeWidth={2} isAnimationActive={false} dot={false} legendType={legendType} />))}
      </LineChart>

      </ResponsiveContainer>



  );
}
