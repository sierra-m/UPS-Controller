import {Ajv} from "ajv";
import {type ControlPanelContent} from "@/data/schema.ts";
import schema from "@/data/schema.json";
import content from '@/data/content.yaml';


const assert = (result: boolean, message: string) => {
  if (!result) {
    console.error(message);
  }
}

const ajv = new Ajv();
const validate = ajv.compile<ControlPanelContent>(schema);

// Validate user content with JSONSchema
if (!validate(content)) {
  console.error(`YAML data is invalid:`, validate.errors);
}

const isUnique = <T>(array: T[]): boolean => {
  const arraySet = new Set(array);
  return arraySet.size === array.length;
}

// Validate ID existence and uniqueness

export const taskIds = content.tasks.map((task) => task.id);

assert(isUnique<string>(taskIds), "Task IDs must be unique.");
assert(taskIds.every((id) => id.startsWith('task_')), "Task IDs must be prefixed with 'task_'");

export const sequenceIds = content.sequences.map((sequence) => sequence.id);

assert(isUnique<string>(sequenceIds), "Sequence IDs must be unique.");
assert(
  sequenceIds.every((id) => id.startsWith('sequence_')),
  "Sequence IDs must be prefixed with 'sequence_'"
);

for (const sequence of content.sequences) {
  for (const taskId of sequence.taskIds) {
    assert(taskIds.includes(taskId), `Task ID '${taskId}' in sequence '${sequence.id}' not defined.`);
  }
}

const sequenceButtonIds = content.sequencePanel.buttons.map((button) => button.id);

const buttonIds = sequenceButtonIds;

assert(isUnique<string>(buttonIds), "Button IDs must be unique.");
assert(
  buttonIds.every((id) => id.startsWith('button_')),
  "Button IDs must be prefixed with 'button_'"
);

for (const button of content.sequencePanel.buttons) {
  if (button.taskId) {
    assert(
      taskIds.includes(button.taskId),
      `Task ID '${button.taskId}' in button '${button.id}' is not defined.`
    );
  }
  if (button.sequenceId) {
    assert(
      sequenceIds.includes(button.sequenceId),
      `Sequence ID '${button.sequenceId}' in button '${button.id}' is not defined.`
    );
  }
}

if (content.sequencePanel.buttonStates && content.sequencePanel.buttonNextStates) {
  const buttonStateIds = content.sequencePanel.buttonStates.map((buttonState) => buttonState.id);

  assert(isUnique<string>(buttonStateIds), "Button state IDs must be unique.");
  assert(
    buttonStateIds.every((id) => id.startsWith('state_')),
    "State IDs must be prefixed with 'state_'"
  );

  for (const buttonState of content.sequencePanel.buttonStates) {
    for (const buttonId of buttonState.selectableIds) {
      assert(
        sequenceButtonIds.includes(buttonId),
        `SequencePanel button ID '${buttonId}' in buttonState '${buttonState.id}' is not defined.`
      );
    }
  }

  for (const [index, buttonNextState] of content.sequencePanel.buttonNextStates.entries()) {
    assert(
      sequenceButtonIds.includes(buttonNextState.buttonId),
      `SequencePanel button ID '${buttonNextState.buttonId}' in buttonNextState[${index}] is not defined.`
    );
    assert(
      buttonStateIds.includes(buttonNextState.nextStateId),
      `SequencePanel nextStateId '${buttonNextState.nextStateId}' in buttonNextState[${index}] is not defined.`
    );
  }
}

export default content;