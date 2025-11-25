
import React, { useEffect, useRef, useState } from 'react';
import { Clue, Character, GameScenario, LogEntry, Language, GamePhase, Location, Interactable, Direction } from '../types';
import { 
  Briefcase, Globe, X, MapPin, Menu, ShieldAlert, FileText, 
  Target, Navigation, Search, Check, ChevronLeft, ChevronRight, User
} from 'lucide-react';

interface GameUIProps {
  scenario: GameScenario;
  inventory: Clue[];
  logs: LogEntry[];
  actionPoints: number;
  playerLocationId: string | null;
  currentLocation: Location | null;
  charactersInLocation: Character[];
  
  onMove: (locationId: string) => void;
  onInspect: (interactable: Interactable) => void;
  onTalk: (char: Character) => void;
  onUseClue: (clue: Clue) => void;
  onCancelConfrontation: () => void;
  
  selectedCharacter: Character | null;
  isProcessing: boolean;
  language: Language;
  setLanguage: (l: Language) => void;
  gamePhase: GamePhase;
  turnCount: number;
  foundItem: Clue | null; // New state for modal
  onKeepItem: () => void;
  onDiscardItem: () => void;
  inventoryFull: boolean;
}

const t = {
  en: {
    inventory: "Inventory",
    logs: "System Log",
    nav: "Sector Map",
    explore: "Scan",
    confront: "Confront",
    talking: "Negotiation",
    back: "Exit Location",
    ap: "Energy",
    share: "Equity",
    search: "Inspect",
    move: "Transit",
    locked: "Empty",
    turn: "Cycle",
    noEvidence: "No Data",
    north: "N", south: "S", east: "E", west: "W",
    found: "Item Detected",
    keep: "Acquire",
    discard: "Discard",
    invFull: "Storage Full"
  },
  zh: {
    inventory: "物品栏",
    logs: "系统日志",
    nav: "区域地图",
    explore: "扫描",
    confront: "对质",
    talking: "谈判",
    back: "离开区域",
    ap: "行动力",
    share: "当前份额",
    search: "调查",
    move: "移动",
    locked: "空置",
    turn: "轮次",
    noEvidence: "暂无数据",
    north: "北", south: "南", east: "东", west: "西",
    found: "发现物品",
    keep: "收纳",
    discard: "丢弃",
    invFull: "背包已满"
  }
};

