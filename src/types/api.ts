export type ActionRequestKind = 'task' | 'sequence';

export interface ActionRequest {
  kind: ActionRequestKind;
  id: string;
}
