import { extractText } from './extractText'
import Callout from './Callout'

export default function Blockquote({ children }: { children: React.ReactNode }) {
  const childArray = Array.isArray(children) ? children : [children]

  let calloutChildIndex = -1
  let calloutType = ''
  let calloutTitle = ''

  for (let i = 0; i < childArray.length; i++) {
    const text = extractText(childArray[i])
    const match = text.match(/^\[!(\w+)(?:\|[^\]]*)?\]\s*([^\n]*)/)

    if (match) {
      calloutChildIndex = i
      calloutType = match[1]
      let rawTitle = match[2].trim()
      rawTitle = rawTitle.replace(/\[\[([^\]|]+\.pdf[^\]|]*)\|([^\]]+)\]\]/g, (_m, _path, display) => display.trim())
      calloutTitle = rawTitle || match[1].charAt(0).toUpperCase() + match[1].slice(1)
      break
    }
  }

  if (calloutChildIndex >= 0) {
    const calloutChild = childArray[calloutChildIndex]
    let modifiedChild = calloutChild
    if (
      calloutChild &&
      typeof calloutChild === 'object' &&
      'props' in calloutChild &&
      calloutChild.props &&
      'children' in calloutChild.props
    ) {
      const childProps = calloutChild.props as { children?: React.ReactNode }
      const grandChildren = Array.isArray(childProps.children)
        ? childProps.children
        : [childProps.children]

      const filteredGrandChildren = grandChildren.filter((gc, idx) => {
        if (idx === 0 && typeof gc === 'string' && gc.match(/^\[!\w+(?:\|[^\]]*)?\]/)) {
          return false
        }
        return true
      })

      modifiedChild = {
        ...calloutChild,
        props: {
          ...childProps,
          children: filteredGrandChildren
        }
      }
    }

    const remainingChildren = childArray.slice(calloutChildIndex + 1)

    return (
      <Callout type={calloutType} title={calloutTitle}>
        {modifiedChild}
        {remainingChildren.length > 0 ? remainingChildren : null}
      </Callout>
    )
  }

  return (
    <blockquote className="border-l-[3px] border-Amber pl-6 my-6 italic text-Slate bg-Amber/[0.05] py-4 pr-4 rounded-r-lg">
      {children}
    </blockquote>
  )
}
