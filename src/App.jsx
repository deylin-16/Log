import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Type, Image as ImageIcon, X, Trash2, 
  RotateCcw, Download, Palette, Layers, 
  Wand2, Sparkles, ArrowUp, ArrowDown, RotateCw
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { PAPERS } from './constants/papers';
import { BORDERS } from './constants/borders';
import { FONTS } from './constants/fonts';
import { EMOJI_LIBRARY } from './constants/emojis';
import { getMask } from './utils/masks';

export default function TitanStudioPro() {
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
      x: 50,
      y: 100,
      size: type === 'image' ? 150 : 40,
      rotate: 0,
      opacity: 1,
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

  const handleExport = async () => {
    setSelectedId(null);
    setTimeout(async () => {
      try {
        if (canvasRef.current) {
          const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, skipFonts: false });
          setPreview(dataUrl);
        }
      } catch (err) { console.error(err); }
    }, 400);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans select-none">
      
      <header className="p-4 flex justify-between items-center bg-black/90 border-b border-white/5 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Wand2 size={18} />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tighter uppercase italic leading-none">Titan Studio</h1>
            <span className="text-[6px] text-gray-500 font-bold tracking-[0.4em] uppercase">Deylin Engine Pro</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setElements([])} className="p-2 bg-white/5 rounded-lg active:scale-90 transition-transform"><RotateCcw size={16} /></button>
          <button onClick={handleExport} className="bg-orange-600 text-white px-4 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-orange-600/20">Finalizar</button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[360px] aspect-[3/4] shadow-[0_40px_80px_rgba(0,0,0,0.7)] transition-all duration-500 overflow-hidden ${PAPERS[style]} ${BORDERS[border]}`}
        >
          <AnimatePresence>
            {elements.map((el) => (
              <motion.div
                key={el.id}
                drag
                dragMomentum={false}
                onDrag={(e, info) => updateEl(el.id, { x: el.x + info.delta.x, y: el.y + info.delta.y })}
                onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
                className={`absolute cursor-move ${selectedId === el.id ? 'z-50' : ''}`}
                style={{ 
                  left: el.x, 
                  top: el.y, 
                  rotate: el.rotate, 
                  zIndex: el.zIndex,
                  touchAction: 'none' 
                }}
              >
                {selectedId === el.id && (
                  <div className="absolute -inset-4 border-2 border-orange-500/50 rounded-xl pointer-events-none">
                    <div className="absolute -top-1 -left-1 w-2 h-2 bg-white rounded-full shadow-lg" />
                    <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white rounded-full shadow-lg" />
                  </div>
                )}

                {el.type === 'text' ? (
                  <div 
                    contentEditable 
                    suppressContentEditableWarning
                    onFocus={(e) => {
                      if(e.target.innerText === 'Escribe algo...') e.target.innerText = '';
                    }}
                    onBlur={(e) => {
                      const val = e.target.innerText.trim();
                      updateEl(el.id, { content: val === '' ? 'Escribe algo...' : val });
                    }}
                    style={{ 
                      fontFamily: el.font, 
                      fontSize: el.size, 
                      color: el.color, 
                      minWidth: '40px', 
                      outline: 'none',
                      backgroundColor: selectedId === el.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                      borderRadius: '8px'
                    }}
                    className="p-2 font-medium whitespace-pre-wrap leading-tight text-center transition-colors"
                  >
                    {el.content}
                  </div>
                ) : el.type === 'emoji' ? (
                  <div style={{ fontSize: el.size }} className="select-none p-2 leading-none drop-shadow-xl">
                    {el.content}
                  </div>
                ) : (
                  <img 
                    src={el.content} 
                    style={{ width: el.size, filter: el.filter, clipPath: getMask(el.mask) }} 
                    className="block pointer-events-none select-none" 
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/[0.03] pointer-events-none">
              <Plus size={100} strokeWidth={1} />
              <p className="font-black text-[8px] uppercase tracking-[0.6em]">Titan Canvas Empty</p>
            </div>
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 bg-black/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 z-[110] shadow-2xl">
            <button onClick={() => updateEl(selectedId, { rotate: (selectedEl.rotate || 0) + 15 })} className="p-2.5 bg-white/5 hover:bg-orange-500 rounded-xl transition-colors"><RotateCw size={18}/></button>
            <button onClick={() => moveLayer(selectedId, 'up')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><ArrowUp size={18}/></button>
            <button onClick={() => moveLayer(selectedId, 'down')} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors"><ArrowDown size={18}/></button>
            <div className="h-px bg-white/10 mx-1" />
            <button onClick={() => deleteEl(selectedId)} className="p-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={18}/></button>
          </motion.div>
        )}
      </main>

      <div className="bg-black/95 border-t border-white/5 backdrop-blur-2xl">
        {selectedId && (
          <div className="px-6 py-4 flex gap-6 overflow-x-auto no-scrollbar items-center border-b border-white/5 animate-in slide-in-from-bottom-2">
            <div className="flex flex-col gap-1 shrink-0">
              <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest text-center">Tamaño</span>
              <input type="range" min="15" max="500" value={selectedEl.size} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-28 accent-orange-500" />
            </div>

            {selectedEl.type === 'text' && (
              <>
                <div className="flex flex-col gap-1 items-center shrink-0">
                  <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">Color</span>
                  <input type="color" value={selectedEl.color} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-6 h-6 rounded-full bg-transparent border-none cursor-pointer scale-125" />
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest">Fuente</span>
                  <select value={selectedEl.font} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-white/5 text-[9px] uppercase font-bold border border-white/10 rounded-lg px-2 py-1 outline-none">
                    {FONTS.map(f => <option key={f.id} value={f.family} className="bg-black text-white">{f.name}</option>)}
                  </select>
                </div>
              </>
            )}

            {selectedEl.type === 'image' && (
              <div className="flex flex-col gap-1 shrink-0">
                <span className="text-[7px] font-black uppercase text-gray-500 tracking-widest mb-1">Forma de Recorte</span>
                <div className="flex gap-1.5">
                  {['none', 'circle', 'heart', 'star'].map(m => (
                    <button key={m} onClick={() => updateEl(selectedId, { mask: m })} className={`px-2 py-1 rounded-md text-[7px] font-black uppercase transition-all ${selectedEl.mask === m ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105' : 'bg-white/5 text-gray-500'}`}>{m}</button>
                  ))}
                </div>
              </div>
            )}
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-md"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[70vh] overflow-y-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-8"/>
              
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 pb-12">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${PAPERS[p]} border-2 transition-all ${style === p ? 'border-orange-500 scale-95' : 'border-white/5 opacity-40 hover:opacity-100'}`} />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 pb-12">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 ${border === b ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emojis' && (
                <div className="space-y-8 pb-12">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-[8px] font-black text-gray-600 uppercase mb-5 tracking-[0.4em] px-2">{cat.category}</h4>
                      <div className="grid grid-cols-6 gap-3">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji)} className="text-4xl aspect-square flex items-center justify-center active:scale-150 transition-all hover:brightness-125">{emoji}</button>
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
            <header className="w-full flex justify-between items-center mb-10">
              <button onClick={() => setPreview(null)} className="p-3 bg-white/5 rounded-full"><X/></button>
              <h2 className="font-black tracking-[0.3em] text-[9px] uppercase italic text-orange-500">Titan Engine Export</h2>
              <div className="w-10"/>
            </header>
            <div className="w-full max-w-[320px] aspect-[3/4] bg-[#0a0a0a] rounded-[30px] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/5 mb-12">
              <img src={preview} className="w-full h-full object-contain" alt="Deylin Titan" />
            </div>
            <button onClick={() => { const a = document.createElement('a'); a.download = `Titan_${Date.now()}.png`; a.href = preview; a.click(); }} className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-white/10">
              Guardar en Galería
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
      <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-white group-hover:bg-orange-600/20 group-hover:border group-hover:border-orange-500/40 transition-all duration-300 shadow-sm">
        {React.cloneElement(icon, { size: 20 })}
      </div>
      <span className="text-[7px] font-black uppercase tracking-[0.1em] text-gray-600 group-hover:text-gray-300">{label}</span>
    </button>
  );
}
