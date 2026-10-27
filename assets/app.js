import {initLanguage,languageControl,localizePage,translate,localizedPrompt} from './i18n.js?v=20261027-web-r3';
import {syncProductJourney,productJourneyFor} from './product-journey.js?v=20261027-web-r3';
import {syncQuotationControls} from './quotation.js?v=20261027-web-r3';
import {initializeCreationRoutes,mountCreationRouteEvents,saveRouteDraft,currentCreationRoute} from './creation-routes.js?v=20261027-web-r3';
import {initCreationReveal} from './creation-reveal.js?v=20261027-web-r3';
import {accountControl,initAccountMenu,closeAccountMenu} from './account-menu.js?v=20261027-web-r3';
import {templateById} from './product-templates.js?v=20261027-web-r3';
import {templatePicker,templateDetails} from './template-ui.js?v=20261027-web-r3';
import {themeControl,applyTheme} from './theme.js?v=20261027-web-r3';
import {icon,esc} from './icons.js?v=20261027-web-r3';
import {works,plugins} from './data.js?v=20261027-web-r3';
import {home,resources,gate,createPage,myPage,card,empty} from './views.js?v=20261027-web-r3';
import {state,persist,currentFlow,newFlow,removeProject} from './store.js?v=20261027-web-r3';
import {editor} from './editor-view.js?v=20261027-web-r3';
import {checkoutPage,successPage} from './order-view.js?v=20261027-web-r3';
import {initDialogs,requireAuth,detail} from './dialogs.js?v=20261027-web-r3';
import {initWorkflow,sendChat} from './workflow.js?v=20261027-web-r3';
import {initOrders} from './order-controller.js?v=20261027-web-r3';
import {initWiring,drawWires} from './wiring.js?v=20261027-web-r3';
import {closeModal,toast,simpleModal,showModal} from './ui.js?v=20261027-web-r3';

