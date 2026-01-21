import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Plus, Book, Download, Type, Image as ImageIcon, X } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  const [style, setStyle] = useState('notebook');
  const [font, setFont] = useState("'Poppins', sans-serif");
  const [elements, setElements] = useState([]);
  const [activeSheet, setActiveSheet] = useState(null); // 'emoji', 'image', 'font', 'paper'
  const canvasRef = useRef(null);

  const addElement = (type, content = '') => {
    setElements([...elements, { id: Date.now(), type, content, x: 100, y: 150, size: 80 }]);
    setActiveSheet(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => addElement('image', f.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white flex flex-col items-center py-4 px-4 overflow-hidden">
      
      {/* Título Pro */}
      <h1 className="text-orange-500 font-bold tracking-tighter text-xl mb-6">DEYLIN STUDIO PRO</h1>

      {/* CANVAS */}
      <div 
        ref={canvasRef}
        className={`relative w-full max-w-sm aspect-[3/4] shadow-2xl overflow-hidden transition-all duration-500
          ${style === 'burn' ? 'borde-quemado' : ''}
          ${style === 'notebook' ? 'bg-notebook border border-blue-100' : ''}
          ${style === 'crumped' ? 'bg-crumped shadow-inner' : ''}
        `}
      >
        <div contentEditable spellCheck="false" style={{ fontFamily: font }} className="absolute inset-0 p-10 text-black text-2xl outline-none z-10">
          Escribe tu mensaje...
        </div>

        {elements.map((el) => (
          <motion.div key={el.id} drag dragMomentum={false} className="absolute z-20 cursor-move" style={{ width: el.size }}>
            {el.type === 'image' ? <img src={el.content} className="rounded-lg shadow-lg" /> :
             el.type === 'emoji' ? <span className="text-5xl">{el.content}</span> :
             el.type === 'heart' ? <Heart size={el.size} fill="red" color="red" /> : null}
          </motion.div>
        ))}
      </div>

      {/* TOOLBAR CUADRADO */}
      <div className="fixed bottom-6 w-full max-w-sm bg-[#1a1a1a] rounded-2xl p-4 grid grid-cols-5 gap-1 border border-white/10 shadow-2xl">
        <ToolBtn icon={<Flame/>} label="Papel" onClick={() => setActiveSheet('paper')} color="text-orange-500" />
        <ToolBtn icon={<Type/>} label="Letra" onClick={() => setActiveSheet('font')} color="text-blue-400" />
        <ToolBtn icon={<Plus/>} label="Emoji" onClick={() => setActiveSheet('emoji')} color="text-yellow-500" />
        <ToolBtn icon={<ImageIcon/>} label="Foto" onClick={() => setActiveSheet('image')} color="text-purple-500" />
        <ToolBtn icon={<Download/>} label="Listo" onClick={() => toPng(canvasRef.current).then(url => {
          const a = document.createElement('a'); a.download = 'design.png'; a.href = url; a.click();
        })} color="text-green-500" />
      </div>

      {/* PESTAÑAS (BOTTOM SHEETS) */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/60 z-40" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 w-full bg-[#1e1e1e] rounded-t-[32px] p-6 z-50 max-h-[60vh] overflow-y-auto border-t border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold capitalize">{activeSheet}</h3>
                <button onClick={() => setActiveSheet(null)} className="p-2 bg-white/5 rounded-full"><X size={20}/></button>
              </div>

              {activeSheet === 'emoji' && (
                <div className="grid grid-cols-5 gap-4 text-3xl text-center">
                  {['✨','❤️','🔥','⭐','🌸','👑','🎈','🌈','⚡','🦋'].map(e => (
                    <button key={e} onClick={() => addElement('emoji', e)} className="p-2 hover:bg-white/5 rounded-xl">{e}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'font' && (
                <div className="flex flex-col gap-3">
                  {['Playfair Display', 'Caveat', 'Dancing Script', 'Special Elite', 'Great Vibes'].map(f => (
                    <button key={f} onClick={() => { setFont(f); setActiveSheet(null); }} className="w-full p-4 bg-white/5 rounded-xl text-left" style={{ fontFamily: f }}>{f}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'image' && (
                <div className="flex flex-col items-center py-10 border-2 border-dashed border-white/10 rounded-2xl">
                  <input type="file" id="up" hidden onChange={handleFileUpload} />
                  <button onClick={() => document.getElementById('up').click()} className="bg-purple-600 px-6 py-3 rounded-full font-bold">Subir desde Galería</button>
                </div>
              )}

              {activeSheet === 'paper' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setStyle('notebook')} className="p-4 bg-white/5 rounded-xl border border-white/10">Libreta Clásica</button>
                  <button onClick={() => setStyle('burn')} className="p-4 bg-white/5 rounded-xl border border-white/10">Papel Quemado</button>
                  <button onClick={() => setStyle('crumped')} className="p-4 bg-white/5 rounded-xl border border-white/10">Papel Arrugado</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 ${color}`}>
      <div className="p-3 bg-white/5 rounded-xl mb-1">{icon}</div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </button>
  );
}
