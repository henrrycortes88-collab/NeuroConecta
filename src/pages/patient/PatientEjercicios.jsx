import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const EXERCISES = [
  { emoji: '🧘', label: 'Respiración', desc: 'Inhala 4s · Sostén 4s · Exhala 4s', dur: '5 min', bg: 'rgba(45,207,179,.15)', border: 'rgba(45,207,179,.3)' },
  { emoji: '🤸', label: 'Estiramiento', desc: '5 ejercicios guiados', dur: '10 min', bg: 'rgba(124,111,224,.15)', border: 'rgba(124,111,224,.3)' },
  { emoji: '🚶', label: 'Caminata', desc: 'Paso a paso con audio', dur: '15 min', bg: 'rgba(255,179,71,.15)', border: 'rgba(255,179,71,.3)' },
  { emoji: '🧘‍♀️', label: 'Yoga suave', desc: '8 posturas adaptadas', dur: '20 min', bg: 'rgba(255,107,138,.15)', border: 'rgba(255,107,138,.3)' },
  { emoji: '💪', label: 'Fuerza leve', desc: 'Sin pesas, en casa', dur: '12 min', bg: 'rgba(74,159,255,.15)', border: 'rgba(74,159,255,.3)' },
  { emoji: '🎵', label: 'Musicoterapia', desc: 'Relajación con música', dur: '10 min', bg: 'rgba(94,232,160,.15)', border: 'rgba(94,232,160,.3)' },
];

const MUSIC_VIDEOS = [
  { id: 'hlWiI4xVXKY', title: 'Piano Relajante', thumb: 'https://img.youtube.com/vi/hlWiI4xVXKY/0.jpg' },
  { id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop', thumb: 'https://img.youtube.com/vi/jfKfPfyJRdk/0.jpg' },
  { id: '1ZYbU82GVz4', title: 'Música Dormir', thumb: 'https://img.youtube.com/vi/1ZYbU82GVz4/0.jpg' },
  { id: 'lFcSrYw-ARY', title: 'Naturaleza', thumb: 'https://img.youtube.com/vi/lFcSrYw-ARY/0.jpg' }
];

export default function PatientEjercicios() {
  const { user } = useAuth();
  const [active, setActive] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(MUSIC_VIDEOS[0]);

  // Timer states
  const [timerStarted, setTimerStarted] = useState(false);
  const [timerPaused, setTimerPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    let timer = null;
    if (timerStarted && !timerPaused && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timerStarted && !timerPaused && timeLeft === 0 && !isCompleted) {
      finishExercise();
    }
    return () => clearInterval(timer);
  }, [timerStarted, timerPaused, timeLeft, isCompleted]);

  const handleSelect = (label) => {
    setActive(label);
    setTimerStarted(false);
    setTimerPaused(false);
    setIsCompleted(false);
    setTimeLeft(0);
  };

  const startExercise = (durText) => {
    const min = parseInt(durText.split(' ')[0]);
    setTimeLeft(min * 60);
    setTimerStarted(true);
    setTimerPaused(false);
    setIsCompleted(false);
  };

  const finishExercise = async () => {
    setTimerStarted(false);
    setTimerPaused(false);
    setIsCompleted(true);
    setTimeLeft(0);

    try {
      await addDoc(collection(db, 'activities'), {
        patientId: user?.uid || 'anon',
        patientName: user?.displayName || 'Paciente',
        type: 'exercise',
        name: active,
        completedAt: serverTimestamp()
      });
      console.log('Ejercicio guardado en Firebase');
    } catch (e) {
      console.error('Error guardando actividad:', e);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <div className="card">
        <div className="card-title">Entrenamiento del día</div>
        <div className="grid-2">
          {EXERCISES.map(e => (
            <button key={e.label} className="big-btn"
              style={{
                background: e.bg, border: `1px solid ${e.border}`, height: 110,
                outline: active === e.label ? `2px solid var(--teal)` : 'none'
              }}
              onClick={() => handleSelect(e.label)}>
              <span className="em3d" style={{ fontSize: 38 }}>{e.emoji}</span>
              <span>{e.label}</span>
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{e.dur}</span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="card" style={{ border: '1px solid var(--teal)' }}>
          {(() => {
            const ex = EXERCISES.find(e => e.label === active);
            return (
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 8 }}>{ex.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{ex.label}</div>
                <div style={{ fontSize: 13, color: 'var(--muted)', margin: '6px 0 14px' }}>{ex.desc}</div>

                {ex.label === 'Musicoterapia' && (
                  <div style={{ marginBottom: 20, width: '100%', maxWidth: '100%', margin: '0 auto 20px auto' }}>
                    <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 15 }}>
                      <iframe
                        width="100%"
                        height="215"
                        src={`https://www.youtube.com/embed/${selectedVideo.id}`}
                        title="Musicoterapia YouTube"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 10 }}>
                      {MUSIC_VIDEOS.map(video => (
                        <div 
                          key={video.id} 
                          onClick={() => setSelectedVideo(video)}
                          style={{ 
                            minWidth: 100, 
                            cursor: 'pointer',
                            opacity: selectedVideo.id === video.id ? 1 : 0.6,
                            border: selectedVideo.id === video.id ? '2px solid var(--teal)' : '2px solid transparent',
                            borderRadius: 8,
                            overflow: 'hidden'
                          }}
                        >
                          <img src={video.thumb} alt={video.title} style={{ width: '100%', height: 60, objectFit: 'cover' }} />
                          <div style={{ fontSize: 10, padding: 4, background: 'var(--surface)', color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {video.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isCompleted ? (
                  <div style={{
                    color: 'var(--teal)', fontWeight: 800, fontSize: 18,
                    padding: '10px', background: 'var(--surface)', borderRadius: 10
                  }}>
                    ¡Completado, excelente trabajo! 🎉
                  </div>
                ) : !timerStarted ? (
                  <button style={{
                    background: 'var(--teal)', color: '#0B0F1A', border: 'none',
                    borderRadius: 10, padding: '10px 28px', fontWeight: 700, fontSize: 14,
                    cursor: 'pointer', fontFamily: "'Nunito',sans-serif"
                  }} onClick={() => startExercise(ex.dur)}>
                    ▶ Comenzar ({ex.dur})
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 15 }}>
                    <div style={{
                      fontSize: 48, fontWeight: 'bold', fontFamily: 'monospace',
                      color: timerPaused ? 'var(--muted)' : 'var(--text)'
                    }}>
                      {formatTime(timeLeft)}
                    </div>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button style={{
                        background: timerPaused ? 'var(--green)' : 'var(--orange)',
                        color: 'white', border: 'none',
                        borderRadius: 10, padding: '10px 20px', fontWeight: 700,
                        cursor: 'pointer'
                      }} onClick={() => setTimerPaused(!timerPaused)}>
                        {timerPaused ? '▶ Reanudar' : '⏸ Pausar'}
                      </button>
                      <button style={{
                        background: 'var(--red)', color: 'white', border: 'none',
                        borderRadius: 10, padding: '10px 20px', fontWeight: 700,
                        cursor: 'pointer'
                      }} onClick={finishExercise}>
                        ⏹ Terminar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </>
  );
}
