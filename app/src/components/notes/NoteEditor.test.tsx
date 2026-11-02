import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import NoteEditor from './NoteEditor'
import { PreferencesProvider } from '@/contexts/PreferencesContext'

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <PreferencesProvider>
      <button onClick={() => setOpen(true)}>打开编辑器</button>
      {open && <NoteEditor onCancel={() => setOpen(false)} onSave={vi.fn().mockResolvedValue(true)} />}
    </PreferencesProvider>
  )
}

function openEditor() {
  render(<Harness />)
  const trigger = screen.getByRole('button', { name: '打开编辑器' })
  trigger.focus()
  fireEvent.click(trigger)
  return trigger
}

it('focuses the filename and traps Tab inside the dialog', () => {
  openEditor()
  const input = screen.getByLabelText('文件名')
  const close = screen.getByRole('button', { name: '关闭编辑器' })
  const save = screen.getByRole('button', { name: '保存笔记' })

  expect(document.activeElement).toBe(input)
  save.focus()
  fireEvent.keyDown(document, { key: 'Tab' })
  expect(document.activeElement).toBe(close)
  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
  expect(document.activeElement).toBe(save)
})

it('closes on Escape and restores focus to the opening control', () => {
  const trigger = openEditor()
  fireEvent.keyDown(document, { key: 'Escape' })

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(document.activeElement).toBe(trigger)
})
