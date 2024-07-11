import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Users from './Users';
import Tables from './Tables';
import Navbar from './Navbar';
import Login from './Login';

const Layout = ({ isAuth, setAuth }) => {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/login' && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login setAuth={setAuth} />} />
        <Route path="/users" element={isAuth ? <Users /> : <Navigate to="/login" />} />
        <Route path="/tables" element={isAuth ? <Tables /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </>
  );
};

function AppRouter() {
  const [isAuth, setAuth] = useState(false);

  return (
    <Router>
      <Layout isAuth={isAuth} setAuth={setAuth} />
    </Router>
  );
}

export default AppRouter;
