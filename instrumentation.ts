export async function register() {
  // 服务器启动时立即执行polyfill
  if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
    globalThis.self = globalThis;
  }
  
  if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
    global.self = global;
  }
  
  console.log('Server polyfills registered: self is now defined');
} 