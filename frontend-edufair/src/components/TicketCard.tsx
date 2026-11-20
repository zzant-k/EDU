import React from 'react'

interface TicketCardProps {
  participantNumber?: string | number
  studentName?: string
  joinedAt?: string
  titleLines?: string[]
  className?: string
}

export const formatTicketNumber = (num?: string | number): string => {
  if (!num) return '0001'
  const str = String(num).trim()
  if (/^\d+$/.test(str)) return str.padStart(4, '0')
  const match = str.match(/(\d+)$/)
  return match ? match[1].padStart(4, '0') : str
}

// 64 baris barcode presisi sesuai referensi (y dan height dalam px)
const BARCODE_BARS = [
  { y: 53, h: 1 },
  { y: 56, h: 1 },
  { y: 59, h: 4 },
  { y: 68, h: 1 },
  { y: 71, h: 4 },
  { y: 77, h: 1 },
  { y: 80, h: 1 },
  { y: 83, h: 4 },
  { y: 92, h: 1 },
  { y: 95, h: 4 },
  { y: 101, h: 4 },
  { y: 106, h: 2 },
  { y: 110, h: 1 },
  { y: 115, h: 2 },
  { y: 118, h: 5 },
  { y: 125, h: 3 },
  { y: 130, h: 2 },
  { y: 134, h: 1 },
  { y: 139, h: 1 },
  { y: 142, h: 4 },
  { y: 148, h: 1 },
  { y: 151, h: 5 },
  { y: 160, h: 4 },
  { y: 169, h: 1 },
  { y: 172, h: 1 },
  { y: 175, h: 1 },
  { y: 178, h: 4 },
  { y: 187, h: 1 },
  { y: 190, h: 4 },
  { y: 196, h: 4 },
  { y: 202, h: 1 },
  { y: 205, h: 1 },
  { y: 211, h: 1 },
  { y: 214, h: 4 },
  { y: 220, h: 1 },
  { y: 223, h: 1 },
  { y: 226, h: 4 },
  { y: 234, h: 2 },
  { y: 238, h: 4 },
  { y: 244, h: 4 },
  { y: 250, h: 1 },
  { y: 253, h: 1 },
  { y: 258, h: 2 },
  { y: 262, h: 4 },
  { y: 267, h: 5 },
  { y: 274, h: 1 },
  { y: 279, h: 1 },
  { y: 282, h: 2 },
  { y: 286, h: 3 },
  { y: 291, h: 5 },
  { y: 298, h: 3 },
  { y: 306, h: 2 },
  { y: 309, h: 1 },
  { y: 312, h: 1 },
  { y: 315, h: 4 },
  { y: 321, h: 1 },
  { y: 327, h: 1 },
  { y: 330, h: 1 },
  { y: 333, h: 4 },
  { y: 339, h: 1 },
  { y: 342, h: 4 },
  { y: 348, h: 1 },
  { y: 351, h: 4 },
  { y: 360, h: 1 },
]

