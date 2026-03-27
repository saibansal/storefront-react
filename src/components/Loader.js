import React from 'react';

const Loader = ({ message = "Loading products..." }) => {
  return (
    <div className="loader-content container">
      <div className="spinner"></div>
      <p className="loading-text text-gradient">{message}</p>
    </div>
  );
};

export default Loader;
