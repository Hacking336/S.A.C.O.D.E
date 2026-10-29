import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { MonitorOff, XCircle, Pencil } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { PriorityBadge } from '../components/Badges'
import { EquipmentThumb } from '../components/EquipmentThumb'
import { reportHistory, reports } from '../data/mock'

function Photo({
  src,
  category,
  className = '',
}: {
  src?: string
  category: string
  className?: string
}) {
  const [failed, setFailed] = useState(false)

  if (src && !failed) {
    return (
      <img
        src={src}
        alt="Damage"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <span className={`grid h-full w-full place-items-center ${className}`}>
      <span className="grid place-items-center gap-2">
        <MonitorOff className="h-7 w-7 text-slate-400" strokeWidth={1.6} />
        <span className="text-[12px] text-slate-400">Damage photo</span>
      </span>
      <span className="sr-only">{category}</span>
    </span>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
      <dt className="text-[13px] font-medium text-slate-500">{label}</dt>
      <dd className="text-[14px] font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-4 w-1 rounded-full bg-blue-600" />
      <h2 className="text-[15.5px] font-bold text-slate-900">{children}</h2>
    </div>
  )
}

export default function ReportDetails() {
  const { id } = useParams()
  const report = reports.find((item) => item.id === id) ?? reports[0]
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = report.photos.length > 0 ? report.photos : [undefined]
  const activePhoto = photos[Math.min(photoIndex, photos.length - 1)]

  return (
    <>
      <PageHeader title="Report Details" backTo="/my-reports" variant="instructor" />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_1fr]">
        {/* -------------------------- Left column -------------------------- */}
        <div className="space-y-6">
          <section className="card p-6">
            <SectionTitle>Report Information</SectionTitle>
            <dl>
              <InfoRow label="Report ID" value={<span className="text-blue-600">{report.id}</span>} />
              <InfoRow label="Equipment" value={report.equipment} />
              <InfoRow label="Category" value={report.category} />
              <InfoRow label="Brand / Model" value={report.brandModel} />
              <InfoRow label="Serial Number" value={report.serialNumber} />
              <InfoRow
                label="Location"
                value={`${report.room}, ${report.building}`}
              />
              <InfoRow label="Reported By" value={`${report.reportedBy} (${report.role})`} />
              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[190px_1fr] sm:gap-4">
                <dt className="text-[13px] font-medium text-slate-500">Urgency Level</dt>
                <dd>
                  <PriorityBadge priority={report.priority} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <SectionTitle>Damage Photos</SectionTitle>

            <div className="grid h-[220px] w-full place-items-center overflow-hidden rounded-xl bg-slate-100 sm:h-[300px]">
              <Photo src={activePhoto} category={report.category} />
            </div>

            <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
              {photos.map((photo, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPhotoIndex(index)}
                  className={`h-[68px] w-[96px] overflow-hidden rounded-lg bg-slate-100 transition ${
                    index === photoIndex
                      ? 'ring-2 ring-blue-600 ring-offset-2'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View damage photo ${index + 1}`}
                >
                  <Photo src={photo} category={report.category} />
                </button>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <SectionTitle>Description of Damage</SectionTitle>
            <p className="text-[14.5px] leading-relaxed text-slate-600">{report.description}</p>
          </section>
        </div>

        {/* -------------------------- Right column ------------------------- */}
        <div className="space-y-6">
          <section className="card p-6">
            <SectionTitle>Report History</SectionTitle>

            <ol className="relative ml-2 border-l border-slate-200 pl-6">
              {reportHistory.map((entry, index) => (
                <li key={entry.id} className={index === reportHistory.length - 1 ? 'pb-0' : 'pb-7'}>
                  <span
                    className={`absolute -left-[7px] grid h-3.5 w-3.5 place-items-center rounded-full ring-4 ring-white ${
                      index === 0 ? 'bg-blue-600' : 'bg-slate-400'
                    }`}
                  />
                  <p className="text-[12.5px] font-medium text-slate-400">{entry.date}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-200 text-[9.5px] font-bold text-slate-600">
                      {entry.actor}
                    </span>
                    <p className="text-[13.5px] text-slate-700">{entry.action}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <div className="card p-6">
            <div className="flex items-center gap-3">
              <EquipmentThumb category={report.category} className="h-12 w-12" />
              <div className="min-w-0">
                <p className="truncate text-[14.5px] font-semibold text-slate-900">
                  {report.equipment}
                </p>
                <p className="truncate text-[12.5px] text-slate-500">{report.brandModel}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-[14px] font-semibold text-red-600 transition hover:bg-red-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel Report
              </button>
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition hover:bg-blue-700"
              >
                <Pencil className="h-4 w-4" />
                Edit Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
