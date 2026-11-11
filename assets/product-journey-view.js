import {activitySignal,processingGraphic,visibleProductStageCount} from './conversation-feedback.js?v=20261029-structure-r2';
import {icon,esc} from './icons.js?v=20261029-structure-r2';
import {journeyConfig} from './product-journey-data.js?v=20261029-structure-r2';
import {productJourneyFor,productThinking,pendingProductQuestion} from './product-journey.js?v=20261029-structure-r2';

function canvasImage(config,stage,index,page=0){
 const label=stage.imageLabels?.[page]||stage.title;
 return `<div class="product-canvas-image" data-stage="${index}" data-image-page="${page}"><button type="button" data-product-enlarge="${index}" data-product-image-page="${page}" aria-label="放大查看${esc(config.name)}${esc(label)}"><img data-product-canvas-image src="${stage.images[page]}" alt="${esc(config.name)} · ${esc(label)}" decoding="async"></button><div class="product-canvas-error" hidden><p>图片暂时无法加载</p><button type="button" class="secondary" data-product-canvas-retry>重新加载</button></div></div>`;
}
function stageImages(config,stage,index){
 if(stage.presentation!=='comparison')return canvasImage(config,stage,index);
 return `<div class="product-canvas-pair">${stage.images.map((_,page)=>`<figure>${canvasImage(config,stage,index,page)}<figcaption>${esc(stage.imageLabels[page])}</figcaption></figure>`).join('')}</div>`;
}
// The canvas and conversation read the same persisted stage, including after reload.
export function productCanvas(flow){
 const config=journeyConfig(flow),j=productJourneyFor(flow),count=Math.min(visibleProductStageCount(flow),config.stages.length);
 const index=Math.max(0,Math.min(Number.isInteger(flow.canvasStage)?flow.canvasStage:count-1,count-1));
 const stage=count?config.stages[index]:null;
 return `<section class="viewport-panel product-canvas" data-stage-state="${j.status}"><div class="viewport-top"><span>${icon('box',16)}方案预览</span><button type="button" class="text-button" data-product-gallery ${!count?'disabled':''}>查看方案图</button></div><div class="product-canvas-tabs" role="group" aria-label="方案图阶段">${config.stages.map((s,i)=>`<button type="button" data-product-canvas-stage="${i}" aria-pressed="${i===index&&!!count}" ${i>=count?'disabled':''}>${icon(i<count?'check':'clock',13)}${esc(s.short)}</button>`).join('')}</div>${j.status==='running'?`<div class="feedback-canvas-status" role="status">${activitySignal()}<span>${esc(productThinking(flow))}</span><i class="feedback-status-dot" aria-hidden="true"></i></div>`:''}${stage?`${stageImages(config,stage,index)}<div class="product-canvas-caption"><strong>${esc(stage.title)}</strong><p>${esc(stage.copy)}</p></div>`:`<div class="product-canvas-loading ${j.status==='running'?'is-processing':''}">${processingGraphic()}<h2>${j.status==='paused'?'已暂停，可在对话中继续':'正在梳理功能与模块'}</h2><p>模块分布图将随 AI 回答显示在这里</p></div>`}<div class="viewport-status" role="status"><span>${j.status==='running'?`<i></i>${esc(productThinking(flow))}`:pendingProductQuestion(flow)?'等待你的确认':j.status==='paused'?'已暂停，可在对话中继续':'方案图已整理'}</span><span>点击图片可放大查看</span></div></section>`;
}
