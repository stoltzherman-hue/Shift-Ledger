/** Single source of truth for pricing. The browser never sets the amount. */
export const MODULES = ['shift', 'home', 'cur', 'road'];
export const MONTHLY = { 1: 49, 2: 79, all: 99 };
export function resolvePlan(modsParam) {
  let mods = String(modsParam || 'shift').split(',').map(s => s.trim()).filter(m => MODULES.includes(m));
  mods = [...new Set(mods)]; if (!mods.length) mods = ['shift'];
  const plan = mods.length >= 3 ? 'all' : mods.length;
  if (plan === 'all') mods = MODULES.slice();
  return { plan, mods };
}
export function price(plan, annual) { const m = MONTHLY[plan]; return (annual ? m * 10 : m).toFixed(2); }
export const LABEL = { 1: 'SlipSync — 1 module', 2: 'SlipSync — 2 modules', all: 'SlipSync All-Access' };
