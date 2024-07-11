// Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Navbar.css'; // Import the custom CSS file

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="p-4">
        <Link className="navbar-brand">
          afk_admin
        </Link>
      </div>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/users">
              Kullanıcılar
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/tables">
              Başvurular
            </Link>
          </li>
        </ul>
        <ul className="navbar-nav ms-auto">
          <li className="nav-item p-4">
            <Link className="nav-link " to="/login">
              Logout
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
