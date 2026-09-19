// The one import path the app uses for the H2 occupational hygiene exposure
// engine (noise, chemical, heat). The engine is vendored unchanged from
// Petrolord/petrolord-engines (see packages/engines/VENDOR.json); never edit
// it here.
export * from '../../../packages/engines/engines/hse/exposure.js';
