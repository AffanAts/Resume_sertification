import { useState } from 'react'

export default function QuizPanel({ topic, onAnswer, onFinish }) {
  const [answers, setAnswers] = useState(() => topic.quiz.map(() => null))

  if (!topic.quiz || topic.quiz.length === 0) {
    return <div className="cp-placeholder-card">Belum ada contoh soal untuk topik ini.</div>
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const allDone = answeredCount === topic.quiz.length
  const score = answers.reduce((acc, a, i) => acc + (a === topic.quiz[i].correct ? 1 : 0), 0)

  function handleAnswer(questionIndex, optionIndex) {
    if (answers[questionIndex] !== null) return
    const next = [...answers]
    next[questionIndex] = optionIndex
    setAnswers(next)

    const question = topic.quiz[questionIndex]
    onAnswer(question.q, optionIndex === question.correct)

    const nextAllDone = next.every((a) => a !== null)
    if (nextAllDone) {
      const nextScore = next.reduce((acc, a, i) => acc + (a === topic.quiz[i].correct ? 1 : 0), 0)
      onFinish(nextScore, topic.quiz.length)
    }
  }

  function handleReset() {
    setAnswers(topic.quiz.map(() => null))
  }

  return (
    <>
      {topic.quiz.map((question, qi) => {
        const answered = answers[qi]
        return (
          <div className="cp-quiz-card" key={qi}>
            <div className="cp-quiz-meta">
              Soal {qi + 1} / {topic.quiz.length}
            </div>
            <div className="cp-quiz-q">{question.q}</div>
            <div className="cp-quiz-opts">
              {question.opts.map((opt, oi) => {
                let cls = ''
                if (answered !== null) {
                  if (oi === question.correct) cls = 'cp-correct'
                  else if (oi === answered) cls = 'cp-wrong'
                }
                return (
                  <button
                    key={oi}
                    className={`cp-opt-btn ${cls}`}
                    disabled={answered !== null}
                    onClick={() => handleAnswer(qi, oi)}
                  >
                    <span className="cp-k">{String.fromCharCode(65 + oi)}</span>
                    <span>{opt}</span>
                  </button>
                )
              })}
            </div>
            {answered !== null && (
              <div className="cp-quiz-explain cp-show">
                <b>Pembahasan:</b> {question.explain}
              </div>
            )}
          </div>
        )
      })}

      <div className="cp-quiz-footer">
        <div className="cp-quiz-score">
          Skor: <b>{score}/{topic.quiz.length}</b> {allDone ? '· selesai' : ''}
        </div>
        <button className={`cp-btn ${allDone ? 'cp-primary' : ''}`} onClick={handleReset}>
          {allDone ? 'Ulangi kuis' : 'Reset'}
        </button>
      </div>
    </>
  )
}
