import { supabase, isSupabaseReady } from '@/lib/supabase'

export interface Memoir {
  id: string
  title: string
  date: string
  content: string
  brightness: number // 0.1 ~ 1.0，越激动越亮
  image?: string // deprecated，向后兼容
  images?: string[]
  x?: number // 0 ~ 100，屏幕宽度百分比
  y?: number // 0 ~ 100，屏幕高度百分比
}

const STORAGE_KEY = 'starry-memoirs-v1'
const DB_NAME = 'starry-db'
const STORE_NAME = 'memoirs'
const DB_KEY = 'data'
const SUPABASE_TABLE = 'starry_memoirs'

export const DEFAULT_MEMOIRS: Memoir[] = [
  {
    id: '1',
    title: '第一次看见极光',
    date: '2023-11-15',
    content:
      '那是凌晨三点，整个天空突然活了过来。绿色的光带从地平线升起，像一匹绸缎被无形的手抖开。我站在零下二十度的雪地里，呼吸凝结成白雾，却感觉不到冷。光在跳舞，很慢，很慢，仿佛时间也被冻住了。我想喊旁边的人看，转头却发现自己的声音被吞没在辽阔的寂静里。那一刻我明白了，有些震撼是无法分享的，你只能独自吞咽，然后带着它走完余生。',
    brightness: 0.95,
  },
  {
    id: '2',
    title: '海边的告别',
    date: '2023-08-20',
    content:
      '潮水退去的瞬间，我们谁也没有说话。脚下的沙子被海水带走，留下一个浅浅的坑，很快被新的沙子填满，仿佛从未存在过。你捡起一枚贝壳递给我，说里面藏着大海的声音。我把耳朵贴上去，听见的是自己的心跳。后来那枚贝壳被我放在书桌上，风吹过时它会发出细微的响声，像一只小动物在夜里磨牙。',
    brightness: 0.7,
  },
  {
    id: '3',
    title: '深夜的便利店',
    date: '2024-02-14',
    content:
      '凌晨四点的关东煮，是城市最后的温暖。收银员趴在柜台上打盹，关东煮的机器咕嘟咕嘟地响着。我买了一个饭团和一瓶热咖啡，坐在窗边的位置上。外面下着雨，路灯把雨丝照得像银线一样。一个穿西装的男人走进来，买了一包烟，站在屋檐下抽。他没有打伞，任由雨水打湿肩膀。我想他大概也是无处可去的人。',
    brightness: 0.5,
  },
  {
    id: '4',
    title: '暴雨中的奔跑',
    date: '2024-06-01',
    content:
      '雨水混着泪水，我终于笑了出来。那是一场毫无预兆的暴雨，我们本来在公园里散步，天突然塌了下来。你拉起我的手就开始跑，我们穿过积水的街道，跳过翻起的井盖，像两个逃学的少年。我的白裙子全湿透了，头发贴在脸上，狼狈不堪。可你却边跑边笑，笑声大得盖过了雷声。那一刻，我突然觉得，人生中所有的不如意，都是为了换这一个瞬间。',
    brightness: 0.92,
  },
  {
    id: '5',
    title: '旧书店的老猫',
    date: '2023-12-25',
    content:
      '它趴在泛黄的书页上，仿佛守着整个世纪的秘密。那是一本一九八三年的《天体物理学导论》，书页脆得像秋天的落叶。老猫的眼睛是琥珀色的，盯着每一个进店的客人，但从不挪动身体。店主说它已经十七岁了，相当于人类的九十岁。我想，它大概已经看透了所有的故事，所以不再对任何情节感到惊讶。',
    brightness: 0.35,
  },
  {
    id: '6',
    title: '末班地铁',
    date: '2024-01-30',
    content:
      '车厢里只剩下我和一个弹吉他的陌生人。他坐在角落，琴弦上缠着胶带，弹一首我听不出名字的歌。我假装在看手机，其实一直在听。他在某站停下，把吉他背好，朝我点了点头，然后消失在站台的黑暗中。那首歌的旋律我至今记得，但从来没有找到过原曲。也许它根本没有名字，只是那个夜晚即兴诞生的幽灵。',
    brightness: 0.6,
  },
  {
    id: '7',
    title: '山顶的日出',
    date: '2024-05-01',
    content:
      '当第一缕光刺破云层，我知道有些东西再也回不去了。我们爬了六个小时，在寒风中瑟瑟发抖，只是为了这一个瞬间。太阳升起的时候，你握住了我的手，握得很紧。我没有看你，但我能感觉到你在哭。后来我们下山，各自走向不同的车站，没有说再见。那是一场精心策划的告别，只是我们都假装它只是一次普通的旅行。',
    brightness: 0.88,
  },
  {
    id: '8',
    title: '雨后的梧桐',
    date: '2023-09-10',
    content:
      '叶子上的水珠折射出整个秋天的孤独。那是一条我很熟悉的路，但那天走起来却格外漫长。梧桐叶落了一地，被雨水泡得发软，踩上去没有声音。我想起小时候，这样的天气里，外婆会煮一锅红糖姜茶。现在我站在异乡的街道上，手里握着一杯冰冷的咖啡。有些温暖，一旦失去了，就再也找不回来。',
    brightness: 0.28,
  },
  {
    id: '9',
    title: '机场的红眼航班',
    date: '2024-03-22',
    content:
      '舷窗外的城市像一块被揉碎的电路板。飞机在跑道上加速，我的身体被压向椅背，心跳也随之加快。我喜欢起飞的那个瞬间，因为那是为数不多的、你可以合法逃离的时刻。空姐走过来问我要不要毛毯，我说不用。我其实很冷，但我不想被任何东西包裹。那一刻我只想漂浮在万米高空，不属于任何地方。',
    brightness: 0.45,
  },
  {
    id: '10',
    title: '跨年烟火的背面',
    date: '2023-12-31',
    content:
      '我在人群之外，看见了烟火最寂寞的样子。所有人都面向河对岸，举着手机，倒数。我却转过身，看着烟火在他们头顶炸开，照亮了千百张仰起的脸。那些脸在光芒中一闪而逝，像水面上的倒影。我突然觉得，比起看烟火，看那些看烟火的人更有意思。他们相信这一个瞬间值得纪念，而我已经不再相信任何事情了。',
    brightness: 0.55,
  },
  {
    id: '11',
    title: '停电的夜晚',
    date: '2024-07-15',
    content:
      '整栋楼陷入黑暗，我们点起了蜡烛。那是夏天最热的一天，空调停了，窗户全开，却没有一丝风。邻居们陆续走到阳台上，有人开始弹吉他，有人唱起了老歌。我不记得歌词，但记得那个旋律。烛光在每个人的脸上跳动，像一场私密的仪式。来电的时候，所有人同时发出一声叹息，然后各自退回房间。黑暗中的亲密，总是比光明中更真实。',
    brightness: 0.78,
  },
  {
    id: '12',
    title: '雪夜的加油站',
    date: '2024-01-08',
    content:
      '加油机的数字在跳，我哈着白气等它结束。雪下得很大，路灯下能看见每一朵雪花的形状。加油站的工作人员是个老头，戴着雷锋帽，在玻璃房里打瞌睡。我加完油，敲响窗户，他惊醒过来，一脸茫然。我说谢谢，他说慢走。车重新启动时，我回头看了一眼，他又趴下了，头埋在臂弯里。那一刻我觉得，孤独是有形状的，它就在那个玻璃房里，缩成小小的一团。',
    brightness: 0.42,
  },
]

