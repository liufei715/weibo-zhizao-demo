import {icon,esc} from './icons.js?v=20261027-web-r2';

// Service amounts supplied by the user; each selected service is charged once.
export const quoteServices=[
 {id:'pcb',label:'PCB打板加工',price:100},
 {id:'enclosure',label:'外壳结构加工制造',price:200},
 {id:'documents',label:'整体方案资料包',price:300}
];
export function selectedQuoteServices(flow){
 const ids=Array.isArray(flow.quoteServices)?flow.quoteServices:['pcb','enclosure'];
 return quoteServices.filter(service=>ids.includes(service.id));
}
export function quoteAmount(flow){return selectedQuoteServices(flow).reduce((sum,item)=>sum+item.price,0);}
const price=value=>'¥'+value.toFixed(2);
export function quotationError(flow){return selectedQuoteServices(flow).length?'':'请至少选择一项报价服务。';}
export function quotationSummary(flow){
 const items=selectedQuoteServices(flow);
 return `<div class="quote-summary-lines">${items.length?items.map(item=>`<div><span>${esc(item.label)}</span><b>${price(item.price)}</b></div>`).join(''):'<p>尚未选择服务</p>'}</div>`;
}
export function quotationPanel(flow,confirm=false){
 const selected=selectedQuoteServices(flow),ids=selected.map(item=>item.id);
 return `<section class="checkout-panel quotation-panel" aria-labelledby="quotation-title"><div class="panel-heading"><h2 id="quotation-title">服务报价</h2><span class="quotation-unit">按项计价</span></div><div class="quotation-layout"><fieldset id="quote-options" class="quotation-options" tabindex="-1"><legend class="sr-only">选择需要的服务</legend>${quoteServices.map(item=>`<label class="quotation-row ${ids.includes(item.id)?'is-selected':''}"><span>${esc(item.label)}</span><small>${price(item.price)}</small>${confirm?`<span class="quotation-check" aria-label="${ids.includes(item.id)?'已选择':'未选择'}">${ids.includes(item.id)?icon('check',15):'—'}</span>`:`<input type="checkbox" data-quote-service="${item.id}" aria-label="${esc(item.label)}" ${ids.includes(item.id)?'checked':''}>`}</label>`).join('')}${confirm?'':`<label class="quotation-row quotation-select-all"><span>全选</span><input type="checkbox" id="quote-all" ${selected.length===quoteServices.length?'checked':''}></label>`}</fieldset><div class="quotation-total" aria-live="polite" aria-atomic="true"><span>总价</span><strong data-quote-total>${selected.length?price(quoteAmount(flow)):'—'}</strong><small data-quote-count>已选 ${selected.length} 项服务</small></div></div><p class="quotation-note">各项服务按本次项目计价，最终交付范围与报价需确认。</p><p id="quote-error" class="form-error" role="alert" hidden></p></section>`;
}
export function quotationReceipt(items){
 return `<dl class="quotation-receipt">${items.map(item=>`<div><dt>${esc(item.label)}</dt><dd>${price(item.price)}</dd></div>`).join('')}</dl>`;
}
export function syncQuotationControls(flow){
 const items=selectedQuoteServices(flow),ids=items.map(item=>item.id),all=document.getElementById('quote-all');
 if(all){all.checked=items.length===quoteServices.length;all.indeterminate=items.length>0&&items.length<quoteServices.length;}
 document.querySelectorAll('[data-quote-service]').forEach(input=>{input.checked=ids.includes(input.dataset.quoteService);input.closest('.quotation-row')?.classList.toggle('is-selected',input.checked);});
 document.querySelectorAll('[data-quote-total]').forEach(node=>node.textContent=items.length?price(quoteAmount(flow)):'—');
 document.querySelectorAll('[data-quote-count]').forEach(node=>node.textContent=`已选 ${items.length} 项服务`);
 const summary=document.querySelector('[data-quote-summary]');if(summary)summary.innerHTML=quotationSummary(flow);
 const error=document.getElementById('quote-error');if(error){error.textContent=quotationError(flow);error.hidden=!!items.length;}
}
export function updateQuoteServices(flow,id,checked){
 const ids=selectedQuoteServices(flow).map(item=>item.id);
 flow.quoteServices=id==='all'?(checked?quoteServices.map(item=>item.id):[]):quoteServices.filter(item=>item.id===id?checked:ids.includes(item.id)).map(item=>item.id);
 flow.checkoutToken='checkout-'+Date.now().toString(36);
}
