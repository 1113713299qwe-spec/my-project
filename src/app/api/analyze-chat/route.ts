import { NextResponse } from 'next/server';
import { getOpenAI } from '@/lib/openai';
import { buildKnowledgeContext } from '@/lib/knowledge';
import { validateAnalyzeRequest } from '@/lib/validators';
import { relationshipAssistantPrompt } from '@/prompts/relationship-assistant';
import type { AnalyzeRequest } from '@/types/analysis';
import type { KnowledgeItem } from '@/types/knowledge';

export async function GET(){return NextResponse.json({configured:Boolean(process.env.OPENAI_API_KEY)});}
export async function POST(req:Request){try{const body=await req.json() as AnalyzeRequest & {knowledgeItems?:KnowledgeItem[]};if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:'OPENAI_API_KEY 未配置，请在 .env.local 中设置。'},{status:500});const validation=validateAnalyzeRequest(body);if(validation)return NextResponse.json({error:validation},{status:400});
const knowledgeContext=buildKnowledgeContext(body.knowledgeItems,body.selectedKnowledgeTags||[],body.knowledgeStrength||'medium');
const userText=`当前关系阶段：${body.relationshipStage}\n我的目标：${body.goal}\n回复风格：${body.replyStyle}\n\n文字聊天记录：\n${body.chatText||'(无，仅分析图片)'}`;
const content:any[]=[{type:'input_text',text:userText},...(body.images||[]).map(image_url=>({type:'input_image',image_url}))];
const openai=getOpenAI();
const response=await openai.responses.create({model:body.model||'gpt-5.5',input:[{role:'system' as any,content:[{type:'input_text',text:relationshipAssistantPrompt+'\n\n'+knowledgeContext}]},{role:'user' as any,content}],text:{format:{type:'json_object'}} as any});
const text=(response as any).output_text || (response as any).output?.flatMap((o:any)=>o.content||[]).find((c:any)=>c.text)?.text;
if(!text)throw new Error('OpenAI 未返回文本');
try{return NextResponse.json({result:JSON.parse(text)})}catch{return NextResponse.json({error:'JSON 解析失败',raw:text},{status:502})}
}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'OpenAI API 调用失败'},{status:500})}}
