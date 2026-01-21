import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, Heart, Plus, Type, Image as ImageIcon, X, Trash2, 
  Maximize, Minimize, RotateCcw, Star, Square, Circle, 
  Download, Palette, Layers, Wand2, Settings, Scissors,
  Type as FontIcon, Brush, Sparkles, Languages, Frame
} from 'lucide-react';
import { toPng } from 'html-to-image';

export default function DeylinStudioTitan() {
  // ESTADOS DE DISEÑO
  const [style, setStyle] = useState('classic');
  const [border, setBorder] = useState('none');
  const [font, setFont] = useState("'Playfair Display', serif");
  const [elements, setElements] = useState([
    { id: 'main-txt', type: 'text', content: 'Toca para editar mensaje principal...', x: 50, y: 100, size: 35, rotate: 0, color: '#1a1a1a', zIndex: 10 }
  ]);
  
  // ESTADOS DE UI
  const [selectedId, setSelectedId] = useState(null);
  const [activeSheet, setActiveSheet] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [preview, setPreview] = useState(null);
  const canvasRef = useRef(null);
  const fileRef = useRef(null);

  // LÓGICA DE AGREGAR ELEMENTOS (EMOJIS, IMÁGENES, TEXTO)
  const addElement = (type, content = '', extra = {}) => {
    const newEl = {
      id: Date.now().toString(),
      type,
      content,
      x: 20,
      y: 150,
      size: type === 'text' ? 30 : 120,
      rotate: 0,
      mask: 'none',
      filter: 'none',
      zIndex: elements.length + 1,
      ...extra
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
    setActiveSheet(null);
  };

  // ACTUALIZAR ELEMENTO INDIVIDUAL
  const updateEl = (id, props) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...props } : el));
  };

  // ELIMINAR
  const deleteEl = (id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  };

  // EXPORTAR A IMAGEN (LIMPIA SELECCIONES ANTES)
  const handleExport = async () => {
    setSelectedId(null);
    setIsExporting(true);
    setTimeout(async () => {
      try {
        const dataUrl = await toPng(canvasRef.current, { 
          pixelRatio: 3, 
          skipFonts: false,
          style: { borderRadius: '0' } 
        });
        setPreview(dataUrl);
      } catch (err) {
        console.error("Error al exportar:", err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  return (
    <div className="h-screen w-full bg-[#050505] text-white flex flex-col overflow-hidden font-sans selection:bg-orange-500/30">
      
      {/* HEADER SUPERIOR PRO */}
      <header className="p-4 flex justify-between items-center bg-black/90 backdrop-blur-2xl border-b border-white/10 z-[100] shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <Wand2 size={22} className="text-white" />
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter uppercase italic">Titan Studio</h1>
            <p className="text-[8px] text-gray-500 tracking-[0.4em] uppercase font-bold">Deylin Engine Pro v5.0</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          className="bg-gradient-to-r from-orange-500 to-red-700 px-6 py-2.5 rounded-2xl font-black text-xs shadow-xl active:scale-90 transition-all uppercase tracking-widest"
        >
          Finalizar
        </button>
      </header>

      {/* ÁREA DE TRABAJO (CANVAS RESPONSIVO) */}
      <main className="flex-1 relative flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_#111_0%,_#000_100%)]">
        <div 
          ref={canvasRef}
          onClick={() => setSelectedId(null)}
          className={`relative w-full max-w-[420px] aspect-[9/13] shadow-[0_60px_120px_rgba(0,0,0,1)] transition-all duration-700 overflow-hidden
            ${getPaperStyle(style)}
            ${getBorderStyle(border)}
          `}
        >
          {/* Capas del diseño */}
          {elements.sort((a,b) => a.zIndex - b.zIndex).map((el) => (
            <motion.div
              key={el.id}
              drag
              dragMomentum={false}
              dragConstraints={canvasRef} // EVITA QUE SALGAN DEL CUADRO
              onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); }}
              className={`absolute cursor-move group ${selectedId === el.id ? 'z-50' : ''}`}
              style={{ x: el.x, y: el.y, rotate: el.rotate, width: el.type === 'text' ? 'auto' : el.size }}
            >
              {/* Indicador de selección pro */}
              {selectedId === el.id && (
                <div className="absolute -inset-2 border-2 border-orange-500 rounded-sm pointer-events-none animate-pulse">
                  <div className="absolute -top-2 -left-2 w-3 h-3 bg-white border border-orange-500" />
                  <div className="absolute -top-2 -right-2 w-3 h-3 bg-white border border-orange-500" />
                  <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-white border border-orange-500" />
                  <div className="absolute -bottom-2 -right-2 w-3 h-3 bg-white border border-orange-500" />
                </div>
              )}

              {el.type === 'text' ? (
                <div 
                  contentEditable 
                  spellCheck="false"
                  onBlur={(e) => updateEl(el.id, { content: e.target.innerText })}
                  style={{ fontFamily: font, fontSize: el.size, color: el.color }}
                  className="outline-none min-w-[100px] whitespace-pre-wrap leading-tight drop-shadow-sm p-2"
                >
                  {el.content}
                </div>
              ) : (
                <img 
                  src={el.content} 
                  className="w-full h-auto block pointer-events-none" 
                  style={{ 
                    filter: el.filter,
                    clipPath: getMask(el.mask)
                  }}
                />
              )}
            </motion.div>
          ))}
        </div>
      </main>

      {/* TOOLBAR PRINCIPAL (CATEGORÍAS) */}
      <nav className="p-4 grid grid-cols-5 gap-2 bg-[#0a0a0a] border-t border-white/5 z-50">
        <ToolBtn icon={<Flame/>} label="Papeles" onClick={() => setActiveSheet('papers')} color="text-orange-500" />
        <ToolBtn icon={<Frame/>} label="Marcos" onClick={() => setActiveSheet('borders')} color="text-cyan-400" />
        <ToolBtn icon={<FontIcon/>} label="Letras" onClick={() => setActiveSheet('fonts')} color="text-blue-400" />
        <ToolBtn icon={<Plus/>} label="Emojis" onClick={() => setActiveSheet('emojis')} color="text-yellow-500" />
        <ToolBtn icon={<ImageIcon/>} label="Fotos" onClick={() => fileRef.current.click()} color="text-purple-500" />
      </nav>

      {/* INPUT GALERÍA OCULTO */}
      <input ref={fileRef} type="file" hidden accept="image/*" onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (f) => addElement('image', f.target.result);
          reader.readAsDataURL(file);
        }
      }} />
      {/* CONTINUACIÓN DE App.jsx - PESTAÑAS Y ESTILOS */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setActiveSheet(null)} className="fixed inset-0 bg-black/80 z-[120] backdrop-blur-sm"/>
            <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',damping:25,stiffness:200}} className="fixed bottom-0 left-0 w-full bg-[#111] rounded-t-[50px] p-8 z-[130] border-t border-white/10 shadow-2xl max-h-[75vh] overflow-y-auto">
              <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-10"/>

              {/* SELECTOR DE PAPELES (10 ESTILOS) */}
              {activeSheet === 'papers' && (
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {['classic','notebook','burn','ancient','dark','galaxy','cotton','carbon','blueprint','pink-love'].map(p => (
                    <PaperCard key={p} active={style === p} label={p.toUpperCase()} onClick={()=>setStyle(p)} className={getPaperStyle(p)} />
                  ))}
                </div>
              )}

              {/* SELECTOR DE BORDES (15 ESTILOS) */}
              {activeSheet === 'borders' && (
                <div className="grid grid-cols-2 gap-4 pb-10">
                  {['none','gold','neon','floral','retro','dots','shadow','silver','vignette','dashed','double','royal','sketch','glitch','frame-3d'].map(b => (
                    <button key={b} onClick={()=>{setBorder(b);setActiveSheet(null);}} className={`p-4 rounded-2xl border-2 transition-all font-bold text-[10px] tracking-widest ${border === b ? 'border-orange-500 bg-orange-500/10' : 'border-white/5 bg-white/5'}`}>
                      {b.toUpperCase()}
                    </button>
                  ))}
                </div>
              )}

              {/* SELECTOR DE FUENTES (9 ESTILOS) */}
              {activeSheet === 'fonts' && (
                <div className="flex flex-col gap-3 pb-10">
                  {["'Playfair Display'", "'Caveat'", "'Dancing Script'", "'Special Elite'", "'Bebas Neue'", "'Indie Flower'", "'Great Vibes'", "'Cinzel'", "'Pacifico'"].map(f => (
                    <button key={f} onClick={()=>{setFont(f);setActiveSheet(null);}} className="w-full p-6 bg-white/5 rounded-3xl text-left text-2xl border border-white/5 active:scale-95 transition-all" style={{fontFamily:f}}>
                      Texto Estilo {f.split("'")[1]}
                    </button>
                  ))}
                </div>
              )}

              {/* SELECTOR DE 100 EMOJIS (MUESTRA DE CATEGORÍAS) */}
              {activeSheet === 'emojis' && (
                <div className="grid grid-cols-5 gap-6 text-4xl p-2 place-items-center pb-10">
                  {['✨','❤️','🔥','👑','🦋','💎','🌹','🧸','⭐','🌙','🍭','🎀','💸','🧿','📸','🖤','🔥','🧊','🌈','🧨','🍒','🍓','🍕','🍩','🍔','🍟','🧁','🍹','🥥','🥑','🪐','🌍','🚀','🛸','🛸','👾','🎮','🎧','🎸','🎹','🎻','🎨','🎭','🎬','🎤','🏆','🏅','🎯','🎲','🎰','🎱','🧩','🧸','📱','💻','⌨️','🖥️','⌚','📷','📽️','🔦','💡','💵','💰','💳','💎','⚖️','⚙️','🛠️','⛏️','💊','🩸','🩹','🩺','🔭','🔬','🧬','🦠','🧫','🧪','🌡️','🧹','🧺','🧻','🧼','🪠','🧽','🪣','🧴','🧵','🧶','🧶','🧵','🧴','🧽','🧼','🧻','🧺','🧹'].map((e, i) => (
                    <button key={i} onClick={()=>addElement('emoji', e)} className="active:scale-150 transition-all hover:rotate-12">{e}</button>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* MODAL DE VISTA PREVIA Y COMPARTIR (ESTILO CANVA/CAPCUT) */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{opacity:0, scale:1.1}} animate={{opacity:1, scale:1}} className="fixed inset-0 bg-black z-[200] flex flex-col items-center p-6 overflow-y-auto">
            <header className="w-full flex justify-between items-center mb-8">
              <button onClick={()=>setPreview(null)} className="p-3 bg-white/10 rounded-full"><X/></button>
              <h3 className="font-black italic tracking-widest text-orange-500">DISEÑO FINALIZADO</h3>
              <div className="w-10"/>
            </header>

            <div className="w-full max-w-sm aspect-[9/13] rounded-[40px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,1)] border border-white/10 mb-8">
              <img src={preview} className="w-full h-full object-contain bg-[#111]" />
            </div>

            <div className="w-full max-w-md space-y-4">
              <button onClick={()=>{const a=document.createElement('a'); a.download='DeylinTitan.png'; a.href=preview; a.click();}} className="w-full py-5 bg-white text-black rounded-[25px] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                <Download size={24}/> GUARDAR GALERÍA
              </button>
              
              <div className="grid grid-cols-4 gap-4 py-4">
                <ShareBtn icon={<MessageCircle/>} color="bg-green-500" label="WhatsApp" />
                <ShareBtn icon={<Instagram/>} color="bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600" label="Instagram" />
                <ShareBtn icon={<Send/>} color="bg-blue-400" label="Telegram" />
                <ShareBtn icon={<Share2/>} color="bg-gray-700" label="Otros" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDERER DE LÓGICA DE ESTILOS (FUNCIONES HELPER) */}
      {/* Aquí es donde la magia ocurre para los 10 papeles y 15 bordes */}
    </div>
  );
}

// FUNCIONES DE APOYO PARA ESTILOS DINÁMICOS
const getPaperStyle = (s) => {
  const styles = {
    'classic': 'bg-white',
    'notebook': 'bg-notebook',
    'burn': 'borde-quemado bg-[#f3e5ab]',
    'ancient': 'bg-[#c4a484] shadow-inner opacity-90',
    'dark': 'bg-[#121212]',
    'galaxy': 'bg-black shadow-[inset_0_0_80px_rgba(79,70,229,0.3)]',
    'cotton': 'bg-[#f8f9fa] shadow-sm',
    'carbon': 'bg-[#1a1a1a] opacity-95',
    'blueprint': 'bg-[#003366] opacity-90',
    'pink-love': 'bg-[#fff0f3]'
  };
  return styles[s] || styles.classic;
};

const getBorderStyle = (b) => {
  const borders = {
    'gold': 'border-[15px] border-double border-[#d4af37] ring-4 ring-yellow-900/20 ring-inset',
    'neon': 'border-[3px] border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]',
    'floral': 'border-[20px] border-solid border-[#2d5a27] shadow-inner',
    'retro': 'border-[12px] border-double border-red-900 bg-clip-content ring-4 ring-black',
    'dots': 'border-[8px] border-dotted border-gray-400',
    'silver': 'border-[15px] border-double border-[#C0C0C0]',
    'royal': 'border-[20px] border-solid border-[#4b0082] ring-4 ring-yellow-500',
    'glitch': 'border-[4px] border-solid border-red-500 shadow-[4px_0_blue,-4px_0_red]'
  };
  return borders[b] || 'border-none';
};

const getMask = (m) => {
  if(m === 'heart') return 'path("M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z")';
  if(m === 'circle') return 'circle(50%)';
  if(m === 'star') return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
  return 'none';
};

function ToolBtn({icon, label, onClick, color}){
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 active:scale-90 transition-transform">
      <div className={`p-4 bg-white/5 rounded-2xl mb-1 ${color}`}>{icon}</div>
      <span className="text-[9px] font-black text-gray-600 uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function PaperCard({label, active, onClick, className}){
  return (
    <div onClick={onClick} className={`relative aspect-square rounded-3xl cursor-pointer overflow-hidden border-2 transition-all ${active ? 'border-orange-500 scale-95 shadow-lg' : 'border-transparent opacity-40'}`}>
      <div className={`w-full h-full ${className}`} />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <span className="text-white font-black text-[9px] tracking-widest">{label}</span>
      </div>
    </div>
  );
}

function ShareBtn({icon, color, label}){
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-14 h-14 ${color} rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all`}>{React.cloneElement(icon, {size: 24, color: 'white'})}</div>
      <span className="text-[9px] font-bold opacity-50 uppercase">{label}</span>
    </div>
  );
}
