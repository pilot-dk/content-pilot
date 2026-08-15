import type { ContentPillar, ScheduledItem } from '../types'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function formatIcsLocal(dt: Date): string {
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
}

// RFC5545 line folding: continuation lines start with a single space.
function foldLine(line: string): string {
  if (line.length <= 75) return line
  const parts: string[] = []
  let rest = line
  while (rest.length > 75) {
    parts.push(rest.slice(0, 75))
    rest = ' ' + rest.slice(75)
  }
  parts.push(rest)
  return parts.join('\r\n')
}

/** Builds an .ics calendar (floating local time — no timezone conversion) from scheduled videos. */
export function buildIcsCalendar(items: ScheduledItem[], pillars: ContentPillar[]): string {
  const dtstamp = formatIcsLocal(new Date()) // floating local time, matching DTSTART/DTEND below

  const events = items
    .filter((i) => i.status !== 'skipped')
    .map((item) => {
      const pillar = pillars.find((p) => p.id === item.pillarId)
      const [y, mo, d] = item.date.split('-').map(Number)
      const [h, mi] = item.time.split(':').map(Number)
      const startDt = new Date(y, mo - 1, d, h, mi)
      const endDt = new Date(startDt.getTime() + 30 * 60000)

      const descriptionParts = [pillar ? `Pillar: ${pillar.name}` : null, `Status: ${item.status}`, item.notes || null].filter(
        Boolean,
      )

      const lines = [
        'BEGIN:VEVENT',
        `UID:${item.id}@contentpilot`,
        `DTSTAMP:${dtstamp}`,
        `DTSTART:${formatIcsLocal(startDt)}`,
        `DTEND:${formatIcsLocal(endDt)}`,
        `SUMMARY:${escapeIcsText(item.title)}`,
        `DESCRIPTION:${escapeIcsText(descriptionParts.join('\\n'))}`,
        'END:VEVENT',
      ]
      return lines.map(foldLine).join('\r\n')
    })

  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ContentPilot//EN', 'CALSCALE:GREGORIAN', ...events, 'END:VCALENDAR'].join(
    '\r\n',
  )
}

export function downloadIcsCalendar(items: ScheduledItem[], pillars: ContentPillar[]) {
  const ics = buildIcsCalendar(items, pillars)
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'contentpilot-schedule.ics'
  a.click()
  URL.revokeObjectURL(url)
}
