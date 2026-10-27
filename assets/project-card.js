import {isLocalizableProjectName} from './i18n.js?v=20261027-web-r4';
import {icon,esc} from './icons.js?v=20261027-web-r4';
import {connectionsFor} from './workflow-data.js?v=20261027-web-r4';

export function projectCard(project,state){
 const id=project.flowId||project.id;
 const flow=state.flows[id];
 const name=flow?.name||project.name;
 const devices=flow?.modules?.length||0;
 const wires=flow?.wires?.length||0;
 const ordered=state.orders.some(order=>order.projectId===id);
 const status=ordered?'订单已创建':flow&&wires===connectionsFor(flow).length?'连线完成':wires?'连线中':devices?'器件已添加':flow?.plan?'方案已生成':'待完善想法';
 const description=flow?.idea?.trim()||(project.source?'基于社区作品继续创作':'添加项目想法，开始整理硬件需求。');
 return `<article class="draft-card project-card">
  <div class="project-card-heading"><span class="draft-icon">${icon('folder',21)}</span><span class="status-pill">${status}</span></div>
  <h3><button translate="${isLocalizableProjectName(name)?'yes':'no'}" class="project-title-link" data-edit="${esc(id)}" title="${esc(name)}" ${flow?'':'disabled'}>${esc(name)}</button></h3>
  <p translate="no" class="project-description" title="${esc(description)}">${esc(description)}</p>
  <div class="project-composition"><span>${icon('cpu',14)}${devices} 个器件</span><span>${icon('link',14)}${wires} 条连线</span></div>
  <div class="draft-meta"><span>已保存</span><span class="project-card-actions card-actions"><button class="secondary project-delete card-action-delete" data-project-delete="${esc(id)}" aria-label="删除方案：${esc(name)}">删除方案</button><button class="primary project-continue" data-edit="${esc(id)}" ${flow?'':'disabled'}>${flow?'继续创作':'项目记录不可用'}${icon('arrow',16)}</button></span></div>
 </article>`;
}
