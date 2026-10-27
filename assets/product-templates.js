export const productTemplates=[
  {
    "id": "planter",
    "model": "AL01",
    "name": "智能花盆",
    "revision": "V1",
    "image": "assets/products/planter-render-v2.png",
    "imageAlt": "智能花盆产品还原图，展示白色盆体、摄像头及前侧接口",
    "imageLabel": "产品还原图",
    "summary": "围绕绿植养护，整理环境采集、状态显示与交互模块。",
    "prompt": "基于智能花盆方案，为桌面绿植整理土壤、水位、光照采集与屏幕显示，并确认后续浇水功能需求。",
    "tags": [
      "植物养护",
      "ESP32-S3",
      "环境采集"
    ],
    "note": "本模板按需求规格书整理模块关系；水泵执行驱动在文档中列为待补齐，不把图片中的外观部件视作已验证的功能。",
    "wireNote": "画布端口按功能分组，接线配置列出文档记录的关键信号。电源、完整网表及实物连接仍以工程文件复核为准。",
    "modules": [
      {
        "id": "plant-main",
        "name": "ESP32-S3",
        "full": "ESP32-S3-WROOM-1-N16R8 主控",
        "role": "主控与连接",
        "pins": [
          "传感输入",
          "I²C",
          "TFT",
          "交互 / CAN"
        ],
        "description": "采集传感器并驱动显示；USB-C 与 CH340C 下载调试。",
        "source": true,
        "kind": "module",
        "price": null
      },
      {
        "id": "plant-sensors",
        "name": "土壤 / 水位",
        "full": "土壤、水位与湿度传感接口组",
        "role": "环境采集",
        "pins": [
          "SIG / WATER / MOISTURE"
        ],
        "description": "土壤 IO1、水位 IO5、湿度 IO4。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "plant-light",
        "name": "光照接口",
        "full": "I²C 光照传感接口",
        "role": "光照采集",
        "pins": [
          "I²C"
        ],
        "description": "光照接口 SCL→IO2、SDA→IO8。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "plant-display",
        "name": "TFT 显示",
        "full": "TFT 显示屏接口组",
        "role": "状态显示",
        "pins": [
          "D0 / D1 / 控制"
        ],
        "description": "D0→IO12、D1→IO11、RES→IO10、DC→IO9、CS→IO46。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "plant-io",
        "name": "交互与扩展",
        "full": "触摸、震动及 CAN 扩展接口",
        "role": "交互扩展",
        "pins": [
          "GPIO / CAN"
        ],
        "description": "触摸 IO7、震动 IO6；CAN TX→IO17、RX→IO18。",
        "source": false,
        "kind": "module",
        "price": null
      }
    ],
    "connections": [
      {
        "id": "plant-sensing",
        "from": "plant-main",
        "fromPin": "传感输入",
        "to": "plant-sensors",
        "toPin": "SIG / WATER / MOISTURE",
        "label": "土壤 IO1 · 水位 IO5 · 湿度 IO4",
        "type": "data"
      },
      {
        "id": "plant-light",
        "from": "plant-main",
        "fromPin": "I²C",
        "to": "plant-light",
        "toPin": "I²C",
        "label": "SCL IO2 · SDA IO8",
        "type": "clock"
      },
      {
        "id": "plant-display",
        "from": "plant-main",
        "fromPin": "TFT",
        "to": "plant-display",
        "toPin": "D0 / D1 / 控制",
        "label": "D0 IO12 · D1 IO11 · RES IO10 · DC IO9 · CS IO46",
        "type": "data"
      },
      {
        "id": "plant-io",
        "from": "plant-main",
        "fromPin": "交互 / CAN",
        "to": "plant-io",
        "toPin": "GPIO / CAN",
        "label": "触摸 IO7 · 震动 IO6 · CAN IO17 / IO18",
        "type": "data"
      }
    ],
    "folder": "1. AL01-智能花盆V1",
    "positions": {
      "plant-main": {
        "x": 4,
        "y": 34
      },
      "plant-sensors": {
        "x": 39,
        "y": 3
      },
      "plant-light": {
        "x": 70,
        "y": 3
      },
      "plant-display": {
        "x": 39,
        "y": 60
      },
      "plant-io": {
        "x": 70,
        "y": 60
      }
    },
    "code": "// 智能花盆 · 方案实现清单\n// 当前目录未提供可直接编译的完整固件，以下是开发备注。\n\n// ESP32-S3-WROOM-1-N16R8 主控：采集传感器并驱动显示；USB-C 与 CH340C 下载调试。\n// 土壤、水位与湿度传感接口组：土壤 IO1、水位 IO5、湿度 IO4。\n// I²C 光照传感接口：光照接口 SCL→IO2、SDA→IO8。\n// TFT 显示屏接口组：D0→IO12、D1→IO11、RES→IO10、DC→IO9、CS→IO46。\n// 触摸、震动及 CAN 扩展接口：触摸 IO7、震动 IO6；CAN TX→IO17、RX→IO18。\n\n// 画布端口按功能分组，接线配置列出文档记录的关键信号。电源、完整网表及实物连接仍以工程文件复核为准。\n"
  },
  {
    "id": "badge",
    "model": "AW02",
    "name": "录音笔",
    "revision": "V1",
    "image": "assets/products/badge-render-v2.png",
    "imageAlt": "录音笔产品还原图，金属色机身置于蓝色展台",
    "imageLabel": "产品还原图",
    "summary": "可佩戴的语音采集方案，连接数字麦克风、控制器和手机。",
    "prompt": "基于录音工牌方案，整理语音采集、STM32 与 ESP32-S3 传输、BLE 连接安卓手机，以及电源和离线存储需求。",
    "tags": [
      "语音采集",
      "STM32 + ESP32",
      "BLE"
    ],
    "note": "工程资料名称为 AW02 录音工牌，与本页录音笔方案对应。资料定义实时音频通过 BLE 发送到安卓手机；microSD 为预留的离线功能。电池容量、模组和量产接口仍需按文档冻结。",
    "wireNote": "功能连线按规格书整理，I²S、UART、SPI 的具体信号在配置中列出；完整电源与保护电路以原理图为准。",
    "modules": [
      {
        "id": "badge-main",
        "name": "STM32F411",
        "full": "STM32F411CEU6 主控",
        "role": "音频与状态控制",
        "pins": [
          "I²S2",
          "USART1",
          "SPI1",
          "3V3"
        ],
        "description": "采集音频、管理状态和存储。",
        "source": true,
        "kind": "module",
        "price": null
      },
      {
        "id": "badge-mic",
        "name": "INMP441",
        "full": "INMP441 数字麦克风",
        "role": "音频输入",
        "pins": [
          "I²S"
        ],
        "description": "I²S 单声道采集，L/R 接 GND。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "badge-ble",
        "name": "ESP32-S3",
        "full": "ESP32-S3 无线模组",
        "role": "手机通信",
        "pins": [
          "UART1"
        ],
        "description": "接收音频，通过 BLE 连接安卓 APP。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "badge-sd",
        "name": "microSD",
        "full": "MR01A-01211 microSD 卡座",
        "role": "离线存储预留",
        "pins": [
          "SPI"
        ],
        "description": "当前实时上传流程不依赖 microSD。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "badge-power",
        "name": "电源管理",
        "full": "BQ24074 / TPS63020 / 锂电池",
        "role": "充电与供电",
        "pins": [
          "3V3"
        ],
        "description": "电池容量与装配尺寸待最终确认。",
        "source": false,
        "kind": "module",
        "price": null
      }
    ],
    "connections": [
      {
        "id": "badge-audio",
        "from": "badge-main",
        "fromPin": "I²S2",
        "to": "badge-mic",
        "toPin": "I²S",
        "label": "BCLK PB10 · WS PB12 · SD PB15 · L/R 接地",
        "type": "clock"
      },
      {
        "id": "badge-uart",
        "from": "badge-main",
        "fromPin": "USART1",
        "to": "badge-ble",
        "toPin": "UART1",
        "label": "PA9→GPIO18 · PA10←GPIO17 · UART 921600 bps",
        "type": "data"
      },
      {
        "id": "badge-storage",
        "from": "badge-main",
        "fromPin": "SPI1",
        "to": "badge-sd",
        "toPin": "SPI",
        "label": "CS PA4 · CLK PA5 · MISO PA6 · MOSI PA7",
        "type": "data"
      },
      {
        "id": "badge-power",
        "from": "badge-main",
        "fromPin": "3V3",
        "to": "badge-power",
        "toPin": "3V3",
        "label": "TPS63020 输出 3.3V · 系统共地",
        "type": "power"
      }
    ],
    "folder": "2. AW02-录音工牌V1",
    "positions": {
      "badge-main": {
        "x": 4,
        "y": 34
      },
      "badge-mic": {
        "x": 39,
        "y": 3
      },
      "badge-ble": {
        "x": 70,
        "y": 3
      },
      "badge-sd": {
        "x": 39,
        "y": 60
      },
      "badge-power": {
        "x": 70,
        "y": 60
      }
    },
    "code": "// 录音笔 · 方案实现清单\n// 当前目录未提供可直接编译的完整固件，以下是开发备注。\n\n// STM32F411CEU6 主控：采集音频、管理状态和存储。\n// INMP441 数字麦克风：I²S 单声道采集，L/R 接 GND。\n// ESP32-S3 无线模组：接收音频，通过 BLE 连接安卓 APP。\n// MR01A-01211 microSD 卡座：当前实时上传流程不依赖 microSD。\n// BQ24074 / TPS63020 / 锂电池：电池容量与装配尺寸待最终确认。\n\n// 功能连线按规格书整理，I²S、UART、SPI 的具体信号在配置中列出；完整电源与保护电路以原理图为准。\n"
  },
  {
    "id": "watch",
    "model": "AW01",
    "name": "智能手表",
    "revision": "V1",
    "image": "assets/products/watch-render-v2.png",
    "imageAlt": "智能手表产品还原图，浅色表带与数字时钟屏幕",
    "imageLabel": "产品还原图",
    "summary": "围绕腕上交互，组织心率、运动、环境采集与手机连接。",
    "prompt": "基于智能手表方案，整理心率、步数、环境温湿度、屏幕触摸和 BLE 手机连接，并确认佩戴与交付需求。",
    "tags": [
      "腕上交互",
      "STM32",
      "BLE"
    ],
    "note": "需求文档中的硬件映射仍有待核验项。本模板展示功能级关系，不把功能端口视作实物 GPIO；心率用于趋势展示。",
    "wireNote": "此处为功能级连线，未指定未经核验的 GPIO。BLE 模组型号、实际传感器装配与总线引脚需结合工程和实物确认。",
    "modules": [
      {
        "id": "watch-main",
        "name": "STM32 主控",
        "full": "STM32F411 系列控制器",
        "role": "数据与界面控制",
        "pins": [
          "传感采集",
          "显示",
          "触摸",
          "无线串口"
        ],
        "description": "具体订货型号与 PCB 配置待核验。",
        "source": true,
        "kind": "module",
        "price": null
      },
      {
        "id": "watch-sensors",
        "name": "感知模块",
        "full": "EM7028 / 运动与环境传感模块",
        "role": "心率与环境",
        "pins": [
          "数据接口"
        ],
        "description": "按需求文档归集；实际模块与总线地址待实物确认。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "watch-display",
        "name": "ST7789",
        "full": "ST7789 显示接口",
        "role": "腕上显示",
        "pins": [
          "显示接口"
        ],
        "description": "屏幕规格和 FPC 引脚需复核。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "watch-touch",
        "name": "CST816",
        "full": "CST816 触摸与实体按键",
        "role": "操作输入",
        "pins": [
          "触摸接口"
        ],
        "description": "按固件交互定义组织。",
        "source": false,
        "kind": "module",
        "price": null
      },
      {
        "id": "watch-ble",
        "name": "BLE 模组",
        "full": "KT6368A BLE 通信模块",
        "role": "连接安卓手机",
        "pins": [
          "UART"
        ],
        "description": "文档标称 KT6368A，型号需现场复核。",
        "source": false,
        "kind": "module",
        "price": null
      }
    ],
    "connections": [
      {
        "id": "watch-sensors",
        "from": "watch-main",
        "fromPin": "传感采集",
        "to": "watch-sensors",
        "toPin": "数据接口",
        "label": "功能关系：采样与状态数据；实际总线 / GPIO 待核验",
        "type": "data"
      },
      {
        "id": "watch-display",
        "from": "watch-main",
        "fromPin": "显示",
        "to": "watch-display",
        "toPin": "显示接口",
        "label": "功能关系：界面刷新；屏幕与 FPC 定义待核验",
        "type": "data"
      },
      {
        "id": "watch-touch",
        "from": "watch-main",
        "fromPin": "触摸",
        "to": "watch-touch",
        "toPin": "触摸接口",
        "label": "功能关系：触摸与按键输入；GPIO 待核验",
        "type": "data"
      },
      {
        "id": "watch-ble",
        "from": "watch-main",
        "fromPin": "无线串口",
        "to": "watch-ble",
        "toPin": "UART",
        "label": "功能关系：UART→BLE→安卓手机；硬件引脚待核验",
        "type": "data"
      }
    ],
    "folder": "3. AW01-智能手表V1",
    "positions": {
      "watch-main": {
        "x": 4,
        "y": 34
      },
      "watch-sensors": {
        "x": 39,
        "y": 3
      },
      "watch-display": {
        "x": 70,
        "y": 3
      },
      "watch-touch": {
        "x": 39,
        "y": 60
      },
      "watch-ble": {
        "x": 70,
        "y": 60
      }
    },
    "code": "// 智能手表 · 方案实现清单\n// 当前目录未提供可直接编译的完整固件，以下是开发备注。\n\n// STM32F411 系列控制器：具体订货型号与 PCB 配置待核验。\n// EM7028 / 运动与环境传感模块：按需求文档归集；实际模块与总线地址待实物确认。\n// ST7789 显示接口：屏幕规格和 FPC 引脚需复核。\n// CST816 触摸与实体按键：按固件交互定义组织。\n// KT6368A BLE 通信模块：文档标称 KT6368A，型号需现场复核。\n\n// 此处为功能级连线，未指定未经核验的 GPIO。BLE 模组型号、实际传感器装配与总线引脚需结合工程和实物确认。\n"
  }
];
export const templateById=id=>productTemplates.find(t=>t.id===id);
export const templateFor=flow=>templateById(flow?.templateId);
export function detectTemplate(text){return /花盆|绿植|浇水/.test(text)?'planter':/工牌|录音|语音采集/.test(text)?'badge':/手表|腕|心率/.test(text)?'watch':'';}
