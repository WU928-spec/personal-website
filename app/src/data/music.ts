export interface Track {
  id: string
  title: string
  artist: string
  data: string // base64 data URL
}

const DB_NAME = 'music-db'
const STORE_NAME = 'tracks'
const DB_KEY = 'list'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
  })
}

export async function getTracks(): Promise<Track[]> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(DB_KEY)
      req.onsuccess = () => {
        const data = req.result
        if (data) {
          try {
            const parsed = JSON.parse(data) as Track[]
            if (Array.isArray(parsed)) {
              resolve(parsed)
              return
            }
          } catch {}
        }
        resolve([])
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return []
  }
}

export async function saveTracks(tracks: Track[]): Promise<void> {
  const db = await openDB()
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(JSON.stringify(tracks), DB_KEY)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

export async function addTrack(track: Track): Promise<void> {
  const tracks = await getTracks()
  await saveTracks([...tracks, track])
}

export async function removeTrack(id: string): Promise<void> {
  const tracks = await getTracks()
  await saveTracks(tracks.filter(t => t.id !== id))
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
