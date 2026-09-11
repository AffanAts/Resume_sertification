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
        heading: 'OSI Layer — 7 lapisan (detail per layer)',
        items: [
          '<b>L7 Application</b> — protokol yang langsung dipakai program: HTTP/HTTPS (web), DNS (resolusi nama), FTP (transfer file), SMTP/IMAP/POP3 (email), SSH (remote akses terenkripsi), Telnet (remote akses plaintext — hindari), SNMP (monitoring perangkat).',
          '<b>L6 Presentation</b> — translasi format data: encoding (ASCII/UTF-8), kompresi, dan enkripsi/dekripsi (TLS/SSL sering digambarkan berjalan di sini walau implementasi modern membungkus L4-L7).',
          '<b>L5 Session</b> — membuka, mengelola, dan menutup sesi komunikasi antar aplikasi di dua host (contoh: session token, RPC, NetBIOS session).',
          '<b>L4 Transport</b> — menyediakan pengiriman data end-to-end. <b>TCP</b>: connection-oriented, reliable (ada acknowledgment, retransmisi, flow control). <b>UDP</b>: connectionless, fast, no guarantee — cocok untuk streaming/DNS/VoIP dimana kecepatan lebih penting dari reliability.',
          '<b>L3 Network</b> — pengalamatan logis (IP address) dan routing paket antar network berbeda. Protokol: IP, ICMP (ping/traceroute), routing protocol (OSPF, BGP).',
          '<b>L2 Data Link</b> — pengalamatan fisik (MAC address) dan framing untuk transmisi dalam satu segmen/broadcast domain. Termasuk ARP (resolusi IP→MAC), switching, VLAN tagging (802.1Q).',
          '<b>L1 Physical</b> — representasi bit sebagai sinyal listrik/cahaya/radio di media fisik: kabel tembaga, fiber optic, gelombang WiFi, konektor, dan spesifikasi elektrik.',
        ],
        callout: 'Mnemonic top-down: "All People Seem To Need Data Processing" (Application → Presentation → Session → Transport → Network → Data Link → Physical).',
      },
      {
        heading: 'Encapsulation — bagaimana data "dibungkus" saat turun layer',
        items: [
          'Setiap layer menambahkan header (kadang trailer) miliknya sendiri terhadap data dari layer di atasnya — proses ini disebut <b>encapsulation</b>.',
          'Istilah data berubah nama tiap layer (Protocol Data Unit / PDU): L7-L5 disebut <b>Data</b> → L4 menjadi <b>Segment</b> (TCP) atau <b>Datagram</b> (UDP) → L3 menjadi <b>Packet</b> → L2 menjadi <b>Frame</b> → L1 menjadi <b>Bits</b>.',
          'Di penerima, proses kebalikannya terjadi lapis demi lapis: <b>de-encapsulation</b> — setiap layer melepas header miliknya sebelum meneruskan ke layer di atasnya.',
          'Kenapa penting untuk security: alat seperti Wireshark membaca frame dari L2 ke atas — memahami urutan encapsulation membantu membaca paket capture dengan benar saat analisis traffic.',
        ],
      },
      {
        heading: 'TCP — connection-oriented, detail proses',
        items: [
          '<b>3-way handshake (buka koneksi)</b>: Client kirim <code>SYN</code> (seq=x) → Server balas <code>SYN/ACK</code> (seq=y, ack=x+1) → Client kirim <code>ACK</code> (ack=y+1). Setelah ini koneksi resmi terbentuk (state ESTABLISHED).',
          '<b>4-way handshake (tutup koneksi)</b>: salah satu sisi kirim <code>FIN</code> → lawan balas <code>ACK</code> → lawan kirim <code>FIN</code> sendiri → sisi pertama balas <code>ACK</code>. Karena ada 2 arah yang perlu ditutup terpisah, totalnya 4 langkah (kadang FIN+ACK digabung jadi 3 langkah).',
          '<b>TCP flags penting</b>: <code>SYN</code> (mulai koneksi), <code>ACK</code> (konfirmasi penerimaan), <code>FIN</code> (selesai, normal close), <code>RST</code> (paksa putus koneksi/port tertutup), <code>PSH</code> (push data langsung ke aplikasi), <code>URG</code> (data mendesak).',
          '<b>Reliability</b>: setiap segment punya sequence number; penerima kirim ACK untuk konfirmasi; jika ACK tidak diterima dalam waktu tertentu, sender akan retransmit — inilah yang membuat TCP "reliable" dibanding UDP.',
          '<b>Flow & congestion control</b>: TCP pakai sliding window untuk mengatur seberapa banyak data bisa dikirim sebelum menunggu ACK, dan slow-start/congestion avoidance untuk menghindari membanjiri jaringan.',
        ],
      },
      {
        heading: 'UDP — connectionless, kenapa dipakai',
        items: [
          'Tidak ada handshake, tidak ada acknowledgment, tidak ada guarantee urutan atau delivery — header jauh lebih kecil (8 byte vs TCP 20+ byte) sehingga overhead rendah.',
          'Dipakai untuk kasus dimana kecepatan lebih penting dari kelengkapan data: DNS query, streaming video/audio, VoIP, online gaming, DHCP.',
          'Dari sisi security: karena tanpa handshake, UDP sering disalahgunakan untuk <b>amplification/reflection DDoS attack</b> (contoh: DNS amplification, NTP amplification) karena source IP mudah dipalsukan (spoofing) tanpa perlu koneksi valid dua arah.',
        ],
      },
      {
        heading: 'ARP — menjembatani L3 (IP) dan L2 (MAC)',
        items: [
          'Sebelum mengirim frame di jaringan lokal, host perlu tahu MAC address tujuan — <b>ARP (Address Resolution Protocol)</b> menjawab pertanyaan "siapa pemilik IP ini?".',
          'Proses: host kirim <b>ARP Request</b> secara broadcast ("siapa punya IP 192.168.1.5?") → host pemilik IP tersebut balas <b>ARP Reply</b> secara unicast berisi MAC address-nya.',
          'Hasil resolusi disimpan sementara di <b>ARP cache/table</b> tiap host supaya tidak broadcast berulang-ulang.',
          'Kerentanan: <b>ARP Spoofing/Poisoning</b> — attacker mengirim ARP reply palsu supaya trafik korban diarahkan lewat mesin attacker (dasar dari banyak MITM attack di jaringan lokal).',
        ],
      },
      {
        heading: 'DNS resolution — alur lengkap',
        items: [
          'Browser cek cache lokal → jika tidak ada, tanya <b>resolver DNS</b> (biasanya milik ISP atau custom seperti 1.1.1.1/8.8.8.8).',
          'Resolver bertanya ke <b>root DNS server</b> (tahu lokasi TLD server, misal .com) → root arahkan ke <b>TLD server</b> → TLD arahkan ke <b>authoritative nameserver</b> domain tersebut → authoritative server memberi jawaban IP address final.',
          'Query awal client ke resolver bersifat <b>recursive</b> (resolver wajib memberi jawaban akhir), sedangkan antara resolver-root-TLD-authoritative bersifat <b>iterative</b> (tiap server hanya menunjuk ke server berikutnya).',
          'DNS umumnya berjalan di UDP port 53 (untuk query singkat), tapi bisa fallback ke TCP port 53 untuk transfer data besar seperti zone transfer.',
        ],
      },
      {
        heading: 'IPv4 vs IPv6',
        items: [
          'IPv4: 32-bit, ditulis dotted-decimal (192.168.1.1), ruang alamat ~4.3 miliar — sudah habis secara global, sehingga butuh NAT untuk berbagi satu public IP ke banyak private host.',
          'IPv6: 128-bit, ditulis hex dipisah titik dua (2001:db8::1), ruang alamat nyaris tak terbatas, didesain tanpa perlu NAT, dan mendukung address types: unicast (satu tujuan), multicast (grup tujuan), anycast (tujuan terdekat dari beberapa kandidat).',
          'Private IPv4 ranges (RFC 1918) — wajib hafal: <code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>. Ini tidak bisa dirutekan di internet publik.',
        ],
      },
      {
        heading: 'Subnetting & CIDR — cara berpikir, bukan cuma hafalan',
        items: [
          'CIDR notation <code>/n</code> menyatakan berapa bit dari alamat 32-bit yang dipakai sebagai network bits — sisanya untuk host bits.',
          'Rumus jumlah host usable per subnet: <code>2^(host bits) − 2</code> (dikurangi 2 karena network address dan broadcast address tidak bisa dipakai host).',
          'Contoh hitung /26: host bits = 32−26 = 6 → total alamat 2^6 = 64 → host usable = 64−2 = 62. Increment antar subnet = 256−192(subnet mask oktet terakhir)=64, jadi subnet dimulai di .0, .64, .128, .192.',
          'Kenapa relevan untuk security testing: memahami subnetting membantu menentukan <b>scope</b> pentest yang benar (target berapa host dalam satu range) dan membaca hasil network mapping dengan tepat.',
        ],
      },
      {
        heading: 'Perangkat jaringan — cara kerja & implikasi security',
        items: [
          '<b>Hub</b> (L1) — menerima sinyal di satu port dan meneruskan (flood) ke SEMUA port lain tanpa logika apapun. Semua host di segmen sama bisa saling sniff traffic satu sama lain — sudah sangat jarang dipakai di jaringan modern.',
          '<b>Switch</b> (L2) — membangun dan menyimpan <b>MAC address table</b> dari frame yang lewat, lalu forward frame hanya ke port tujuan yang sesuai (unicast), mengurangi collision dan mempersulit sniffing pasif dibanding hub — tapi tetap bisa diserang lewat <b>MAC flooding</b> (memenuhi tabel supaya switch fallback ke mode flood seperti hub) atau <b>VLAN hopping</b>.',
          '<b>Router</b> (L3) — meneruskan paket antar network berbeda berdasarkan IP address dan routing table, biasanya juga menjalankan NAT dan access control (ACL/firewall dasar).',
        ],
      },
    ],
    cheat: [
      ['TCP handshake', '<code>SYN → SYN/ACK → ACK</code> (3-way, buka koneksi)'],
      ['TCP teardown', '<code>FIN → ACK → FIN → ACK</code> (4-way, tutup koneksi)'],
      ['TCP flags', '<code>SYN</code> mulai · <code>ACK</code> konfirmasi · <code>FIN</code> selesai · <code>RST</code> paksa putus · <code>PSH</code> push data · <code>URG</code> urgent'],
      ['PDU per layer', 'L7-5 Data → L4 Segment/Datagram → L3 Packet → L2 Frame → L1 Bits'],
      ['Well-known ports', '<code>20/21 FTP</code>, <code>22 SSH</code>, <code>23 Telnet</code>, <code>25 SMTP</code>, <code>53 DNS</code>, <code>67/68 DHCP</code>, <code>80 HTTP</code>, <code>110 POP3</code>, <code>143 IMAP</code>, <code>443 HTTPS</code>, <code>445 SMB</code>, <code>3389 RDP</code>'],
      ['ARP', 'Request (broadcast) → Reply (unicast), IP ↔ MAC resolution'],
      ['DNS default port', 'UDP/53 (query) · TCP/53 (zone transfer / respons besar)'],
      ['Subnet /24', '255.255.255.0 → 254 host usable'],
      ['Subnet /25', '255.255.255.128 → 126 host usable'],
      ['Subnet /26', '255.255.255.192 → 62 host usable'],
      ['Subnet /27', '255.255.255.224 → 30 host usable'],
      ['Subnet /16', '255.255.0.0 → 65534 host usable'],
      ['Rumus host usable', '<code>2^(host bits) − 2</code>'],
      ['Private IPv4 (RFC1918)', '<code>10.0.0.0/8</code>, <code>172.16.0.0/12</code>, <code>192.168.0.0/16</code>'],
      ['IPv6 loopback', '<code>::1</code>'],
      ['APIPA', '<code>169.254.0.0/16</code> (gagal dapat DHCP)'],
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
      {
        q: 'Saat data turun dari layer Transport ke layer Network dalam proses encapsulation, PDU (Protocol Data Unit) berubah nama dari apa menjadi apa?',
        opts: [
          'Dari Frame menjadi Packet',
          'Dari Segment/Datagram menjadi Packet',
          'Dari Packet menjadi Segment',
          'Namanya tidak pernah berubah',
        ],
        correct: 1,
        explain: 'Di layer Transport data disebut Segment (TCP) atau Datagram (UDP). Setelah dibungkus header IP di layer Network, PDU berganti nama menjadi Packet.',
      },
      {
        q: 'Protokol apa yang digunakan untuk menerjemahkan IP address menjadi MAC address dalam satu jaringan lokal?',
        opts: ['DNS', 'DHCP', 'ARP', 'ICMP'],
        correct: 2,
        explain: 'ARP (Address Resolution Protocol) mengirim broadcast request "siapa pemilik IP ini?" dan menerima unicast reply berisi MAC address pemiliknya.',
      },
      {
        q: 'Sebuah subnet menggunakan CIDR /27. Berapa jumlah host usable dalam subnet tersebut?',
        opts: ['14', '30', '62', '126'],
        correct: 1,
        explain: 'Host bits = 32−27 = 5 → total alamat = 2^5 = 32 → host usable = 32−2 = 30 (dikurangi network address dan broadcast address).',
      },
      {
        q: 'Kenapa UDP lebih rentan dimanfaatkan untuk amplification/reflection DDoS dibanding TCP?',
        opts: [
          'UDP menggunakan port yang lebih besar',
          'UDP tidak melakukan handshake, sehingga source IP mudah dipalsukan (spoofing) tanpa perlu koneksi dua arah yang valid',
          'UDP hanya berjalan di jaringan lokal',
          'UDP selalu terenkripsi',
        ],
        correct: 1,
        explain: 'Karena UDP connectionless tanpa handshake, attacker bisa mengirim request dengan source IP palsu (korban) ke server yang responsnya jauh lebih besar dari request (mis. DNS/NTP) — respons besar itu mengarah ke korban, bukan attacker.',
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
