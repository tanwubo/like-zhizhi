# Like Zhizhi 总路线图

English version: `docs/superpowers/plans/2026-05-15-like-zhizhi-master-roadmap.md`

> 这是项目级控制文档。每当阶段或主要任务批次完成、延期或重新定界时，都应更新本文档。

**目标：** 跟踪 Like Zhizhi Pro 类产品从基础设施到生产级打磨的完整重建过程。

**当前分支策略：** 按用户要求，直接在 `master` 上开发。除非用户改变此决定，否则本项目不使用 worktree。

**本地环境策略：** 本地开发和 e2e 验证不得依赖 Docker。使用项目本地且被忽略的 `.env` 直连 PostgreSQL 和 Redis。不要把密钥写入被跟踪的文件。

**参考来源策略：** 下载的 LikeGirl 社区版和目标 Pro 站点仅作为产品参考。只要最终产品功能完整，新实现可以使用不同的技术栈、数据模型、UI 组成和内部架构。

---

## 来源文档

- 产品设计：`docs/superpowers/specs/2026-05-15-like-zhizhi-full-rebuild-design.md`
- Phase 1 计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-1-foundation.md`
- Phase 2 计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-2-public-experience.md`
- Phase 3 管理设置/留言计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-admin-console.md`
- Phase 3 文章管理计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-notes-admin.md`
- Phase 3 相册管理计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-album-admin.md`
- Phase 3 清单管理计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-checklist-admin.md`
- Phase 3 足迹管理计划：`docs/superpowers/plans/2026-05-15-like-zhizhi-phase-3-footprint-admin.md`
- Phase 3 恋爱日管理计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-love-days-admin.md`
- Phase 3 音乐管理计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-music-admin.md`
- Phase 3 主题设置计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-theme-settings.md`
- Phase 3 媒体中心计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-media-center.md`
- Phase 3 集成配置计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-integrations.md`
- Phase 3 用户和角色计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-3-users-roles.md`
- Phase 4 分析、SEO 和打磨计划：`docs/superpowers/plans/2026-05-16-like-zhizhi-phase-4-analytics-seo-polish.md`

## 进度快照

最后更新：2026-05-16

| 领域 | 状态 | 备注 |
| --- | --- | --- |
| Phase 1 基础设施 | 已完成 | Next.js、Prisma/PostgreSQL、认证/session、管理后台框架、公开站点框架、种子数据、存储适配器、基础测试。 |
| Phase 2 公开体验 | 已完成 | 公开首页、文章、留言、足迹、相册、清单、恋爱日、关于页、导航、公开种子内容。 |
| 管理设置 | 已完成 | 站点设置、人物资料、模块开关。 |
| 留言审核 | 已完成 | 管理端审核页面和通过/隐藏操作。 |
| 文章管理 | 已完成 | 管理端文章列表、创建、编辑、删除、校验、公开预览路径。 |
| 相册管理 | 已完成 | 管理端相册列表、创建、编辑、删除、外部媒体登记、公开图片/视频渲染。 |
| 清单管理 | 已完成 | 管理端清单列表、创建、编辑、删除、校验、完成状态、目标日期、可选图片 URL。 |
| 足迹管理 | 已完成 | 管理端足迹列表、创建、编辑、删除、坐标校验、封面 URL、成对访问记录创建/更新/删除。 |
| 恋爱日管理 | 已完成 | 管理端恋爱日列表、创建、编辑、删除、日期校验、每年重复/农历标记、排序。 |
| 音乐管理 | 已完成 | 曲目 CRUD、管理端列表/创建/编辑/删除，以及启用曲目的公开播放器数据读取模型。 |
| 主题设置 | 已完成 | 主题编辑器、校验、公开 CSS 变量主题应用、背景媒体、玻璃效果和动画开关。 |
| 媒体中心上传 | 已完成 | 管理端媒体中心、外部媒体登记、存储上传 action、元数据辅助函数，以及可复用的管理端媒体选择器。 |
| 集成配置 | 已完成 | 管理端集成设置、加密密钥存储、对象存储环境状态，以及提供方未启用时的平稳默认行为。 |
| 用户和角色 | 已完成 | 仅 Owner 可操作的用户 CRUD、密码替换、禁用/启用流程、按角色过滤导航、服务端 mutation 权限守卫。 |
| 分析和打磨 | 已完成 | 访问 beacon/API、每日统计、仪表盘分析卡片、SEO metadata、sitemap、robots、删除确认、loading/error 状态、部署文档。 |

