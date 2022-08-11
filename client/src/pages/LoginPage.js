import React from 'react';
import { LoginBox, HomePageDiv } from '../components/div.style';
import GoogleAuth from '../components/GoogleAuth';
import { Typography } from '@mui/material';
import loginImg from '../images/loginImg.webp';
import Grid from '@mui/material/Grid';



function LoginPage() {

    return (
        <HomePageDiv>

            <Grid container justify="center" alignItems="center" direction="column">
                {/* headline */}
                <Grid item xs={12} >
                    <Typography sx={{color:'white', 
                                    fontWeight: 'regular', 
                                    fontSize: 70, 
                                    textAlign: 'center', 
                                    marginTop: 3,
                                    fontFamily: '',
                                    WebkitTextStroke: 1,
                                    WebkitTextStrokeColor: 'black',
                                    }}>Interpersonal Physiological Waves Synchroniztion App
                    </Typography>
                </Grid>

                <LoginBox>
                    {/* img */}
                    <Grid item xs={12} sx={{marginBottom: 3}}>
                        <img src={loginImg} className="img-thumbnail"/> 
                    </Grid>

                    <Grid item xs={12}>
                        <Typography sx={{color:'white', 
                                fontWeight: 600, 
                                fontSize: 30, 
                                textAlign: 'center', 
                                marginBottom:2}}>LOGIN
                        </Typography>
                            
                    </Grid>
                    
                    {/* connect with google */}
                    <Grid item xs={12}>
                        <GoogleAuth />
                    </Grid>
                </LoginBox>

                </Grid>
            
        </HomePageDiv>
    );
}

export default LoginPage;