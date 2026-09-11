import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CNSP_TOPICS } from '../data/topics'
import { buildDueQueue, intervalLabel } from '../lib/srs'

function shuffle(items) {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function ReviewSession({ state, recordAnswer }) {
  const navigate = useNavigate()
  const [queue] = useState(() => shuffle(buildDueQueue(CNSP_TOPICS, state.srs)))
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correctCount, setCorrectCount] = useState(0)

  if (queue.length === 0) {
    return (
      <section>
        <div className="cp-hero">
          <h1>Tidak ada review hari ini</h1>
          <p>
            Semua soal yang pernah kamu jawab belum jatuh tempo. Kerjakan kuis di topik baru untuk menambah soal ke
            antrian review.
          </p>
        </div>
        <Link className="cp-btn cp-primary cp-btn-link" to="/certpath/cnsp">
          Kembali ke daftar domain
        </Link>
      </section>
    )
  }

  const finished = index >= queue.length

  if (finished) {
    return (
      <section>
        <div className="cp-hero">
          <h1>Sesi review selesai</h1>
          <p>
            Benar {correctCount} dari {queue.length} soal. Soal yang kamu jawab benar akan muncul lagi lebih lama,
            yang salah kembali besok.
          </p>
        </div>
        <div className="cp-review-summary">
          <div className="cp-stat-cell cp-ok">
            <div className="cp-num">{correctCount}</div>
            <div className="cp-lbl">Benar</div>
          </div>
          <div className="cp-stat-cell">
            <div className="cp-num">{queue.length - correctCount}</div>
            <div className="cp-lbl">Perlu diulang</div>
          </div>
          <div className="cp-stat-cell cp-accent">
            <div className="cp-num">{state.streak}</div>
            <div className="cp-lbl">Hari berturut</div>
          </div>
        </div>
        <button className="cp-btn cp-primary" onClick={() => navigate('/certpath/cnsp')}>
          Kembali ke daftar domain
        </button>
      </section>
    )
  }

  const card = queue[index]
  const answered = selected !== null
  const wasCorrect = selected === card.question.correct

  function handleAnswer(optionIndex) {
    if (answered) return
    setSelected(optionIndex)
    const correct = optionIndex === card.question.correct
    if (correct) setCorrectCount((c) => c + 1)
    recordAnswer(card.topic.id, card.question.q, correct)
  }

  function handleNext() {
    setSelected(null)
    setIndex((i) => i + 1)
  }

  return (
    <section>
      <div className="cp-review-head">
        <div className="cp-review-progress">
          Soal {index + 1} / {queue.length}
        </div>
        <div className="cp-bar-track cp-review-bar">
          <div className="cp-bar-fill" style={{ width: `${(index / queue.length) * 100}%` }} />
        </div>
      </div>

      <div className="cp-quiz-card">
        <div className="cp-quiz-meta">
          <Link to={`/certpath/cnsp/${card.topic.id}`}>{card.topic.title}</Link>
          <span className="cp-box-tag">box {card.box}</span>
        </div>
        <div className="cp-quiz-q">{card.question.q}</div>
        <div className="cp-quiz-opts">
          {card.question.opts.map((opt, oi) => {
            let cls = ''
            if (answered) {
              if (oi === card.question.correct) cls = 'cp-correct'
              else if (oi === selected) cls = 'cp-wrong'
            }
            return (
              <button key={oi} className={`cp-opt-btn ${cls}`} disabled={answered} onClick={() => handleAnswer(oi)}>
                <span className="cp-k">{String.fromCharCode(65 + oi)}</span>
                <span>{opt}</span>
              </button>
            )
          })}
        </div>
        {answered && (
          <>
            <div className="cp-quiz-explain cp-show">
              <b>Pembahasan:</b> {card.question.explain}
            </div>
            <div className="cp-quiz-footer">
              <div className="cp-quiz-score">
                {wasCorrect
                  ? `Benar — muncul lagi dalam ${intervalLabel(Math.min(card.box + 1, 5))}`
                  : 'Salah — soal ini kembali besok'}
              </div>
              <button className="cp-btn cp-primary" onClick={handleNext}>
                {index + 1 === queue.length ? 'Selesai' : 'Lanjut'}
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
