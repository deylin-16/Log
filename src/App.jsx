import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Type, Image as ImageIcon, X, Trash2, 
  RotateCcw, Download, Palette, Layers, 
  Wand2, Sparkles, ArrowUp, ArrowDown, Maximize2
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
          const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3 });
          setPreview(dataUrl);
        }
      } catch (err) { console.error(err); }
    }, 400);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#080808] text-white flex flex-col overflow-hidden font-sans">
      
      <header className="p-4 flex justify-between items-center bg-black border-b border-white/5 z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-yellow-500 rounded-xl flex items-center justify-center">
            <Wand2 size={20} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter uppercase italic leading-none">Titan Studio</h1>
            <span className="text-[7px] text-orange-500 font-bold tracking-[0.3em]">DEYLIN ENGINE V6</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setElements([])} className="p-2.5 bg-white/5 rounded-xl"><RotateCcw size={18} /></button>
          <button onClick={handleExport} className="bg-white text-black px-5 py-2 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">Finalizar</button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[#111] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[380px] aspect-[3/4] shadow-2xl transition-all duration-500 overflow-hidden ${PAPERS[style]} ${BORDERS[border]}`}
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
                style={{ left: el.x, top: el.y, rotate: el.rotate, zIndex: el.zIndex }}
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
                    onInput={(e) => { el.content = e.target.innerText; }}
                    onFocus={(e) => { if(e.target.innerText === 'Escribe algo...') e.target.innerText = ''; }}
                    onBlur={(e) => {
                      const val = e.target.innerText.trim();
                      updateEl(el.id, { content: val === '' ? 'Escribe algo...' : val });
                    }}
                    style={{ fontFamily: el.font, fontSize: el.size, color: el.color, minWidth: '50px', outline: 'none' }}
                    className="whitespace-nowrap p-2 font-medium"
                  >
                    {el.content}
                  </div>
                ) : el.type === 'emoji' ? (
                  <div style={{ fontSize: el.size }} className="select-none p-2 leading-none">
                    {el.content}
                  </div>
                ) : (
                  <img 
                    src={el.content} 
                    style={{ width: el.size, filter: el.filter, clipPath: getMask(el.mask) }} 
                    className="block pointer-events-none" 
                  />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {elements.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-black/5 pointer-events-none">
              <Plus size={80} strokeWidth={1} />
              <p className="font-black text-[10px] uppercase tracking-[0.4em]">Lienzo Vacío</p>
            </div>
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 bg-black/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 z-[110]">
            <button onClick={() => moveLayer(selectedId, 'up')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowUp size={20}/></button>
            <button onClick={() => moveLayer(selectedId, 'down')} className="p-2 hover:bg-white/10 rounded-lg"><ArrowDown size={20}/></button>
            <button onClick={() => deleteEl(selectedId)} className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </main>

      <div className="bg-black border-t border-white/5">
        {selectedId && (
          <div className="p-4 flex gap-6 overflow-x-auto no-scrollbar items-center bg-white/5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Maximize2 size={14} className="text-gray-500" />
              <input type="range" min="10" max="400" value={selectedEl.size} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-32 accent-orange-500" />
            </div>
            {selectedEl.type === 'text' && (
              <>
                <input type="color" value={selectedEl.color} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer" />
                <select value={selectedEl.font} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-transparent text-[10px] uppercase font-bold border border-white/10 rounded-lg px-2 py-1">
                  {FONTS.map(f => <option key={f.id} value={f.family} className="bg-black text-white">{f.name}</option>)}
                </select>
              </>
            )}
            {selectedEl.type === 'image' && (
              <div className="flex gap-2">
                {['none', 'circle', 'heart', 'star'].map(m => (
                  <button key={m} onClick={() => updateEl(selectedId, { mask: m })} className={`px-3 py-1 rounded-md text-[8px] uppercase font-black ${selectedEl.mask === m ? 'bg-orange-500' : 'bg-white/10'}`}>{m}</button>
                ))}
              </div>
            )}
          </div>
        )}

        <nav className="p-6 grid grid-cols-5 gap-2">
          <ToolBtn icon={<Palette/>} label="Fondo" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers/>} label="Marco" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text')} />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[65vh] overflow-y-auto shadow-2xl">
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8"/>
              
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 pb-10">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${PAPERS[p]} border-2 ${style === p ? 'border-orange-500 shadow-lg' : 'border-white/5 opacity-40'}`} />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 pb-10">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest ${border === b ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'emojis' && (
                <div className="space-y-8 pb-10">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-[9px] font-black text-gray-600 uppercase mb-4 tracking-[0.3em]">{cat.category}</h4>
                      <div className="grid grid-cols-6 gap-4">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji)} className="text-3xl active:scale-150 transition-all">{emoji}</button>
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
            <header className="w-full flex justify-between items-center mb-6">
              <button onClick={() => setPreview(null)} className="p-3 bg-white/10 rounded-full"><X/></button>
              <h2 className="font-black tracking-widest text-[10px] uppercase italic text-orange-500">Resultado Final</h2>
              <div className="w-10"/>
            </header>
            <div className="w-full max-w-sm aspect-[3/4] bg-[#111] rounded-[30px] overflow-hidden shadow-2xl mb-8">
              <img src={preview} className="w-full h-full object-contain" />
            </div>
            <button onClick={() => { const a = document.createElement('a'); a.download = 'DeylinStudio.png'; a.href = preview; a.click(); }} className="w-full max-w-sm py-5 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest active:scale-95 transition-all">
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
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-all group">
      <div className="p-4 bg-white/5 rounded-2xl text-white/40 group-hover:text-white group-hover:bg-orange-500 transition-all">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[8px] font-bold uppercase tracking-tighter text-gray-600">{label}</span>
    </button>
  );
}
