type Props = {
  src: string
  className?: string
  alt?: string
}

export default function GifImage({ src, className, alt = '' }: Props) {
  return (
    <img
      src={src || undefined}
      className={className}
      alt={alt}
      loading="lazy"
      onError={(e) => { (e.target as HTMLImageElement).style.visibility = 'hidden' }}
    />
  )
}
