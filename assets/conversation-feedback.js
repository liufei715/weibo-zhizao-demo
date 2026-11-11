// Feedback reflects UI work only; it never asserts hardware generation or validation.
const snapshots=new Map(),revealQueues=new Map();
let activeFlowId;
// Display timing is transient: saved messages remain complete and reloads show history.
export const messageRevealDelay=2200;
// Leave time to read the previous reply before presenting the next one.
export function messageReadingDelay(message){
 const text=message?.text||'';
 return Math.min(4800,Math.max(messageRevealDelay,text.length*35,['product-stage','planter-stage'].includes(message?.kind)?4000:0));
}
export function visibleMessageCount(flow){return revealQueues.get(flow.id)?.visible??(flow.messages?.length||0);}
export const lastMessageRevealTime=flow=>revealQueues.get(flow.id)?.lastShownAt??-Infinity;
export const hasPendingMessages=flow=>visibleMessageCount(flow)<(flow.messages?.length||0);
export function visibleProductStageCount(flow){
 const completed=(flow.productJourney||flow.planterJourney)?.completed||0;
 if(!hasPendingMessages(flow))return completed;
 return flow.messages.slice(visibleMessageCount(flow)).reduce((count,message)=>['product-stage','planter-stage'].includes(message.kind)?Math.min(count,message.stage):count,completed);
}
const messageSignature=messages=>JSON.stringify(messages);
export function clearMessageReveal(flowId){
 const queue=revealQueues.get(flowId);if(queue)clearTimeout(queue.timer);
 revealQueues.delete(flowId);
}
export function prepareMessageReveal(flow,onReveal){
 if(activeFlowId!==flow?.id){
  if(activeFlowId)clearMessageReveal(activeFlowId);
  activeFlowId=flow?.id;
 }
 if(!flow)return;
 const messages=flow.messages||[],count=messages.length;
 let queue=revealQueues.get(flow.id);
 // Storage merging can replace objects without changing their content.
 // Identity comparison would flush the queue and expose every pending reply.
 if(!queue||count<queue.observed||messageSignature(messages.slice(0,queue.observed))!==queue.signature){
  clearMessageReveal(flow.id);
  queue={visible:count,observed:count,signature:messageSignature(messages),timer:null,onReveal,lastShownAt:null};
  revealQueues.set(flow.id,queue);return;
 }
 queue.onReveal=onReveal;
 if(count>queue.observed){
  const wasPending=queue.visible<queue.observed;
  let userIndex=-1;
  for(let i=queue.observed;i<count;i++)if(messages[i].role==='user')userIndex=i;
  if(userIndex>=0){queue.visible=Math.max(queue.visible,userIndex+1);queue.lastShownAt=Date.now();clearTimeout(queue.timer);queue.timer=null;}
  // Separate notify calls must respect the same pacing as a single message burst.
  if(!wasPending&&userIndex<0&&(queue.lastShownAt===null||Date.now()-queue.lastShownAt>=messageReadingDelay(messages[queue.visible-1]))){queue.visible=Math.min(count,queue.visible+1);queue.lastShownAt=Date.now();}
  queue.observed=count;queue.signature=messageSignature(messages);
 }
 if(queue.visible>=count){clearTimeout(queue.timer);queue.timer=null;return;}
 if(queue.timer)return;
 queue.timer=setTimeout(()=>{
  queue.timer=null;
  if(activeFlowId!==flow.id||revealQueues.get(flow.id)!==queue)return;
  queue.visible=Math.min(queue.observed,queue.visible+1);
  queue.lastShownAt=Date.now();
  queue.onReveal?.();
 },Math.max(0,messageReadingDelay(messages[queue.visible-1])-(queue.lastShownAt===null?0:Date.now()-queue.lastShownAt)));
}
export function conversationState(flow){
 const journey=flow.productJourney||flow.planterJourney;
 if(flow.busy||hasPendingMessages(flow))return 'running';
 if(journey?.status==='paused')return 'paused';
 if(journey?.status?.startsWith('awaiting-'))return 'waiting';
 return flow.messages?.length?'ready':'idle';
}
export const activitySignal=()=>'<span class="feedback-signal" aria-hidden="true"><i></i><i></i><i></i><i></i></span>';
export const processingGraphic=()=>`<div class="feedback-circuit" aria-hidden="true"><svg viewBox="0 0 200 140" fill="none"><path class="feedback-trace" d="M20 30h45l20 20m-65 60h45l20-20m95-60h-45l-20 20m65 60h-45l-20-20M100 8v33m0 58v33M6 70h63m62 0h63"/><rect class="feedback-chip" x="73" y="43" width="54" height="54" rx="13"/><rect class="feedback-core" x="88" y="58" width="24" height="24" rx="6"/><g class="feedback-nodes"><circle cx="20" cy="30" r="3"/><circle cx="180" cy="30" r="3"/><circle cx="20" cy="110" r="3"/><circle cx="180" cy="110" r="3"/></g></svg><span class="feedback-orbit"></span></div>`;
// Keep entry animations out of persisted data and do not replay old replies on each render.
export function mountConversationFeedback(flow,root){
 if(!root)return;
 const state=conversationState(flow),journey=flow.productJourney||flow.planterJourney;
 root.dataset.feedbackState=state;
 const previous=snapshots.get(flow.id),count=visibleMessageCount(flow),completed=visibleProductStageCount(flow);
  if(previous&&count>previous.count){
   root.querySelectorAll('[data-message-index]').forEach(message=>{
    const index=Number(message.dataset.messageIndex);
    if(index>=previous.count){
     message.classList.add('feedback-message-arriving');
     message.style.setProperty('--feedback-arrival-delay','0ms');
    }
   });
  }
 if(previous&&completed>previous.completed&&flow.canvasStage===completed-1){
  root.querySelector('.product-canvas-image')?.classList.add('feedback-preview-arriving');
 }
 snapshots.delete(flow.id);snapshots.set(flow.id,{count,completed});
 if(snapshots.size>64)snapshots.delete(snapshots.keys().next().value);
}
