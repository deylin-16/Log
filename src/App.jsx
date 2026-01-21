import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Heart, Plus, Type, Image as ImageIcon, X, Trash2, 
  RotateCcw, Star, Square, Circle, Download, Palette, Layers, 
  Wand2, Settings, Scissors, Brush, Sparkles, Send, Share2, 
  Instagram, MessageCircle, Move, Copy, ArrowUp, ArrowDown
} from 'lucide-react';
import { toPng } from 'html-to-image';

export default function TitanStudioPro() {
  const [style, setStyle] = useState('classic');
  const [border, setBorder] = useState('none');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content,
      x: 50,
      y: 100,
      size: type === 'text' ? 40 : 150,
      rotate: 0,
      opacity: 1,
      filter: 'none',
      font: "'Playfair Display', serif",
      color: '#1a1a1a',
      zIndex: elements.length + 1,
      mask: 'none',
      ...extra
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  const updateEl = (id, props) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
  };

  const deleteEl = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  const moveLayer = (id, direction) => {
    const idx = elements.findIndex(el => el.id === id);
    if (idx === -1) return;
    const newElements = [...elements];
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx >= 0 && targetIdx < newElements.length) {
      [newElements[idx], newElements[targetIdx]] = [newElements[targetIdx], newElements[idx]];
      setElements(newElements);
    }
  };

  const handleExport = async () => {
    setSelectedId(null);
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, skipFonts: false });
        setPreview(dataUrl);
      } catch (err) {
        console.error(err);
      } finally {
        setIsExporting(false);
      }
    }, 400);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#080808] text-white flex flex-col overflow-hidden font-sans">
      
      <header className="p-4 flex justify-between items-center bg-black/80 backdrop-blur-xl border-b border-white/5 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
            <Wand2 size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter uppercase italic leading-none">Titan Studio</h1>
            <span className="text-[7px] text-orange-500 font-bold tracking-[0.3em]">DEYLIN ENGINE V6</span>
          </div>
        </div>
        <div className="flex gap-2">
          {elements.length > 0 && (
            <button onClick={() => setElements([])} className="p-2.5 bg-white/5 rounded-xl hover:bg-red-500/20 transition-colors">
              <RotateCcw size={18} />
            </button>
          )}
          <button onClick={handleExport} className="bg-white text-black px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            Exportar
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[380px] aspect-[3/4] shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-500 overflow-hidden
            ${getPaperStyle(style)} ${getBorderStyle(border)}
          `}
        >
          <AnimatePresence>
            {elements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => updateEl(el.id, { x: el.x + info.delta.x, y: el.y + info.delta.y })}
                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                className={`absolute cursor-grab active:cursor-grabbing ${selectedId === el.id ? 'z-50' : ''}`}
                style={{ left: el.x, top: el.y, rotate: el.rotate, width: el.type === 'text' ? 'auto' : el.size, opacity: el.opacity }}
              >
                {selectedId === el.id && (
                  <div className="absolute -inset-3 border-2 border-orange-500 rounded-lg pointer-events-none">
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full border-2 border-orange-500" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full border-2 border-orange-500" />
                  </div>
                )}

                {el.type === 'text' ? (
                  <div 
                    contentEditable 
                    suppressContentEditableWarning
                    onBlur={(e) => updateEl(el.id, { content: e.target.innerText })}
                    style={{ fontFamily: el.font, fontSize: el.size, color: el.color }}
                    className="outline-none min-w-[50px] whitespace-nowrap p-2 font-medium"
                  >
                    {el.content}
                  </div>
                ) : (
                  <img 
                    src={el.content} 
                    className="w-full h-auto block select-none" 
                    style={{ filter: el.filter, clipPath: getMask(el.mask) }}
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/10 pointer-events-none">
              <Plus size={80} strokeWidth={1} />
              <p className="font-black text-sm uppercase tracking-widest">Lienzo Vacío</p>
            </div>
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ x: 100 }} animate={{ x: 0 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <button onClick={() => moveLayer(selectedId, 'up')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowUp size={20}/></button>
            <button onClick={() => moveLayer(selectedId, 'down')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowDown size={20}/></button>
            <button onClick={() => deleteEl(selectedId)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </main>

      {selectedId && selectedEl?.type === 'text' && (
        <div className="bg-black/90 border-t border-white/10 p-4 flex gap-4 overflow-x-auto no-scrollbar">
          <input type="color" value={selectedEl.color} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer" />
          <input type="range" min="10" max="200" value={selectedEl.size} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-32" />
          <select onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 text-xs">
            {["serif", "sans-serif", "Caveat", "Dancing Script", "Bebas Neue"].map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
      )}

      {selectedId && selectedEl?.type === 'image' && (
        <div className="bg-black/90 border-t border-white/10 p-4 flex gap-6 overflow-x-auto">
          <div className="flex gap-2">
            {['none', 'circle', 'heart', 'star'].map(m => (
              <button key={m} onClick={() => updateEl(selectedId, { mask: m })} className="px-4 py-2 bg-white/5 rounded-lg text-[10px] uppercase font-bold">{m}</button>
            ))}
          </div>
          <input type="range" min="50" max="400" value={selectedEl.size} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-32" />
        </div>
      )}

      <nav className="p-6 grid grid-cols-5 gap-4 bg-black border-t border-white/5 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        <ToolBtn icon={<Palette/>} label="Papel" onClick={() => setActiveSheet('papers')} />
        <ToolBtn icon={<Square/>} label="Marcos" onClick={() => setActiveSheet('borders')} />
        <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text', 'Nuevo Texto')} />
        <ToolBtn icon={<Sparkles/>} label="Stickers" onClick={() => setActiveSheet('emojis')} />
        <ToolBtn icon={<ImageIcon/>} label="Fotos" onClick={() => fileRef.current.click()} />
      </nav>

      <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (f) => addElement('image', f.target.result);
          reader.readAsDataURL(file);
        }
      }} />

      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/60 z-[120] backdrop-blur-sm"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#111] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[60vh] overflow-y-auto">
              <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mb-8"/>
              
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4">
                  {['classic', 'notebook', 'ancient', 'dark', 'carbon', 'pink-love'].map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${getPaperStyle(p)} border-2 ${style === p ? 'border-orange-500' : 'border-white/5'}`} />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3">
                  {['none', 'gold', 'neon', 'retro', 'glitch', 'royal'].map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className="p-4 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest">{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emojis' && (
                <div className="grid grid-cols-5 gap-6 text-3xl">
                  {['✨','❤️','🔥','👑','🦋','⭐','🌙','📸','🖤','🌈','🍒','🚀','🎮','💎','🧿'].map((e, i) => (
                    <button key={i} onClick={() => addElement('emoji', e)} className="hover:scale-125 transition-transform">{e}</button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6">
            <div className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setPreview(null)} className="p-3 bg-white/10 rounded-full"><X/></button>
              <h2 className="font-black tracking-widest text-xs">VISTA PREVIA</h2>
              <div className="w-10"/>
            </div>
            <img src={preview} className="w-full max-w-sm aspect-[3/4] object-contain bg-[#111] rounded-[30px] shadow-2xl mb-8" />
            <div className="w-full max-w-sm grid grid-cols-1 gap-4">
              <button onClick={() => { const a = document.createElement('a'); a.download = 'TitanStudio.png'; a.href = preview; a.click(); }} className="py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3">
                <Download size={20}/> GUARDAR EN GALERÍA
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const getPaperStyle = (s) => {
  const styles = {
    'classic': 'bg-white',
    'notebook': 'bg-[#f0f0f0] bg-[linear-gradient(transparent_95%,_#abced4_95%)] bg-[length:100%_30px]',
    'ancient': 'bg-[#d2b48c] [box-shadow:inset_0_0_100px_rgba(0,0,0,0.2)]',
    'dark': 'bg-[#1a1a1a]',
    'carbon': 'bg-[#0a0a0a] bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]',
    'pink-love': 'bg-[#ffe5ec]'
  };
  return styles[s] || styles.classic;
};

const getBorderStyle = (b) => {
  const borders = {
    'gold': 'border-[12px] border-double border-[#d4af37]',
    'neon': 'border-[3px] border-cyan-400 shadow-[0_0_20px_cyan]',
    'retro': 'border-[10px] border-double border-red-800',
    'glitch': 'border-[4px] border-red-500 shadow-[4px_0_#00fffb,-4px_0_#ff00f0]',
    'royal': 'border-[15px] border-solid border-[#4b0082] ring-4 ring-yellow-500'
  };
  return borders[b] || 'border-none';
};

const getMask = (m) => {
  if (m === 'circle') return 'circle(50%)';
  if (m === 'heart') return 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
  if (m === 'star') return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
  return 'none';
};

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
      <div className="p-4 bg-white/5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all">{icon}</div>
      <span className="text-[8px] font-black uppercase tracking-tighter text-gray-500">{label}</span>
    </button>
  );
}
