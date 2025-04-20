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
import ErpMain from "./pages/erp/ErpMain";
import FindIdPassword from './pages/login/FindIdPassword';
import ObjectSelectPage from './blockly/components/ObjectSelectPage';
import MypageMain from '../src/mypage/MypageMain';

import FAQList from './pages/faq/FAQList';
import FAQPut from './pages/faq/FAQPut';
import FAQPost from './pages/faq/FAQPost';
import EduList from './pages/blockedu/EduList';
import BlockEduComponent from './pages/blockedu/BlockEduComponent';
import EMPEduList from './pages/blockedu/EMPEduList';
import BlockEduComponentPut from './pages/blockedu/BlockEduComponentPut';
import ShareGallery from './pages/share/ShareGallery';
import ShareDetail from './pages/share/ShareDetail';
import ShareCanvas from './blockly/components/BlocklyComponentRun';
import MainModify from './common/MainModify';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/createBlock" exact={true} element={<BlocklyComponent />} />
          <Route path="/" element={<Main/>}/>
          <Route path="/mainModify" element={<MainModify/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/callback" element={<Callback />} />
          <Route path="/signUp" element={<Signup/>} />
          <Route path="/signUp/id" element={<SignUpId/>}/>
          <Route path="/social-signup" element={<SocialSignup/>}/>
          <Route path="/Welcome" element={<Welcome/>}/>
          <Route path="/erpMain" element={<ErpMain/>} />
          <Route path="/FindIdPassword" element={<FindIdPassword/>} />
          <Route path="/select-object" element={<ObjectSelectPage/>} />
          <Route path="/MypageMain" element={<MypageMain/>} />
          <Route path="/faqlist" element={<FAQList/>} />
          <Route path="/faqput/:qa_id" element={<FAQPut/>} />
          <Route path="/faqpost" element={<FAQPost/>} />
          <Route path="/eduList" element={<EduList/>} />
          <Route path="/quiz/:quizId" element={<BlockEduComponent/>} />
          <Route path="/EMPEduList" element={<EMPEduList/>} />
          <Route path="/quizput/:quiz_id" element={<BlockEduComponentPut/>} />
          <Route path="/share" element={<ShareGallery/>}/>
          <Route path="/share/detail/:projectId" element={<ShareDetail />} />
          <Route path="/canvas/:projectId" element={<ShareCanvas />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
