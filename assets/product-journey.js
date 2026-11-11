import {activitySignal,hasPendingMessages,visibleProductStageCount,lastMessageRevealTime} from './conversation-feedback.js?v=20261029-structure-r2';
import {translate} from './i18n.js?v=20261029-structure-r2';
import {icon,esc} from './icons.js?v=20261029-structure-r2';
import {state,persist} from './store.js?v=20261029-structure-r2';
import {showModal} from './ui.js?v=20261029-structure-r2';
import {modulesFor} from './workflow-data.js?v=20261029-structure-r2';
import {journeyConfig,productJourneys,stageActivities} from './product-journey-data.js?v=20261029-structure-r2';

// Visible summaries describe supplied project images; no generation or electrical validation is implied.
export const stageDelay=6600;
export const confirmationDelay=5000;
const timers=new Map(),countdowns=new Map();
let editorHooks={};
export const productJourneyFor=flow=>flow?.productJourney||flow?.planterJourney||null;
export const hasProductJourney=flow=>Boolean(journeyConfig(flow));
// Previously completed five-stage reviews already included the structure image.
// Split that saved review once, preserving quotation access and historical navigation.
export function upgradeProductJourney(flow){
 const j=productJourneyFor(flow);
 if(flow?.templateId!=='planter'||!j||j.stageLayout==='separate-structure')return false;
 j.stageLayout='separate-structure';
 const stages=productJourneys.planter.stages;
 for(const message of flow.messages||[])if(['product-stage','planter-stage'].includes(message.kind)&&message.stage===4)message.text=stages[4].copy;
 if(j.status==='complete'&&j.completed===5){
  flow.messages??=[];
  if(!flow.messages.some(message=>['product-stage','planter-stage'].includes(message.kind)&&message.stage===5))flow.messages.push({role:'assistant',kind:'product-stage',templateId:'planter',stage:5,text:stages[5].copy});
  j.completed=6;
  if(!Number.isInteger(flow.canvasStage)||flow.canvasStage===4)flow.canvasStage=5;
 }
 return true;
}

const stageAlt=(config,stage,page=0)=>`${config.name} · ${stage.imageLabels?.[page]||stage.title}${!stage.imageLabels&&stage.images.length>1?'，第 '+(page+1)+' 页':''}`;
const imageTag=(config,stage,page=0,preview=false)=>`<img ${preview?'data-product-image':'data-product-gallery-image'} src="${stage.images[page]}" alt="${esc(stageAlt(config,stage,page))}" decoding="async" ${preview?'width="520" height="350"':''}>`;
function notify(flow){
 persist();
 if(state.page==='editor'&&state.flowId===flow.id){
  editorHooks.renderEditor?.();
  const gallery=document.querySelector('[data-product-gallery-content]');
  if(gallery?.dataset.flowId===flow.id){const active=document.activeElement?.id;openGallery(flow,Number(gallery.dataset.stage),Number(gallery.dataset.page),gallery.dataset.zoom==='true');if(active)document.getElementById(active)?.focus({preventScroll:true});}
 }
}

