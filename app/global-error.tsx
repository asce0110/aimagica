'use client'

// 空的全局错误页面，避免 Html 导入冲突
export default function GlobalError() {
  return (
    <html>
      <body>
        <h2>Something went wrong!</h2>
      </body>
    </html>
  )
}