import {icon} from './icons.js?v=20261027-web-r4';
import {productTemplates} from './product-templates.js?v=20261027-web-r4';
import {english} from './i18n-messages.js?v=20261027-web-r4';

const storageKey='weibo-interface-language';
const attributes=['aria-label','aria-description','title','placeholder','alt'];
const originals=new WeakMap();
const ignored='[translate="no"], [data-user-content], .creator, script, style, code, pre';
let locale='zh-CN',observer;
try{if(localStorage.getItem(storageKey)==='en')locale='en';}catch{}
export const getLanguage=()=>locale;
const phraseKeys=Object.keys(english).filter(key=>key.length>1).sort((a,b)=>b.length-a.length);
const escapeRegex=value=>value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const phrasePattern=new RegExp(phraseKeys.map(escapeRegex).join('|'),'g');
const patterns=[
 [/^已保存你的补充需求。当前继续使用「(.+)」资料模板；可以查看方案详情、调整模块和连线，再填写订单详情。$/,(_,name)=>`Requirements saved. Continue with the ${translate(name,'en')} template: review the design, adjust modules and wiring, then enter order details.`],
 [/^已选择「(.+)」(.+) 方案。(.*)$/,(_,name,model,note)=>`Selected ${translate(name,'en')} (${model}). ${translate(note,'en')}`],

 [/^已按「(.+)」资料整理模块接线。(.*)$/,(_,name,note)=>`Module wiring follows the ${translate(name,'en')} documents. ${translate(note,'en')}`],
 [/^已选择「(.+)」资料模板；可以查看方案详情、调整模块和连线，再填写订单详情。$/,(_,name)=>`${translate(name,'en')} template selected. Review the design, adjust modules and connections, then enter order details.`],
 [/^已保存你的补充需求。当前继续使用「(.+)」方案。(.*)$/,(_,name,note)=>`Additional requirements saved. Continuing with the ${translate(name,'en')} design. ${translate(note,'en')}`],
 [/^(.+)方案$/,(_,name)=>`${translate(name,'en')} design`],
 [/^放大查看(智能花盆|录音笔|智能手表)(.+)$/,(_,name,stage)=>`Enlarge ${translate(name,'en')} — ${translate(stage,'en')}`],
 [/^采购 (.+)$/,(_,name)=>`Include ${translate(name,'en')}`],
 [/^减少 (.+) 的采购数量$/,(_,name)=>`Decrease quantity for ${translate(name,'en')}`],
 [/^增加 (.+) 的采购数量$/,(_,name)=>`Increase quantity for ${translate(name,'en')}`],
 [/^(.+) 采购数量$/,(_,name)=>`${translate(name,'en')} order quantity`],
 [/^(\d+) 种 · (\d+) 件$/,(_,n,q)=>`${n} types · ${q} items`],
 [/^(\d+) \/ (\d+) 条已连接$/,(_,n,total)=>`${n} / ${total} connected`],
 [/^(\d+) 种器件$/,(_,n)=>`${n} component types`],

 [/^已选 (\d+) 项服务$/,(_,n)=>`${n} services selected`],
 [/^(\d+) 个器件 · (\d+) 条连线$/,(_,n,w)=>`${n} components · ${w} connections`],
 [/^(\d+) 个器件已作为上下文$/,(_,n)=>`${n} components in context`],
 [/^(\d+) 个器件$/,(_,n)=>`${n} components`],
 [/^(\d+) 条连线$/,(_,n)=>`${n} connections`],
 [/^(\d+) 个作品$/,(_,n)=>`${n} projects`],
 [/^共 (\d+) 个结果$/,(_,n)=>`${n} results`],
 [/^(\d+)次浏览，(\d+)次复制$/,(_,n,c)=>`${n} views, ${c} copies`],
 [/^(\d+) \/ (\d+) 个阶段( · 已暂停)?$/,(_,n,total,paused)=>`${n} / ${total} stages${paused?' · Paused':''}`],
 [/^共 (\d+) 页，点击图片翻页查看$/,(_,n)=>`${n} pages. Click the image to browse.`],
 [/^查看全部 (\d+) 页$/,(_,n)=>`View all ${n} pages`],
 [/^(.+)，第 (\d+) 页$/,(_,name,n)=>`${translate(name,'en')}, page ${n}`],
 [/^(.+) · 第 (\d+) \/ (\d+) 页$/,(_,name,n,total)=>`${translate(name,'en')} · Page ${n} / ${total}`],
 [/^正在整理(.+)…$/,(_,name)=>`Preparing ${translate(name,'en')}…`],
 [/^查看(.+)方案详情$/,(_,name)=>`View ${translate(name,'en')} details`],
 [/^查看(.+)方案$/,(_,name)=>`View ${translate(name,'en')} design`],
 [/^使用(.+)方案$/,(_,name)=>`Use ${translate(name,'en')} design`],
 [/^放大查看(.+)$/,(_,name)=>`Enlarge ${translate(name,'en')}`],
 [/^(.+)方案图$/,(_,name)=>`${translate(name,'en')} design images`],
 [/^移动 (.+)，可使用方向键$/,(_,name)=>`Move ${translate(name,'en')} with arrow keys`],
 [/^(.+) 引脚 (.+)，点击选择连线端点$/,(_,name,pin)=>`${translate(name,'en')} pin ${translate(pin,'en')}; select connection endpoint`],
 [/^重新获取（(\d+)s）$/,(_,n)=>`Resend (${n}s)`],
 [/^(\d+) 套$/,(_,n)=>`${n} units`],
];
/** Translate authored interface copy only; never use this for user input or data keys. */
export function translate(value,language=locale){
 if(language!=='en'||typeof value!=='string')return value;
 const text=value.trim();
 let result=english[text];
 if(result===undefined){for(const [pattern,format] of patterns){if(pattern.test(text)){result=text.replace(pattern,format);break;}}}
 if(result===undefined)result=text.replace(phrasePattern,match=>english[match]);
 return value.slice(0,value.indexOf(text))+result+value.slice(value.indexOf(text)+text.length);
}
// Exact preset matching keeps authored input intact, including edited templates.
const presetPrompts=[...productTemplates.map(template=>template.prompt),
 '我想用 ESP32、AHT10 和 OLED 做一个桌面温湿度显示器。',
 '介绍一下从 AI 对话、添加器件、连线到下单的完整流程。',
 '我第一次做硬件，请推荐一套容易上手的器件。',
 '请讲解 ESP32、AHT10 与 OLED 的 I²C 连接方法。'];
