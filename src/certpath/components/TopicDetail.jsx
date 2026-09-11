import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTopic } from '../data/topics'
import QuizPanel from './QuizPanel'

const TABS = [
  { key: 'summary', label: 'Ringkasan' },
  { key: 'cheat', label: 'Cheat Sheet' },
  { key: 'quiz', label: 'Contoh Soal' },
  { key: 'progress', label: 'Progress' },
]

const STATUS_OPTIONS = [
  { key: 'todo', label: 'Belum' },
  { key: 'mid', label: 'Sedang' },
  { key: 'done', label: 'Selesai' },
]

export default function TopicDetail({ state, setTopicStatus, setTopicNotes, recordQuizResult }) {
  const { topicId } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('summary')
  const topic = getTopic(topicId)

  if (!topic) {
    navigate('/certpath/cnsp', { replace: true })
    return null
  }

  const status = state.status[topic.id] || 'todo'
  const notes = state.notes[topic.id] || ''
  const best = state.quizBest[topic.id]

  const materialPercent = status === 'done' ? 100 : status === 'mid' ? 50 : 0
  const quizPercent = best ? Math.round((best.score / best.total) * 100) : 0

  return (
    <section>
      <div className="cp-topic-header">
        <h2>{topic.title}</h2>
        <div className="cp-status-pick">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`cp-status-btn cp-sel-${opt.key} ${status === opt.key ? 'cp-selected' : ''}`}
              onClick={() => setTopicStatus(topic.id, opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="cp-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`cp-tab-btn ${tab === t.key ? 'cp-active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'summary' && (
        <div className="cp-prose">
          {topic.summary.length === 0 ? (
            <div className="cp-placeholder-card">Ringkasan untuk topik ini belum ditulis.</div>
          ) : (
            topic.summary.map((block, i) => (
              <div key={i}>
                <h3>{block.heading}</h3>
                <ul>
                  {block.items.map((item, j) => (
                    <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
                {block.callout && (
                  <div className="cp-callout" dangerouslySetInnerHTML={{ __html: `<b>Ingat:</b> ${block.callout}` }} />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'cheat' && (
        <div className="cp-table-scroll">
          {topic.cheat.length === 0 ? (
            <div className="cp-placeholder-card">Cheat sheet belum diisi.</div>
          ) : (
            <table className="cp-cheat-table">
              <tbody>
                {topic.cheat.map(([label, value], i) => (
                  <tr key={i}>
                    <td dangerouslySetInnerHTML={{ __html: label }} />
                    <td dangerouslySetInnerHTML={{ __html: value }} />
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === 'quiz' && (
        <QuizPanel topic={topic} onFinish={(score, total) => recordQuizResult(topic.id, score, total)} />
      )}

      {tab === 'progress' && (
        <div className="cp-progress-panel">
          <div className="cp-progress-row">
            <div className="cp-lbl">Materi</div>
            <div className="cp-bar-track">
              <div className={`cp-bar-fill ${materialPercent === 100 ? 'cp-ok' : ''}`} style={{ width: `${materialPercent}%` }} />
            </div>
            <div className="cp-val">{materialPercent}%</div>
          </div>
          <div className="cp-progress-row">
            <div className="cp-lbl">Kuis terbaik</div>
            <div className="cp-bar-track">
              <div className={`cp-bar-fill ${quizPercent === 100 ? 'cp-ok' : ''}`} style={{ width: `${quizPercent}%` }} />
            </div>
            <div className="cp-val">{best ? `${best.score}/${best.total}` : '—'}</div>
          </div>
          <div>
            <div className="cp-section-label" style={{ margin: '6px 0 8px' }}>
              Catatan pribadi
            </div>
            <textarea
              className="cp-notes-area"
              placeholder="Tulis catatan tambahan, hasil lab, atau hal yang masih membingungkan..."
              value={notes}
              onChange={(e) => setTopicNotes(topic.id, e.target.value)}
            />
            <div className="cp-save-hint">Tersimpan otomatis di browser ini</div>
          </div>
        </div>
      )}
    </section>
  )
}
