const LAYERS = [
  { n: 7, name: 'Application', pdu: 'Data', examples: 'HTTP, DNS, SMTP, SSH' },
  { n: 6, name: 'Presentation', pdu: 'Data', examples: 'TLS, encoding, kompresi' },
  { n: 5, name: 'Session', pdu: 'Data', examples: 'NetBIOS, RPC, session token' },
  { n: 4, name: 'Transport', pdu: 'Segment / Datagram', examples: 'TCP, UDP' },
  { n: 3, name: 'Network', pdu: 'Packet', examples: 'IP, ICMP, routing' },
  { n: 2, name: 'Data Link', pdu: 'Frame', examples: 'Ethernet, ARP, MAC' },
  { n: 1, name: 'Physical', pdu: 'Bits', examples: 'Kabel, fiber, radio' },
]

const ROW_H = 46
const TOP = 24
const LEFT = 24
const STACK_W = 230
const PDU_X = LEFT + STACK_W + 40
const EX_X = PDU_X + 190
const WIDTH = EX_X + 210
const HEIGHT = TOP + LAYERS.length * ROW_H + 20

export default function OsiStackDiagram() {
  return (
    <figure className="cp-figure">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Tujuh lapisan model OSI dari Application di atas sampai Physical di bawah, beserta PDU dan contoh protokol tiap lapisan"
      >
        <text x={LEFT} y={16} fontSize="11" fill="currentColor" opacity="0.6">LAYER</text>
        <text x={PDU_X} y={16} fontSize="11" fill="currentColor" opacity="0.6">PDU</text>
        <text x={EX_X} y={16} fontSize="11" fill="currentColor" opacity="0.6">CONTOH PROTOKOL</text>

        {LAYERS.map((layer, i) => {
          const y = TOP + i * ROW_H
          const isTransport = layer.n === 4
          return (
            <g key={layer.n}>
              <rect
                x={LEFT}
                y={y}
                width={STACK_W}
                height={ROW_H - 6}
                rx="6"
                fill="none"
                stroke="currentColor"
                strokeWidth={isTransport ? 2 : 1}
                opacity={isTransport ? 1 : 0.55}
              />
              <text x={LEFT + 14} y={y + (ROW_H - 6) / 2 + 4} fontSize="12" fontWeight="700" fill="currentColor" opacity="0.5">
                L{layer.n}
              </text>
              <text x={LEFT + 42} y={y + (ROW_H - 6) / 2 + 4} fontSize="13" fontWeight="600" fill="currentColor">
                {layer.name}
              </text>
              <text x={PDU_X} y={y + (ROW_H - 6) / 2 + 4} fontSize="12" fill="currentColor" opacity="0.75">
                {layer.pdu}
              </text>
              <text x={EX_X} y={y + (ROW_H - 6) / 2 + 4} fontSize="12" fill="currentColor" opacity="0.6">
                {layer.examples}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>
        Tujuh lapisan OSI dari Application (data yang dilihat user) sampai Physical (sinyal di kabel/udara). Baris Transport
        ditebalkan karena di sinilah TCP/UDP menentukan cara data dikirim.
      </figcaption>
    </figure>
  )
}
