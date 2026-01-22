import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable from "react-moveable";
import { 
  Type, Image as ImageIcon, X, Trash2, RotateCcw, Palette, Layers, Wand2, Sparkles, 
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Droplet, Sliders,
  Square, Circle, Star, FlipHorizontal, FlipVertical
} from 'lucide-react';
import { toPng } from 'html-to-image';
import debounce from 'lodash-es/debounce';

import { PAPERS } from './constants/papers';
import { BORDERS } from './constants/borders';
import { FONTS } from './constants/fonts';
import { EMOJI_LIBRARY } from './constants/emojis';
import { getMask } from './utils/masks';
import { SHAPES } from './constants/shapes';

function getTextColorForBg(bgColor) {
  if (!bgColor || bgColor === 'transparent') return '#000000';
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0,2),16);
  const g = parseInt(hex.substr(2,2),16);
  const b = parseInt(hex.substr(4,2),16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

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

  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      localStorage.setItem('titanCanvasState', JSON.stringify({ elements, style, border, backgroundColor }));
    }, 5000);
    return () => clearInterval(saveInterval);
  }, [elements, style, border, backgroundColor]);

  useEffect(() => {
    const savedState = localStorage.getItem('titanCanvasState');
    if (savedState) {
      const { elements: savedElements, style: savedStyle, border: savedBorder, backgroundColor: savedBg } = JSON.parse(savedState);
      setElements(savedElements);
      setStyle(savedStyle);
      setBorder(savedBorder);
      setBackgroundColor(savedBg);
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
    const defaultColor = getTextColorForBg(style === 'custom' ? backgroundColor : '#ffffff');
    const newEl = {
      id: Date.now().toString(),
      type,
      content: content || (type === 'text' ? 'Toca para editar' : ''),
      transform: 'translate(50px, 100px) rotate(0deg) scale(1)',
      width: type === 'image' || type === 'shape' ? 180 : 'auto',
      height: type === 'shape' ? 180 : 'auto',
      size: type === 'text' ? 35 : 80,
      font: FONTS[0].family,
      color: defaultColor,
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      opacity: 1,
      shadow: 'none',
      flipX: false,
      flipY: false,
      zIndex: elements.length + 1,
      mask: 'none',
      fill: type === 'shape' ? defaultColor : undefined,
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
  }, 100);

  const deleteEl = (id) => {
    const newElements = elements.filter(el => el.id !== id);
    setElements(newElements);
    pushToHistory(newElements);
    setSelectedId(null);
  };

  const reorderElements = (fromIndex, toIndex) => {
    const newElements = [...elements];
    const [moved] = newElements.splice(fromIndex, 1);
    newElements.splice(toIndex, 0, moved);
    newElements.forEach((el, idx) => el.zIndex = idx + 1);
    setElements(newElements);
    pushToHistory(newElements);
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
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 bg-white/5 rounded-lg active:scale-90 transition-transform disabled:opacity-50"><Undo2 size={16} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 bg-white/5 rounded-lg active:scale-90 transition-transform disabled:opacity-50"><Redo2 size={16} /></button>
          <button onClick={() => { setElements([]); setHistory([]); setHistoryIndex(-1); }} className="p-2 bg-white/5 rounded-lg active:scale-90 transition-transform"><RotateCcw size={16} /></button>
          <button onClick={async () => {
            setSelectedId(null);
            setTimeout(async () => {
              const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, quality: 1 });
              setPreview(dataUrl);
            }, 300);
          }} className="bg-white text-black px-4 py-1.5 rounded-lg font-black text-[10px] uppercase">Finalizar</button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[360px] aspect-[3/4] shadow-2xl transition-all duration-500 overflow-hidden ${PAPERS[style]} ${BORDERS[border]}`}
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
                touchAction: 'none',
                boxShadow: el.shadow
              }}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  suppressContentEditableWarning
                  onFocus={(e) => { if (e.target.innerText === 'Toca para editar') e.target.innerText = ''; }}
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText.trim() || 'Toca para editar' })}
                  style={{ 
                    fontFamily: el.font, 
                    fontSize: el.size, 
                    color: el.color, 
                    outline: 'none',
                    fontWeight: el.bold ? 'bold' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    textDecoration: el.underline ? 'underline' : 'none',
                    textAlign: el.align,
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    maxWidth: '100%',
                    boxSizing: 'border-box',
                    padding: '4px 8px'
                  }}
                  className="inline-block text-center"
                >
                  {el.content}
                </div>
              ) : el.type === 'emoji' ? (
                <div style={{ fontSize: el.size }} className="p-2 select-none leading-none drop-shadow-md text-center">{el.content}</div>
              ) : el.type === 'shape' ? (
                <svg width={el.width} height={el.height} viewBox="0 0 100 100" style={{ fill: el.fill }}>
                  {SHAPES[el.content]({})}
                </svg>
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
              keepRatio={selectedEl.type !== 'text'}
              onDrag={({ target, transform }) => {
                target.style.transform = transform;
                updateEl(selectedId, { transform });
              }}
              onScale={({ target, transform, drag }) => {
                target.style.transform = transform;
                if (selectedEl.type === 'image') updateEl(selectedId, { width: drag.beforeTranslate[0] });
                if (selectedEl.type === 'shape') updateEl(selectedId, { width: drag.beforeTranslate[0], height: drag.beforeTranslate[1] });
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
        </div>

        {selectedId && (
          <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-[110]">
            <button onClick={() => deleteEl(selectedId)} className="p-3 bg-red-600 rounded-full shadow-2xl text-white active:scale-90 transition-transform">
              <Trash2 size={20}/>
            </button>
            <button onClick={() => updateEl(selectedId, { flipX: !selectedEl.flipX })} className="p-3 bg-blue-600 rounded-full shadow-2xl text-white active:scale-90 transition-transform">
              <FlipHorizontal size={20}/>
            </button>
            <button onClick={() => updateEl(selectedId, { flipY: !selectedEl.flipY })} className="p-3 bg-blue-600 rounded-full shadow-2xl text-white active:scale-90 transition-transform">
              <FlipVertical size={20}/>
            </button>
          </motion.div>
        )}
      </main>

      <div className="bg-black/95 border-t border-white/5 pb-4 backdrop-blur-xl">
        {selectedId && (
          <div className="px-6 py-4 flex gap-4 overflow-x-auto items-center bg-white/5 border-b border-white/5 no-scrollbar">
            {selectedEl.type === 'text' && (
              <>
                <button onClick={() => updateEl(selectedId, { bold: !selectedEl.bold })} className={`p-2 ${selectedEl.bold ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><Bold size={16}/></button>
                <button onClick={() => updateEl(selectedId, { italic: !selectedEl.italic })} className={`p-2 ${selectedEl.italic ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><Italic size={16}/></button>
                <button onClick={() => updateEl(selectedId, { underline: !selectedEl.underline })} className={`p-2 ${selectedEl.underline ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><Underline size={16}/></button>
                <button onClick={() => updateEl(selectedId, { align: 'left' })} className={`p-2 ${selectedEl.align === 'left' ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><AlignLeft size={16}/></button>
                <button onClick={() => updateEl(selectedId, { align: 'center' })} className={`p-2 ${selectedEl.align === 'center' ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><AlignCenter size={16}/></button>
                <button onClick={() => updateEl(selectedId, { align: 'right' })} className={`p-2 ${selectedEl.align === 'right' ? 'bg-orange-600' : 'bg-white/10'} rounded-lg`}><AlignRight size={16}/></button>
              </>
            )}
            <input type="color" value={selectedEl.color || selectedEl.fill} onChange={(e) => updateEl(selectedId, selectedEl.type === 'shape' ? { fill: e.target.value } : { color: e.target.value })} className="w-8 h-8 rounded-full bg-transparent border-none cursor-pointer scale-125" />
            <select value={selectedEl.font} onChange={(e) => updateEl(selectedId, { font: e.target.value })} className="bg-white/10 text-[10px] uppercase font-black border-none rounded-lg px-3 py-2 outline-none" style={{ display: selectedEl.type === 'text' ? 'block' : 'none' }}>
              {FONTS.map(f => <option key={f.id} value={f.family} className="bg-black text-white">{f.name}</option>)}
            </select>
            <input type="range" min="0.1" max="1" step="0.01" value={selectedEl.opacity} onChange={(e) => updateEl(selectedId, { opacity: parseFloat(e.target.value) })} className="w-24" />
            <select onChange={(e) => updateEl(selectedId, { shadow: e.target.value })} className="bg-white/10 text-[10px] uppercase font-black border-none rounded-lg px-3 py-2 outline-none">
              <option value="none">Sin Sombra</option>
              <option value="0 4px 6px rgba(0,0,0,0.1)">Suave</option>
              <option value="0 10px 15px rgba(0,0,0,0.2)">Media</option>
              <option value="0 20px 25px rgba(0,0,0,0.3)">Fuerte</option>
            </select>
            { (selectedEl.type === 'image' || selectedEl.type === 'shape') && (
              <select value={selectedEl.mask} onChange={(e) => updateEl(selectedId, { mask: e.target.value })} className="bg-white/10 text-[10px] uppercase font-black border-none rounded-lg px-3 py-2 outline-none">
                <option value="none">Sin Máscara</option>
                <option value="circle">Círculo</option>
                <option value="star">Estrella</option>
              </select>
            )}
            { selectedEl.type === 'image' && (
              <select onChange={(e) => updateEl(selectedId, { filter: e.target.value })} className="bg-white/10 text-[10px] uppercase font-black border-none rounded-lg px-3 py-2 outline-none">
                <option value="none">Sin Filtro</option>
                <option value="grayscale(100%)">Blanco y Negro</option>
                <option value="sepia(100%)">Sepia</option>
                <option value="brightness(150%)">Brillante</option>
                <option value="contrast(200%)">Contraste Alto</option>
              </select>
            )}
          </div>
        )}
        <nav className="p-6 grid grid-cols-6 gap-2">
          <ToolBtn icon={<Palette/>} label="Fondo" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers/>} label="Marco" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text')} />
          <ToolBtn icon={<Sparkles/>} label="Sticker" onClick={() => setActiveSheet('emojis')} />
          <ToolBtn icon={<ImageIcon/>} label="Foto" onClick={() => fileRef.current.click()} />
          <ToolBtn icon={<Square/>} label="Forma" onClick={() => setActiveSheet('shapes')} />
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
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#0a0a0a] rounded-t-[40px] p-8 z-[130] border-t border-white/10 max-h-[70vh] overflow-y-auto shadow-2xl">
              <div className="w-10 h-1.5 bg-white/20 rounded-full mx-auto mb-8"/>

              {activeSheet === 'emojis' && (
                <div className="space-y-10 pb-12">
                  {EMOJI_LIBRARY.map((cat) => (
                    <div key={cat.category}>
                      <h4 className="text-[9px] font-black text-gray-500 uppercase mb-5 tracking-[0.3em]">{cat.category}</h4>
                      <div className="grid grid-cols-6 gap-4">
                        {cat.items.map((emoji, i) => (
                          <button key={i} onClick={() => addElement('emoji', emoji)} className="text-4xl aspect-square flex items-center justify-center active:scale-150 transition-all">{emoji}</button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 pb-12">
                  {Object.keys(PAPERS).map(p => (
                    <div key={p} onClick={() => { setStyle(p); setActiveSheet(null); }} className={`aspect-square rounded-2xl ${PAPERS[p]} border-2 transition-all ${style === p ? 'border-orange-500 scale-95' : 'border-white/5 opacity-40'}`} />
                  ))}
                  <div onClick={() => { setStyle('custom'); setActiveSheet(null); }} className={`aspect-square rounded-2xl bg-gray-500 border-2 transition-all ${style === 'custom' ? 'border-orange-500 scale-95' : 'border-white/5 opacity-40'}`}>
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-full h-full opacity-0 cursor-pointer" />
                  </div>
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 pb-12">
                  {Object.keys(BORDERS).map(b => (
                    <button key={b} onClick={() => { setBorder(b); setActiveSheet(null); }} className={`py-4 rounded-xl text-[9px] font-black uppercase tracking-widest ${border === b ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>{b}</button>
                  ))}
                </div>
              )}

              {activeSheet === 'shapes' && (
                <div className="grid grid-cols-4 gap-4 pb-12">
                  {Object.keys(SHAPES).map(s => (
                    <button key={s} onClick={() => { addElement('shape', s); setActiveSheet(null); }} className="aspect-square flex items-center justify-center bg-white/5 rounded-2xl">
                      <svg width="50" height="50" viewBox="0 0 100 100" style={{ fill: '#ffffff' }}>
                        {SHAPES[s]({})}
                      </svg>
                    </button>
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
              <h2 className="font-black tracking-[0.3em] text-[9px] uppercase italic text-orange-500 text-center flex-1">Titan Export</h2>
              <div className="w-10"/>
            </header>
            <div className="w-full max-w-[320px] aspect-[3/4] bg-[#111] rounded-[30px] overflow-hidden shadow-2xl mb-12">
              <img src={preview} className="w-full h-full object-contain" />
            </div>
            <button onClick={() => { const a = document.createElement('a'); a.download = `Titan_${Date.now()}.png`; a.href = preview; a.click(); }} className="w-full max-w-xs py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all">
              Guardar en Galería
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ x: '100%' }} animate={{ x: selectedId ? 0 : '100%' }} className="absolute top-20 right-0 w-48 bg-black/90 p-4 rounded-l-2xl shadow-2xl z-[120] max-h-[50vh] overflow-y-auto">
        <h3 className="text-xs font-bold mb-2">Capas</h3>
        {elements.slice().sort((a, b) => b.zIndex - a.zIndex).map((el, idx) => (
          <div key={el.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)} onDragOver={(e) => e.preventDefault()} onDrop={(e) => reorderElements(parseInt(e.dataTransfer.getData('text/plain')), idx)} className={`flex items-center gap-2 p-2 rounded-lg ${el.id === selectedId ? 'bg-orange-600' : 'bg-white/5'} mb-1 cursor-move`}>
            <Layers size={12} />
            <span className="text-xs">{el.type.charAt(0).toUpperCase() + el.type.slice(1)} {el.content.slice(0, 10)}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2.5 active:scale-90 transition-all group">
      <div className="w-14 h-14 bg-white/[0.03] rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-orange-600 group-hover:text-white transition-all shadow-sm">
        {React.cloneElement(icon, { size: 22 })}
      </div>
      <span className="text-[7px] font-black uppercase tracking-widest text-gray-600">{label}</span>
    </button>
  );
}