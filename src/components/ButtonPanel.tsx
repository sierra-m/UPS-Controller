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
        className={'w-100'}
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
    <Row className={'mt-3 flex-nowrap'}>
      <Col xs={8} sm={8} md={8} lg={8} xl={8}>
        <Row className={'row-gap-4'}>
          {props.buttonPropsArray.map((item: TileButtonProps, index: number) => (
            <TileButton
              {...item}
              key={index}
            />
          ))}
        </Row>
      </Col>
      <Col>
        <Card className={'h-100'} border={'info'}>
          <Card.Body style={{ overflowX: 'auto' }}>
            <Card.Title><h4>Status</h4></Card.Title>
            <div className={'card-text'}>
              {props.children}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default memo(ButtonPanel);