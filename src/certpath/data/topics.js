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
        heading: 'OSI Layer — 7 lapisan, detail per layer',
        diagram: 'osiStack',
        items: [
          '<b>L7 Application</b> — satu-satunya layer yang langsung berinteraksi dengan program/user. Berisi protokol seperti HTTP/HTTPS (web), DNS (resolusi nama domain), FTP (transfer file), SMTP/IMAP/POP3 (email), SSH (remote akses terenkripsi), Telnet (remote akses plaintext — hindari di jaringan produksi), SNMP (monitoring & manajemen perangkat).',
          '<b>L6 Presentation</b> — menjembatani perbedaan format data antar sistem: encoding karakter (ASCII/UTF-8), kompresi, serialisasi (JSON/XML), dan enkripsi/dekripsi. TLS/SSL sering digambarkan berjalan di sini secara konseptual, walau implementasi modern (mis. HTTPS) membungkus data mulai dari atas L4.',
          '<b>L5 Session</b> — bertanggung jawab membuka, menjaga (checkpoint, sync), dan menutup sesi komunikasi antar dua aplikasi endpoint. Contoh konkret: session ID pada aplikasi web, protokol RPC, NetBIOS session di Windows networking.',
          '<b>L4 Transport</b> — layer paling krusial untuk memahami TCP/IP: menyediakan pengiriman data end-to-end antara proses (diidentifikasi lewat port number) di dua host. <b>TCP</b> menjamin data sampai utuh dan berurutan lewat acknowledgment & retransmisi; <b>UDP</b> mengirim tanpa jaminan itu demi kecepatan.',
          '<b>L3 Network</b> — memberi pengalamatan logis (IP address) yang unik secara global/organisasi, dan menentukan jalur (routing) paket melewati banyak jaringan berbeda. Protokol inti: IP itu sendiri, ICMP (dipakai ping & traceroute untuk diagnostik), serta routing protocol seperti OSPF dan BGP yang menjaga router saling tahu topologi jaringan.',
          '<b>L2 Data Link</b> — menangani pengiriman frame dalam satu segmen fisik/broadcast domain yang sama, memakai pengalamatan fisik (MAC address) yang tertanam di NIC. Termasuk di sini: ARP (menjembatani IP ke MAC), Ethernet framing, VLAN tagging (802.1Q) untuk memisahkan broadcast domain secara logis di switch yang sama.',
          '<b>L1 Physical</b> — layer paling bawah: bagaimana bit 0 dan 1 benar-benar direpresentasikan sebagai sinyal — tegangan listrik di kabel tembaga (UTP/coax), pulsa cahaya di fiber optic, atau gelombang radio di WiFi. Spesifikasi konektor (RJ45), standar kabel (Cat5e/Cat6), dan modulasi sinyal ada di layer ini.',
        ],
        callout: 'Mnemonic top-down: "All People Seem To Need Data Processing" (Application → Presentation → Session → Transport → Network → Data Link → Physical). Untuk arah sebaliknya (bottom-up), banyak yang pakai "Please Do Not Throw Sausage Pizza Away".',
      },
      {
        heading: 'Encapsulation — bagaimana data benar-benar "dibungkus" saat turun layer',
        diagram: 'encapsulation',
        items: [
          'Bayangkan kamu mengirim surat: kamu tulis isi pesan (data), masukkan ke amplop dengan alamat tujuan (header), lalu kantor pos menaruh amplop itu ke dalam kantong pos yang lebih besar (header lagi). <b>Encapsulation</b> bekerja persis seperti itu — tiap layer OSI membungkus data dari layer di atasnya dengan header (dan kadang trailer) miliknya sendiri.',
          'Nama data berubah di tiap layer, disebut <b>PDU (Protocol Data Unit)</b>: di L7-L5 disebut <b>Data</b>. Begitu turun ke L4, header TCP/UDP ditambahkan dan namanya berubah jadi <b>Segment</b> (kalau TCP) atau <b>Datagram</b> (kalau UDP). Turun lagi ke L3, header IP ditambahkan dan menjadi <b>Packet</b>. Di L2, header Ethernet (MAC source/destination) DAN trailer FCS (untuk deteksi error) ditambahkan, menjadi <b>Frame</b>. Akhirnya di L1, frame ini dikonversi jadi aliran <b>Bits</b> untuk dikirim lewat media fisik.',
          'Di sisi penerima, urutan ini berbalik total — disebut <b>de-encapsulation</b>. NIC menerima bits, menyusunnya jadi frame, melepas header Ethernet lalu meneruskan isinya (packet) ke layer Network, yang melepas header IP dan meneruskan segment ke layer Transport, dan seterusnya sampai data murni sampai ke aplikasi tujuan.',
          'Kenapa ini penting banget untuk security testing: saat kamu buka Wireshark dan lihat satu baris capture, itu sebenarnya satu frame utuh berisi semua header yang ter-nested (Ethernet di paling luar, lalu IP, lalu TCP/UDP, baru payload aplikasi di paling dalam). Memahami urutan ini adalah kunci membaca packet capture dengan benar — kamu tahu persis di "kedalaman" mana harus mencari MAC address vs IP address vs port number.',
        ],
      },
      {
        heading: 'TCP — connection-oriented, detail proses lengkap',
        diagram: 'tcpUdpHeader',
        items: [
          '<b>3-way handshake (membuka koneksi)</b>: Client mengirim segment dengan flag <code>SYN</code> set dan sequence number acak (seq=x) — ini permintaan "mau mulai koneksi". Server yang siap menerima membalas dengan flag <code>SYN</code> dan <code>ACK</code> sekaligus (seq=y, ack=x+1) — artinya "oke, saya juga mau, dan saya terima permintaanmu". Client menutup jabat tangan dengan mengirim <code>ACK</code> (ack=y+1). Setelah 3 langkah ini, koneksi resmi berstatus ESTABLISHED dan data mulai mengalir.',
          '<b>4-way handshake (menutup koneksi)</b>: karena TCP adalah koneksi dua arah (full-duplex), masing-masing arah harus ditutup terpisah. Sisi A kirim <code>FIN</code> (saya selesai kirim) → Sisi B balas <code>ACK</code> (oke, dicatat) → Sisi B kirim <code>FIN</code> miliknya sendiri (saya juga selesai) → Sisi A balas <code>ACK</code> final. Kadang langkah 2 dan 3 digabung jadi satu segment FIN+ACK, membuat prosesnya terlihat seperti 3 langkah.',
          '<b>TCP flags (1 bit masing-masing di header, bisa combine)</b>: <code>SYN</code> memulai koneksi baru, <code>ACK</code> mengonfirmasi penerimaan data/koneksi, <code>FIN</code> menandakan pengirim selesai dan ingin menutup koneksi secara normal, <code>RST</code> memaksa memutus koneksi seketika (sering muncul saat port tertutup atau koneksi invalid), <code>PSH</code> meminta data langsung diteruskan ke aplikasi tanpa buffering, <code>URG</code> menandai ada data mendesak yang perlu diproses lebih dulu.',
          '<b>Reliability lewat sequence & acknowledgment number</b>: setiap byte data yang dikirim TCP diberi nomor urut (sequence number). Penerima membalas dengan acknowledgment number yang menyatakan "saya sudah terima sampai byte sekian, kirim yang berikutnya". Jika sender tidak menerima ACK dalam batas waktu (retransmission timeout), data dianggap hilang dan dikirim ulang otomatis — inilah mekanisme yang membuat TCP disebut reliable.',
          '<b>Flow control & congestion control</b>: TCP menggunakan konsep <b>sliding window</b> — penerima memberi tahu sender berapa banyak data (window size) yang boleh dikirim sebelum menunggu ACK, mencegah penerima kebanjiran data. Terpisah dari itu, algoritma <b>congestion control</b> (slow start, congestion avoidance) membuat sender mulai dengan window kecil dan menaikkannya bertahap, untuk menghindari membanjiri jaringan itu sendiri (bukan cuma penerima).',
        ],
      },
      {
        heading: 'UDP — connectionless, kenapa (dan kapan) dipakai',
        items: [
          'UDP tidak melakukan handshake apapun sebelum mengirim data, tidak menunggu acknowledgment, dan tidak menjamin urutan atau bahkan keberhasilan pengiriman. Header-nya jauh lebih ramping — hanya 8 byte (source port, destination port, length, checksum) dibanding TCP yang minimal 20 byte — sehingga overhead pemrosesannya jauh lebih rendah.',
          'Trade-off ini disengaja: UDP dipakai ketika kecepatan dan latensi rendah lebih penting daripada kelengkapan data 100%. Contoh nyata: DNS query (satu request-response singkat, kalau gagal tinggal retry), streaming video/audio (lebih baik ada sedikit frame drop daripada buffering menunggu retransmit), VoIP/panggilan suara (delay terasa lebih mengganggu daripada sedikit noise), online gaming (posisi terbaru lebih penting dari posisi lama yang telat), dan DHCP (proses awal mendapatkan IP address).',
          'Implikasi security: karena UDP tidak butuh koneksi dua arah yang tervalidasi, attacker bisa mengirim request dengan source IP address yang dipalsukan (spoofed) — ini dasar dari <b>amplification/reflection DDoS attack</b> (contoh: DNS amplification, NTP amplification, memcached amplification), dimana attacker mengirim request kecil ke server pihak ketiga dengan source IP korban, dan respons yang jauh lebih besar dari server itu dibanjirkan ke korban, bukan ke attacker.',
        ],
      },
      {
        heading: 'ARP — menjembatani Layer 3 (IP) dan Layer 2 (MAC)',
        diagram: 'arpFlow',
        items: [
          'Di dalam satu jaringan lokal (LAN), frame Ethernet dikirim berdasarkan MAC address, bukan IP address. Masalahnya, aplikasi dan manusia berpikir dalam IP address. <b>ARP (Address Resolution Protocol)</b> adalah jembatan yang menjawab pertanyaan: "Saya tahu IP address tujuan, tapi MAC address-nya apa?"',
          'Prosesnya dua langkah: (1) host pengirim mengirim <b>ARP Request</b> secara <b>broadcast</b> ke seluruh segmen jaringan (dialamatkan ke MAC <code>FF:FF:FF:FF:FF:FF</code>) berisi pertanyaan "siapa pemilik IP X?". (2) Hanya host yang benar-benar memiliki IP tersebut yang membalas dengan <b>ARP Reply</b> secara <b>unicast</b> (langsung ke pengirim), berisi MAC address miliknya.',
          'Supaya tidak perlu broadcast berulang-ulang untuk komunikasi berikutnya, hasil resolusi ini disimpan sementara di <b>ARP cache/table</b> pada tiap host (bisa dilihat di Windows/Linux lewat perintah <code>arp -a</code>), dengan waktu kedaluwarsa tertentu.',
          'Kerentanan utama: <b>ARP Spoofing/Poisoning</b> — karena ARP tidak punya mekanisme autentikasi, attacker bisa mengirim ARP reply palsu yang mengklaim dirinya pemilik IP tertentu (misalnya IP gateway). Korban akan menyimpan MAC attacker sebagai MAC gateway di cache-nya, sehingga semua trafik korban ke internet melewati mesin attacker dulu — ini fondasi dari banyak serangan Man-in-the-Middle (MITM) di jaringan lokal.',
        ],
      },
      {
        heading: 'DNS resolution — alur lengkap dari browser sampai IP address',
        items: [
          'Langkah 1 — <b>cache check</b>: browser dan OS mengecek cache lokal dulu ("apakah saya baru saja mencari domain ini?"). Kalau ada dan belum kedaluwarsa (TTL), proses berhenti di sini, sangat cepat.',
          'Langkah 2 — <b>tanya resolver</b>: kalau cache kosong, request dikirim ke <b>DNS resolver</b> (biasanya diberikan otomatis oleh ISP, atau bisa diatur manual ke resolver publik seperti 1.1.1.1 Cloudflare atau 8.8.8.8 Google). Query dari client ke resolver ini bersifat <b>recursive</b> — artinya client "menyerahkan" seluruh pekerjaan ke resolver dan menunggu jawaban akhir saja.',
          'Langkah 3 — <b>resolver bekerja secara iterative</b>: resolver bertanya ke <b>root DNS server</b> ("dimana saya bisa cari domain .com?") → root tidak tahu jawaban akhir tapi menunjuk ke <b>TLD server</b> yang menangani .com → TLD server juga tidak tahu jawaban akhir, tapi menunjuk ke <b>authoritative nameserver</b> milik domain yang dicari → authoritative nameserver inilah yang akhirnya menjawab dengan IP address sebenarnya.',
          'Langkah 4 — <b>jawaban dikembalikan & disimpan</b>: resolver meneruskan IP address itu ke client, sekaligus menyimpannya di cache resolver selama durasi TTL record tersebut, supaya query berikutnya ke domain yang sama tidak perlu mengulang seluruh proses.',
          'Detail transport: DNS umumnya berjalan di <b>UDP port 53</b> karena query dan respons biasanya kecil dan cepat. Tapi untuk respons yang melebihi batas ukuran UDP (misalnya <b>zone transfer</b> antar nameserver, atau respons DNSSEC yang besar), DNS akan fallback ke <b>TCP port 53</b>.',
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
