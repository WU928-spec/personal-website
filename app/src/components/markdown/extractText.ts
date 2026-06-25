/**
 * 从 React 节点中提取纯文本
 */
export function extractText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (
    node !== null &&
    typeof node === 'object' &&
    'props' in (node as Record<string, unknown>)
  ) {
    const props = (node as { props?: { children?: unknown } }).props
    return extractText(props?.children)
  }
  return ''
}
