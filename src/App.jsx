import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Heart, Plus, Book, Download, Type, Image as ImageIcon, 
  X, Trash2, Maximize, Minimize, RotateCcw, Star, Square, Circle,
  Share2, MessageCircle, Instagram, Send, Palette, Layers, MousePointer2
} from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  const [style, setStyle] = useState('notebook');
  const [border, setBorder] = useState('none');
  const [elements, setElements] = useState([
    { id: 'initial-text', type: 'text', content: 'Toca para editar tu mensaje...', x: 50, y: 100, size: 28, rotate: 0, font: "'Poppins', sans-serif", color: '#000000' }
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content,
      x: 40,
      y: 150,
      size: type === 'text' ? 24 : 120,
      rotate: 0,
      mask: 'none',
      ...extra
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  const updateElement = (id, props) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
  };

  const deleteElement = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
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

  const handleExport = async () => {
    setSelectedId(null);
    setIsExporting(true);
    setTimeout(async () => {
      const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3, cacheBust: true });
      setPreviewUrl(dataUrl);
      setIsExporting(false);
    }, 500);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="min-h-screen w-full bg-[#080808] text-white flex flex-col items-center overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* HEADER SUPERIOR */}
      <header className="w-full p-4 flex justify-between items-center bg-black/40 backdrop-blur-md z-[100] border-b border-white/5">
        <div className="flex flex-col">
          <h1 className="text-orange-500 font-black tracking-tighter text-xl">DEYLIN STUDIO</h1>
          <span className="text-[8px] text-gray-500 tracking-[0.3em] uppercase">Creative Engine v2.0</span>
        </div>
        <button 
          onClick={handleExport}
          className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-2 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-95 transition-all flex items-center gap-2"
        >
          <Download size={16} /> LISTO
        </button>
      </header>

      {/* ÁREA DE TRABAJO */}
      <main className="flex-1 w-full flex items-center justify-center p-4 relative">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-sm aspect-[3/4] shadow-[0_40px_100px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-700 select-none
            ${style === 'burn' ? 'borde-quemado bg-[#f4e4bc]' : ''}
            ${style === 'notebook' ? 'bg-notebook' : ''}
            ${style === 'crumped' ? 'bg-crumped' : ''}
            ${style === 'vintage' ? 'bg-[#eaddca] sepia-[0.3]' : ''}
            ${style === 'galaxy' ? 'bg-[#000000] shadow-[inset_0_0_100px_rgba(79,70,229,0.3)]' : ''}
            ${border === 'gold' ? 'border-[12px] border-double border-[#bf953f]' : ''}
            ${border === 'neon' ? 'border-[2px] border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]' : ''}
            ${border === 'dots' ? 'border-[6px] border-dotted border-gray-400' : ''}
            ${border === 'floral' ? 'border-[15px] border-solid border-[#2d5a27] shadow-inner' : ''}
          `}
        >
          {elements.map((el) => (
            <motion.div 
              key={el.id} 
              drag 
              dragMomentum={false}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={`absolute z-20 cursor-move group ${selectedId === el.id ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''}`}
              style={{ x: el.x, y: el.y, width: el.type === 'text' ? 'auto' : el.size, rotate: el.rotate }}
              onDragEnd={(_, info) => updateElement(el.id, { x: el.x + info.offset.x, y: el.y + info.offset.y })}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  spellCheck="false"
                  onBlur={(e) => updateElement(el.id, { content: e.target.innerText })}
                  style={{ fontFamily: el.font, fontSize: el.size, color: el.color }}
                  className="outline-none min-w-[50px] whitespace-pre-wrap leading-tight drop-shadow-sm"
                >
                  {el.content}
                </div>
              ) : el.type === 'image' ? (
                <img 
                  src={el.content} 
                  className="w-full h-full object-cover shadow-xl pointer-events-none" 
                  style={{ clipPath: el.mask === 'heart' ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' : 
                                     el.mask === 'circle' ? 'circle(50%)' : 
                                     el.mask === 'star' ? 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' : 'none' }} 
                />
              ) : (
                <span className="block text-center select-none" style={{ fontSize: el.size }}>{el.content}</span>
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* MENÚ CONTEXTUAL PARA ELEMENTOS SELECCIONADOS */}
      <AnimatePresence>
        {selectedId && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }} 
            className="fixed bottom-32 flex flex-wrap justify-center gap-2 bg-black/90 backdrop-blur-xl p-3 rounded-2xl border border-white/20 z-[60] max-w-[95%]"
          >
            <button onClick={() => updateElement(selectedId, { size: selectedEl.size + (selectedEl.type === 'text' ? 2 : 10) })} className="p-2 bg-white/10 rounded-lg hover:bg-white/20"><Maximize size={20}/></button>
            <button onClick={() => updateElement(selectedId, { size: Math.max(10, selectedEl.size - (selectedEl.type === 'text' ? 2 : 10)) })} className="p-2 bg-white/10 rounded-lg"><Minimize size={20}/></button>
            <button onClick={() => updateElement(selectedId, { rotate: selectedEl.rotate + 15 })} className="p-2 bg-white/10 rounded-lg"><RotateCcw size={20}/></button>
            
            {selectedEl.type === 'text' && (
              <button onClick={() => setActiveSheet('font')} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Type size={20}/></button>
            )}
            
            {selectedEl.type === 'image' && (
              <div className="flex gap-1 border-x border-white/10 px-2">
                <button onClick={() => updateElement(selectedId, { mask: 'heart' })} className="p-2 text-pink-500"><Heart size={20}/></button>
                <button onClick={() => updateElement(selectedId, { mask: 'circle' })} className="p-2 text-blue-500"><Circle size={20}/></button>
                <button onClick={() => updateElement(selectedId, { mask: 'star' })} className="p-2 text-yellow-500"><Star size={20}/></button>
              </div>
            )}
            <button onClick={() => deleteElement(selectedId)} className="p-2 bg-red-500/20 text-red-500 rounded-lg"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOOLBAR INFERIOR REORGANIZADO */}
      <nav className="w-full max-w-md bg-[#111] rounded-t-3xl p-4 grid grid-cols-5 gap-2 border-t border-white/5 shadow-2xl z-50">
        <ToolBtn icon={<Flame/>} label="Papel" onClick={() => setActiveSheet('paper')} color="text-orange-500" />
        <ToolBtn icon={<Square/>} label="Bordes" onClick={() => setActiveSheet('border')} color="text-cyan-400" />
        <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text', 'Nuevo Mensaje')} color="text-blue-500" />
        <ToolBtn icon={<Plus/>} label="Emoji" onClick={() => setActiveSheet('emoji')} color="text-yellow-500" />
        <ToolBtn icon={<ImageIcon/>} label="Foto" onClick={() => fileInputRef.current.click()} color="text-purple-500" />
      </nav>

      <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleFileUpload} />

      {/* PESTAÑAS DE EDICIÓN */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[70]" />
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }} 
              className="fixed bottom-0 left-0 w-full bg-[#151515] rounded-t-[40px] p-8 z-[80] border-t border-white/10 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              {activeSheet === 'paper' && (
                <div className="grid grid-cols-2 gap-4">
                  <PreviewCard label="Libreta" active={style === 'notebook'} onClick={() => setStyle('notebook')} className="bg-notebook" />
                  <PreviewCard label="Quemado" active={style === 'burn'} onClick={() => setStyle('burn')} className="borde-quemado bg-[#f4e4bc]" />
                  <PreviewCard label="Vintage" active={style === 'vintage'} onClick={() => setStyle('vintage')} className="bg-[#eaddca] opacity-80" />
                  <PreviewCard label="Galaxia" active={style === 'galaxy'} onClick={() => setStyle('galaxy')} className="bg-black shadow-[inset_0_0_20px_purple]" />
                </div>
              )}

              {activeSheet === 'border' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setBorder('none')} className="p-4 rounded-xl border border-white/5 bg-white/5 font-bold">Sin Borde</button>
                  <button onClick={() => setBorder('gold')} className="p-4 rounded-xl border-4 border-double border-yellow-600 bg-yellow-900/20 font-bold">Dorado Pro</button>
                  <button onClick={() => setBorder('neon')} className="p-4 rounded-xl border-2 border-cyan-400 bg-cyan-900/20 shadow-[0_0_10px_cyan] font-bold text-cyan-400">Neón Cyber</button>
                  <button onClick={() => setBorder('floral')} className="p-4 rounded-xl border-8 border-green-900 bg-green-900/10 font-bold text-green-200">Borde Natural</button>
                </div>
              )}

              {activeSheet === 'font' && (
                <div className="space-y-3">
                  {["'Poppins'", "'Great Vibes'", "'Special Elite'", "'Dancing Script'", "'Playfair Display'"].map(f => (
                    <button 
                      key={f} 
                      onClick={() => { updateElement(selectedId, { font: f }); setActiveSheet(null); }}
                      className="w-full p-5 bg-white/5 rounded-2xl text-left text-xl transition-colors hover:bg-white/10"
                      style={{ fontFamily: f }}
                    >
                      Estilo de letra {f.split("'")[1]}
                    </button>
                  ))}
                </div>
              )}

              {activeSheet === 'emoji' && (
                <div className="grid grid-cols-5 gap-6 text-4xl p-2 place-items-center">
                  {['✨','❤️','🔥','👑','🦋','💎','🌹','☁️','🧸','⭐','🌙','🍭','🎀','🍓','🧿','💸','📸','🖤'].map(e => (
                    <button key={e} onClick={() => addElement('emoji', e)} className="active:scale-125 transition-all">{e}</button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE EXPORTACIÓN FINAL (TIPO CAPCUT) */}
      <AnimatePresence>
        {previewUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6 overflow-y-auto">
            <button onClick={() => setPreviewUrl(null)} className="absolute top-6 right-6 p-2 bg-white/10 rounded-full"><X/></button>
            
            <h2 className="text-2xl font-black mb-6 text-green-400">¡DISEÑO LISTO!</h2>
            
            <div className="w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)] border border-white/10 mb-8">
              <img src={previewUrl} className="w-full h-full object-contain bg-[#111]" />
            </div>

            <div className="w-full max-w-sm space-y-4">
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.download = 'deylin-design.png';
                  link.href = previewUrl;
                  link.click();
                }}
                className="w-full py-4 bg-white text-black rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-xl"
              >
                <Download /> GUARDAR EN GALERÍA
              </button>

              <div className="grid grid-cols-4 gap-3">
                <ShareIcon icon={<MessageCircle/>} color="bg-green-500" label="WhatsApp" onClick={() => window.open(`whatsapp://send?text=Mira mi diseño!`)} />
                <ShareIcon icon={<Instagram/>} color="bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600" label="Instagram" />
                <ShareIcon icon={<Send/>} color="bg-blue-500" label="Telegram" />
                <ShareIcon icon={<Share2/>} color="bg-gray-700" label="Otros" />
              </div>

              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-center">
                <p className="text-gray-400 text-sm">Compártelo ahora en tus redes sociales</p>
                <div className="flex justify-center gap-6 mt-4 opacity-50">
                  <span className="font-bold text-xs uppercase">TikTok</span>
                  <span className="font-bold text-xs uppercase">Facebook</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* OVERLAY DE CARGA */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="font-black tracking-widest animate-pulse">PROCESANDO RENDER...</p>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition-transform group">
      <div className={`p-3 bg-white/5 rounded-2xl mb-1 group-hover:bg-white/10 transition-colors ${color}`}>{icon}</div>
      <span className="text-[10px] font-bold text-gray-500">{label}</span>
    </button>
  );
}

function PreviewCard({ label, active, onClick, className }) {
  return (
    <div onClick={onClick} className={`relative aspect-square rounded-2xl cursor-pointer overflow-hidden border-2 transition-all ${active ? 'border-orange-500 scale-95 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-transparent opacity-40'}`}>
      <div className={`w-full h-full ${className}`} />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <span className="text-white font-black text-[10px] uppercase tracking-tighter">{label}</span>
      </div>
    </div>
  );
}

function ShareIcon({ icon, color, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2">
      <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform`}>
        {React.cloneElement(icon, { size: 20, color: 'white' })}
      </div>
      <span className="text-[9px] font-bold text-gray-500">{label}</span>
    </button>
  );
}
