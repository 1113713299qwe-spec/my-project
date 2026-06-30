import type { AnalysisResult } from './analysis';
export interface SavedCase{id:string;createdAt:string;relationshipStage:string;goal:string;chatText:string;analysis:AnalysisResult;adoptedReply?:string;note?:string}
