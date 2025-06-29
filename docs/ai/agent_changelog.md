## 2025-06-08
- User requested to be called Asce.
- User requested to call the AI assistant 瑶瑶.
- User requested to update styles categories from 6 types to 12 new types: Photographic Realism, Illustration & Digital Painting, Anime & Comics, Concept Art, 3D Render, Abstract, Fine-Art Movements, Technical & Scientific, Architecture & Interior, Design & Commercial, Genre-Driven, Vintage & Retro.
- User requested to optimize gallery sharing flow: remove automatic popup dialog after image generation, replace with checkbox in result page, default unchecked, only share when user checks the box.
- User requested support for multiple aspect ratios in image generation: 1:1, 2:3, 3:2, 16:9, 9:16, and 4:3 with dynamic size conversion for different API providers.

## 2025-06-09
- User requested permanent fix for style templates missing {prompt} placeholder: Created admin API endpoint `/api/admin/styles/fix-templates` for checking and automatically fixing style templates, added "Fix Templates" button in admin dashboard to detect and repair problematic styles, implemented template validation in style form to prevent saving templates without {prompt} placeholder, and enhanced visual feedback with validation warnings and success indicators.
- User requested optimization of image generation progress display and user experience: Fixed 90% stuck progress issue by implementing staged progress system with smooth transitions, redesigned RenderProgress component to be more compact and informative, added real-time stage indicators, estimated time remaining, and Chinese interface text for better user understanding.
- User requested real-time progress monitoring from API and larger display interface: Implemented streaming API with real-time progress callbacks that monitor actual KIE.AI progress values (0.0-1.0), created new ApiManager methods `generateImageWithProgress` and `callApiWithProgress` to support progress callbacks, redesigned RenderProgress component to be larger (max-w-3xl) with integrated image result display, added streaming response handler in API route that sends progress updates in real-time, and enhanced UI to show generated images directly in the progress component when complete.
- User reported error about undefined generatedImages variable and requested aspect ratio selection buttons: Fixed undefined generatedImages state variable by adding proper state declarations, added selectedAspectRatio and selectedStyleId state management, made aspect ratio selection visible in both Quick and Professional modes with improved layout (3x6 grid), maintained backward compatibility by setting both new generatedImages and legacy generatedImage states, and ensured proper parameter passing between components for aspect ratio and style selection.
- User requested to move edit and more buttons from image overlay to below gallery sharing section, and add style preview during generation to reduce waiting anxiety: Removed overlay buttons that were covering the generated image, moved edit and more buttons to below the gallery sharing section with better layout, added style preview section in RenderProgress component showing example style thumbnails and encouraging messages based on progress stages, implemented dynamic progress-based messages to keep users engaged during generation process.
- User reported duplicate import error for Brush and Palette icons: Fixed duplicate import declarations in app/page.tsx by removing the redundant Brush and Palette imports that were causing compilation errors, ensuring proper lucide-react icon imports without duplication.
- User requested to remove style description text from style selector cards: Removed all description text from style cards (NO STYLE "Original prompt", free styles descriptions, premium styles descriptions) to create cleaner, more concise interface showing only style names and emojis.
- User requested to limit displayed styles to 12 by default with remaining styles shown in popup modal: Implemented style pagination showing only first 11 free styles plus "No Style" option by default, added attractive "VIEW MORE" card with style count indicator, created modal dialog with grid layout to display all available styles, ensured seamless style selection with automatic modal closing after selection.
- User requested to adjust layout to show exactly 2 rows of 6 columns: Modified style display to show 10 free styles + 1 "VIEW MORE" button + 1 "NO STYLE" = 12 total positions in a 6-column grid layout for clean 2-row display, ensuring consistent layout regardless of screen size.

