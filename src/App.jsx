import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      size: type === 'text' ? 35 : 120,
      rotate: 0,
      opacity: 1,
      filter: 'none',
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
    setIsExporting(true);
    setTimeout(async () => {
      try {
        if (canvasRef.current) {
          const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3 });
          setPreview(dataUrl);
        }
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
            <button onClick={() => setElements([])} className="p-2.5 bg-white/5 rounded-xl">
              <RotateCcw size={18} />
            </button>
          )}
          <button onClick={handleExport} className="bg-white text-black px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
            Finalizar
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[#111]">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[380px] aspect-[3/4] shadow-2xl transition-all duration-500 overflow-hidden
            ${PAPERS[style]} ${BORDERS[border]}
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
                  <div className="absolute -inset-3 border-2 border-orange-500 rounded-lg pointer-events-none animate-pulse" />
                )}

                {el.type === 'text' ? (
                  <div 
                    contentEditable 
                    suppressContentEditableWarning
                    onFocus={(e) => { if(e.target.innerText === 'Escribe algo...') e.target.innerText = ''; }}
                    onBlur={(e) => {
                      const val = e.target.innerText.trim();
                      updateEl(el.id, { content: val === '' ? 'Escribe algo...' : val });
                    }}
                    style={{ fontFamily: el.font, fontSize: el.size, color: el.color }}
                    className="outline-none min-w-[50px] whitespace-nowrap p-2 font-medium"
                  >
                    {el.content}
                  </div>
                ) : (
                  <div className="text-center" style={{ fontSize: el.size }}>
                    {el.content.startsWith('data:image') ? (
                      <img src={el.content} className="w-full h-auto block" style={{ filter: el.filter, clipPath: getMask(el.mask) }} />
                    ) : (
                      <span className="block select-none">{el.content}</span>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/5 pointer-events-none">
              <Plus size={80} strokeWidth={1} />
              <p className="font-black text-sm uppercase tracking-widest">Lienzo en blanco</p>
            </div>
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-black/60 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <button onClick={() => moveLayer(selectedId, 'up')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowUp size={20}/></button>
            <button onClick={() => moveLayer(selectedId, 'down')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowDown size={20}/></button>
            <button onClick={() => deleteEl(selectedId)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </main>

      <div className="bg-black/90 border-t border-white/10">
        {selectedId && selectedEl?.type === 'text' && (
          <div className="p-4 flex gap-4 overflow-x-auto no-scrollbar items-center border-b border-white/5">
            <input type="color" value={selectedEl.color} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-8 h-8 rounded-full overflow-hidden bg-transparent border-none cursor-pointer" />
            <select value={selectedEl.font} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-[10px] uppercase">
              {FONTS.map(f => <option key={f.id} value={f.family}>{f.name}</option>)}
            </select>
            <input type="range" min="10" max="150" value={selectedEl.size} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-24 accent-orange-500" />
          </div>
        )}

        <nav className="p-6 grid grid-cols-5 gap-4 shadow-2xl">
          <ToolBtn icon={<Palette/>} label="Fondo" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers/>} label="Marco" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text', 'Escribe algo...')} />
          <ToolBtn icon={<Sparkles/>} label="Stickers" onClick={() => setActiveSheet('emojis')} />
          <ToolBtn icon={<ImageIcon/>} label="Fotos" onClick={() => fileRef.current.click()} />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/60 z-[120] backdrop-blur-sm"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed bottom-0 left-0 w-full bg-[#111] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[60vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8"/>
              
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 pb-8">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${PAPERS[p]} border-2 ${style === p ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-white/5 opacity-50'}`} />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 pb-8">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${border === b ? 'bg-orange-500 text-black' : 'bg-white/5 text-white/50'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emojis' && (
                <div className="space-y-6 pb-10">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-[0.2em]">{cat.category}</h4>
                      <div className="grid grid-cols-6 gap-4">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji)} className="text-3xl active:scale-150 transition-transform">{emoji}</button>
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6">
            <div className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setPreview(null)} className="p-3 bg-white/10 rounded-full"><X/></button>
              <h2 className="font-black tracking-widest text-xs italic">DISEÑO LISTO</h2>
              <div className="w-10"/>
            </div>
            <img src={preview} className="w-full max-w-sm aspect-[3/4] object-contain bg-[#111] rounded-[30px] shadow-2xl mb-8" />
            <button onClick={() => { const a = document.createElement('a'); a.download = 'TitanStudio.png'; a.href = preview; a.click(); }} className="w-full max-w-sm py-5 bg-orange-600 text-white rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Download size={20}/> GUARDAR RESULTADO
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-all group">
      <div className="p-4 bg-white/5 rounded-2xl text-white/40 group-hover:text-orange-500 group-hover:bg-white/10 transition-all border border-transparent group-hover:border-orange-500/30">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[8px] font-black uppercase tracking-tighter text-gray-600 group-hover:text-white">{label}</span>
    </button>
  );
}