## 标准执行循环

未来每个批次都应遵循此循环：

1. 在 `docs/superpowers/plans/` 下创建或更新聚焦的实现计划。
2. 如果范围或顺序发生变化，先更新本路线图再实施。
3. 先为新行为编写失败测试。
4. 实现让测试通过所需的最小产品切片。
5. 对变更区域运行针对性验证。
6. 用范围明确的提交信息提交该批次。
7. 运行完整验证：
   - `pnpm lint`
   - `pnpm test`
   - `pnpm build`
   - `pnpm test:e2e`
8. 用完成状态、验证结果和任何延期事项更新本路线图。
9. 提交路线图更新。
10. 推送 `master`。

## 剩余阶段计划

### 批次 1：清单管理

**状态：** 已于 2026-05-15 完成。

**目标：** 让公开清单可完全通过管理后台维护。

**路由：**
- `/admin/content/checklist`
- `/admin/content/checklist/new`
- `/admin/content/checklist/[id]/edit`

**范围：**
- 列出清单项，包含标题、完成状态、发布状态、目标日期、地点、排序和操作。
- 创建、编辑、删除清单项。
- 支持完成切换和 `completedAt`。
- 在媒体选择器存在前，支持可选图片 URL。
- 重新验证 `/`、`/checklist`、`/admin` 和 `/admin/content/checklist`。

**测试：**
- 对必填标题和有效日期/数字字段做单元校验。
- 针对创建/更新/删除 server actions 的集成测试。
- E2E 测试：种子 owner 创建一条清单草稿，并能在管理端看到。

**退出标准：**
- 管理员无需直接改数据库即可维护清单内容。
- 公开清单继续渲染已发布条目。
- 完整验证通过。

### 批次 2：足迹管理

**状态：** 已于 2026-05-15 完成。

**目标：** 让地图/足迹地点和访问记录可维护。

**路由：**
- `/admin/content/footprints`
- `/admin/content/footprints/new`
- `/admin/content/footprints/[id]/edit`

**范围：**
- `FootprintPlace` CRUD。
- 嵌套或成对维护 `FootprintVisit`。
- 校验纬度和经度范围。
- 在媒体选择器存在前，支持封面 URL。
- 重新验证 `/`、`/footprints`、`/admin` 和足迹管理路由。

**测试：**
- 坐标边界单元校验。
- 地点和访问记录 mutation 集成测试。
- E2E 测试：种子 owner 创建一个足迹地点，并能在管理端看到。

**退出标准：**
- 管理员可以维护地点和访问记录。
- 公开足迹页渲染受管理的数据。
- 完整验证通过。

### 批次 3：恋爱日管理

**状态：** 已于 2026-05-16 完成。

**目标：** 让纪念日/倒计时事件可维护。

**路由：**
- `/admin/content/love-days`
- `/admin/content/love-days/new`
- `/admin/content/love-days/[id]/edit`

**范围：**
- `LoveDayEvent` CRUD。
- 维护标题、描述、日期、每年重复、农历标记和排序。
- 保留当前公开日期计算行为。
- 重新验证 `/`、`/love-days`、`/admin` 和恋爱日管理路由。

**测试：**
- 日期校验和既有 `formatLoveDay` 行为单元测试。
- 创建/更新/删除 actions 集成测试。
- E2E 测试：种子 owner 创建一个恋爱日事件，并能在管理端看到。

**退出标准：**
- 管理员可以维护所有恋爱日事件。
- 公开恋爱日页面渲染新增/编辑后的数据。
- 完整验证通过。

### 批次 4：音乐管理

**状态：** 已于 2026-05-16 完成。

**目标：** 让音乐曲目可维护，并为公开播放器做准备。

**路由：**
- `/admin/content/music`
- `/admin/content/music/new`
- `/admin/content/music/[id]/edit`

**范围：**
- `MusicTrack` CRUD。
- 维护标题、艺术家、封面 URL、来源 URL、来源类型、启用状态和排序。
- 为启用曲目添加公开音乐数据读取模型。
- 在主题/播放器打磨批次前，保持播放 UI 最小化。

**测试：**
- 标题、艺术家和有效来源 URL 的单元校验。
- 创建/更新/删除 actions 集成测试。
- E2E 测试：种子 owner 创建一条音乐曲目，并能在管理端看到。