export function pendingProductQuestion(flow){
 const j=productJourneyFor(flow);if(!j||![2,3].includes(j.version))return null;
 if(j.status==='awaiting-wiring')return {id:'wiring',text:'模块和器件已整理好。需要我继续展示后续方案资料吗？你也可以先告诉我想调整哪一部分。',confirm:'继续查看方案'};
 if(j.status==='awaiting-details')return {id:'details',text:flow.templateId==='planter'&&j.version===3?'原理图已展示。需要我继续依次展示 PCB 布局、PCBA 预览和花盆 3D 结构参考吗？看完后可以直接进入报价。你也可以先补充需要调整的部分。':flow.templateId==='planter'?'方案资料已展示。需要我接着查看 PCB 布局和三维预览吗？确认后可以直接进入报价。':'方案资料已整理。需要我继续展示原理图和产品参考图吗？确认后可以直接进入报价。',confirm:'继续查看方案'};
 return null;
}
function ask(flow,status){
 const j=productJourneyFor(flow);j.status=status;flow.busy=null;
 const question=pendingProductQuestion(flow);
 if(j.version===3){j.autoContinue={question:question.id,remaining:5,status:flow.chatDraft?.trim()?'cancelled':'active'};if(j.autoContinue.status==='active')countdown(flow);}
 flow.messages.push({role:'assistant',kind:'product-question',question:question.id,text:question.text});
}
export function answerProductQuestion(flow,text,{automatic=false}={}){
 const question=pendingProductQuestion(flow);if(!question)return false;
 cancelAutoContinue(flow,false);
 const answer=text.trim();
 const no=/(不要|不用|不需要|暂不|先不|不继续|don't|do not)/i.test(answer)||/^(暂不|暂时不|先不|不要|不用|不需要|不连|不继续|取消|稍后|等等|no\b|not now\b|later\b|cancel\b)/i.test(answer);
 const yes=/^(可以|好的|好[的啊呀]?|是[的]?|行|嗯|同意|确认|继续|开始|请继续|需要|帮我|连线|yes\b|ok(?:ay)?\b|sure\b|continue\b|start\b|go ahead\b)/i.test(answer);
 if(!yes||no){
  flow.messages.push({role:'assistant',text:no?'好的，我们先停在这里，当前方案图会保留。你可以告诉我想调整的功能；准备好后，再点击下方按钮继续。':'收到，你的补充已保留在对话中，当前参考图暂不改变。你想继续查看现有方案的话，请点击下方按钮；也可以先补充需要调整的部分。'});
  notify(flow);return true;
 }
 const j=productJourneyFor(flow);j.activity=0;
 if(automatic)flow.messages.push({role:'assistant',kind:'product-auto-continue',text:'倒计时结束，我会继续展示下一阶段参考资料；你可以随时暂停。'});
 if(question.id==='wiring'){
  flow.modules=modulesFor(flow).map(m=>m.id);flow.selectedItems=[...new Set([...flow.selectedItems,...flow.modules])];
  flow.plan=true;flow.wireSuggested=false;
  if(flow.templateId!=='planter'){
   flow.canvasContent='images';
   flow.messages.push({role:'assistant',kind:'product-acknowledgement',question:'wiring',text:'模块清单已准备好。接下来可以继续查看电路资料和产品参考图，完成后直接填写交付需求并查看报价。'});
   ask(flow,'awaiting-details');notify(flow);return true;
  }
 }
 flow.messages.push({role:'assistant',kind:'product-acknowledgement',question:question.id,text:'好的，我会继续按顺序展示方案资料，并说明每张图可以查看什么。资料整理完成后就进入报价；过程中你可以随时暂停或放大图片。'});
 j.status='running';flow.busy='product-images';flow.canvasContent='images';notify(flow);schedule(flow);return true;
}

function followChat(){document.getElementById('chat-body')?.scrollTo?.({top:100000,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
// Only one live timer per project/run; publishing a stage commits text and canvas together.
function schedule(flow){
 const journey=productJourneyFor(flow),config=journeyConfig(flow);
 if(!journey||!config||journey.status!=='running'||timers.has(flow.id))return;
 flow.busy='product-images';
 timers.set(flow.id,setTimeout(()=>{
  timers.delete(flow.id);
  const current=state.flows[flow.id],j=productJourneyFor(current),currentConfig=journeyConfig(current);
  if(!j||!currentConfig||j.runId!==journey.runId||j.status!=='running')return;
  if(state.page!=='editor'||state.flowId!==flow.id||document.hidden){j.status='paused';current.busy=null;persist();return;}
  if(hasPendingMessages(current)){schedule(current);return;}
  j.activity=(j.activity||0)+1;
  if(j.activity<3){const chat=document.getElementById('chat-body'),follow=!chat||chat.scrollHeight-chat.scrollTop-chat.clientHeight<64;notify(current);if(follow)followChat();schedule(current);return;}
  j.activity=0;
  const index=j.completed,stage=currentConfig.stages[index];
  if(!stage){j.status='complete';current.busy=null;persist();return;}
  j.completed+=1;
  current.messages.push({role:'assistant',kind:'product-stage',templateId:current.templateId,stage:index,text:stage.copy});
  current.canvasContent='images';current.canvasStage=index;
  if(j.completed===currentConfig.stages.length){j.status='complete';current.busy=null;current.plan=true;current.stage='plan';}
  else if([2,3].includes(j.version)&&j.completed===1)ask(current,'awaiting-wiring');
  else if(current.templateId==='planter'&&((j.version===2&&j.completed===2)||(j.version===3&&j.completed===3)))ask(current,'awaiting-details');
  current.updatedAt=Date.now();notify(current);schedule(current);
  followChat();
 },stageDelay/3));
}
function countdown(flow){
 const journey=productJourneyFor(flow),auto=journey?.autoContinue;
 if(auto?.status!=='active'||countdowns.has(flow.id))return;
 countdowns.set(flow.id,setTimeout(()=>{
  countdowns.delete(flow.id);
  const current=state.flows[flow.id],j=productJourneyFor(current);
  if(!j||j.runId!==journey.runId||j.autoContinue?.status!=='active')return;
  if(state.page!=='editor'||state.flowId!==flow.id||document.hidden||current.chatDraft?.trim()){
   cancelAutoContinue(current);return;
  }
  if(hasPendingMessages(current)||Date.now()-lastMessageRevealTime(current)<confirmationDelay/5){countdown(current);return;}
  j.autoContinue.remaining-=1;
  if(j.autoContinue.remaining<=0){answerProductQuestion(current,'继续',{automatic:true});return;}
  document.querySelectorAll('[data-product-countdown]').forEach(label=>label.textContent=j.autoContinue.remaining);document.querySelector('.feedback-countdown')?.style.setProperty('--feedback-remaining',j.autoContinue.remaining);
  persist();countdown(current);
 },confirmationDelay/5));
}
export function cancelAutoContinue(flow,render=true){
 const auto=productJourneyFor(flow)?.autoContinue;
 clearTimeout(countdowns.get(flow?.id));countdowns.delete(flow?.id);
 if(auto?.status!=='active')return;
 auto.status='cancelled';
 if(render)notify(flow);else{
  persist();const label=document.querySelector('[data-product-auto]');
  if(label)label.innerHTML=esc(translate('自动继续已暂停，确认后再继续'));
 }
}
export function startProductJourney(flow,hooks){
 const config=journeyConfig(flow);if(!config)return;
 stopProductJourney(flow);editorHooks=hooks;
 flow.productJourney={runId:Date.now().toString(36),completed:0,status:'running',version:3,activity:0,stageLayout:'separate-structure'};
 flow.planterJourney=null;flow.busy='product-images';flow.canvasContent='images';flow.canvasStage=0;
 flow.messages.push({role:'assistant',text:config.intro});
 notify(flow);followChat();schedule(flow);
}
export function stopProductJourney(flow){
 if(!flow)return;clearTimeout(timers.get(flow.id));timers.delete(flow.id);cancelAutoContinue(flow,false);
 if(['planter','product-images'].includes(flow.busy))flow.busy=null;
}
export function syncProductJourney(flow,hooks){
 editorHooks=hooks;
 if(upgradeProductJourney(flow))persist();
 for(const id of new Set([...timers.keys(),...countdowns.keys()]))if(id!==flow?.id){
  const old=state.flows[id],j=productJourneyFor(old);
  if(old)stopProductJourney(old);else{clearTimeout(timers.get(id));timers.delete(id);clearTimeout(countdowns.get(id));countdowns.delete(id);}
  if(j?.status==='running'){j.status='paused';old.busy=null;}persist();
 }
 // Reloads preserve the question but never resume an unseen countdown.
 if(productJourneyFor(flow)?.autoContinue?.status==='active'&&!countdowns.has(flow.id))cancelAutoContinue(flow,false);
 if(productJourneyFor(flow)?.status==='running'&&!document.hidden)schedule(flow);
}
export function productThinking(flow){
 const j=productJourneyFor(flow),config=journeyConfig(flow);
 return config&&j?.status==='running'?stageActivities(config.stages[Math.min(j.completed,config.stages.length-1)])[j.activity||0]:'正在整理方案…';
}
export function productStageMessage(message,flow){
 const config=productJourneys[message.templateId||(message.kind==='planter-stage'?'planter':flow.templateId)],stage=config?.stages[message.stage];if(!stage)return '';
 const pages=stage.presentation==='comparison'?stage.images.map((_,page)=>page):[0];
 const images=pages.map(page=>`<div class="planter-chat-image-wrap"><button type="button" class="planter-chat-image" data-product-enlarge="${message.stage}" data-product-image-page="${page}" aria-label="放大查看${esc(config.name)}${esc(stage.imageLabels?.[page]||stage.title)}">${imageTag(config,stage,page,true)}<span>${icon('external',14)}${stage.images.length>1&&!stage.imageLabels?'查看全部 '+stage.images.length+' 页':'放大查看'}</span></button>${stage.imageLabels?`<small class="product-image-label">${esc(stage.imageLabels[page])}</small>`:''}<div class="planter-image-error" hidden><p>图片暂时无法加载</p><button class="text-button" data-product-retry="${message.stage}" data-product-image-page="${page}">重新加载</button></div></div>`).join('');
 return `<div class="planter-stage-copy"><strong>${esc(stage.title)}</strong><p>${esc(stage.copy)}</p><div class="${stage.presentation==='comparison'?'product-chat-pair':'product-chat-single'}">${images}</div>${stage.images.length>1&&!stage.imageLabels?`<small class="product-image-page-count">共 ${stage.images.length} 页，点击图片翻页查看</small>`:''}</div>`;
}
export function productProgress(flow){
 const j=productJourneyFor(flow),config=journeyConfig(flow);if(!config||!j)return '';
 if(j.status==='complete')return `<div class="product-confirm-actions"><button type="button" class="primary" data-wf="checkout">${icon('arrow',15)}继续报价</button><span>方案资料已整理完成，可以填写需求并查看报价。</span></div>`;
 if(pendingProductQuestion(flow))return `<div class="product-confirm-actions"><button type="button" id="product-journey-confirm" class="secondary" data-product-confirm="${pendingProductQuestion(flow).id}">${icon('arrow',15)}${pendingProductQuestion(flow).confirm}</button><span>也可以直接回复“可以”继续</span></div>${j.version===3?`<div class="product-auto-continue" data-product-auto>${j.autoContinue?.status==='active'?`<span role="timer" aria-live="off"><span class="feedback-countdown" style="--feedback-remaining:${j.autoContinue.remaining}" aria-hidden="true"><svg viewBox="0 0 36 36"><circle class="feedback-countdown-track" cx="18" cy="18" r="15"/><circle class="feedback-countdown-value" cx="18" cy="18" r="15" pathLength="100"/></svg><b data-product-countdown>${j.autoContinue.remaining}</b></span><span class="sr-only" data-product-countdown>${j.autoContinue.remaining}</span><span> 秒后自动继续</span></span><button type="button" id="product-auto-pause" class="text-button" data-product-auto-stop>暂停自动继续</button>`:'自动继续已暂停，确认后再继续'}</div>`:''}`;
 if(j.version===3&&j.status==='running')return `<section class="product-activity" aria-label="方案呈现进度"><div class="product-activity-heading">${activitySignal()}<strong>${esc(config.stages[j.completed]?.title||config.name)}</strong><span>${j.completed} / ${config.stages.length}</span></div><div class="feedback-scan-track" aria-hidden="true"><i></i></div><ol>${stageActivities(config.stages[j.completed]).map((text,i)=>`<li class="${i===(j.activity||0)?'is-current':i<(j.activity||0)?'is-reviewed':''}" ${i===(j.activity||0)?'aria-current="step"':''}>${icon(i<(j.activity||0)?'check':'clock',13)}<span>${esc(text)}</span></li>`).join('')}</ol><button type="button" id="product-journey-pause" class="text-button" data-product-action="pause">暂停</button></section>`;
 return `<div class="planter-chat-progress"><span>${j.completed} / ${config.stages.length} 个阶段${j.status==='paused'?' · 已暂停':''}</span><button type="button" id="product-journey-control" class="text-button" data-product-action="${j.status==='running'?'pause':'resume'}">${j.status==='running'?'暂停':'继续呈现'}</button></div>`;
}
function openGallery(flow,stageIndex,pageIndex=0,zoom=false){
 const config=journeyConfig(flow),count=Math.min(visibleProductStageCount(flow),config?.stages.length||0);if(!count)return;
 stageIndex=Math.max(0,Math.min(stageIndex,count-1));const stage=config.stages[stageIndex];
 pageIndex=Math.max(0,Math.min(pageIndex,stage.images.length-1));
 showModal(`<div class="planter-image-modal planter-gallery" data-product-gallery-content data-flow-id="${esc(flow.id)}" data-stage="${stageIndex}" data-page="${pageIndex}" data-zoom="${zoom}"><div class="modal-heading"><h2 id="dialog-title">${esc(config.name)}方案图</h2><button class="icon-button" data-close aria-label="关闭方案图">${icon('close',18)}</button></div><div class="planter-gallery-tabs" role="tablist" aria-label="方案图阶段">${config.stages.map((s,i)=>`<button type="button" role="tab" id="product-gallery-tab-${i}" aria-controls="product-gallery-image" aria-selected="${i===stageIndex}" tabindex="${i===stageIndex?0:-1}" data-product-gallery-stage="${i}" ${i>=count?'disabled':''}>${esc(s.short)}</button>`).join('')}</div><div id="product-gallery-image" class="${zoom?'planter-image-scroll':'planter-gallery-image'}" role="tabpanel" aria-labelledby="product-gallery-tab-${stageIndex}">${imageTag(config,stage,pageIndex)}<div class="product-gallery-error" hidden><p>图片暂时无法加载</p><button type="button" class="secondary" data-product-gallery-retry>重新加载</button></div></div><div class="planter-gallery-footer"><span>${esc(stage.title)}${stage.imageLabels?' · '+esc(stage.imageLabels[pageIndex]):stage.images.length>1?' · 第 '+(pageIndex+1)+' / '+stage.images.length+' 页':''}</span><div class="product-gallery-actions">${stage.images.length>1?`<button type="button" class="icon-button small-icon" id="product-page-previous" data-product-page="${pageIndex-1}" aria-label="${stage.imageLabels?'上一张方案图':'上一页原理图'}" ${pageIndex===0?'disabled':''}>${icon('chevron',16)}</button><button type="button" class="icon-button small-icon" id="product-page-next" data-product-page="${pageIndex+1}" aria-label="${stage.imageLabels?'下一张方案图':'下一页原理图'}" ${pageIndex===stage.images.length-1?'disabled':''}>${icon('arrow',16)}</button>`:''}<button type="button" class="text-button" id="product-gallery-zoom" data-product-zoom>${zoom?'适应窗口':'放大查看'}${icon('external',14)}</button></div></div></div>`,'planter-image-dialog');
}
document.addEventListener('click',event=>{
 if(event.target.closest('[data-product-auto-stop]')){cancelAutoContinue(state.flows[state.flowId]);return;}
 const b=event.target.closest('[data-product-enlarge],[data-product-retry],[data-product-action],[data-product-gallery],[data-product-gallery-stage],[data-product-page],[data-product-zoom],[data-product-gallery-retry],[data-product-confirm],[data-product-canvas],[data-product-canvas-stage],[data-product-canvas-retry]');if(!b||b.disabled)return;
 const flow=state.flows[state.flowId],config=journeyConfig(flow);if(!flow||!config)return;
 if(b.matches('[data-product-enlarge],[data-product-gallery],[data-product-canvas],[data-product-canvas-stage],[data-product-gallery-stage]'))cancelAutoContinue(flow,false);
 if(b.hasAttribute('data-product-confirm')){const question=pendingProductQuestion(flow);if(!question||question.id!==b.dataset.productConfirm)return;flow.messages.push({role:'user',text:translate('好的，继续查看方案。')});answerProductQuestion(flow,'继续');return;}
 if(b.hasAttribute('data-product-canvas')){flow.canvasContent='images';notify(flow);return;}
 if(b.hasAttribute('data-product-canvas-stage')){const index=Number(b.dataset.productCanvasStage);if(Number.isInteger(index)&&index>=0&&index<visibleProductStageCount(flow)){flow.canvasStage=index;notify(flow);}return;}
 if(b.hasAttribute('data-product-canvas-retry')){const wrap=b.closest('.product-canvas-image'),image=wrap.querySelector('img');wrap.querySelector('.product-canvas-error').hidden=true;image.hidden=false;image.src=config.stages[Number(wrap.dataset.stage)].images[Number(wrap.dataset.imagePage)||0]+'?retry='+Date.now();return;}
 const gallery=b.closest('[data-product-gallery-content]');
 if(b.hasAttribute('data-product-gallery-retry')&&gallery){const image=gallery.querySelector('[data-product-gallery-image]');gallery.querySelector('.product-gallery-error').hidden=true;image.hidden=false;const stage=config.stages[Number(gallery.dataset.stage)];image.src=stage.images[Number(gallery.dataset.page)]+'?retry='+Date.now();return;}
 if(b.hasAttribute('data-product-gallery')){openGallery(flow,0);return;}
 if(b.hasAttribute('data-product-gallery-stage')){const index=Number(b.dataset.productGalleryStage);openGallery(flow,index);document.getElementById('product-gallery-tab-'+index)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-enlarge')){openGallery(flow,Number(b.dataset.productEnlarge),Number(b.dataset.productImagePage)||0);return;}
 if(b.hasAttribute('data-product-page')&&gallery){const id=b.id,page=Number(b.dataset.productPage);openGallery(flow,Number(gallery.dataset.stage),page,gallery.dataset.zoom==='true');const next=document.getElementById(id);(next?.disabled?document.getElementById(id==='product-page-next'?'product-page-previous':'product-page-next'):next)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-zoom')&&gallery){openGallery(flow,Number(gallery.dataset.stage),Number(gallery.dataset.page),gallery.dataset.zoom!=='true');document.getElementById('product-gallery-zoom')?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-retry')){const wrap=b.closest('.planter-chat-image-wrap'),image=wrap.querySelector('img'),stage=config.stages[Number(b.dataset.productRetry)];if(!stage)return;wrap.querySelector('.planter-image-error').hidden=true;wrap.querySelector('.planter-chat-image').hidden=false;image.src=stage.images[Number(b.dataset.productImagePage)||0]+'?retry='+Date.now();return;}
 const j=productJourneyFor(flow);if(!j)return;
 if(b.dataset.productAction==='pause'&&j.status==='running'){stopProductJourney(flow);j.status='paused';notify(flow);}
 if(b.dataset.productAction==='resume'&&j.status==='paused'){j.status='running';flow.busy='product-images';notify(flow);schedule(flow);}
});
document.addEventListener('error',event=>{
 const image=event.target;
 if(image.matches?.('[data-product-canvas-image]')){image.hidden=true;image.closest('.product-canvas-image').querySelector('.product-canvas-error').hidden=false;return;}
 if(image.matches?.('[data-product-gallery-image]')){image.hidden=true;image.parentElement.querySelector('.product-gallery-error').hidden=false;return;}
 if(!image.matches?.('[data-product-image]'))return;
 const wrap=image.closest('.planter-chat-image-wrap');if(!wrap)return;
 wrap.querySelector('.planter-chat-image').hidden=true;wrap.querySelector('.planter-image-error').hidden=false;
},true);
document.addEventListener('keydown',event=>{
 const tab=event.target.closest('[data-product-gallery-stage]');if(!tab||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
 const flow=state.flows[state.flowId],count=visibleProductStageCount(flow);if(!count)return;
 event.preventDefault();const i=Number(tab.dataset.productGalleryStage),next=event.key==='Home'?0:event.key==='End'?count-1:(i+(event.key==='ArrowRight'?1:-1)+count)%count;
 openGallery(flow,next);document.getElementById('product-gallery-tab-'+next)?.focus({preventScroll:true});
});

// Typing, changing project or hiding the page always wins over automatic review.
document.addEventListener('input',event=>{
 if(event.target.id!=='chat-input')return;
 const flow=state.flows[state.flowId];if(!flow)return;
 flow.chatDraft=event.target.value;cancelAutoContinue(flow,false);
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden)return;
 const flow=state.flows[state.flowId],j=productJourneyFor(flow);if(!j)return;
 stopProductJourney(flow);if(j.status==='running')j.status='paused';notify(flow);
});
