import {memo} from "react";
import type {ReactNode} from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Badge from "react-bootstrap/Badge";
import type {ButtonVariant} from "react-bootstrap/types";
import Button from "react-bootstrap/Button";


export interface TileButtonProps {
  iconName: string;
  title: string;
  variant: ButtonVariant;
  callback: () => void;
  disabled: boolean;
}

const TileButton = (props: TileButtonProps) => {
  return (
    <Col xs={3}>
      <Button
        variant={props.variant}
        size={'lg'}
        className={'w-100 mb-4'}
        style={{aspectRatio: '1 / 1'}}
        onClick={props.callback}
        disabled={props.disabled}
      >
        <i className={`bi bi-${props.iconName}`}></i> <br/>
        {props.title}
      </Button>
    </Col>
  )
};


interface ButtonPanelProps {
  buttonPropsArray: TileButtonProps[];
  children: ReactNode;
}

const ButtonPanel = (props: ButtonPanelProps) => {
  return (
    <Row className={'mt-3'}>
      <Col xs={9} sm={9} md={9} lg={9} xl={9}>
        <Row>
          {props.buttonPropsArray.map((item: TileButtonProps, index: number) => (
            <TileButton
              {...item}
              key={index}
            />
          ))}
        </Row>
      </Col>
      <Col>
        <Card className={'h-100'} border={'primary'}>
          <Card.Body>
            <Card.Title>Status</Card.Title>
            <Card.Text>
              {props.children}
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default memo(ButtonPanel);