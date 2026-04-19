import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const GAMES = [
  { emoji:'🧩', label:'Memoria',    desc:'Encuentra los pares (10 niveles)', level:'Niveles progresivos', bg:'rgba(124,111,224,.15)',border:'rgba(124,111,224,.3)' },
  { emoji:'🎨', label:'Colores',    desc:'Identifica el color (10 niveles)', level:'Agilidad visual',     bg:'rgba(45,207,179,.15)', border:'rgba(45,207,179,.3)'  },
  { emoji:'🔢', label:'Números',    desc:'Toca en orden (10 niveles)',       level:'Agilidad mental',     bg:'rgba(74,159,255,.15)', border:'rgba(74,159,255,.3)'  },
  { emoji:'📖', label:'Palabras',   desc:'Adivina la palabra (10 niveles)',  level:'Lenguaje',            bg:'rgba(255,179,71,.15)', border:'rgba(255,179,71,.3)'  },
];

const MEMORY_ICONS = ['🍎','🚗','🐶','⚽','🎸','🌟','🍕','🚀','🐱','🎈','🍩','🦋','🧸','🚲','🍉','✈️'];
const COLORS = [
  { name: 'Rojo', hex: '#ef476f' }, { name: 'Azul', hex: '#118ab2' },
  { name: 'Verde', hex: '#06d6a0' }, { name: 'Amarillo', hex: '#ffd166' },
  { name: 'Violeta', hex: '#7c6fe0' }, { name: 'Naranja', hex: '#f77f00' }
];
const PALABRAS_DATA = [
  { word: 'Gato', emoji: '🐱' }, { word: 'Casa', emoji: '🏠' }, { word: 'Sol', emoji: '☀️' },
  { word: 'Coche', emoji: '🚗' }, { word: 'Libro', emoji: '📖' }, { word: 'Agua', emoji: '💧' },
  { word: 'Luna', emoji: '🌙' }, { word: 'Flor', emoji: '🌸' }, { word: 'Reloj', emoji: '⌚' },
  { word: 'Avión', emoji: '✈️' }, { word: 'Silla', emoji: '🪑' }, { word: 'Mesa', emoji: '🪚' }
];

