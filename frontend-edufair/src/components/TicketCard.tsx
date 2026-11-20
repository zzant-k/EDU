import React, { useRef, useState, useEffect } from 'react'
import { Ticket } from 'lucide-react'

interface TicketCardProps {
  participantNumber: string | number
  studentName?: string
  joinedAt?: string
  className?: string
}

export const formatTicketNumber = (num?: string | number): string => {
  if (!num) return '0001'
  const str = String(num).trim()
  if (/^\d+$/.test(str)) {
    return str.padStart(4, '0')
  }
  const match = str.match(/(\d+)$/)
  if (match) {
    return match[1].padStart(4, '0')
  }
  return str
}

// Deterministic barcode pattern matching reference image
const BAR_PATTERN = [
  { y: 0, h: 2.5 },
  { y: 3.5, h: 1 },
  { y: 5.5, h: 3 },
  { y: 9.5, h: 1.5 },
  { y: 12, h: 2 },
  { y: 15, h: 4 },
  { y: 20, h: 1 },
  { y: 22, h: 2.5 },
  { y: 25.5, h: 1 },
  { y: 27.5, h: 3.5 },
  { y: 32, h: 2 },
  { y: 35, h: 1 },
  { y: 37, h: 4 },
  { y: 42, h: 2.5 },
  { y: 45.5, h: 1 },
  { y: 47.5, h: 3 },
  { y: 51.5, h: 2 },
  { y: 54.5, h: 1 },
  { y: 56.5, h: 2.5 },
  { y: 60, h: 4 },
  { y: 65, h: 1 },
  { y: 67, h: 3.5 },
  { y: 71.5, h: 1.5 },
  { y: 74, h: 2 },
  { y: 77, h: 1 },
  { y: 79, h: 3 },
  { y: 83, h: 2 },
  { y: 86, h: 4 },
  { y: 91, h: 1 },
  { y: 93, h: 2.5 },
  { y: 96.5, h: 1.5 },
]

/**
 * Creates the exact SVG path contour of the ticket,
 * matching the authentic reference:
 * - Smooth large rounded corners
 * - Straight edges with spaced-out circular bite indentations (Image 1)
 * - Semicircular top and bottom tear-off notches (Image 2)
 */
function createTicketPath(w: number, h: number, stubWidth: number): string {
  if (!w || !h) return ''
  const cr = 20 // smooth corner radius matching Image 1
  const notchR = 14 // smooth notch radius matching Image 2
  const notchX = w - stubWidth
  const numScallops = 10
  const holeR = 3.5 // radius of each punch bite (diameter 7px)

  const availableH = h - 2 * cr
  const totalHoleH = numScallops * (2 * holeR)
  const flatH = (availableH - totalHoleH) / (numScallops + 1)

  const parts: string[] = []

  // 1. Start after top-left rounded corner
  parts.push(`M ${cr} 0`)

  // 2. Top edge straight segment to top notch
  parts.push(`H ${notchX - notchR}`)

  // 3. Top notch (curves DOWN into ticket: sweep=0)
  parts.push(`A ${notchR} ${notchR} 0 0 0 ${notchX + notchR} 0`)

  // 4. Top edge to top-right corner
  parts.push(`H ${w - cr}`)

  // 5. Top-right corner (sweep=1)
  parts.push(`A ${cr} ${cr} 0 0 1 ${w} ${cr}`)

  // 6. Right edge straight segments with spaced punch bites (Image 1)
  let currentY = cr
  for (let i = 0; i < numScallops; i++) {
    currentY += flatH
    parts.push(`V ${currentY.toFixed(2)}`)
    currentY += 2 * holeR
    parts.push(`A ${holeR} ${holeR} 0 0 0 ${w} ${currentY.toFixed(2)}`)
  }
  parts.push(`V ${h - cr}`)

  // 7. Bottom-right corner (sweep=1)
  parts.push(`A ${cr} ${cr} 0 0 1 ${w - cr} ${h}`)

  // 8. Bottom edge straight segment to bottom notch
  parts.push(`H ${notchX + notchR}`)

  // 9. Bottom notch (curves UP into ticket: sweep=0)
  parts.push(`A ${notchR} ${notchR} 0 0 0 ${notchX - notchR} ${h}`)

  // 10. Bottom edge to bottom-left corner
  parts.push(`H ${cr}`)

  // 11. Bottom-left corner (sweep=1)
  parts.push(`A ${cr} ${cr} 0 0 1 0 ${h - cr}`)

  // 12. Left edge straight segments with spaced punch bites going UP (Image 1)
  currentY = h - cr
  for (let i = 0; i < numScallops; i++) {
    currentY -= flatH
    parts.push(`V ${currentY.toFixed(2)}`)
    currentY -= 2 * holeR
    parts.push(`A ${holeR} ${holeR} 0 0 0 0 ${currentY.toFixed(2)}`)
  }
  parts.push(`V ${cr}`)

  // 13. Top-left corner (sweep=1)
  parts.push(`A ${cr} ${cr} 0 0 1 ${cr} 0`)

  parts.push('Z')
  return parts.join(' ')
}

