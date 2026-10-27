// All entries and metrics are authored sample content, not live platform data.
export const categories=['发现','热门','交互设计','艺术','实用工具','玩具与游戏','教育'];
export const works=[
  {id:'little-companion',name:'小小陪伴，大大治愈。',subtitle:'一个有表情的桌面 AI 伙伴',kind:'robot',category:'交互设计',author:'一木工作室',initial:'木',tone:'sage',code:true,bom:true,likes:128,views:1260,copies:36,date:'2026-10-20',description:'把日常的问候，变成桌边温暖的陪伴。通过圆润的机身与像素表情，探索语音、触摸和情绪反馈的交互可能。',chip:'ESP32-S3',tags:['语音交互','像素表情','桌面陪伴']},
  {id:'ring-clock',name:'把时间，戴在指尖。',subtitle:'可自定义的智能戒指表盘',kind:'ring',category:'实用工具',author:'Echo Lab',initial:'E',tone:'stone',code:true,bom:true,likes:96,views:982,copies:24,date:'2026-10-19',description:'一枚小屏幕，装下你想看到的信息。自定义时间与文字界面，从最简单的表盘开始理解嵌入式交互。',chip:'ESP32-C3',tags:['可穿戴','自定义表盘','轻量交互']},
  {id:'pixel-time',name:'让每一分钟，都有一点趣味。',subtitle:'复古像素时钟与桌面信息屏',kind:'clock',category:'艺术',author:'日常研究所',initial:'日',tone:'sand',code:true,bom:false,likes:87,views:864,copies:19,date:'2026-10-18',description:'将时间、天气与小小的像素画放在一起。保留复古点阵的颗粒感，让信息以安静的方式融入你的书桌。',chip:'ESP32',tags:['像素艺术','信息显示','时钟']},
  {id:'pocket-game',name:'把童年，装进口袋。',subtitle:'开源掌机与小游戏开发',kind:'game',category:'玩具与游戏',author:'小岛制造',initial:'岛',tone:'mint',code:true,bom:true,likes:74,views:736,copies:18,date:'2026-10-17',description:'从一个小小的屏幕和几个按钮出发，做出属于自己的口袋游戏机。支持在方案中了解显示、按键和游戏状态。',chip:'ESP32-S3',tags:['开源游戏','掌机','按键交互']},
  {id:'gentle-light',name:'给夜晚，留一盏柔光。',subtitle:'触摸调光的桌面陪伴灯',kind:'lamp',category:'交互设计',author:'林间造物',initial:'林',tone:'sand',code:false,bom:true,likes:62,views:651,copies:12,date:'2026-10-16',description:'一盏安静的蘑菇灯，在手指触碰时改变明暗。用简单的交互，让技术回到日常生活的节奏。',chip:'ESP32-C3',tags:['触摸调光','柔和照明','生活设计']},
  {id:'little-garden',name:'会照顾自己的小花园。',subtitle:'土壤监测与智能养护花盆',kind:'plant',category:'实用工具',author:'微物设计',initial:'微',tone:'sage',code:true,bom:true,likes:58,views:598,copies:11,date:'2026-10-15',description:'看见土壤的湿度，也看见植物的需要。用传感器与小屏幕，把浇水提醒变成可理解的状态反馈。',chip:'ESP32',tags:['植物养护','湿度监测','传感器']},
  {id:'first-board',name:'你的第一块开发板。',subtitle:'从点亮一颗 LED 开始',kind:'board',category:'教育',author:'蔚博实验室',initial:'蔚',tone:'mint',code:true,bom:true,likes:45,views:523,copies:9,date:'2026-10-14',description:'认识开发板的接口，理解输入与输出。从基础示例出发，循序渐进地走进硬件创造。',chip:'ESP32',tags:['新手入门','开发板','LED']},
  {id:'pixel-art',name:'让你的像素画，亮起来。',subtitle:'可以触摸的像素艺术装置',kind:'clock',category:'艺术',author:'像素工场',initial:'像',tone:'stone',code:true,bom:false,likes:39,views:418,copies:8,date:'2026-10-13',description:'把像素画从屏幕搬到桌面。通过点阵显示，探索颜色、节奏与交互的更多可能。',chip:'ESP32-S3',tags:['灯光装置','像素艺术','互动创作']},
  {id:'mini-console',name:'一个按钮，也能很好玩。',subtitle:'探索简单的交互与游戏机制',kind:'game',category:'玩具与游戏',author:'造物同学',initial:'造',tone:'sage',code:true,bom:false,likes:32,views:375,copies:6,date:'2026-10-12',description:'用最小的输入设计完整的体验。从按下按钮，到看见反馈，了解一个小游戏是如何被构建出来的。',chip:'ESP32-C3',tags:['交互实验','小游戏','入门项目']},
];
export const kits=[works[6],works[3],works[0]];
export const plugins=[
  {id:'oled',name:'图片转 OLED Bitmap',category:'图像工具',icon:'grid',description:'将图片转成单色像素预览，了解适合小屏幕的图像表达。',steps:['选择要转换的图像','调整对比度与像素尺寸','预览点阵效果并导出'],note:'转换前请确认屏幕分辨率、色深及位图格式。'},
  {id:'lvgl',name:'LVGL 界面预览器',category:'界面开发',icon:'code',description:'了解嵌入式界面的布局、控件与交互，缩短从设计到屏幕的距离。',steps:['选择界面模板','调整控件布局与参数','在目标硬件上检查效果'],note:'界面布局需与目标屏幕分辨率、触控方式和固件版本对应。'},
  {id:'ota',name:'ESP 远程升级',category:'设备工具',icon:'wifi',description:'了解固件升级的基本步骤，让设备更新的状态更清晰。',steps:['核对设备型号与固件版本','检查网络、电源及升级条件','下发后等待设备确认'],note:'升级前请备份配置，确认设备电量、网络连接及固件匹配。'},
];
