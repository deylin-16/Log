import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Book, StickyNote, Download, Image as ImageIcon } from 'lucide-react';
import { toPng } from 'html-to-image';

export default function App() {
  const [style, setStyle] = useState('notebook');

  const exportImage = () => {
    toPng(document.getElementById('canvas'), { quality: 0.95 })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'deylin-design.png';
        link.href = dataUrl;
        link.click();
      });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white flex flex-col items-center p-4 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-widest text-orange-500">DEYLIN STUDIO PRO</h1>
        <p className="text-xs text-gray-400">Diseño Hiperrealista</p>
      </header>

      {/* ÁREA DEL CANVAS */}
      <motion.div 
        id="canvas"
        layout
        className={`w-full max-w-sm aspect-[3/4] p-8 relative shadow-2xl transition-all duration-500
          ${style === 'burn' ? 'bg-vintage [clip-path:polygon(2%_1%,_95%_4%,_100%_95%,_3%_98%,_1%_50%)] shadow-fuego border-2 border-black/20' : ''}
          ${style === 'notebook' ? 'bg-notebook rounded-sm border border-blue-200' : ''}
          ${style === 'crumped' ? 'bg-crumped rounded-lg shadow-black/50' : ''}
        `}
      >
        <div contentEditable className="text-black text-2xl font-serif outline-none h-full w-full">
          Escribe tu mensaje aquí...
        </div>
      </motion.div>

      {/* TOOLBAR INFERIOR */}
      <div className="fixed bottom-8 flex gap-3 bg-white/5 backdrop-blur-xl p-4 rounded-full border border-white/10">
        <button onClick={() => setStyle('burn')} className="p-3 bg-orange-600 rounded-full hover:scale-110 transition-transform">
          <Flame size={20} />
        </button>
        <button onClick={() => setStyle('notebook')} className="p-3 bg-blue-600 rounded-full hover:scale-110 transition-transform">
          <Book size={20} />
        </button>
        <button onClick={() => setStyle('crumped')} className="p-3 bg-gray-600 rounded-full hover:scale-110 transition-transform">
          <StickyNote size={20} />
        </button>
        <div className="w-[1px] bg-white/20 mx-2"></div>
        <button onClick={exportImage} className="p-3 bg-green-600 rounded-full hover:scale-110 transition-transform">
          <Download size={20} />
        </button>
      </div>
    </div>
  );
}
