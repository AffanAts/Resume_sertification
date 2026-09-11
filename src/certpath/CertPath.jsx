import { Link, Route, Routes, useParams } from 'react-router-dom'
import { useCertPathState } from './hooks/useCertPathState'
import { getTopic } from './data/topics'
import CertList from './components/CertList'
import CnspDashboard from './components/CnspDashboard'
import TopicDetail from './components/TopicDetail'
import './certpath.css'

function TopicCrumb() {
  const { topicId } = useParams()
  const topic = getTopic(topicId)
  const label = topic ? (topic.title.length > 34 ? `${topic.title.slice(0, 34)}…` : topic.title) : ''
  return <span className="cp-current">{label}</span>
}

function Breadcrumbs() {
  return (
    <div className="cp-crumbs">
      <Routes>
        <Route path="/" element={<span className="cp-current">Sertifikasi</span>} />
        <Route
          path="/cnsp"
          element={
            <>
              <Link to="/certpath">Sertifikasi</Link>
              <span className="cp-sep">/</span>
              <span className="cp-current">CNSP</span>
            </>
          }
        />
        <Route
          path="/cnsp/:topicId"
          element={
            <>
              <Link to="/certpath">Sertifikasi</Link>
              <span className="cp-sep">/</span>
              <Link to="/certpath/cnsp">CNSP</Link>
              <span className="cp-sep">/</span>
              <TopicCrumb />
            </>
          }
        />
      </Routes>
    </div>
  )
}

export default function CertPath() {
  const { state, setTopicStatus, setTopicNotes, recordQuizResult } = useCertPathState()

  return (
    <div className="cp-root">
      <div className="cp-wrap">
        <div className="cp-topbar">
          <div className="cp-brand">
            <span className="cp-dot" />
            CertPath
          </div>
          <Breadcrumbs />
        </div>

        <Routes>
          <Route path="/" element={<CertList state={state} />} />
          <Route path="/cnsp" element={<CnspDashboard state={state} />} />
          <Route
            path="/cnsp/:topicId"
            element={
              <TopicDetail
                state={state}
                setTopicStatus={setTopicStatus}
                setTopicNotes={setTopicNotes}
                recordQuizResult={recordQuizResult}
              />
            }
          />
        </Routes>
      </div>
    </div>
  )
}
