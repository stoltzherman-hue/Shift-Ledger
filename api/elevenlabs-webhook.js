import { createWebhookHandler } from './_elevenlabs-webhook.js';
const handle=createWebhookHandler();
export const POST=handle;
export const GET=handle;
export const OPTIONS=handle;
export const PUT=handle;
export const PATCH=handle;
export const DELETE=handle;
export const HEAD=handle;