export const GameUI: React.FC<GameUIProps> = ({
  scenario,
  inventory,
  logs,
  actionPoints,
  playerLocationId,
  currentLocation,
  charactersInLocation,
  onMove,
  onInspect,
  onTalk,
  onUseClue,
  onCancelConfrontation,
  selectedCharacter,
  isProcessing,
  language,
  setLanguage,
  gamePhase,
  turnCount,
  foundItem,
  onKeepItem,
  onDiscardItem,
  inventoryFull
}) => {
  const txt = t[language];
  const [showInventory, setShowInventory] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [viewDirection, setViewDirection] = useState<Direction>('NORTH');
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, showLogs]);

  // Reset direction when entering room
  useEffect(() => {
    setViewDirection('NORTH');
  }, [playerLocationId]);

  const rotateView = (dir: 'left' | 'right') => {
    const dirs: Direction[] = ['NORTH', 'EAST', 'SOUTH', 'WEST'];
    const currentIdx = dirs.indexOf(viewDirection);
    if (dir === 'left') {
      setViewDirection(dirs[(currentIdx - 1 + 4) % 4]);
    } else {
      setViewDirection(dirs[(currentIdx + 1) % 4]);
    }
  };

  // --- HUD HEADER ---
  const Header = () => (
    <div className="absolute top-0 left-0 w-full h-20 px-8 flex justify-between items-center pointer-events-none z-40 bg-gradient-to-b from-slate-950/90 to-transparent">
      {/* Left Title */}
      <div className="pointer-events-auto flex items-center gap-6">
         <div className="flex flex-col">
           <h1 className="text-2xl font-black text-cyan-400 tracking-[0.2em] uppercase drop-shadow-[0_0_10px_rgba(34,211,238,0.5)] font-serif">
             {scenario.title}
           </h1>
           <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Inheritance Protocol V.2025</span>
         </div>
         
         <div className="h-8 w-px bg-slate-700"></div>

         <div className="flex gap-4 font-mono text-xs">
           <div className="flex items-center gap-2 text-slate-300">
             <span className="text-cyan-600">CYC</span> {turnCount}
           </div>
           <div className="flex items-center gap-2 text-slate-300">
             <Target size={14} className="text-cyan-400" /> {actionPoints}
           </div>
         </div>
      </div>

      {/* Right Stats */}
      <div className="pointer-events-auto flex items-center gap-6">
         <div className="text-right">
             <p className="text-[10px] text-slate-500 uppercase tracking-widest">{txt.share}</p>
             <p className="text-3xl font-black text-white leading-none drop-shadow-lg">{scenario.playerShare.toFixed(1)}%</p>
         </div>
         <button onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="p-2 text-slate-500 hover:text-white transition-colors">
             <Globe size={20} />
         </button>
      </div>
    </div>
  );

  // --- HUD FOOTER (Bottom Nav) ---
  const Footer = () => (
    <div className="absolute bottom-0 left-0 w-full h-24 px-8 pb-4 flex justify-between items-end pointer-events-none z-40 bg-gradient-to-t from-slate-950/90 to-transparent">
      <div className="pointer-events-auto flex gap-4">
        {gamePhase === GamePhase.LOCATION_VIEW && (
          <button 
            onClick={() => onMove('')}
            className="group flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:bg-slate-800 transition-all text-slate-300 uppercase tracking-widest text-xs font-bold"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {txt.back}
          </button>
        )}
      </div>

      <div className="pointer-events-auto flex gap-4">
        <button 
          onClick={() => setShowInventory(!showInventory)}
          className={`flex items-center gap-3 px-6 py-3 border transition-all uppercase tracking-widest text-xs font-bold
            ${showInventory ? 'bg-cyan-950/50 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}
          `}
        >
          <Briefcase size={16} /> {txt.inventory} ({inventory.length}/5)
        </button>

        <button 
          onClick={() => setShowLogs(!showLogs)}
          className={`flex items-center gap-3 px-6 py-3 border transition-all uppercase tracking-widest text-xs font-bold
            ${showLogs ? 'bg-cyan-950/50 border-cyan-400 text-cyan-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'}
          `}
        >
          <Menu size={16} /> {txt.logs}
        </button>
      </div>
    </div>
  );

  // --- MAIN VIEW: MAP ---
  const NavView = () => (
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <div className="grid grid-cols-2 gap-4 max-w-5xl w-full px-8">
        {scenario.locations.map(loc => (
          <button
            key={loc.id}
            onClick={() => onMove(loc.id)}
            className={`
              relative h-64 border bg-slate-900/40 backdrop-blur-sm p-6
              flex flex-col items-start justify-between group overflow-hidden transition-all duration-300
              ${playerLocationId === loc.id 
                ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)]' 
                : 'border-slate-800 hover:border-cyan-600/50 hover:bg-slate-800/60'}
            `}
          >
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current text-slate-600 group-hover:text-cyan-400 transition-colors"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current text-slate-600 group-hover:text-cyan-400 transition-colors"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current text-slate-600 group-hover:text-cyan-400 transition-colors"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current text-slate-600 group-hover:text-cyan-400 transition-colors"></div>

            <div className="flex justify-between w-full">
               <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Sector {loc.id.substring(0,3)}</span>
               <MapPin size={20} className="text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>

            <div className="z-10">
              <h3 className="text-3xl font-serif font-bold text-white mb-2">{loc.name}</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">{loc.description}</p>
            </div>

            {/* Character Icons */}
            <div className="flex gap-2 mt-4">
              {scenario.characters.filter(c => c.locationId === loc.id).map(c => (
                 <div key={c.id} className="w-8 h-8 rounded border border-slate-600 bg-slate-950 flex items-center justify-center text-xs font-bold text-white shadow-lg" style={{borderColor: c.avatarColor, color: c.avatarColor}}>
                   {c.name.charAt(0)}
                 </div>
              ))}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-cyan-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          </button>
        ))}
      </div>
    </div>
  );

  // --- MAIN VIEW: LOCATION / COMPASS ---
  const LocationView = () => {
    if (!currentLocation) return null;
    
    // Filter interactables by current direction
    const visibleItems = currentLocation.interactables.filter(i => i.direction === viewDirection);

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
         {/* Room Title */}
         <div className="absolute top-24 left-0 w-full text-center pointer-events-none">
            <h2 className="text-4xl font-serif font-black text-white tracking-widest uppercase opacity-10 scale-150 transform">
              {currentLocation.name}
            </h2>
            <div className="text-cyan-500 font-mono text-xs tracking-[1em] mt-2 uppercase">{viewDirection} FACING</div>
         </div>

         {/* Navigation Arrows (Compass) */}
         <div className="absolute inset-0 flex items-center justify-between px-12 pointer-events-none">
           <button onClick={() => rotateView('left')} className="pointer-events-auto p-4 hover:bg-white/5 rounded-full text-slate-600 hover:text-cyan-400 transition-all">
             <ChevronLeft size={48} strokeWidth={1} />
           </button>
           <button onClick={() => rotateView('right')} className="pointer-events-auto p-4 hover:bg-white/5 rounded-full text-slate-600 hover:text-cyan-400 transition-all">
             <ChevronRight size={48} strokeWidth={1} />
           </button>
         </div>

         {/* Interactables Grid */}
         <div className="grid grid-cols-2 gap-12 z-20 w-full max-w-4xl px-24">
            {visibleItems.length === 0 && (
               <div className="col-span-2 text-center text-slate-600 font-mono text-sm tracking-widest uppercase py-20 border border-slate-800/50 border-dashed">
                 Sector Empty
               </div>
            )}
            
            {visibleItems.map(item => (
              <button
                key={item.id}
                onClick={() => onInspect(item)}
                disabled={item.isSearched || actionPoints <= 0}
                className={`
                  relative group h-40 border transition-all duration-300 p-6 flex flex-col items-start justify-between text-left
                  ${item.isSearched 
                    ? 'border-slate-800 bg-slate-950/50 opacity-50 cursor-not-allowed' 
                    : 'border-slate-700 bg-slate-900/80 hover:border-cyan-400 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'}
                `}
              >
                <div className="flex justify-between w-full">
                  <span className="text-[10px] font-mono text-cyan-600 uppercase tracking-widest">{item.type}</span>
                  {item.isSearched ? <Check size={16} className="text-slate-600" /> : <Search size={16} className="text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity" />}
                </div>
                <div>
                   <h4 className={`text-lg font-bold uppercase ${item.isSearched ? 'text-slate-600' : 'text-slate-200 group-hover:text-white'}`}>{item.name}</h4>
                   <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                </div>
              </button>
            ))}
         </div>

         {/* Characters in Room (Bottom Center) */}
         {charactersInLocation.length > 0 && (
           <div className="absolute bottom-28 flex gap-6 z-30">
              {charactersInLocation.map(char => (
                <button
                  key={char.id}
                  onClick={() => !char.isDefeated && onTalk(char)}
                  disabled={char.isDefeated}
                  className={`
                    group relative w-40 h-16 border bg-slate-950 flex items-center px-4 gap-3 transition-all
                    ${char.isDefeated ? 'border-slate-800 grayscale opacity-50' : 'border-slate-600 hover:border-amber-400 hover:-translate-y-1'}
                  `}
                >
                   <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-900 font-bold" style={{backgroundColor: char.avatarColor}}>
                     <User size={16} />
                   </div>
                   <div className="flex flex-col items-start">
                     <span className="text-[10px] text-amber-500 uppercase tracking-wider">{char.role}</span>
                     <span className="text-sm font-bold text-white">{char.name}</span>
                   </div>
                </button>
              ))}
           </div>
         )}

         {/* Compass UI */}
         <div className="absolute top-32 flex gap-4">
             {['NORTH', 'EAST', 'SOUTH', 'WEST'].map((d) => (
               <div key={d} className={`text-[10px] font-bold transition-colors ${viewDirection === d ? 'text-cyan-400 underline underline-offset-4' : 'text-slate-700'}`}>
                  {txt[d.toLowerCase() as keyof typeof txt]}
               </div>
             ))}
         </div>
      </div>
    );
  };

  // --- MODAL: ITEM FOUND ---
  const ItemFoundModal = () => {
    if (!foundItem) return null;
    return (
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
        <div className="bg-slate-900 border border-cyan-500/50 p-1 w-96 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
           <div className="bg-slate-950 p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-cyan-900/20 border border-cyan-500/30 rounded-full flex items-center justify-center mb-6 text-cyan-400">
                <Search size={32} />
              </div>
              <h3 className="text-cyan-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">{txt.found}</h3>
              <h2 className="text-2xl font-serif text-white font-bold mb-4">{foundItem.name}</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">{foundItem.description}</p>
              
              <div className="flex w-full gap-4">
                 <button 
                   onClick={onDiscardItem}
                   className="flex-1 py-3 border border-slate-700 text-slate-500 hover:bg-slate-900 hover:text-slate-300 uppercase text-xs font-bold tracking-widest transition-colors"
                 >
                   {txt.discard}
                 </button>
                 <button 
                   onClick={onKeepItem}
                   disabled={inventoryFull}
                   className={`flex-1 py-3 bg-cyan-600 text-black hover:bg-cyan-500 uppercase text-xs font-bold tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                 >
                   {inventoryFull ? txt.invFull : txt.keep}
                 </button>
              </div>
              {inventoryFull && <p className="mt-4 text-[10px] text-red-400 font-mono uppercase">! Storage Capacity Reached !</p>}
           </div>
        </div>
      </div>
    );
  };

  // --- CONFRONTATION VIEW ---
  const ConfrontationView = () => {
    if (!selectedCharacter) return null;
    return (
      <div className="absolute inset-0 z-50 bg-slate-950 flex flex-col">
         <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            {/* Background Tech Pattern */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950"></div>
            
            <div className="relative z-10 flex flex-col items-center">
               {/* High Tech Avatar Card */}
               <div className="w-64 border-2 border-slate-700 bg-slate-900/50 backdrop-blur p-4 mb-8 relative">
                  <div className="absolute -top-1 -left-1 w-2 h-2 bg-cyan-500"></div>
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-500"></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-cyan-500"></div>
                  <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-cyan-500"></div>
                  
                  <div className="w-full h-48 bg-slate-800 mb-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{backgroundColor: selectedCharacter.avatarColor}}></div>
                    <User size={80} className="text-slate-400 relative z-10" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-white uppercase text-center">{selectedCharacter.name}</h2>
                  <div className="flex justify-between items-center mt-2 border-t border-slate-700 pt-2 text-[10px] font-mono text-cyan-400 uppercase">
                    <span>{selectedCharacter.role}</span>
                    <span>Equity: {selectedCharacter.share.toFixed(1)}%</span>
                  </div>
               </div>

               <div className="text-center max-w-lg">
                 <p className="text-slate-500 text-xs font-mono mb-2 uppercase tracking-widest">Target Vulnerability</p>
                 <p className="text-white text-lg font-serif italic">"{selectedCharacter.weakness}"</p>
               </div>
            </div>

            <button onClick={onCancelConfrontation} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
         </div>

         {/* Interaction Panel */}
         <div className="h-96 border-t border-slate-800 bg-slate-950 flex">
            <div className="w-1/3 border-r border-slate-800 p-8 flex flex-col justify-center bg-slate-900/30">
               <span className="text-cyan-600 text-[10px] uppercase font-bold tracking-widest mb-4 flex items-center gap-2">
                 <ShieldAlert size={12} /> Incoming Transmission
               </span>
               <p className="text-xl text-slate-200 font-serif leading-relaxed">
                 "{selectedCharacter.dialogueIntro}"
               </p>
            </div>
            
            <div className="flex-1 p-8 bg-slate-950">
               <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-6 flex items-center gap-2">
                 <FileText size={12} /> Deploy Evidence
               </span>
               
               <div className="grid grid-cols-2 gap-4 h-full overflow-y-auto pb-8">
                 {inventory.filter(c => !c.isUsed).length === 0 && (
                   <div className="col-span-2 flex items-center justify-center border border-dashed border-slate-800 rounded h-24 text-slate-600 font-mono text-xs uppercase">
                     {txt.noEvidence}
                   </div>
                 )}
                 {inventory.filter(c => !c.isUsed).map(clue => (
                   <button
                     key={clue.id}
                     onClick={() => onUseClue(clue)}
                     disabled={actionPoints <= 0}
                     className="text-left p-4 border border-slate-800 bg-slate-900 hover:border-cyan-500 hover:bg-cyan-950/20 transition-all group relative overflow-hidden"
                   >
                     <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-cyan-500/20 to-transparent"></div>
                     <div className="flex justify-between mb-2 relative z-10">
                       <span className="font-bold text-slate-200 group-hover:text-cyan-400 transition-colors">{clue.name}</span>
                       <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">PWR {clue.power}</span>
                     </div>
                     <p className="text-xs text-slate-500 line-clamp-1 relative z-10">{clue.description}</p>
                   </button>
                 ))}
               </div>
            </div>
         </div>
      </div>
    );
  };

  // --- OVERLAYS ---
  const InventoryOverlay = () => (
    <div className={`fixed inset-y-0 right-0 w-80 bg-slate-950 border-l border-slate-800 transform transition-transform duration-300 z-50 flex flex-col shadow-2xl ${showInventory ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Briefcase size={14} /> {txt.inventory} <span className="text-slate-500">[{inventory.length}/5]</span>
        </h3>
        <button onClick={() => setShowInventory(false)}><X size={16} className="text-slate-500 hover:text-white"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {inventory.length === 0 && <p className="text-slate-700 text-xs font-mono text-center mt-10">{txt.noEvidence}</p>}
        {inventory.map(clue => (
          <div key={clue.id} className={`p-4 border bg-slate-900 relative group ${clue.isUsed ? 'border-slate-800 opacity-40' : 'border-slate-700 hover:border-cyan-500/50'}`}>
             {clue.isUsed && <div className="absolute inset-0 flex items-center justify-center text-red-500 font-black uppercase text-xl opacity-20 rotate-12 pointer-events-none">USED</div>}
             <div className="flex justify-between mb-1">
                <span className="text-sm font-bold text-slate-200">{clue.name}</span>
             </div>
             <p className="text-xs text-slate-500 leading-relaxed mb-2">{clue.description}</p>
             <div className="flex justify-between items-center">
                {clue.foundInLocation && (
                   <span className="text-[10px] text-slate-600 flex items-center gap-1">
                     <MapPin size={10} /> {scenario.locations.find(l => l.id === clue.foundInLocation)?.name}
                   </span>
                )}
                {!clue.isUsed && <button onClick={() => onDiscardItem /* Actually logic handled elsewhere usually */} className="text-[10px] text-red-900 opacity-0 group-hover:opacity-100 hover:text-red-500 uppercase transition-all">DROP</button>}
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const LogsOverlay = () => (
    <div className={`fixed inset-y-0 right-0 w-96 bg-slate-950 border-l border-slate-800 transform transition-transform duration-300 z-50 flex flex-col shadow-2xl ${showLogs ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Menu size={14} /> {txt.logs}
        </h3>
        <button onClick={() => setShowLogs(false)}><X size={16} className="text-slate-500 hover:text-white"/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-xs">
        {logs.map(log => (
          <div key={log.id} className="border-l-2 border-slate-800 pl-4 py-1">
             <div className={`mb-1 font-bold uppercase ${log.speaker === 'System' ? 'text-slate-500' : log.speaker === 'Player' ? 'text-cyan-500' : 'text-amber-500'}`}>
               {log.speaker}
             </div>
             <div className={`leading-relaxed ${log.type === 'success' ? 'text-emerald-400' : log.type === 'danger' ? 'text-rose-400' : 'text-slate-400'}`}>
               {log.text}
             </div>
          </div>
        ))}
        <div ref={logEndRef}></div>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-full bg-slate-950 relative overflow-hidden font-sans selection:bg-cyan-900 selection:text-white">
      
      {/* Dynamic Backgrounds based on Phase */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black"></div>
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)", backgroundSize: "40px 40px"}}></div>

      <Header />
      
      {gamePhase === GamePhase.NAVIGATION && <NavView />}
      {gamePhase === GamePhase.LOCATION_VIEW && <LocationView />}
      {gamePhase === GamePhase.CONFRONTATION && <ConfrontationView />}

      <Footer />
      <InventoryOverlay />
      <LogsOverlay />
      <ItemFoundModal />

      {/* Processing Spinner */}
      {isProcessing && (
        <div className="absolute inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
             <span className="text-cyan-500 font-mono text-xs uppercase tracking-widest animate-pulse">Processing Data Stream</span>
          </div>
        </div>
      )}
    </div>
  );
};
