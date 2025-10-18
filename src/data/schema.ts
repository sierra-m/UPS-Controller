import type {ButtonVariant} from "react-bootstrap/types";

export interface ButtonState {
  id: string;
  title: string;
  selectableIds: string[];
}

export interface ButtonNextState {
  buttonId: string;
  nextStateId: string;
}

export interface MQTTCommandTask {
  taskType: 'mqtt';
  id: string;
  title?: string;
  topic: string;
  command: string;
}

export interface CommandLineTask {
  taskType: 'commandLine';
  id: string;
  title?: string;
  command: string;
}

export type ControlTask = MQTTCommandTask | CommandLineTask;

export interface ControlSequence {
  id: string;
  taskIds: string[];
}

export interface TileButtonContent {
  id: string;
  title: string;
  iconName: string;
  variant: ButtonVariant;
  taskId?: string;
  sequenceId?: string;
}

export interface SequencePanelContent {
  buttons: TileButtonContent[];
  buttonStates?: ButtonState[];
  buttonNextStates?: ButtonNextState[];
}

export interface RobotsPanelContent {
  buttons: TileButtonContent[];
}

export interface ControlPanelContent {
  sequencePanel: SequencePanelContent;
  robotsPanel: RobotsPanelContent;
  tasks: ControlTask[];
  sequences: ControlSequence[];
}
