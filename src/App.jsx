import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable from "react-moveable";
import { 
  Type, Image as ImageIcon, X, Trash2, RotateCcw, Palette, Layers, Wand2, Sparkles,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline,
  Square, Circle, Star, FlipHorizontal, FlipVertical, Droplet, Highlighter,
  Paintbrush, Eraser, Scissors, Copy, Scissors as Cut, Sparkles as Magic,
  Smile, Heart, Star as StarIcon, Zap, Sun, Moon, Cloud, Flame
} from 'lucide-react';
import { toPng } from 'html-to-image';
import debounce from 'lodash-es/debounce';

import { PAPERS } from './constants/papers';
import { BORDERS } from './constants/borders';
import { FONTS } from './constants/fonts';
import { EMOJI_LIBRARY } from './constants/emojis';
import { getMask } from './utils/masks';
import { SHAPES } from './constants/shapes';

export default function TitanStudioCanvas() {
  const [style, setStyle] = useState('classic');
  const [border, setBorder] = useState('none');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [preview, setPreview] = useState(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('titanCanvasState', JSON.stringify({ elements, style, border, backgroundColor }));
    }, 4000);
    return () => clearInterval(saveInterval);
  }, [elements, style, border, backgroundColor]);

  useEffect(() => {
    const savedState = localStorage.getItem('titanCanvasState');
    if (savedState) {
      const { elements: savedElements, style: savedStyle, border: savedBorder, backgroundColor: savedBg } = JSON.parse(savedState);
      setElements(savedElements || []);
      setStyle(savedStyle || 'classic');
      setBorder(savedBorder || 'none');
      setBackgroundColor(savedBg || '#ffffff');
    }
  }, []);

  const pushToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  const selectElement = (id) => {
    setSelectedId(id);
    setElements(prev => {
      const maxZ = Math.max(...prev.map(el => el.zIndex || 0), 0);
      return prev.map(el => el.id === id ? { ...el, zIndex: maxZ + 1 } : el);
    });
  };

  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'Toca para editar' : ''),
      transform: 'translate(60px, 120px) rotate(0deg) scale(1)',
      width: type === 'image' || type === 'shape' ? 200 : 'auto',
      height: type === 'shape' ? 200 : 'auto',
      size: type === 'text' ? 42 : 90,
      font: FONTS[0].family,
      color: '#111111',
      bgColor: 'transparent',
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      align: 'left',
      opacity: 1,
      shadow: 'none',
      glow: 'none',
      letterSpacing: 0,
      lineHeight: 1.2,
      flipX: false,
      flipY: false,
      zIndex: elements.length + 1,
      mask: 'none',
      fill: type === 'shape' ? '#ff3366' : undefined,
      ...extra
    };
    const newElements = [...elements, newEl];
    setElements(newElements);
    pushToHistory(newElements);
    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  const updateEl = debounce((id, props) => {
    const newElements = elements.map(el => el.id === id ? { ...el, ...props } : el);
    setElements(newElements);
    pushToHistory(newElements);
  }, 80);

  const deleteEl = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    pushToHistory(newElements);
    if (selectedId === id) setSelectedId(null);
  };

  const duplicateEl = (id) => {
    const el = elements.find(e => e.id === id);
    if (!el) return;
    const copy = {
      ...el,
      id: Date.now().toString(),
      transform: el.transform.replace(/translate\([^)]+\)/, 'translate(80px, 140px)'),
      zIndex: elements.length + 1
    };
    const newElements = [...elements, copy];
    setElements(newElements);
    pushToHistory(newElements);
    setSelectedId(copy.id);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-[#0a0015] to-[#1a0033] text-white flex flex-col overflow-hidden font-sans select-none">

      <header className="p-4 flex justify-between items-center bg-black/80 border-b border-purple-500/20 backdrop-blur-xl z-[100]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/40">
            <Sparkles size={20} />
          </div>
          <h1 className="font-black text-xl uppercase italic tracking-tighter bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">TITAN STUDIO</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2.5 bg-white/10 rounded-xl active:scale-95 transition disabled:opacity-40"><Undo2 size={18} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2.5 bg-white/10 rounded-xl active:scale-95 transition disabled:opacity-40"><Redo2 size={18} /></button>
          <button onClick={() => { setElements([]); setHistory([]); setHistoryIndex(-1); }} className="p-2.5 bg-white/10 rounded-xl active:scale-95 transition"><RotateCcw size={18} /></button>
          <button onClick={async () => {
            setSelectedId(null);
            await new Promise(r => setTimeout(r, 180));
            const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3.2, quality: 0.98 });
            setPreview(dataUrl);
          }} className="bg-gradient-to-r from-pink-500 to-purple-600 px-5 py-2 rounded-xl font-black text-sm uppercase tracking-wider shadow-lg shadow-purple-500/50 active:scale-95 transition">EXPORTAR</button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-5 bg-gradient-to-b from-[#0f001a] to-[#1a0033] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[380px] aspect-[9/16] rounded-3xl shadow-2xl transition-all duration-600 overflow-hidden border-2 border-white/5 ${PAPERS[style]} ${BORDERS[border]}`}
          style={{ backgroundColor: style === 'custom' ? backgroundColor : undefined }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              id={`el-${el.id}`}
              onClick={(e) => { e.stopPropagation(); selectElement(el.id); }}
              className={`absolute inline-block pointer-events-auto`}
              style={{ 
                transform: `${el.transform} ${el.flipX ? 'scaleX(-1)' : ''} ${el.flipY ? 'scaleY(-1)' : ''}`, 
                zIndex: el.zIndex,
                opacity: el.opacity,
                touchAction: 'auto',
                boxShadow: el.shadow,
                filter: el.glow,
                userSelect: el.type === 'text' ? 'text' : 'none'
              }}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  inputMode="text"
                  onFocus={(e) => { if (e.target.innerText === 'Toca para editar') e.target.innerText = ''; }}
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText.trim() || 'Toca para editar' })}
                  style={{ 
                    fontFamily: el.font, 
                    fontSize: `${el.size}px`, 
                    color: el.color, 
                    backgroundColor: el.bgColor,
                    outline: 'none',
                    fontWeight: el.bold ? '900' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    textDecoration: `${el.underline ? 'underline' : ''} ${el.strikethrough ? 'line-through' : ''}`,
                    textAlign: el.align,
                    minWidth: '60px',
                    minHeight: '40px',
                    padding: '10px 14px',
                    cursor: 'text',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    touchAction: 'auto',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    letterSpacing: `${el.letterSpacing}px`,
                    lineHeight: el.lineHeight
                  }}
                  className="inline-block rounded-xl transition-all duration-200 focus:ring-2 focus:ring-purple-400/60 focus:bg-white/5"
                >
                  {el.content}
                </div>
              ) : el.type === 'emoji' ? (
                <div style={{ fontSize: el.size, color: el.color }} className="p-3 select-none leading-none drop-shadow-2xl text-center">{el.content}</div>
              ) : el.type === 'shape' ? (
                <svg width={el.width} height={el.height} viewBox="0 0 100 100" style={{ fill: el.fill, opacity: el.opacity }}>
                  {SHAPES[el.content]({})}
                </svg>
              ) : (
                <img 
                  src={el.content} 
                  style={{ 
                    width: el.width, 
                    clipPath: getMask(el.mask),
                    filter: el.filter || 'none',
                    opacity: el.opacity
                  }} 
                  className="block pointer-events-none select-none rounded-xl" 
                />
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
              keepRatio={selectedEl?.type !== 'text'}
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
              renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
              origin={false}
              lineColor="#c084fc"
              controlColor="#ffffff"
              controlBorderColor="#a855f7"
            />
          )}
        </div>

        {selectedId && (
          <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-5 top-1/2 -translate-y-1/2 flex flex-col gap-3.5 z-[110]">
            <button onClick={() => deleteEl(selectedId)} className="p-3.5 bg-gradient-to-br from-red-600 to-rose-700 rounded-2xl shadow-2xl text-white active:scale-90 transition"><Trash2 size={22}/></button>
            <button onClick={() => duplicateEl(selectedId)} className="p-3.5 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-2xl text-white active:scale-90 transition"><Copy size={22}/></button>
            <button onClick={() => updateEl(selectedId, { flipX: !selectedEl.flipX })} className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl text-white active:scale-90 transition"><FlipHorizontal size={22}/></button>
            <button onClick={() => updateEl(selectedId, { flipY: !selectedEl.flipY })} className="p-3.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-2xl text-white active:scale-90 transition"><FlipVertical size={22}/></button>
          </motion.div>
        )}
      </main>

      <div className="bg-gradient-to-t from-black/95 to-transparent border-t border-purple-500/20 pb-5 backdrop-blur-2xl">
        {selectedId && (
          <div className="px-5 py-4 flex gap-3 overflow-x-auto items-center bg-black/40 border-b border-purple-500/10 no-scrollbar">
            {selectedEl?.type === 'text' && (
              <>
                <button onClick={() => updateEl(selectedId, { bold: !selectedEl.bold })} className={`p-2.5 ${selectedEl.bold ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><Bold size={18}/></button>
                <button onClick={() => updateEl(selectedId, { italic: !selectedEl.italic })} className={`p-2.5 ${selectedEl.italic ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><Italic size={18}/></button>
                <button onClick={() => updateEl(selectedId, { underline: !selectedEl.underline })} className={`p-2.5 ${selectedEl.underline ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><Underline size={18}/></button>
                <button onClick={() => updateEl(selectedId, { strikethrough: !selectedEl.strikethrough })} className={`p-2.5 ${selectedEl.strikethrough ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><span className="line-through">S</span></button>
                <button onClick={() => updateEl(selectedId, { align: 'left' })} className={`p-2.5 ${selectedEl.align === 'left' ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><AlignLeft size={18}/></button>
                <button onClick={() => updateEl(selectedId, { align: 'center' })} className={`p-2.5 ${selectedEl.align === 'center' ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><AlignCenter size={18}/></button>
                <button onClick={() => updateEl(selectedId, { align: 'right' })} className={`p-2.5 ${selectedEl.align === 'right' ? 'bg-purple-600' : 'bg-white/10'} rounded-xl`}><AlignRight size={18}/></button>
              </>
            )}

            <div className="relative">
              <button onClick={() => setColorPickerOpen(!colorPickerOpen)} className="p-2.5 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg">
                <Droplet size={18} />
              </button>
              {colorPickerOpen && (
                <div className="absolute bottom-full left-0 mb-3 bg-black/90 border border-purple-500/30 rounded-2xl p-4 shadow-2xl z-[200] flex flex-col gap-3 min-w-[220px]">
                  <div className="flex gap-3">
                    <input type="color" value={selectedEl?.color || '#ffffff'} onChange={(e) => updateEl(selectedId, { color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer" />
                    <input type="color" value={selectedEl?.bgColor || 'transparent'} onChange={(e) => updateEl(selectedId, { bgColor: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {['#ffffff','#ff3366','#00d4ff','#ffdd00','#00ff9d','#c084fc','#ff6bcb','#8b5cf6','#10b981','#ef4444','#f59e0b','#6366f1'].map(c => (
                      <button key={c} onClick={() => updateEl(selectedId, { color: c })} className="w-8 h-8 rounded-full shadow-md" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <input type="range" min="8" max="120" step="1" value={selectedEl?.size ?? 42} onChange={(e) => updateEl(selectedId, { size: parseInt(e.target.value) })} className="w-28" />
            <input type="range" min="0.5" max="2" step="0.05" value={selectedEl?.lineHeight ?? 1.2} onChange={(e) => updateEl(selectedId, { lineHeight: parseFloat(e.target.value) })} className="w-20" title="Espaciado líneas" />
            <input type="range" min="-2" max="8" step="0.1" value={selectedEl?.letterSpacing ?? 0} onChange={(e) => updateEl(selectedId, { letterSpacing: parseFloat(e.target.value) })} className="w-20" title="Espaciado letras" />

            <select onChange={(e) => updateEl(selectedId, { shadow: e.target.value })} className="bg-white/10 text-xs font-black rounded-xl px-3 py-2 outline-none min-w-[110px]">
              <option value="none">Sombra</option>
              <option value="0 4px 12px rgba(0,0,0,0.4)">Suave</option>
              <option value="0 8px 24px rgba(0,0,0,0.5)">Media</option>
              <option value="0 12px 40px rgba(139,92,246,0.6)">Neón</option>
            </select>

            <select onChange={(e) => updateEl(selectedId, { glow: e.target.value })} className="bg-white/10 text-xs font-black rounded-xl px-3 py-2 outline-none min-w-[110px]">
              <option value="none">Brillo</option>
              <option value="drop-shadow(0 0 8px #ff3366)">Rosa</option>
              <option value="drop-shadow(0 0 12px #00d4ff)">Cian</option>
              <option value="drop-shadow(0 0 16px #c084fc)">Púrpura</option>
              <option value="drop-shadow(0 0 20px #00ff9d)">Verde</option>
            </select>

            <select value={selectedEl?.font || FONTS[0].family} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-white/10 text-xs font-black rounded-xl px-3 py-2 outline-none min-w-[140px]">
              {FONTS.map(f => <option key={f.id} value={f.family} className="bg-black text-white">{f.name}</option>)}
            </select>
          </div>
        )}

        <nav className="p-5 grid grid-cols-7 gap-3">
          <ToolBtn icon={<Palette/>} label="FONDO" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers/>} label="MARCO" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type/>} label="TEXTO" onClick={() => addElement('text')} />
          <ToolBtn icon={<Smile/>} label="EMOJI" onClick={() => setActiveSheet('emojis')} />
          <ToolBtn icon={<ImageIcon/>} label="FOTO" onClick={() => fileRef.current.click()} />
          <ToolBtn icon={<StarIcon/>} label="FORMA" onClick={() => setActiveSheet('shapes')} />
          <ToolBtn icon={<Magic/>} label="EFECTOS" onClick={() => setActiveSheet('effects')} />
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/85 z-[120] backdrop-blur-md"/>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-[#0f001a] to-[#1a0033] rounded-t-3xl p-8 z-[130] border-t border-purple-500/30 max-h-[75vh] overflow-y-auto shadow-2xl">
              <div className="w-12 h-1.5 bg-purple-500/40 rounded-full mx-auto mb-8"/>

              {activeSheet === 'emojis' && (
                <div className="space-y-12 pb-16">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-xs font-black text-purple-300 uppercase mb-6 tracking-widest">{cat.category}</h4>
                      <div className="grid grid-cols-7 gap-5">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji, { color: '#ffffff' })} className="text-5xl aspect-square flex items-center justify-center active:scale-125 transition-transform hover:drop-shadow-2xl">{emoji}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-5 pb-16">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-3xl ${PAPERS[p]} border-4 transition-all duration-300 ${style === p ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/40' : 'border-white/10 opacity-60'}`} />
                  ))}
                  <div onClick={() => { setStyle('custom'); setActiveSheet(null); }} className={`aspect-square rounded-3xl border-4 transition-all ${style === 'custom' ? 'border-purple-500 scale-105 shadow-2xl shadow-purple-500/40' : 'border-white/10 opacity-60'}`}>
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-full opacity-0 cursor-pointer rounded-3xl" />
                  </div>
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-3 gap-4 pb-16">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`py-5 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${border === b ? 'bg-gradient-to-br from-purple-600 to-pink-600 scale-105 shadow-xl' : 'bg-white/5 hover:bg-white/10'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'shapes' && (
                <div className="grid grid-cols-5 gap-5 pb-16">
                  {Object.keys(SHAPES).map(s => (
                    <button key={s} onClick={() => { addElement('shape', s); setActiveSheet(null); }} className="aspect-square flex items-center justify-center bg-white/5 rounded-3xl hover:bg-purple-600/30 transition-all active:scale-95">
                      <svg width="60" height="60" viewBox="0 0 100 100" style={{ fill: '#ffffff' }}>
                        {SHAPES[s]({})}
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {activeSheet === 'effects' && (
                <div className="space-y-8 pb-16">
                  <div className="grid grid-cols-3 gap-4">
                    <button onClick={() => addElement('emoji', '✨', { size: 120, color: '#ffd700' })} className="p-6 bg-gradient-to-br from-yellow-500/20 to-amber-500/10 rounded-3xl text-6xl hover:scale-110 transition">✨</button>
                    <button onClick={() => addElement('emoji', '💥', { size: 110, color: '#ff4500' })} className="p-6 bg-gradient-to-br from-red-500/20 to-orange-500/10 rounded-3xl text-6xl hover:scale-110 transition">💥</button>
                    <button onClick={() => addElement('emoji', '🌈', { size: 100, color: '#ffffff' })} className="p-6 bg-gradient-to-br from-pink-500/20 to-cyan-500/10 rounded-3xl text-6xl hover:scale-110 transition">🌈</button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md flex justify-between items-center mb-8">
              <button onClick={() => setPreview(null)} className="p-4 bg-white/10 rounded-full"><X size={24}/></button>
              <h2 className="font-black text-2xl uppercase tracking-widest bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">PREVIEW</h2>
              <div className="w-12"/>
            </div>
            <div className="w-full max-w-[360px] aspect-[9/16] rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-500/30 mb-10">
              <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button onClick={() => { const a = document.createElement('a'); a.download = `Titan_${Date.now()}.png`; a.href = preview; a.click(); }} className="w-full max-w-md py-6 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-purple-700/50 active:scale-95 transition">
              GUARDAR EN GALERÍA
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ x: '100%' }} animate={{ x: selectedId ? 0 : '100%' }} className="absolute top-24 right-0 w-64 bg-black/90 backdrop-blur-xl p-5 rounded-l-3xl shadow-2xl z-[120] max-h-[60vh] overflow-y-auto border-l border-purple-500/30">
        <h3 className="text-sm font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">CAPAS</h3>
        {elements.slice().sort((a, b) => b.zIndex - a.zIndex).map((el, idx) => (
          <div key={el.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => reorderElements(parseInt(e.dataTransfer.getData('text/plain')), idx)} className={`flex items-center gap-3 p-3 rounded-2xl mb-2 cursor-move transition-all ${el.id === selectedId ? 'bg-purple-600/40 border-purple-400/50 border' : 'bg-white/5 hover:bg-white/10'}`}>
            <Layers size={16} className="text-purple-300" />
            <span className="text-sm font-medium truncate flex-1">
              {el.type === 'text' ? 'Texto' : el.type === 'image' ? 'Imagen' : el.type === 'shape' ? 'Forma' : 'Emoji'}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-all group">
      <div className="w-16 h-16 bg-gradient-to-br from-purple-900/40 to-pink-900/30 rounded-3xl flex items-center justify-center text-purple-300 group-hover:bg-gradient-to-br group-hover:from-purple-600 group-hover:to-pink-600 group-hover:text-white transition-all shadow-lg">
        {React.cloneElement(icon, { size: 26 })}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-purple-300/80 group-hover:text-purple-200">{label}</span>
    </button>
  );
}