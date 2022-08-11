import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { HomePageDiv, MyFavoritesBox } from '../components/div.style';
import Logout from '../components/logout';
import axios from 'axios';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { Button } from '@mui/material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';


function MyFavorites() {
  const navigate = useNavigate();
  // for the menu of each expirement
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // for the little stars
  const [anchorElStar, setAnchorElStar] = useState(null);
  const openStar = Boolean(anchorElStar);
  const [starClicked, setStarClicked] = useState(false);
  const [currStar, setCurrStar] = useState('');

  const [bookmarks_arr, setBookmarksArr] = useState([]);  //[ {_id, exp_name, group_name, part_name, description, color, time_stamp}]
  const [userDetails, setUserDetails] = useState({
    _id: '',
    first_name: '',
    last_name: '',
    email: ''})
  
  
  useEffect(() => {
    async function getBookmarks(){
      try{
          setUserDetails(JSON.parse(localStorage.getItem("user_details")));
          const userId = JSON.parse(localStorage.getItem("user_details"))._id;
          const token = localStorage.getItem("token");
          axios.defaults.headers.common['authorization'] = 'Bearer '+ token
          const res = await axios.get("http://localhost:5000/bookmarks/"+ userId + "/format/"); 
          const arr_fav = res.data.data;
          setBookmarksArr(arr_fav);
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
    getBookmarks();
  }, []);

  // handle function for opening the star color menu
  const openMenu = (bookmarkId) => (event) => {
    setStarClicked(true);
    setCurrStar(bookmarkId);
    setAnchorEl(event.currentTarget);
  }

  // close the menu
  const handleClose = () => {
    setStarClicked(false);
    setCurrStar('');
    setAnchorEl(null);
  };

  // change the color of the bookmark star in the DB
  const onStarClick = (color) => async(event) => {
    try{
      const userId = userDetails._id;
      const body = {new_color: color};
      const res = await axios.patch("http://localhost:5000/bookmarks/"+ userId + "/"+ currStar, body); 
      window.location.reload();
      setStarClicked(false);
      setAnchorEl(null);
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

  // delete bookmark from the list
  async function handleDelete(bookmarkID){
    try{
      const userId = userDetails._id;
      const res = await axios.delete("http://localhost:5000/bookmarks/"+ userId + "/" + bookmarkID + "/"); 
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
  }

  // Go to the research page in the current minute of the bookmark
  function directToResearchPage(currBookmark){
    let allBookmarkData = {};
    allBookmarkData.userId = userDetails._id;
    allBookmarkData.groupId = currBookmark.groupId;
    allBookmarkData.expId = currBookmark.expId;
    allBookmarkData.timeStep = currBookmark.time_stamp;
    allBookmarkData.part = currBookmark.part_name;
    navigate('/fromBookmarktoResearch',{replace: true, state:[allBookmarkData]});
  }

  // convert the time of the bookmark into minutes
  function formatDuration(value) {
    var Fs = 1/2
    value = Math.floor(value * Fs)
    const minute = Math.floor(value / 60);
    const secondLeft = value - minute * 60;
    return `${minute}:${secondLeft <= 9 ? `0${secondLeft}` : secondLeft}`;
  }


  return (
    <HomePageDiv>
      <Logout/>
      <MyFavoritesBox>
        <Typography sx={{color:'white', 
                        fontWeight: 'regular', 
                        fontSize: 30, 
                        textAlign: 'center', 
                        marginBottom:3}}>My Bookmarks
        </Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 550 }}>
          <Table sx={{ minWidth: 500 }} aria-label="simple table">

            {/* the header of the table */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center"></TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Experiment</TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Group</TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Part</TableCell>
                <TableCell sx={{ minWidth: 150, maxWidth: 150, fontSize: 20 }} align="center">Description</TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Time</TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Delete</TableCell>
                <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 20 }} align="center">Direct to Research Page</TableCell>
              </TableRow>
            </TableHead>

            {/* the body of the table */}
            <TableBody>
              {bookmarks_arr.map((row) => (
                <TableRow
                  key={row._id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center" component="th" scope="row">

                  <Tooltip title="Choose bookmark color">
                    <IconButton 
                    aria-label="more"
                    id="long-button"
                    aria-controls={open ? 'long-menu' : undefined}
                    aria-expanded={open ? 'true' : undefined}
                    aria-haspopup="true"
                    onClick={openMenu(row._id)}>
                        <StarIcon style={{ color: row.color }} fontSize="large"/>
                    </IconButton>
                  </Tooltip>

                    {starClicked?
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
                          width: '40ch',
                          },
                      }}>

                        {/* menu of the starts colors */}
                        <MenuItem>                            
                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('yellow')}>
                                <StarIcon style={{ color: 'yellow' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('pink')}>
                                <StarIcon style={{ color: 'pink' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('orange')}>
                                <StarIcon style={{ color: 'orange' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('red')}>
                                <StarIcon style={{ color: 'red' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('green')}>
                                <StarIcon style={{ color: 'green' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                            <Grid item xs={2}>
                              <IconButton 
                              aria-label="more"
                              id="long-button"
                              aria-controls={openStar ? 'long-menu' : undefined}
                              aria-expanded={openStar ? 'true' : undefined}
                              aria-haspopup="true"
                              onClick={onStarClick('blue')}>
                                <StarIcon style={{ color: 'blue' }} fontSize="large"/>
                              </IconButton>
                            </Grid>

                        </MenuItem>
                      </Menu>
                    :null}

                  </TableCell>
                  <TableCell align="center" sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }}>
                    {row.exp_name}
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center">{row.group_name}</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center">{row.part_name}</TableCell>
                  <TableCell sx={{ minWidth: 150, maxWidth: 150, fontSize: 15 }} align="center">{row.description}</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center">{formatDuration(row.time_stamp)}</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center">
                    <Button variant="text" onClick={() => handleDelete(row._id)}>Delete</Button>
                  </TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100, fontSize: 15 }} align="center">
                    <Button variant="text" onClick={() => directToResearchPage(row)}>Go To</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

          </Table>
        </TableContainer>
      </MyFavoritesBox>
    </HomePageDiv>
  )
}

export default MyFavorites;