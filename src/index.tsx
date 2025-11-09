import { serve } from "bun";
import Ajv, {type JSONSchemaType} from "ajv";
import mqtt from 'mqtt';
import {setTimeout} from 'node:timers/promises';

import index from "./index.html";
import content, {taskIds, sequenceIds} from '@/utils/content.ts';
import type {ActionRequest, NamesResponse} from "@/types/api.ts";
import {mqttHost, mqttPort, mqttUsername, mqttPassword, mqttRequestTimeout} from "@/config.ts";


console.log(`Connecting to MQTT broker ${mqttHost}:${mqttPort}...`);
const mqttClient = mqtt.connect({
  host: mqttHost,
  port: mqttPort,
  username: mqttUsername,
  password: mqttPassword,
  clientId: "ups-controller"
});

let connectedMqttNames: string[] = [];

mqttClient.on('connect', () => {
  console.log('Connected to broker.');
  mqttClient.subscribe('robots/rsp');
});

mqttClient.on('message', (topic, payload) => {
  if (topic === 'robots/rsp') {
    const message = payload.toString();
    const found = message.match(/name=(\w+)/);
    if (found && found.length > 1 && found[1]) {
      connectedMqttNames.push(found[1]);
    }
  }
});

const actionRequestSchema: JSONSchemaType<ActionRequest> = {
  type: 'object',
  properties: {
    kind: {
      type: 'string',
      enum: ['task', 'sequence']
    },
    id: {type: 'string'},
    clientIds: {
      type: "array",
      items: {
        type: "string"
      },
      nullable: true
    }
  },
  required: ['kind', 'id'],
  additionalProperties: false
}

const ajv = new Ajv();

const validateActionRequest = ajv.compile(actionRequestSchema);

const runTask = async (id: string, clientIds: string[] = []) => {
  const foundTask = content.tasks.find(task => task.id === id);
  if (foundTask) {
    if (foundTask.taskType === 'mqtt') {
      if (clientIds.length > 0 && foundTask.clientTopic != null) {
        const topicNames = clientIds.map(name => foundTask.clientTopic!.replace('{id}', name));
        console.log(` [TASK] (MQTT) ${foundTask.id}: Publishing command '${foundTask.command}' to topics [${topicNames.join(', ')}]`);
        for (const topicName of topicNames) {
          mqttClient.publish(topicName, foundTask.command);
        }
      } else {
        console.log(` [TASK] (MQTT) ${foundTask.id}: Publishing command '${foundTask.command}' to topic '${foundTask.topic}'`);
        mqttClient.publish(foundTask.topic, foundTask.command);
      }
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
    await runTask(actionRequest.id, actionRequest.clientIds ? actionRequest.clientIds : []);
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
    '/api/names': async req => {
      connectedMqttNames = [];
      mqttClient.publish('robots/req', 'name');
      await setTimeout(mqttRequestTimeout);
      const resp: NamesResponse = {
        names: connectedMqttNames
      };
      return Response.json(resp);
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
  port: 80,
  hostname: "0.0.0.0"
});

console.log(`🚀 Server running at ${server.url}`);
