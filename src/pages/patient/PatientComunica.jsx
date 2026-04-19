/**
 * PatientComunica.jsx - NeuroConecta
 * -----------------------------------------------
 * Sistema de Comunicación Aumentativa y Alternativa (CAA/AAC)
 * para el rol PACIENTE.
 *
 * Funcionalidad:
 *  - El paciente selecciona pictogramas agrupados por CONTEXTO y CATEGORÍA
 *    para construir frases de forma visual e intuitiva.
 *  - Al presionar REPRODUCIR:
 *    1. La frase se sintetiza usando Web Speech API (SpeechSynthesisUtterance).
 *    2. El mensaje (emojis + texto) se guarda en Firestore:
 *       `chats/{patientUid}/messages` con el campo `isAac: true`.
 *    3. El cuidador ve el mensaje en tiempo real en su pestaña "Mensajes"
 *       a través del componente ChatRoom.
 *
 * Contextos disponibles: General, En el colegio, En el médico, En casa, Salidas.
 * Categorías: Necesidades básicas, Emociones, Acciones, Lugares, Personas, Comida.
 * Total de pictogramas: 15 por combinación de contexto + categoría.
 */
import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';

const CONTEXTS = [
  { id: 'general', label: 'General', icon: '🎛️' },
  { id: 'colegio', label: 'En el colegio', icon: '🏫' },
  { id: 'medico',  label: 'En el médico', icon: '🏥' },
  { id: 'casa',    label: 'En casa', icon: '🏠' },
  { id: 'salidas', label: 'Salidas', icon: '🚗' }
];

const CATEGORIES = [
  { id: 'necesidades', label: 'Necesidades básicas', icon: '❤️', color: '#ff4b72' },
  { id: 'emociones',   label: 'Emociones', icon: '😊', color: '#ffd166' },
  { id: 'acciones',    label: 'Acciones', icon: '🏃', color: '#06d6a0' },
  { id: 'lugares',     label: 'Lugares', icon: '📍', color: '#4A9FFF' },
  { id: 'personas',    label: 'Personas', icon: '👥', color: '#7C6FE0' },
  { id: 'comida',      label: 'Comida', icon: '🍎', color: '#f77f00' },
];

