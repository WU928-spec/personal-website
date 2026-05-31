interface PhotoFrameProps {
  src: string
  alt: string
  rotation?: number
}

export default function PhotoFrame({ src, alt, rotation = -2.5 }: PhotoFrameProps) {
  return (
    <div className="photo-frame-wrapper flex-shrink-0 mx-auto md:mx-0">
      <div className="photo-frame" style={{ transform: `rotate(${rotation}deg)` }}>
        <div className="photo-mat">
          <img src={src} alt={alt} className="photo-image" loading="lazy" />
        </div>
      </div>
      <div className="pin-shadow" />
      <div className="pin">
        <div className="pin-head" />
      </div>
    </div>
  )
}
