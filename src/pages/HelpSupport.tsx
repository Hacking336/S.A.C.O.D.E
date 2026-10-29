import { useState } from 'react'
import { CheckCircle2, Clock, Mail, MapPin, Phone, Send } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

const CONTACTS = [
  { icon: Mail, label: 'Email', value: 'support@sacode.edu', hint: 'Replies within one working day' },
  { icon: Phone, label: 'Phone', value: '123-456-7890', hint: 'Mon–Fri, 8:00 AM – 5:00 PM' },
  { icon: MapPin, label: 'Office', value: 'IT Dept Room 204', hint: 'Building A, 2nd Floor' },
]

const TOPICS = ['Report issue', 'Account access', 'Technical problem', 'Other']

export default function HelpSupport() {
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [description, setDescription] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock only — POST /api/tickets is wired up with the Spring Boot backend.
    setSent(true)
    setSubject('')
    setDescription('')
    setTopic(TOPICS[0])
  }

  return (
    <>
      <PageHeader
        title="Help & Support"
        subtitle="Get assistance with Campus Care"
        variant="instructor"
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* -------------------------- Contact card -------------------------- */}
        <section className="card p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-4 w-1 rounded-full bg-blue-600" />
            <h2 className="text-[15.5px] font-bold text-slate-900">Contact Information</h2>
          </div>

          <p className="text-[13.5px] leading-relaxed text-slate-500">
            Reach the Campus Care support team directly. For urgent safety hazards — exposed
            wiring, leaking air-conditioners or sparking outlets — call the IT office instead of
            filing a ticket.
          </p>

          <div className="mt-5 space-y-3">
            {CONTACTS.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  className="flex items-start gap-3.5 rounded-lg border border-slate-200 bg-slate-50/60 p-3.5"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[11.5px] font-semibold uppercase tracking-wide text-slate-400">
                      {item.label}
                    </p>
                    <p className="text-[13.5px] font-semibold text-slate-800">{item.value}</p>
                    <p className="text-[12px] text-slate-400">{item.hint}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg bg-blue-50 p-4">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" strokeWidth={2} />
            <p className="text-[12.5px] leading-relaxed text-blue-900/80">
              Support desk is open Monday to Friday, 8:00 AM to 5:00 PM. Tickets filed after hours
              are queued for the next working day.
            </p>
          </div>
        </section>

        {/* -------------------------- Ticket form --------------------------- */}
        <section className="card p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-4 w-1 rounded-full bg-blue-600" />
            <h2 className="text-[15.5px] font-bold text-slate-900">Submit a Ticket</h2>
          </div>

          {sent && (
            <div className="mb-5 flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-3.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" strokeWidth={2} />
              <p className="text-[12.5px] leading-relaxed text-green-800">
                Ticket submitted (mock). In the live system the support team receives it immediately
                and replies to your Mabini email.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="field-label" htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                className="field-input"
                placeholder="e.g. Cannot upload a photo to my report"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="topic">
                Topic
              </label>
              <select
                id="topic"
                className="field-input"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {TOPICS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="field-label" htmlFor="description">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                rows={7}
                className="field-input resize-y"
                placeholder="Describe what happened, which report or equipment is involved, and any error message you saw."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-[14px] font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              <Send className="h-4 w-4" strokeWidth={2} />
              Submit Ticket
            </button>
          </form>
        </section>
      </div>
    </>
  )
}
