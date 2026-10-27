import {userAvatar} from './avatar.js?v=20261027-web-r4';
import {icon} from './icons.js?v=20261027-web-r4';

export function accountControl(){
 return `<div class="account-control">
  <button class="account-button" type="button" data-account aria-label="账号菜单" aria-haspopup="menu" aria-controls="account-dropdown" aria-expanded="false">${userAvatar()}</button>
  <div class="account-dropdown" id="account-dropdown" hidden>
   <div class="account-menu-profile">${userAvatar('account-menu-avatar')}<strong>创作者</strong></div>
   <div class="account-menu-actions" role="menu" aria-label="我的账号">
    <button type="button" role="menuitem" data-page="my">${icon('folder',18)}<span>我的工作区</span>${icon('arrow',15)}</button>
    <button type="button" role="menuitem" data-logout>${icon('logout',18)}<span>退出账号</span></button>
   </div>
  </div>
 </div>`;
}

function elements(){
 return {trigger:document.querySelector('[data-account]'),panel:document.getElementById('account-dropdown')};
}
export function closeAccountMenu(restoreFocus=false){
 const {trigger,panel}=elements();
 if(!panel||panel.hidden)return;
 panel.hidden=true;
 trigger?.setAttribute('aria-expanded','false');
 if(restoreFocus)trigger?.focus({preventScroll:true});
}
function openAccountMenu(last=false){
 const {trigger,panel}=elements();
 if(!panel||!trigger)return;
 panel.hidden=false;
 trigger.setAttribute('aria-expanded','true');
 const items=panel.querySelectorAll('[role="menuitem"]');
 items[last?items.length-1:0]?.focus({preventScroll:true});
}
export function initAccountMenu(){
 document.addEventListener('click',event=>{
  if(event.target.closest('[data-account]')){
   const {panel}=elements();
   if(panel?.hidden)openAccountMenu();else closeAccountMenu(true);
  }else if(event.target.closest('.account-menu-actions button'))closeAccountMenu();
 });
 document.addEventListener('pointerdown',event=>{
  if(!event.target.closest('.account-control'))closeAccountMenu();
 });
 document.addEventListener('focusin',event=>{
  if(!event.target.closest('.account-control'))closeAccountMenu();
 });
 document.addEventListener('keydown',event=>{
  const {trigger,panel}=elements();
  if(event.target===trigger&&['ArrowDown','ArrowUp'].includes(event.key)){
   event.preventDefault();openAccountMenu(event.key==='ArrowUp');return;
  }
  if(!panel||panel.hidden)return;
  if(event.key==='Escape'){
   event.preventDefault();event.stopPropagation();closeAccountMenu(true);return;
  }
  if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||!panel.contains(event.target))return;
  event.preventDefault();
  const items=[...panel.querySelectorAll('[role="menuitem"]')];
  const index=items.indexOf(document.activeElement);
  const next=event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length;
  items[next]?.focus({preventScroll:true});
 });
}