function migrateMemoir(m: Memoir): Memoir {
  if (m.image && !m.images) {
    return { ...m, images: [m.image] }
  }
  return m
}

/* ─── IndexedDB helpers ─── */

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

// 尝试从 localStorage 读取旧数据并迁移到 IndexedDB（一次性）
async function migrateFromLocalStorage(): Promise<Memoir[] | null> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as Memoir[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        // 迁移到 IndexedDB 后删除 localStorage
        const migrated = parsed.map(migrateMemoir)
        const db = await openDB()
        const tx = db.transaction(STORE_NAME, 'readwrite')
        tx.objectStore(STORE_NAME).put(JSON.stringify(migrated), DB_KEY)
        localStorage.removeItem(STORAGE_KEY)
        return migrated
      }
    }
  } catch {
    // ignore
  }
  return null
}

async function loadFromIndexedDB(): Promise<Memoir[] | null> {
  const migrated = await migrateFromLocalStorage()
  if (migrated) return migrated

  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const req = tx.objectStore(STORE_NAME).get(DB_KEY)
      req.onsuccess = () => {
        const data = req.result
        if (data) {
          try {
            const parsed = JSON.parse(data) as Memoir[]
            if (Array.isArray(parsed) && parsed.length > 0) {
              resolve(parsed.map(migrateMemoir))
              return
            }
          } catch {}
        }
        resolve(null)
      }
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function saveToIndexedDB(memoirs: Memoir[]): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).put(JSON.stringify(memoirs), DB_KEY)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

async function clearIndexedDB(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const req = tx.objectStore(STORE_NAME).delete(DB_KEY)
    req.onsuccess = () => resolve()
    req.onerror = () => reject(req.error)
  })
}

