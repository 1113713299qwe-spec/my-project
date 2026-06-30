import './globals.css';
import Link from 'next/link';
export const metadata={title:'AI Relationship Reply Assistant',description:'健康、有边界感的 AI 恋爱聊天回复助手'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-CN"><body><header className="sticky top-0 z-10 border-b bg-white/85 backdrop-blur"><nav className="mx-auto flex max-w-6xl items-center justify-between p-4"><Link href="/" className="font-bold">AI Relationship Reply Assistant</Link><div className="flex gap-3 text-sm"><Link href="/analyze">分析</Link><Link href="/knowledge">知识库</Link><Link href="/cases">案例</Link><Link href="/settings">设置</Link></div></nav></header><main className="mx-auto max-w-6xl p-4">{children}</main></body></html>}
