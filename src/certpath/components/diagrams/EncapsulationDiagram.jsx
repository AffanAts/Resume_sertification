const STAGES = [
  { label: 'Application data', layer: 'L7-5', pieces: [{ text: 'Data', w: 160 }] },
  {
    label: 'Segment (L4)',
    layer: 'L4',
    pieces: [
      { text: 'TCP/UDP hdr', w: 60, tag: true },
      { text: 'Data', w: 160 },
    ],
  },
  {
    label: 'Packet (L3)',
    layer: 'L3',
    pieces: [
      { text: 'IP hdr', w: 50, tag: true },
      { text: 'TCP/UDP hdr', w: 60, tag: true },
      { text: 'Data', w: 160 },
    ],
  },
  {
    label: 'Frame (L2)',
    layer: 'L2',
    pieces: [
      { text: 'Eth hdr', w: 50, tag: true },
      { text: 'IP hdr', w: 50, tag: true },
      { text: 'TCP/UDP hdr', w: 60, tag: true },
      { text: 'Data', w: 160 },
      { text: 'FCS', w: 40, tag: true },
    ],
  },
]

const ROW_H = 70
const LEFT = 130
const TOP = 20
const HEIGHT = TOP + STAGES.length * ROW_H + 10
const PIECE_H = 30

function stageWidth(stage) {
  return stage.pieces.reduce((sum, p) => sum + p.w, 0)
}

export default function EncapsulationDiagram() {
  const width = LEFT + Math.max(...STAGES.map(stageWidth)) + 40

  return (
    <figure className="cp-figure">
      <svg
        viewBox={`0 0 ${width} ${HEIGHT}`}
        role="img"
        aria-label="Proses encapsulation: data aplikasi dibungkus header transport, lalu header IP, lalu header Ethernet dan trailer FCS saat turun dari layer Application ke Physical"
      >
        <defs>
          <marker id="enc-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <polygon points="0,0 8,4 0,8" fill="currentColor" />
          </marker>
        </defs>

        {STAGES.map((stage, i) => {
          const y = TOP + i * ROW_H
          let x = LEFT
          return (
            <g key={stage.label}>
              <text x={0} y={y + PIECE_H / 2 + 4} fontSize="12" fontWeight="600" fill="currentColor">
                {stage.label}
              </text>
              {stage.pieces.map((piece, j) => {
                const rect = (
                  <g key={j}>
                    <rect
                      x={x}
                      y={y}
                      width={piece.w}
                      height={PIECE_H}
                      fill={piece.tag ? 'currentColor' : 'none'}
                      fillOpacity={piece.tag ? 0.12 : 0}
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <text
                      x={x + piece.w / 2}
                      y={y + PIECE_H / 2 + 4}
                      fontSize="11"
                      textAnchor="middle"
                      fill="currentColor"
                      opacity={piece.tag ? 0.85 : 1}
                    >
                      {piece.text}
                    </text>
                  </g>
                )
                x += piece.w
                return rect
              })}
              {i < STAGES.length - 1 && (
                <line
                  x1={LEFT + stageWidth(stage) / 2}
                  y1={y + PIECE_H + 4}
                  x2={LEFT + stageWidth(stage) / 2}
                  y2={y + ROW_H - 4}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  markerEnd="url(#enc-arrow)"
                />
              )}
            </g>
          )
        })}
      </svg>
      <figcaption>
        Encapsulation: setiap layer menambahkan header (kotak terarsir) di depan data dari layer di atasnya. Di sisi
        penerima proses ini berjalan terbalik (de-encapsulation) — header dilepas satu per satu dari luar ke dalam.
      </figcaption>
    </figure>
  )
}
