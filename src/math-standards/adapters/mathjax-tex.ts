/**
 * MathJax's own TeX faces — the reference every other adapter must not disturb.
 * MathJax 自带的 TeX 字面 —— 所有其它适配器都不得触碰的参考基准。
 *
 * The families claimed here (`MJXTEX`, `MJX-TEX-*`, `MJX-BRK`, `MJX-MHC-*`, `MJXZERO`) are not a
 * user's substitute font: they are the faces MathJax draws from itself, and the table maths is laid
 * out from was computed offline for exactly these faces. The numbers already in MathJax's table
 * therefore *are* this font's metrics — there is nothing to adopt, and anything written over them
 * is a downgrade at best.
 *
 * 此处声明的字面并非用户替换进来的字体，而是 MathJax 自己绘制所用的字面；MathJax 布局所依赖的
 * 度量表正是针对这些字面离线计算出来的。因此 MathJax 表中已有的数值*就是*本字体的度量，无可采纳，
 * 任何覆写最好情况下也是倒退。
 *
 * This is also the bug this whole architecture replaces: stretchy assemblies (`\underbrace`,
 * `\left(...\right)`, extensible arrows) are put together from private-use pieces in these faces,
 * and overwriting their target sizes with another font's numbers corrupted brace height and span.
 * The reference is the one thing that must never be re-measured or re-sourced.
 *
 * 这也正是本架构所替换的旧缺陷：可伸缩构件（`\underbrace`、`\left(...\right)`、可延长箭头）由
 * 这些字面的私用区部件拼装而成，用别的字体的数值覆写其目标尺寸会破坏花括号的高度与跨度。
 * 参考基准是唯一绝不可重新测量或重新取值的东西。
 *
 * So `build()` declines, unconditionally and on purpose. The adapter exists so the registry names
 * the reference explicitly instead of the measurement fallback silently claiming these families and
 * canvas-measuring MathJax's own fonts — which would replace design metrics with ink guesses.
 *
 * 因此 `build()` 无条件、有意地拒绝产出。此适配器的存在是为了让注册表显式点名该参考基准，而不是
 * 让测量兜底适配器静默认领这些字面、用 canvas 去量 MathJax 自己的字体 —— 那会用墨迹猜测替换掉
 * 设计度量。
 */

import type { AdapterContext, MathFontAdapter, MathFontMetrics } from '../types';
import { matchByFamilyName } from '../types';

export const mathJaxTexAdapter: MathFontAdapter = {
    id: 'mathjax-tex',
    name: 'MathJax TeX faces (reference)',

    // Every face name MathJax's output can be styled with, plus the two core faces
    // (`MJXZERO` for the null/fallback glyph, `MJXTEX` for the plain TeX face).
    // MathJax 输出可能用到的全部字面名，外加两个核心字面（`MJXZERO` 空字形、`MJXTEX` 常规 TeX 字面）。
    families: [
        'MJX-TEX-N',
        'MJX-TEX-B',
        'MJX-TEX-I',
        'MJX-TEX-BI',
        'MJX-TEX-MI',
        'MJX-TEX-S1',
        'MJX-TEX-S2',
        'MJX-TEX-S3',
        'MJX-TEX-S4',
        'MJX-TEX-ZERO',
        'MJX-BRK',
        'MJX-MHC-N',
        'MJX-MHC-M',
        'MJXZERO',
        'MJXTEX',
    ],

    // Beats every family-specific adapter to these names, and long before the fallback (1000),
    // so the reference is claimed here and never reaches the measuring path.
    // 抢在所有族级适配器之前认领这些名字，更远在兜底（1000）之前，使参考基准在此被点名、
    // 永远不会进入测量路径。
    priority: 5,

    /**
     * Claims a face by exact, case-insensitive name — nothing looser, so an unrelated family can
     * never be mistaken for MathJax's own faces.
     * 按精确、大小写不敏感的名字认领字面；不作更宽的匹配，以免无关字族被误认成 MathJax 自带字面。
     */
    matches(familyName: string): boolean {
        try {
            return matchByFamilyName(this, familyName);
        } catch (error) {
            // A matcher must never throw: `buildMathMetrics` calls `matches` outside its own
            // try/catch, so one throw here would abort the whole registry. Unclaimed is the safe
            // outcome, and the failure is reported rather than swallowed.
            // 匹配器绝不抛异常：`buildMathMetrics` 在自身 try/catch 之外调用 `matches`，
            // 此处一抛就会中断整个注册表。未认领即安全结果，且失败会被上报而非吞掉。
            console.error('[mathjax-tex] family match failed:', error);
            return false;
        }
    },

    /**
     * Declines every request, with a note: these faces are MathJax's reference metrics and must be
     * left alone.
     * 拒绝一切请求，并附注：这些字面是 MathJax 的参考度量基准，必须保持原样。
     *
     * Returning `null` hands the family on to whatever the caller does with a decline, and writes
     * nothing: no `chars`, no `delimiters`, no `constants`. The caller's own font rules keep
     * MathJax's faces out of substitution in the first place.
     * 返回 `null` 表示拒绝并交还调用方处理，同时不写入任何内容：无 `chars`、无 `delimiters`、
     * 无 `constants`。调用方的字体规则本身就会把 MathJax 自带字面排除在替换之外。
     *
     * Nothing here reads `binary` or `ctx`, so nothing here can throw and no try/catch is needed.
     * 此处不读取 `binary` 或 `ctx`，因此不可能抛异常，无需 try/catch。
     */
    build(_binary: ArrayBuffer, _ctx: AdapterContext): MathFontMetrics | null {
        // Note: these faces are MathJax's reference metrics and must be left alone.
        // 注：这些字面是 MathJax 的参考度量基准，必须保持原样。
        return null;
    },
};
