import React from 'react';
import Container from "react-bootstrap/Container";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import Sequences from "@/components/Sequences.tsx";
import Robots from "@/components/Robots.tsx";


const ControlPanel = () => {
  return (
    <Container style={{width: '80vw'}} className={'mt-4'}>
      <h1>Control Panel</h1>
      <Tabs
        defaultActiveKey="sequences"
        id="control-panel-tabs"
        fill
      >
        <Tab eventKey="sequences" title="Sequences">
          <Sequences/>
        </Tab>
        <Tab eventKey="robots" title="Robots">
          <Robots/>
        </Tab>
        <Tab eventKey="music" title="Music">
          music
        </Tab>
        <Tab eventKey="lighting" title="Lighting">
          lighting
        </Tab>
      </Tabs>
    </Container>
  );
};

export default React.memo(ControlPanel);