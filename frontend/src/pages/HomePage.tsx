import React from 'react';

const HomePage: React.FC = () => {
  const style = {
    backgroundImage: `url('/images/tennis-court.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: 'calc(100vh - 56px)',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
    padding: '20px',
  };

  return (
    <div style={style} className="text-center">
      <h1 className="display-3 fw-bold mb-4">Welcome to the Tennis Championship of Toronto Brothers!</h1>
      <p className="lead fs-4">Get started by Adding Matches, View Past Matches and check rankings.</p>
    </div>
  );
};

export default HomePage;

