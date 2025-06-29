// Server-side polyfills for browser globals
if (typeof globalThis !== 'undefined') {
  // 确保 self 变量存在
  if (typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  if (typeof globalThis.window === 'undefined') {
    globalThis.window = globalThis;
  }
}

// 同时为 global 对象设置 polyfill
if (typeof global !== 'undefined') {
  if (typeof global.self === 'undefined') {
    global.self = global;
  }
  if (typeof global.window === 'undefined') {
    global.window = global;
  }
}

// 立即执行的 polyfill，确保在任何模块加载前执行
(function() {
  if (typeof self === 'undefined') {
    if (typeof globalThis !== 'undefined') {
      globalThis.self = globalThis;
    } else if (typeof global !== 'undefined') {
      global.self = global;
    }
  }
})(); 