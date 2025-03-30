import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './common/Header';
import Main from './common/Main';
import Footer from './common/Footer';
import BlocklyComponent from './blockly/components/BlocklyComponent'
import FAQList from './blockly/blocks/FAQ/FAQList';
import FAQPost from './blockly/blocks/FAQ/FAQPost';
import FAQPut from './blockly/blocks/FAQ/FAQPut';
function App() {
  return (
    <div>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" exact={true} element={<Main />} />
          <Route path="/createBlock" exact={true} element={<BlocklyComponent />} />
          <Route path="/FAQList" exact={true} element={<FAQList />} />
          <Route path="/FaqPost" exact={true} element={<FAQPost />} />
          <Route path="/FAQPut/:qa_id" exact={true} element={<FAQPut />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
