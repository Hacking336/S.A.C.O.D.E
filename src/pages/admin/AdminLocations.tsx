import { useState, type FormEvent } from 'react'
import { Building2, MapPin, Plus } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Modal } from '../../components/Modal'
import { campusLocations, type CampusLocation } from '../../data/adminMock'

const FLOORS = ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', '4th Floor']

const EMPTY_FORM = { building: '', floor: '1st Floor', room: '', department: '', equipmentCount: '' }

export default function AdminLocations() {
  const [rows, setRows] = useState<CampusLocation[]>(campusLocations)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const totalEquipment = rows.reduce((sum, row) => sum + row.equipmentCount, 0)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const nextNumber = rows.length + 1
    setRows((prev) => [
      {
        id: `LOC-${String(nextNumber).padStart(2, '0')}`,
        building: form.building.trim() || 'Unnamed Building',
        floor: form.floor,
        room: form.room.trim() || '—',
        department: form.department.trim() || 'Unassigned',
        equipmentCount: Number(form.equipmentCount) || 0,
      },
      ...prev,
    ])
    setForm(EMPTY_FORM)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Locations"
        subtitle="Buildings, floors, rooms and offices."
        variant="admin"
        extra={
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(37,99,235,0.28)] transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" strokeWidth={2.4} />
            Add New Location
          </button>
        }
      />

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card flex items-center gap-3.5 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-blue-100 text-blue-600">
            <Building2 className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <p className="text-[22px] font-bold leading-none text-slate-900">
              {new Set(rows.map((row) => row.building)).size}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-slate-600">Buildings</p>
          </div>
        </div>
        <div className="card flex items-center gap-3.5 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-violet-100 text-violet-600">
            <MapPin className="h-5 w-5" strokeWidth={1.9} />
          </span>
          <div>
            <p className="text-[22px] font-bold leading-none text-slate-900">{rows.length}</p>
            <p className="mt-1 text-[12.5px] font-semibold text-slate-600">Locations registered</p>
          </div>
        </div>
        <div className="card flex items-center gap-3.5 p-4">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-100 text-emerald-600 text-[15px] font-bold">
            #
          </span>
          <div>
            <p className="text-[22px] font-bold leading-none text-slate-900">{totalEquipment}</p>
            <p className="mt-1 text-[12.5px] font-semibold text-slate-600">Equipment tracked</p>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Building Name
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Floor
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Room / Office Number
                </th>
                <th className="px-5 py-3.5 text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Assigned Department
                </th>
                <th className="px-5 py-3.5 text-right text-[11.5px] font-semibold uppercase tracking-wider text-slate-500">
                  Equipment Count
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`border-b border-slate-100 transition last:border-0 ${
                    index % 2 === 1
                      ? 'bg-slate-50/60 hover:bg-blue-50/60'
                      : 'bg-white hover:bg-blue-50/60'
                  }`}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-600">
                        <Building2 className="h-4 w-4" strokeWidth={1.9} />
                      </span>
                      <span className="text-[13.5px] font-semibold text-slate-900">
                        {row.building}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-600">
                    {row.floor}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-[13.5px] text-slate-700">
                    {row.room}
                  </td>
                  <td className="px-5 py-4 text-[13.5px] text-slate-600">{row.department}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-bold text-slate-700 ring-1 ring-inset ring-slate-200">
                      {row.equipmentCount} items
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-[13px] text-slate-500">
        {rows.length} locations · {totalEquipment} equipment items assigned
      </p>

      {open && (
        <Modal
          title="Add New Location"
          subtitle="Register a building, floor and room in the asset inventory."
          onClose={() => setOpen(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="field-label" htmlFor="building">
                Building Name
              </label>
              <input
                id="building"
                className="field-input"
                placeholder="e.g. Main Building"
                value={form.building}
                onChange={(e) => setForm({ ...form, building: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="field-label" htmlFor="floor">
                  Floor
                </label>
                <select
                  id="floor"
                  className="field-input"
                  value={form.floor}
                  onChange={(e) => setForm({ ...form, floor: e.target.value })}
                >
                  {FLOORS.map((floor) => (
                    <option key={floor} value={floor}>
                      {floor}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="field-label" htmlFor="room">
                  Room / Office Number
                </label>
                <input
                  id="room"
                  className="field-input"
                  placeholder="e.g. Computer Lab 3"
                  value={form.room}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="department">
                Assigned Department
              </label>
              <input
                id="department"
                className="field-input"
                placeholder="e.g. IT Department"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="equipmentCount">
                Total Equipment Count
              </label>
              <input
                id="equipmentCount"
                type="number"
                min={0}
                className="field-input"
                placeholder="0"
                value={form.equipmentCount}
                onChange={(e) => setForm({ ...form, equipmentCount: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-blue-700"
              >
                Add Location
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  )
}