const defaultProjectNames=productTemplates.map(template=>template.name+' · 我的方案').concat('未命名项目','花盆流程验收');
export const isLocalizableProjectName=value=>defaultProjectNames.includes(value);
export const isLocalizableUsage=value=>['办公桌绿植养护','会议语音记录','腕上交互体验'].includes(value);
export function localizedPrompt(value,language=locale){
 const source=presetPrompts.find(prompt=>value===prompt||value===english[prompt]);
 return source?translate(source,language):value;
}
function localizePresetInput(element){
 if(!element.matches('textarea#idea,textarea#chat-input'))return;
 const next=localizedPrompt(element.value);
 if(next===element.value)return;
 element.value=next;
 // Reuse the regular input path so draft state, counters and persistence agree.
 element.dispatchEvent(new Event('input',{bubbles:true}));
}
export function languageControl(){
 return `<button type="button" class="theme-switch icon-button language-switch" data-language-toggle aria-label="Switch to English" title="Switch to English">${icon('languages',18)}</button>`;
}

function retained(node,key,current){
 let record=originals.get(node);if(!record){record={};originals.set(node,record);}
 if(!record[key]||current!==record[key].rendered)record[key]={source:current,rendered:current};
 const entry=record[key];entry.rendered=translate(entry.source);return entry.rendered;
}
function translateElement(element){
 localizePresetInput(element);
 if(element.closest(ignored)||element.closest('[data-language-toggle]'))return;
 for(const attr of attributes){if(element.hasAttribute(attr)){
  const previous=element.getAttribute(attr),next=retained(element,attr,previous);
  if(previous!==next)element.setAttribute(attr,next);
 }}
 // An option without a value inherits its visible label. Preserve the business value.
 if(element.tagName==='OPTION'&&!element.hasAttribute('value'))element.setAttribute('value',element.textContent);
}
function translateText(node){
 const parent=node.parentElement;
 if(!parent||parent.closest(`${ignored},textarea,input,[contenteditable],[data-language-toggle]`))return;
 const next=retained(node,'text',node.nodeValue);
 if(next!==node.nodeValue)node.nodeValue=next;
}
function translateTree(root){
 if(!root)return;
 if(root.nodeType===3){translateText(root);return;}
 if(root.nodeType!==1&&root.nodeType!==9&&root.nodeType!==11)return;
 if(root.nodeType===1){if(root.closest(ignored))return;translateElement(root);}
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);
 for(let node=walker.nextNode();node;node=walker.nextNode()){
  if(node.nodeType===1)translateElement(node);else translateText(node);
 }
}
function updateControl(){
 document.documentElement.lang=locale;
 document.querySelectorAll('[data-language-toggle]').forEach(button=>{
  const label=locale==='en'?'切换为中文':'Switch to English';
  button.setAttribute('aria-label',label);button.setAttribute('title',label);
 });
}
function observe(){observer?.observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});}
export function localizePage(){
 observer?.disconnect();translateTree(document.body);translateTree(document.querySelector('title'));updateControl();observe();
}
export function setLanguage(next,{persist=true}={}){
 if(!['zh-CN','en'].includes(next))return false;
 locale=next;let saved=true;
 if(persist)try{localStorage.setItem(storageKey,next);}catch{saved=false;}
 localizePage();
 const feedback=document.getElementById('language-status');
 if(feedback)feedback.textContent=saved?(locale==='en'?'Language changed to English':'已切换为中文'):(locale==='en'?'English selected for this session. Language preference could not be saved.':'已切换为中文；存储不可用，语言偏好仅在当前页面保留。');
 document.dispatchEvent(new CustomEvent('languagechange',{detail:{locale}}));
 return saved;
}
const handleLanguageClick=event=>{if(event.target.closest('[data-language-toggle]'))setLanguage(locale==='en'?'zh-CN':'en');};
const handleLanguageStorage=event=>{if(event.key===storageKey)setLanguage(event.newValue==='en'?'en':'zh-CN',{persist:false});};
export function disposeLanguage(){
 observer?.disconnect();observer=undefined;
 document.removeEventListener('click',handleLanguageClick);
 window.removeEventListener('storage',handleLanguageStorage);
}
export function initLanguage(){
 if(observer)return;
 observer=new MutationObserver(records=>{
  observer.disconnect();
  for(const record of records){
   if(record.type==='childList')record.addedNodes.forEach(translateTree);
   else if(record.type==='characterData')translateText(record.target);
   else translateElement(record.target);
  }
  updateControl();observe();
 });
 document.addEventListener('click',handleLanguageClick);
 window.addEventListener('storage',handleLanguageStorage);
 localizePage();
}
