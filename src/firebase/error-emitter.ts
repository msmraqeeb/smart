import { EventEmitter } from 'events';

// This is a global event emitter for handling specific errors like Firestore permission errors.
export const errorEmitter = new EventEmitter();
