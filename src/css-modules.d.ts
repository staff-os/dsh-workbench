/**
 * CSS Modules 的类型声明。
 *
 * 构建期由 lightningcss 换成真实的哈希类名表（见 tsdown.client.ts）；
 * 类型检查这边只需要知道它是个字符串字典。
 */
declare module '*.module.css' {
  const classes: Readonly<Record<string, string>>
  export default classes
}
