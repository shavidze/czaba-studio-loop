COMMIT: OK

没有发现阻断项。以下均为非阻断项。我只读了 diff、`Button.tsx` 和新测试,没有在真实浏览器里运行。事件顺序、监听器和定时器这几项的结论来自代码阅读。

**范围检查**
- 这次改动没有触碰 auth、purchase 或 download 代码。`account.downloads.tsx` 没改,只是通过共享的 `EmptyState` 间接受到样式变化影响。
- 没有新增 `any`、类型断言或抑制指令。
- 没有新增 effect、监听器或定时器,不存在泄漏风险。
- 所有改动都是在 render 时拼接 class 字符串,渲染成本可以忽略。
- `Button` 和 `Link` 的点击顺序、`reload` 处理函数都没变。

**按严重度排序的发现(均非阻断)**

1. **Low,可访问性:** `app/components/errors/ErrorBoundary.tsx:46` 和 `app/components/ui/EmptyState.tsx:76`、`app/components/ui/EmptyState.tsx:84`,次要操作改成了 `ghost`。
   - `ghost` 没有边框,背景透明,hover 填充对比度只有 1.12(doc 321 也承认了这个数字)。
   - 以前的 "Go Home" 和 "Browse the store" 都是实心按钮,现在在错误页上不太像可点击的按钮。
   - 修复:交给 DPG-COLOR-CONSOLIDATE 处理,可以给 `ghost` 加 hover/focus 边框或 `focus-visible:ring`。这一轮不用改。
   - 另外,`buildButtonClassName` 本身没有 `focus-visible` 样式。这是之前就有的问题,不是这次引入的,但链接和按钮的键盘焦点反馈仍然靠浏览器默认值。

2. **Low,测试脆弱:** `app/lib/__tests__/store-button-cleanup-2b.test.tsx:17-41` 和 `:151-174`,B2B-5 用 `indexOf` 在源码字符串里找 `'{/* Actions */}'` 和 `'</div>\n    </div>'` 这类锚点。
   - 一旦重新格式化,或者有人删掉 `{/* Actions */}` 注释,测试就会失败,而且和行为无关。
   - 项目规则也允许删注释。
   - 修复:这几个调用点已经有 DOM 行为测试(B2B-1 到 B2B-4、SE1),B2B-5 可以降级为可选检查,或者改成对整个文件做 token 扫描。

3. **Low,既有问题,不阻断:** `RootErrorBoundary` 在 `Layout` 的 body 里又渲染了一个 `<html>`。doc 321 已经记录为 B-R499-ROOT-ERRORBOUNDARY-NESTED-HTML,这轮没有修。

4. **Info,行为变化(已记录为 D3):**
   - 错误页的 "Try Again" 从 secondary 变成 primary,"Go Home" 从品牌色实心变成 ghost。
   - 加上 `type="button"` 是正确的。
   - 按钮高度从 50px 变成 48px,圆角变成 pill。设计文档 `DESIGN_SYSTEM.md` 已同步更新。

5. **Info,无 caller 的分支:** `EmptyState` 的 `onAction`/`onSecondaryAction` 分支现在没有任何 caller,只有 B2B-2 覆盖。保留它们是合理的,因为它们是组件 API 的一部分。

**做得好的地方**
- 用 `buildButtonClassName` 取代了手写的 `bg-brand`、`rounded-lg` 和 `text-black`,没有硬编码颜色,符合 Tailwind-first 和 token 规则。
- `EmptyState` 从 `./Button` 导入,避开了 `ui/` 内部的循环 import。
- B2B-0 用字面量作为基准来校验 builder 的输出,所以后面的 class 断言不会变成循环论证。
- SE1 真正走了 loader 报错到渲染的路径。
- 链接仍然是 `Link` 或 `<a>`,没有硬塞进 `<button>`,语义正确。
- "Go Home" 保持为普通 `<a href="/">`,B2B-3 验证了没有 `data-discover`,所以不会触发 SPA 的客户端导航。

**Architecture note**
- 信号:`app/components/ui/EmptyState.tsx:1-80`、`app/components/errors/ErrorBoundary.tsx:46`、`app/routes/store.tsx:353`。
- 现在 `Link` 配 `buildButtonClassName` 的模式在三个文件里重复出现。doc 321 已经提到调用次数在增加(SIG-R498-BUTTONLINK-WRAPPER)。
- 建议:先保留现状。按钮清理的 2b-2 到 2e 阶段完成后,再由 planner 排一个有边界的任务,做一个 `ButtonLink`,把 `Link` 和 `<a>` 都包进去。
- 验收要点:class 输出和现在逐字相同(B2B-0 的字面量基准),保留 `data-discover` 的行为,`Button` 的 ref 和公开形状不变。
- 这只是提议,不是这一轮要修的 finding。

**Score: 9/10**