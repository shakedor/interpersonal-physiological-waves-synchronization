import styled from 'styled-components';

import card1 from '../images/card1.png';
import card2 from '../images/card2.png';
import card3 from '../images/card3.png';
import card4 from '../images/card4.png';
import settingsIcon from '../images/setting-gear-icon.png';

// the button of card 1
export const Card1Button = styled.button`
    width: 230px;
    height: 250px;
    display: inline-block;
    border-radius: 20px;
    padding: 10px 25px;
    box-sizing: border-box;
    cursor: pointer;
    margin: 10px 10px;
    background-position: center;
    transition: transform 0.5s;
    &:hover{
        transform: translateY(-10px);
    }
    background-image: url(${card1});
    background-size: cover;
`;

// the button of card 2
export const Card2Button = styled.button`
    width: 230px;
    height: 250px;
    display: inline-block;
    border-radius: 20px;
    padding: 10px 25px;
    box-sizing: border-box;
    cursor: pointer;
    margin: 10px 10px;
    background-position: center;
    transition: transform 0.5s;
    &:hover{
        transform: translateY(-10px);
    }
    background-image: url(${card2});
    background-size: cover;
`;

// the button of card 3
export const Card3Button = styled.button`
    width: 230px;
    height: 250px;
    display: inline-block;
    border-radius: 20px;
    padding: 10px 25px;
    box-sizing: border-box;
    cursor: pointer;
    margin: 10px 10px;
    background-position: center;
    transition: transform 0.5s;
    &:hover{
        transform: translateY(-10px);
    }
    background-image: url(${card3});
    background-size: cover;
`;

// the button of card 4
export const Card4Button = styled.button`
    width: 230px;
    height: 250px;
    display: inline-block;
    border-radius: 20px;
    padding: 10px 25px;
    box-sizing: border-box;
    cursor: pointer;
    margin: 10px 10px;
    background-position: center;
    transition: transform 0.5s;
    &:hover{
        transform: translateY(-10px);
    }
    background-image: url(${card4});
    background-size: cover;
`;

// submit button to the selectExp page
export const SubmitButton = styled.button`
    width: 60%;
    margin: 20px auto;
    &:hover{
        background: blue;
    }
`;

// upload button to the uploade page
export const UploadButton = styled.button`
    width: 40%;
    margin: 20px auto;
    &:hover{
        background: blue;
    }
`;

// settings buttons to choose number of participants to display in the graphs in the research page
export const SettingsButton = styled.button`
    background-color: transparent;
    border-color: transparent;
    background-repeat: no-repeat;
    display: inline-block;
    border-radius: 20px;
    padding: 10px 25px;
    box-sizing: border-box;
    cursor: pointer;
    margin: 10px 10px;
    background-position: center;
    transition: transform 0.5s;
    &:hover{
        transform: translateY(-10px);
    }
    background-image: url(${settingsIcon});
    background-size: 25px auto; 
`;

