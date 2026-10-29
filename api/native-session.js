// Standalone Vercel Web Handler: raw Request stream, no request.body helper/parser.
// https://vercel.com/kb/guide/how-to-enable-cors#standalone-vercel-functions
import { createWebHandler } from './_native-adapter.js';
const handle=createWebHandler();
export const POST=handle;
export const OPTIONS=handle;
export const GET=handle;
export const PUT=handle;
export const PATCH=handle;
export const DELETE=handle;
export const HEAD=handle;
