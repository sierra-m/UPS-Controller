export type ActionRequestKind = 'task' | 'sequence';

export interface ActionRequest {
  kind: ActionRequestKind;
  id: string;
  clientIds?: string[];
}

export interface NamesResponse {
  names: string[];
}