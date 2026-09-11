const TCP_FIELDS = [
  { text: 'Source Port', w: 90 },
  { text: 'Dest Port', w: 90 },
  { text: 'Sequence Number', w: 180 },
  { text: 'Ack Number', w: 180 },
  { text: 'Flags (SYN/ACK/FIN...)', w: 180 },
  { text: 'Window Size', w: 90 },
  { text: 'Checksum', w: 90 },
]

const UDP_FIELDS = [
  { text: 'Source Port', w: 90 },
  { text: 'Dest Port', w: 90 },
  { text: 'Length', w: 90 },
  { text: 'Checksum', w: 90 },
]

const ROW_W = 360
const FIELD_H = 30
const GAP_Y = 56

function packRows(fields, rowWidth) {
  const rows = []
  let current = []
  let currentW = 0
  for (const f of fields) {
    if (currentW + f.w > rowWidth && current.length) {
      rows.push(current)
      current = []
      currentW = 0
    }
    current.push(f)
    currentW += f.w
  }
  if (current.length) rows.push(current)
  return rows
}

function HeaderBlock({ title, fields, y0, sizeLabel }) {
  const rows = packRows(fields, ROW_W)
  return (
    <g>
      <text x={0} y={y0 - 12} fontSize="13" fontWeight="700" fill="currentColor">
        {title}
      </text>
      <text x={ROW_W} y={y0 - 12} fontSize="11" textAnchor="end" fill="currentColor" opacity="0.6">
        {sizeLabel}
      </text>
      {rows.map((row, ri) => {
        let x = 0
        const y = y0 + ri * FIELD_H
        return (
          <g key={ri}>
            {row.map((f, fi) => {
              const rect = (
                <g key={fi}>
                  <rect x={x} y={y} width={f.w} height={FIELD_H} fill="none" stroke="currentColor" strokeWidth="1.2" />
                  <text x={x + f.w / 2} y={y + FIELD_H / 2 + 4} fontSize="10" textAnchor="middle" fill="currentColor">
                    {f.text}
                  </text>
                </g>
              )
              x += f.w
              return rect
            })}
          </g>
        )
      })}
    </g>
  )
}

export default function TcpUdpHeaderDiagram() {
  const tcpRows = packRows(TCP_FIELDS, ROW_W).length
  const udpRows = packRows(UDP_FIELDS, ROW_W).length
  const tcpY0 = 26
  const udpY0 = tcpY0 + tcpRows * FIELD_H + GAP_Y
  const height = udpY0 + udpRows * FIELD_H + 16

  return (
    <figure className="cp-figure">
      <svg
        viewBox={`0 0 ${ROW_W} ${height}`}
        role="img"
        aria-label="Perbandingan header TCP yang punya banyak field untuk reliability seperti sequence number dan flags, versus header UDP yang jauh lebih sederhana hanya port, length, dan checksum"
      >
        <HeaderBlock title="TCP header" fields={TCP_FIELDS} y0={tcpY0} sizeLabel="≥ 20 byte" />
        <HeaderBlock title="UDP header" fields={UDP_FIELDS} y0={udpY0} sizeLabel="8 byte" />
      </svg>
      <figcaption>
        Header TCP jauh lebih besar karena membawa data untuk reliability (sequence/ack number, flags, window size).
        Header UDP minimal — hanya cukup untuk routing dan validasi dasar, itulah sumber kecepatannya.
      </figcaption>
    </figure>
  )
}
