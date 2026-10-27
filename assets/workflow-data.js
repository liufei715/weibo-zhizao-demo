import {templateFor} from './product-templates.js?v=20261027-web-r4';
export const modules=[
 {id:'esp32',name:'ESP32-DevKitC',full:'ESP32-DevKitC 38 引脚 Type-C',role:'主控开发板',kind:'board',price:32,pins:['3V3','GND','GPIO21','GPIO22'],description:'连接传感器与显示屏的主控节点。'},
 {id:'sensor',name:'AHT10',full:'AHT10 温湿度传感器模块',role:'环境感知',kind:'sensor',price:6,pins:['VIN','GND','SDA','SCL'],description:'通过 I²C 总线读取温湿度。'},
 {id:'oled',name:'OLED 0.96″',full:'OLED 0.96 英寸显示屏',role:'信息显示',kind:'oled',price:12,pins:['VCC','GND','SDA','SCL'],description:'用小屏幕呈现环境信息。'},
];
export const connections=modules.slice(1).flatMap(m=>[
 {id:m.id+'-power',from:'esp32',fromPin:'3V3',to:m.id,toPin:m.id==='sensor'?'VIN':'VCC',type:'power',label:'3.3V 电源'},
 {id:m.id+'-ground',from:'esp32',fromPin:'GND',to:m.id,toPin:'GND',type:'ground',label:'共地'},
 {id:m.id+'-data',from:'esp32',fromPin:'GPIO21',to:m.id,toPin:'SDA',type:'data',label:'I²C 数据'},
 {id:m.id+'-clock',from:'esp32',fromPin:'GPIO22',to:m.id,toPin:'SCL',type:'clock',label:'I²C 时钟'},
]);
export const regionHints={
 '北京市':{'北京市':['东城区','西城区','朝阳区','海淀区','丰台区']},
 '上海市':{'上海市':['黄浦区','徐汇区','长宁区','静安区','浦东新区','闵行区']},
 '天津市':{'天津市':['和平区','河西区','南开区','滨海新区']},
 '重庆市':{'重庆市':['渝中区','江北区','南岸区','渝北区']},
 '广东省':{'广州市':['天河区','越秀区','海珠区','白云区'],'深圳市':['南山区','福田区','宝安区','龙岗区'],'东莞市':['南城街道','东城街道'],'珠海市':['香洲区','金湾区']},
 '浙江省':{'杭州市':['西湖区','拱墅区','滨江区','余杭区'],'宁波市':['海曙区','鄞州区'],'温州市':['鹿城区','瓯海区']},
 '江苏省':{'南京市':['鼓楼区','玄武区','建邺区'],'苏州市':['姑苏区','吴中区','虎丘区'],'无锡市':['滨湖区','梁溪区']},
 '四川省':{'成都市':['锦江区','武侯区','青羊区','成华区']},
 '湖北省':{'武汉市':['武昌区','洪山区','江汉区']},
 '陕西省':{'西安市':['雁塔区','碑林区','未央区']},
};
export const provinces=['北京市','天津市','河北省','山西省','内蒙古自治区','辽宁省','吉林省','黑龙江省','上海市','江苏省','浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省','广东省','广西壮族自治区','海南省','重庆市','四川省','贵州省','云南省','西藏自治区','陕西省','甘肃省','青海省','宁夏回族自治区','新疆维吾尔自治区'];
export const money=n=>n===null||n===undefined?'待报价':'¥'+Number(n).toFixed(2);
export const modulesFor=flow=>templateFor(flow)?.modules||modules;
export const connectionsFor=flow=>templateFor(flow)?.connections||connections;
export const allModules=flow=>modulesFor(flow).every(m=>flow.modules.includes(m.id));
export const allWires=flow=>allModules(flow)&&connectionsFor(flow).every(c=>flow.wires.some(w=>w.id===c.id));
export const layoutFor=flow=>structuredClone(templateFor(flow)?.positions||{esp32:{x:8,y:34},sensor:{x:62,y:15},oled:{x:62,y:62}});
export const lineCost=(m,quantity)=>m.price===null?null:m.price*quantity;
export function selectedModules(flow){return modulesFor(flow).filter(m=>flow.modules.includes(m.id)&&flow.selectedItems.includes(m.id));}
export function total(flow){if(templateFor(flow))return null;return selectedModules(flow).reduce((sum,m)=>sum+m.price*(flow.procurement[m.id]||1),0);}
