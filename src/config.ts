export const mqttHost = process.env.MQTT_HOST || 'localhost';
export const mqttPort = process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : 1883;
export const mqttUsername = process.env.MQTT_USERNAME || '';
export const mqttPassword = process.env.MQTT_PASSWORD || '';