import { useState } from 'react'
import { CloudUpload, RotateCcw, Send } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import {
  buildingOptions,
  categoryOptions,
  damageTypeOptions,
  equipmentOptions,
} from '../data/mock'

type PriorityChoice = 'Critical' | 'High' | 'Medium' | 'Low'

const PRIORITY_OPTIONS: { value: PriorityChoice; dot: string; label: string; sub: string }[] = [
  { value: 'Critical', dot: 'bg-red-500', label: 'Critical', sub: 'Needs immediate attention' },
  { value: 'High', dot: 'bg-orange-500', label: 'High', sub: 'Should be fixed soon' },
  { value: 'Medium', dot: 'bg-yellow-400', label: 'Medium', sub: 'Can be scheduled later' },
  { value: 'Low', dot: 'bg-green-500', label: 'Low', sub: 'Minor issue' },
]

const SELECTED_RING: Record<PriorityChoice, string> = {
  Critical: 'border-red-500 ring-2 ring-red-100 bg-red-50/40',
  High: 'border-orange-500 ring-2 ring-orange-100 bg-orange-50/40',
  Medium: 'border-yellow-400 ring-2 ring-yellow-100 bg-yellow-50/40',
  Low: 'border-green-500 ring-2 ring-green-100 bg-green-50/40',
}

const EMPTY_FORM = {
  equipmentName: '',
  category: '',
  brandModel: '',
  serialNumber: '',
  building: '',
  room: '',
  damageType: '',
  description: '',
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5 flex items-center gap-2.5">
      <span className="h-4 w-1 rounded-full bg-blue-600" />
      <h2 className="text-[15.5px] font-bold text-slate-900">{children}</h2>
    </div>
  )
}

export default function ReportDamage() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [priority, setPriority] = useState<PriorityChoice>('Critical')
  const [fileName, setFileName] = useState<string | null>(null)

  const update = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleReset = () => {
    setForm(EMPTY_FORM)
    setPriority('Critical')
    setFileName(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock submit — the Spring Boot endpoint is wired up in Step 4.
    alert('Report submitted! (mock)')
    handleReset()
  }

  return (
    <>
      <PageHeader
        title="Report Damaged Equipment"
        subtitle="Fill in the details of the damaged equipment."
        backTo="/dashboard"
        variant="student"
      />

      <form onSubmit={handleSubmit} className="card p-7">
        {/* ----------------------- Equipment information ---------------------- */}
        <SectionTitle>Equipment Information</SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="equipmentName">
              Equipment Name <span className="text-red-500">*</span>
            </label>
            <select
              id="equipmentName"
              className="field-input appearance-none"
              value={form.equipmentName}
              onChange={update('equipmentName')}
            >
              <option value="">e.g. Computer, Projector</option>
              {equipmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="category">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              className="field-input appearance-none"
              value={form.category}
              onChange={update('category')}
            >
              <option value="">Select category</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="brandModel">
              Brand / Model
            </label>
            <input
              id="brandModel"
              type="text"
              placeholder="e.g. Acer / X123"
              className="field-input"
              value={form.brandModel}
              onChange={update('brandModel')}
            />
          </div>

          <div>
            <label className="field-label" htmlFor="serialNumber">
              Serial Number (optional)
            </label>
            <input
              id="serialNumber"
              type="text"
              placeholder="Enter serial number"
              className="field-input"
              value={form.serialNumber}
              onChange={update('serialNumber')}
            />
          </div>
        </div>

        <div className="my-7 h-px bg-slate-200" />

        {/* ------------------------------ Location ---------------------------- */}
        <SectionTitle>Location</SectionTitle>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="building">
              Building / Area <span className="text-red-500">*</span>
            </label>
            <select
              id="building"
              className="field-input appearance-none"
              value={form.building}
              onChange={update('building')}
            >
              <option value="">Select building / area</option>
              {buildingOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="field-label" htmlFor="room">
              Room / Office <span className="text-red-500">*</span>
            </label>
            <input
              id="room"
              type="text"
              placeholder="e.g. Room 204"
              className="field-input"
              value={form.room}
              onChange={update('room')}
            />
          </div>
        </div>

        <div className="my-7 h-px bg-slate-200" />

        {/* --------------------------- Damage details ------------------------- */}
        <SectionTitle>Damage Details</SectionTitle>

        <div className="max-w-xl">
          <label className="field-label" htmlFor="damageType">
            Type of Damage <span className="text-red-500">*</span>
          </label>
          <select
            id="damageType"
            className="field-input appearance-none"
            value={form.damageType}
            onChange={update('damageType')}
          >
            <option value="">Select type of damage</option>
            {damageTypeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Priority selector */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {PRIORITY_OPTIONS.map((option) => {
            const selected = priority === option.value
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPriority(option.value)}
                aria-pressed={selected}
                className={`rounded-xl border-2 px-4 py-3.5 text-left transition ${
                  selected
                    ? SELECTED_RING[option.value]
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`h-3 w-3 rounded-full ${option.dot}`} />
                  <span className="text-[14px] font-bold text-slate-900">{option.label}</span>
                </span>
                <span className="mt-1 block text-[12px] text-slate-500">{option.sub}</span>
              </button>
            )
          })}
        </div>

        {/* Description */}
        <div className="mt-6 max-w-3xl">
          <label className="field-label" htmlFor="description">
            Description of Damage <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <textarea
              id="description"
              rows={5}
              maxLength={500}
              placeholder="Please describe the issue or defect in detail..."
              className="field-input resize-y pr-16 pb-7"
              value={form.description}
              onChange={update('description')}
            />
            <span className="pointer-events-none absolute bottom-2.5 right-3.5 text-[11.5px] tabular-nums text-slate-400">
              {form.description.length}/500
            </span>
          </div>
        </div>

        {/* Photo upload */}
        <div className="mt-6 max-w-3xl">
          <label className="field-label">
            Upload Photo (Required)
          </label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 px-6 py-9 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
            <CloudUpload className="h-9 w-9 text-blue-500" strokeWidth={1.6} />
            <span className="text-[13.5px] font-medium text-slate-700">
              {fileName ?? 'Drag and drop an image here or click to browse'}
            </span>
            <span className="text-[12px] text-slate-400">JPG, PNG up to 5MB</span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>
        </div>

        {/* ------------------------------- Actions ---------------------------- */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-200 pt-6">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition hover:bg-blue-700"
          >
            <Send className="h-4 w-4" />
            Submit Report
          </button>
        </div>
      </form>
    </>
  )
}
