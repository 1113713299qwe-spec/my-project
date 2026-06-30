import fs from 'node:fs';
import path from 'node:path';
import type { KnowledgeItem } from '@/types/knowledge';

export const defaultTags=['吸引力展示','情绪体验','内核自信','边界感','投入结构','冷淡判断','邀约判断','避免讨好感','聊天升温','关系复盘'];
export function defaultKnowledgeItem():KnowledgeItem{const content=fs.readFileSync(path.join(process.cwd(),'src/data/relationship_knowledge.md'),'utf8');const now=new Date().toISOString();return{id:'default-relationship-knowledge',title:'恋爱聊天知识库',type:'course_note',content,tags:defaultTags,enabled:true,weight:5,createdAt:now,updatedAt:now}}
export function buildKnowledgeContext(items:KnowledgeItem[]|undefined,selectedTags:string[],strength:'low'|'medium'|'high'){const enabled=(items?.length?items:[defaultKnowledgeItem()]).filter(i=>i.enabled);const selected=enabled.filter(i=>!selectedTags?.length||i.tags.some(t=>selectedTags.includes(t))).sort((a,b)=>b.weight-a.weight).slice(0,8);const mode=strength==='high'?'严格按照知识库和思维导图逻辑输出':strength==='medium'?'明显参考知识库原则，同时保持自然':'只参考大方向，优先自然真实';return `\n【知识库影响强度】${strength}：${mode}\n\n【用户知识库】\n${selected.map(i=>`标题：${i.title}\n类型：${i.type}\n标签：${i.tags.join('、')}\n权重：${i.weight}\n内容：\n${i.content}`).join('\n\n---\n')}\n\n【本次必须参考的原则】\n1. 尊重、同意、真实表达和边界感优先。\n2. 先判断对方状态，再决定是否继续推进、降频或停止。\n3. 回复应自然可发送，避免讨好、连续追问和强需求感。\n\n【本次不要违反的原则】\n1. 不操控、欺骗、胁迫、骚扰、PUA 或诱导亲密关系。\n2. 不在对方冷淡、拒绝、不接话时强行推进或邀约。\n3. 不过度脑补对方心理，不把对方当攻略对象。`;}
