import { fetchNotes, renameNote } from './noteClient'

const { from } = vi.hoisted(() => ({ from: vi.fn() }))
vi.mock('@/lib/supabase', () => ({ supabase: { from }, isSupabaseReady: () => true }))

const select = vi.fn()
const maybeSingle = vi.fn()
const insert = vi.fn()
const deleteEq = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  select.mockReturnValue({ eq: vi.fn(() => ({ maybeSingle })) })
  from.mockReturnValue({ select, insert, delete: vi.fn(() => ({ eq: deleteEq })) })
})

it('returns an empty list instead of rejecting when the note request fails', async () => {
  from.mockImplementation(() => { throw new Error('offline') })
  await expect(fetchNotes()).resolves.toEqual([])
})

it('refuses to overwrite an existing target without deleting the source', async () => {
  maybeSingle.mockResolvedValueOnce({ data: { path: 'new.md' } })
  await expect(renameNote('old.md', 'new.md', 'new content')).resolves.toBe(false)
  expect(insert).not.toHaveBeenCalled()
  expect(deleteEq).not.toHaveBeenCalled()
})

it('keeps the source when inserting the renamed note fails', async () => {
  maybeSingle.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { content: 'old', created_at: '2025-01-01' } })
  insert.mockResolvedValue({ error: new Error('insert failed') })
  await expect(renameNote('old.md', 'new.md', 'new content')).resolves.toBe(false)
  expect(deleteEq).not.toHaveBeenCalled()
})

it('writes the complete edited content and original creation date before deleting the source', async () => {
  maybeSingle.mockResolvedValueOnce({ data: null }).mockResolvedValueOnce({ data: { content: 'old', created_at: '2025-01-01' } })
  insert.mockResolvedValue({ error: null })
  deleteEq.mockResolvedValue({ error: null })

  await expect(renameNote('old.md', 'new.md', 'new content')).resolves.toBe(true)
  expect(insert).toHaveBeenCalledWith(expect.objectContaining({
    path: 'new.md', content: 'new content', created_at: '2025-01-01',
  }))
  expect(deleteEq).toHaveBeenCalledWith('path', 'old.md')
})
