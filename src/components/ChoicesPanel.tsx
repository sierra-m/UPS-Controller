import React, {useState} from 'react';
import Container from "react-bootstrap/Container";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import type {TileButtonProps} from "@/components/ButtonPanel.tsx";

import content, {tasksMap, sequencesMap, sequenceButtonsMap} from '@/utils/content.ts';
import {firstLetterCaps} from '@/utils/utils.ts';
import type {ButtonNextState, ButtonState, TileButtonContent} from "@/data/schema.ts";
import type {ButtonVariant, Variant} from "react-bootstrap/types";
import type {ActionRequest, ActionRequestKind} from "@/types/api.ts";
import {runAction} from "@/utils/utils.ts";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";


const useButtonStates = !!(content.sequencePanel.buttonStates && content.sequencePanel.buttonNextStates);
if (!useButtonStates) {
  throw new Error("ButtonStates must be defined for ChoicesPanel!");
}


interface ChoiceButton {
  iconName: string;
  title: string;
  variant: ButtonVariant;
  callback: () => void;
}

const buttonStatesMap = new Map<string, ButtonState>();
const buttonNextStatesMap = new Map<string, string>();
for (const buttonState of content.sequencePanel.buttonStates!) {
  buttonStatesMap.set(buttonState.id, buttonState);
}
for (const buttonNextState of content.sequencePanel.buttonNextStates!) {
  buttonNextStatesMap.set(buttonNextState.buttonId, buttonNextState.nextStateId);
}

const resetButton: TileButtonContent = sequenceButtonsMap.get('button_reset')!;

const ChoicesPanel = () => {

  const [activeButtonState, setActiveButtonState] = useState<string>(
    useButtonStates ? content.sequencePanel.buttonStates![0]!.id : ''
  );

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      const task = tasksMap.get(buttonContent.taskId)!;
      await runAction('task', buttonContent.taskId);
    } else if (buttonContent.sequenceId) {
      const sequence = sequencesMap.get(buttonContent.sequenceId)!;
      await runAction('sequence', buttonContent.sequenceId);
    }
    setActiveButtonState(buttonNextStatesMap.get(buttonContent.id)!);
  };

  const choiceButtons: ChoiceButton[] = buttonStatesMap.get(activeButtonState)!.selectableIds
    .filter(buttonId => buttonId !== 'button_reset')
    .map(buttonId => {
    const buttonContent = sequenceButtonsMap.get(buttonId)!;
    return {
      iconName: buttonContent.iconName,
      title: buttonContent.title,
      variant: buttonContent.variant,
      callback: () => selectButton(buttonContent)
    };
  });

  return (
    <Container style={{width: '80vw'}} className={'mt-4'}>
      <h1>{buttonStatesMap.get(activeButtonState)!.prompt}</h1>
      <Row className={'mt-4'}>
        {choiceButtons.map((item: ChoiceButton, index: number) => (
          <Col xs={6} key={index}>
            <Button
              variant={item.variant}
              size={'lg'}
              className={'w-100'}
              style={{aspectRatio: '1 / 1'}}
              onClick={item.callback}
              disabled={false}
            >
              <i className={`bi bi-${item.iconName}`}></i> <br/>
              {item.title}
            </Button>
          </Col>
        ))}
      </Row>
      <Row>
        <Col className={'mt-4'}>
          <Button
            variant={'outline-danger'}
            size={'lg'}
            onClick={() => selectButton(resetButton)}
          >
            Reset
            <i className={`bi bi-x-circle-fill ms-2`}></i>
          </Button>
        </Col>
      </Row>
    </Container>
  )
};

export default React.memo(ChoicesPanel);