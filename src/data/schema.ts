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

export type TaskType = 'mqtt' | 'commandLine' | 'osc';

export interface MQTTCommandTask {
  taskType: 'mqtt';
  id: string;
  title?: string;
  topic: string;
  clientTopic?: string;
  command: string;
}

export interface CommandLineTask {
  taskType: 'commandLine';
  id: string;
  title?: string;
  command: string;
}

export interface OSCTask {
  taskType: 'osc';
  id: string;
  title?: string;
  address: string;
  value: number;
}

export type ControlTask = MQTTCommandTask | CommandLineTask | OSCTask;

export interface ControlSequence {
  id: string;
  title?: string;
  taskIds: string[];
  mqttClients?: string[];
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

export interface MusicPanelContent {
  buttons: TileButtonContent[];
}

export interface LightingPanelContent {
  buttons: TileButtonContent[];
}

export interface ControlPanelContent {
  sequencePanel: SequencePanelContent;
  robotsPanel: RobotsPanelContent;
  musicPanel: MusicPanelContent;
  lightingPanel: LightingPanelContent;
  tasks: ControlTask[];
  sequences: ControlSequence[];
}
