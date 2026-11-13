COMMIT: OK

C PASS 和 verify 都过了。我读了 diff、新测试、实现文档和 `Button.tsx` 中的 `buildButtonClassName`。我没有运行测试或浏览器,所以没有亲自验证事件顺序和实际渲染。

## 按严重度排序的发现

没有阻塞项。

1. **低,可访问性/视觉:`app/components/ui/Button.tsx:88-99`。** `buildButtonClassName` 没有 `focus-visible` 样式。这四个页面的旧手写类里也没有,所以不是回归。链接现在和 Button 共用同一个 builder,所以以后给 builder 加 ring 时,这些链接会自动受益。修复:在 builder 里加统一的 `focus-visible:ring`,作为单独任务处理,不放进本次提交。

2. **低,渲染/打包:`app/routes/account.orders.tsx:5`、`checkout.cancel.tsx:6`、`checkout.success.tsx:8`、`faq.tsx:7`。** 四个路由都从 `~/components/ui` 的 barrel 导入。如果 barrel 带有 Modal 之类的重组件,而 `sideEffects` 没有声明好,tree-shaking 失败时会增大路由 chunk。verify 里的 build 是通过的,但我没有看 chunk 体积。修复:确认 package 的 `sideEffects` 设置,或直接从 `~/components/ui/Button` 导入。优先级低。

3. **低,测试脆弱性:`app/lib/__tests__/store-button-cleanup-2.test.tsx:36-38`。** `PRIMARY_LG_PILL` 和 `GHOST_LG_PILL` 是完整的类字符串。以后调整 token 或类的顺序会让 B2-0 到 B2-4 一起失败。这是有意的字面量对照,同时防止测试只拿 builder 对比 builder。修复:不用改,以后改 builder 时同步更新这两条即可。

4. **提示,可访问性:`checkout.cancel.tsx:42`、`checkout.success.tsx:188-199`。** 这是 Link 里放 lucide 图标加文字。lucide 图标默认带 `aria-hidden`,所以链接的可访问名称只是文字。测试用 `getByRole('link', { name })` 通过,说明名称没有受影响。无需修复。

## 已核对、没有问题的点

- **Auth/purchase/download:** 没有逻辑改动。`checkout.success.tsx` 只改了 `/account/downloads` 链接的 `className`。`to`、effect、计时器和 loader 都没动。
- **监听器/计时器泄漏:** 源码里没有新增 effect、listener 或 timer。测试里 B2-2 用 `vi.useFakeTimers()`,并在 `finally` 中恢复真实计时器。`afterEach` 调用了 `cleanup`。
- **事件顺序:** FAQ 的 `onClick={releaseLinkFocus}` 保留。orders 的 `<a href>` 保持普通 anchor(没有 `data-discover`),仍是整页加载,B2-4 断言了这一点。
- **TS strict:** 没有新增 `any`、`@ts-ignore` 或类型断言。
- **Tailwind/token:** 没有新增自定义 CSS,也没有硬编码颜色。ST5 加了 `--color-background === --color-brand-foreground` 的断言,保证深色文字的约定不会悄悄漂移。
- **布局偏差:** 文档已列出 D1 到 D4。FAQ 的 `px-8` 变成 `px-6`,orders 的 weight 和 hover 有变化,链接高度从 50px 变成 48px,圆角变成 pill。这些是设计决定,不是缺陷。
- **其他:** 404 页面的 "Browse Store" 暂时保留为文字链接,在文档里记了 TODO(PD-R498-404-SECONDARY-ALIGN)。实现文档已按规则写好。

## Architecture note

- 信号:"链接要用按钮样式"这一需求。证据是 `account.orders.tsx:237`、`checkout.cancel.tsx:42,48`、`checkout.success.tsx:188,194` 和 `faq.tsx:170` 共 6 处直接调用 `buildButtonClassName`。同一区域在 round 497 和 498 连续被改,还有 2b 到 2e 要做,符合"重复的高成本改动"这一信号。
- 保持:现在 6 处调用只是传参数,没有共享状态,也没有 ref 或 lifecycle 不变量。现在抽 `ButtonLink` 会增加 Remix `Link` 和普通 `<a>` 的分支(导航行为不同)。
- 提案(交给 planner,不在本轮处理):等 2b 完成后,调用点超过约 15 处时再评估。范围只限 `app/components/ui`。验收标准是 Link 和 `<a>` 的渲染 DOM 不变,`data-discover` 行为不变,并保留 B2-x 的断言。这条已记在 SIG-R498-BUTTONLINK-WRAPPER。
- 这只是对本次 diff 的 review,不代表整个模块已检查完。

## Score: 9/10