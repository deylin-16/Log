import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart, Plus, Book, Download, Type, Image as ImageIcon, X, Trash2, Maximize, Minimize, RotateCcw, Star, Square, Circle } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  const [style, setStyle] = useState('notebook');
  const [border, setBorder] = useState('none');
  const [font, setFont] = useState("'Poppins', sans-serif");
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const canvasRef = useRef(null);

  const addElement = (type, content = '') => {
    const newEl = {
      id: Date.now(),
      type,
      content,
      x: 0,
      y: 0,
      size: 120,
      rotate: 0,
      mask: 'none'
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  const updateElement = (id, props) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...props } : el));
  };

  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (f) => addElement('image', f.target.result);
      reader.readAsDataURL(file);
    }
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col items-center py-4 px-4 overflow-hidden font-sans">
      <h1 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 font-black tracking-tighter text-2xl mb-4">DEYLIN STUDIO PRO</h1>

      <div 
        ref={canvasRef}
        onClick={() => setSelectedId(null)}
        className={`relative w-full max-w-sm aspect-[3/4] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-700
          ${style === 'burn' ? 'borde-quemado bg-[#f4e4bc]' : ''}
          ${style === 'notebook' ? 'bg-notebook border border-blue-100' : ''}
          ${style === 'crumped' ? 'bg-crumped' : ''}
          ${style === 'vintage' ? 'bg-[#eaddca] sepia-[0.3]' : ''}
          ${border === 'gold' ? 'border-[12px] border-double border-yellow-600' : ''}
          ${border === 'dash' ? 'border-[4px] border-dashed border-gray-400' : ''}
          ${border === 'neon' ? 'border-[2px] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : ''}
        `}
      >
        <div 
          contentEditable 
          spellCheck="false" 
          style={{ fontFamily: font }} 
          className="absolute inset-0 p-10 text-black text-2xl outline-none z-10 leading-relaxed drop-shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          Escribe tu mensaje...
        </div>

        {elements.map((el) => (
          <motion.div 
            key={el.id} 
            drag 
            dragMomentum={false}
            onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
            className={`absolute z-20 cursor-move ${selectedId === el.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}`}
            style={{ x: el.x, y: el.y, width: el.size, rotate: el.rotate }}
            onDragEnd={(_, info) => updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y })}
          >
            {el.type === 'image' && (
              <img 
                src={el.content} 
                className="w-full h-full object-cover shadow-xl transition-all duration-300" 
                style={{ clipPath: el.mask === 'heart' ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' : 
                                   el.mask === 'circle' ? 'circle(50%)' : 
                                   el.mask === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none',
                         transform: 'scale(1.5)' }} 
              />
            )}
            {el.type === 'emoji' && <span className="block text-center select-none" style={{ fontSize: el.size }}>{el.content}</span>}
            {el.type === 'shape' && (
              el.content === 'heart' ? <Heart size={el.size} fill="red" color="transparent" /> :
              el.content === 'star' ? <Star size={el.size} fill="gold" color="transparent" /> : null
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-32 flex gap-2 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/20 z-[60]">
            <button onClick={() => updateElement(selectedId, { size: selectedEl.size + 20 })} className="p-2 bg-white/10 rounded-lg"><Maximize size={18}/></button>
            <button onClick={() => updateElement(selectedId, { size: Math.max(20, selectedEl.size - 20) })} className="p-2 bg-white/10 rounded-lg"><Minimize size={18}/></button>
            <button onClick={() => updateElement(selectedId, { rotate: selectedEl.rotate + 15 })} className="p-2 bg-white/10 rounded-lg"><RotateCcw size={18}/></button>
            {selectedEl.type === 'image' && (
              <>
                <button onClick={() => updateElement(selectedId, { mask: 'heart' })} className="p-2 bg-pink-500/20 rounded-lg text-pink-500"><Heart size={18}/></button>
                <button onClick={() => updateElement(selectedId, { mask: 'circle' })} className="p-2 bg-blue-500/20 rounded-lg text-blue-500"><Circle size={18}/></button>
                <button onClick={() => updateElement(selectedId, { mask: 'star' })} className="p-2 bg-yellow-500/20 rounded-lg text-yellow-500"><Star size={18}/></button>
              </>
            )}
            <button onClick={() => deleteElement(selectedId)} className="p-2 bg-red-500/20 rounded-lg text-red-500"><Trash2 size={18}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 w-full max-w-sm bg-[#121212] rounded-3xl p-4 grid grid-cols-5 gap-1 border border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)] z-50">
        <ToolBtn icon={<Flame/>} label="Página" onClick={() => setActiveSheet('paper')} color="text-orange-500" />
        <ToolBtn icon={<Type/>} label="Letra" onClick={() => setActiveSheet('font')} color="text-blue-400" />
        <ToolBtn icon={<Plus/>} label="Emoji" onClick={() => setActiveSheet('emoji')} color="text-yellow-500" />
        <ToolBtn icon={<ImageIcon/>} label="Foto" onClick={() => setActiveSheet('image')} color="text-purple-500" />
        <ToolBtn icon={<Download/>} label="Listo" onClick={() => {
          setSelectedId(null);
          setTimeout(() => {
            toPng(canvasRef.current, { pixelRatio: 3 }).then(url => {
              const a = document.createElement('a'); a.download = 'deylin-design.png'; a.href = url; a.click();
            });
          }, 100);
        }} color="text-green-500" />
      </div>

      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[70]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} className="fixed bottom-0 left-0 w-full bg-[#181818] rounded-t-[40px] p-8 z-[80] border-t border-white/10 shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-6" />
              
              {activeSheet === 'paper' && (
                <div className="space-y-8">
                  <section>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Estilo de Fondo</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <PreviewCard label="Libreta" active={style === 'notebook'} onClick={() => setStyle('notebook')} className="bg-notebook border border-blue-100" />
                      <PreviewCard label="Quemado" active={style === 'burn'} onClick={() => setStyle('burn')} className="borde-quemado bg-[#f4e4bc]" />
                      <PreviewCard label="Arrugado" active={style === 'crumped'} onClick={() => setStyle('crumped')} className="bg-crumped" />
                      <PreviewCard label="Vintage" active={style === 'vintage'} onClick={() => setStyle('vintage')} className="bg-[#eaddca]" />
                    </div>
                  </section>
                  <section>
                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Bordes Especiales</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={() => setBorder('none')} className={`p-3 rounded-xl border ${border === 'none' ? 'border-orange-500 bg-orange-500/10' : 'border-white/5'}`}>Ninguno</button>
                      <button onClick={() => setBorder('gold')} className={`p-3 rounded-xl border ${border === 'gold' ? 'border-yellow-500 bg-yellow-500/10' : 'border-white/5'}`}>Oro</button>
                      <button onClick={() => setBorder('neon')} className={`p-3 rounded-xl border ${border === 'neon' ? 'border-cyan-400 bg-cyan-400/10' : 'border-white/5'}`}>Neon</button>
                    </div>
                  </section>
                </div>
              )}

              {activeSheet === 'font' && (
                <div className="grid grid-cols-1 gap-3">
                  {['Playfair Display', 'Caveat', 'Dancing Script', 'Special Elite', 'Great Vibes', 'Indie Flower'].map(f => (
                    <button key={f} onClick={() => { setFont(f); setActiveSheet(null); }} className={`w-full p-5 rounded-2xl text-left text-xl border ${font === f ? 'border-blue-500 bg-blue-500/10' : 'border-white/5'}`} style={{ fontFamily: f }}>{f}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emoji' && (
                <div className="grid grid-cols-4 gap-6 text-5xl p-4 place-items-center">
                  {['✨','❤️','🔥','👑','🦋','💎','🌹','☁️','🧸','⭐','🌙','🍭','🍒','🎀','🍓','🧿'].map(e => (
                    <button key={e} onClick={() => addElement('emoji', e)} className="active:scale-125 transition-transform">{e}</button>
                  ))}
                  <button onClick={() => addElement('shape', 'heart')} className="p-4 bg-red-500/20 rounded-2xl"><Heart fill="red" color="red" /></button>
                  <button onClick={() => addElement('shape', 'star')} className="p-4 bg-yellow-500/20 rounded-2xl"><Star fill="gold" color="gold" /></button>
                </div>
              )}

              {activeSheet === 'image' && (
                <div className="flex flex-col gap-4">
                   <div className="w-full h-48 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/5 group active:bg-white/10 transition-colors">
                    <input type="file" id="file" hidden onChange={handleFileUpload} />
                    <button onClick={() => document.getElementById('file').click()} className="bg-gradient-to-r from-purple-600 to-blue-600 px-10 py-4 rounded-full font-black text-lg shadow-lg active:scale-95 transition-all">ABRIR GALERÍA</button>
                    <p className="text-gray-500 text-sm">Sube fotos y recórtalas pro</p>
                  </div>
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
    <button onClick={onClick} className={`flex flex-col items-center gap-1 active:scale-90 transition-transform ${color}`}>
      <div className="p-4 bg-white/5 rounded-2xl mb-1 shadow-inner">{icon}</div>
      <span className="text-[11px] font-bold tracking-tighter opacity-70">{label}</span>
    </button>
  );
}

function PreviewCard({ label, active, onClick, className }) {
  return (
    <div onClick={onClick} className={`relative aspect-square rounded-2xl cursor-pointer overflow-hidden border-2 transition-all ${active ? 'border-orange-500 scale-95' : 'border-transparent opacity-60'}`}>
      <div className={`w-full h-full ${className}`} />
      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
        <span className="text-white font-bold text-xs bg-black/60 px-2 py-1 rounded">{label}</span>
      </div>
    </div>
  );
}
