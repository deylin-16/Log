import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable from "react-moveable";
import { 
  Plus, Type, Image as ImageIcon, X, Trash2, 
  RotateCcw, Download, Palette, Layers, 
  Wand2, Sparkles, ArrowUp, ArrowDown
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { PAPERS } from './constants/papers';
import { BORDERS } from './constants/borders';
import { FONTS } from './constants/fonts';
import { EMOJI_LIBRARY } from './constants/emojis';
import { getMask } from './utils/masks';

export default function TitanStudioCanvas() {
  const [style, setStyle] = useState('classic');
  const [border, setBorder] = useState('none');
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [preview, setPreview] = useState(null);
  
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'Escribe algo...' : ''),
      transform: 'translate(50px, 100px) rotate(0deg) scale(1)',
      width: type === 'image' ? 180 : 'auto',
      size: type === 'text' ? 35 : 80,
      font: FONTS[0].family,
      color: '#1a1a1a',
      zIndex: elements.length + 1,
      mask: 'none',
      ...extra
    };
    setElements(prev => [...prev, newEl]);
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

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans select-none">
      
      <header className="p-4 flex justify-between items-center bg-black border-b border-white/5 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
            <Wand2 size={18} />
          </div>
          <h1 className="font-black text-base uppercase italic tracking-tighter">Titan Studio</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setElements([])} className="p-2 bg-white/5 rounded-lg active:scale-90 transition-transform"><RotateCcw size={16} /></button>
          <button onClick={async () => {
            setSelectedId(null);
            setTimeout(async () => {
              const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, skipFonts: false });
              setPreview(dataUrl);
            }, 300);
          }} className="bg-white text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-xl">Finalizar</button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[360px] aspect-[3/4] shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-500 overflow-hidden ${PAPERS[style]} ${BORDERS[border]}`}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              id={`el-${el.id}`}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={`absolute inline-block pointer-events-auto origin-center ${selectedId === el.id ? 'z-50' : ''}`}
              style={{ 
                transform: el.transform, 
                zIndex: el.zIndex,
                touchAction: 'none'
              }}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  suppressContentEditableWarning
                  onFocus={(e) => e.target.innerText === 'Escribe algo...' && (e.target.innerText = '')}
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText || 'Escribe algo...' })}
                  style={{ fontFamily: el.font, fontSize: el.size, color: el.color, outline: 'none' }}
                  className="p-2 whitespace-nowrap min-w-[20px]"
                >
                  {el.content}
                </div>
              ) : el.type === 'emoji' ? (
                <div style={{ fontSize: el.size }} className="p-2 select-none leading-none drop-shadow-md">{el.content}</div>
              ) : (
                <img src={el.content} style={{ width: el.width, clipPath: getMask(el.mask) }} className="block pointer-events-none select-none" />
              )}
            </div>
          ))}

          {selectedId && (
            <Moveable
              target={document.getElementById(`el-${selectedId}`)}
              draggable={true}
              scalable={true}
              rotatable={true}
              pinchable={["scalable", "rotatable"]}
              keepRatio={true}
              onDrag={({ target, transform }) => {
                target.style.transform = transform;
                updateEl(selectedId, { transform });
              }}
              onScale={({ target, transform }) => {
                target.style.transform = transform;
                updateEl(selectedId, { transform });
              }}
              onRotate={({ target, transform }) => {
                target.style.transform = transform;
                updateEl(selectedId, { transform });
              }}
              renderDirections={["nw", "ne", "sw", "se"]}
              origin={false}
              lineColor="#f97316"
              controlColor="#ffffff"
            />
          )}

          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/5 pointer-events-none">
              <Plus size={80} strokeWidth={1} />
              <p className="font-black text-[8px] uppercase tracking-[0.4em]">Tap to start</p>
            </div>
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[110] bg-black/60 p-2 rounded-2xl backdrop-blur-md border border-white/10">
            <button onClick={() => moveLayer(selectedId, 'up')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowUp size={18}/></button>
            <button onClick={() => moveLayer(selectedId, 'down')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowDown size={18}/></button>
            <button onClick={() => deleteEl(selectedId)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 size={18}/></button>
          </motion.div>
        )}
      </main>

      <div className="bg-black border-t border-white/5 pb-4">
        {selectedId && selectedEl?.type === 'text' && (
          <div className="px-6 py-4 flex gap-6 overflow-x-auto items-center bg-white/5 border-b border-white/5 no-scrollbar">
             <input type="color" value={selectedEl.color} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" />
             <select value={selectedEl.font} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-transparent text-[10px] uppercase font-black border border-white/10 rounded-lg px-3 py-1.5 outline-none">
                {FONTS.map(f => <option key={f.id} value={f.family} className="bg-black text-white">{f.name}</option>)}
             </select>
          </div>
        )}
        <nav className="p-6 grid grid-cols-5 gap-2">
          <ToolBtn icon={<Palette/>} label="Fondo" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers/>} label="Marco" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text')} />
          <ToolBtn icon={<Sparkles/>} label="Sticker" onClick={() => setActiveSheet('emojis')} />
          <ToolBtn icon={<ImageIcon/>} label="Foto" onClick={() => fileRef.current.click()} />
        </nav>
      </div>

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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[70vh] overflow-y-auto">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-8"/>
              
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 pb-12">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${PAPERS[p]} border-2 transition-all ${style === p ? 'border-orange-500 scale-95' : 'border-white/5 opacity-40'}`} />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 pb-12">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${border === b ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emojis' && (
                <div className="space-y-8 pb-12">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-[8px] font-black text-gray-600 uppercase mb-4 tracking-[0.3em]">{cat.category}</h4>
                      <div className="grid grid-cols-6 gap-3">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji)} className="text-4xl aspect-square flex items-center justify-center active:scale-125 transition-all">{emoji}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6 overflow-y-auto">
            <header className="w-full flex justify-between items-center mb-8">
              <button onClick={() => setPreview(null)} className="p-3 bg-white/5 rounded-full"><X/></button>
              <h2 className="font-black tracking-[0.3em] text-[9px] uppercase italic text-orange-500 text-center flex-1">Titan Engine Export</h2>
              <div className="w-10"/>
            </header>
            <div className="w-full max-w-[320px] aspect-[3/4] bg-[#111] rounded-[30px] overflow-hidden shadow-2xl mb-12">
              <img src={preview} className="w-full h-full object-contain" />
            </div>
            <button onClick={() => { const a = document.createElement('a'); a.download = `TitanStudio_${Date.now()}.png`; a.href = preview; a.click(); }} className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
              Guardar Galería
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2.5 active:scale-90 transition-all group">
      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[7px] font-black uppercase text-gray-600">{label}</span>
    </button>
  );
}
