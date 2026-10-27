import {templateById} from './product-templates.js?v=product-ui-v17';
const key='weibo-stack-prototype-v2';
const sessionKey='weibo-stack-session-v1';
let disk={},session={};
try{disk=JSON.parse(localStorage.getItem(key)||localStorage.getItem('weibo-stack-prototype-v1')||'{}')||{};session=JSON.parse(sessionStorage.getItem(sessionKey)||'{}')||{};}catch{}
const list=(value)=>Array.isArray(value)?value:[];
let savedFlows=JSON.stringify(disk.flows||{});
export const state={
  theme:document.documentElement.dataset.theme||'light',
  page:new URLSearchParams(location.search).get('page')||'discover',
  category:'发现',code:false,bom:false,query:'',sort:'newest',myTab:'projects',collapsed:false,
  likes:list(disk.likes),bookmarks:list(disk.bookmarks),comments:disk.comments||{},projects:list(disk.projects),orders:list(disk.orders),
  flows:disk.flows||{},flowId:disk.flowId||'',idea:disk.idea||'',templateId:templateById(disk.templateId)?disk.templateId:'planter',
  auth:session.auth===true,addresses:list(session.addresses),addressId:session.addressId||'',orderAddresses:session.orderAddresses||{},
  balance:Number.isFinite(disk.balance)?disk.balance:500,storageError:false,revision:disk.revision||0,
};
export function persist(){
  try{
    // Preserve work on other projects when several desktop tabs are open.
    const latestRaw=localStorage.getItem(key)||'{}';
    let latest={};
    try{latest=JSON.parse(latestRaw)||{};}catch{}
    const baseline=JSON.parse(savedFlows);
    for(const [id,flow] of Object.entries(latest.flows||{})){
      if(!state.flows[id]||JSON.stringify(state.flows[id])===JSON.stringify(baseline[id]))state.flows[id]=flow;
    }
    for(const field of ['projects','orders']){const ids=new Set(state[field].map(item=>item.id));for(const item of list(latest[field]))if(!ids.has(item.id))state[field].push(item);}
    const {likes,bookmarks,comments,projects,orders,flows,flowId,idea,templateId,balance}=state;
    const revision=Date.now();localStorage.setItem(key,JSON.stringify({likes,bookmarks,comments,projects,orders,flows,flowId,idea,templateId,balance,revision}));savedFlows=JSON.stringify(flows);state.revision=revision;sessionStorage.setItem(sessionKey,JSON.stringify({auth:state.auth,addresses:state.addresses,addressId:state.addressId,orderAddresses:state.orderAddresses}));state.storageError=false;return true;
  }catch{state.storageError=true;return false;}
}
export function currentFlow(){return state.flows[state.flowId];}
export function newFlow(idea='',source='',templateId=''){
  const id='project-'+Date.now().toString(36);
  const template=templateById(templateId);
  const name=source||(template?template.name+' · 我的方案':'未命名项目');
  const flow={id,name,idea,messages:[],modules:[],wires:[],plan:false,wireSuggested:false,view:'design',canvasMode:'spatial',positions:{esp32:{x:16,y:37},sensor:{x:65,y:20},oled:{x:65,y:62}},zoom:1,selected:'',code:defaultCode,procurement:{esp32:1,sensor:1,oled:1},selectedItems:['esp32','sensor','oled'],remarks:'',stage:'idea',updatedAt:Date.now()};
  if(template){Object.assign(flow,{templateId:template.id,positions:structuredClone(template.positions),code:template.code,procurement:Object.fromEntries(template.modules.map(m=>[m.id,1])),selectedItems:template.modules.map(m=>m.id),orderDetails:{quantity:1,delivery:'assembled',finish:'按原方案',usage:'',schedule:'待沟通'}});}
  state.flowId=id;state.flows[id]=flow;state.projects.unshift({id,name,source,flowId:id});persist();return flow;
}
export function updateFlowName(flow,name){flow.name=name.trim().slice(0,60)||'未命名项目';const project=state.projects.find(p=>p.id===flow.id);if(project)project.name=flow.name;persist();}
export const defaultCode=`// 蔚博智造 · 温湿度显示器
// 编译与烧录前请核对目标开发板、依赖库及引脚配置。
#include <Wire.h>

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);
  // 在此初始化 AHT10 与 OLED 驱动。
}

void loop() {
  // 读取传感器，并将结果刷新到 OLED。
  // 在此接入传感器采集与屏幕刷新逻辑。
  delay(2000);
}
`;
