import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import UploadPage from './pages/UploadPage';
import ResearchPage from "./pages/ResearchPage";
import SelectExp from './pages/SelectExpPage';
import MyExperiments from "./pages/MyExperiments";
import Settings from "./pages/Settings";
import MyFavorites from "./pages/MyFavorites";
import FromBookmarkToResearch from "./pages/FromBookmarkToResearch";
import FinishPage from "./pages/FinishPage";


function App(){

  return(
    <>
      <Router>
          <Routes>
              <Route path="/" exact element={<LoginPage/>} />
              <Route path="homepage" element={<HomePage/>} />
              <Route path="uploadpage" element={<UploadPage/>} />
              <Route name="selectExp" path="selectExp" element={<SelectExp/>}/>
              <Route name="myExperiments" path="myExperiments" element={<MyExperiments/>}/>
              <Route name="research" path="research" element={<ResearchPage/>} />
              <Route name="selectExp" path="selectExp" element={<SelectExp/>}/>
              <Route path="settings" element={<Settings/>} />
              <Route path="myFavorites" element={<MyFavorites/>} />
              <Route path="finishPage" element={<FinishPage/>} />
              <Route path="fromBookmarktoResearch" element={<FromBookmarkToResearch/>} />
          </Routes>
      </Router>
    </>

  );
}


export default App;