**退出标准：**
- 管理员可以维护音乐列表。
- 公开播放器数据可以从启用曲目加载。
- 完整验证通过。

### 批次 5：主题设置

**状态：** 已于 2026-05-16 完成。

**目标：** 让管理员配置公开站点使用的视觉主题。

**路由：**
- `/admin/settings/theme`

**范围：**
- 编辑主色、背景图片 URL、背景视频 URL、玻璃效果开关和页面动画开关。
- 通过公开 layout 或 CSS 变量应用主题值。
- 缺少主题设置时保持默认值稳定。

**测试：**
- 颜色和 URL 字段单元校验。
- 主题更新 action 集成测试。
- E2E 测试：种子 owner 打开主题设置并保存有效主题。

**退出标准：**
- 主题设置影响公开渲染。
- 缺失或无效的可选媒体值能平稳降级。
- 完整验证通过。

### 批次 6：媒体中心和真实上传

**状态：** 已于 2026-05-16 完成。

**目标：** 用可复用媒体中心和对象存储上传路径替换仅支持外部媒体的工作流。

**路由：**
- `/admin/media`

**范围：**
- 列出媒体资产。
- 上传图片/视频/音频/文件资产到 S3 兼容存储。
- 在可行时存储宽高。
- 为文章、相册、清单、足迹和主题背景提供可复用选择器。
- 保留外部 URL 登记作为兜底入口。

**测试：**
- 媒体元数据和存储 key 生成单元测试。
- 使用 mocked storage adapter 的集成测试。
- 媒体登记路径 E2E 测试。如果本地直连数据库模式没有可用存储，二进制上传 e2e 可以保持 mocked 或延期。

**退出标准：**
- 管理员无需手动改数据库即可创建媒体资产。
- 在已配置环境中，对象存储上传可用。
- 本地直连数据库模式下完整验证通过，且不要求 Docker。

**备注：**
- 本地 e2e 覆盖外部媒体登记路径。二进制上传通过使用 mocked storage adapter 的单元/集成测试覆盖，因此本地直连数据库验证不需要对象存储。

### 批次 7：集成配置

**状态：** 已于 2026-05-16 完成。

**目标：** 增加可配置的第三方集成设置，并支持平稳回退。

**路由：**
- `/admin/integrations`

**范围：**
- 地图提供方设置。
- 天气提供方设置。
- 邮件通知设置。
- 对象存储设置展示/健康检查。
- 可选音乐提供方设置。
- 安全存储敏感值；不要在公开渲染中暴露密钥。

**测试：**
- 提供方配置校验单元测试。
- 保存非密钥和类似密钥字段的集成测试。
- E2E 测试：owner 可以打开并保存集成配置页。

**退出标准：**
- 禁用或未配置的集成不会破坏公开页面。
- 已配置的集成在管理端有清晰反馈。
- 完整验证通过。

**备注：**
- 对象存储密钥仍由环境变量驱动；管理页展示配置健康状态，但不在数据库中持久化 S3 凭据。
- 提供方密钥会在持久化前加密，管理端读取模型只暴露已配置/未配置状态。

### 批次 8：用户和角色

**状态：** 已于 2026-05-16 完成。

**目标：** 让管理端访问权限可以在产品内维护。

**路由：**
- `/admin/users`
- `/admin/users/new`
- `/admin/users/[id]/edit`

**范围：**
- owners/partners/moderators 的用户 CRUD。
- 密码重置或替换流程。
- 安全地禁用或移除用户。
- 按角色细化管理端导航可见性。
- 确保服务端 mutations 强制执行权限。

**测试：**
- 角色能力检查单元测试。
- 用户创建/更新/禁用 actions 集成测试。
- E2E 测试：owner 可以创建 moderator。

**退出标准：**
- 无需种子脚本即可管理用户访问。
- 角色限制在服务端强制执行。
- 完整验证通过。

**备注：**
- 禁用用户会在登录和 session 读取两个环节被阻止；禁用账号会清除其活跃 sessions。
- 用户删除有意设计为禁用/启用，避免作者内容成为孤儿数据，同时仍能移除访问权限。
- 服务端管理 mutations 现在使用角色能力守卫：owners 管理用户/集成，owners 和 partners 管理内容/设置，moderators 只能审核留言。

### 批次 9：分析、SEO 和产品打磨

**状态：** 已于 2026-05-16 完成。

**目标：** 完成产品体验和生产就绪工作。