initLanguage();
initializeCreationRoutes(state);
const pages={discover:['热点趋势','发现灵感'],create:['AI 硬件创造','开始创作'],resources:['AI 资源广场','探索资源'],my:['我的','个人工作区'],checkout:['备料下单','填写详情'],confirm:['备料下单','确认订单'],success:['我的订单','下单结果']};
let orderId=new URLSearchParams(location.search).get('order')||'';
let editorOrigin=new URLSearchParams(location.search).get('from')||'';
const editorOriginPages=new Set(['discover','create','resources','my']);
let mountedPage='',resourceQuery='';
let disposeCreationReveal=()=>{};
const flowParam=new URLSearchParams(location.search).get('flow');if(flowParam&&state.flows[flowParam])state.flowId=flowParam;
Object.values(state.flows).forEach(f=>{delete f.busy;delete f.pendingPin;});
if(!pages[state.page]&&state.page!=='editor')state.page='discover';
function nav(){const selected=state.page==='editor'?'create':['checkout','confirm','success'].includes(state.page)?'my':state.page;return `<aside class="site-sidebar"><div class="sidebar-brand"><a href="?page=discover" data-nav="discover" aria-label="蔚博智造首页"><img class="brand-image" src="assets/weibo-logo-transparent.png" alt="蔚博智造 VIBE HARDWARE"></a><button class="icon-button collapse-button" data-collapse aria-label="${state.collapsed?'展开':'收起'}侧边栏">${icon('collapse',17)}</button></div><nav class="side-nav" aria-label="主导航">${[['discover','home','热点趋势'],['create','spark','AI 硬件创造'],['resources','grid','AI 资源广场'],['my','user','我的']].map(([id,i,t])=>`<button class="nav-item ${selected===id?'active':''}" data-page="${id}" ${selected===id?'aria-current="page"':''} aria-label="${t}" title="${t}">${icon(i,20)}<span class="nav-label">${t}</span>${id==='create'?'<small class="tiny-badge">免费设计</small>':selected===id?'<i class="nav-dot"></i>':''}</button>`).join('')}</nav><div class="sidebar-spacer"></div><footer class="sidebar-footer">蔚博智造 © 2026</footer></aside>`;}
function breadcrumb(){
 const [title,sub]=pages[state.page]||pages.discover;
 const parent=state.page==='success'?'my':state.page==='confirm'?'checkout':state.page==='checkout'?'editor':state.page;
 const label=state.page==='checkout'?'设计工作台':title;
 const params=new URLSearchParams({page:parent});
 if(parent==='my')params.set('tab',state.page==='success'?'orders':state.myTab);
 if(['editor','checkout'].includes(parent)&&state.flowId)params.set('flow',state.flowId);
 if(parent==='editor'&&editorOriginPages.has(editorOrigin))params.set('from',editorOrigin);
 return `<nav class="breadcrumb" aria-label="面包屑导航"><a class="breadcrumb-link" href="?${esc(params.toString())}" data-nav="${parent}"${parent==='my'?` data-workspace-tab="${params.get('tab')}"`:''}><strong>${label}</strong></a>${icon('chevron',12)}<span aria-current="page">${sub}</span></nav>`;
}
function topbar(){const searchable=['discover','resources'].includes(state.page);return `<header class="topbar">${breadcrumb()}${searchable?`<label class="search-box">${icon('search',17)}<span class="sr-only">搜索作品、作者或资源</span><input id="global-search" type="search" maxlength="100" placeholder="${state.page==='resources'?'搜索资源、产品和教程':'搜索灵感、作品或创作者'}" value="${esc(state.query)}"><span class="search-key">⌘ K</span></label>`:'<div class="topbar-fill"></div>'}<div class="top-actions">${languageControl()}${themeControl(state.theme)}<button class="icon-button" data-info="notifications" aria-label="查看通知">${icon('bell',18)}</button>${state.auth?accountControl():'<button class="secondary login-top" data-login>登录</button>'}</div></header>`;}
function body(){
 if(state.page==='discover')return home(state);
 if(state.page==='resources')return resources(state);
 if(state.page==='create')return state.auth?createPage(state):gate('create');
 if(state.page==='my')return state.auth?myPage(state):gate('my');
 if(['checkout','confirm'].includes(state.page)){const f=currentFlow();return f?checkoutPage(f,state,state.page==='confirm'):empty('请先创建一个项目','完成器件选择后再进入备料下单。','开始创作','create');}
 if(state.page==='success'){const order=state.orders.find(o=>o.id===orderId);return order?successPage(order):empty('没有找到这个订单','前往我的订单查看已保存的记录。','我的项目','my');}
 return home(state);
}
export function render(){
 closeAccountMenu();
 disposeCreationReveal();disposeCreationReveal=()=>{};
 document.body.classList.toggle('site-collapsed',state.collapsed);document.body.classList.toggle('editor-body',state.page==='editor');document.body.classList.toggle('creation-body',state.page==='create');
 if(state.page==='editor'){
  if(!state.auth){state.page='create';render();return;}
  if(!currentFlow())newFlow();
  if(productJourneyFor(currentFlow())?.status==='running')currentFlow().busy='product-images';
  document.querySelector('title').setAttribute('translate','no');document.title=currentFlow().name+' · 蔚博智造工作台';document.getElementById('app').innerHTML=editor(currentFlow());requestAnimationFrame(drawWires);
 }else{
  document.querySelector('title').removeAttribute('translate');document.title=(pages[state.page]?.[0]||'灵感社区')+' · 蔚博智造';
  document.getElementById('app').innerHTML=`${nav()}<div class="site-content"><div class="site-canvas"><div class="network-notice" id="network-notice" ${navigator.onLine?'hidden':''}>${icon('wifi',16)}当前已离线，输入会继续保留。</div>${topbar()}<main id="main" tabindex="-1">${body()}</main></div></div>`;
  if(state.page==='discover')updateResults();
  if(state.page==='resources'&&state.query)searchResources();
 }
 if(state.page==='create')disposeCreationReveal=initCreationReveal(document.querySelector('.creation-scene'));
 if(['checkout','confirm'].includes(state.page)&&currentFlow())syncQuotationControls(currentFlow());
 syncProductJourney(state.page==='editor'?currentFlow():null,{renderEditor});
 localizePage();
 mountedPage=state.page;
}
export function renderEditor(){if(state.page!=='editor')return;const scroll=document.getElementById('chat-body')?.scrollTop||0;const focus=document.activeElement;const focusId=focus?.id;const selection=typeof focus?.selectionStart==='number'?focus.selectionStart:null;render();const chat=document.getElementById('chat-body');if(chat)chat.scrollTop=scroll;if(focusId){const next=document.getElementById(focusId);next?.focus({preventScroll:true});if(selection!==null&&next?.setSelectionRange)next.setSelectionRange(selection,selection);}}
function editorReturnTarget(){return editorOriginPages.has(editorOrigin)?editorOrigin:'my';}
function flowHasSavedContent(flow){return Boolean(flow&&(flow.idea?.trim()||flow.messages?.length||flow.modules?.length||flow.wires?.length||flow.plan));}
function requestEditorExit(){
 const flow=currentFlow();
 if(!flow||!flowHasSavedContent(flow)){navigate(editorReturnTarget());return;}
 showModal(`<div class="simple-modal editor-exit-modal"><button class="dialog-close icon-button" data-close aria-label="继续编辑">${icon('close',18)}</button><h2 id="dialog-title">保存当前方案？</h2><p>当前方案会自动保存到“我的项目”。保存后可从“我的 → 我的项目”继续创作、查看连线和备料信息。</p><div class="editor-exit-actions"><button class="primary" data-editor-exit="save">保存并返回${icon('arrow',16)}</button></div><button class="text-button editor-exit-cancel" data-close>继续编辑</button></div>`, 'editor-exit-dialog');
}
export function navigate(page,id=''){
 const previousPage=state.page;
 if(page==='editor'&&!state.auth){requireAuth(()=>navigate(page,id));return;}
 if(page==='editor'&&previousPage!=='editor'&&!['checkout','confirm','success'].includes(previousPage))editorOrigin=editorOriginPages.has(previousPage)?previousPage:'my';
 closeModal();document.body.classList.remove('mobile-nav-open');
 state.page=page;state.query='';resourceQuery='';if(id)orderId=id;
 const url=new URL(location.href);url.search='';url.searchParams.set('page',page);if(page==='my')url.searchParams.set('tab',state.myTab);if(page==='editor'&&editorOriginPages.has(editorOrigin))url.searchParams.set('from',editorOrigin);if(['editor','checkout','confirm','success'].includes(page)&&state.flowId)url.searchParams.set('flow',state.flowId);if(page==='success'&&orderId)url.searchParams.set('order',orderId);history.pushState({},'',url);
 render();window.scrollTo(0,0);document.getElementById('main')?.focus({preventScroll:true});
}
export function updateResults(){
 if(state.page!=='discover')return;const grid=document.getElementById('work-grid');if(!grid)return;
 const query=state.query.trim().toLocaleLowerCase();let filtered=works.filter(w=>(['发现','热门'].includes(state.category)||w.category===state.category)&&(!state.code||w.code)&&(!state.bom||w.bom)&&(!query||[w.name,w.subtitle,w.author,w.chip,...w.tags].map(value=>value+' '+translate(value,'en')).join(' ').toLocaleLowerCase().includes(query)));
 filtered.sort((a,b)=>state.category==='热门'?b.likes-a.likes:state.sort==='oldest'?a.date.localeCompare(b.date):state.sort==='az'?a.name.localeCompare(b.name,'zh-CN'):state.sort==='za'?b.name.localeCompare(a.name,'zh-CN'):b.date.localeCompare(a.date));
 const active=query||!['发现'].includes(state.category)||state.code||state.bom;
 document.getElementById('discovery-banners').hidden=!!active;
 document.getElementById('results-title').innerHTML=`${query?'搜索结果':state.category==='发现'?'猜你喜欢':esc(state.category)}<span id="result-count">${active?filtered.length+' 个作品':'为好奇心，寻找一个新的开始。'}</span>`;
 grid.innerHTML=filtered.length?filtered.map(w=>card(w,state)).join(''):empty('暂时没有找到这样的灵感','试试其他关键词，或清除筛选看看全部作品。');
 const bar=document.getElementById('active-filters');bar.hidden=!active;bar.innerHTML=`<span>${query?`关键词「<span translate="no">${esc(state.query)}</span>」 · `:''}${state.code?'含代码 · ':''}${state.bom?'可购 BOM · ':''}共 ${filtered.length} 个结果</span><button data-reset>清除全部筛选${icon('close',13)}</button>`;
 document.querySelectorAll('[data-category]').forEach(b=>{const yes=b.dataset.category===state.category;b.classList.toggle('active',yes);b.setAttribute('aria-pressed',yes);});document.querySelectorAll('[data-filter]').forEach(b=>{const yes=state[b.dataset.filter];b.classList.toggle('selected',yes);b.setAttribute('aria-pressed',yes);});const sort=document.getElementById('sort');if(sort)sort.value=state.sort;
}
function searchResources(){
 const main=document.getElementById('main');if(!main)return;const q=state.query.trim().toLowerCase();if(!q){main.innerHTML=resources(state);resourceQuery='';return;}
 const filtered=works.filter(w=>[w.name,w.subtitle,w.chip,w.category,...w.tags].map(value=>value+' '+translate(value,'en')).join(' ').toLowerCase().includes(q));const tools=plugins.filter(p=>(p.name+p.description+translate(p.name+p.description,'en')).toLowerCase().includes(q));
 main.innerHTML=`<div class="page-intro"><div><h1>寻找你的<span>下一件工具。</span></h1><p>关键词「<span translate="no">${esc(state.query)}</span>」</p></div><button class="text-button" data-reset>清除搜索${icon('close',15)}</button></div>${tools.length?`<div class="plugin-list resource-search-plugins">${tools.map(p=>`<button class="plugin-row" data-plugin="${p.id}"><span class="plugin-icon">${icon(p.icon,20)}</span><span><strong>${p.name}</strong><small>${p.description}</small></span><span class="plugin-view">查看${icon('arrow',16)}</span></button>`).join('')}</div>`:''}<div class="work-grid">${filtered.map(w=>card(w,state)).join('')||(!tools.length?empty('暂时没有匹配的资源','试试 ESP32、OLED、像素或其他关键词。'): '')}</div>`;resourceQuery=q;
}
mountCreationRouteEvents({state,render,toast});
initAccountMenu();
const hooks={render,navigate,renderEditor,updateResults};initDialogs(hooks);initWorkflow(hooks);initOrders(hooks);initWiring(hooks);
document.addEventListener('click',e=>{
 const navLink=e.target.closest('[data-nav]');if(navLink){if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();if(navLink.dataset.workspaceTab)state.myTab=navLink.dataset.workspaceTab;navigate(navLink.dataset.nav);return;}
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.themeChoice){state.theme=applyTheme(b.dataset.themeChoice,true);if(state.page==='editor')renderEditor();else render();document.querySelector('[data-theme-toggle]')?.focus({preventScroll:true});return;}
 if(b.dataset.templateLike){
  const t=templateById(b.dataset.templateLike);if(!t)return;
  requireAuth(()=>{
   const key='template:'+t.id,liked=!state.likes.includes(key);
   state.likes=liked?[...state.likes,key]:state.likes.filter(id=>id!==key);
   const saved=persist();
   document.querySelectorAll(`[data-template-like="${t.id}"]`).forEach(button=>{
    button.classList.toggle('is-liked',liked);button.setAttribute('aria-pressed',String(liked));
    button.setAttribute('aria-label',`${liked?'取消喜欢':'喜欢'}：${t.name}`);
    button.innerHTML=icon('heart',16)+`<span>${liked?'已喜欢':'喜欢'}</span>`;
   });
   if(!saved)toast('存储不可用，喜欢状态仅保留在当前页面');
  });return;
 }
 if(b.dataset.templateDetail){showModal(templateDetails(b.dataset.templateDetail),'template-dialog');return;}
 if(b.dataset.startTemplate){const t=templateById(b.dataset.startTemplate);if(t)requireAuth(()=>{state.templateId=t.id;newFlow(translate(t.prompt),'',t.id);navigate('editor');sendChat(translate(t.prompt));});return;}
 if(b.dataset.selectTemplate){const t=templateById(b.dataset.selectTemplate);if(!t)return;state.templateId=t.id;persist();document.querySelector('.template-picker').outerHTML=templatePicker(t.id);document.querySelector(`[data-select-template="${t.id}"]`)?.focus({preventScroll:true});return;}
 if(b.hasAttribute('data-editor-back')){requestEditorExit();return;}
 if(b.dataset.editorExit){
  const target=editorReturnTarget(),action=b.dataset.editorExit;
  if(action!=='save')return;
  const flow=currentFlow();if(!flow)return;
  const previousSavedAt=flow.savedAt;flow.savedAt=Date.now();
  if(!persist()){if(previousSavedAt===undefined)delete flow.savedAt;else flow.savedAt=previousSavedAt;toast('保存未完成，请恢复浏览器存储后重试。当前方案仍保留在编辑页。');return;}
  closeModal();navigate(target);toast('方案已保存，可在“我的 → 我的项目”中继续创作。');
  return;
 }
 if(b.dataset.page){navigate(b.dataset.page);return;}
 if(b.hasAttribute('data-collapse')){state.collapsed=!state.collapsed;document.body.classList.toggle('site-collapsed',state.collapsed);b.setAttribute('aria-label',state.collapsed?'展开侧边栏':'收起侧边栏');}
 if(b.hasAttribute('data-login'))requireAuth(()=>render());

 if(b.hasAttribute('data-logout')){state.auth=false;persist();closeModal();navigate('discover');toast('已退出账号');}
 if(b.dataset.category){state.category=b.dataset.category;updateResults();}
 if(b.dataset.filter){state[b.dataset.filter]=!state[b.dataset.filter];updateResults();}
 if(b.hasAttribute('data-reset')){state.query='';state.category='发现';state.code=false;state.bom=false;const input=document.getElementById('global-search');if(input)input.value='';if(state.page==='resources')searchResources();else updateResults();input?.focus({preventScroll:true});}
 if(b.hasAttribute('data-show-kits')){state.category='教育';navigate('discover');}
 if(b.dataset.myTab){state.myTab=b.dataset.myTab;const url=new URL(location.href);url.searchParams.set('tab',state.myTab);history.replaceState({},'',url);render();document.querySelector(`[data-my-tab="${state.myTab}"]`)?.focus({preventScroll:true});}
 if(b.dataset.projectDelete){const id=b.dataset.projectDelete,project=state.projects.find(item=>(item.flowId||item.id)===id),flow=state.flows[id];if(!project&&!flow)return;const name=flow?.name||project?.name||'未命名方案';showModal(`<div class="simple-modal project-delete-modal"><button class="dialog-close icon-button" data-close aria-label="取消删除">${icon('close',18)}</button><h2 id="dialog-title">删除方案？</h2><p>${esc(name)}</p><p>删除后会移除这份方案及其设计内容，已经创建的订单记录会保留。</p><div class="address-form-actions"><button class="secondary" data-close>取消</button><button class="secondary project-delete-confirm" data-project-delete-confirm data-value="${esc(id)}">确认删除</button></div></div>`,'project-delete-dialog');return;}
 if(b.hasAttribute('data-project-delete-confirm')){const saved=removeProject(b.dataset.value);closeModal();state.myTab='projects';render();toast(saved?'方案已删除':'删除尚未保存，请恢复存储后重试');return;}
 if(b.dataset.edit){state.flowId=b.dataset.edit;persist();navigate('editor');}
 if(b.dataset.promptTemplate){const t=templateById(b.dataset.promptTemplate);if(!t)return;state.templateId=t.id;const input=document.getElementById('idea');input.value=translate(t.prompt);input.placeholder=t.prompt;input.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('chosen-template').textContent='当前方案：'+t.name;document.querySelectorAll('[data-prompt-template]').forEach(el=>{const selected=el.dataset.promptTemplate===t.id;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);const status=el.querySelector('svg');if(status)status.outerHTML=icon(selected?'check':'plus',14);});persist();input.focus({preventScroll:true});return;}
 if(b.dataset.prompt){const input=document.getElementById('idea');input.value=localizedPrompt(b.dataset.prompt);input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();}
 if(b.hasAttribute('data-save-idea')){state.idea=document.getElementById('idea').value;const routeSaved=saveRouteDraft(state),ok=persist()&&routeSaved;toast(ok?'草稿已保存':'存储不可用，输入仅保留在当前页面');}
});
document.addEventListener('input',e=>{
 if(e.target.id==='global-search'){state.query=e.target.value;if(state.page==='resources')searchResources();else updateResults();}
 if(e.target.id==='idea'){state.idea=e.target.value;saveRouteDraft(state);document.getElementById('idea-count').textContent=e.target.value.length+' / 2000';document.getElementById('generate').disabled=!e.target.value.trim();persist();}
});
document.addEventListener('change',e=>{if(e.target.id==='sort'){state.sort=e.target.value;updateResults();}});
document.addEventListener('submit',e=>{if(e.target.id!=='idea-form')return;e.preventDefault();const idea=document.getElementById('idea').value.trim();if(!idea)return;if(currentCreationRoute()!=='boutique'){const saved=saveRouteDraft(state);toast(saved?'需求已保存，可在当前路线继续编辑':'存储不可用，需求暂存在当前页面');return;}const flow=newFlow(idea,'',state.templateId);flow.creationRoute='boutique';persist();navigate('editor');sendChat(idea);});
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){const search=document.getElementById('global-search');if(search){e.preventDefault();search.focus();}}});
window.addEventListener('popstate',()=>{closeModal();const params=new URLSearchParams(location.search);const nextPage=params.get('page')||'discover';if(nextPage==='editor')editorOrigin=params.get('from')||editorOrigin;else if(!['checkout','confirm'].includes(nextPage))editorOrigin='';state.page=nextPage;if(nextPage==='my')state.myTab=['projects','saved','orders'].includes(params.get('tab'))?params.get('tab'):'projects';orderId=params.get('order')||'';const flow=params.get('flow');if(flow&&state.flows[flow])state.flowId=flow;render();if(params.get('project'))detail(params.get('project'));});
window.addEventListener('storage',e=>{if(e.key==='weibo-stack-prototype-v2'){toast('另一个窗口修改了项目；刷新页面可读取最新记录，当前输入暂时保留。');}});
for(const event of ['online','offline'])window.addEventListener(event,()=>{const notice=document.getElementById('network-notice');if(notice)notice.hidden=navigator.onLine;toast(navigator.onLine?'网络已恢复':'当前离线，输入会继续保留');});
render();
const initialProject=new URLSearchParams(location.search).get('project');if(initialProject)detail(initialProject);
if(state.storageError)toast('浏览器存储不可用，当前更改仅在页面中保留');
