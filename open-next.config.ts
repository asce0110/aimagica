import { defineCloudflareConfig } from "@opennextjs/cloudflare";
// import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  // 基础配置适用于Cloudflare Workers
  // 可选：如果要使用R2缓存，取消注释下面的行
  // incrementalCache: r2IncrementalCache,
}); 