**范围：**
- 访问事件收集和每日统计聚合。
- 管理仪表盘统计改进。
- SEO metadata、Open Graph、sitemap、robots。
- 公开端/管理端页面的 loading、empty 和 error 状态。
- 删除确认和更好的管理端校验反馈。
- 移动端布局检查。
- 与实际环境选择一致的部署文档。

**测试：**
- 统计聚合单元测试。
- 适用位置的访问记录集成测试。
- 覆盖公开端和管理端路由的 E2E smoke 测试。

**退出标准：**
- 产品对正常公开浏览和管理操作来说是完整的。
- 生产部署说明可重复执行。
- 完整验证通过。

**备注：**
- 公开页面现在向 `/api/visits` 发送非阻塞访问 beacon；admin、API、框架资源、sitemap 和 robots 路径会被忽略。
- `VisitEvent` 存储原始访问，`DailyStat` 跟踪每日访问数、独立访客、留言和文章计数。
- SEO metadata 从站点设置生成；sitemap 和 robots 使用 `APP_URL`。
- 管理端内容删除现在提交前需要浏览器确认。

## 路线图维护规则

当一个任务批次完成时：

1. 将 `Progress Snapshot` 中的状态从 `Not started` 改为 `Done`。
2. 在 `Source Documents` 中添加或更新对应阶段计划链接。
3. 在相关批次章节记录与本路线图的实质性偏差。
4. 如果某个功能被有意延期，说明原因以及转移到哪里。
5. 添加最新完整验证结果，包括日期和命令。
6. 在最终批次提交中一起提交路线图更新，或单独用 `docs:` 提交。

## 验证日志

### 2026-05-16

分析、SEO 和产品打磨后的最新已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，14 个测试文件，96 个测试。
- `pnpm build`：通过，包括 `/api/visits`、`/robots.txt` 和 `/sitemap.xml`。
- `pnpm test:e2e`：通过，19 个 Playwright 测试。

用户和角色后的最新已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，11 个测试文件，86 个测试。
- `pnpm build`：通过，包括 `/admin/users`、`/admin/users/new` 和 `/admin/users/[id]/edit`。
- `pnpm test:e2e`：通过，17 个 Playwright 测试。

集成配置后的上一已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，11 个测试文件，70 个测试。
- `pnpm build`：通过，包括 `/admin/integrations`。
- `pnpm test:e2e`：通过，16 个 Playwright 测试。

媒体中心后的上一已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，10 个测试文件，62 个测试。
- `pnpm build`：通过，包括 `/admin/media`。
- `pnpm test:e2e`：通过，15 个 Playwright 测试。

主题设置后的最新已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，9 个测试文件，54 个测试。
- `pnpm build`：通过，包括 `/admin/settings/theme`。
- `pnpm test:e2e`：通过，14 个 Playwright 测试。

备注：`pnpm build` 和 `pnpm test:e2e` 必须顺序运行，因为两者都会使用 `.next`；并行运行可能破坏生成的 Next.js 输出。

音乐管理后的最新已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，9 个测试文件，50 个测试。
- `pnpm build`：通过，包括 `/admin/content/music`、`/admin/content/music/new` 和 `/admin/content/music/[id]/edit`。
- `pnpm test:e2e`：通过，13 个 Playwright 测试。

恋爱日管理后的上一已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，9 个测试文件，45 个测试。
- `pnpm build`：通过，包括 `/admin/content/love-days`、`/admin/content/love-days/new` 和 `/admin/content/love-days/[id]/edit`。
- `pnpm test:e2e`：通过，12 个 Playwright 测试。

### 2026-05-15

足迹管理后的最新已验证状态：

- `pnpm lint`：通过。
- `pnpm test`：通过，9 个测试文件，38 个测试。
- `pnpm build`：通过，包括 `/admin/content/footprints`、`/admin/content/footprints/new` 和 `/admin/content/footprints/[id]/edit`。
- `pnpm test:e2e`：通过，11 个 Playwright 测试。

已知非阻塞日志输出：

- Next.js dev server 可能在 e2e 期间打印未来版本的 `allowedDevOrigins` 警告。
- Playwright dev-server 关闭时，可能在所有 e2e 测试通过后打印非阻塞的 `ECONNRESET aborted` 行。
- 使用直连远程数据库时，dev-server 输出中可能出现临时远程 PostgreSQL 连接错误，但最新完整 e2e 命令退出码为 0，且所有测试通过。
