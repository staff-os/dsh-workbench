/**
 * 工作台自己画的图标。
 *
 * 宿主 primitives 那 70 个图标里没有「工具」这一形状，最接近的
 * `IconSkillOutline16` 画的是一份文档加一颗星——它说的是「一份写好的说明」，
 * 而技能在会话里是一件**被拿起来用的东西**。剩下能读作工具的只有齿轮
 * （在这套里已经是「设置」，`employee.tab.tools` 就用它）、插头与 API 那两个，
 * 后两个正被侧栏的插件域与 MCP 域占着——同一列里撞形状比换成文档还糟。
 *
 * 所以这里补一把扳手。图标就是几行 SVG，没必要为了一个形状去等上游。
 *
 * @module @staff-os/dsh-workbench/client/icons
 */

/**
 * 扳手。技能域用它。
 *
 * 描边画法（primitives 那边多是实心填充），因为一把开口扳手的头是个开环，
 * 实心轮廓要同时描内外两圈，在 16 px 上糊成一团。
 *
 * @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
 * @returns 图标元素。
 */
export function IconWrenchOutline16({
  size = 16,
  className,
}: {
  readonly size?: number
  readonly className?: string | undefined
}) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      {/* 头：开口朝右上的开环，缺口 80°，其余 280° 是环身。 */}
      <path d="M10.91 1.91A3.5 3.5 0 1 0 14.09 5.1" />
      {/* 柄：从环的左下缘斜下去，长度与环径相当。 */}
      <path d="M8.13 7.88 3.3 12.7" />
    </svg>
  )
}

/**
 * 一份普通文件。文件树上认不出类型的都画它。
 *
 * 顶掉的是 `IconCodeOutline16`——那是个 `#`，摆在文件名前面看着像文件名自己
 * 带了一个井号（`# report.html`），而不像一个图标。
 *
 * @param props - `size` 是边长，`className` 透传；颜色跟 `currentColor`。
 * @returns 图标元素。
 */
export function IconFileOutline16({
  size = 16,
  className,
}: {
  readonly size?: number
  readonly className?: string | undefined
}) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={true}
    >
      {/* 页面轮廓，右上角切掉一块。 */}
      <path d="M9.3 2.2H4.9A1.4 1.4 0 0 0 3.5 3.6v8.8a1.4 1.4 0 0 0 1.4 1.4h6.2a1.4 1.4 0 0 0 1.4-1.4V5.5z" />
      {/* 折角。 */}
      <path d="M9.3 2.2v2.2a1.1 1.1 0 0 0 1.1 1.1h2.1" />
    </svg>
  )
}
