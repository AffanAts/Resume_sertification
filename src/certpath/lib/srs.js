// Leitner-style spaced repetition: jawab benar naik satu box (jadwal review makin
// jauh), jawab salah kembali ke box 0.
const INTERVAL_DAYS = [1, 3, 7, 16, 35, 90]
const MAX_BOX = INTERVAL_DAYS.length - 1

export function todayKey(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(dateKey, days) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + days)
  return todayKey(date)
}

// Kunci kartu diturunkan dari teks soal, bukan indeks, supaya riwayat review tidak
// tertukar saat urutan soal dalam satu topik berubah.
export function cardKey(topicId, questionText) {
  let hash = 5381
  for (let i = 0; i < questionText.length; i += 1) {
    hash = ((hash << 5) + hash + questionText.charCodeAt(i)) | 0
  }
  return `${topicId}:${(hash >>> 0).toString(36)}`
}

export function nextCardState(current, wasCorrect) {
  const box = wasCorrect ? Math.min((current?.box ?? -1) + 1, MAX_BOX) : 0
  return { box, due: addDays(todayKey(), INTERVAL_DAYS[box]) }
}

export function isDue(card, today = todayKey()) {
  return Boolean(card) && card.due <= today
}

export function intervalLabel(box) {
  const days = INTERVAL_DAYS[box]
  if (days < 7) return `${days} hari`
  if (days < 30) return `${Math.round(days / 7)} minggu`
  return `${Math.round(days / 30)} bulan`
}

export function nextStreak(lastStudyDate, streak, today = todayKey()) {
  if (lastStudyDate === today) return streak
  if (lastStudyDate === addDays(today, -1)) return streak + 1
  return 1
}

// Soal hanya masuk antrian setelah pernah dijawab sekali, supaya topik yang belum
// dipelajari tidak membanjiri review.
export function buildDueQueue(topics, srs) {
  const due = []
  for (const topic of topics) {
    for (const question of topic.quiz) {
      const key = cardKey(topic.id, question.q)
      if (isDue(srs[key])) {
        due.push({ key, topic, question, box: srs[key].box })
      }
    }
  }
  return due
}
