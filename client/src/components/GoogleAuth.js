import React from 'react';
import axios from 'axios';

import {GoogleLogin} from 'react-google-login';

function GoogleAuth() {

    const onSuccess = (res) =>{
        const userData = {
            first_name: res.profileObj.givenName,
            last_name: res.profileObj.familyName,
            email: res.profileObj.email,
        }
        axios.post('http://localhost:5000/getAuth', userData).then((res) => {
            const token = res.data.data.token
            const userDetails = res.data.data.userDetails
            localStorage.setItem("token", token);
            localStorage.setItem("user_details", JSON.stringify(userDetails));
            window.location = '/homepage'
        }).catch((error) => {
            if(
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ){
              alert(error.response.data.message);
            }
        })
    }

    const onFailure = (res)=>{
        alert(res);
    }

    return (
        <div>
            <GoogleLogin
                clientId='268606656800-cdjo7ekllq3u5rmslc9bei15f8k646rn.apps.googleusercontent.com'
                cookiePolicy='single_host_origin'
                onSuccess={onSuccess}
                onFailure={onFailure}
                isSignedIn={false}
            />
        </div>
    )
}


export default GoogleAuth;