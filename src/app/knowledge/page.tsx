import { KnowledgeEditor } from '@/components/KnowledgeEditor';
export default function Page(){return <div className="space-y-4 py-6"><h1 className="text-3xl font-bold">知识库 / 思维导图管理</h1><p className="text-neutral-600">支持 Markdown、思维导图文本、.md、.txt、.json；xmind、PDF、向量检索已预留扩展点。</p><KnowledgeEditor/></div>}
