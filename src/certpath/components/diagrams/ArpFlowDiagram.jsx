const WIDTH = 560
const HEIGHT = 210
const HOST_A_X = 90
const HOST_B_X = 470
const HOST_Y = 40
const LINE_TOP = 70
const LINE_BOTTOM = 170

export default function ArpFlowDiagram() {
  return (
    <figure className="cp-figure">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Alur ARP: Host A mengirim ARP request secara broadcast ke semua host menanyakan pemilik sebuah IP, lalu host pemilik IP tersebut membalas dengan ARP reply unicast berisi MAC address-nya"
      >
        <defs>
          <marker id="arp-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
            <polygon points="0,0 9,4.5 0,9" fill="currentColor" />
          </marker>
        </defs>

        {/* Host boxes */}
        <rect x={HOST_A_X - 55} y={HOST_Y - 20} width="110" height="40" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x={HOST_A_X} y={HOST_Y + 5} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">Host A</text>
        <text x={HOST_A_X} y={HOST_Y - 28} fontSize="10.5" textAnchor="middle" fill="currentColor" opacity="0.6">192.168.1.10</text>

        <rect x={HOST_B_X - 55} y={HOST_Y - 20} width="110" height="40" rx="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <text x={HOST_B_X} y={HOST_Y + 5} fontSize="12" fontWeight="600" textAnchor="middle" fill="currentColor">Host B</text>
        <text x={HOST_B_X} y={HOST_Y - 28} fontSize="10.5" textAnchor="middle" fill="currentColor" opacity="0.6">192.168.1.20</text>

        {/* other hosts hearing the broadcast */}
        <rect x={230} y={HOST_Y - 14} width="90" height="28" rx="5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4" />
        <text x={275} y={HOST_Y + 5} fontSize="10" textAnchor="middle" fill="currentColor" opacity="0.5">host lain</text>

        {/* broadcast request line */}
        <line x1={HOST_A_X} y1={LINE_TOP} x2={HOST_B_X} y2={LINE_TOP} stroke="currentColor" strokeWidth="1.5" strokeDasharray="5 4" markerEnd="url(#arp-arrow)" />
        <text x={WIDTH / 2} y={LINE_TOP - 10} fontSize="11.5" textAnchor="middle" fill="currentColor">
          ARP Request (broadcast, FF:FF:FF:FF:FF:FF)
        </text>
        <text x={WIDTH / 2} y={LINE_TOP + 20} fontSize="10.5" textAnchor="middle" fill="currentColor" opacity="0.65">
          "Siapa pemilik 192.168.1.20?"
        </text>

        {/* unicast reply line */}
        <line x1={HOST_B_X} y1={LINE_BOTTOM} x2={HOST_A_X} y2={LINE_BOTTOM} stroke="currentColor" strokeWidth="2" markerEnd="url(#arp-arrow)" />
        <text x={WIDTH / 2} y={LINE_BOTTOM - 10} fontSize="11.5" textAnchor="middle" fill="currentColor" fontWeight="600">
          ARP Reply (unicast)
        </text>
        <text x={WIDTH / 2} y={LINE_BOTTOM + 20} fontSize="10.5" textAnchor="middle" fill="currentColor" opacity="0.65">
          "192.168.1.20 ada di MAC AA:BB:CC:DD:EE:FF"
        </text>
      </svg>
      <figcaption>
        ARP request dikirim broadcast ke seluruh segmen jaringan; hanya host pemilik IP yang dituju yang membalas
        secara unicast dengan MAC address-nya. Hasilnya disimpan di ARP cache Host A.
      </figcaption>
    </figure>
  )
}
