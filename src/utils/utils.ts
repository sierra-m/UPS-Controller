import type {ActionRequestKind, ActionRequest} from "@/types/api.ts";

export const firstLetterCaps = (text: string) => {
  if (text && (text.length > 1)) {
    return text[0]!.toUpperCase() + text.slice(1);
  }
  return '';
};

export const runAction = async (kind: ActionRequestKind, id: string, clientIds: string[] = []) => {
  try {
    const req: ActionRequest = {
      kind: kind,
      id: id
    };
    if (clientIds.length > 0) {
      req.clientIds = clientIds;
    }
    const response = await fetch('/api/action', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req)
    });
    if (!response.ok) {
      console.error(`API error running action ${id}: ${response}`);
      return;
    }
    const data = await response.json();
    if ('message' in data) {
      console.log(` [API] ${data.message}`);
    }
  } catch (error) {
    console.error(error);
  }
};

export const delay = (milliseconds: number) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};