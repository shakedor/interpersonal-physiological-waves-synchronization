import React, { useEffect, useState } from 'react';
import {useNavigate} from 'react-router-dom';
import {HomepageHead, HomepageCards, HomepageDir } from '../components/headline.style';
import { Card1Button, Card2Button, Card3Button, Card4Button } from '../components/button.style';
import { HomePageDiv, HomepageRow, HomepageHealines, HomepageCardsDiv } from '../components/div.style';
import Logout from '../components/logout';


function HomePage() {
    let navigate = useNavigate();
    
    const [userDetails, setUserDetails] = useState({
        _id: '',
        first_name: '',
        last_name: '',
        email: ''})

    useEffect(() => {
        setUserDetails(JSON.parse(localStorage.getItem("user_details")));
    }, []);

    return (
        <HomePageDiv className="home">
            <Logout/>
            <HomepageRow>

                <HomepageHealines>
                    <HomepageHead>Welcome {userDetails.first_name}</HomepageHead>
                    <HomepageDir>Please select an option</HomepageDir>
                </HomepageHealines> 

                <HomepageCardsDiv>

                    <Card1Button onClick={() => { navigate("/uploadpage") }}>
                        <HomepageCards>Upload experiment results</HomepageCards>
                    </Card1Button>
                    <Card2Button onClick={() => { navigate("/myExperiments") }}>
                        <HomepageCards>My experiments</HomepageCards>
                    </Card2Button>
                    <Card3Button onClick={() => { navigate("/selectExp") }}>
                        <HomepageCards>Previous experiments</HomepageCards>
                    </Card3Button>
                    <Card4Button onClick={() => { navigate("/myFavorites") }}>
                        <HomepageCards>My favorites</HomepageCards>
                    </Card4Button>

                </HomepageCardsDiv>
            </HomepageRow>
        </HomePageDiv>
    );
}

export default HomePage;