## 2025-06-11
- 用户请求生图时"Describe Your Vision!"为空也可以，因为已经添加了默认提示词功能：修改了前端验证逻辑，当选中的风格有默认提示词时允许用户输入为空，添加了视觉提示显示当前风格的默认提示词，并相应更新了各组件间的数据传递。
- 修复了图片生成时缺少数量参数的问题：用户选择生成两张图或四张图时，现在会正确传递 `imageCount` 参数到API
- 增强了KIE.AI API的参数处理：支持 `count` 参数来生成多张图片，参考格式："count": 2, "size": "9:16"
- 完善了前端到后端的参数传递链：GenerationInterface → handleStartRender → API → ApiManager → KIE.AI
- 添加了详细的调试日志来跟踪图片数量和比例参数的传递过程
- 修复了比例参数不同步的问题：GenerationInterface组件的比例选择现在会正确同步到主页面状态，解决了选择9:16但API收到1:1的问题
- 添加了onAspectRatioChange回调机制，确保比例状态在组件间正确传递
- 修复了KIE.AI API "size error"问题：统一了API路由和ApiManager中的尺寸映射，9:16现在正确映射为1024x1792
- 增强了KIE.AI错误处理：添加了响应错误检查，正确处理422等错误码
- 添加了KIE.AI必需参数：isEnhance=false, uploadCn=false，确保API调用格式完整
- 用户提供了KIE.AI API文档显示只支持3种尺寸比例：1:1, 3:2, 2:3
- 更新了ApiManager中的尺寸映射，将不支持的比例自动转换为最接近的支持格式（16:9→3:2, 9:16→2:3, 4:3→3:2）
- 在用户界面添加了比例转换提示，告知用户选择不支持比例时的自动转换行为
- 用户指出多张图片参数应该是nVariants而不是count，参考KIE.AI 4o Image API文档
- 修正了ApiManager中的参数映射：count → nVariants，确保多张图片生成功能正常工作
- 用户反馈生成4张图片时出现超时，要求延长超时时间到5分钟
- 增加了轮询最大尝试次数：60次→150次，支持5分钟总超时（150×2秒=300秒）
- 增加了查询接口单次超时：10秒→30秒，提高单次请求稳定性
- 更新了新API配置默认超时：60秒→300秒，适配多张图片生成需求
- 用户要求优化多张图片的界面布局，避免单张图片过大需要滚动
- 实现响应式图片网格布局：1张居中显示（max-w-md），2张横向排列，4张2x2网格
- 调整图片尺寸：单张时h-80/h-96，多张时h-48/h-64，避免过大占屏
- 添加点击放大功能：点击图片在新标签页打开大图查看
- 增加悬停效果：鼠标悬停显示放大图标和缩放动画，提升用户体验
- 用户反馈界面仍显示1张超大图片，发现存在两个图片显示位置导致冲突
- 修复了主页面结果页面的图片显示逻辑：单张图片显示原有大图界面，多张图片显示网格布局
- 删除重复的Gallery sharing和按钮代码，统一为一套适用于单张和多张的界面组件
- 确保多张图片时不再显示超大的单张图片界面，改用紧凑的网格布局

## 2025-06-10
- 用户请求在风格管理中添加默认提示词功能：管理员可以设置英文默认提示词（如"Sun Wukong causing havoc in heaven"），当用户不输入提示词时使用默认值，用户输入了提示词就使用用户的，默认提示词不使用。

## 2025-06-13
- 用户反馈点击生图时跳转的界面应该直接展示生图界面，而不是需要用户滚动鼠标才能看到生图进度：实现了自动滚动功能，在开始生图时使用scrollIntoView()自动滚动到RenderProgress组件位置，改善用户体验避免手动滚动查看进度，同时在主页面和视频创建页面都添加了该功能。
- 用户反馈图生图功能不生效，即使选中图生图模式且上传了图片，也不允许没有提示词的情况下生图：修复了图生图功能，包括修改前端验证逻辑允许图生图模式下无提示词生成、API路由添加image_url参数支持、KIE.AI API Manager添加图生图的image_url参数处理、为图生图模式设置默认提示词"Transform this image using AI"，现在用户只要上传图片就可以进行图生图，提示词变为可选项。
- 用户要求移除生图界面中的"Magic Prompt Library!"模块：从主页面右侧边栏移除了整个Magic Prompt Library模块，包括CommunityGallery组件，让界面更简洁，减少干扰用户操作的元素。
- 用户反馈图生图功能还是没生效，仍然按文生图无提示词逻辑处理：添加了完整的调试信息和日志输出，包括在前端API调用、后端路由处理、KIE.AI API Manager中都增加了详细的图生图模式检测和图片数据传递状态的日志，便于排查问题根源。修正了API路由中图生图模式的提示词处理逻辑，移除了强制设置默认提示词的行为，让KIE.AI API自己处理无提示词的图生图。同时优化了KIE.AI API Manager中的prompt参数传递，图生图模式下如果没有提示词则不传递prompt参数，避免干扰图生图效果。
- 发现图生图核心问题：KIE.AI API参数名称错误，应该使用fileUrl而不是image_url：通过错误日志"fileUrl and prompt at least one is not empty"发现KIE.AI API需要fileUrl参数而不是image_url，修正了ApiManager中的参数名称，现在图片数据可以正确传递给KIE.AI进行图生图处理。
- 修复React Hydration错误：FloatingGenerationTips组件使用typeof window条件判断导致服务器端和客户端渲染不匹配，修改为使用isClient状态和useEffect确保客户端挂载后再同步状态，避免hydration mismatch错误。
- 解决KIE.AI无法访问base64图片数据的问题：通过错误日志"Failed to fetch the image. Kindly verify any access limits set by you or your service provider"发现KIE.AI API无法直接使用base64数据作为fileUrl，创建了新的API端点`/api/images/upload-base64`将base64图片先上传到Cloudflare R2获得可访问的URL，修改了图片生成API在img2img模式下先上传图片到R2再传递URL给KIE.AI，现在图生图功能应该可以正常工作了。
- 修复比例和数量参数传递问题：用户反馈选择1:1和1张图片但生成了不同比例和数量的图片，发现是参数优先级和默认值设置问题，修复了API参数优先级让组件传递的参数优先、修复KIE.AI size参数映射支持比例格式输入、确保nVariants参数始终被设置默认为1而不是KIE.AI的默认值2。
- 优化图生图风格处理逻辑：用户澄清图生图可以选择风格，图片提供内容、风格提供艺术表现形式，修正了处理逻辑为图生图模式下不使用风格的默认提示词(只对文生图有效)，但可以使用风格模板，这样用户可以将图片转换为特定艺术风格如油画、水彩等，同时保持图片内容的完整性。
- 修复图生图输入提示词后参数错误的问题：用户反馈img2img模式下不输入提示词工作正常，但输入提示词后又回到生成2张非1:1比例图片的问题，发现是ApiManager中参数优先级错误，配置数据中的默认值覆盖了用户传递的参数，修改为用户参数优先`{ ...config.config_data, ...requestData }`确保用户选择的比例和数量始终生效。

