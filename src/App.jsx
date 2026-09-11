import { Navigate, Route, Routes } from 'react-router-dom'
import CertPath from './certpath/CertPath.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/certpath" replace />} />
      <Route path="/certpath/*" element={<CertPath />} />
    </Routes>
  )
}

export default App
