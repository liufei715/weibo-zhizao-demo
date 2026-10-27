import {productTemplates,templateById} from './product-templates.js?v=20261027-web-r3';
import {icon,esc} from './icons.js?v=20261027-web-r3';
export function templateSection(state){return `<section class="product-templates" aria-labelledby="template-title"><div class="section-heading"><h2 id="template-title">从产品方案开始<span>复用成熟方案，继续你的设计</span></h2></div><div class="template-grid">${productTemplates.map(t=>templateCard(t,state)).join('')}</div></section>`;}
function templateCard(t,state){
 const liked=state.likes.includes('template:'+t.id);
 return `<article class="work-card product-template-card">
  <div class="work-visual template-visual" data-product="${t.id}">
   <button class="visual-link" data-template-detail="${t.id}" aria-label="查看${esc(t.name)}方案"><img src="${t.image}" alt="${esc(t.imageAlt)}" loading="lazy"></button>
   <span class="art-label">${esc(t.tags[0])}</span>
   <button class="like ${liked?'is-liked':''}" data-template-like="${t.id}" aria-label="${liked?'取消喜欢':'喜欢'}：${esc(t.name)}" aria-pressed="${liked}">${icon('heart',16)}<span>${liked?'已喜欢':'喜欢'}</span></button>
  </div>
  <div class="work-body">
   <h3><button data-template-detail="${t.id}">${esc(t.name)}</button></h3>
   <p title="${esc(t.summary)}">${esc(t.summary)}</p>
   <div class="work-meta"><span class="creator"><span class="avatar tone-sage" aria-hidden="true">蔚</span>蔚博智造</span><div class="counts template-actions"><button data-template-detail="${t.id}" aria-label="查看${esc(t.name)}方案详情">${icon('eye',14)}查看</button><button data-start-template="${t.id}" aria-label="使用${esc(t.name)}方案">${icon('copy',13)}使用</button></div></div>
  </div>
 </article>`;
}
export function templatePicker(id){return `<fieldset class="template-picker"><legend>选择产品方案</legend><div>${productTemplates.map(t=>`<button type="button" class="template-choice ${id===t.id?'selected':''}" data-select-template="${t.id}" aria-pressed="${id===t.id}"><img src="${t.image}" alt=""><span><strong>${t.name}</strong></span>${id===t.id?icon('check',15):''}</button>`).join('')}</div></fieldset>`;}
export function templateDetails(id){const t=templateById(id);return `<div class="template-detail"><button class="dialog-close icon-button" data-close aria-label="关闭产品方案">${icon('close',18)}</button><div class="template-detail-image"><img src="${t.image}" alt="${esc(t.imageAlt)}"><span>${t.imageLabel}</span></div><div class="template-detail-body"><h2 id="dialog-title">${t.name}</h2><p>${t.summary}</p><h3>方案模块</h3><ul>${t.modules.map(m=>`<li><strong>${m.full}</strong><span>${m.description}</span></li>`).join('')}</ul><p class="template-source-note">${t.note}</p><button class="primary" data-start-template="${t.id}">使用这个方案${icon('arrow',17)}</button></div></div>`;}