## 2025-01-14
- 实现图片编辑器功能：用户要求点击"EDIT IMAGE 🖌️"按钮时能像https://neumorphism.io网站一样对生成的图片进行颜色和效果修改，创建了ImageEditor组件支持亮度、对比度、饱和度、色相、模糊、复古、灰度、反色等8种滤镜效果，使用Canvas API和CSS滤镜实现实时预览，提供重置、下载、保存功能，采用响应式设计支持桌面和移动端使用。

## 2025-06-14
- User reported img2img aspect ratio not working correctly and image editor content not displaying
- Redesigned image display layout: moved action buttons (View, Edit, Regenerate) to bottom of each individual image instead of global buttons
- Fixed image editor loading issues by adding fallback loading mechanism and better error handling for CORS issues
- Added regenerate functionality that returns user to creation interface with ability to modify prompts
- Improved single image display with larger preview and better button layout
- Added data-step attribute to creation interface for proper scroll targeting when regenerating
- Enhanced user experience with individual image controls rather than global controls
- Optimized multi-image layout: 2 images display horizontally (1 row, 2 columns), 4+ images display in grid format (2x2), with responsive sizing and button adjustments
- Simplified image editor inspired by neumorphism.io: focused on border radius control (including circular shapes), reduced filter options to essential ones (brightness, contrast, blur), improved canvas rendering with proper clipping paths for rounded corners
- Replaced image editor with image viewer: removed edit functionality per user request, created new ImageViewer component with social media sharing capabilities (Facebook, Twitter, WhatsApp, LinkedIn, Telegram, Reddit), added download and copy link features, changed "View" button to open modal instead of new window
- Optimized image display size: reduced image height to ensure 4 images can be viewed in one screen (max-h-48 md:max-h-64), moved "Share to Gallery" button to individual image level instead of global, allowing users to selectively share only good quality images
- Removed global gallery sharing section and enhanced individual image sharing: removed the global checkbox for gallery sharing, added descriptive text "Share your amazing artworks with other creators! 🎨" under each image's share button to explain the purpose and benefits of sharing
- Redesigned image display with hover effects: removed static buttons below images, implemented hover overlay with semi-transparent buttons that slide up from bottom, made images larger and more prominent, added click-to-view functionality
- Enhanced image viewer with zoom controls and custom sharing: added zoom in/out/reset functionality (50%-300%), implemented custom share message editing with default text, updated all social media sharing to include https://aimagica.ai website link, improved UI with better controls and responsive design
- Improved gallery sharing and social media sharing: added explanatory text "Other users will see this artwork in the gallery!" for gallery sharing button, updated social media sharing to include actual image URLs along with custom text and AIMAGICA branding, ensuring proper attribution and website promotion
- User requested sidebar to remain visible on result page: removed conditional hiding of sidebar when currentStep is 'result', ensuring sidebar with upgrade prompts and additional content remains visible throughout the entire user journey including after image generation is complete
- User reported CREATE interface not showing quality prompts module in right sidebar: implemented complete Magic Prompts feature by adding "MAGIC PROMPTS! ✨" module to sidebar additionalBoxes array, increased default sidebarBoxes from 2 to 3 to ensure at least one dynamic module displays, made Magic Prompts module clickable to open PromptsCommunity component, created comprehensive PromptsCommunity interface with 12 professional prompts across 8 categories (Fantasy, Anime, Cyberpunk, Nature, Portrait, Abstract, Cute), added search functionality and category filtering, implemented copy and use prompt actions that integrate with main creation interface
