import { validateDataUrlImage } from './image';
import type { AnalyzeRequest } from '@/types/analysis';
export function validateAnalyzeRequest(body:AnalyzeRequest){if(!body.chatText?.trim()&&(!body.images||body.images.length===0))return '请至少输入文字聊天记录或上传一张截图';for(const img of body.images||[]){const err=validateDataUrlImage(img);if(err)return err}return null}