export default function PatientJuegos() {
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState(null);
  
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [level, setLevel] = useState(1);

  // States
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [targetColor, setTargetColor] = useState(null);
  const [colorOptions, setColorOptions] = useState([]);
  const [numbersGrid, setNumbersGrid] = useState([]);
  const [expectedNum, setExpectedNum] = useState(1);
  const [targetWord, setTargetWord] = useState(null);
  const [wordOptions, setWordOptions] = useState([]);

  const saveScoreToFirebase = async (gameName, points) => {
    try {
      await addDoc(collection(db, 'activities'), {
        patientId: user?.uid || 'anon',
        patientName: user?.displayName || 'Paciente',
        type: 'game',
        name: gameName,
        score: points,
        completedAt: serverTimestamp()
      });
    } catch(e) {
      console.error('Error guardando puntuación:', e);
    }
  };

  // --- MEMORIA ---
  const initMemoria = (lvl = 1, currentScore = 0) => {
    setLevel(lvl);
    setScore(currentScore);
    const pairsToMatch = lvl + 1; // Nivel 1 = 2 pares(4 cartas), Nivel 10 = 11 pares(22 cartas)
    const deckIcons = MEMORY_ICONS.slice(0, pairsToMatch);
    const shuffled = [...deckIcons, ...deckIcons]
      .sort(() => Math.random() - 0.5)
      .map((item, id) => ({ id, item }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setIsCompleted(false);
  };

  const handleMemoriaClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return;
    const newFlipped = [...flipped, id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const isMatch = cards[newFlipped[0]].item === cards[newFlipped[1]].item;
      if (isMatch) {
        const newMatched = [...matched, newFlipped[0], newFlipped[1]];
        setMatched(newMatched);
        const newScore = score + (10 * level);
        setScore(newScore);
        setFlipped([]);
        
        if (newMatched.length === cards.length) {
          if (level < 10) {
            setTimeout(() => initMemoria(level + 1, newScore), 1000);
          } else {
            setIsCompleted(true);
            saveScoreToFirebase('Memoria', newScore);
          }
        }
      } else {
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  // --- COLORES ---
  const initColores = (lvl = 1, currentScore = 0) => {
    setLevel(lvl);
    setScore(currentScore);
    setIsCompleted(false);
    nextColorRound();
  };

  const nextColorRound = () => {
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    setTargetColor(shuffled[0]);
    setColorOptions(shuffled.slice(0, 4).sort(() => Math.random() - 0.5));
  };

  const handleColorClick = (color) => {
    if (color.name === targetColor.name) {
      const newScore = score + (10 * level);
      setScore(newScore);
      if (level >= 10) {
        setIsCompleted(true);
        saveScoreToFirebase('Colores', newScore);
      } else {
        setLevel(l => l + 1);
        nextColorRound();
      }
    } else {
      alert('¡Intenta de nuevo!');
    }
  };

  // --- NÚMEROS ---
  const initNumeros = (lvl = 1, currentScore = 0) => {
    setLevel(lvl);
    setScore(currentScore);
    setIsCompleted(false);
    setExpectedNum(1);
    
    // Lvl 1 = 4 números ... Lvl 10 = 13 números
    const count = lvl + 3;
    const nums = Array.from({length: count}, (_, i) => i + 1);
    setNumbersGrid(nums.sort(() => Math.random() - 0.5));
  };

  const handleNumeroClick = (n) => {
    if (n === expectedNum) {
      const newScore = score + 5 * level;
      setScore(newScore);
      if (expectedNum === numbersGrid.length) {
        if (level < 10) {
          setTimeout(() => initNumeros(level + 1, newScore), 800);
        } else {
          setIsCompleted(true);
          saveScoreToFirebase('Números', newScore);
        }
      } else {
        setExpectedNum(n + 1);
      }
    } else if (n > expectedNum) {
      alert(`Fallaste, debes presionar el ${expectedNum}`);
    }
  };

  // --- PALABRAS ---
  const initPalabras = (lvl = 1, currentScore = 0) => {
    setLevel(lvl);
    setScore(currentScore);
    setIsCompleted(false);
    nextPalabraRound();
  };

  const nextPalabraRound = () => {
    const shuffled = [...PALABRAS_DATA].sort(() => Math.random() - 0.5);
    setTargetWord(shuffled[0]);
    setWordOptions(shuffled.slice(0, 3).sort(() => Math.random() - 0.5));
  };

  const handlePalabraClick = (w) => {
    if (w.word === targetWord.word) {
      const newScore = score + (15 * level);
      setScore(newScore);
      if (level >= 10) {
        setIsCompleted(true);
        saveScoreToFirebase('Palabras', newScore);
      } else {
        setLevel(l => l + 1);
        nextPalabraRound();
      }
    } else {
      alert('¡Intenta de nuevo!');
    }
  };

  const handleSelectGame = (g) => {
    setActiveGame(g.label);
    if (g.label === 'Memoria') initMemoria(1, 0);
    if (g.label === 'Colores') initColores(1, 0);
    if (g.label === 'Números') initNumeros(1, 0);
    if (g.label === 'Palabras') initPalabras(1, 0);
  };

  return (
    <>
      {activeGame ? (
        <div className="card" style={{ border:'1px solid var(--purple)' }}>
          <div className="row-between" style={{ marginBottom: 15 }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 20 }}>{activeGame}</div>
              {!isCompleted && <div style={{ fontSize: 13, color: 'var(--teal)' }}>Nivel {level}/10 | Puntos: {score}</div>}
            </div>
            <button style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: 'var(--text)'
            }} onClick={() => setActiveGame(null)}>
              🔙 Volver
            </button>
          </div>

          {isCompleted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 50 }}>🏆</div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>¡Fantástico!</div>
              <div style={{ fontSize: 16, margin: '10px 0' }}>Has completado los 10 niveles.</div>
              <div style={{ fontSize: 20, color: 'var(--purple)', fontWeight: 'bold', marginBottom: 20 }}>Puntos finales: {score}</div>
              <button className="big-btn" style={{ background: 'var(--purple)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setActiveGame(null)}>
                Volver a Juegos
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15, padding: '10px 0' }}>
              
              {/* RENDERING MEMORIA */}
              {activeGame === 'Memoria' && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cards.length > 12 ? 4 : (cards.length > 8 ? 4 : 3)}, 1fr)`, gap: 8 }}>
                  {cards.map(c => {
                    const isFlipped = flipped.includes(c.id) || matched.includes(c.id);
                    return (
                      <button key={c.id} style={{
                        height: cards.length > 12 ? 60 : 80, fontSize: cards.length > 12 ? 24 : 36, 
                        background: isFlipped ? 'var(--bg)' : 'var(--purple)',
                        border: '2px solid var(--purple)', borderRadius: 12, cursor: 'pointer',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        transition: 'transform 0.2s'
                      }} onClick={() => handleMemoriaClick(c.id)}>
                        {isFlipped ? c.item : '❓'}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* RENDERING COLORES */}
              {activeGame === 'Colores' && targetColor && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22, marginBottom: 20 }}>
                    Toca el color: <strong style={{ color: 'var(--text)' }}>{targetColor.name}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {colorOptions.map(c => (
                      <button key={c.name} style={{
                        height: 100, background: c.hex, border: 'none', borderRadius: 16, cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }} onClick={() => handleColorClick(c)}>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* RENDERING NÚMEROS */}
              {activeGame === 'Números' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 18, marginBottom: 20 }}>
                    Toca el número: <strong style={{ fontSize: 26, color: 'var(--blue)' }}>{expectedNum}</strong>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {numbersGrid.map((n, i) => {
                      const isPressed = n < expectedNum;
                      return (
                        <button key={i} style={{
                          height: 70, fontSize: 24, fontWeight: 'bold',
                          background: isPressed ? 'var(--bg)' : 'var(--blue)',
                          color: isPressed ? 'rgba(0,0,0,0)' : 'white',
                          border: isPressed ? '1px dashed var(--blue)' : 'none',
                          borderRadius: 12, cursor: isPressed ? 'default' : 'pointer',
                        }} onClick={() => !isPressed && handleNumeroClick(n)}>
                          {n}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* RENDERING PALABRAS */}
              {activeGame === 'Palabras' && targetWord && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 70, margin: '20px 0' }}>
                    {targetWord.emoji}
                  </div>
                  <div style={{ fontSize: 18, marginBottom: 20, color: 'var(--muted)' }}>
                    ¿Qué es esto?
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {wordOptions.map(w => (
                      <button key={w.word} style={{
                        padding: '16px', fontSize: 20, background: 'var(--surface)', color: 'var(--text)',
                        border: '2px solid var(--orange)', borderRadius: 12, cursor: 'pointer', fontWeight: 'bold'
                      }} onClick={() => handlePalabraClick(w)}>
                        {w.word}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      ) : (
        <>
          <div className="card">
            <div className="card-title">Entrenamiento cerebral</div>
            <div className="grid-2">
              {GAMES.map(g => (
                <button key={g.label} className="big-btn"
                  style={{ background:g.bg, border:`1px solid ${g.border}`, height:105 }}
                  onClick={() => handleSelectGame(g)}>
                  <span className="em3d" style={{ fontSize:36 }}>{g.emoji}</span>
                  <span>{g.label}</span>
                  <span style={{ fontSize:10, color:'var(--muted)' }}>{g.level}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-title">Mis logros 🏆</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <span className="tag" style={{ background:'rgba(255,179,71,.2)', color:'var(--amber)' }}>⭐ 5 días seguidos</span>
              <span className="tag" style={{ background:'rgba(94,232,160,.2)', color:'var(--green)' }}>🏅 Nivel Maestro</span>
              <span className="tag" style={{ background:'rgba(124,111,224,.2)', color:'var(--purple)' }}>🎯 Memoria Pro</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
