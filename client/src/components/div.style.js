import styled from 'styled-components';

// box background for the login page
export const LoginBox = styled.div`
    width: 25%;
    padding: 30px;
    position: absolute;
    top: 65%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
`;

// the backgroung of the app
export const HomePageDiv = styled.div`
  background: url(https://www.seekmomentum.com/wp-content/uploads/2020/07/social-media-manufacturers-1110x444.png);
  background-size: cover;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  overflow: scroll;
 
`;

// div for the order in the homepage
export const HomepageRow = styled.div`
    display: flex;
    height: 50%;
    align-items: center;
`;

// div for the headlines in the homepage
export const HomepageHealines = styled.div`
    flex-basis: 55%;
`;

// div for the cards in the homepage
export const HomepageCardsDiv = styled.div`
    display: grid;
    height: 70%;
    align-items: center;
    grid-template-columns: 12em 1fr;
    column-gap: 70px;
    row-gap: 0px;
`;

// div for the time-slider in the research page
export const TimeSlider = styled.div`
    width: 650px;
    height: 130px;
    padding-left: 65px;
    position: absolute;
    top: 20%;
    left: 10%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    justify-content: space-between;

`;

// div for the uploadpage background
export const UploadBox = styled.div`
    width: 60%;
    padding: 150px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
`;

// div for select experiment box
export const SelectExpBox = styled.div`
    width: 40%;
    padding: 30px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
`;

// div for my experiment page box
export const MyExpSelectExpBox = styled.div`
    width: 900px;
    padding: 30px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
`;

// div for my favorites page box
export const MyFavoritesBox = styled.div`
    width: 90%;
    padding: 30px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.5);
    text-align: center;
`;

// div for the start of upload page
export const UploadQuestionDiv = styled.div`
    display: flex;
    flex-direction: row;
    text-align: center;
    justify-content: center;
`;

