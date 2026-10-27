// Two supplied images share a viewport; a cursor mask reveals the photo below.
export function creationRobot(){
 return `<div class="robot-reveal" aria-hidden="true"><div class="robot-photo-layer"><img src="assets/robot-real.png" alt="" width="1240" height="1269" decoding="async" draggable="false"></div><div class="robot-outline-layer"><img src="assets/robot-outline.png" alt="" width="1240" height="1269" decoding="async" draggable="false"></div></div>`;
}

export function initCreationReveal(scene){
 const art=scene?.querySelector('.robot-reveal');
 if(!art)return ()=>{};
 const photo=art.querySelector('.robot-photo-layer img');
 const outline=art.querySelector('.robot-outline-layer img');
 const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 let frame=0,lastTime=0,radius=0,targetRadius=0,ready=false,disposed=false;
 let point={x:-1000,y:-1000};
 const maxRadius=()=>parseFloat(getComputedStyle(art).getPropertyValue('--robot-reveal-size'))||140;

 function refreshImages(){
  if(disposed)return;
  ready=photo.complete&&photo.naturalWidth>0&&outline.complete&&outline.naturalWidth>0;
  art.classList.toggle('robot-reveal--photo-error',photo.complete&&!photo.naturalWidth);
  art.classList.toggle('robot-reveal--outline-error',outline.complete&&!outline.naturalWidth);
 }
 function paint(time){
  frame=0;
  if(disposed)return;
  const bounds=art.getBoundingClientRect();
  // Both artwork layers are mirrored, so the cursor mask uses mirrored X coordinates.
  const x=bounds.right-point.x,y=point.y-bounds.top;
  if(x<0||y<0||x>bounds.width||y>bounds.height)targetRadius=0;
  const delta=lastTime?Math.min(48,time-lastTime):16;
  lastTime=time;
  radius=reducedMotion.matches?targetRadius:radius+(targetRadius-radius)*Math.min(1,delta/65);
  if(Math.abs(targetRadius-radius)<.25)radius=targetRadius;
  art.style.setProperty('--robot-reveal-x',`${x.toFixed(1)}px`);
  art.style.setProperty('--robot-reveal-y',`${y.toFixed(1)}px`);
  art.style.setProperty('--robot-reveal-radius',`${radius.toFixed(2)}px`);
  if(radius!==targetRadius)frame=requestAnimationFrame(paint);
 }
 function schedule(){if(!frame){lastTime=0;frame=requestAnimationFrame(paint);}}
 function hide(){targetRadius=0;schedule();}
 function move(event){
  if(event.pointerType==='touch'||!ready)return;
  point={x:event.clientX,y:event.clientY};
  targetRadius=event.target.closest('.creation-content')?0:maxRadius();
  schedule();
 }
 function focus(event){if(event.target.closest('.creation-content'))hide();}
 function visibility(){if(document.hidden)hide();}
 const images=[photo,outline];
 images.forEach(image=>{image.addEventListener('load',refreshImages);image.addEventListener('error',refreshImages);});
 refreshImages();
 scene.addEventListener('pointermove',move,{passive:true});
 scene.addEventListener('pointerleave',hide);
 scene.addEventListener('pointercancel',hide);
 scene.addEventListener('focusin',focus);
 window.addEventListener('blur',hide);
 window.addEventListener('resize',hide,{passive:true});
 window.addEventListener('scroll',hide,{passive:true,capture:true});
 document.addEventListener('visibilitychange',visibility);
 return ()=>{
  disposed=true;cancelAnimationFrame(frame);
  images.forEach(image=>{image.removeEventListener('load',refreshImages);image.removeEventListener('error',refreshImages);});
  scene.removeEventListener('pointermove',move);
  scene.removeEventListener('pointerleave',hide);
  scene.removeEventListener('pointercancel',hide);
  scene.removeEventListener('focusin',focus);
  window.removeEventListener('blur',hide);
  window.removeEventListener('resize',hide);
  window.removeEventListener('scroll',hide,true);
  document.removeEventListener('visibilitychange',visibility);
 };
}
