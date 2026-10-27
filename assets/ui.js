import {icon} from './icons.js?v=20261027-web-r3';
let focusBefore=null,onClosed=null;
const modal=document.getElementById('modal');
export function toast(text){const el=document.getElementById('toast');el.textContent=text;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.hidden=true,4200);}
export function showModal(html,type='',onClose=null){if(!modal.open)focusBefore=document.activeElement;onClosed=onClose;modal.className=type;document.getElementById('modal-content').innerHTML=html;if(!modal.open)modal.showModal();modal.scrollTop=0;const focus=modal.querySelector('[autofocus],button,input,textarea,select');focus?.focus({preventScroll:true});}
function finishClose(){const cb=onClosed;onClosed=null;cb?.();if(focusBefore?.isConnected)focusBefore.focus({preventScroll:true});else document.querySelector('main h1,.editor-header input')?.focus({preventScroll:true});}
export function closeModal(){if(modal.open){modal.close();finishClose();}}
// A queued close event from the previous dialog must not close the new one.
modal.addEventListener('close',()=>{if(!modal.open&&onClosed)finishClose();});
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
document.addEventListener('click',event=>{if(event.target.closest('[data-close]'))closeModal();});
export function simpleModal(title,content){showModal(`<div class="simple-modal"><button class="dialog-close icon-button" data-close aria-label="关闭">${icon('close',18)}</button><h2 id="dialog-title">${title}</h2>${content}</div>`);}
export function download(name,body,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}

export function guideButton(){return `<button class="secondary guide-button" type="button" data-info="docs">${icon('book',20)}<span>使用指南</span></button>`;}