const VOCABULARY = {
  // GENERAL
  general_necesidades: [
    { emoji: '🙋', label: 'Yo', txt:'Yo' },
    { emoji: '🛑', label: 'Parar', txt:'quiero parar' },
    { emoji: '🚽', label: 'Baño', txt:'necesito el baño' },
    { emoji: '😣', label: 'Dolor', txt:'tengo dolor' },
    { emoji: '💧', label: 'Sed', txt:'tengo sed' },
    { emoji: '🍔', label: 'Hambre', txt:'tengo hambre' },
    { emoji: '😴', label: 'Dormir', txt:'quiero dormir' },
    { emoji: '🥶', label: 'Frío', txt:'tengo frío' },
    { emoji: '🥵', label: 'Calor', txt:'tengo calor' },
    { emoji: '🧸', label: 'Jugar', txt:'quiero jugar' },
    { emoji: '🤝', label: 'Ayuda', txt:'necesito ayuda' },
    { emoji: '🧼', label: 'Lavarse', txt:'quiero lavarme' },
    { emoji: '👕', label: 'Vestirse', txt:'necesito vestirme' },
    { emoji: '🛋️', label: 'Descansar', txt:'quiero descansar' },
    { emoji: '🫁', label: 'Respirar', txt:'necesito respirar' }
  ],
  general_emociones: [
    { emoji: '😊', label: 'Feliz', txt:'estoy feliz' },
    { emoji: '😢', label: 'Triste', txt:'estoy triste' },
    { emoji: '😡', label: 'Enojado', txt:'estoy enojado' },
    { emoji: '😰', label: 'Nervioso', txt:'estoy nervioso' },
    { emoji: '🥱', label: 'Cansado', txt:'estoy cansado' },
    { emoji: '😱', label: 'Asustado', txt:'estoy asustado' },
    { emoji: '😑', label: 'Aburrido', txt:'estoy aburrido' },
    { emoji: '😲', label: 'Sorprendido', txt:'estoy sorprendido' },
    { emoji: '😳', label: 'Avergonzado', txt:'estoy avergonzado' },
    { emoji: '😕', label: 'Confundido', txt:'estoy confundido' },
    { emoji: '😌', label: 'Orgulloso', txt:'estoy orgulloso' },
    { emoji: '😌', label: 'Tranquilo', txt:'estoy tranquilo' },
    { emoji: '😖', label: 'Frustrado', txt:'estoy frustrado' },
    { emoji: '🤩', label: 'Emocionado', txt:'estoy emocionado' },
    { emoji: '🧍', label: 'Solitario', txt:'me siento solo' }
  ],
  general_acciones: [
    { emoji: 'quiero', label: 'Quiero', txt:'quiero', isTextOnly: true },
    { emoji: '🚶', label: 'Ir', txt:'ir' },
    { emoji: '👐', label: 'Ven', txt:'ven aquí' },
    { emoji: '👍', label: 'Sí', txt:'sí' },
    { emoji: '👎', label: 'No', txt:'no' },
    { emoji: '👀', label: 'Mirar', txt:'mira' },
    { emoji: '👂', label: 'Escuchar', txt:'escucha' },
    { emoji: '➕', label: 'Más', txt:'quiero más' },
    { emoji: '✅', label: 'Ya está', txt:'ya está' },
    { emoji: '🤲', label: 'Dar', txt:'dar' },
    { emoji: '✊', label: 'Tomar', txt:'tomar' },
    { emoji: '🕹️', label: 'Jugar', txt:'jugar' },
    { emoji: '🍽️', label: 'Comer', txt:'comer' },
    { emoji: '🚶', label: 'Caminar', txt:'caminar' },
    { emoji: '🏃', label: 'Correr', txt:'correr' }
  ],
  general_lugares: [
    { emoji: '🏠', label: 'Casa', txt:'a la casa' },
    { emoji: '🏥', label: 'Hospital', txt:'al hospital' },
    { emoji: '🛏️', label: 'Cama', txt:'a la cama' },
    { emoji: '🏫', label: 'Escuela', txt:'a la escuela' },
    { emoji: '🌳', label: 'Parque', txt:'al parque' },
    { emoji: '🚽', label: 'Baño', txt:'al baño' },
    { emoji: '🚪', label: 'Habitación', txt:'a la habitación' },
    { emoji: '🍳', label: 'Cocina', txt:'a la cocina' },
    { emoji: '🛋️', label: 'Sala', txt:'a la sala' },
    { emoji: '🍽️', label: 'Comedor', txt:'al comedor' },
    { emoji: '🏪', label: 'Tienda', txt:'a la tienda' },
    { emoji: '🛣️', label: 'Calle', txt:'a la calle' },
    { emoji: '🍿', label: 'Cine', txt:'al cine' },
    { emoji: '🍔', label: 'Restaurante', txt:'al restaurante' },
    { emoji: '🏊', label: 'Piscina', txt:'a la piscina' }
  ],
  general_personas: [
    { emoji: '👩', label: 'Mamá', txt:'mamá' },
    { emoji: '👨', label: 'Papá', txt:'papá' },
    { emoji: '👨‍⚕️', label: 'Doctor', txt:'el doctor' },
    { emoji: '🤝', label: 'Cuidador', txt:'mi cuidador' },
    { emoji: '👵', label: 'Abuela', txt:'la abuela' },
    { emoji: '👴', label: 'Abuelo', txt:'el abuelo' },
    { emoji: '👦', label: 'Amigo', txt:'mi amigo' },
    { emoji: '👨‍🏫', label: 'Maestro', txt:'el maestro' },
    { emoji: '👦', label: 'Hermano', txt:'mi hermano' },
    { emoji: '👧', label: 'Hermana', txt:'mi hermana' },
    { emoji: '🧑', label: 'Primo', txt:'mi primo' },
    { emoji: '👨', label: 'Tío', txt:'mi tío' },
    { emoji: '👶', label: 'Bebé', txt:'el bebé' },
    { emoji: '👮', label: 'Policía', txt:'el policía' },
    { emoji: '🚒', label: 'Bombero', txt:'el bombero' }
  ],
  general_comida: [
    { emoji: '🍽️', label: 'Comer', txt:'comer' },
    { emoji: '🥪', label: 'Sándwich', txt:'un sándwich' },
    { emoji: '🥛', label: 'Tomar', txt:'tomar algo' },
    { emoji: '🍎', label: 'Manzana', txt:'una manzana' },
    { emoji: '💧', label: 'Agua', txt:'agua' },
    { emoji: '🍪', label: 'Galleta', txt:'una galleta' },
    { emoji: '🧃', label: 'Jugo', txt:'un jugo' },
    { emoji: '🥛', label: 'Leche', txt:'leche' },
    { emoji: '🍞', label: 'Pan', txt:'pan' },
    { emoji: '🍚', label: 'Arroz', txt:'arroz' },
    { emoji: '🍗', label: 'Pollo', txt:'pollo' },
    { emoji: '🍲', label: 'Sopa', txt:'sopa' },
    { emoji: '🥩', label: 'Carne', txt:'carne' },
    { emoji: '🫘', label: 'Frijoles', txt:'frijoles' },
    { emoji: '🍌', label: 'Fruta', txt:'fruta' }
  ],

  // COLEGIO
  colegio_necesidades: [
    { emoji: '🚽', label: 'Baño', txt:'necesito ir al baño' },
    { emoji: '🤝', label: 'Ayuda', txt:'necesito ayuda con esto' },
    { emoji: '⚽', label: 'Recreo', txt:'quiero ir al recreo' },
    { emoji: '😮‍💨', label: 'Descansar', txt:'necesito descansar' },
    { emoji: '💧', label: 'Sed', txt:'tengo sed' },
    { emoji: '🍔', label: 'Hambre', txt:'tengo hambre' },
    { emoji: '✏️', label: 'Lápiz', txt:'necesito un lápiz' },
    { emoji: '📓', label: 'Cuaderno', txt:'mi cuaderno' },
    { emoji: '🧽', label: 'Borrador', txt:'un borrador' },
    { emoji: '🎒', label: 'Mochila', txt:'mi mochila' },
    { emoji: '🤫', label: 'Silencio', txt:'necesito silencio' },
    { emoji: '❓', label: 'Pregunta', txt:'tengo una pregunta' },
    { emoji: '🪑', label: 'Sentarse', txt:'quiero sentarme' },
    { emoji: '🧍', label: 'Pararse', txt:'quiero pararme' },
    { emoji: '🚪', label: 'Salir', txt:'quiero salir' }
  ],
  colegio_emociones: [
    { emoji: '😊', label: 'Feliz', txt:'estoy feliz en clase' },
    { emoji: '😢', label: 'Triste', txt:'estoy triste' },
    { emoji: '😡', label: 'Enojado', txt:'estoy enojado' },
    { emoji: '😑', label: 'Aburrido', txt:'estoy aburrido' },
    { emoji: '🥱', label: 'Cansado', txt:'estoy cansado' },
    { emoji: '🧐', label: 'Concentrado', txt:'estoy concentrado' },
    { emoji: '😵‍💫', label: 'Distraído', txt:'estoy distraído' },
    { emoji: '🤩', label: 'Emocionado', txt:'estoy emocionado' },
    { emoji: '😰', label: 'Nervioso', txt:'estoy nervioso' },
    { emoji: '😌', label: 'Orgulloso', txt:'estoy orgulloso' },
    { emoji: '😕', label: 'Confundido', txt:'estoy confundido' },
    { emoji: '😖', label: 'Frustrado', txt:'estoy frustrado' },
    { emoji: '😳', label: 'Avergonzado', txt:'estoy avergonzado' },
    { emoji: '😌', label: 'Tranquilo', txt:'estoy tranquilo' },
    { emoji: '😱', label: 'Asustado', txt:'estoy asustado' }
  ],
  colegio_acciones: [
    { emoji: '📖', label: 'Leer', txt:'leer un libro' },
    { emoji: '✍️', label: 'Escribir', txt:'escribir' },
    { emoji: '🎨', label: 'Dibujar', txt:'dibujar' },
    { emoji: '🧩', label: 'Jugar', txt:'jugar' },
    { emoji: '🪑', label: 'Sentarse', txt:'quiero sentarme' },
    { emoji: '🧍', label: 'Pararse', txt:'quiero pararme' },
    { emoji: '👂', label: 'Escuchar', txt:'escuchar' },
    { emoji: '🗣️', label: 'Hablar', txt:'hablar' },
    { emoji: '🖌️', label: 'Pintar', txt:'pintar' },
    { emoji: '✂️', label: 'Cortar', txt:'cortar' },
    { emoji: '📋', label: 'Pegar', txt:'pegar' },
    { emoji: '🎤', label: 'Cantar', txt:'cantar' },
    { emoji: '🏃', label: 'Correr', txt:'correr' },
    { emoji: '🙋', label: 'Preguntar', txt:'preguntar' },
    { emoji: '🎒', label: 'Guardar', txt:'guardar' }
  ],
  colegio_lugares: [
    { emoji: '🏫', label: 'Clase', txt:'a la clase' },
    { emoji: '🏞️', label: 'Patio', txt:'al patio' },
    { emoji: '🍽️', label: 'Comedor', txt:'al comedor' },
    { emoji: '🚽', label: 'Baño', txt:'al baño' },
    { emoji: '📚', label: 'Biblioteca', txt:'a la biblioteca' },
    { emoji: '🏀', label: 'Gimnasio', txt:'al gimnasio' },
    { emoji: '👩‍💼', label: 'Dirección', txt:'a la dirección' },
    { emoji: '🚑', label: 'Enfermería', txt:'a la enfermería' },
    { emoji: '🏢', label: 'Pasillo', txt:'al pasillo' },
    { emoji: '⬛', label: 'Pizarrón', txt:'al pizarrón' },
    { emoji: '🪑', label: 'Escritorio', txt:'en mi escritorio' },
    { emoji: '🚪', label: 'Puerta', txt:'a la puerta' },
    { emoji: '🪟', label: 'Ventana', txt:'a la ventana' },
    { emoji: '🗄️', label: 'Casillero', txt:'a mi casillero' },
    { emoji: '🌷', label: 'Jardín', txt:'al jardín' }
  ],
  colegio_personas: [
    { emoji: '👨‍🏫', label: 'Maestro', txt:'el maestro' },
    { emoji: '👦', label: 'Amigos', txt:'mis amigos' },
    { emoji: '🧑‍🤝‍🧑', label: 'Compañeros', txt:'mis compañeros' },
    { emoji: '👨‍💼', label: 'Director', txt:'el director' },
    { emoji: '🧹', label: 'Conserje', txt:'el conserje' },
    { emoji: '👩‍⚕️', label: 'Enfermera', txt:'la enfermera' },
    { emoji: '🧠', label: 'Psicólogo', txt:'el psicólogo' },
    { emoji: '⚽', label: 'Entrenador', txt:'el entrenador' },
    { emoji: '👩‍💻', label: 'Secretaria', txt:'la secretaria' },
    { emoji: '📚', label: 'Bibliotecario', txt:'el bibliotecario' },
    { emoji: '🧑‍🍳', label: 'Cocinero', txt:'el cocinero' },
    { emoji: '👮', label: 'Guardia', txt:'el guardia' },
    { emoji: '👪', label: 'Padres', txt:'mis padres' },
    { emoji: '🧑‍🎓', label: 'Alumno', txt:'un alumno' },
    { emoji: '🧑‍🏫', label: 'Tutor', txt:'mi tutor' }
  ],
  colegio_comida: [
    { emoji: '🍱', label: 'Lonchera', txt:'mi lonchera' },
    { emoji: '🧃', label: 'Jugo', txt:'mi jugo' },
    { emoji: '🍌', label: 'Fruta', txt:'fruta' },
    { emoji: '🍪', label: 'Galletas', txt:'galletas' },
    { emoji: '💧', label: 'Agua', txt:'agua' },
    { emoji: '🥪', label: 'Sándwich', txt:'un sándwich' },
    { emoji: '🥛', label: 'Leche', txt:'leche' },
    { emoji: '🍎', label: 'Manzana', txt:'manzana' },
    { emoji: '🍌', label: 'Plátano', txt:'plátano' },
    { emoji: '🥣', label: 'Cereal', txt:'cereal' },
    { emoji: '🍦', label: 'Yogur', txt:'yogur' },
    { emoji: '🍮', label: 'Gelatina', txt:'gelatina' },
    { emoji: '🍞', label: 'Pan', txt:'pan' },
    { emoji: '🧀', label: 'Queso', txt:'queso' },
    { emoji: '🍬', label: 'Dulce', txt:'un dulce' }
  ],

  // MEDICO
  medico_necesidades: [
    { emoji: '😣', label: 'Dolor', txt:'me duele' },
    { emoji: '👇', label: 'Aquí', txt:'me duele aquí' },
    { emoji: '😰', label: 'Miedo', txt:'tengo miedo' },
    { emoji: '🏃', label: 'Irme', txt:'quiero irme de aquí' },
    { emoji: '💊', label: 'Medicina', txt:'mi medicina' },
    { emoji: '💧', label: 'Agua', txt:'quiero agua' },
    { emoji: '🚽', label: 'Baño', txt:'necesito el baño' },
    { emoji: '🥶', label: 'Frío', txt:'tengo frío' },
    { emoji: '🥵', label: 'Calor', txt:'tengo calor' },
    { emoji: '🤝', label: 'Ayuda', txt:'necesito ayuda' },
    { emoji: '🫁', label: 'Respirar', txt:'necesito respirar' },
    { emoji: '🛋️', label: 'Descansar', txt:'quiero descansar' },
    { emoji: '🩹', label: 'Curita', txt:'necesito una curita' },
    { emoji: '🤕', label: 'Venda', txt:'necesito una venda' },
    { emoji: '💉', label: 'Inyección', txt:'la inyección' }
  ],
  medico_emociones: [
    { emoji: '😣', label: 'Dolor', txt:'siento dolor' },
    { emoji: '😰', label: 'Asustado', txt:'estoy asustado' },
    { emoji: '🦸', label: 'Valiente', txt:'soy valiente' },
    { emoji: '😢', label: 'Triste', txt:'estoy triste' },
    { emoji: '😬', label: 'Nervioso', txt:'estoy nervioso' },
    { emoji: '😭', label: 'Llorar', txt:'tengo ganas de llorar' },
    { emoji: '😊', label: 'Feliz', txt:'estoy feliz' },
    { emoji: '😌', label: 'Aliviado', txt:'estoy aliviado' },
    { emoji: '😟', label: 'Preocupado', txt:'estoy preocupado' },
    { emoji: '😡', label: 'Enojado', txt:'estoy enojado' },
    { emoji: '😵', label: 'Mareado', txt:'estoy mareado' },
    { emoji: '🥱', label: 'Cansado', txt:'estoy cansado' },
    { emoji: '😕', label: 'Confundido', txt:'estoy confundido' },
    { emoji: '😖', label: 'Incómodo', txt:'estoy incómodo' },
    { emoji: '😌', label: 'Tranquilo', txt:'estoy tranquilo' }
  ],
  medico_acciones: [
    { emoji: '🩺', label: 'Revisar', txt:'me están revisando' },
    { emoji: '🫁', label: 'Respirar', txt:'respira profundo' },
    { emoji: '🪑', label: 'Sentarse', txt:'me voy a sentar' },
    { emoji: '⏳', label: 'Esperar', txt:'toca esperar' },
    { emoji: '🛏️', label: 'Acostarse', txt:'me voy a acostar' },
    { emoji: '😮', label: 'Abrir boca', txt:'abrir la boca' },
    { emoji: '🤧', label: 'Toser', txt:'toser' },
    { emoji: '👂', label: 'Escuchar', txt:'escuchar' },
    { emoji: '👀', label: 'Mirar', txt:'mirar' },
    { emoji: '🚶', label: 'Caminar', txt:'caminar' },
    { emoji: '⚖️', label: 'Pesar', txt:'pesar' },
    { emoji: '📏', label: 'Medir', txt:'medir' },
    { emoji: '💉', label: 'Vacunar', txt:'vacunar' },
    { emoji: '🩸', label: 'Sangrar', txt:'estoy sangrando' },
    { emoji: '🩹', label: 'Curar', txt:'curar' }
  ],
  medico_lugares: [
    { emoji: '🏥', label: 'Consultorio', txt:'en el consultorio' },
    { emoji: '🪑', label: 'Espera', txt:'en la sala de espera' },
    { emoji: '🧪', label: 'Laboratorio', txt:'en el laboratorio' },
    { emoji: '🚽', label: 'Baño', txt:'al baño' },
    { emoji: '🏥', label: 'Hospital', txt:'al hospital' },
    { emoji: '💊', label: 'Farmacia', txt:'a la farmacia' },
    { emoji: '🏥', label: 'Clínica', txt:'a la clínica' },
    { emoji: '🛏️', label: 'Camilla', txt:'en la camilla' },
    { emoji: '⚖️', label: 'Báscula', txt:'en la báscula' },
    { emoji: '🛎️', label: 'Recepción', txt:'a recepción' },
    { emoji: '🏢', label: 'Pasillo', txt:'al pasillo' },
    { emoji: '🚑', label: 'Urgencias', txt:'a urgencias' },
    { emoji: '😷', label: 'Quirófano', txt:'al quirófano' },
    { emoji: '🚪', label: 'Habitación', txt:'a la habitación' },
    { emoji: '🛗', label: 'Ascensor', txt:'al ascensor' }
  ],
  medico_personas: [
    { emoji: '👨‍⚕️', label: 'Doctor', txt:'el doctor' },
    { emoji: '👩‍⚕️', label: 'Enfermera', txt:'la enfermera' },
    { emoji: '👨', label: 'Papá', txt:'papá' },
    { emoji: '👩', label: 'Mamá', txt:'mamá' },
    { emoji: '👶', label: 'Pediatra', txt:'el pediatra' },
    { emoji: '👩‍💼', label: 'Recepcionista', txt:'la recepcionista' },
    { emoji: '👨‍⚕️', label: 'Cirujano', txt:'el cirujano' },
    { emoji: '🦷', label: 'Dentista', txt:'el dentista' },
    { emoji: '🧠', label: 'Terapeuta', txt:'el terapeuta' },
    { emoji: '🚑', label: 'Paramédico', txt:'el paramédico' },
    { emoji: '👮', label: 'Guardia', txt:'el guardia' },
    { emoji: '🤒', label: 'Paciente', txt:'un paciente' },
    { emoji: '👪', label: 'Familiar', txt:'mi familiar' },
    { emoji: '👨‍🔬', label: 'Especialista', txt:'el especialista' },
    { emoji: '👨‍🔬', label: 'Farmacéutico', txt:'el farmacéutico' }
  ],
  medico_comida: [
    { emoji: '🍬', label: 'Dulce', txt:'quiero un dulce' },
    { emoji: '💧', label: 'Agua', txt:'quiero agua' },
    { emoji: '🧃', label: 'Jugo', txt:'quiero jugo' },
    { emoji: '🍮', label: 'Gelatina', txt:'quiero gelatina' },
    { emoji: '🍲', label: 'Sopa', txt:'quiero sopa' },
    { emoji: '💊', label: 'Pastilla', txt:'la pastilla' },
    { emoji: '🥄', label: 'Jarabe', txt:'el jarabe' },
    { emoji: '🍎', label: 'Manzana', txt:'una manzana' },
    { emoji: '🍪', label: 'Galleta', txt:'una galleta' },
    { emoji: '🍵', label: 'Té', txt:'un té' },
    { emoji: '🥔', label: 'Puré', txt:'puré' },
    { emoji: '🍦', label: 'Helado', txt:'helado' },
    { emoji: '🍶', label: 'Yogur', txt:'yogur' },
    { emoji: '🥛', label: 'Leche', txt:'leche' },
    { emoji: '🍞', label: 'Pan', txt:'pan' }
  ],

  // CASA
  casa_necesidades: [
    { emoji: '😴', label: 'Dormir', txt:'quiero ir a dormir' },
    { emoji: '📺', label: 'Tele', txt:'quiero ver televisión' },
    { emoji: '🛁', label: 'Bañarse', txt:'quiero bañarme' },
    { emoji: '🍽️', label: 'Comer', txt:'quiero comer' },
    { emoji: '🧸', label: 'Jugar', txt:'quiero jugar' },
    { emoji: '🤝', label: 'Ayuda', txt:'necesito ayuda' },
    { emoji: '🚽', label: 'Baño', txt:'al baño' },
    { emoji: '🥶', label: 'Frío', txt:'tengo frío' },
    { emoji: '🥵', label: 'Calor', txt:'tengo calor' },
    { emoji: '💧', label: 'Sed', txt:'tengo sed' },
    { emoji: '🍔', label: 'Hambre', txt:'tengo hambre' },
    { emoji: '🫂', label: 'Abrazar', txt:'quiero un abrazo' },
    { emoji: '🤫', label: 'Silencio', txt:'necesito silencio' },
    { emoji: '🚪', label: 'Salir', txt:'quiero salir' },
    { emoji: '🏠', label: 'Entrar', txt:'quiero entrar' }
  ],
  casa_emociones: [
    { emoji: '😌', label: 'Relajado', txt:'estoy relajado' },
    { emoji: '😊', label: 'Feliz', txt:'estoy feliz en casa' },
    { emoji: '🥱', label: 'Cansado', txt:'estoy cansado' },
    { emoji: '😑', label: 'Aburrido', txt:'estoy aburrido' },
    { emoji: '😡', label: 'Enojado', txt:'estoy enojado' },
    { emoji: '😢', label: 'Triste', txt:'estoy triste' },
    { emoji: '🤩', label: 'Emocionado', txt:'estoy emocionado' },
    { emoji: '🛡️', label: 'Seguro', txt:'me siento seguro' },
    { emoji: '🛋️', label: 'Cómodo', txt:'estoy cómodo' },
    { emoji: '😠', label: 'Molesto', txt:'estoy molesto' },
    { emoji: '🥰', label: 'Cariñoso', txt:'estoy cariñoso' },
    { emoji: '🤤', label: 'Hambriento', txt:'estoy hambriento' },
    { emoji: '😪', label: 'Somnoliento', txt:'tengo mucho sueño' },
    { emoji: '🏃', label: 'Activo', txt:'estoy activo' },
    { emoji: '🤒', label: 'Enfermo', txt:'me siento enfermo' }
  ],
  casa_acciones: [
    { emoji: '🧸', label: 'Jugar', txt:'vamos a jugar' },
    { emoji: '📺', label: 'Ver tele', txt:'vamos a ver tele' },
    { emoji: '🧹', label: 'Ayudar', txt:'quiero ayudar en casa' },
    { emoji: '🛋️', label: 'Descansar', txt:'voy a descansar' },
    { emoji: '😴', label: 'Dormir', txt:'voy a dormir' },
    { emoji: '🍽️', label: 'Comer', txt:'vamos a comer' },
    { emoji: '🍳', label: 'Cocinar', txt:'vamos a cocinar' },
    { emoji: '🧽', label: 'Limpiar', txt:'vamos a limpiar' },
    { emoji: '🛀', label: 'Bañar', txt:'me voy a bañar' },
    { emoji: '👕', label: 'Vestir', txt:'me voy a vestir' },
    { emoji: '📖', label: 'Leer', txt:'voy a leer' },
    { emoji: '🎧', label: 'Escuchar música', txt:'escuchar música' },
    { emoji: '💃', label: 'Bailar', txt:'vamos a bailar' },
    { emoji: '🎨', label: 'Dibujar', txt:'voy a dibujar' },
    { emoji: '📦', label: 'Ordenar', txt:'voy a ordenar' }
  ],
  casa_lugares: [
    { emoji: '🛋️', label: 'Sala', txt:'en la sala' },
    { emoji: '🛏️', label: 'Cuarto', txt:'en mi cuarto' },
    { emoji: '🍳', label: 'Cocina', txt:'en la cocina' },
    { emoji: '🛀', label: 'Baño', txt:'en el baño' },
    { emoji: '🍽️', label: 'Comedor', txt:'en el comedor' },
    { emoji: '🏞️', label: 'Patio', txt:'en el patio' },
    { emoji: '🌷', label: 'Jardín', txt:'en el jardín' },
    { emoji: '🚗', label: 'Cochera', txt:'en la cochera' },
    { emoji: '🏢', label: 'Balcón', txt:'en el balcón' },
    { emoji: '🚪', label: 'Pasillo', txt:'en el pasillo' },
    { emoji: '🚪', label: 'Puerta', txt:'en la puerta' },
    { emoji: '🪟', label: 'Ventana', txt:'en la ventana' },
    { emoji: '🪜', label: 'Escalera', txt:'en la escalera' },
    { emoji: '🛋️', label: 'Sofá', txt:'en el sofá' },
    { emoji: '🛏️', label: 'Cama', txt:'en la cama' }
  ],
  casa_personas: [
    { emoji: '👩', label: 'Mamá', txt:'mamá' },
    { emoji: '👨', label: 'Papá', txt:'papá' },
    { emoji: '👦', label: 'Hermano', txt:'mi hermano' },
    { emoji: '👧', label: 'Hermana', txt:'mi hermana' },
    { emoji: '🐶', label: 'Perro', txt:'el perro' },
    { emoji: '🐱', label: 'Gato', txt:'el gato' },
    { emoji: '👵', label: 'Abuela', txt:'la abuela' },
    { emoji: '👴', label: 'Abuelo', txt:'el abuelo' },
    { emoji: '👨', label: 'Tío', txt:'mi tío' },
    { emoji: '👩', label: 'Tía', txt:'mi tía' },
    { emoji: '🧑', label: 'Primo', txt:'mi primo' },
    { emoji: '👶', label: 'Bebé', txt:'el bebé' },
    { emoji: '👋', label: 'Vecino', txt:'el vecino' },
    { emoji: '🙋', label: 'Invitado', txt:'el invitado' },
    { emoji: '🐾', label: 'Mascota', txt:'la mascota' }
  ],
  casa_comida: [
    { emoji: '🍲', label: 'Cena', txt:'la cena' },
    { emoji: '🍳', label: 'Desayuno', txt:'el desayuno' },
    { emoji: '🍨', label: 'Postre', txt:'un postre' },
    { emoji: '🥛', label: 'Leche', txt:'un vaso de leche' },
    { emoji: '🍞', label: 'Pan', txt:'pan' },
    { emoji: '🍚', label: 'Arroz', txt:'arroz' },
    { emoji: '🍗', label: 'Pollo', txt:'pollo' },
    { emoji: '🥩', label: 'Carne', txt:'carne' },
    { emoji: '🥚', label: 'Huevos', txt:'huevos' },
    { emoji: '🍌', label: 'Fruta', txt:'fruta' },
    { emoji: '🥣', label: 'Cereal', txt:'cereal' },
    { emoji: '🧃', label: 'Jugo', txt:'jugo' },
    { emoji: '💧', label: 'Agua', txt:'agua' },
    { emoji: '🍪', label: 'Galletas', txt:'galletas' },
    { emoji: '🍦', label: 'Helado', txt:'helado' }
  ],

  // SALIDAS
  salidas_necesidades: [
    { emoji: '🚻', label: 'Baño', txt:'necesito un baño' },
    { emoji: '🥱', label: 'Cansado', txt:'estoy cansado' },
    { emoji: '🏠', label: 'Casa', txt:'quiero volver a casa' },
    { emoji: '💧', label: 'Sed', txt:'tengo sed' },
    { emoji: '🍔', label: 'Hambre', txt:'tengo hambre' },
    { emoji: '🤝', label: 'Ayuda', txt:'necesito ayuda' },
    { emoji: '😰', label: 'Miedo', txt:'tengo miedo' },
    { emoji: '😣', label: 'Dolor', txt:'tengo dolor' },
    { emoji: '🗺️', label: 'Perderse', txt:'estoy perdido' },
    { emoji: '💵', label: 'Dinero', txt:'necesito dinero' },
    { emoji: '📱', label: 'Celular', txt:'necesito el celular' },
    { emoji: '🧥', label: 'Abrigo', txt:'necesito abrigo' },
    { emoji: '🥵', label: 'Calor', txt:'tengo calor' },
    { emoji: '🚶', label: 'Caminar', txt:'quiero caminar' },
    { emoji: '🪑', label: 'Sentarse', txt:'quiero sentarme' }
  ],
  salidas_emociones: [
    { emoji: '🤩', label: 'Divertido', txt:'esto es muy divertido' },
    { emoji: '😆', label: 'Emocionado', txt:'estoy emocionado' },
    { emoji: '😩', label: 'Cansado', txt:'ya me cansé' },
    { emoji: '😱', label: 'Asustado', txt:'estoy asustado' },
    { emoji: '😊', label: 'Feliz', txt:'estoy feliz de salir' },
    { emoji: '😑', label: 'Aburrido', txt:'estoy aburrido' },
    { emoji: '😡', label: 'Enojado', txt:'estoy enojado' },
    { emoji: '😢', label: 'Triste', txt:'estoy triste' },
    { emoji: '😲', label: 'Sorprendido', txt:'estoy sorprendido' },
    { emoji: '🧐', label: 'Curioso', txt:'siento curiosidad' },
    { emoji: '😕', label: 'Confundido', txt:'estoy confundido' },
    { emoji: '😵', label: 'Mareado', txt:'estoy mareado' },
    { emoji: '😬', label: 'Ansioso', txt:'estoy ansioso' },
    { emoji: '😌', label: 'Cómodo', txt:'estoy cómodo' },
    { emoji: '😠', label: 'Molesto', txt:'estoy molesto' }
  ],
  salidas_acciones: [
    { emoji: '🚶', label: 'Caminar', txt:'vamos a caminar' },
    { emoji: '🛍️', label: 'Comprar', txt:'quiero comprar esto' },
    { emoji: '⬆️', label: 'Subir', txt:'vamos a subir' },
    { emoji: '⬇️', label: 'Bajar', txt:'vamos a bajar' },
    { emoji: '💳', label: 'Pagar', txt:'vamos a pagar' },
    { emoji: '👀', label: 'Mirar', txt:'vamos a mirar' },
    { emoji: '⏳', label: 'Esperar', txt:'hay que esperar' },
    { emoji: '🏃', label: 'Correr', txt:'vamos a correr' },
    { emoji: '🕹️', label: 'Jugar', txt:'vamos a jugar' },
    { emoji: '🍽️', label: 'Comer', txt:'vamos a comer' },
    { emoji: '🥤', label: 'Beber', txt:'vamos a beber algo' },
    { emoji: '🚗', label: 'Subir auto', txt:'subir al auto' },
    { emoji: '🚙', label: 'Bajar auto', txt:'bajar del auto' },
    { emoji: '🔍', label: 'Buscar', txt:'vamos a buscar' },
    { emoji: '🔙', label: 'Regresar', txt:'vamos a regresar' }
  ],
  salidas_lugares: [
    { emoji: '🏪', label: 'Tienda', txt:'a la tienda' },
    { emoji: '🎠', label: 'Parque', txt:'al parque de diversiones' },
    { emoji: '🍿', label: 'Cine', txt:'al cine' },
    { emoji: '🍔', label: 'Restaurante', txt:'al restaurante' },
    { emoji: '🛣️', label: 'Calle', txt:'a la calle' },
    { emoji: '🚗', label: 'Carro', txt:'al carro' },
    { emoji: '🚌', label: 'Bus', txt:'al bus' },
    { emoji: '🏢', label: 'Centro comercial', txt:'al centro comercial' },
    { emoji: '🛒', label: 'Supermercado', txt:'al supermercado' },
    { emoji: '🏊', label: 'Piscina', txt:'a la piscina' },
    { emoji: '🐘', label: 'Zoológico', txt:'al zoológico' },
    { emoji: '🏛️', label: 'Museo', txt:'al museo' },
    { emoji: '🏖️', label: 'Playa', txt:'a la playa' },
    { emoji: '⛪', label: 'Iglesia', txt:'a la iglesia' },
    { emoji: '🚻', label: 'Baño público', txt:'al baño público' }
  ],
  salidas_personas: [
    { emoji: '👩', label: 'Mamá', txt:'mamá' },
    { emoji: '👨', label: 'Papá', txt:'papá' },
    { emoji: '🧑‍🤝‍🧑', label: 'Gente', txt:'hay mucha gente' },
    { emoji: '👥', label: 'Amigos', txt:'con mis amigos' },
    { emoji: '🧑‍💼', label: 'Vendedor', txt:'el vendedor' },
    { emoji: '🧑‍💻', label: 'Cajero', txt:'el cajero' },
    { emoji: '🚕', label: 'Conductor', txt:'el conductor' },
    { emoji: '👮', label: 'Policía', txt:'el policía' },
    { emoji: '🤵', label: 'Mesero', txt:'el mesero' },
    { emoji: '💂', label: 'Guardia', txt:'el guardia' },
    { emoji: '👦', label: 'Niño', txt:'un niño' },
    { emoji: '👧', label: 'Niña', txt:'una niña' },
    { emoji: '👤', label: 'Desconocido', txt:'un desconocido' },
    { emoji: '👪', label: 'Familia', txt:'la familia' },
    { emoji: '🗺️', label: 'Guía', txt:'el guía' }
  ],
  salidas_comida: [
    { emoji: '🍦', label: 'Helado', txt:'quiero un helado' },
    { emoji: '🍕', label: 'Pizza', txt:'quiero pizza' },
    { emoji: '🍔', label: 'Hamburguesa', txt:'quiero hamburguesa' },
    { emoji: '🍟', label: 'Papas', txt:'quiero papas fritas' },
    { emoji: '🥤', label: 'Refresco', txt:'quiero un refresco' },
    { emoji: '🧃', label: 'Jugo', txt:'quiero jugo' },
    { emoji: '💧', label: 'Agua', txt:'quiero agua' },
    { emoji: '🍬', label: 'Dulces', txt:'quiero dulces' },
    { emoji: '🍿', label: 'Palomitas', txt:'quiero palomitas' },
    { emoji: '🌭', label: 'Hotdog', txt:'quiero un hot dog' },
    { emoji: '🌮', label: 'Tacos', txt:'quiero tacos' },
    { emoji: '🍌', label: 'Fruta', txt:'quiero fruta' },
    { emoji: '🍮', label: 'Postre', txt:'quiero postre' },
    { emoji: '🍪', label: 'Galletas', txt:'quiero galletas' },
    { emoji: '🍰', label: 'Pastel', txt:'quiero pastel' }
  ]
};

