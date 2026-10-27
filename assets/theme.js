import {icon} from './icons.js?v=20261027-web-r2';
export function themeControl(theme){const dark=theme==='engineering',next=dark?'light':'engineering',label=dark?'切换为浅色风格':'切换为深色工程风';return `<button class="theme-switch icon-button" data-theme-toggle data-theme-choice="${next}" aria-label="${label}" title="${label}">${icon(dark?'sun':'moon',18)}</button>`;}
export function applyTheme(theme,save=false){
 const value=theme==='engineering'?'engineering':'light';
 document.documentElement.dataset.theme=value;
 document.getElementById('engineering-theme').disabled=value==='light';
 document.querySelector('meta[name="theme-color"]').content=value==='light'?'#173DED':'#090d13';
 if(save)try{localStorage.setItem('weibo-visual-theme',value);}catch{}
 return value;
}
