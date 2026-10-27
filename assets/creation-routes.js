import {icon,esc} from './icons.js?v=20261027-web-r4';
import {productTemplates,templateById} from './product-templates.js?v=20261027-web-r4';

export const creationRoutes=[
 {id:'boutique',enabled:true,icon:'gem',label:'精品路线',placeholder:'选择下方成熟产品，描述你希望调整的功能和使用场景……'},
 {id:'maker',enabled:false,icon:'chip',label:'创客路线',placeholder:'描述你的硬件想法、需要的功能和使用场景……'},
 {id:'workshop',enabled:false,icon:'workshop',label:'工坊路线',placeholder:'描述你的方案及制作需求……'}
];
const routeIconPaths={
 gem:'<path d="M7 4h10l5 6-10 11L2 10Z"/><path d="M2 10h20M7 4l-1 6 6 11 6-11-1-6M6 10l6-6 6 6"/>',
 chip:'<rect x="6" y="6" width="12" height="12" rx="2.5"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 3v3m6-3v3M9 18v3m6-3v3M3 9h3m-3 6h3M18 9h3m-3 6h3"/>',
 workshop:'<path d="M3 21V11l6-4v6l6-4v12ZM15 21V3h4l2 18ZM3 21h18"/><path d="M6 16h1m4 0h1M6 18.5h1m4 0h1M16 6h3"/>'
};
function creationRouteIcon(name){
 return `<svg class="creation-route-icon" aria-hidden="true" focusable="false" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${routeIconPaths[name]}</svg>`;
}
const storageKey='weibo-creation-route-drafts-v1';
let drafts={};
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'{}');if(saved&&typeof saved==='object')drafts=saved;}catch{}
let activeRoute='boutique';
let initialized=false;
export function currentCreationRoute(){return activeRoute;}
export function initializeCreationRoutes(state){
 if(initialized)return;
 initialized=true;
 if(typeof drafts.boutique?.idea==='string'){
  state.idea=drafts.boutique.idea.slice(0,2000);
  if(templateById(drafts.boutique.templateId))state.templateId=drafts.boutique.templateId;
 }
}
export function saveRouteDraft(state){
 drafts[activeRoute]={idea:state.idea.slice(0,2000),templateId:state.templateId};
 try{localStorage.setItem(storageKey,JSON.stringify(drafts));return true;}catch{return false;}
}
export function selectCreationRoute(id,state){
 if(!creationRoutes.some(route=>route.id===id&&route.enabled)||id===activeRoute)return false;
 const saved=saveRouteDraft(state);
 activeRoute=id;
 state.idea=typeof drafts[id]?.idea==='string'?drafts[id].idea.slice(0,2000):'';
 if(id==='boutique'&&templateById(drafts[id]?.templateId))state.templateId=drafts[id].templateId;
 return saved;
}
export function creationComposer(state){
 const route=creationRoutes.find(item=>item.id===activeRoute);
 const boutique=activeRoute==='boutique';
 const template=templateById(state.templateId)||productTemplates[0];
 return `<form id="idea-form" class="idea-form">
  <div class="composer-hint creation-route-header">
   <div class="creation-route-tabs" role="tablist" aria-label="创作路线">
    ${creationRoutes.map(item=>`<button type="button" role="tab" id="route-${item.id}" data-creation-route="${item.id}" aria-selected="${item.id===activeRoute}" aria-controls="creation-route-panel" tabindex="${item.id===activeRoute&&item.enabled?'0':'-1'}" ${item.enabled?'':'disabled aria-disabled="true" title="暂未开放"'}>${creationRouteIcon(item.icon)}<span>${item.label}</span></button>`).join('')}
   </div>
   <span id="chosen-template" ${boutique?'':'hidden'}>当前方案：${esc(template.name)}</span>
  </div>
  <div id="creation-route-panel" role="tabpanel" aria-labelledby="route-${activeRoute}">
   <label class="sr-only" for="idea">${route.label}需求</label>
   <textarea id="idea" maxlength="2000" placeholder="${esc(boutique?template.prompt:route.placeholder)}">${esc(state.idea||'')}</textarea>
   <div class="composer-bottom"><span id="idea-count">${(state.idea||'').length} / 2000</span><button class="secondary" type="button" data-save-idea>${icon('folder',16)}保存草稿</button><button class="primary" type="submit" id="generate" ${!state.idea?.trim()?'disabled':''}>${boutique?'生成方案':'保存需求'}${icon('arrow',17)}</button></div>
   <p class="form-error" id="idea-error" role="alert" hidden></p>
  </div>
 </form>
 <div class="prompt-list creation-route-products" ${boutique?'':'hidden'}><span>从成熟产品开始</span>${productTemplates.map(t=>`<button class="chip ${state.templateId===t.id?'selected':''}" data-prompt-template="${t.id}" aria-pressed="${state.templateId===t.id}"><img class="creation-product-thumbnail" src="assets/products/thumbnails/${t.id}.jpg" width="56" height="42" alt="" decoding="async"><span class="creation-product-label">${esc(t.name)}</span>${icon(state.templateId===t.id?'check':'plus',14)}</button>`).join('')}</div>`;
}
export function mountCreationRouteEvents({state,render,toast}){
 function switchRoute(id){
  if(id===activeRoute||!creationRoutes.some(route=>route.id===id&&route.enabled))return;
  if(!selectCreationRoute(id,state))toast('存储不可用，草稿暂存在当前页面，请勿关闭');
  render();
  document.querySelector(`[data-creation-route="${id}"]`)?.focus({preventScroll:true});
 }
 document.addEventListener('click',event=>{
  const tab=event.target.closest('[data-creation-route]');
  if(tab&&!tab.disabled)switchRoute(tab.dataset.creationRoute);
 });
 document.addEventListener('keydown',event=>{
  const tab=event.target.closest('[data-creation-route]');
  if(!tab||tab.disabled||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();
  const enabledRoutes=creationRoutes.filter(route=>route.enabled);
  if(!enabledRoutes.length)return;
  const index=enabledRoutes.findIndex(route=>route.id===activeRoute);
  const next=event.key==='Home'?0:event.key==='End'?enabledRoutes.length-1:(index+(event.key==='ArrowRight'?1:-1)+enabledRoutes.length)%enabledRoutes.length;
  switchRoute(enabledRoutes[next].id);
 });
}
