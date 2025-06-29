@echo off
echo 正在修复R2图片加载问题...

git add hooks/use-static-url.ts
git add public/static-urls.json

git commit -m "fix: restore images.aimagica.ai custom domain for all static assets"

git push origin master

echo 完成！Cloudflare Pages将自动重新部署。
echo 等待3-5分钟后，图片应该可以正常加载了。
echo 现在使用自定义域名: images.aimagica.ai

pause 