// 全局polyfill - 修复 "self is not defined" 错误
// 必须在所有其他代码之前执行

if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  (global as any).self = global;
}

export {}; 