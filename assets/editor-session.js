import {state,persist,consumeNewFlowFlag,persistedFlowSnapshot} from './store.js?v=20261029-structure-r2';
const sessionKey='weibo-editor-entry-v1',storageKey='weibo-stack-prototype-v2';
let entry=null;
const copy=value=>value===undefined?undefined:structuredClone(value);
export function beginEditorSession(flow){
 if(!flow||entry?.id===flow.id)return;
 const ordered=state.orders.some(order=>order.flowId===flow.id);
 try{const saved=JSON.parse(sessionStorage.getItem(sessionKey)||'null');if(saved?.id===flow.id&&!(saved.isNew&&ordered)&&saved.flow?.id===flow.id&&typeof saved.isNew==='boolean'){entry=saved;return;}}catch{}
 entry={id:flow.id,isNew:consumeNewFlowFlag(flow.id)&&!ordered,flow:copy(flow),project:copy(state.projects.find(p=>(p.flowId||p.id)===flow.id))};
 try{sessionStorage.setItem(sessionKey,JSON.stringify(entry));}catch{}
}
export function editorSessionIsNew(){return entry?.isNew===true;}
export function finishEditorSession(id){if(entry?.id===id)entry=null;try{if(JSON.parse(sessionStorage.getItem(sessionKey)||'null')?.id===id)sessionStorage.removeItem(sessionKey);}catch{}}
export function discardEditorSession(flow){
 if(!entry||entry.id!==flow?.id)return {ok:false,reason:'missing'};
 let raw=null,latest={};try{raw=localStorage.getItem(storageKey);latest=JSON.parse(raw||'{}')||{};}catch{}
 // Do not overwrite a newer version saved by another window.
 if((Array.isArray(latest.deletedProjectIds)?latest.deletedProjectIds:[]).includes(flow.id)||JSON.stringify(latest.flows?.[flow.id])!==JSON.stringify(persistedFlowSnapshot(flow.id)))return {ok:false,reason:'conflict'};
 const previous={flow:copy(flow),projects:copy(state.projects),deleted:[...state.deletedProjectIds],flowId:state.flowId};
 const remove=entry.isNew&&!state.orders.some(order=>order.flowId===flow.id);
 if(remove){
  delete state.flows[flow.id];state.projects=state.projects.filter(p=>(p.flowId||p.id)!==flow.id);
  state.deletedProjectIds=[...new Set([...state.deletedProjectIds,flow.id])];state.flowId='';
 }else{
  const restored=copy(entry.flow);restored.busy=null;delete restored.pendingPin;
  for(const field of ['productJourney','planterJourney'])if(restored[field]){if(restored[field].status==='running')restored[field].status='paused';if(restored[field].autoContinue)restored[field].autoContinue.status='cancelled';}
  // An order already created during this edit is a committed record.
  for(const key of ['lastOrderId','lastOrderToken','checkoutToken'])if(flow[key])restored[key]=flow[key];
  state.flows[flow.id]=restored;
  if(entry.project)state.projects=state.projects.map(p=>(p.flowId||p.id)===flow.id?copy(entry.project):p);
 }
 if(!persist()){
  state.flows[flow.id]=previous.flow;state.projects=previous.projects;state.deletedProjectIds=previous.deleted;state.flowId=previous.flowId;
  // persist can write disk before a session-storage failure; restore that disk value too.
  try{if(raw===null)localStorage.removeItem(storageKey);else localStorage.setItem(storageKey,raw);}catch{}
  return {ok:false,reason:'storage'};
 }
 finishEditorSession(flow.id);return {ok:true,removed:remove};
}
