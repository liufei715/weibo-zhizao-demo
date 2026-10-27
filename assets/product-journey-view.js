import {icon,esc} from './icons.js?v=20261027-web-r4';
import {journeyConfig} from './product-journey-data.js?v=20261027-web-r4';
import {productJourneyFor,productThinking,pendingProductQuestion} from './product-journey.js?v=20261027-web-r4';

// The canvas and conversation read the same persisted stage, including after reload.
export function productCanvas(flow){
 const config=journeyConfig(flow),j=productJourneyFor(flow),count=Math.min(j.completed,config.stages.length);
 const index=Math.max(0,Math.min(Number.isInteger(flow.canvasStage)?flow.canvasStage:count-1,count-1));
 const stage=count?config.stages[index]:null;
 return `<section class="viewport-panel product-canvas"><div class="viewport-top"><span>${icon('box',16)}方案预览</span><button type="button" class="text-button" data-product-gallery ${!count?'disabled':''}>查看方案图</button><button type="button" class="secondary" data-product-canvas="hardware">${icon('link',15)}器件连线</button></div><div class="product-canvas-tabs" role="group" aria-label="方案图阶段">${config.stages.map((s,i)=>`<button type="button" data-product-canvas-stage="${i}" aria-pressed="${i===index&&!!count}" ${i>=count?'disabled':''}>${icon(i<count?'check':'clock',13)}${esc(s.short)}</button>`).join('')}</div>${stage?`<div class="product-canvas-image" data-stage="${index}"><button type="button" data-product-enlarge="${index}" aria-label="放大查看${esc(config.name)}${esc(stage.title)}"><img data-product-canvas-image src="${stage.images[0]}" alt="${esc(config.name)} · ${esc(stage.title)}" decoding="async"></button><div class="product-canvas-error" hidden><p>图片暂时无法加载</p><button type="button" class="secondary" data-product-canvas-retry>重新加载</button></div></div><div class="product-canvas-caption"><strong>${esc(stage.title)}</strong><p>${esc(stage.copy)}</p></div>`:`<div class="product-canvas-loading" role="status"><span class="spinner"></span><h2>正在梳理功能与模块</h2><p>模块分布图将随 AI 回答显示在这里</p></div>`}<div class="viewport-status" role="status"><span>${j.status==='running'?`<i></i>${esc(productThinking(flow))}`:pendingProductQuestion(flow)?'等待你的确认':j.status==='paused'?'已暂停，可在对话中继续':'方案图已整理'}</span><span>点击图片可放大查看</span></div></section>`;
}
