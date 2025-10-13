import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

import upsLogo from '../images/ups_logo.png';

const Navigation = () => {
  return (
    <Navbar className="bg-primary" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="/">
          <img
            src={upsLogo}
            width={50}
            height={50}
            className={'d-inline-block align-middle'}
            alt={'United Protein Supply logo'}
          />
          United Protein Supply
        </Navbar.Brand>
      </Container>
    </Navbar>
  )
};

export default React.memo(Navigation);