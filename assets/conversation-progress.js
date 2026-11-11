const tickCount=41;
export function conversationProgress(){
 return `<div class="conversation-progress" id="conversation-progress" data-conversation-progress role="scrollbar" tabindex="0" aria-label="对话位置" aria-controls="chat-body" aria-orientation="vertical" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><div class="conversation-progress-ticks" aria-hidden="true">${Array.from({length:tickCount},()=>'<i></i>').join('')}</div></div>`;
}
// This is a reading-position control, never a percentage of engineering work done.
export function mountConversationProgress(root){
 const chat=root?.querySelector('#chat-body'),rail=root?.querySelector('[data-conversation-progress]');
 if(!chat||!rail)return ()=>{};
 const ticks=[...rail.querySelectorAll('i')];
 const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 function update(){
  const maximum=Math.max(0,chat.scrollHeight-chat.clientHeight);
  const ratio=maximum?Math.max(0,Math.min(1,chat.scrollTop/maximum)):0;
  const current=Math.round(ratio*(ticks.length-1));
  rail.hidden=!chat.querySelector('[data-message-index]');
  rail.setAttribute('aria-disabled',String(!maximum));rail.tabIndex=maximum?0:-1;
  rail.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
  ticks.forEach((tick,index)=>{
   const distance=Math.abs(index-current);
   tick.classList.toggle('is-current',index===current);
   tick.style.setProperty('--tick-width',`${distance<4?22-distance*4:7}px`);
   tick.style.setProperty('--tick-opacity',String(distance<4?1-distance*.16:.3));
  });
 }
 function move(top){
  const next=Math.max(0,Math.min(top,Math.max(0,chat.scrollHeight-chat.clientHeight)));
  chat.scrollTo({top:next,behavior:reduced()?'auto':'smooth'});
 }
 function click(event){
  if(rail.getAttribute('aria-disabled')==='true')return;
  const bounds=rail.querySelector('.conversation-progress-ticks').getBoundingClientRect();
  move((event.clientY-bounds.top)/Math.max(1,bounds.height)*(chat.scrollHeight-chat.clientHeight));
 }
 function keydown(event){
  const targets={ArrowDown:chat.scrollTop+80,ArrowUp:chat.scrollTop-80,PageDown:chat.scrollTop+chat.clientHeight*.85,PageUp:chat.scrollTop-chat.clientHeight*.85,Home:0,End:chat.scrollHeight};
  if(!(event.key in targets)||rail.getAttribute('aria-disabled')==='true')return;
  event.preventDefault();move(targets[event.key]);
 }
 rail.addEventListener('click',click);rail.addEventListener('keydown',keydown);
 chat.addEventListener('scroll',update,{passive:true});chat.addEventListener('load',update,true);
 const observer=typeof ResizeObserver==='function'?new ResizeObserver(update):null;
 observer?.observe(chat);chat.querySelectorAll('[data-message-index]').forEach(message=>observer?.observe(message));
 update();
 return ()=>{observer?.disconnect();rail.removeEventListener('click',click);rail.removeEventListener('keydown',keydown);chat.removeEventListener('scroll',update);chat.removeEventListener('load',update,true);};
}
