import {memo, useEffect, useState} from "react";
import Badge from 'react-bootstrap/Badge';

import ButtonPanel from "@/components/ButtonPanel.tsx";
import type {TileButtonProps} from "@/components/ButtonPanel.tsx";

import content from '@/utils/content.ts';
import {firstLetterCaps} from '@/utils/utils.ts';
import type {ButtonNextState, ButtonState, TileButtonContent} from "@/data/schema.ts";
import type {Variant} from "react-bootstrap/types";
import type {ActionRequest, ActionRequestKind} from "@/types/api.ts";

enum ActiveSequence {
  NONE = "NONE",
  CHOOSE_WORKER = "CHOOSE_WORKER",
  CHOOSE_SCAB = "CHOOSE_SCAB",
  HELP_UNION = "HELP_UNION",
  REJECT_UNION = "REJECT_UNION",
  JOIN_UNION = "JOIN_UNION",
  DESTROY_UNION = "DESTROY_UNION"
}

enum ActivePhase {
  CHOOSE_SIDE = "CHOOSE_SIDE",
  SCAB_CHOICES = "SCAB_CHOICES",
  WORKER_CHOICES = "WORKER_CHOICES",
  END = "END"
}

const positiveSequences = [ActiveSequence.CHOOSE_WORKER, ActiveSequence.HELP_UNION, ActiveSequence.JOIN_UNION];

// Sequence options allowed per phase
const phaseSequenceOptions: Record<ActivePhase, ActiveSequence[]> = {
  [ActivePhase.CHOOSE_SIDE]: [ActiveSequence.CHOOSE_WORKER, ActiveSequence.CHOOSE_SCAB],
  [ActivePhase.WORKER_CHOICES]: [ActiveSequence.HELP_UNION, ActiveSequence.REJECT_UNION],
  [ActivePhase.SCAB_CHOICES]: [ActiveSequence.JOIN_UNION, ActiveSequence.DESTROY_UNION],
  [ActivePhase.END]: []
}

// Phase progression from each sequence chosen
const phaseProgression: Record<ActiveSequence, ActivePhase> = {
  [ActiveSequence.NONE]: ActivePhase.CHOOSE_SIDE,
  [ActiveSequence.CHOOSE_WORKER]: ActivePhase.WORKER_CHOICES,
  [ActiveSequence.CHOOSE_SCAB]: ActivePhase.SCAB_CHOICES,
  [ActiveSequence.HELP_UNION]: ActivePhase.END,
  [ActiveSequence.REJECT_UNION]: ActivePhase.END,
  [ActiveSequence.JOIN_UNION]: ActivePhase.END,
  [ActiveSequence.DESTROY_UNION]: ActivePhase.END
}

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

const runAction = async (kind: ActionRequestKind, id: string) => {
  try {
    const response = await fetch('/api/action', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({kind, id})
    });
    if (!response.ok) {
      console.error(`API error running action ${id}: ${response}`);
      return;
    }
    const data = await response.json();
    if ('message' in data) {
      console.log(` [API] ${data.message()}`);
    }
  } catch (error) {
    console.error(error);
  }
};

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
      <strong>Action: {selectedAction && firstLetterCaps(selectedAction.kind)}</strong> <br/>
      {selectedAction && <Badge bg={selectedAction.badgeColor}>{selectedAction.actionId}</Badge>}
    </ButtonPanel>
  );
}

export default memo(Sequences);