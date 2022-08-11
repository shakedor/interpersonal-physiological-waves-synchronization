/**
 * Summary. Creates the x values array for the chart.
 *
 * Description. The sampling rate is twice a second. The format is: mmss0 / mmss5 (without ":").
 * Every second has an element. For half second sampling it will be mmss5, else, mmss0.
 *
 * @param Number   array_len     Description. The length of the desired array.
 * 
 * @return Array                 Return value description. The array of x axis values.
 */
function create_x_values(array_len){
  x_values = [...Array(array_len)].map((e, i) => {
    
    /*
    00010 , 00015, 00020, 00025, ... , 11590, 11595
    */
    
    const Fs = 1/2
    var minutes = Math.floor(i*Fs/60)
    var seconds = Math.floor(i*Fs)%60
    var ms = i*Fs%1

    if (minutes > 0){
      if(minutes < 10){
        minutes = "0" + minutes
      }
    }
    else{
     minutes = "00" 
    }
    if(seconds < 10){
      seconds = "0" + seconds
    }
    if(ms > 0){
      ms = "5"
    }
    else{
      ms = "0"
    }

    return minutes + seconds + ms
  });

  return x_values
}

/**
 * Summary. Crearte a chart object from the group data
 *
 * @param object   expData     Description. includes all the group data for the experiment
 * @param String   part        Description. The part to take the values from
 * @param String   measure     Description. The measure to take the values from
 * 
 * @return Object              Return value description. The chart object of the group data
 */
function extract_measure_values(expData, part, measure){
  var x_values = undefined
  var lines = undefined

  const persons_keys = Object.keys(expData.parts[part]["measures_vec"][measure]["persons_vectors"])
  const lines_names = []
  const measureData = []
  var minlen = expData.parts[part]["measures_vec"][measure]["persons_vectors"][0]["measure_values"].length

  // get the values vector of each subject
  persons_keys.forEach(element => {
    var person = expData.parts[part]["measures_vec"][measure]["persons_vectors"][element]["person_num"]
    lines_names.push(person)
    var person_data = expData.parts[part]["measures_vec"][measure]["persons_vectors"][element]["measure_values"]
    measureData.push(person_data)
    if(person_data.length < minlen){
      minlen = person_data.length
    }
  });
 
  // all vectors should be at the same length
  for(let i=0; i< measureData.length ; i++ ){
    measureData[i] = measureData[i].slice(0,minlen)
    var x = 0;
    while(x < minlen){
      measureData[i][x] = measureData[i][x].toFixed(4); 
      x++
    }

  }

  x_values = create_x_values(minlen)
  lines = measureData

  chart = create_data(lines_names,lines,x_values)
  return chart
}

/**
 * Summary. Crearte a chart object from the given data in the format for Recharts library 
 *
 * @param Array   lines_names   Description. The label of each line in the chart
 * @param Array   lines         Description. The vectors with the values to be presented in the chart (y axis). array of vectors.
 * @param Array   x_values      Description. The x values for every element in the lines vectors (x axis). one vector.
 * 
 * @return Object               Return value description. The chart object of the group data
 */
function create_data(lines_names, lines, x_values){

    var n_lines = lines.length
    const data = []
    var len_points = x_values.length

    // check each line has name
    if(lines_names.length != n_lines){
      console.log("found " + lines_names.length +" lines names instead of " + n_lines)
      if (lines_names.length < n_lines){
        return []
      }
    }
    // check that all lines have all the points
    for (let i=0 ; i<n_lines ; i++){
      if(lines[i].length != len_points){
        console.log("Line number " + (i+1) + " has "+lines[i].length+ " points instead of " + len_points)
        if (lines[i].length < len_points){
          return []
        }
      }
    }

    for (let i = 0; i < len_points; i++){
      data.push({x_value: x_values[i]})
      for(let j=0; j<n_lines; j++){
        // 
        Object.assign(data[i],({[lines_names[j]]: lines[j][i]}))
      }
    }
    
  return data
}

module.exports.extract_measure_values = extract_measure_values
module.exports.create_data = create_data
module.exports.create_x_values = create_x_values