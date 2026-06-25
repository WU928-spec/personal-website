import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'moment-images'

/**
 * 上传动态图片到 Supabase Storage
 * @param file 图片文件
 * @param userId 用户 ID（作为路径前缀）
 * @returns 公开访问的 URL
 */
export async function uploadMomentImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/${Date.now()}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type,
    })

  if (error) {
    if (error.message?.includes('bucket') || error.message?.includes('Bucket')) {
      throw new Error(
        `Storage bucket "${BUCKET_NAME}" 不存在。请在 Supabase Dashboard → Storage 中创建名为 "${BUCKET_NAME}" 的公开 bucket，并允许匿名上传。`
      )
    }
    throw new Error(`图片上传失败: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * 将 base64 data URL 转换为 File 对象以便上传
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  return new File([u8arr], filename, { type: mime })
}

/**
 * 判断图片 URL 是否为本地 base64 data URL
 */
export function isBase64Image(url: string): boolean {
  return url.startsWith('data:image/')
}

/**
 * 批量上传 base64 图片并替换为 Storage URL
 * @param images 可能包含 base64 的 URL 数组
 * @param userId 用户 ID
 * @returns 替换后的 URL 数组
 */
export async function migrateImagesToStorage(images: string[], userId: string): Promise<string[]> {
  const results: string[] = []
  for (const img of images) {
    if (isBase64Image(img)) {
      try {
        const file = dataUrlToFile(img, `image-${Date.now()}.png`)
        const url = await uploadMomentImage(file, userId)
        results.push(url)
      } catch {
        // 上传失败时保留原 base64（至少当前设备能看）
        results.push(img)
      }
    } else {
      results.push(img)
    }
  }
  return results
}
