import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'certpath_state'

const DEFAULT_STATE = {
  status: {}, // topicId -> 'todo' | 'mid' | 'done'
  notes: {}, // topicId -> string
  quizBest: {}, // topicId -> { score, total }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return { ...DEFAULT_STATE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_STATE
  }
}

export function useCertPathState() {
  const [state, setState] = useState(loadState)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage unavailable (private mode, quota) — progress just won't persist
    }
  }, [state])

  const setTopicStatus = useCallback((topicId, status) => {
    setState((prev) => ({
      ...prev,
      status: { ...prev.status, [topicId]: status },
    }))
  }, [])

  const setTopicNotes = useCallback((topicId, notes) => {
    setState((prev) => ({
      ...prev,
      notes: { ...prev.notes, [topicId]: notes },
    }))
  }, [])

  const recordQuizResult = useCallback((topicId, score, total) => {
    setState((prev) => {
      const prevBest = prev.quizBest[topicId]
      if (prevBest && prevBest.score >= score) return prev
      return {
        ...prev,
        quizBest: { ...prev.quizBest, [topicId]: { score, total } },
      }
    })
  }, [])

  return { state, setTopicStatus, setTopicNotes, recordQuizResult }
}
