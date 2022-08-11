import React, { useEffect, useState } from 'react';
import {Nav, NavDropdown, DropdownButton} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';

/**
 * The function creates menu for the whole app for going back to the homepage or 
 * logout of the application.
 *
 * @return the menu object
 */
function Logout() {
    let navigate = useNavigate();    
    const [userDetails, setUserDetails] = useState({
        _id: '',
        first_name: '',
        last_name: '',
        email: ''})
    
      useEffect(() => {
          setUserDetails(JSON.parse(localStorage.getItem("user_details")));
    }, []);

    const logout = () => {
        localStorage.clear();
        navigate("/");
    }

    return (
        <div>
            <Nav style={{color:'white'}}>
                {userDetails._id?
                    <DropdownButton title="Menu" style={{fontSize: 20, marginTop: 5, marginLeft: 3}} >
                        <NavDropdown.Item onClick={() => {navigate("/homepage")}}>Back to home page</NavDropdown.Item>
                        <NavDropdown.Item onClick={() => {logout()}}>LogOut</NavDropdown.Item>
                    </DropdownButton>
                :null}
            </Nav>
        </div>
    )
}

export default Logout;