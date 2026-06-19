/**
 * 模块级图片缓存。
 * 预加载的图片会保留 HTMLImageElement 引用，浏览器会尽量保持其解码后的位图在内存中，
 * 后续页面（如信件页）可直接取用并同步绘制到 Canvas 或渲染，避免黑屏/闪烁。
 */
const imageCache = new Map<string, HTMLImageElement>()

export function cacheImage(url: string, img: HTMLImageElement) {
  imageCache.set(url, img)
}

export function getCachedImage(url: string): HTMLImageElement | undefined {
  return imageCache.get(url)
}

export function loadAndCacheImage(url: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(url)
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached)
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const finish = () => {
      img.onload = null
      img.onerror = null
    }

    img.onload = () => {
      if ('decode' in img && typeof img.decode === 'function') {
        img
          .decode()
          .then(() => {
            imageCache.set(url, img)
            finish()
            resolve(img)
          })
          .catch((err) => {
            imageCache.set(url, img)
            finish()
            reject(err)
          })
      } else {
        imageCache.set(url, img)
        finish()
        resolve(img)
      }
    }

    img.onerror = () => {
      finish()
      reject(new Error(`Failed to load image: ${url}`))
    }

    img.src = url
  })
}
