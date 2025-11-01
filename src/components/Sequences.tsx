import {memo, useEffect, useRef, useState} from "react";
import Badge from 'react-bootstrap/Badge';

import ButtonPanel from "@/components/ButtonPanel.tsx";
import type {TileButtonProps} from "@/components/ButtonPanel.tsx";

import content, {tasksMap, sequencesMap} from '@/utils/content.ts';
import {firstLetterCaps} from '@/utils/utils.ts';
import type {ButtonNextState, ButtonState, TileButtonContent} from "@/data/schema.ts";
import type {Variant} from "react-bootstrap/types";
import type {ActionRequest, ActionRequestKind} from "@/types/api.ts";
import {runAction} from "@/utils/utils.ts";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";


interface ButtonAction {
  kind: ActionRequestKind;
  badgeColor: Variant;
  actionId: string;
  actionTitle: string;
}

const useButtonStates = !!(content.sequencePanel.buttonStates && content.sequencePanel.buttonNextStates);
const buttonStatesMap = new Map<string, ButtonState>();
const buttonNextStatesMap = new Map<string, string>();
if (useButtonStates) {
  for (const buttonState of content.sequencePanel.buttonStates!) {
    buttonStatesMap.set(buttonState.id, buttonState);
  }
  for (const buttonNextState of content.sequencePanel.buttonNextStates!) {
    buttonNextStatesMap.set(buttonNextState.buttonId, buttonNextState.nextStateId);
  }
}


const Sequences = () => {

  const [selectedAction, setSelectedAction] = useState<ButtonAction | null>(null);

  const [activeButtonState, setActiveButtonState] = useState<string>(
    useButtonStates ? content.sequencePanel.buttonStates![0]!.id : ''
  );

  // Whether spinner is showing
  const [showLoading, setShowLoading] = useState<boolean>(false);

  const spinnerTimerRef = useRef<NodeJS.Timeout>(null);

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      const task = tasksMap.get(buttonContent.taskId)!;
      setSelectedAction({
        kind: 'task',
        badgeColor: buttonContent.variant.replace('outline-', ''),
        actionId: buttonContent.taskId,
        actionTitle: (task.title ? task.title : task.id)
      });
      setShowLoading(true);
      await runAction('task', buttonContent.taskId);
    } else if (buttonContent.sequenceId) {
      const sequence = sequencesMap.get(buttonContent.sequenceId)!;
      setSelectedAction({
        kind: 'sequence',
        badgeColor: buttonContent.variant.replace('outline-', ''),
        actionId: buttonContent.sequenceId,
        actionTitle: (sequence.title ? sequence.title : sequence.id)
      });
      setShowLoading(true);
      await runAction('sequence', buttonContent.sequenceId);
    }
    setActiveButtonState(buttonNextStatesMap.get(buttonContent.id)!);

    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current);
    }
    spinnerTimerRef.current = setTimeout(() => {
      setShowLoading(false);
    }, 500);
  };

  const buttonData: TileButtonProps[] = content.sequencePanel.buttons.map((buttonContent: TileButtonContent) => ({
    title: buttonContent.title,
    iconName: buttonContent.iconName,
    variant: buttonContent.variant,
    callback: () => selectButton(buttonContent),
    disabled: (useButtonStates && !(buttonStatesMap.get(activeButtonState)!.selectableIds.includes(buttonContent.id)))
  }));

  return (
    <ButtonPanel buttonPropsArray={buttonData}>
      {useButtonStates && <>
        <h5>
          <Badge bg={'primary'} className={'me-2'}>STATE</Badge>
        </h5>
        <Alert variant={'light'}>
          {buttonStatesMap.get(activeButtonState)!.title}
        </Alert>
      </>}
      {selectedAction && <>
        <h5>
          <Badge bg={selectedAction.badgeColor} className={'me-2'}>{selectedAction.kind.toUpperCase()}</Badge>
          {showLoading ?
            <Spinner animation={'border'} size={'sm'} variant={'info'}/> :
            <i className="bi bi-check-lg" style={{color: '#00ae10'}}></i>}
        </h5>
        <Alert variant={'light'}>
          {selectedAction.actionTitle}
        </Alert>
      </>}
    </ButtonPanel>
  );
}

export default memo(Sequences);