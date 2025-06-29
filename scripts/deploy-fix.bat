@echo off
echo 正在修复R2图片加载问题...

echo 添加修改的文件...
git add .

echo 提交修复...
git commit -m "fix: update CDN configuration for R2 image loading"

echo 推送到GitHub...
git push

echo 完成！Cloudflare Pages将自动重新部署。
echo 请在Cloudflare Dashboard中设置环境变量：
echo NEXT_PUBLIC_ENABLE_CDN=true
echo NEXT_PUBLIC_CDN_BASE_URL=https://images.aimagica.ai
echo NODE_ENV=production

pause 