// Update presentation of older assistant replies without rewriting saved conversations.
export function assistantText(value){
 let text=String(value||'');
 const replacements=[
 ['此对话尚未接入真实模型。',''],
 ['当前为本地 AI 对话演示，我用「桌面温湿度显示器」固定模板展示完整流程：','基于「桌面温湿度显示器」方案：'],
 ['演示使用固定温湿度模板：','当前使用温湿度方案：'],
 ['真实 AI 推理与任意硬件方案生成尚未接入。',''],
 ['Code 面板中提供可编辑的 Arduino 示例。当前未连接模型、编译器和设备；可以修改并导出，不能据此判断代码已成功烧录。','可在 Code 面板编辑并导出 Arduino 程序。烧录前请核对目标硬件、引脚和依赖配置。'],
 ['已创建社区作品的本地副本。为演示完整工作流，接下来使用 ESP32 温湿度显示器模板，你可以继续对话、添加器件和连线。','已创建作品副本，可继续补充需求、添加器件和完成连线。'],
 ['你的输入会保留在本地项目中。','你的需求会随项目保存。'],
 ['示例接线配置','接线配置'],['Code 面板编辑示例','Code 面板编辑程序']
 ];
 for(const [before,after] of replacements)text=text.replaceAll(before,after);
 return text.trim();
}
export function orderNumber(id){return String(id||'').replace(/^WB-DEMO-/,'WB-');}
