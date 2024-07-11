import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Header({ title }) {
  return (
    <header className="bg-primary text-white text-center py-5 mb-4">
      <div className="container">
        <h1>{title}</h1>
      </div>
    </header>
  );
}

export default Header;
