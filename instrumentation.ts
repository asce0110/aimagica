// 立即执行的polyfill，在任何其他代码之前
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

// 确保 self 在所有环境中都存在
if (typeof self === 'undefined') {
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).self = globalThis;
  } else if (typeof global !== 'undefined') {
    (global as any).self = global;
  }
}

export async function register() {
  // 再次确保polyfill在服务器启动时设置
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    global.self = global;
  }
  
  console.log('Server polyfills registered: self is now defined');
} 