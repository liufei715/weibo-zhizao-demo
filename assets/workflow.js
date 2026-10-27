import {localizedPrompt} from './i18n.js?v=20261027-web-r2';
import {startProductJourney,stopProductJourney,productJourneyFor,hasProductJourney} from './product-journey.js?v=20261027-web-r2';
import {assistantText} from './project-copy.js?v=20261027-web-r2';
import {templateFor} from './product-templates.js?v=20261027-web-r2';
import {productPreview} from './template-workbench.js?v=20261027-web-r2';
import {icon,esc} from './icons.js?v=20261027-web-r2';
import {state,currentFlow,persist,updateFlowName} from './store.js?v=20261027-web-r2';
import {modulesFor,connectionsFor,allModules,allWires,layoutFor,money} from './workflow-data.js?v=20261027-web-r2';
import {deviceVisual} from './editor-view.js?v=20261027-web-r2';
import {toast,showModal,simpleModal,closeModal,download} from './ui.js?v=20261027-web-r2';
let hooks={};
export function initWorkflow(api){hooks=api;}
export function sendChat(text){
 const f=currentFlow();if(!f||f.busy||!text.trim())return;
 text=text.trim().slice(0,2000);f.messages.push({role:'user',text});f.chatDraft='';
 if(hasProductJourney(f)&&(!productJourneyFor(f)||/重新.*(生成|整理|设计)|重新开始/.test(text))){startProductJourney(f,hooks);return;}
 const wire=/接线|连线|连接|I2C|I²C/i.test(text)&&allModules(f);
 if(f.name==='未命名项目')updateFlowName(f,templateFor(f)?.name||'桌面温湿度显示器');
 f.updatedAt=Date.now();persist();f.busy=wire?'wire':'plan';hooks.renderEditor();
 const id=f.id;
 setTimeout(()=>{
  const flow=state.flows[id];if(!flow)return;flow.busy=null;
  let response='';
  if(templateFor(flow)){const t=templateFor(flow);if(wire){flow.wireSuggested=true;response='已按「'+t.name+'」资料整理模块接线。'+t.wireNote;}else if(!flow.plan){flow.plan=true;flow.stage='plan';response='已选择「'+t.name+'」'+t.model+' 方案。'+t.summary+' 先添加模块，再确认连线和交付详情。你的需求会随项目保存。';}else{response='已保存你的补充需求。当前继续使用「'+t.name+'」资料模板；可以查看方案详情、调整模块和连线，再填写订单详情。';}}
  else if(wire){flow.wireSuggested=true;response='器件已经就位。已整理接线配置：电源、地线、SDA 与 SCL 分别连接到两个模块。可点击「应用全部连线」，也可在画布上逐个选择对应引脚。';}
  else if(/代码|code|程序|烧录/i.test(text)&&flow.plan){response='可在 Code 面板编辑并导出 Arduino 程序。烧录前请核对目标硬件、引脚和依赖配置。';}
  else if(!flow.plan){flow.plan=true;flow.stage='plan';response='基于「桌面温湿度显示器」方案：ESP32 负责控制，AHT10 负责感知，OLED 负责显示。先添加器件，再完成接线与下单。你的需求会随项目保存。';}
  else{response='你的补充已保留在当前对话。当前使用温湿度方案：可以继续添加器件、生成接线方案，或在 Code 面板编辑程序。';}
  flow.messages.push({role:'assistant',text:assistantText(response)});persist();if(state.page==='editor'&&state.flowId===id){hooks.renderEditor();document.getElementById('chat-body')?.scrollTo({top:100000,behavior:'smooth'});}
 },850);
}
function library(){const f=currentFlow(),modules=modulesFor(f);showModal(`<div class="simple-modal"><button class="dialog-close icon-button" data-close aria-label="关闭器件库">${icon('close',18)}</button><h2 id="dialog-title">给想法，找到合适的器件。</h2><p>选择适合当前方案的器件，添加到画布继续设计。</p><div class="library-grid">${modules.map(m=>`<div class="library-item"><span class="library-art">${deviceVisual(m.kind)}</span><small>${m.role}</small><h3>${m.name}</h3><p>${m.description}</p><div><span>参考 ${money(m.price)}</span><button class="primary" data-wf="add-module" data-value="${m.id}" ${f.modules.includes(m.id)?'disabled':''}>${f.modules.includes(m.id)?'已添加':'+ 添加'}</button></div></div>`).join('')}</div></div>`,'library-dialog');}
function preview(){const f=currentFlow();if(!allWires(f)){toast('完成全部连线后可查看方案预览');return;}if(templateFor(f)){simpleModal('方案预览',productPreview(f));return;}simpleModal('运行预览',`<div class="simulation-preview"><div class="oled-simulation"><span>ENVIRONMENT MONITOR</span><strong>--<small>°C</small></strong><span>HUMIDITY <b>--%</b></span><i></i><small>ESP32 + AHT10 + OLED</small></div><div><span class="status-pill">${icon('play',12)}界面预览</span><h3>从连线，到看见结果。</h3><p>供电与 I²C 连线已整理，可继续核对物料和需求。</p><button class="primary" data-wf="bom">确认备料，继续下单${icon('arrow',16)}</button></div></div><p class="modal-note">温湿度数值需通过设备采集，完成接线后可继续硬件调试。</p>`,'方案预览');}
document.addEventListener('click',event=>{
 const b=event.target.closest('[data-wf]');if(!b)return;const f=currentFlow();if(!f)return;const value=b.dataset.value,modules=modulesFor(f),connections=connectionsFor(f);
 switch(b.dataset.wf){
 case 'view':f.view=value;persist();hooks.renderEditor();break;
 case 'canvas-mode':f.canvasMode=value;persist();hooks.renderEditor();break;
 case 'library':library();break;
 case 'add-module':if(modules.some(m=>m.id===value)&&!f.modules.includes(value)){f.modules.push(value);if(!f.selectedItems.includes(value))f.selectedItems.push(value);f.plan=true;f.stage='modules';persist();hooks.renderEditor();if(document.getElementById('modal').open)library();toast('器件已添加到画布');}break;
 case 'add-all':f.modules=modules.map(m=>m.id);f.selectedItems=modules.map(m=>m.id);f.stage='modules';persist();hooks.renderEditor();toast('已添加全部器件');break;
 case 'remove-module':f.modules=f.modules.filter(id=>id!==value);f.wires=f.wires.filter(w=>w.from!==value&&w.to!==value);f.selected='';f.pendingPin=null;persist();hooks.renderEditor();toast('已移除器件及相关连线，可从器件库重新添加');break;
 case 'suggest-wires':sendChat('器件已经添加，请生成详细接线配置。');break;
 case 'connect-all':if(!allModules(f)){toast('请先添加全部器件');break;}f.wires=connections.map(c=>({...c}));f.pendingPin=null;f.stage='wired';persist();hooks.renderEditor();toast('全部连线已应用到画布');break;
 case 'highlight-wire':f.highlight=value;hooks.renderEditor();setTimeout(()=>{const row=document.querySelector(`[data-wf="highlight-wire"][data-value="${value}"]`);row?.scrollIntoView({block:'nearest'});},0);break;
 case 'toggle-wire':f.pendingPin=null;hooks.renderEditor();toast('选择起点引脚，再选择另一个器件的对应引脚');break;
 case 'zoom-in':f.zoom=Math.min(1.3,Math.round((f.zoom+.1)*10)/10);persist();hooks.renderEditor();break;
 case 'zoom-out':f.zoom=Math.max(.6,Math.round((f.zoom-.1)*10)/10);persist();hooks.renderEditor();break;
 case 'layout':f.positions=layoutFor(f);f.zoom=1;persist();hooks.renderEditor();toast('已重置画布布局');break;
 case 'preview':preview();break;
 case 'download-code':download(templateFor(f)?templateFor(f).model+'-开发备注.txt':'weibo-environment.ino',f.code);toast('已导出程序文件');break;
 case 'new-chat':stopProductJourney(f);f.history=[...(f.history||[]),{messages:f.messages,plan:f.plan,wireSuggested:f.wireSuggested,productJourney:productJourneyFor(f)?structuredClone(productJourneyFor(f)):null}];f.productJourney=null;f.planterJourney=null;f.messages=[];f.plan=false;f.wireSuggested=false;f.chatDraft='';persist();hooks.renderEditor();toast('已新建对话，器件与连线已保留');break;
 case 'history':simpleModal('对话记录',`<p>查看当前项目的历史对话，并恢复继续创作。</p>${(f.history||[]).length?(f.history||[]).map((h,i)=>`<p><button class="secondary" data-wf="restore-history" data-value="${i}">${esc(h.messages.find(m=>m.role==='user')?.text.slice(0,60)||'未命名对话')}${icon('arrow',16)}</button></p>`).join(''):'<p class="modal-note">还没有历史对话。使用右上角「新建对话」后可在这里恢复。</p>'}`);break;
 case 'restore-history':{const h=f.history[Number(value)];if(h){stopProductJourney(f);const old={messages:f.messages,plan:f.plan,wireSuggested:f.wireSuggested,productJourney:productJourneyFor(f)?structuredClone(productJourneyFor(f)):null};Object.assign(f,h,{productJourney:h.productJourney||h.planterJourney||null,planterJourney:null});f.history[Number(value)]=old;persist();closeModal();hooks.renderEditor();toast('已恢复历史对话');}break;}
 }
});
document.addEventListener('input',e=>{
 const f=currentFlow();if(!f)return;
 if(e.target.id==='chat-input'){f.chatDraft=e.target.value;document.getElementById('chat-count').textContent=e.target.value.length+' / 2000';document.querySelector('#chat-form [type="submit"]').disabled=!e.target.value.trim()||!!f.busy;persist();}
 if(e.target.id==='code-editor'){f.code=e.target.value;persist();}
 if(e.target.id==='project-name'){updateFlowName(f,e.target.value);const label=document.getElementById('save-state');if(label)label.innerHTML=icon('check',12)+(state.storageError?'仅当前页面保留':'已保存');}
});
document.addEventListener('submit',e=>{if(e.target.id!=='chat-form')return;e.preventDefault();sendChat(document.getElementById('chat-input').value);});
document.addEventListener('click',e=>{const b=e.target.closest('[data-chat-prompt]');if(b)sendChat(localizedPrompt(b.dataset.chatPrompt));});
document.addEventListener('keydown',e=>{if(e.target.id==='chat-input'&&(e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();sendChat(e.target.value);}});
