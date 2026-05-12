import { supabase } from '@/lib/supabase'

const BUCKET_NAME = 'avatars'

/**
 * 上传头像到 Supabase Storage
 * @param file 图片文件
 * @param userId 用户 ID（作为文件路径的一部分）
 * @returns 公开访问的 URL
 */
export async function uploadAvatar(file: File, userId: string): Promise<string> {
  // 生成唯一文件名
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
        'Storage bucket "avatars" 不存在或未配置。请在 Supabase Dashboard → Storage 中创建一个名为 "avatars" 的公开 bucket，并允许匿名上传。'
      )
    }
    throw new Error(`上传失败: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

/**
 * 删除旧头像（可选，清理空间）
 */
export async function deleteAvatar(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([path])
  if (error) {
    console.warn('删除旧头像失败:', error.message)
  }
}