export const TicketCard: React.FC<TicketCardProps> = ({
  participantNumber,
  studentName,
  titleLines = ['WORLD', 'OCEANS', 'DAY'],
  className = '',
}) => {
  const ticketCode = formatTicketNumber(participantNumber)

  return (
    <div className={`w-full max-w-[1024px] select-none ${className}`}>
      <svg
        viewBox="0 0 1024 410"
        className="w-full h-auto block"
        style={{
          filter:
            'drop-shadow(0 10px 20px rgba(0,0,0,0.14)) drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
        }}
        role="img"
        aria-label="EduFair Pass Ticket"
      >
        <defs>
          {/* Mask pemotong perforasi kiri & notch atas-bawah */}
          <mask id="ticketCutoutMask">
            <rect x="0" y="0" width="1024" height="410" fill="#ffffff" />
            {/* Top notch */}
            <circle cx="788" cy="15" r="17" fill="#000000" />
            {/* Bottom notch */}
            <circle cx="788" cy="395" r="17" fill="#000000" />
            {/* Perforasi samping kiri */}
            {Array.from({ length: 19 }, (_, i) => 30 + i * 19).map((y) => (
              <circle key={y} cx="20" cy={y} r="6" fill="#000000" />
            ))}
          </mask>
        </defs>

        {/* ── BADAN TIKET & STUB DENGAN MASK NOTCH ── */}
        <g mask="url(#ticketCutoutMask)">
          {/* Badan tiket putih */}
          <rect x="20" y="15" width="768" height="380" rx="20" fill="#ffffff" />
          {/* Stub navy kanan */}
          <rect x="788" y="15" width="222" height="380" rx="20" fill="#2c4d7e" />
        </g>

        {/* ── SISI KIRI: TEKS & GARIS PEMBATAS VERTIKAL ── */}
        <rect x="67" y="55" width="3.5" height="290" fill="#2c4d7e" />
        <text
          transform="translate(52, 200) rotate(-90)"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#2c4d7e"
          style={{ fontFamily: "'Archivo', Arial, sans-serif", letterSpacing: '3px' }}
        >
          EDUFAIR PASS TICKET
        </text>

        {/* ── BINGKAI DALAM (INNER FRAME) ── */}
        <rect
          x="79"
          y="55"
          width="676"
          height="290"
          fill="#ffffff"
          stroke="#2c4d7e"
          strokeWidth="3"
        />

        {/* ── ILUSTRASI LAUT DALAM BINGKAI ── */}
        <path
          d="M80.5 56.5 H526 C494 155 414 270 279 343.5 H80.5 Z"
          fill="#2c4d7e"
        />
        <path
          d="M546 56.5 C514 165 434 280 294 343"
          fill="none"
          stroke="#2c4d7e"
          strokeWidth="5"
        />

        {/* Garis gelombang putih */}
        <g fill="none" stroke="#ffffff" strokeLinecap="round">
          <path d="M518 57 C494 145 424 250 324 325" strokeWidth="9" />
          <path d="M499 57 C474 135 409 235 339 295" strokeWidth="3" />
          <path d="M484 145 C469 200 424 255 384 287" strokeWidth="5" />
          <path d="M532 95 C519 145 494 185 464 223" strokeWidth="3" />
        </g>

        {/* Gelembung */}
        <g fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.9">
          <circle cx="266" cy="110" r="5" />
          <circle cx="254" cy="133" r="10" />
          <circle cx="277" cy="155" r="8" />
          <circle cx="257" cy="179" r="13" />
          <circle cx="332" cy="275" r="5" />
          <circle cx="346" cy="295" r="11" />
          <circle cx="328" cy="318" r="9" />
        </g>

        {/* Ikan Lionfish */}
        <g id="lionfish">
          {/* Duri atas */}
          <g stroke="#b3541f" strokeWidth="3.5" strokeLinecap="round">
            <path d="M344 155 L389 93" />
            <path d="M356 151 L404 91" />
            <path d="M368 149 L419 93" />
            <path d="M380 147 L432 101" />
            <path d="M392 147 L442 111" />
            <path d="M404 147 L450 123" />
          </g>
          <g stroke="#e7e0d4" strokeWidth="2" strokeLinecap="round" opacity="0.9">
            <path d="M350 145 L386 103" />
            <path d="M364 143 L406 101" />
            <path d="M376 142 L422 103" />
            <path d="M390 142 L434 111" />
          </g>
          {/* Ekor */}
          <path
            d="M404 210 L442 225 L426 253 L386 227 Z"
            fill="#c4612a"
            stroke="#8f3f15"
            strokeWidth="2"
          />
          <path d="M398 223 L424 243 M410 217 L432 235" stroke="#f0e6d8" strokeWidth="2" />
          {/* Badan */}
          <path
            d="M294 200 C314 155 394 135 456 167 C476 179 472 207 442 221 C394 241 324 240 294 200 Z"
            fill="#cf6a30"
            stroke="#8f3f15"
            strokeWidth="2.5"
          />
          <path
            d="M334 155 C330 185 332 210 346 233 M354 149 C348 181 352 209 366 237 M376 147 C370 179 374 207 388 239 M398 150 C394 181 398 205 410 231 M420 155 C418 181 422 200 432 221"
            fill="none"
            stroke="#efe4d4"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* Sirip samping */}
          <path
            d="M339 200 C304 185 290 210 286 227 C304 240 324 245 346 231 Z"
            fill="#c4612a"
            stroke="#8f3f15"
            strokeWidth="2"
          />
          <path
            d="M339 200 L290 217 M341 207 L294 230 M344 215 L304 237"
            stroke="#efe4d4"
            strokeWidth="2"
          />
          <circle cx="444" cy="183" r="4.5" fill="#2b1a10" />
          <path
            d="M456 205 C462 200 468 199 472 197"
            stroke="#8f3f15"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Karang laut */}
        <g id="reef">
          <path
            d="M94 307 C89 275 114 253 144 255 C169 257 184 280 174 307 Z"
            fill="#7a5aa6"
            stroke="#2c1f4a"
            strokeWidth="2.5"
          />
          {/* Karang tabung oranye */}
          <g fill="#f0993a" stroke="#a65a14" strokeWidth="2.5">
            <rect x="162" y="145" width="20" height="82" rx="10" />
            <rect
              x="140"
              y="160"
              width="18"
              height="60"
              rx="9"
              transform="rotate(-18 149 190)"
            />
            <rect
              x="186"
              y="165"
              width="18"
              height="70"
              rx="9"
              transform="rotate(10 194 200)"
            />
            <rect
              x="208"
              y="177"
              width="16"
              height="50"
              rx="8"
              transform="rotate(22 216 202)"
            />
            <rect
              x="134"
              y="190"
              width="16"
              height="40"
              rx="8"
              transform="rotate(-38 142 210)"
            />
          </g>
          <g fill="#fbd9a3">
            <ellipse cx="172" cy="147" rx="7" ry="3" />
            <ellipse cx="197" cy="167" rx="6" ry="3" />
            <ellipse cx="216" cy="179" rx="5" ry="2.5" />
          </g>
          {/* Anemon pink */}
          <g stroke="#a32f55" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M199 287 C164 265 154 240 144 227" />
            <path d="M204 285 C189 257 182 233 182 215" />
            <path d="M209 285 C214 257 219 233 226 213" />
            <path d="M216 287 C239 263 249 241 262 227" />
            <path d="M220 291 C256 277 272 263 284 253" />
            <path d="M192 291 C159 285 144 275 134 265" />
          </g>
          <path
            d="M162 305 C164 275 234 273 244 305 Z"
            fill="#e0587f"
            stroke="#a32f55"
            strokeWidth="2.5"
          />
          {/* Kipas teal */}
          <path
            d="M114 340 C106 295 124 265 154 257 C179 285 186 315 174 340 Z"
            fill="#33a9b4"
            stroke="#14515a"
            strokeWidth="2.5"
          />
          <path
            d="M179 340 C179 295 194 270 220 263 C244 285 252 315 239 340 Z"
            fill="#2c8fa0"
            stroke="#14515a"
            strokeWidth="2.5"
          />
          <path
            d="M226 340 C226 305 242 285 266 283 C284 303 286 327 276 340 Z"
            fill="#3fb8b0"
            stroke="#14515a"
            strokeWidth="2.5"
          />
          <g stroke="#bfeee9" strokeWidth={2} fill="none" strokeLinecap="round" opacity="0.85">
            <path d="M144 335 L139 280 M156 335 L156 275 M166 335 L172 285" />
            <path d="M194 335 L199 287 M209 335 L216 285 M224 335 L232 291" />
            <path d="M246 335 L252 297 M258 335 L266 299" />
          </g>
          <path
            d="M172 287 C172 265 194 257 208 267 C210 277 204 287 200 291 Z"
            fill="#2c4d7e"
            stroke="#14233f"
            strokeWidth="2.5"
          />
          {/* Spons kuning */}
          <path
            d="M252 280 C256 263 282 263 294 275 C306 287 300 307 294 317 C284 327 264 325 256 313 C248 303 246 291 252 280 Z"
            fill="#d9c23a"
            stroke="#7d6c12"
            strokeWidth="2.5"
          />
          <g fill="#b9a424">
            <circle cx="272" cy="289" r="4" />
            <circle cx="286" cy="299" r="3.5" />
            <circle cx="266" cy="307" r="3" />
          </g>
          {/* Pasir */}
          <path
            d="M99 347 C134 335 214 341 249 351 C214 361 134 361 99 347 Z"
            fill="#cdb88a"
            stroke="#8a7648"
            strokeWidth="2"
          />
          <path
            d="M264 367 C279 350 314 345 326 355 C316 367 284 373 264 367 Z"
            fill="#d6b94a"
            stroke="#7d6c12"
            strokeWidth="2"
          />
        </g>

        {/* ── KONTEN KANAN BADAN TIKET ── */}
        {/* Logo EduFair Feather */}
        <image
          href="/logo-edufair.jpeg"
          x="660"
          y="75"
          width="55"
          height="55"
          preserveAspectRatio="xMidYMid meet"
        />

        {/* Judul WORLD OCEANS DAY (Rata Kanan ke x=725, dengan padding aman dari garis kanan x=755) */}
        <g
          fill="#2c4d7e"
          textAnchor="end"
          fontSize="27"
          fontWeight="700"
          style={{ fontFamily: "'Archivo', Arial, sans-serif", letterSpacing: '1px' }}
        >
          {titleLines.map((line, i) => (
            <text key={line + i} x="725" y={170 + i * 30}>
              {line}
            </text>
          ))}
        </g>

        {/* Info Peserta & Garis Pembatas (Lega, tidak mepet judul) */}
        <text
          x="610"
          y="280"
          textAnchor="middle"
          fontSize="11.5"
          fontWeight="600"
          fill="#2c4d7e"
          style={{ fontFamily: "'Archivo', Arial, sans-serif" }}
        >
          Peserta: {studentName || 'Peserta'}
        </text>
        <line x1="495" y1="298" x2="725" y2="298" stroke="#2c4d7e" strokeWidth="2" />
        <text
          x="610"
          y="318"
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="#2c4d7e"
          style={{ fontFamily: "'Archivo', Arial, sans-serif" }}
        >
          EduFair Digital Passport
        </text>

        {/* ── STUB (KANAN) ── */}
        {/* Barcode vertikal penuh dari y=53 s.d. y=360 (tinggi 308px, presisi referensi) */}
        <g>
          {BARCODE_BARS.map((bar, idx) => (
            <rect
              key={idx}
              x="868"
              y={bar.y}
              width="28"
              height={bar.h}
              fill="#ffffff"
            />
          ))}
        </g>

        {/* Label Nomor Tiket di sebelah kanan barcode, presisi di tengah */}
        <text
          transform="translate(925, 203) rotate(90)"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#ffffff"
          style={{ fontFamily: "'Archivo', Arial, sans-serif", letterSpacing: '1.5px' }}
        >
          Nomor Tiket: {ticketCode}
        </text>

        {/* Aksen rounded pill di pojok kanan bawah stub */}
        <g opacity="0.18" fill="#ffffff">
          <rect x="956" y="275" width="13" height="75" rx="6.5" />
          <rect x="974" y="255" width="13" height="95" rx="6.5" />
        </g>
      </svg>
    </div>
  )
}

export const OceanTicketCard = TicketCard
export default TicketCard
