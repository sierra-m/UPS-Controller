export type ActionRequestKind = 'task' | 'sequence';

export interface ActionRequest {
  kind: ActionRequestKind;
  id: string;
}

export interface NamesResponse {
  names: string[];
}