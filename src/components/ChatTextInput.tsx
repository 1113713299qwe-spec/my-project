'use client';
export function ChatTextInput({value,onChange}:{value:string;onChange:(v:string)=>void}){return <div className="card"><label className="label">文字聊天记录</label><textarea className="input mt-3 min-h-52" value={value} onChange={e=>onChange(e.target.value)} placeholder={'我：今天干嘛呢？\n她：没干嘛，躺着。\n我：那我陪你聊会？\n她：哈哈不用。'}/></div>}
