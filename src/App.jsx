import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Flame, Book, StickyNote, Download, Type, Image as ImageIcon, Heart, Star, Plus } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  const [style, setStyle] = useState('notebook');
  const [font, setFont] = useState("'Poppins', sans-serif");
  const [elements, setElements] = useState([]); // Aquí guardamos fotos, emojis y formas
  const canvasRef = useRef(null);

  const addElement = (type, content = '') => {
    const newEl = {
      id: Date.now(),
      type,
      content,
      x: 50, y: 50, size: 100, rotate: 0
    };
    setElements([...elements, newEl]);
  };

  const exportImage = () => {
    toPng(canvasRef.current, { quality: 1, pixelRatio: 3 }).then((url) => {
      const link = document.createElement('a');
      link.download = 'deylin-pro-design.png';
      link.href = url;
      link.click();
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex flex-col items-center py-6 px-4 overflow-hidden">
      {/* Selector de Tipografía */}
      <div className="flex gap-2 mb-4 overflow-x-auto w-full max-w-sm p-2">
        {['Playfair Display', 'Caveat', 'Dancing Script', 'Special Elite'].map(f => (
          <button 
            key={f} 
            onClick={() => setFont(f)}
            className="px-3 py-1 bg-white/10 rounded-md text-[10px] whitespace-nowrap border border-white/5"
            style={{ fontFamily: f }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* CANVAS PRINCIPAL */}
      <div 
        ref={canvasRef}
        id="canvas"
        className={`relative w-full max-w-sm aspect-[3/4] shadow-2xl transition-all duration-500 overflow-hidden
          ${style === 'burn' ? 'borde-quemado' : ''}
          ${style === 'notebook' ? 'bg-notebook border border-blue-100' : ''}
          ${style === 'crumped' ? 'bg-crumped shadow-inner' : ''}
        `}
      >
        {/* Texto Base del Usuario */}
        <div 
          contentEditable 
          spellCheck="false"
          style={{ fontFamily: font }}
          className="absolute inset-0 p-10 text-black text-2xl outline-none z-10"
        >
          Escribe tu mensaje...
        </div>

        {/* Elementos Flotantes (Imágenes, Formas, Emojis) */}
        {elements.map((el) => (
          <motion.div
            key={el.id}
            drag
            dragMomentum={false}
            className="absolute z-20 cursor-move"
            style={{ x: el.x, y: el.y, width: el.size }}
          >
            {el.type === 'heart' && <Heart size={el.size} fill="red" color="red" className="drop-shadow-lg" />}
            {el.type === 'star' && <Star size={el.size} fill="gold" color="orange" className="drop-shadow-lg" />}
            {el.type === 'emoji' && <span style={{ fontSize: el.size / 2 }}>{el.content}</span>}
          </motion.div>
        ))}
      </div>

      {/* TOOLBAR CUADRADO PRO */}
      <div className="fixed bottom-6 w-[90%] max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl p-4 shadow-2xl">
        <div className="grid grid-cols-5 gap-2">
          <button onClick={() => setStyle('burn')} className="flex flex-col items-center gap-1 text-[10px] text-orange-500">
            <div className="p-2 bg-orange-500/10 rounded-lg"><Flame size={20}/></div>Papel
          </button>
          <button onClick={() => addElement('heart')} className="flex flex-col items-center gap-1 text-[10px] text-pink-500">
            <div className="p-2 bg-pink-500/10 rounded-lg"><Heart size={20}/></div>Amor
          </button>
          <button onClick={() => addElement('emoji', '✨')} className="flex flex-col items-center gap-1 text-[10px] text-yellow-500">
            <div className="p-2 bg-yellow-500/10 rounded-lg"><Plus size={20}/></div>Emoji
          </button>
          <button onClick={() => setStyle('notebook')} className="flex flex-col items-center gap-1 text-[10px] text-blue-500">
            <div className="p-2 bg-blue-500/10 rounded-lg"><Book size={20}/></div>Libreta
          </button>
          <button onClick={exportImage} className="flex flex-col items-center gap-1 text-[10px] text-green-500">
            <div className="p-2 bg-green-500/10 rounded-lg"><Download size={20}/></div>Listo
          </button>
        </div>
      </div>
    </div>
  );
}
