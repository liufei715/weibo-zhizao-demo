const planterStages=[
 {id:'modules',title:'电路模块分布图',short:'模块分布',image:'modules.jpg',copy:'我已按现有方案整理出主控、电源、传感采集、显示、通信和交互模块，右侧是对应的模块分布图。这样可以先看清各部分的职责，再讨论它们怎样连接。你可以先检查是否有需要增减的功能。'},
 {id:'connections',title:'电路模块接线图',short:'模块接线',image:'connections.jpg',copy:'接线关系图已整理好，右侧已切换到模块接线图。你可以沿着图中的连接查看电源、传感器和显示模块怎样接入主控。这张图用于查看方案关系，无需手动连线。'},
 {id:'schematic',title:'电路原理图',short:'原理图',image:'schematic.png',copy:'我已把现有原理图呈现在右侧，可以进一步查看主控、供电和外设接口的具体连接。请点击图片放大，重点看器件和网络标注。接下来我会展示 PCB 布局布线，帮助你对应电路与板上的位置。'},
 {id:'pcb-layout',title:'PCB布局布线',short:'PCB 布线',image:'pcb-layout.png',copy:'PCB 布局布线参考已展开。你可以对照刚才的原理图，查看接口位置、器件分布和走线路径。接下来先查看 PCBA 预览，再单独查看花盆结构；制造前仍需完成电气和结构检查。'},
 {id:'pcb-3d',title:'PCBA预览',short:'PCBA预览',image:'pcb-3d.png',copy:'右侧已切换到 PCBA 预览，可以查看电路板上器件、接口和整体布局。点击图片可放大查看。接下来我会单独展示花盆的 3D 结构参考，便于继续查看外壳与开口位置。'},
 {id:'structure-3d',title:'3D结构预览',short:'3D结构预览',image:'structure-v2.jpg',copy:'花盆的 3D 结构参考已单独展示在右侧，可以查看外壳形态与开口位置。点击图片可放大；实际尺寸、接口位置及装配间隙仍需后续核对。方案资料已整理完成，下一步点击「继续报价」，填写交付需求并查看报价。'}
];
const schematicPages=(id,count)=>Array.from({length:count},(_,i)=>`assets/product-stages/${id}/schematic-${i+1}.png`);
export const productJourneys={
 planter:{name:'智能花盆',intro:'收到，我先从花盆的功能和模块入手，帮你看清每部分的作用。随后会依次展示方案参考图，整理完成后可以直接进入报价；你也可以随时补充想调整的功能。',stages:planterStages.map(stage=>({...stage,images:['assets/planter-stages/'+stage.image]}))},
 badge:{name:'录音笔',intro:'收到，我先帮你梳理录音、手机连接和供电之间的关系，再一起查看原理图和机身结构参考。方案资料整理完成后，可以直接填写交付需求并查看报价。',stages:[
  {id:'system',title:'电路系统框图',short:'系统框图',images:['assets/product-stages/badge/system.png'],copy:'我已按现有资料整理出录音笔的音频采集、主控、手机连接、供电和操作模块，右侧是系统框图。你可以先看从录音到手机连接的整体路径，确认这些功能是否符合你的使用场景。'},
  {id:'schematic',title:'电路原理图',short:'电路原理图',images:schematicPages('badge',6),copy:'录音笔原理图已按现有资料整理为多页，右侧先展示其中一页。点击图片可以逐页查看和放大，核对主控、音频采集、通信与供电连接。接下来我会展示机身结构参考，帮你继续确认接口和操作位置。'},
  {id:'structure',title:'三维结构参考',short:'结构参考',images:['assets/product-stages/badge/structure.jpg'],copy:'机身结构参考已展示，你可以查看按键、开关、接口与外壳的相对位置；尺寸和装配间隙还需结合结构文件确认。这组资料已查看完，下一步可以直接填写交付需求并查看报价。'}
 ]},
 watch:{name:'智能手表',intro:'收到，我先帮你梳理手表的数据采集、显示触摸和手机连接，再一起查看原理图和佩戴外观参考。方案资料整理完成后，可以直接填写交付需求并查看报价。',stages:[
  {id:'system',title:'电路系统框图',short:'系统框图',images:['assets/product-stages/watch/system.png'],copy:'我已按现有方案整理出传感采集、主控、显示触摸、无线通信和供电模块，右侧是手表系统框图。你可以先查看传感数据怎样进入主控，再到屏幕和手机，确认这些功能是否符合你的佩戴场景。'},
  {id:'schematic',title:'电路原理图',short:'电路原理图',images:schematicPages('watch',3),copy:'手表原理图已整理为多页，右侧展示了对应的电路资料。点击图片可逐页放大，查看传感、显示、通信和供电的具体连接。接下来我会展示实物外观参考，方便你继续讨论表盘、表带和佩戴方式。'},
  {id:'appearance',title:'实物外观参考',short:'外观参考',images:['assets/product-stages/watch/structure.jpg'],copy:'实物外观参考已展示，可以继续查看表盘、表带和佩戴形态，尺寸与装配仍需后续确认。这组资料已查看完，下一步可以直接填写交付需求并查看报价；有外观偏好也可以先告诉我。'}
 ]}
};
export const journeyConfig=flow=>productJourneys[flow?.templateId]||null;

const activities={
 modules:['正在梳理需求对应的硬件功能…','正在整理主控、供电与外设模块…','正在准备模块分布参考图…'],
 system:['正在梳理产品功能与模块职责…','正在整理采集、通信与供电关系…','正在准备系统框图参考…'],
 connections:['正在梳理参考图中的模块连接…','正在整理电源与信号路径说明…','正在准备模块接线参考图…'],
 schematic:['正在整理现有电路资料…','正在定位主控、供电与接口标注…','正在准备原理图预览…'],
 'pcb-layout':['正在整理现有 PCB 布局参考…','正在定位器件、接口与走线区域…','正在准备 PCB 布局布线预览…'],
 'pcb-3d':['正在整理现有电路板三维参考…','正在定位接口与器件的相对位置…','正在准备电路板三维预览…'],
 'structure-3d':['正在整理现有花盆结构参考…','正在定位外壳形态与开口位置…','正在准备花盆三维结构预览…'],
 structure:['正在整理现有机身结构参考…','正在定位按键、开关与接口位置…','正在准备结构参考图…'],
 appearance:['正在整理现有产品外观参考…','正在定位表盘、表带与佩戴形态…','正在准备外观参考图…']
};
export const stageActivities=stage=>activities[stage?.id]||activities.system;
