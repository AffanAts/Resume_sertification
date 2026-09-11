import { useNavigate } from 'react-router-dom'
import { CERTS } from '../data/certs'
import { CNSP_TOPICS } from '../data/topics'
import ProgressRing from './ProgressRing'

function cnspProgressPercent(status) {
  const total = CNSP_TOPICS.length
  const done = CNSP_TOPICS.filter((t) => status[t.id] === 'done').length
  const mid = CNSP_TOPICS.filter((t) => status[t.id] === 'mid').length
  return Math.round(((done + mid * 0.5) / total) * 100)
}

export default function CertList({ state }) {
  const navigate = useNavigate()

  return (
    <section>
      <div className="cp-hero">
        <h1>Pilih jalur sertifikasi</h1>
        <p>Rangkuman belajar, cheat sheet, dan latihan soal — tersimpan otomatis di browser ini.</p>
      </div>

      <div className="cp-cert-grid">
        {CERTS.map((cert) => {
          if (cert.status !== 'active') {
            return (
              <div className="cp-cert-card cp-locked" key={cert.id}>
                <div className="cp-cert-top">
                  <span className="cp-tag cp-tag-soon">Coming soon</span>
                </div>
                <div className="cp-cert-name">{cert.name}</div>
                <div className="cp-cert-full">
                  {cert.full} · {cert.vendor}
                </div>
                <div className="cp-cert-progress-row">
                  <div className="cp-cert-stats">Materi menyusul</div>
                </div>
              </div>
            )
          }

          const percent = cnspProgressPercent(state.status)
          const doneCount = CNSP_TOPICS.filter((t) => state.status[t.id] === 'done').length

          return (
            <div
              className="cp-cert-card"
              key={cert.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate('/certpath/cnsp')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/certpath/cnsp')}
            >
              <div className="cp-cert-top">
                <span className="cp-tag cp-tag-active">Fokus sekarang</span>
              </div>
              <div className="cp-cert-name">{cert.name}</div>
              <div className="cp-cert-full">
                {cert.full} · {cert.vendor}
              </div>
              <div className="cp-cert-progress-row">
                <ProgressRing percent={percent} />
                <div className="cp-cert-stats">
                  <b>{percent}%</b> selesai · {doneCount}/{CNSP_TOPICS.length} topik
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
