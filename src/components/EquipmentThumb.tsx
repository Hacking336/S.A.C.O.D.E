import { Monitor, Projector, Printer, Fan, AirVent, Mic, Microscope, Armchair, Box, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, { icon: LucideIcon; from: string; to: string }> = {
  Computer: { icon: Monitor, from: 'from-blue-100', to: 'to-blue-50' },
  Projector: { icon: Projector, from: 'from-violet-100', to: 'to-violet-50' },
  Printer: { icon: Printer, from: 'from-amber-100', to: 'to-amber-50' },
  'Electric Fan': { icon: Fan, from: 'from-emerald-100', to: 'to-emerald-50' },
  'Air Conditioner': { icon: AirVent, from: 'from-cyan-100', to: 'to-cyan-50' },
  'Audio Equipment': { icon: Mic, from: 'from-rose-100', to: 'to-rose-50' },
  'Science Equipment': { icon: Microscope, from: 'from-teal-100', to: 'to-teal-50' },
  Furniture: { icon: Armchair, from: 'from-slate-100', to: 'to-slate-50' },
  Others: { icon: Box, from: 'from-slate-100', to: 'to-slate-50' },
}

/**
 * Fallback thumbnail tile for damage photos.
 * Swap the tile for an <img> once the report photos are stored in Supabase Storage.
 */
export function EquipmentThumb({ category, className = '' }: { category: string; className?: string }) {
  const config = ICONS[category] ?? ICONS.Others
  const Icon = config.icon

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-lg bg-gradient-to-br ${config.from} ${config.to} text-slate-500 ${className}`}
    >
      <Icon className="h-6 w-6" strokeWidth={1.7} />
    </span>
  )
}