/* ─── Supabase helpers ─── */

function dbToMemoir(row: Record<string, unknown>): Memoir {
  return migrateMemoir({
    id: String(row.id),
    title: String(row.title ?? ''),
    date: String(row.date ?? ''),
    content: String(row.content ?? ''),
    brightness: Number(row.brightness ?? 0.5),
    images: Array.isArray(row.images) ? (row.images as string[]) : undefined,
    x: row.x !== null && row.x !== undefined ? Number(row.x) : undefined,
    y: row.y !== null && row.y !== undefined ? Number(row.y) : undefined,
  })
}

function memoirToDb(m: Memoir): Record<string, unknown> {
  return {
    id: m.id,
    title: m.title,
    date: m.date,
    content: m.content,
    brightness: m.brightness,
    images: m.images ?? [],
    x: m.x ?? null,
    y: m.y ?? null,
    updated_at: new Date().toISOString(),
  }
}

async function fetchFromSupabase(): Promise<Memoir[] | null> {
  if (!isSupabaseReady()) return null

  try {
    const { data, error } = await supabase!.from(SUPABASE_TABLE).select('*')
    if (error || !data || !Array.isArray(data)) return null
    if (data.length === 0) return []
    return (data as Record<string, unknown>[]).map(dbToMemoir)
  } catch {
    return null
  }
}

async function upsertToSupabase(memoirs: Memoir[]): Promise<boolean> {
  if (!isSupabaseReady()) return false

  try {
    const { error } = await supabase!
      .from(SUPABASE_TABLE)
      .upsert(memoirs.map(memoirToDb))
    return !error
  } catch {
    return false
  }
}

async function deleteAllFromSupabase(): Promise<boolean> {
  if (!isSupabaseReady()) return false

  try {
    const { error } = await supabase!.from(SUPABASE_TABLE).delete().neq('id', '')
    return !error
  } catch {
    return false
  }
}

/* ─── Public API ─── */

/**
 * 读取记忆列表。
 * 云端优先：如果 Supabase 可用且有数据，用云端数据覆盖本地缓存；
 * 否则回退到 IndexedDB / 默认值。
 */
export async function getMemoirs(): Promise<Memoir[]> {
  const remote = await fetchFromSupabase()

  if (remote !== null) {
    // 云端可用：云端数据作为权威来源
    if (remote.length > 0) {
      await saveToIndexedDB(remote)
      return remote
    }
    // 云端为空：回退本地，方便用户后续手动上传
    const local = await loadFromIndexedDB()
    if (local && local.length > 0) {
      return local
    }
    // 本地也为空：返回默认值
    const defaults = DEFAULT_MEMOIRS
    await saveToIndexedDB(defaults)
    return defaults
  }

  // Supabase 不可用：完全回退本地
  const local = await loadFromIndexedDB()
  if (local && local.length > 0) return local
  return DEFAULT_MEMOIRS
}

/**
 * 保存记忆列表。
 * 先写本地 IndexedDB，再后台同步到 Supabase（不阻塞 UI）。
 */
export async function saveMemoirs(memoirs: Memoir[]): Promise<void> {
  await saveToIndexedDB(memoirs)
  // 后台静默同步到云端
  upsertToSupabase(memoirs).catch(() => {})
}

/**
 * 重置记忆：清空本地和云端，下次读取时回到 DEFAULT_MEMOIRS。
 */
export async function resetMemoirs(): Promise<void> {
  await clearIndexedDB()
  await deleteAllFromSupabase()
}

/**
 * 手动把当前本地数据推送到云端。
 * 用于用户想把 Chrome 里编辑好的内容上传到 Supabase。
 */
export async function syncMemoirsToCloud(): Promise<boolean> {
  if (!isSupabaseReady()) return false

  const local = await loadFromIndexedDB()
  const toUpload = local && local.length > 0 ? local : DEFAULT_MEMOIRS
  const ok = await upsertToSupabase(toUpload)
  return ok
}

/* ─── Position helpers ─── */

// 为每颗 memoir 生成固定的随机坐标，避免每次渲染位置变化
const seededRandom = (seed: number) => {
  const x = Math.sin(seed * 127.1) * 43758.5453
  return x - Math.floor(x)
}

export const getStarPosition = (id: string, width: number, height: number) => {
  const seed = parseInt(id, 10)
  const margin = 80
  const x = margin + seededRandom(seed * 1.1) * (width - margin * 2)
  const y = margin + seededRandom(seed * 2.3) * (height - margin * 2)
  return { x, y }
}
