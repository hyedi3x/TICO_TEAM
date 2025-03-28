import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './common/Header';
import Main from './common/Main';
import Footer from './common/Footer';
import Login from './pages/login/Login';
import Signup from './pages/login/Signup';
import SignUpId from './pages/login/SignUpId';
import KakaoLogin from './pages/login/social/pages/KakaoLogin';
import ErpMain from './erp/ErpMain';

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
          <Route path="/erpMain" element={<ErpMain/>} />
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
