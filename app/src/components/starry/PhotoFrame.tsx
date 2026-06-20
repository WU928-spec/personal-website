import { useState } from 'react'

interface PhotoFrameProps {
  src: string
  alt: string
  rotation?: number
}

function checkImageCached(src: string): boolean {
  const img = new Image()
  img.src = src
  return img.complete
}

export default function PhotoFrame({ src, alt, rotation = -2.5 }: PhotoFrameProps) {
  const [loaded, setLoaded] = useState(() => checkImageCached(src))

  return (
    <div className="photo-frame-wrapper flex-shrink-0 mx-auto md:mx-0">
      <div className="photo-frame" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="photo-mat">
          <img
            src={src}
            alt={alt}
            className={`photo-image transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
          />
        </div>
      </div>
      <div className="pin-shadow" />
      <div className="pin">
        <div className="pin-head" />
      </div>
    </div>
  )
}
