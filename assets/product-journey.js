import {translate} from './i18n.js?v=20261027-web-r4';
import {icon,esc} from './icons.js?v=20261027-web-r4';
import {state,persist} from './store.js?v=20261027-web-r4';
import {showModal} from './ui.js?v=20261027-web-r4';
import {modulesFor} from './workflow-data.js?v=20261027-web-r4';
import {journeyConfig,productJourneys} from './product-journey-data.js?v=20261027-web-r4';

// Visible summaries describe supplied project images; no generation or electrical validation is implied.
export const stageDelay=4200;
const timers=new Map();
let editorHooks={};
export const productJourneyFor=flow=>flow?.productJourney||flow?.planterJourney||null;
export const hasProductJourney=flow=>Boolean(journeyConfig(flow));
const stageAlt=(config,stage,page=0)=>`${config.name} · ${stage.title}${stage.images.length>1?'，第 '+(page+1)+' 页':''}`;
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
 const j=productJourneyFor(flow);if(!j||j.version!==2)return null;
 if(j.status==='awaiting-wiring')return {id:'wiring',text:'已为你选择项目所需的模块和器件，需要我帮你进行连线吗？',confirm:'开始整理连线'};
 if(j.status==='awaiting-details')return {id:'details',text:flow.templateId==='planter'?'需要我根据电路框图继续呈现电路原理图、PCB 布线和三维预览吗？':'需要我继续呈现电路原理图和产品参考图吗？',confirm:'继续查看方案'};
 return null;
}
function ask(flow,status){
 const j=productJourneyFor(flow);j.status=status;flow.busy=null;
 const question=pendingProductQuestion(flow);
 flow.messages.push({role:'assistant',kind:'product-question',question:question.id,text:question.text});
}
export function answerProductQuestion(flow,text){
 const question=pendingProductQuestion(flow);if(!question)return false;
 const answer=text.trim();
 const no=/(不要|不用|不需要|暂不|先不|不继续|don't|do not)/i.test(answer)||/^(暂不|暂时不|先不|不要|不用|不需要|不连|不继续|取消|稍后|等等|no\b|not now\b|later\b|cancel\b)/i.test(answer);
 const yes=/^(可以|好的|好[的啊呀]?|是[的]?|行|嗯|同意|确认|继续|开始|请继续|需要|帮我|连线|yes\b|ok(?:ay)?\b|sure\b|continue\b|start\b|go ahead\b)/i.test(answer);
 if(!yes||no){
  flow.messages.push({role:'assistant',text:no?'好的，先保留当前方案图。准备好后可点击下方按钮继续，也可以补充需求。':'补充需求已保留。当前方案图保持不变，请确认是否继续，或稍后再操作。'});
  notify(flow);return true;
 }
 const j=productJourneyFor(flow);
 if(question.id==='wiring'){
  flow.modules=modulesFor(flow).map(m=>m.id);flow.selectedItems=[...new Set([...flow.selectedItems,...flow.modules])];
  flow.wireSuggested=true;flow.plan=true;
  if(flow.templateId!=='planter'){
   flow.canvasContent='hardware';
   flow.messages.push({role:'assistant',text:'已整理模块接线配置。你可以在右侧点击引脚连线，或在下方应用全部连线。'});
   ask(flow,'awaiting-details');notify(flow);return true;
  }
 }
 j.status='running';flow.busy='product-images';flow.canvasContent='images';notify(flow);schedule(flow);return true;
}

function schedule(flow){
 const journey=productJourneyFor(flow),config=journeyConfig(flow);
 if(!journey||!config||journey.status!=='running'||timers.has(flow.id))return;
 flow.busy='product-images';
 timers.set(flow.id,setTimeout(()=>{
  timers.delete(flow.id);
  const current=state.flows[flow.id],j=productJourneyFor(current),currentConfig=journeyConfig(current);
  if(!j||!currentConfig||j.runId!==journey.runId||j.status!=='running')return;
  if(state.page!=='editor'||state.flowId!==flow.id){j.status='paused';current.busy=null;persist();return;}
  const index=j.completed,stage=currentConfig.stages[index];
  if(!stage){j.status='complete';current.busy=null;persist();return;}
  const follow=true;
  j.completed+=1;
  current.messages.push({role:'assistant',kind:'product-stage',templateId:current.templateId,stage:index,text:stage.copy});
  current.canvasContent='images';current.canvasStage=index;
  if(j.completed===currentConfig.stages.length){j.status='complete';current.busy=null;current.plan=true;current.stage='plan';}
  else if(j.version===2&&j.completed===1)ask(current,'awaiting-wiring');
  else if(j.version===2&&current.templateId==='planter'&&j.completed===2)ask(current,'awaiting-details');
  current.updatedAt=Date.now();notify(current);schedule(current);
  if(follow)document.getElementById('chat-body')?.scrollTo({top:100000,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },stageDelay));
}
export function startProductJourney(flow,hooks){
 const config=journeyConfig(flow);if(!config)return;
 stopProductJourney(flow);editorHooks=hooks;
 flow.productJourney={runId:Date.now().toString(36),completed:0,status:'running',version:2};
 flow.planterJourney=null;flow.busy='product-images';flow.canvasContent='images';flow.canvasStage=0;
 flow.messages.push({role:'assistant',text:config.intro});
 notify(flow);schedule(flow);
}
export function stopProductJourney(flow){
 if(!flow)return;clearTimeout(timers.get(flow.id));timers.delete(flow.id);
 if(['planter','product-images'].includes(flow.busy))flow.busy=null;
}
export function syncProductJourney(flow,hooks){
 editorHooks=hooks;
 for(const [id,timer] of timers){if(id!==flow?.id){clearTimeout(timer);timers.delete(id);const old=state.flows[id],j=productJourneyFor(old);if(j?.status==='running'){j.status='paused';old.busy=null;persist();}}}
 if(productJourneyFor(flow)?.status==='running')schedule(flow);
}
export function productThinking(flow){
 const j=productJourneyFor(flow),config=journeyConfig(flow);
 return config&&j?.status==='running'?'正在整理'+config.stages[Math.min(j.completed,config.stages.length-1)].title+'…':'正在整理方案…';
}
export function productStageMessage(message,flow){
 const config=productJourneys[message.templateId||(message.kind==='planter-stage'?'planter':flow.templateId)],stage=config?.stages[message.stage];if(!stage)return '';
 return `<div class="planter-stage-copy"><strong>${esc(stage.title)}</strong><p>${esc(stage.copy)}</p><div class="planter-chat-image-wrap"><button type="button" class="planter-chat-image" data-product-enlarge="${message.stage}" aria-label="放大查看${esc(config.name)}${esc(stage.title)}">${imageTag(config,stage,0,true)}<span>${icon('external',14)}${stage.images.length>1?'查看全部 '+stage.images.length+' 页':'放大查看'}</span></button>${stage.images.length>1?`<small class="product-image-page-count">共 ${stage.images.length} 页，点击图片翻页查看</small>`:''}<div class="planter-image-error" hidden><p>图片暂时无法加载</p><button class="text-button" data-product-retry="${message.stage}">重新加载</button></div></div></div>`;
}
export function productProgress(flow){
 const j=productJourneyFor(flow),config=journeyConfig(flow);if(!config||!j)return '';
 if(j.status==='complete')return flow.canvasContent==='hardware'?'':`<div class="product-confirm-actions"><button type="button" class="secondary" data-product-canvas="hardware">${icon('link',15)}查看模块与连线</button></div>`;
 if(pendingProductQuestion(flow))return `<div class="product-confirm-actions"><button type="button" class="secondary" data-product-confirm="${pendingProductQuestion(flow).id}">${icon('arrow',15)}${pendingProductQuestion(flow).confirm}</button><span>确认后继续下一步</span></div>`;
 return `<div class="planter-chat-progress"><span>${j.completed} / ${config.stages.length} 个阶段${j.status==='paused'?' · 已暂停':''}</span><button type="button" class="text-button" data-product-action="${j.status==='running'?'pause':'resume'}">${j.status==='running'?'暂停':'继续呈现'}</button></div>`;
}
function openGallery(flow,stageIndex,pageIndex=0,zoom=false){
 const config=journeyConfig(flow),count=Math.min(productJourneyFor(flow)?.completed||0,config?.stages.length||0);if(!count)return;
 stageIndex=Math.max(0,Math.min(stageIndex,count-1));const stage=config.stages[stageIndex];
 pageIndex=Math.max(0,Math.min(pageIndex,stage.images.length-1));
 showModal(`<div class="planter-image-modal planter-gallery" data-product-gallery-content data-flow-id="${esc(flow.id)}" data-stage="${stageIndex}" data-page="${pageIndex}" data-zoom="${zoom}"><div class="modal-heading"><h2 id="dialog-title">${esc(config.name)}方案图</h2><button class="icon-button" data-close aria-label="关闭方案图">${icon('close',18)}</button></div><div class="planter-gallery-tabs" role="tablist" aria-label="方案图阶段">${config.stages.map((s,i)=>`<button type="button" role="tab" id="product-gallery-tab-${i}" aria-controls="product-gallery-image" aria-selected="${i===stageIndex}" tabindex="${i===stageIndex?0:-1}" data-product-gallery-stage="${i}" ${i>=count?'disabled':''}>${esc(s.short)}</button>`).join('')}</div><div id="product-gallery-image" class="${zoom?'planter-image-scroll':'planter-gallery-image'}" role="tabpanel" aria-labelledby="product-gallery-tab-${stageIndex}">${imageTag(config,stage,pageIndex)}<div class="product-gallery-error" hidden><p>图片暂时无法加载</p><button type="button" class="secondary" data-product-gallery-retry>重新加载</button></div></div><div class="planter-gallery-footer"><span>${esc(stage.title)}${stage.images.length>1?' · 第 '+(pageIndex+1)+' / '+stage.images.length+' 页':''}</span><div class="product-gallery-actions">${stage.images.length>1?`<button type="button" class="icon-button small-icon" id="product-page-previous" data-product-page="${pageIndex-1}" aria-label="上一页原理图" ${pageIndex===0?'disabled':''}>${icon('chevron',16)}</button><button type="button" class="icon-button small-icon" id="product-page-next" data-product-page="${pageIndex+1}" aria-label="下一页原理图" ${pageIndex===stage.images.length-1?'disabled':''}>${icon('arrow',16)}</button>`:''}<button type="button" class="text-button" id="product-gallery-zoom" data-product-zoom>${zoom?'适应窗口':'放大查看'}${icon('external',14)}</button></div></div></div>`,'planter-image-dialog');
}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-product-enlarge],[data-product-retry],[data-product-action],[data-product-gallery],[data-product-gallery-stage],[data-product-page],[data-product-zoom],[data-product-gallery-retry],[data-product-confirm],[data-product-canvas],[data-product-canvas-stage],[data-product-canvas-retry]');if(!b||b.disabled)return;
 const flow=state.flows[state.flowId],config=journeyConfig(flow);if(!flow||!config)return;
 if(b.hasAttribute('data-product-confirm')){const question=pendingProductQuestion(flow);if(!question||question.id!==b.dataset.productConfirm)return;flow.messages.push({role:'user',text:translate(question.id==='wiring'?'可以，开始整理连线。':'好的，继续查看方案。')});answerProductQuestion(flow,'继续');return;}
 if(b.hasAttribute('data-product-canvas')){flow.canvasContent=b.dataset.productCanvas;notify(flow);return;}
 if(b.hasAttribute('data-product-canvas-stage')){const index=Number(b.dataset.productCanvasStage);if(Number.isInteger(index)&&index>=0&&index<(productJourneyFor(flow)?.completed||0)){flow.canvasStage=index;notify(flow);}return;}
 if(b.hasAttribute('data-product-canvas-retry')){const wrap=b.closest('.product-canvas-image'),image=wrap.querySelector('img');wrap.querySelector('.product-canvas-error').hidden=true;image.hidden=false;image.src=config.stages[Number(wrap.dataset.stage)].images[0]+'?retry='+Date.now();return;}
 const gallery=b.closest('[data-product-gallery-content]');
 if(b.hasAttribute('data-product-gallery-retry')&&gallery){const image=gallery.querySelector('[data-product-gallery-image]');gallery.querySelector('.product-gallery-error').hidden=true;image.hidden=false;const stage=config.stages[Number(gallery.dataset.stage)];image.src=stage.images[Number(gallery.dataset.page)]+'?retry='+Date.now();return;}
 if(b.hasAttribute('data-product-gallery')){openGallery(flow,0);return;}
 if(b.hasAttribute('data-product-gallery-stage')){const index=Number(b.dataset.productGalleryStage);openGallery(flow,index);document.getElementById('product-gallery-tab-'+index)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-enlarge')){openGallery(flow,Number(b.dataset.productEnlarge));return;}
 if(b.hasAttribute('data-product-page')&&gallery){const id=b.id,page=Number(b.dataset.productPage);openGallery(flow,Number(gallery.dataset.stage),page,gallery.dataset.zoom==='true');const next=document.getElementById(id);(next?.disabled?document.getElementById(id==='product-page-next'?'product-page-previous':'product-page-next'):next)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-zoom')&&gallery){openGallery(flow,Number(gallery.dataset.stage),Number(gallery.dataset.page),gallery.dataset.zoom!=='true');document.getElementById('product-gallery-zoom')?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-product-retry')){const wrap=b.closest('.planter-chat-image-wrap'),image=wrap.querySelector('img'),stage=config.stages[Number(b.dataset.productRetry)];if(!stage)return;wrap.querySelector('.planter-image-error').hidden=true;wrap.querySelector('.planter-chat-image').hidden=false;image.src=stage.images[0]+'?retry='+Date.now();return;}
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
 const flow=state.flows[state.flowId],count=productJourneyFor(flow)?.completed;if(!count)return;
 event.preventDefault();const i=Number(tab.dataset.productGalleryStage),next=event.key==='Home'?0:event.key==='End'?count-1:(i+(event.key==='ArrowRight'?1:-1)+count)%count;
 openGallery(flow,next);document.getElementById('product-gallery-tab-'+next)?.focus({preventScroll:true});
});
