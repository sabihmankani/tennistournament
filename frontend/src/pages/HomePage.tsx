import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const HomePage: React.FC = () => {
  const style = {
    backgroundImage: `url(${process.env.PUBLIC_URL}/images/tennis-court.jpg)`,
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
      <h1 className="display-2 fw-bold mb-4">Tennis Championship of Toronto Brothers</h1>
      <p className="lead fs-3 mb-4">The ultimate tournament experience.</p>
      <p className="fs-5 mb-5">Follow the action, view match results, and see who comes out on top.</p>
      <Link to="/rankings">
        <Button variant="light" size="lg">
          View Player Rankings
        </Button>
      </Link>
    </div>
  );
};

export default HomePage;