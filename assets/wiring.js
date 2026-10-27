import {state,currentFlow,persist} from './store.js?v=20261027-web-r2';
import {connectionsFor,allWires} from './workflow-data.js?v=20261027-web-r2';
import {toast} from './ui.js?v=20261027-web-r2';
let hooks={};
export function initWiring(api){hooks=api;}
export function drawWires(){
 const flow=currentFlow(),svg=document.getElementById('wire-svg'),world=document.getElementById('canvas-world');if(!flow||!svg||!world)return;
 const bounds=world.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
 svg.setAttribute('viewBox',`0 0 ${world.clientWidth} ${world.clientHeight}`);
 svg.innerHTML=flow.wires.map(w=>{
   const from=document.querySelector(`[data-pin="${w.from}:${w.fromPin}"] i`),to=document.querySelector(`[data-pin="${w.to}:${w.toPin}"] i`);if(!from||!to)return '';
   const a=from.getBoundingClientRect(),b=to.getBoundingClientRect();
   const x1=(a.x+a.width/2-bounds.x)/flow.zoom,y1=(a.y+a.height/2-bounds.y)/flow.zoom,x2=(b.x+b.width/2-bounds.x)/flow.zoom,y2=(b.y+b.height/2-bounds.y)/flow.zoom;
   const bend=Math.max(35,Math.abs(x2-x1)*.48),path=`M${x1},${y1} C${x1+bend},${y1} ${x2-bend},${y2} ${x2},${y2}`;
   return `<g class="wire-path wire-${w.type} ${flow.highlight===w.id?'highlight':''}" data-wire="${w.id}"><path class="wire-hit" d="${path}"/><path class="wire-line" d="${path}"/><circle cx="${x1}" cy="${y1}" r="3"/><circle cx="${x2}" cy="${y2}" r="3"/></g>`;
 }).join('');
}
export function selectPin(value){
 const f=currentFlow();if(!f)return;const [module,pin]=value.split(':');
 if(!f.pendingPin){f.pendingPin={module,pin};toast(`已选择 ${module.toUpperCase()} · ${pin}，请选择匹配引脚`);hooks.renderEditor();return;}
 const a=f.pendingPin,b={module,pin};if(a.module===b.module){f.pendingPin=null;toast('已取消选择；连线需要连接两个不同器件');hooks.renderEditor();return;}
 const expected=connectionsFor(f).find(c=>(c.from===a.module&&c.fromPin===a.pin&&c.to===b.module&&c.toPin===b.pin)||(c.from===b.module&&c.fromPin===b.pin&&c.to===a.module&&c.toPin===a.pin));
 if(!expected){toast('这组引脚不匹配，请按接线配置选择对应引脚');f.pendingPin=null;hooks.renderEditor();return;}
 if(f.wires.some(w=>w.id===expected.id)){toast('这条连线已经存在');f.pendingPin=null;hooks.renderEditor();return;}
 f.wires.push({...expected});f.pendingPin=null;f.stage=allWires(f)?'wired':'wiring';persist();hooks.renderEditor();toast(`已连接 ${expected.fromPin} → ${expected.to.toUpperCase()} ${expected.toPin}`);
}
let drag=null,moved=false;
document.addEventListener('pointerdown',e=>{
 const handle=e.target.closest('[data-node-drag]');if(!handle||e.button!==0)return;
 const f=currentFlow(),node=handle.closest('[data-node]'),world=document.getElementById('canvas-world');if(!f||!world)return;
 f.selected=handle.dataset.nodeDrag;moved=false;
 document.querySelectorAll('.hardware-node').forEach(n=>n.classList.toggle('is-selected',n===node));
 drag={id:f.selected,node,handle,x:e.clientX,y:e.clientY,start:{...f.positions[f.selected]},width:world.clientWidth,height:world.clientHeight,zoom:f.zoom};handle.setPointerCapture(e.pointerId);
});
document.addEventListener('pointermove',e=>{if(!drag)return;const f=currentFlow(),d=drag;if(!f)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;if(!moved)return;const maxX=Math.max(0,100-d.node.offsetWidth/d.width*100),maxY=Math.max(0,100-d.node.offsetHeight/d.height*100);f.positions[d.id]={x:Math.max(0,Math.min(maxX,d.start.x+dx/d.width/d.zoom*100)),y:Math.max(0,Math.min(maxY,d.start.y+dy/d.height/d.zoom*100))};d.node.style.left=f.positions[d.id].x+'%';d.node.style.top=f.positions[d.id].y+'%';drawWires();});
document.addEventListener('pointerup',()=>{if(drag){const didMove=moved;drag=null;persist();if(didMove)setTimeout(()=>moved=false,0);}});
document.addEventListener('click',e=>{
 const pin=e.target.closest('[data-pin]');if(pin){selectPin(pin.dataset.pin);return;}
 const wire=e.target.closest('[data-wire]');if(wire){const f=currentFlow();f.highlight=wire.dataset.wire;drawWires();const w=f.wires.find(w=>w.id===f.highlight);toast(`${w.fromPin} → ${w.to.toUpperCase()} ${w.toPin} · ${w.label}`);return;}
 const node=e.target.closest('[data-node-drag]');if(node&&!moved){currentFlow().selected=node.dataset.nodeDrag;hooks.renderEditor();}
});
document.addEventListener('keydown',e=>{
 const f=currentFlow();if(!f||state.page!=='editor')return;
 if(e.key==='Escape'&&f.pendingPin){f.pendingPin=null;hooks.renderEditor();toast('已取消当前连线');}
 const handle=e.target.closest('[data-node-drag]');if(!handle||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const id=handle.dataset.nodeDrag,p=f.positions[id],world=document.getElementById('canvas-world'),node=handle.closest('[data-node]');const step=e.shiftKey?4:1;const maxX=100-node.offsetWidth/world.clientWidth*100,maxY=100-node.offsetHeight/world.clientHeight*100;p.x=Math.max(0,Math.min(maxX,p.x+(e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0)));p.y=Math.max(0,Math.min(maxY,p.y+(e.key==='ArrowUp'?-step:e.key==='ArrowDown'?step:0)));node.style.left=p.x+'%';node.style.top=p.y+'%';drawWires();persist();
});
window.addEventListener('resize',()=>requestAnimationFrame(drawWires));
