// Homepage.js
import React from 'react';
import './homepage.css';

const Homepage = ({ user, setLoginUser }) => {
  return (
    <div className="homepage">
      <div className='home'>
        <p>
          Lorem ipsum, dolor sit amet consectetur adipisicing elit. Excepturi repellat error deleniti ab? Nesciunt incidunt nostrum, qui voluptatibus sunt iusto.
        </p>
      </div>
      {user && user._id ? (
        <div className="button" onClick={() => setLoginUser(null)}>
          Logout
        </div>
      ) : (
        <div className="button" onClick={() => setLoginUser({})}>
          Login
        </div>
      )}
    </div>
  );
}

export default Homepage;









