import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './common/Header';
import Main from './common/Main';
import Footer from './common/Footer';
import BlocklyComponent from './blockly/components/BlocklyComponent'
import Login from './pages/login/Login';
import Signup from './pages/login/Signup';
import SignUpId from './pages/login/SignUpId';
import Callback from './pages/login/social/components/Callback';
import SocialSignup from './pages/login/SocialSignup';
import Welcome from './pages/login/Welcome';
import ErpMain from "./erp/ErpMain";
import FAQList from './faq/FAQList';
import FAQPut from './faq/FAQPut';
import FAQPost from './faq/FAQPost';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/createBlock" exact={true} element={<BlocklyComponent />} />
          <Route path="/" element={<Main/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/callback" element={<Callback />} />
          <Route path="/signUp" element={<Signup/>} />
          <Route path="/signUp/id" element={<SignUpId/>}/>
          <Route path="/social-signup" element={<SocialSignup/>}/>
          <Route path="/Welcome" element={<Welcome/>}/>
          <Route path="/erpMain" element={<ErpMain/>} />
          <Route path="/faqlist" element={<FAQList/>} />
          <Route path="/faqput/:qa_id" element={<FAQPut/>} />
          <Route path="/faqpost" element={<FAQPost/>} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
