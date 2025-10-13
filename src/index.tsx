import { serve } from "bun";
import Ajv, {type JSONSchemaType} from "ajv";
import mqtt from 'mqtt';

import index from "./index.html";
import content, {taskIds, sequenceIds} from '@/utils/content.ts';
import type {ActionRequest} from "@/types/api.ts";
import {mqttHost, mqttPort} from "@/config.ts";


console.log(`Connecting to MQTT broker ${mqttHost}:${mqttPort}...`);
const mqttClient = mqtt.connect({
  host: mqttHost,
  port: mqttPort
});
console.log('Connected to broker.')

const actionRequestSchema: JSONSchemaType<ActionRequest> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['task', 'sequence']
    },
    id: {type: 'string'}
  },
  required: ['kind', 'id'],
  additionalProperties: false
}

const ajv = new Ajv();

const validateActionRequest = ajv.compile(actionRequestSchema);

const runTask = async (id: string) => {
  const foundTask = content.tasks.find(task => task.id === id);
  if (foundTask) {
    if (foundTask.taskType === 'mqtt') {
      console.log(` [TASK] (MQTT) ${foundTask.id}: Publishing command '${foundTask.command}' to topic '${foundTask.topic}'`);
      mqttClient.publish(foundTask.topic, foundTask.command);
    } else if (foundTask.taskType === 'commandLine') {
      console.log(` [TASK] (CLI) ${foundTask.id}: Executing command '${foundTask.command}'`);
    }
  } else {
    throw new RangeError(`Invalid task id '${id}'`);
  }
};

const runSequence = async (id: string) => {
  const foundSequence = content.sequences.find(sequence => sequence.id === id);
  if (foundSequence) {
    console.log(` [SEQ]  Running ${foundSequence.id}`);
    for (const taskId of foundSequence.taskIds) {
      await runTask(taskId);
    }
  } else {
    throw new RangeError(`Invalid sequence id '${id}'`);
  }
};

const runAction = async (actionRequest: ActionRequest) => {
  if (actionRequest.kind === 'task') {
    await runTask(actionRequest.id);
  } else if (actionRequest.kind === 'sequence') {
    await runSequence(actionRequest.id);
  }
};

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/action": {
      async PUT(req: Bun.BunRequest<"/api/action">) {
        const data = await req.json();
        if (data) {
          if (!validateActionRequest(data)) {
            return Response.json({
              error: "Invalid action request"
            }, {status: 400});
          }
        }
        const actionRequest: ActionRequest = data;
        try {
          await runAction(actionRequest);
        } catch (error) {
          // Only send client error message if range error
          if (error instanceof RangeError) {
            console.error(`Invalid action request: ${error}`);
            return Response.json({
              error: `Invalid action request: ${error.message}`
            }, {status: 400});
          } else {
            console.error(error);
            return Response.json({
              error: `Internal server error - oopsie!`
            }, {status: 500});
          }
        }
        return Response.json({
          message: `Executed action '${actionRequest.id}'`,
        });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
