import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './common/Header';
import Main from './common/Main';
import Footer from './common/Footer';
import Login from './pages/login/Login';
import Signup from './pages/login/Signup';
import SignUpId from './pages/login/SignUpId';
import KakaoLogin from './pages/login/social/pages/KakaoLogin';
import LearnTico from './temporaryFile/LearnTico';
import CreateBlock from './temporaryFile/CreateBlock';
import CreateStudy from './temporaryFile/CreateStudy';
import ShareBlock from './temporaryFile/ShareBlock';
import ShareStudy from './temporaryFile/ShareStudy';
import QnA from './temporaryFile/QnA';
import Notice from './temporaryFile/Notice';



function App() {
  return (
    <div>
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path="/" element={<Main/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/signUp" element={<Signup/>} />
          <Route path="/signUp/id" element={<SignUpId/>}/>
          <Route path="/kakaoLogin" element={<KakaoLogin />} />
          <Route path="/learnTico" exact={true} element={<LearnTico/>}/> 
          <Route path="/createBlock" exact={true} element={<CreateBlock/>}/> 
          <Route path="/createStudy" exact={true} element={<CreateStudy/>}/> 
          <Route path="/shareBlock" exact={true} element={<ShareBlock/>}/> 
          <Route path="/shareStudy" exact={true} element={<ShareStudy/>}/> 
          <Route path="/qna" exact={true} element={<QnA/>}/> 
          <Route path="/notice" exact={true} element={<Notice/>}/> 
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
