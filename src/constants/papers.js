// constants/papers.js

export const PAPERS = {
  // ── Básicos y limpios ───────────────────────────────────────
  classic: "bg-white",
  pureWhite: "bg-white shadow-[inset_0_0_40px_rgba(0,0,0,0.04)]",
  offWhite: "bg-[#fdfdfd] shadow-[inset_0_2px_8px_rgba(0,0,0,0.06)]",

  // ── Cuaderno / School / Lined ───────────────────────────────
  notebook: "bg-[#f9f9f9] bg-[linear-gradient(transparent_97%,_#e0f0ff_97%)] bg-[length:100%_24px] shadow-[inset_0_0_30px_rgba(0,0,0,0.05)]",
  notebookWide: "bg-[#fafafa] bg-[linear-gradient(transparent_96%,_#d0e8ff_96%)] bg-[length:100%_32px] shadow-[inset_0_1px_6px_rgba(173,216,230,0.4)]",
  graphPaper: "bg-white bg-[linear-gradient(#e0e0e0_1px,transparent_1px),linear-gradient(90deg,#e0e0e0_1px,transparent_1px)] bg-[size:20px_20px] shadow-[inset_0_0_25px_rgba(0,0,0,0.03)]",
  dottedPaper: "bg-white bg-[radial-gradient(circle_at_center,#ddd_1px,transparent_1px)] bg-[length:22px_22px] shadow-[inset_0_0_20px_rgba(0,0,0,0.04)]",

  // ── Vintage / Old / Parchment ───────────────────────────────
  ancient: "bg-[#f5e8c7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] shadow-[inset_0_0_80px_rgba(139,69,19,0.25),inset_0_10px_30px_rgba(0,0,0,0.15)]",
  parchment: "bg-[#f0e6d2] bg-[url('https://www.transparenttextures.com/patterns/old-wall.png')] shadow-[inset_0_0_90px_rgba(160,82,45,0.3),0_0_20px_rgba(0,0,0,0.1)]",
  oldLetter: "bg-[#fff8e1] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] shadow-[inset_0_0_60px_rgba(210,180,140,0.4),inset_0_15px_40px_rgba(0,0,0,0.18)]",
  yellowedPaper: "bg-[#fffacd] shadow-[inset_0_0_70px_rgba(218,165,32,0.35),inset_0_8px_25px_rgba(0,0,0,0.12)]",
  sepiaOld: "bg-[#f4ecd8] filter sepia(0.25) brightness(0.98) contrast(1.05) shadow-[inset_0_0_85px_rgba(139,69,19,0.28)]",

  // ── Envejecidos / Burnt / Damaged ───────────────────────────
  burn: "bg-[#f3e5ab] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] shadow-[inset_0_0_100px_rgba(139,0,0,0.25),inset_0_0_50px_rgba(0,0,0,0.3)]",
  burntEdges: "bg-[#e8d5b0] shadow-[inset_0_0_120px_rgba(139,69,19,0.45),0_0_15px_rgba(0,0,0,0.2)]",
  tornPaper: "bg-[#f5f0e1] shadow-[inset_0_0_60px_rgba(0,0,0,0.15),0_8px_25px_rgba(0,0,0,0.12)] after:content-[''] after:absolute after:inset-0 after:bg-gradient-to-b after:from-transparent after:via-transparent after:to-[rgba(0,0,0,0.08)]",
  crumpled: "bg-[#f8f1e9] bg-[url('https://www.transparenttextures.com/patterns/crissxcross.png')] shadow-[inset_0_0_45px_rgba(0,0,0,0.18),0_4px_12px_rgba(0,0,0,0.1)]",

  // ── Dark / Moody / Aesthetic ────────────────────────────────
  dark: "bg-[#0f0f0f] shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]",
  carbon: "bg-[#111] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] shadow-[inset_0_0_40px_rgba(0,0,0,0.7)]",
  charcoal: "bg-[#1a1a1a] bg-[url('https://www.transparenttextures.com/patterns/dark-mosaic.png')] shadow-[inset_0_0_60px_rgba(0,0,0,0.9)]",
  midnight: "bg-[#0a0015] shadow-[inset_0_0_90px_rgba(75,0,130,0.4)]",

  // ── Aesthetic / Themed ──────────────────────────────────────
  love: "bg-[#fff5f7] bg-[url('https://www.transparenttextures.com/patterns/soft-wallpaper.png')] shadow-[inset_0_0_50px_rgba(255,182,193,0.45)]",
  pastelPink: "bg-[#fff0f5] shadow-[inset_0_0_40px_rgba(255,105,180,0.25)]",
  sakura: "bg-[#fffaf0] bg-[url('https://www.transparenttextures.com/patterns/white-paperboard.png')] shadow-[inset_0_0_55px_rgba(255,182,193,0.4)]",
  mintDream: "bg-[#f0fff0] shadow-[inset_0_0_45px_rgba(144,238,144,0.3)]",
  lavender: "bg-[#f8f0ff] shadow-[inset_0_0_50px_rgba(230,230,250,0.45)]",
  galaxy: "bg-black bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] shadow-[inset_0_0_120px_rgba(100,65,165,0.4),inset_0_0_60px_rgba(79,70,229,0.25)]",
  retroSepia: "bg-[#f4e8d1] filter sepia(0.4) brightness(0.95) contrast(1.1) shadow-[inset_0_0_70px_rgba(160,82,45,0.35)]",

  // ── Texturas sutiles / Grain / Noise ────────────────────────
  subtleGrain: "bg-[#f5f5f5] bg-[url('https://www.transparenttextures.com/patterns/subtle-white-feathers.png')] shadow-[inset_0_0_30px_rgba(0,0,0,0.06)]",
  paperGrain: "bg-[#faf8f5] bg-[url('https://www.transparenttextures.com/patterns/off-white.png')] shadow-[inset_0_0_35px_rgba(0,0,0,0.08)]",
  kraft: "bg-[#e8d5b7] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] shadow-[inset_0_0_50px_rgba(139,69,19,0.3)]",
  newsprint: "bg-[#f9f5ec] bg-[url('https://www.transparenttextures.com/patterns/noisy.png')] shadow-[inset_0_0_40px_rgba(0,0,0,0.1)]",
};