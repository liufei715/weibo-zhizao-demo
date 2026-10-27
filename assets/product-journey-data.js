const planterStages=[
 {id:'modules',title:'电路模块分布图',short:'模块分布',image:'modules.jpg',copy:'先把花盆方案拆成主控、电源、传感采集、TFT 显示、通信和交互等功能。按照功能分组，先看清各模块负责什么，再整理它们之间的连接。'},
 {id:'connections',title:'电路模块接线图',short:'模块接线',image:'connections.jpg',copy:'接下来梳理电源与信号的走向，把传感输入、屏幕和通信接口连接到主控。下图展示模块接线关系，具体引脚还需与最终原理图核对。'},
 {id:'schematic',title:'电路原理图',short:'原理图',image:'schematic.png',copy:'再把模块关系展开为主控、电源、下载调试及外设接口电路。可以放大查看图中的器件与网络标注，逐项核对供电和信号连接。'},
 {id:'pcb-layout',title:'PCB布局布线',short:'PCB 布线',image:'pcb-layout.png',copy:'然后查看器件落位与 PCB 走线，重点关注接口位置、供电路径和信号连接。制造前还需完成电气、间距与结构配合检查。'},
 {id:'pcb-3d',title:'PCB 3D预览',short:'3D 预览',image:'pcb-3d.png',copy:'最后从三维视角查看电路板、接口和器件的相对位置，便于后续核对装配空间。方案图已整理，可以在对话中回看。接下来添加模块、确认连线，再填写交付需求与报价。'}
];
const schematicPages=(id,count)=>Array.from({length:count},(_,i)=>`assets/product-stages/${id}/schematic-${i+1}.png`);
export const productJourneys={
 planter:{name:'智能花盆',intro:'我会先梳理花盆的功能与模块，再依次呈现接线、原理图、PCB 布线和三维预览。每一步的说明和对应图片都会发在对话里，方便一起查看。',stages:planterStages.map(stage=>({...stage,images:['assets/planter-stages/'+stage.image]}))},
 badge:{name:'录音笔',intro:'先从录音笔的音频采集和手机连接开始。我会结合系统框图、电路原理图和结构参考，逐步整理方案，再继续确认模块连线与交付需求。',stages:[
  {id:'system',title:'电路系统框图',short:'系统框图',images:['assets/product-stages/badge/system.png'],copy:'先看录音笔的工作路径：数字麦克风采集音频，STM32 处理与管理状态，ESP32-S3 负责连接手机。下图把音频、通信、供电和操作模块放在一起，便于核对整体关系；microSD 对应离线存储预留。'},
  {id:'schematic',title:'电路原理图',short:'电路原理图',images:schematicPages('badge',6),copy:'接下来展开电路细节，逐页查看主控、音频采集、无线通信、存储与供电相关连接。原理图已按原文件整理为多页，点击图片可翻页和放大，具体信号与器件参数以工程复核为准。'},
  {id:'structure',title:'三维结构参考',short:'结构参考',images:['assets/product-stages/badge/structure.jpg'],copy:'再看机身的结构参考，核对按键、开关、接口和外壳的相对位置。图示用于讨论外观与操作位置，尺寸、装配间隙和加工方式仍需结合结构文件确认。接下来可以添加模块，继续完成连线与服务报价。'}
 ]},
 watch:{name:'智能手表',intro:'我会先整理智能手表的数据采集、显示触摸和手机连接关系，再结合原理图与实物外观参考逐步说明。对应图片会随说明出现在对话里。',stages:[
  {id:'system',title:'电路系统框图',short:'系统框图',images:['assets/product-stages/watch/system.png'],copy:'先把腕上交互拆成感知、主控、显示触摸、无线通信和供电几部分。下图展示传感数据如何进入主控，再连接屏幕与手机；具体模块型号、总线和引脚仍需按实际硬件核对。'},
  {id:'schematic',title:'电路原理图',short:'电路原理图',images:schematicPages('watch',3),copy:'再逐页查看电路原理图中的器件与网络连接，把系统框图里的功能关系对应到具体电路。点击图片可以翻页和放大；供电、显示、传感与通信接口要结合实物 PCB 继续确认。'},
  {id:'appearance',title:'实物外观参考',short:'外观参考',images:['assets/product-stages/watch/structure.jpg'],copy:'最后结合现有实物照片查看表盘、表带和佩戴形态，作为外观与使用场景讨论的参考。照片不代表尺寸或装配已经验证；后续可继续核对外观偏好、模块连线与交付需求。'}
 ]}
};
export const journeyConfig=flow=>productJourneys[flow?.templateId]||null;
