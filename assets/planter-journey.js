import {icon,esc} from './icons.js?v=20261027-web-r2';
import {state,persist} from './store.js?v=20261027-web-r2';
import {showModal} from './ui.js?v=20261027-web-r2';

// Visible design summaries accompany the user-provided illustrations.
export const planterStages=[
 {id:'modules',title:'电路模块分布图',short:'模块分布',image:'modules.jpg',copy:'先把花盆方案拆成主控、电源、传感采集、TFT 显示、通信和交互等功能。按照功能分组，先看清各模块负责什么，再整理它们之间的连接。'},
 {id:'connections',title:'电路模块接线图',short:'模块接线',image:'connections.jpg',copy:'接下来梳理电源与信号的走向，把传感输入、屏幕和通信接口连接到主控。下图展示模块接线关系，具体引脚还需与最终原理图核对。'},
 {id:'schematic',title:'电路原理图',short:'原理图',image:'schematic.png',copy:'再把模块关系展开为主控、电源、下载调试及外设接口电路。可以放大查看图中的器件与网络标注，逐项核对供电和信号连接。'},
 {id:'pcb-layout',title:'PCB布局布线',short:'PCB 布线',image:'pcb-layout.png',copy:'然后查看器件落位与 PCB 走线，重点关注接口位置、供电路径和信号连接。制造前还需完成电气、间距与结构配合检查。'},
 {id:'pcb-3d',title:'PCB 3D预览',short:'3D 预览',image:'pcb-3d.png',copy:'最后从三维视角查看电路板、接口和器件的相对位置，便于后续核对装配空间。方案图已整理，可以在对话中回看。接下来添加模块、确认连线，再填写交付需求与报价。'}
];
const timers=new Map();
let editorHooks={};
function notify(flow){persist();if(state.page==='editor'&&state.flowId===flow.id)editorHooks.renderEditor?.();}
function schedule(flow){
 const journey=flow.planterJourney;
 if(!journey||journey.status!=='running'||timers.has(flow.id))return;
 flow.busy='planter';
 timers.set(flow.id,setTimeout(()=>{
  timers.delete(flow.id);
  const current=state.flows[flow.id],j=current?.planterJourney;
  if(!j||j.runId!==journey.runId||j.status!=='running')return;
  if(state.page!=='editor'||state.flowId!==flow.id){j.status='paused';current.busy=null;persist();return;}
  const index=j.completed,stage=planterStages[index];
  if(!stage)return;
  j.completed+=1;if(!j.manual)j.active=index;
  current.messages.push({role:'assistant',kind:'planter-stage',stage:index,text:stage.copy});
  if(j.completed===planterStages.length){j.status='complete';current.busy=null;current.plan=true;current.stage='plan';}
  current.updatedAt=Date.now();notify(current);schedule(current);
  document.getElementById('chat-body')?.scrollTo({top:100000,behavior:'smooth'});
 },1700));
}
export function startPlanterJourney(flow,hooks){
 stopPlanterJourney(flow);editorHooks=hooks;
 flow.planterJourney={runId:Date.now().toString(36),completed:0,active:0,status:'running',manual:false};
 flow.busy='planter';
 flow.messages.push({role:'assistant',text:'我会先梳理花盆的功能与模块，再依次呈现接线、原理图、PCB 布线和三维预览。我会把每一步的说明和对应图片发在对话里，方便一起查看。'});
 notify(flow);schedule(flow);
}
export function stopPlanterJourney(flow){clearTimeout(timers.get(flow.id));timers.delete(flow.id);if(flow.busy==='planter')flow.busy=null;}
export function syncPlanterJourney(flow,hooks){
 editorHooks=hooks;
 for(const [id,timer] of timers){if(id!==flow?.id){clearTimeout(timer);timers.delete(id);const old=state.flows[id];if(old?.planterJourney?.status==='running'){old.planterJourney.status='paused';old.busy=null;persist();}}}
 if(flow?.planterJourney?.status==='running')schedule(flow);
}
export function planterThinking(flow){const j=flow.planterJourney;return j?.status==='running'?'正在整理'+planterStages[Math.min(j.completed,4)].title+'…':'正在整理方案…';}
export function planterStageMessage(message){
 const stage=planterStages[message.stage];if(!stage)return '';
 return `<div class="planter-stage-copy"><strong>${esc(stage.title)}</strong><p>${esc(stage.copy)}</p><div class="planter-chat-image-wrap"><button type="button" class="planter-chat-image" data-planter-enlarge="${message.stage}" aria-label="放大查看${esc(stage.title)}"><img data-planter-image src="assets/planter-stages/${stage.image}" alt="${esc(stage.title)}，智能花盆方案图示" decoding="async" width="520" height="350"><span>${icon('external',14)}放大查看</span></button><div class="planter-image-error" hidden><p>图片暂时无法加载</p><button class="text-button" data-planter-retry="${message.stage}">重新加载</button></div></div></div>`;
}
export function planterProgress(flow){
 const j=flow.planterJourney;if(!j||j.status==='complete')return '';
 return `<div class="planter-chat-progress"><span>${j.completed} / ${planterStages.length} 张方案图${j.status==='paused'?' · 已暂停':''}</span><button type="button" class="text-button" data-planter-action="${j.status==='running'?'pause':'resume'}">${j.status==='running'?'暂停':'继续呈现'}</button></div>`;
}
function enlarge(stage){
 showModal(`<div class="planter-image-modal"><div class="modal-heading"><h2 id="dialog-title">${esc(stage.title)}</h2><button class="icon-button" data-close aria-label="关闭方案图">${icon('close',18)}</button></div><div class="planter-image-scroll"><img src="assets/planter-stages/${stage.image}" alt="${esc(stage.title)}，花盆方案图示"></div></div>`,'planter-image-dialog');
}
function gallery(flow,index){
 const count=flow.planterJourney?.completed||0;if(!count)return;
 index=Math.max(0,Math.min(index,count-1));const stage=planterStages[index];
 showModal(`<div class="planter-image-modal planter-gallery"><div class="modal-heading"><h2 id="dialog-title">方案图</h2><button class="icon-button" data-close aria-label="关闭方案图">${icon('close',18)}</button></div><div class="planter-gallery-tabs" role="tablist" aria-label="方案图阶段">${planterStages.map((s,i)=>`<button type="button" role="tab" id="gallery-tab-${i}" aria-controls="gallery-image" aria-selected="${i===index}" tabindex="${i===index?0:-1}" data-planter-gallery-stage="${i}" ${i>=count?'disabled':''}>${esc(s.short)}</button>`).join('')}</div><div id="gallery-image" class="planter-gallery-image" role="tabpanel" aria-labelledby="gallery-tab-${index}"><img src="assets/planter-stages/${stage.image}" alt="${esc(stage.title)}，智能花盆方案图示"></div><div class="planter-gallery-footer"><span>${esc(stage.title)} · ${index+1} / ${count}</span><button class="text-button" data-planter-enlarge="${index}">放大查看${icon('external',14)}</button></div></div>`,'planter-image-dialog');
}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-planter-enlarge],[data-planter-retry],[data-planter-action],[data-planter-gallery],[data-planter-gallery-stage]');if(!b||b.disabled)return;
 if(b.hasAttribute('data-planter-gallery')){const flow=state.flows[state.flowId];if(flow)gallery(flow,0);return;}
 if(b.hasAttribute('data-planter-gallery-stage')){const index=Number(b.dataset.planterGalleryStage);gallery(state.flows[state.flowId],index);document.getElementById('gallery-tab-'+index)?.focus();return;}
 if(b.hasAttribute('data-planter-enlarge')){const stage=planterStages[Number(b.dataset.planterEnlarge)];if(stage)enlarge(stage);return;}
 if(b.hasAttribute('data-planter-retry')){const wrap=b.closest('.planter-chat-image-wrap'),image=wrap.querySelector('img');wrap.querySelector('.planter-image-error').hidden=true;wrap.querySelector('.planter-chat-image').hidden=false;image.src='assets/planter-stages/'+planterStages[Number(b.dataset.planterRetry)].image+'?retry='+Date.now();return;}
 const flow=state.flows[state.flowId],j=flow?.planterJourney;if(!j)return;
 if(b.dataset.planterAction==='pause'){stopPlanterJourney(flow);j.status='paused';notify(flow);}
 if(b.dataset.planterAction==='resume'){j.status='running';flow.busy='planter';notify(flow);schedule(flow);}
});
document.addEventListener('error',event=>{const image=event.target;if(!image.matches?.('[data-planter-image]'))return;const wrap=image.closest('.planter-chat-image-wrap');if(!wrap)return;wrap.querySelector('.planter-chat-image').hidden=true;wrap.querySelector('.planter-image-error').hidden=false;},true);

document.addEventListener('keydown',event=>{
 const tab=event.target.closest('[data-planter-gallery-stage]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 const flow=state.flows[state.flowId],count=flow?.planterJourney?.completed;if(!count)return;
 event.preventDefault();const i=Number(tab.dataset.planterGalleryStage),next=event.key==='Home'?0:event.key==='End'?count-1:(i+(event.key==='ArrowRight'?1:-1)+count)%count;
 gallery(flow,next);document.getElementById('gallery-tab-'+next)?.focus();
});
