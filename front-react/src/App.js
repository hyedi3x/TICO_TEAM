import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from './common/Header';
import Main from './common/Main';
import Footer from './common/Footer';

function App() {
  return (
    <div>
      <BrowserRouter>
        <Header/>
        <Routes>
          <Route path="/" exact={true} element={<Main/>}/> 
        </Routes>
        <Footer/>
      </BrowserRouter>
    </div>
  );
}

export default App;
