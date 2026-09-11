function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Topics with full study material.
const DETAILED_TOPICS = [
  {
    id: 'tcpip',
    title: 'TCP/IP (Protocols & Networking Basics)',
    sub: 'OSI Layer · IPv4/IPv6 · Router, Switch, Hub',
    summary: [
      {
        heading: 'OSI Layer — 7 lapisan',
        items: [
          '<b>L7 Application</b> — HTTP, DNS, FTP: data yang dilihat user.',
          '<b>L6 Presentation</b> — encoding, enkripsi (TLS sering digambarkan di sini).',
          '<b>L5 Session</b> — buka/tutup sesi komunikasi antar host.',
          '<b>L4 Transport</b> — TCP (reliable, connection-oriented) vs UDP (fast, connectionless).',
          '<b>L3 Network</b> — IP addressing & routing antar jaringan.',
          '<b>L2 Data Link</b> — MAC address, switching dalam satu segmen.',
          '<b>L1 Physical</b> — kabel, sinyal, media fisik.',
        ],
        callout: 'Mnemonic: "All People Seem To Need Data Processing" = Application → Physical (top-down).',
      },
      {
        heading: 'IPv4 vs IPv6',
        items: [
          'IPv4: 32-bit, ditulis dotted-decimal (192.168.1.1), ruang alamat ~4.3 miliar, butuh NAT karena terbatas.',
          'IPv6: 128-bit, hex colon (2001:db8::1), didesain tanpa NAT, punya address types: unicast, multicast, anycast.',
          'Private ranges IPv4 penting untuk diingat: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
        ],
      },
      {
        heading: 'Perangkat jaringan',
        items: [
          '<b>Hub</b> — broadcast semua traffic ke semua port (L1), rawan sniffing, sudah jarang dipakai.',
          '<b>Switch</b> — forwarding berbasis MAC address table (L2), traffic hanya ke port tujuan.',
          '<b>Router</b> — forwarding berbasis IP address antar network berbeda (L3).',
        ],
      },
    ],
    cheat: [
      ['TCP handshake', '<code>SYN → SYN/ACK → ACK</code> (3-way)'],
      ['TCP teardown', '<code>FIN → ACK → FIN → ACK</code> (4-way)'],
      ['Well-known ports', '<code>20/21 FTP</code>, <code>22 SSH</code>, <code>23 Telnet</code>, <code>25 SMTP</code>, <code>53 DNS</code>, <code>80 HTTP</code>, <code>443 HTTPS</code>, <code>445 SMB</code>, <code>3389 RDP</code>'],
      ['Subnet /24', '255.255.255.0 → 254 host usable'],
      ['Subnet /16', '255.255.0.0 → 65534 host usable'],
      ['IPv6 loopback', '<code>::1</code>'],
      ['APIPA', '<code>169.254.0.0/16</code> (fail DHCP)'],
    ],
    quiz: [
      {
        q: 'Lapisan OSI mana yang bertanggung jawab atas MAC address dan switching dalam satu segmen jaringan?',
        opts: ['Physical (L1)', 'Data Link (L2)', 'Network (L3)', 'Transport (L4)'],
        correct: 1,
        explain: 'Data Link Layer (L2) menangani pengalamatan fisik (MAC) dan forwarding dalam satu broadcast domain — inilah yang dilakukan switch.',
      },
      {
        q: 'Apa perbedaan utama antara hub dan switch?',
        opts: [
          'Hub lebih cepat dari switch',
          'Switch forward berdasarkan MAC address table, hub broadcast ke semua port',
          'Hub bekerja di layer 3, switch di layer 2',
          'Tidak ada perbedaan signifikan',
        ],
        correct: 1,
        explain: 'Switch membangun MAC address table dan hanya mengirim frame ke port tujuan, sedangkan hub membanjiri (flood) semua port — membuat hub rentan terhadap sniffing.',
      },
      {
        q: 'Urutan TCP 3-way handshake yang benar adalah?',
        opts: ['ACK → SYN → SYN/ACK', 'SYN → SYN/ACK → ACK', 'SYN/ACK → SYN → ACK', 'SYN → ACK → SYN/ACK'],
        correct: 1,
        explain: 'Client mengirim SYN, server membalas SYN/ACK, lalu client mengonfirmasi dengan ACK — barulah koneksi TCP terbentuk.',
      },
    ],
  },
  {
    id: 'scanning',
    title: 'Network Scanning & Fingerprinting',
    sub: 'Nmap technique, service/OS detection',
    summary: [
      {
        heading: 'Tujuan scanning',
        items: [
          'Menemukan host hidup (host discovery), port terbuka, service & versi yang berjalan, serta OS target.',
          'Fingerprinting = mengidentifikasi service/OS berdasarkan respons unik (banner, TTL, TCP options).',
        ],
      },
      {
        heading: 'Tipe scan utama',
        items: [
          '<b>TCP Connect (-sT)</b> — full 3-way handshake, terlihat di log, tidak butuh privilege root.',
          '<b>SYN scan (-sS)</b> — "half-open", kirim SYN lalu RST sebelum handshake selesai, lebih stealthy, butuh root.',
          '<b>UDP scan (-sU)</b> — lambat & tidak reliable karena UDP tanpa handshake, bergantung ICMP unreachable.',
        ],
        callout: 'Ingat: port state bukan cuma open/closed — ada filtered (firewall drop, tidak ada respons) dan unfiltered.',
      },
    ],
    cheat: [
      ['<code>nmap -sS -T4 target</code>', 'SYN scan cepat'],
      ['<code>nmap -sV target</code>', 'Deteksi versi service'],
      ['<code>nmap -O target</code>', 'OS fingerprinting'],
      ['<code>nmap -p- target</code>', 'Scan semua 65535 port'],
      ['<code>nmap -sC target</code>', 'Jalankan default NSE scripts'],
      ['<code>nmap -A target</code>', 'Aggressive: OS+version+script+traceroute'],
      ['<code>nmap -sn target/24</code>', 'Host discovery (ping sweep), tanpa port scan'],
    ],
    quiz: [
      {
        q: 'Mengapa SYN scan (-sS) disebut "half-open" scan?',
        opts: [
          'Karena hanya scan setengah dari port range',
          'Karena tidak menyelesaikan 3-way handshake (kirim RST setelah SYN/ACK)',
          'Karena hanya bekerja pada IPv4',
          'Karena butuh setengah waktu dari TCP connect scan',
        ],
        correct: 1,
        explain: 'SYN scan mengirim SYN, menerima SYN/ACK sebagai bukti port terbuka, lalu langsung mengirim RST — koneksi tidak pernah selesai dibentuk, sehingga lebih jarang tercatat di log aplikasi.',
      },
      {
        q: 'Kenapa UDP scanning umumnya lebih lambat dan kurang akurat dibanding TCP scanning?',
        opts: [
          'UDP menggunakan enkripsi',
          'UDP tidak punya handshake, sehingga scanner bergantung pada ICMP port unreachable yang sering di-rate-limit',
          'UDP hanya berjalan di port tinggi',
          'Nmap tidak mendukung UDP',
        ],
        correct: 1,
        explain: 'Karena UDP connectionless, tidak ada respons pasti untuk port open. Scanner harus menunggu ICMP "port unreachable" untuk menyimpulkan port closed — dan banyak firewall membatasi rate ICMP ini.',
      },
    ],
  },
  {
    id: 'crypto',
    title: 'Cryptography',
    sub: 'Symmetric, asymmetric, hashing',
    summary: [
      {
        heading: 'Symmetric vs Asymmetric',
        items: [
          '<b>Symmetric</b> — satu kunci untuk enkripsi & dekripsi (AES, DES). Cepat, cocok untuk data besar, tapi masalah key distribution.',
          '<b>Asymmetric</b> — pasangan public/private key (RSA, ECC). Lambat, dipakai untuk key exchange & digital signature, bukan bulk encryption.',
        ],
      },
      {
        heading: 'Hashing',
        items: [
          'One-way function: tidak bisa di-reverse. Dipakai untuk integrity check & penyimpanan password.',
          'Hash yang baik: deterministic, fast to compute, collision-resistant, avalanche effect.',
          'MD5 & SHA-1 dianggap broken untuk keamanan (collision ditemukan) — gunakan SHA-256/SHA-3.',
        ],
      },
    ],
    cheat: [
      ['<code>AES-256</code>', 'Symmetric — standar modern, block cipher'],
      ['<code>RSA-2048</code>', 'Asymmetric — key exchange, signature'],
      ['<code>SHA-256</code>', 'Hash — aman, dipakai luas (TLS cert, git)'],
      ['<code>MD5</code>', 'Hash — BROKEN, jangan pakai untuk keamanan'],
      ['<code>bcrypt / Argon2</code>', 'Password hash — slow by design + salt'],
    ],
    quiz: [
      {
        q: 'Kenapa RSA (asymmetric) tidak dipakai langsung untuk enkripsi data dalam jumlah besar?',
        opts: [
          'RSA tidak aman',
          'RSA jauh lebih lambat dibanding symmetric encryption, sehingga hanya efisien untuk key exchange/signature',
          'RSA hanya bisa enkripsi teks pendek 1 karakter',
          'RSA sudah deprecated',
        ],
        correct: 1,
        explain: 'Operasi asymmetric jauh lebih berat secara komputasi. Praktik umum (mis. TLS) adalah pakai RSA/ECC untuk menukar kunci symmetric, lalu data besar dienkripsi dengan AES.',
      },
      {
        q: 'Apa yang membuat bcrypt/Argon2 lebih baik dari MD5 untuk menyimpan password?',
        opts: [
          'Bcrypt lebih pendek hasilnya',
          'Bcrypt sengaja dibuat lambat & menyertakan salt untuk melawan brute-force/rainbow table',
          'MD5 tidak bisa dijalankan di Linux',
          'Bcrypt adalah algoritma enkripsi, bukan hash',
        ],
        correct: 1,
        explain: 'Bcrypt/Argon2 adalah "slow hash" dengan cost factor yang bisa diatur, plus salt otomatis per password — membuat brute-force dan rainbow table jauh lebih mahal dibanding MD5 yang cepat & rentan collision.',
      },
    ],
  },
]

// Topics still awaiting material — kept in the list so progress tracking covers the full syllabus.
const STUB_TITLES = [
  'Network Discovery Protocols',
  'Network Architectures, Mapping and Target Identification',
  'Testing Network Services',
  'Active Directory Security Basics',
  'Linux and Windows Security Basics',
  'Common vulnerabilities affecting Windows Services',
  'Testing Web Servers and Frameworks',
  'Basic Malware Analysis',
  'Social Engineering attacks',
  'Network Security Tools and Frameworks (Nmap, Wireshark etc)',
  'Open-Source Intelligence Gathering (OSINT)',
  'Database Security Basics',
  'TLS Security Basics',
  'Password Storage',
]

const STUB_TOPICS = STUB_TITLES.map((title) => ({
  id: slugify(title),
  title,
  sub: 'Materi belum diisi',
  summary: [],
  cheat: [],
  quiz: [],
  stub: true,
}))

export const CNSP_TOPICS = [...DETAILED_TOPICS, ...STUB_TOPICS]

export function getTopic(id) {
  return CNSP_TOPICS.find((t) => t.id === id)
}
