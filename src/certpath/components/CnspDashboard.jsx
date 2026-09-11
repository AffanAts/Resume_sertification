import { useNavigate } from 'react-router-dom'
import { CNSP_TOPICS } from '../data/topics'
import { buildDueQueue } from '../lib/srs'

export default function CnspDashboard({ state }) {
  const navigate = useNavigate()

  const total = CNSP_TOPICS.length
  const done = CNSP_TOPICS.filter((t) => state.status[t.id] === 'done').length
  const mid = CNSP_TOPICS.filter((t) => state.status[t.id] === 'mid').length
  const todo = total - done - mid
  const dueCount = buildDueQueue(CNSP_TOPICS, state.srs).length

  return (
    <section>
      <div className="cp-hero">
        <h1>CNSP — Certified Network Security Practitioner</h1>
        <p>The SecOps Group · fokus network security fundamentals &amp; practical testing. Silabus resmi, 17 domain.</p>
      </div>

      <div className={`cp-review-banner ${dueCount > 0 ? 'cp-has-due' : ''}`}>
        <div className="cp-review-banner-main">
          <div className="cp-review-banner-title">
            {dueCount > 0 ? `${dueCount} soal siap direview` : 'Belum ada soal jatuh tempo'}
          </div>
          <div className="cp-review-banner-sub">
            {dueCount > 0
              ? 'Soal dari semua topik dicampur — cara paling efektif menjaga ingatan.'
              : 'Kerjakan kuis di topik mana pun untuk memasukkan soalnya ke jadwal review.'}
          </div>
        </div>
        {state.streak > 0 && (
          <div className="cp-streak">
            <div className="cp-streak-num">{state.streak}</div>
            <div className="cp-streak-lbl">hari berturut</div>
          </div>
        )}
        <button
          className="cp-btn cp-primary"
          disabled={dueCount === 0}
          onClick={() => navigate('/certpath/cnsp/review')}
        >
          Mulai review
        </button>
      </div>

      <div className="cp-stat-strip">
        <div className="cp-stat-cell cp-ok">
          <div className="cp-num">{done}</div>
          <div className="cp-lbl">Selesai</div>
        </div>
        <div className="cp-stat-cell cp-accent">
          <div className="cp-num">{mid}</div>
          <div className="cp-lbl">Sedang belajar</div>
        </div>
        <div className="cp-stat-cell">
          <div className="cp-num">{todo}</div>
          <div className="cp-lbl">Belum mulai</div>
        </div>
        <div className="cp-stat-cell">
          <div className="cp-num">{total}</div>
          <div className="cp-lbl">Total domain</div>
        </div>
      </div>

      <div className="cp-section-label">Domain ujian</div>

      <div className="cp-topic-list">
        {CNSP_TOPICS.map((topic) => {
          const status = state.status[topic.id] || 'todo'
          const best = state.quizBest[topic.id]
          return (
            <div
              className="cp-topic-row"
              key={topic.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/certpath/cnsp/${topic.id}`)}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/certpath/cnsp/${topic.id}`)}
            >
              <div className={`cp-check ${status === 'done' ? 'cp-done' : status === 'mid' ? 'cp-mid' : ''}`}>
                {status === 'done' ? '✓' : status === 'mid' ? '·' : ''}
              </div>
              <div className="cp-topic-main">
                <div className="cp-topic-title">{topic.title}</div>
                <div className="cp-topic-sub">{topic.sub}</div>
              </div>
              <div className="cp-topic-badges">
                {topic.stub && <span className="cp-badge">stub</span>}
                {best && (
                  <span className="cp-badge cp-has-notes">
                    {best.score}/{best.total}
                  </span>
                )}
              </div>
              <div className="cp-chev">›</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
