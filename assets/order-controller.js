import {quoteServices,selectedQuoteServices,quoteAmount,quotationError,syncQuotationControls,updateQuoteServices} from './quotation.js?v=20261027-web-r3';
import {templateFor} from './product-templates.js?v=20261027-web-r3';
import {validateProductOrder} from './template-order.js?v=20261027-web-r3';
import {icon,esc} from './icons.js?v=20261027-web-r3';
import {state,currentFlow,persist,removeOrder} from './store.js?v=20261027-web-r3';
import {modulesFor,allWires,money,total,selectedModules,regionHints} from './workflow-data.js?v=20261027-web-r3';
import {bomView,purchaseList,addressForm,orderDetail} from './order-view.js?v=20261027-web-r3';
import {showModal,closeModal,toast,download} from './ui.js?v=20261027-web-r3';
let hooks={},orderSubmitting=false;
export function initOrders(api){hooks=api;}
function openBom(){const f=currentFlow();showModal(bomView(f),'bom-dialog',()=>{if(state.page==='checkout'||state.page==='confirm')hooks.render();});updateBom();}
function updateBom(){const f=currentFlow();if(!f)return;const count=selectedModules(f).length,amount=total(f);const c=document.getElementById('bom-selected-count'),t=document.getElementById('bom-total'),all=document.getElementById('bom-all'),checkout=document.getElementById('bom-checkout');if(c)c.textContent=count;if(t)t.textContent=money(amount);if(all){all.checked=count===f.modules.length&&count>0;all.indeterminate=count>0&&count<f.modules.length;}if(checkout)checkout.disabled=!count;document.querySelector('[data-wf="purchase-list"]')?.toggleAttribute('disabled',!count);document.querySelectorAll('[data-quantity]').forEach(input=>{const id=input.dataset.quantity;input.value=f.procurement[id];input.parentElement.querySelector('[data-wf="quantity-minus"]').disabled=f.procurement[id]<=1;input.parentElement.querySelector('[data-wf="quantity-plus"]').disabled=f.procurement[id]>=99;});if(document.querySelector('.purchase-list'))document.getElementById('purchase-pane').innerHTML=purchaseList(f);}
function openAddress(id=''){const address=state.addresses.find(a=>a.id===id)||{};showModal(addressForm(address),'address-dialog');}
function quantity(id,value){const f=currentFlow();if(!Number.isInteger(value)||value<1||value>99){toast('采购数量请输入 1 到 99 的整数');updateBom();return;}f.procurement[id]=value;persist();updateBom();}
export function validateAddress(form){
 const data=Object.fromEntries(new FormData(form));Object.keys(data).forEach(k=>data[k]=String(data[k]).trim());
 const limits={name:30,phone:40,company:80,province:40,city:40,district:40,detail:200,postcode:40,email:100,tag:12,customTag:12};
 for(const [key,limit] of Object.entries(limits))data[key]=(data[key]||'').slice(0,limit);
 return data;
}
function submitOrder(){
 const f=currentFlow();if(!f||orderSubmitting)return;
 if(f.lastOrderToken===f.checkoutToken&&state.orders.some(o=>o.id===f.lastOrderId)){hooks.navigate('success',f.lastOrderId);return;}
 const quoteInvalid=quotationError(f);if(quoteInvalid){hooks.navigate('checkout');toast(quoteInvalid);return;}
 const address=state.addresses.find(a=>a.id===state.addressId),amount=quoteAmount(f);if(!selectedModules(f).length){hooks.navigate('checkout');toast('请先选择采购物料');return;}const invalid=validateProductOrder(f);if(invalid){hooks.navigate('checkout');toast(invalid.message);document.getElementById(invalid.field)?.focus();return;}
 orderSubmitting=true;const button=document.querySelector('[data-wf="submit-order"]');if(button){button.disabled=true;button.innerHTML='<span class="spinner"></span>正在创建订单…';}
 setTimeout(()=>{
  try{
   // A token makes repeated clicks and back/forward submissions idempotent.
   if(!f.checkoutToken)f.checkoutToken='checkout-'+Date.now().toString(36);
   const existing=state.orders.find(o=>o.token===f.checkoutToken);if(existing){hooks.navigate('success',existing.id);return;}
   const id='WB-'+Date.now().toString(36).toUpperCase();
   const order={quoteServices:structuredClone(selectedQuoteServices(f)),templateId:f.templateId||'',orderDetails:f.templateId?structuredClone(f.orderDetails):null,designSnapshot:f.templateId?{modules:[...f.modules],wires:structuredClone(f.wires),idea:f.idea}:null,id,token:f.checkoutToken,projectId:f.id,projectName:f.name,amount,items:selectedModules(f).map(m=>({id:m.id,name:m.full,price:m.price,quantity:f.procurement[m.id]})),remarks:f.remarks||'',createdAt:Date.now(),status:'待报价确认'};
   state.orders.unshift(order);if(address)state.orderAddresses[id]={...address};f.lastOrderId=id;f.lastOrderToken=f.checkoutToken;f.stage='ordered';
   const saved=persist();hooks.navigate('success',id);toast(saved?'订单已创建':'订单仅保留在当前页面，浏览器存储不可用');
  }finally{orderSubmitting=false;}
 },650);
}
document.addEventListener('click',e=>{
 const b=e.target.closest('[data-wf]');if(!b)return;const action=b.dataset.wf,value=b.dataset.value;
 if(action==='order-detail'){const order=state.orders.find(o=>o.id===value);if(order)showModal(orderDetail(order,state),'order-detail-dialog');return;}
 if(action==='order-delete'){
  const order=state.orders.find(o=>o.id===value);if(!order)return;
  showModal(`<div class="simple-modal"><h2 id="dialog-title">删除订单？</h2><p translate="no">${esc(order.projectName)}</p><p>删除后将移除此订单记录，关联的设计方案会保留。</p><div class="address-form-actions"><button class="secondary" data-close>取消</button><button class="secondary order-delete" data-wf="order-delete-confirm" data-value="${esc(value)}">确认删除</button></div></div>`,'order-delete-dialog');return;
 }
 if(action==='order-delete-confirm'){
  if(!state.orders.some(o=>o.id===value)){closeModal();hooks.render();return;}
  const saved=removeOrder(value);closeModal();state.myTab='orders';
  if(state.page==='success')hooks.navigate('my');else hooks.render();
  toast(saved?'订单已删除':'删除尚未保存，请恢复存储后重试');return;
 }
 const f=currentFlow();if(!f)return;
 switch(action){
 case 'bom':openBom();break;
 case 'quantity-minus':quantity(value,(f.procurement[value]||1)-1);break;
 case 'quantity-plus':quantity(value,(f.procurement[value]||1)+1);break;
 case 'purchase-list':document.getElementById('purchase-pane').innerHTML=purchaseList(f);break;
 case 'export-bom':{const csv='\uFEFF物料,数量,参考单价,参考合计\r\n'+selectedModules(f).map(m=>`"${m.full}",${f.procurement[m.id]},${m.price===null?'待报价':m.price},${m.price===null?'待报价':m.price*f.procurement[m.id]}`).join('\r\n');download('蔚博智造-采购清单.csv',csv,'text/csv;charset=utf-8');toast('已导出采购清单');break;}
 case 'checkout':if(templateFor(f)&&!allWires(f)){toast('请先完成方案模块连线，再填写下单详情');break;}if(!selectedModules(f).length){toast('请选择至少一种物料');break;}f.checkoutToken='checkout-'+Date.now().toString(36);persist();closeModal();hooks.navigate('checkout');break;
 case 'new-address':openAddress();break;
 case 'edit-address':openAddress(value);break;
 case 'select-address':state.addressId=value;persist();hooks.render();break;
 case 'confirm-order':{if(quotationError(f)){syncQuotationControls(f);document.getElementById('quote-options')?.focus();break;}const error=document.getElementById('checkout-error');const invalid=validateProductOrder(f);if(invalid){error.hidden=false;error.textContent=invalid.message;const field=document.getElementById(invalid.field);if(field){field.setAttribute('aria-invalid','true');field.focus();}else{error.tabIndex=-1;error.focus();}break;}if(!selectedModules(f).length){error.hidden=false;error.textContent='至少选择一种采购物料。';break;}persist();hooks.navigate('confirm');break;}
 case 'submit-order':submitOrder();break;
 }
});
document.addEventListener('change',e=>{
 const f=currentFlow();if(f&&(e.target.dataset.quoteService||e.target.id==='quote-all')){updateQuoteServices(f,e.target.dataset.quoteService||'all',e.target.checked);persist();syncQuotationControls(f);return;}if(e.target.id==='bom-all'&&f){f.selectedItems=e.target.checked?[...f.modules]:[];document.querySelectorAll('[data-bom-item]').forEach(el=>el.checked=e.target.checked);persist();updateBom();}
 if(e.target.dataset.bomItem&&f){const id=e.target.dataset.bomItem;f.selectedItems=e.target.checked?[...new Set([...f.selectedItems,id])]:f.selectedItems.filter(x=>x!==id);persist();updateBom();}
 if(e.target.dataset.quantity)quantity(e.target.dataset.quantity,Number(e.target.value));
 const form=e.target.closest('#address-form');if(!form)return;
 if(e.target.name==='province'){const hints=regionHints[e.target.value]||{};const cities=Object.keys(hints);document.getElementById('city-options').innerHTML=cities.map(c=>`<option>${esc(c)}</option>`).join('');document.getElementById('district-options').innerHTML='';}
 if(e.target.name==='city'){document.getElementById('district-options').innerHTML=(regionHints[form.elements.province.value]?.[e.target.value]||[]).map(d=>`<option>${esc(d)}</option>`).join('');}
 if(e.target.name==='tag')form.elements.customTag.hidden=e.target.value!=='自定义';
});
document.addEventListener('input',e=>{if(e.target.dataset.quantity){const value=Number(e.target.value);if(Number.isInteger(value)&&value>=1&&value<=99)quantity(e.target.dataset.quantity,value);}if(e.target.id==='order-remarks'){currentFlow().remarks=e.target.value;document.getElementById('remarks-count').textContent=e.target.value.length;persist();}if(e.target.closest('#address-form')&&e.target.name){e.target.removeAttribute('aria-invalid');const err=document.querySelector(`[data-error="${e.target.name}"]`);if(err)err.textContent='';}});
document.addEventListener('submit',e=>{if(e.target.id!=='address-form')return;e.preventDefault();const data=validateAddress(e.target);if(!data)return;const id=e.target.dataset.editId||'address-'+Date.now().toString(36);const a={...data,id};const index=state.addresses.findIndex(a=>a.id===id);if(index>=0)state.addresses[index]=a;else state.addresses.push(a);state.addressId=id;persist();closeModal();hooks.render();toast('收货地址已保存');});

function saveProductField(e){const field=e.target.dataset.orderField,f=currentFlow();if(!field||!f?.orderDetails)return;if(!['quantity','usage','delivery','finish','schedule'].includes(field))return;f.orderDetails[field]=field==='quantity'?Number(e.target.value):e.target.value;e.target.removeAttribute('aria-invalid');persist();}
document.addEventListener('input',saveProductField);
document.addEventListener('change',saveProductField);
