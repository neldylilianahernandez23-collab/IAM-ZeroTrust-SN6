// tracer.js
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const sdk = new NodeSDK({
  serviceName: 'iam-zero-trust-backend',
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();

console.log('📡 Módulo de trazabilidad y monitoreo (OpenTelemetry) inicializado.');