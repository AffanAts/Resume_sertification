import { useNavigate } from 'react-router-dom'
import { CNSP_TOPICS } from '../data/topics'

export default function CnspDashboard({ state }) {
  const navigate = useNavigate()

  const total = CNSP_TOPICS.length
  const done = CNSP_TOPICS.filter((t) => state.status[t.id] === 'done').length
  const mid = CNSP_TOPICS.filter((t) => state.status[t.id] === 'mid').length
  const todo = total - done - mid

  return (
    <section>
      <div className="cp-hero">
        <h1>CNSP — Certified Network Security Practitioner</h1>
        <p>The SecOps Group · fokus network security fundamentals &amp; practical testing. Silabus resmi, 17 domain.</p>
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
