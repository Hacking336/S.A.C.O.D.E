import { useEffect, useState } from 'react'

/**
 * Profile pictures without a backend yet.
 *
 * The chosen photo is downscaled to 256×256 and stored as a data URL in
 * localStorage, one slot per signed-in role, so it survives a reload and
 * shows up in the header, the profile card and anywhere else at once.
 */

export type AvatarVariant = 'instructor' | 'admin'

const key = (variant: AvatarVariant) => `campus-care:avatar:${variant}`
const CHANGE_EVENT = 'campus-care:avatar-changed'

export function readAvatar(variant: AvatarVariant): string | null {
  try {
    return localStorage.getItem(key(variant))
  } catch {
    return null
  }
}

export function storeAvatar(variant: AvatarVariant, dataUrl: string | null) {
  try {
    if (dataUrl) localStorage.setItem(key(variant), dataUrl)
    else localStorage.removeItem(key(variant))
  } catch {
    // Private mode or a full quota: the picture still shows for this session.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

/** Reads the stored picture and re-renders whenever it is replaced. */
export function useAvatar(variant: AvatarVariant): string | null {
  const [src, setSrc] = useState<string | null>(() => readAvatar(variant))

  useEffect(() => {
    const sync = () => setSrc(readAvatar(variant))
    sync()
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [variant])

  return src
}

type Bitmap = ImageBitmap | HTMLImageElement

async function loadImage(file: File): Promise<Bitmap> {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('That file could not be read as an image.'))
    }
    img.src = url
  })
}

/**
 * Validates the pick, centre-crops it to a square and shrinks it, so a 6 MB
 * phone photo never blows the ~5 MB localStorage budget.
 */
export async function fileToAvatar(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG or PNG).')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('That image is larger than 8 MB. Please choose a smaller one.')
  }

  const image = await loadImage(file)
  const width = image.width
  const height = image.height
  const side = Math.min(width, height)
  const size = 256

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Your browser could not process that image.')
  }

  ctx.drawImage(image, (width - side) / 2, (height - side) / 2, side, side, 0, 0, size, size)
  if ('close' in image) image.close()

  return canvas.toDataURL('image/jpeg', 0.88)
}

export function UserAvatar({
  variant,
  initials,
  className = 'h-8 w-8 text-[12px]',
  tone = 'bg-blue-600',
}: {
  variant: AvatarVariant
  initials: string
  className?: string
  tone?: string
}) {
  const src = useAvatar(variant)

  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-bold text-white ${tone} ${className}`}
    >
      {src ? (
        <img src={src} alt="Profile picture" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
    </span>
  )
}
