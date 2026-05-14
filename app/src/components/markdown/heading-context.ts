import { createContext } from 'react'

export interface HeadingCollapseContextType {
  collapsedHeadings: Set<string>
  toggleHeading: (id: string) => void
}

export const HeadingCollapseContext = createContext<HeadingCollapseContextType>({
  collapsedHeadings: new Set(),
  toggleHeading: () => {},
})
