import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable from "react-moveable";
import { 
  Type, Image as ImageIcon, X, Trash2, RotateCcw, Palette, Layers, Wand2, Sparkles,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Droplet,
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
      try {
        const parsed = JSON.parse(savedState);
        setElements(parsed.elements || []);
        setStyle(parsed.style || 'classic');
        setBorder(parsed.border || 'none');
        setBackgroundColor(parsed.backgroundColor || '#ffffff');
      } catch (e) {
        console.error("Error cargando estado guardado", e);
      }
    }
  }, []);

  const pushToHistory = (newElements) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newElements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
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
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      content: content || (type === 'text' ? 'Toca para editar' : type === 'emoji' ? '😊' : ''),
      transform: 'translate(80px, 140px) rotate(0deg) scale(1)',
      width: type === 'image' || type === 'shape' ? 220 : 'auto',
      height: type === 'shape' ? 220 : 'auto',
      size: type === 'text' ? 40 : 100,
      font: FONTS[0]?.family || 'Arial',
      color: type === 'text' ? defaultColor : '#ffffff',
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
      opacity: 1,
      shadow: 'none',
      flipX: false,
      flipY: false,
      zIndex: elements.length + 1,
      mask: 'none',
      fill: type === 'shape' ? defaultColor : undefined,
      ...extra
    };

    setElements(prev => {
      const updated = [...prev, newEl];
      pushToHistory(updated);
      return updated;
    });

    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  const updateEl = debounce((id, props) => {
    setElements(prev => {
      const updated = prev.map(el => el.id === id ? { ...el, ...props } : el);
      pushToHistory(updated);
      return updated;
    });
  }, 80);

  const deleteEl = (id) => {
    setElements(prev => {
      const updated = prev.filter(el => el.id !== id);
      pushToHistory(updated);
      return updated;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans select-none touch-none">

      <header className="p-3 flex justify-between items-center bg-black/90 border-b border-white/10 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Wand2 size={16} />
          </div>
          <h1 className="font-bold text-lg">Titan Studio</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={undo} disabled={historyIndex <= 0} className="p-2 bg-white/10 rounded-lg disabled:opacity-40"><Undo2 size={18} /></button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 bg-white/10 rounded-lg disabled:opacity-40"><Redo2 size={18} /></button>
          <button onClick={() => { setElements([]); setHistory([]); setHistoryIndex(-1); }} className="p-2 bg-white/10 rounded-lg"><RotateCcw size={18} /></button>
          <button 
            onClick={async () => {
              setSelectedId(null);
              await new Promise(r => setTimeout(r, 200));
              try {
                const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, quality: 0.98 });
                setPreview(dataUrl);
              } catch (err) {
                console.error("Error al generar preview", err);
              }
            }} 
            className="bg-orange-600 px-4 py-2 rounded-lg font-bold text-sm"
          >
            FINALIZAR
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-[90%] max-w-[380px] aspect-[3/4] shadow-2xl transition-all duration-300 overflow-hidden rounded-2xl ${PAPERS[style]} ${BORDERS[border]}`}
          style={{ backgroundColor: style === 'custom' ? backgroundColor : undefined }}
        >
          {elements.map((el) => (
            <div
              key={el.id}
              id={`el-${el.id}`}
              onClick={(e) => { e.stopPropagation(); selectElement(el.id); }}
              className="absolute pointer-events-auto touch-auto"
              style={{ 
                transform: el.transform, 
                zIndex: el.zIndex,
                opacity: el.opacity,
                touchAction: 'auto'
              }}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  suppressContentEditableWarning
                  spellCheck={false}
                  onFocus={(e) => { if (e.target.innerText === 'Toca para editar') e.target.innerText = ''; }}
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText.trim() || 'Toca para editar' })}
                  style={{ 
                    fontFamily: el.font || 'Arial',
                    fontSize: `${el.size}px`,
                    color: el.color,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    textDecoration: el.underline ? 'underline' : 'none',
                    textAlign: el.align,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '90%',
                    minWidth: '60px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.1)',
                    borderRadius: '8px',
                    outline: 'none',
                    cursor: 'text',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    touchAction: 'auto'
                  }}
                >
                  {el.content}
                </div>
              ) : el.type === 'emoji' ? (
                <div style={{ fontSize: `${el.size}px`, color: el.color || '#fff' }} className="p-3 select-none leading-none">
                  {el.content}
                </div>
              ) : el.type === 'shape' ? (
                <svg width={el.width} height={el.height} viewBox="0 0 100 100" style={{ fill: el.fill || '#fff' }}>
                  {SHAPES[el.content]?.({}) || <circle cx="50" cy="50" r="40" />}
                </svg>
              ) : (
                <img 
                  src={el.content} 
                  alt="uploaded"
                  style={{ width: el.width, maxWidth: '100%', height: 'auto', clipPath: getMask(el.mask) }} 
                  className="block pointer-events-none select-none rounded-lg"
                  draggable={false}
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
              keepRatio={true}
              snappable={true}
              bounds={{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }}
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
              controlBorderColor="#f97316"
            />
          )}
        </div>
      </main>

      <div className="bg-black/90 border-t border-white/10 pb-safe">
        {selectedId && (
          <div className="px-4 py-3 flex gap-3 overflow-x-auto bg-black/60 border-b border-white/5 no-scrollbar">
            {selectedEl?.type === 'text' && (
              <>
                <button onClick={() => updateEl(selectedId, { bold: !selectedEl.bold })} className={`p-2.5 rounded-lg ${selectedEl.bold ? 'bg-orange-600' : 'bg-white/10'}`}><Bold size={18}/></button>
                <button onClick={() => updateEl(selectedId, { italic: !selectedEl.italic })} className={`p-2.5 rounded-lg ${selectedEl.italic ? 'bg-orange-600' : 'bg-white/10'}`}><Italic size={18}/></button>
                <button onClick={() => updateEl(selectedId, { underline: !selectedEl.underline })} className={`p-2.5 rounded-lg ${selectedEl.underline ? 'bg-orange-600' : 'bg-white/10'}`}><Underline size={18}/></button>
                <input type="color" value={selectedEl.color} onChange={e => updateEl(selectedId, { color: e.target.value })} className="w-10 h-10 rounded-full cursor-pointer" />
              </>
            )}
            <input type="range" min="10" max="120" value={selectedEl?.size || 35} onChange={e => updateEl(selectedId, { size: +e.target.value })} className="w-32" />
            <input type="range" min="0.2" max="1" step="0.05" value={selectedEl?.opacity || 1} onChange={e => updateEl(selectedId, { opacity: +e.target.value })} className="w-32" />
          </div>
        )}

        <nav className="grid grid-cols-6 gap-1 p-4">
          <ToolBtn icon={<Palette />} label="Fondo" onClick={() => setActiveSheet('papers')} />
          <ToolBtn icon={<Layers />} label="Bordes" onClick={() => setActiveSheet('borders')} />
          <ToolBtn icon={<Type />} label="Texto" onClick={() => addElement('text')} />
          <ToolBtn icon={<Sparkles />} label="Emoji" onClick={() => setActiveSheet('emojis')} />
          <ToolBtn icon={<ImageIcon />} label="Foto" onClick={() => fileRef.current?.click()} />
          <ToolBtn icon={<Square />} label="Forma" onClick={() => setActiveSheet('shapes')} />
        </nav>
      </div>

      <input 
        ref={fileRef} 
        type="file" 
        accept="image/*" 
        hidden 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => addElement('image', ev.target.result);
            reader.readAsDataURL(file);
          }
        }} 
      />

      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/70 z-[120] backdrop-blur-sm" />
            <motion.div 
              initial={{ y: '100%' }} 
              animate={{ y: 0 }} 
              exit={{ y: '100%' }} 
              className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl max-h-[75vh] overflow-y-auto z-[130] shadow-2xl border-t border-white/10"
            >
              <div className="sticky top-0 bg-[#111] p-4 border-b border-white/10 z-10 flex justify-between items-center">
                <h3 className="font-bold text-lg capitalize">{activeSheet}</h3>
                <button onClick={() => setActiveSheet(null)}><X size={24} /></button>
              </div>

              {activeSheet === 'emojis' && EMOJI_LIBRARY.map(cat => (
                <div key={cat.category} className="p-4">
                  <h4 className="text-sm text-gray-400 mb-3 uppercase">{cat.category}</h4>
                  <div className="grid grid-cols-7 gap-3">
                    {cat.items.map((emoji, i) => (
                      <button 
                        key={i} 
                        onClick={() => addElement('emoji', emoji, { size: 60 })}
                        className="text-4xl aspect-square flex items-center justify-center hover:bg-white/10 rounded-xl transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {activeSheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {Object.entries(PAPERS).map(([key, className]) => (
                    <div 
                      key={key}
                      onClick={() => { setStyle(key); setActiveSheet(null); }}
                      className={`aspect-square rounded-xl border-2 cursor-pointer transition-all ${style === key ? 'border-orange-500 scale-105 shadow-lg' : 'border-white/20 opacity-70'} ${className}`}
                    />
                  ))}
                </div>
              )}

              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-3 p-4">
                  {Object.entries(BORDERS).map(([key, className]) => (
                    <button 
                      key={key}
                      onClick={() => { setBorder(key); setActiveSheet(null); }}
                      className={`p-4 rounded-xl text-sm font-medium text-center transition ${border === key ? 'bg-orange-600 text-white' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
              )}

              {activeSheet === 'shapes' && (
                <div className="grid grid-cols-4 gap-4 p-4">
                  {Object.keys(SHAPES).map(key => (
                    <button 
                      key={key}
                      onClick={() => addElement('shape', key)}
                      className="aspect-square bg-white/5 rounded-xl flex items-center justify-center hover:bg-orange-600/30 transition"
                    >
                      <svg width="48" height="48" viewBox="0 0 100 100" fill="#fff">
                        {SHAPES[key]({})}
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {preview && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="fixed inset-0 bg-black z-[200] flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-sm aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6 border border-white/20">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-4 w-full max-w-sm">
            <button onClick={() => setPreview(null)} className="flex-1 py-4 bg-gray-800 rounded-xl font-bold">Volver</button>
            <button 
              onClick={() => {
                const a = document.createElement('a');
                a.href = preview;
                a.download = `titan_${Date.now()}.png`;
                a.click();
              }} 
              className="flex-1 py-4 bg-orange-600 rounded-xl font-bold"
            >
              Descargar
            </button>
          </div>
        </motion.div>
      )}

      <motion.div 
        initial={{ x: '100%' }} 
        animate={{ x: selectedId ? 0 : '100%' }} 
        className="fixed top-0 right-0 h-full w-72 bg-black/95 backdrop-blur-lg border-l border-white/10 z-[110] overflow-y-auto"
      >
        <div className="p-4 border-b border-white/10">
          <h3 className="font-bold text-lg">Capas</h3>
        </div>
        {elements.map(el => (
          <div 
            key={el.id}
            className={`p-3 border-b border-white/5 flex items-center gap-3 cursor-pointer hover:bg-white/5 ${selectedId === el.id ? 'bg-orange-600/20' : ''}`}
            onClick={() => selectElement(el.id)}
          >
            <Layers size={18} />
            <span className="truncate flex-1">
              {el.type === 'text' ? `Texto: ${el.content.slice(0,15)}...` : 
               el.type === 'image' ? 'Imagen' : 
               el.type === 'shape' ? 'Forma' : 'Emoji'}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ToolBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-gray-300 hover:bg-orange-600/80 hover:text-white transition-colors">
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <span className="text-[10px] font-medium text-gray-400">{label}</span>
    </button>
  );
}