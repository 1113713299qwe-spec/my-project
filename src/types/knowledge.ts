export type KnowledgeType='course_note'|'mindmap'|'reply_rule'|'case_summary';
export interface KnowledgeItem{id:string;title:string;type:KnowledgeType;content:string;tags:string[];enabled:boolean;weight:number;createdAt:string;updatedAt:string}
