export function readLocal<T>(key:string,fallback:T):T{if(typeof window==='undefined')return fallback;try{return JSON.parse(localStorage.getItem(key)||'') as T}catch{return fallback}}
export function writeLocal<T>(key:string,value:T){if(typeof window!=='undefined')localStorage.setItem(key,JSON.stringify(value))}
export const keys={knowledge:'relationship_knowledge_items',cases:'relationship_cases',settings:'relationship_settings'};
