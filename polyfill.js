// 全局 polyfill 用于修复 "self is not defined" 错误
// 必须在任何其他代码执行之前运行

if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
} 