export const TicketCard: React.FC<TicketCardProps> = ({
  participantNumber,
  studentName,
  className = '',
}) => {
  const ticketCode = formatTicketNumber(participantNumber)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ w: 800, h: 160 })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setDims({ w: Math.round(rect.width), h: Math.round(rect.height) })
      }
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const stubWidth = dims.w < 640 ? 144 : 176
  const ticketPath = createTicketPath(dims.w, dims.h, stubWidth)

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible select-none transition-all ${className}`}
    >
      {/* ================= VECTOR TICKET SHAPE WITH CONTOUR DROP SHADOW ================= */}
      {dims.w > 0 && dims.h > 0 && (
        <svg
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            filter:
              'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.04))',
          }}
        >
          <path
            d={ticketPath}
            fill="#FAF5E9"
            stroke="#E5DECD"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* ================= PERFORATION NOTCHES & LINE ================= */}
      {/* Dashed line running between top and bottom notches */}
      <div className="absolute top-[22px] bottom-[22px] right-36 sm:right-44 w-0 border-r border-dashed border-amber-900/25 z-10 pointer-events-none" />

      {/* Perforation holes running between top and bottom notches */}
      <div className="absolute top-[26px] bottom-[26px] right-36 sm:right-44 translate-x-1/2 flex flex-col justify-between items-center z-10 pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={`perf-${i}`}
            className="w-1.5 h-1.5 rounded-full bg-slate-50/90 border border-[#E5DECD]/70"
          />
        ))}
      </div>

      {/* ================= TICKET CONTENT CONTAINER ================= */}
      <div className="relative z-10 flex w-full items-stretch min-h-[160px]">
        {/* ---- LEFT MAIN BODY (FLEX-1) ---- */}
        <div className="flex-1 pl-6 sm:pl-8 pr-4 sm:pr-6 py-5 sm:py-6 flex flex-col justify-between text-left relative">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-amber-900/70">
              <Ticket size={14} className="text-amber-800" />
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest">
                EduFair Passport
              </span>
            </div>
            <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight leading-tight mt-0.5">
              LUCKY DRAW TICKET
            </h3>
          </div>

          {/* Footer Info (Participant only) */}
          <div className="flex flex-col pt-3 border-t border-amber-900/10 text-[10px] sm:text-xs">
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-slate-400">
              Peserta
            </span>
            <span className="font-bold text-slate-800 text-xs sm:text-sm truncate">
              {studentName || 'Peserta'}
            </span>
          </div>
        </div>

        {/* ---- RIGHT STUB ---- */}
        <div className="w-36 sm:w-44 pl-6 pr-4 sm:pr-6 py-3 flex items-center justify-center relative flex-shrink-0">
          <div className="flex items-center justify-center gap-2 sm:gap-3 h-full">
            {/* Barcode SVG */}
            <svg
              viewBox="0 0 32 100"
              className="h-28 sm:h-32 w-6 sm:w-7 text-slate-900 flex-shrink-0"
              fill="currentColor"
              preserveAspectRatio="none"
            >
              {BAR_PATTERN.map((bar, idx) => (
                <rect
                  key={idx}
                  x="0"
                  y={bar.y}
                  width="32"
                  height={bar.h}
                  rx="0.3"
                />
              ))}
            </svg>

            {/* Rotated Barcode Label with constrained width */}
            <div className="w-4 h-24 sm:h-28 relative flex items-center justify-center flex-shrink-0">
              <span className="absolute font-mono text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-600 whitespace-nowrap rotate-90 select-all">
                98431 — {ticketCode}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