export default function PatientComunica() {
  const { user } = useAuth();
  const [ctx, setCtx] = useState('general');
  const [cat, setCat] = useState('necesidades');
  const [phrase, setPhrase] = useState([]);

  const addWord = (item) => {
    setPhrase(prev => [...prev, item]);
  };

  const removeLast = () => {
    setPhrase(prev => prev.slice(0, -1));
  };


  const reproduceAndSend = async () => {
    if (phrase.length === 0) return;
    const fullText = phrase.map(i => i.txt).join(' ');
    const emojiString = phrase.filter(i => !i.isTextOnly).map(i => i.emoji).join(' ');
    
    // Reproducir con síntesis de voz
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);

    try {
      // Guardar en el chatroom del paciente para que el cuidador lo vea en 'Mensajes'
      await addDoc(collection(db, 'chats', user.uid, 'messages'), {
        text: `${emojiString} ${fullText}`,
        senderId: user?.uid || 'anon',
        senderName: user?.displayName || 'Paciente',
        senderRole: 'patient',
        createdAt: serverTimestamp(),
        isAac: true
      });
      setPhrase([]);
    } catch(e) {
      console.error('Error al enviar pictograma:', e);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 160px)', display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, overflowY: 'auto' }}>
        <div style={{ marginBottom: 15, padding: '0 5px' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 8 }}>
            Toca una imagen para construir una frase
          </div>
          
          <div style={{ 
            display: 'flex', 
            background: 'var(--surface)', 
            border: '2px solid rgba(124,111,224,.3)',
            borderRadius: 24, padding: 8, alignItems: 'center', minHeight: 60, boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <button onClick={removeLast} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '50%', width: 40, height: 40, display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', color: 'var(--text)', flexShrink: 0 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
            </button>
            <div style={{ flex: 1, display: 'flex', gap: 8, overflowX: 'auto', padding: '0 10px', alignItems: 'center' }}>
              {phrase.map((p, idx) => (
                <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 50 }}>
                  <span style={{ fontSize: 20 }}>{p.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 'bold' }}>{p.label}</span>
                </div>
              ))}
            </div>
            <button onClick={reproduceAndSend} style={{ background: '#C7D2FE', color: '#4F46E5', border: 'none', borderRadius: 20, padding: '10px 16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> REPRODUCIR
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 15 }}>
          {CONTEXTS.map(c => (
            <button key={c.id} onClick={() => setCtx(c.id)} style={{ background: ctx === c.id ? '#3b82f6' : 'var(--surface)', color: ctx === c.id ? 'white' : 'var(--text)', border: `1px solid ${ctx === c.id ? '#3b82f6' : 'var(--border)'}`, borderRadius: 20, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', fontWeight: ctx === c.id ? 700 : 500, cursor: 'pointer' }}>
              <span style={{ fontSize: 16 }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 20 }}>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setCat(c.id)} style={{ background: cat === c.id ? c.color : 'var(--surface)', color: cat === c.id ? 'white' : 'var(--text)', border: `1px solid ${cat === c.id ? c.color : 'var(--border)'}`, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap', fontWeight: 700, cursor: 'pointer', boxShadow: cat === c.id ? `0 4px 10px ${c.color}66` : 'none', transform: cat === c.id ? 'scale(1.05)' : 'none', transition: 'all 0.2s' }}>
              <span style={{ fontSize: 20 }}>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>

        <div className="grid-3">
          {(VOCABULARY[`${ctx}_${cat}`] || VOCABULARY[`general_${cat}`] || []).map((v, idx) => (
            <button key={idx} className="big-btn" style={{ background: 'var(--surface)', border: '1px solid var(--border)', height: 100, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} onClick={() => addWord(v)}>
              <span className="em3d" style={{ fontSize: 36 }}>{v.emoji}</span>
              <span style={{ fontSize: 13, fontWeight: 700, marginTop: 8 }}>{v.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

