import { useCallback, useEffect, useState } from 'react'
import { cardKey, nextCardState, nextStreak, todayKey } from '../lib/srs'

const STORAGE_KEY = 'certpath_state'

const DEFAULT_STATE = {
  status: {}, // topicId -> 'todo' | 'mid' | 'done'
  notes: {}, // topicId -> string
  quizBest: {}, // topicId -> { score, total }
  srs: {}, // cardKey -> { box, due }
  streak: 0,
  lastStudyDate: null,
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

  const recordAnswer = useCallback((topicId, questionText, wasCorrect) => {
    setState((prev) => {
      const key = cardKey(topicId, questionText)
      const today = todayKey()
      return {
        ...prev,
        srs: { ...prev.srs, [key]: nextCardState(prev.srs[key], wasCorrect) },
        streak: nextStreak(prev.lastStudyDate, prev.streak, today),
        lastStudyDate: today,
      }
    })
  }, [])

  return { state, setTopicStatus, setTopicNotes, recordQuizResult, recordAnswer }
}
