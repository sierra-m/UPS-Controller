export const mqttHost = process.env.MQTT_HOST || 'localhost';
export const mqttPort = process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : 1883;