import {memo, useEffect, useState} from "react";
import Badge from 'react-bootstrap/Badge';

import ButtonPanel from "@/components/ButtonPanel.tsx";
import type {TileButtonProps} from "@/components/ButtonPanel.tsx";

import content from '@/utils/content.ts';
import {firstLetterCaps} from '@/utils/utils.ts';
import type {ButtonNextState, ButtonState, TileButtonContent} from "@/data/schema.ts";
import type {Variant} from "react-bootstrap/types";
import type {ActionRequest, ActionRequestKind} from "@/types/api.ts";
import {runAction} from "@/utils/utils.ts";


interface ButtonAction {
  kind: ActionRequestKind;
  badgeColor: Variant;
  actionId: string;
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

  const selectButton = async (buttonContent: TileButtonContent) => {
    if (buttonContent.taskId) {
      setSelectedAction({
        kind: 'task',
        badgeColor: buttonContent.variant.replace('outline-', ''),
        actionId: buttonContent.taskId
      });
      await runAction('task', buttonContent.taskId);
    } else if (buttonContent.sequenceId) {
      setSelectedAction({
        kind: 'sequence',
        badgeColor: buttonContent.variant.replace('outline-', ''),
        actionId: buttonContent.sequenceId
      });
      await runAction('sequence', buttonContent.sequenceId);
    }
    setActiveButtonState(buttonNextStatesMap.get(buttonContent.id)!);
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
        <strong>Selection State: </strong> <br/>
        <Badge bg={'primary'}>{buttonStatesMap.get(activeButtonState)!.title}</Badge> <br/>
      </>}
      <strong>Action: </strong>{selectedAction && firstLetterCaps(selectedAction.kind)} <br/>
      {selectedAction && <Badge bg={selectedAction.badgeColor}>{selectedAction.actionId}</Badge>}
    </ButtonPanel>
  );
}

export default memo(Sequences);