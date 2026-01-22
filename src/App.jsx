import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Moveable from "react-moveable";
import { 
  Type, Image as ImageIcon, X, Trash2, RotateCcw, Palette, Layers, Wand2, Sparkles,
  Undo2, Redo2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Droplet,
  Square, Circle, Star, FlipHorizontal, FlipVertical, Plus, Download, Scissors
} from 'lucide-react';
import { toPng } from 'html-to-image';

import { PAPERS } from './constants/papers';
import { BORDERS } from './constants/borders';
import { FONTS } from './constants/fonts';
import { EMOJI_LIBRARY } from './constants/emojis';
import { getMask } from './utils/masks';
import { SHAPES } from './constants/shapes';

function getTextColor(bg) {
  if (!bg || bg === 'transparent') return '#000000';
  const hex = bg.replace('#', '');
  const r = parseInt(hex.substr(0,2),16) || 0;
  const g = parseInt(hex.substr(2,2),16) || 0;
  const b = parseInt(hex.substr(4,2),16) || 0;
  return (0.299*r + 0.587*g + 0.114*b)/255 > 0.5 ? '#000000' : '#ffffff';
}

export default function TitanStudioCanvas() {
  const [style, setStyle] = useState('classic');
  const [border, setBorder] = useState('none');
  const [bgColor, setBgColor] = useState('#000000');
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selectedId, setSelectedId] = useState(null);
  const [sheet, setSheet] = useState(null);
  const [preview, setPreview] = useState(null);

  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem('titanState');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setElements(data.elements || []);
        setStyle(data.style || 'classic');
        setBorder(data.border || 'none');
        setBgColor(data.bgColor || '#000000');
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('titanState', JSON.stringify({ elements, style, border, bgColor }));
  }, [elements, style, border, bgColor]);

  const add = (type, content = '', extra = {}) => {
    const color = type === 'text' ? getTextColor(bgColor) : '#ffffff';
    const el = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 9),
      type,
      content: content || (type === 'text' ? 'Toca para editar' : type === 'emoji' ? '😊' : ''),
      transform: 'translate(100px, 180px) rotate(0deg) scale(1)',
      width: type === 'image' || type === 'shape' ? 240 : 'auto',
      height: type === 'shape' ? 240 : 'auto',
      size: type === 'text' ? 48 : 120,
      font: FONTS[0]?.family || 'Arial',
      color,
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
      opacity: 1,
      shadow: 'none',
      flipX: false,
      flipY: false,
      zIndex: elements.length + 10,
      mask: 'none',
      fill: type === 'shape' ? color : undefined,
      ...extra
    };

    setElements(prev => {
      const next = [...prev, el];
      setHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(h => h + 1);
      return next;
    });

    setSelectedId(el.id);
    setSheet(null);
  };

  const update = debounce((id, props) => {
    setElements(prev => {
      const next = prev.map(el => el.id === id ? { ...el, ...props } : el);
      setHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(h => h + 1);
      return next;
    });
  }, 60);

  const remove = (id) => {
    setElements(prev => {
      const next = prev.filter(el => el.id !== id);
      setHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(h => h + 1);
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  };

  const selected = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-black text-white flex flex-col overflow-hidden touch-none">

      <header className="h-14 flex items-center justify-between px-4 bg-black/90 border-b border-white/10 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
            <Wand2 size={18} />
          </div>
          <span className="font-bold text-lg">Titan Studio</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => historyIndex > 0 && setHistoryIndex(historyIndex - 1)} disabled={historyIndex <= 0} className="p-2 disabled:opacity-40">
            <Undo2 size={20} />
          </button>
          <button onClick={() => historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1)} disabled={historyIndex >= history.length - 1} className="p-2 disabled:opacity-40">
            <Redo2 size={20} />
          </button>
          <button onClick={async () => {
            setSelectedId(null);
            await new Promise(r => setTimeout(r, 200));
            const url = await toPng(canvasRef.current, { pixelRatio: 3 });
            setPreview(url);
          }} className="bg-orange-600 px-5 py-2 rounded-full font-bold text-sm">
            Exportar
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-[92%] max-w-[380px] aspect-[9/16] shadow-2xl rounded-3xl overflow-hidden ${PAPERS[style]} ${BORDERS[border]}`}
          style={{ backgroundColor: style === 'custom' ? bgColor : undefined }}
        >
          {elements.map(el => (
            <div
              key={el.id}
              id={`el-${el.id}`}
              onClick={e => { e.stopPropagation(); selectElement(el.id); }}
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
                  onFocus={e => { if (e.target.innerText === 'Toca para editar') e.target.innerText = ''; }}
                  onBlur={e => update(el.id, { content: e.target.innerText.trim() || 'Toca para editar' })}
                  style={{
                    fontFamily: el.font,
                    fontSize: `${el.size}px`,
                    color: el.color,
                    fontWeight: el.bold ? 'bold' : 'normal',
                    fontStyle: el.italic ? 'italic' : 'normal',
                    textDecoration: el.underline ? 'underline' : 'none',
                    textAlign: el.align,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    maxWidth: '90%',
                    minWidth: '80px',
                    padding: '12px',
                    lineHeight: 1.3,
                    outline: 'none',
                    cursor: 'text',
                    userSelect: 'text',
                    WebkitUserSelect: 'text',
                    touchAction: 'auto'
                  }}
                  className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10"
                >
                  {el.content}
                </div>
              ) : el.type === 'emoji' ? (
                <div style={{ fontSize: `${el.size}px`, color: el.color || '#fff' }} className="p-4 select-none">
                  {el.content}
                </div>
              ) : el.type === 'shape' ? (
                <svg width={el.width} height={el.height} viewBox="0 0 100 100" style={{ fill: el.fill || '#fff' }}>
                  {SHAPES[el.content]?.({}) || <rect width="100" height="100" rx="20" />}
                </svg>
              ) : (
                <img
                  src={el.content}
                  alt=""
                  style={{ width: el.width, maxWidth: '100%', height: 'auto', clipPath: getMask(el.mask) }}
                  className="block pointer-events-none select-none rounded-xl"
                  draggable={false}
                />
              )}
            </div>
          ))}

          {selectedId && (
            <Moveable
              target={() => document.getElementById(`el-${selectedId}`)}
              draggable
              scalable
              rotatable
              pinchable={['scalable', 'rotatable']}
              keepRatio
              snappable
              onDrag={({ target, transform }) => {
                target.style.transform = transform;
                update(selectedId, { transform });
              }}
              onScale={({ target, transform }) => {
                target.style.transform = transform;
                update(selectedId, { transform });
              }}
              onRotate={({ target, transform }) => {
                target.style.transform = transform;
                update(selectedId, { transform });
              }}
              renderDirections={['nw','ne','sw','se']}
              origin={false}
              lineColor="#00d4ff"
              controlColor="#ffffff"
              controlBorderColor="#00d4ff"
            />
          )}
        </div>
      </main>

      {selectedId && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
          {selected.type === 'text' && (
            <div className="flex flex-col gap-3 bg-black/80 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl">
              <button onClick={() => update(selectedId, { bold: !selected.bold })} className={`p-3 rounded-xl ${selected.bold ? 'bg-cyan-600' : 'bg-white/10'}`}><Bold size={20}/></button>
              <button onClick={() => update(selectedId, { italic: !selected.italic })} className={`p-3 rounded-xl ${selected.italic ? 'bg-cyan-600' : 'bg-white/10'}`}><Italic size={20}/></button>
              <button onClick={() => update(selectedId, { underline: !selected.underline })} className={`p-3 rounded-xl ${selected.underline ? 'bg-cyan-600' : 'bg-white/10'}`}><Underline size={20}/></button>
              <input type="color" value={selected.color} onChange={e => update(selectedId, { color: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer border border-white/20" />
            </div>
          )}
        </div>
      )}

      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {selectedId && (
          <div className="flex flex-col gap-3 bg-black/80 backdrop-blur-lg p-4 rounded-2xl border border-white/10 shadow-2xl">
            <button onClick={() => remove(selectedId)} className="p-3 bg-red-600 rounded-xl"><Trash2 size={20}/></button>
            <button onClick={() => update(selectedId, { flipX: !selected.flipX })} className="p-3 bg-blue-600 rounded-xl"><FlipHorizontal size={20}/></button>
            <button onClick={() => update(selectedId, { flipY: !selected.flipY })} className="p-3 bg-blue-600 rounded-xl"><FlipVertical size={20}/></button>
          </div>
        )}
      </div>

      <nav className="bg-black/90 border-t border-white/10 backdrop-blur-lg">
        <div className="grid grid-cols-5 gap-1 p-3">
          <button onClick={() => add('text')} className="flex flex-col items-center gap-1 p-2 active:scale-95">
            <Type size={26} />
            <span className="text-xs">Texto</span>
          </button>
          <button onClick={() => setSheet('emojis')} className="flex flex-col items-center gap-1 p-2 active:scale-95">
            <Sparkles size={26} />
            <span className="text-xs">Stickers</span>
          </button>
          <button onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1 p-2 active:scale-95">
            <ImageIcon size={26} />
            <span className="text-xs">Foto</span>
          </button>
          <button onClick={() => setSheet('shapes')} className="flex flex-col items-center gap-1 p-2 active:scale-95">
            <Square size={26} />
            <span className="text-xs">Formas</span>
          </button>
          <button onClick={() => setSheet('papers')} className="flex flex-col items-center gap-1 p-2 active:scale-95">
            <Palette size={26} />
            <span className="text-xs">Fondo</span>
          </button>
        </div>
      </nav>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = ev => add('image', ev.target.result);
          reader.readAsDataURL(file);
        }
      }} />

      <AnimatePresence>
        {sheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(null)} className="fixed inset-0 bg-black/70 z-40" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 right-0 bg-[#111] rounded-t-3xl max-h-[80vh] overflow-y-auto z-50 border-t border-white/10 shadow-2xl">
              <div className="sticky top-0 bg-[#111] p-4 border-b border-white/10 flex justify-between items-center z-10">
                <h3 className="font-bold text-lg capitalize">{sheet}</h3>
                <X size={24} onClick={() => setSheet(null)} className="cursor-pointer" />
              </div>

              {sheet === 'emojis' && EMOJI_LIBRARY.map(cat => (
                <div key={cat.category} className="p-4">
                  <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wide">{cat.category}</h4>
                  <div className="grid grid-cols-8 gap-3">
                    {cat.items.map((e, i) => (
                      <button key={i} onClick={() => add('emoji', e, { size: 80 })} className="text-4xl aspect-square flex items-center justify-center hover:bg-white/10 rounded-xl transition">
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {sheet === 'shapes' && (
                <div className="grid grid-cols-4 gap-4 p-4">
                  {Object.keys(SHAPES).map(k => (
                    <button key={k} onClick={() => add('shape', k)} className="aspect-square bg-white/5 rounded-2xl flex items-center justify-center hover:bg-cyan-600/30 transition">
                      <svg width="60" height="60" viewBox="0 0 100 100" fill="#fff">
                        {SHAPES[k]({})}
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {sheet === 'papers' && (
                <div className="grid grid-cols-3 gap-4 p-4">
                  {Object.entries(PAPERS).map(([k, cls]) => (
                    <div key={k} onClick={() => { setStyle(k); setSheet(null); }} className={`aspect-square rounded-2xl border-2 cursor-pointer transition-all ${style === k ? 'border-cyan-500 scale-105 shadow-lg' : 'border-white/20 opacity-70'} ${cls}`} />
                  ))}
                  <div onClick={() => setSheet('color')} className="aspect-square rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white font-bold cursor-pointer">
                    Color
                  </div>
                </div>
              )}

              {sheet === 'color' && (
                <div className="p-6">
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-32 rounded-2xl cursor-pointer" />
                  <button onClick={() => setSheet(null)} className="mt-6 w-full py-4 bg-cyan-600 rounded-2xl font-bold">Aplicar</button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {preview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/95 z-[200] flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-[380px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl mb-8">
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex gap-4 w-full max-w-[380px]">
            <button onClick={() => setPreview(null)} className="flex-1 py-5 bg-gray-800 rounded-2xl font-bold">Volver</button>
            <button onClick={() => {
              const a = document.createElement('a');
              a.href = preview;
              a.download = `titan_${Date.now()}.png`;
              a.click();
            }} className="flex-1 py-5 bg-cyan-600 rounded-2xl font-bold">Descargar</button>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ x: '100%' }} animate={{ x: selectedId ? 0 : '100%' }} className="fixed top-0 right-0 h-full w-80 bg-black/95 backdrop-blur-xl border-l border-white/10 z-[110] overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <h3 className="font-bold text-xl">Capas</h3>
        </div>
        {elements.map(el => (
          <div 
            key={el.id}
            onClick={() => selectElement(el.id)}
            className={`p-4 border-b border-white/5 flex items-center gap-4 cursor-pointer hover:bg-white/5 ${selectedId === el.id ? 'bg-cyan-900/30' : ''}`}
          >
            <Layers size={20} />
            <div className="flex-1 truncate">
              {el.type === 'text' ? `Texto: ${el.content.slice(0,20)}...` :
               el.type === 'image' ? 'Foto' :
               el.type === 'shape' ? 'Forma' : 'Sticker'}
            </div>
            <Trash2 size={18} className="text-red-400" onClick={e => { e.stopPropagation(); remove(el.id); }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}