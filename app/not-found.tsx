'use client'

// 简单的 404 页面，避免 Html 导入冲突
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
      <a href="/">Return Home</a>
    </div>
  )
}