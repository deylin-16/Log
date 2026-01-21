import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Heart, Plus, Book, Download, Type, Image as ImageIcon, 
  X, Trash2, Maximize, Minimize, RotateCcw, Star, Square, Circle,
  Share2, MessageCircle, Instagram, Send, Palette, Video, Music, 
  Settings, Layers, Move, Sparkles, Wand2
} from 'lucide-react';
import { toPng } from 'html-to-image';

export default function DeylinStudioUltra() {
  const [style, setStyle] = useState('notebook');
  const [border, setBorder] = useState('none');
  const [elements, setElements] = useState([
    { id: '1', type: 'text', content: 'Toca para escribir...', x: 50, y: 80, size: 32, rotate: 0, font: "'Caveat'", color: '#1a1a1a', animation: 'none' }
  ]);
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [exportModal, setExportModal] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content,
      x: 50,
      y: 150,
      size: type === 'text' ? 28 : 150,
      rotate: 0,
      opacity: 1,
      ...extra
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateEl = (id, props) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
  };

  const handleExportVideo = () => {
    setIsRecording(true);
    // Simulación de renderizado de video con animaciones de CSS
    setTimeout(() => {
      handleExportImage(); // Por ahora exporta captura, pero activa el flujo de video
      setIsRecording(false);
    }, 3000);
  };

  const handleExportImage = async () => {
    setSelectedId(null);
    const dataUrl = await toPng(canvasRef.current, { pixelRatio: 3 });
    setExportModal(dataUrl);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden select-none">
      
      {/* Top Bar Profesional */}
      <header className="p-4 flex justify-between items-center bg-black/60 backdrop-blur-xl border-b border-white/10 z-[100]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Wand2 size={18} />
          </div>
          <h1 className="font-black text-lg tracking-tighter italic">DEYLIN STUDIO <span className="text-orange-500">ULTRA</span></h1>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportVideo} className="p-2 bg-white/5 rounded-full text-blue-400 border border-white/10 active:scale-90"><Video size={20}/></button>
          <button onClick={handleExportImage} className="bg-orange-500 px-5 py-1.5 rounded-full font-black text-xs shadow-lg shadow-orange-500/40">LISTO</button>
        </div>
      </header>

      {/* Workspace con ajuste de pantalla */}
      <main className="flex-1 relative flex items-center justify-center p-6 overflow-hidden">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full aspect-[9/12] max-h-[75vh] shadow-[0_50px_100px_rgba(0,0,0,0.8)] transition-all duration-500
            ${style === 'notebook' ? 'bg-notebook shadow-inner' : ''}
            ${style === 'burn' ? 'borde-quemado bg-[#f3e5ab]' : ''}
            ${style === 'letter' ? 'bg-[#fffdf0] border-l-[30px] border-[#e0d9b0] shadow-xl' : ''}
            ${style === 'dark-magic' ? 'bg-gradient-to-b from-[#1a1a2e] to-[#16213e] shadow-[0_0_40px_rgba(79,70,229,0.2)]' : ''}
            ${border === 'gold' ? 'border-[15px] border-double border-[#d4af37]' : ''}
            ${border === 'neon' ? 'border-[3px] border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.5)]' : ''}
            ${border === 'floral' ? 'border-[20px] border-solid border-green-900 bg-clip-padding' : ''}
          `}
        >
          {elements.map((el) => (
            <motion.div
              key={el.id}
              drag
              dragMomentum={false}
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={`absolute z-20 cursor-move ${selectedId === el.id ? 'ring-2 ring-orange-500 ring-offset-4 ring-offset-transparent' : ''}`}
              style={{ x: el.x, y: el.y, rotate: el.rotate, width: el.type === 'text' ? 'auto' : el.size }}
            >
              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  spellCheck="false"
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText })}
                  style={{ fontFamily: el.font, fontSize: el.size, color: el.color }}
                  className={`outline-none min-w-[100px] whitespace-pre-wrap leading-tight drop-shadow-md ${el.animation === 'typewriter' ? 'animate-typewriter' : ''}`}
                >
                  {el.content}
                </div>
              ) : (
                <img 
                  src={el.content} 
                  className="w-full h-auto pointer-events-none rounded-sm shadow-lg" 
                  style={{ 
                    filter: el.filter || 'none',
                    clipPath: el.mask === 'heart' ? 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")' : 'none' 
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* Editor Contextual Pro */}
      <AnimatePresence>
        {selectedId && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="absolute bottom-32 left-1/2 -translate-x-1/2 w-[90%] bg-black/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-3 flex flex-wrap justify-center gap-3 z-[110] shadow-2xl">
            <button onClick={() => updateEl(selectedId, { size: selectedEl.size + 10 })} className="p-3 bg-white/5 rounded-xl"><Maximize size={20}/></button>
            <button onClick={() => updateEl(selectedId, { size: Math.max(10, selectedEl.size - 10) })} className="p-3 bg-white/5 rounded-xl"><Minimize size={20}/></button>
            <button onClick={() => updateEl(selectedId, { rotate: selectedEl.rotate + 15 })} className="p-3 bg-white/5 rounded-xl"><RotateCcw size={20}/></button>
            <button onClick={() => setActiveSheet('style-el')} className="p-3 bg-white/5 rounded-xl text-orange-400"><Palette size={20}/></button>
            <button onClick={() => deleteElement(selectedId)} className="p-3 bg-red-500/20 text-red-500 rounded-xl"><Trash2 size={20}/></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav Principal */}
      <nav className="p-4 grid grid-cols-5 gap-2 bg-[#111] border-t border-white/10">
        <ToolBtn icon={<Sparkles/>} label="Efectos" onClick={() => setActiveSheet('paper')} color="text-yellow-400" />
        <ToolBtn icon={<Layers/>} label="Bordes" onClick={() => setActiveSheet('border')} color="text-cyan-400" />
        <ToolBtn icon={<Type/>} label="Texto" onClick={() => addElement('text', 'Nuevo texto')} color="text-blue-400" />
        <ToolBtn icon={<Plus/>} label="Extra" onClick={() => setActiveSheet('emoji')} color="text-pink-400" />
        <ToolBtn icon={<ImageIcon/>} label="Galería" onClick={() => fileRef.current.click()} color="text-purple-400" />
      </nav>

      <input ref={fileRef} type="file" hidden onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (f) => addElement('image', f.target.result);
          reader.readAsDataURL(file);
        }
      }} />

      {/* Sheets Expandibles */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[120]" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="fixed bottom-0 left-0 w-full bg-[#181818] rounded-t-[40px] p-8 z-[130] border-t border-white/10 shadow-2xl max-h-[70vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              
              {activeSheet === 'paper' && (
                <div className="grid grid-cols-2 gap-4">
                  <PaperCard label="CARTA" active={style === 'letter'} onClick={() => setStyle('letter')} className="bg-[#fffdf0] border-l-4 border-yellow-200" />
                  <PaperCard label="QUEMADO" active={style === 'burn'} onClick={() => setStyle('burn')} className="borde-quemado bg-[#f3e5ab]" />
                  <PaperCard label="LIBRETA" active={style === 'notebook'} onClick={() => setStyle('notebook')} className="bg-notebook" />
                  <PaperCard label="GALAXY" active={style === 'dark-magic'} onClick={() => setStyle('dark-magic')} className="bg-gradient-to-b from-[#1a1a2e] to-[#16213e]" />
                </div>
              )}

              {activeSheet === 'border' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setBorder('gold')} className="p-5 border-4 border-double border-yellow-600 rounded-2xl font-black text-yellow-600">MARCO REAL</button>
                  <button onClick={() => setBorder('neon')} className="p-5 border-2 border-cyan-400 rounded-2xl font-black text-cyan-400 shadow-[0_0_10px_cyan]">NEON ULTRA</button>
                </div>
              )}

              {activeSheet === 'style-el' && selectedEl?.type === 'text' && (
                <div className="space-y-6">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {["'Caveat'", "'Dancing Script'", "'Indie Flower'", "'Special Elite'", "'Playfair Display'"].map(f => (
                      <button key={f} onClick={() => updateEl(selectedId, { font: f })} className="px-6 py-3 bg-white/5 rounded-xl whitespace-nowrap" style={{ fontFamily: f }}>Letra {f}</button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => updateEl(selectedId, { animation: 'typewriter' })} className="p-4 bg-blue-500/20 rounded-xl font-bold">Animar Texto</button>
                    <button onClick={() => updateEl(selectedId, { color: '#ff0000' })} className="p-4 bg-red-500/20 rounded-xl font-bold">Color Rojo</button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export Preview Modal */}
      <AnimatePresence>
        {exportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6">
            <button onClick={() => setExportModal(null)} className="absolute top-6 right-6 p-3 bg-white/10 rounded-full"><X/></button>
            <div className="w-full max-w-xs aspect-[9/12] rounded-3xl overflow-hidden shadow-2xl mb-8 mt-10 border border-white/20">
              <img src={exportModal} className="w-full h-full object-cover" />
            </div>
            <div className="w-full max-w-sm space-y-4">
              <button onClick={() => { const a = document.createElement('a'); a.download='deylin.png'; a.href=exportModal; a.click(); }} className="w-full py-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl font-black text-lg flex items-center justify-center gap-3">
                <Download size={24}/> GUARDAR GALERÍA
              </button>
              <div className="grid grid-cols-4 gap-4 text-center">
                <SocialIcon icon={<MessageCircle/>} label="WhatsApp" color="bg-green-500" />
                <SocialIcon icon={<Instagram/>} label="Instagram" color="bg-gradient-to-tr from-orange-400 to-purple-600" />
                <SocialIcon icon={<Send/>} label="Telegram" color="bg-blue-400" />
                <SocialIcon icon={<Share2/>} label="Otros" color="bg-gray-600" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording && (
        <div className="fixed inset-0 bg-black/90 z-[300] flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_blue]" />
          <p className="font-black text-xl tracking-[0.3em] animate-pulse">GENERANDO VIDEO...</p>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ icon, label, onClick, color }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
      <div className={`p-3 bg-white/5 rounded-2xl mb-1 ${color}`}>{icon}</div>
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function PaperCard({ label, active, onClick, className }) {
  return (
    <div onClick={onClick} className={`relative aspect-video rounded-2xl cursor-pointer overflow-hidden border-2 transition-all ${active ? 'border-orange-500 scale-95 shadow-lg' : 'border-transparent opacity-40'}`}>
      <div className={`w-full h-full ${className}`} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
        <span className="text-white font-black text-xs tracking-widest">{label}</span>
      </div>
    </div>
  );
}

function SocialIcon({ icon, label, color }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 ${color} rounded-full flex items-center justify-center shadow-lg`}>{React.cloneElement(icon, { size: 24, color: 'white' })}</div>
      <span className="text-[10px] font-bold opacity-60 uppercase">{label}</span>
    </div>
  );
}
