
import React, { useState, useEffect } from 'react';
import { generateScenario, findClue, resolveBattle } from './services/gemini';
import { Difficulty, GameScenario, Clue, Character, LogEntry, GamePhase, Language, Interactable } from './types';
import { GameUI } from './components/GameUI';
import { Globe, ArrowRight, Hexagon, CircuitBoard, Fingerprint } from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);
const MAX_INVENTORY = 5;

// --- Translation Data for App.tsx ---
const menuText = {
  en: {
    systemReady: "System Online",
    titleMain: "Legacy",
    titleSub: "Protocol",
    subtitle: "Advanced Inheritance Simulation V.2025",
    easy: "Easy Operation",
    medium: "Standard Operation",
    hard: "Critical Operation",
    langSwitch: "Switch to 中文",
    loading: "Constructing World Data...",
    win: "VICTORY",
    lose: "FAILURE",
    finalShare: "Final Equity",
    returnMenu: "Return to Menu",
    endCycle: "End Cycle",
    shareGain: "Share Acquired",
    shareLoss: "Share Lost",
    logHeader: "Cycle",
    eliminated: "Eliminated",
    itemAcquired: "Acquired Item",
    itemDiscarded: "Discarded Item",
    nothingFound: "No significant data found in",
    searchFailed: "Search operation failed.",
    actionLow: "Insufficient AP. End cycle.",
    initLog: "System initialized. Objective: Secure Estate Control."
  },
  zh: {
    systemReady: "系统联机",
    titleMain: "遗产",
    titleSub: "协议",
    subtitle: "高维家族资产争夺模拟 V.2025",
    easy: "简单模式",
    medium: "标准模式",
    hard: "困难模式",
    langSwitch: "Switch to English",
    loading: "正在构建世界数据...",
    win: "完全接管",
    lose: "权限丢失",
    finalShare: "最终份额",
    returnMenu: "返回主界面",
    endCycle: "结束回合",
    shareGain: "份额增加",
    shareLoss: "份额流失",
    logHeader: "轮次",
    eliminated: "已出局",
    itemAcquired: "获得物品",
    itemDiscarded: "丢弃物品",
    nothingFound: "搜寻无果:",
    searchFailed: "搜寻操作失败",
    actionLow: "行动力不足，请结束回合。",
    initLog: "系统初始化完成。目标：获取遗产控制权。"
  }
};

// --- Custom Logo Component ---
const GameLogo = () => (
  <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
    {/* Rotating Outer Ring */}
    <div className="absolute inset-0 border border-slate-700 rounded-full animate-[spin_10s_linear_infinite] opacity-30"></div>
    <div className="absolute inset-2 border border-dashed border-cyan-900 rounded-full animate-[spin_15s_linear_infinite_reverse]"></div>
    
    {/* Static Core */}
    <div className="relative z-10 w-32 h-32 bg-slate-900 border border-cyan-500/30 rotate-45 flex items-center justify-center shadow-[0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-sm">
       <div className="absolute inset-0 border border-slate-800 -rotate-6 scale-90"></div>
       <div className="flex flex-col items-center justify-center -rotate-45 text-cyan-400">
          <Fingerprint size={48} strokeWidth={1} className="mb-2 opacity-80" />
          <div className="h-px w-12 bg-cyan-500/50 mb-1"></div>
          <span className="text-[10px] font-mono tracking-[0.3em] text-cyan-600">ID:ADMIN</span>
       </div>
    </div>
    
    {/* Decorative Nodes */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-b from-cyan-500 to-transparent opacity-50"></div>
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-gradient-to-t from-cyan-500 to-transparent opacity-50"></div>
  </div>
);

export default function App() {
  const [language, setLanguage] = useState<Language>('zh');
  const [phase, setPhase] = useState<GamePhase>(GamePhase.MENU);
  const [scenario, setScenario] = useState<GameScenario | null>(null);
  const [playerLocationId, setPlayerLocationId] = useState<string | null>(null);
  
  const [inventory, setInventory] = useState<Clue[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionPoints, setActionPoints] = useState(5);
  const [turnCount, setTurnCount] = useState(1);
  const [gameResult, setGameResult] = useState<'WIN' | 'LOSE' | null>(null);

  // New State for Exploration Logic
  const [pendingClue, setPendingClue] = useState<Clue | null>(null); // Item found but not yet taken
  const [pendingInteractableId, setPendingInteractableId] = useState<string | null>(null); // What we just searched

  const txt = menuText[language];

  const addLog = (text: string, speaker: string = 'System', type: LogEntry['type'] = 'neutral') => {
    setLogs(prev => [...prev, { id: generateId(), text, speaker, type }]);
  };

  const startGame = async (diff: Difficulty) => {
    setGameResult(null); // Reset result
    setPhase(GamePhase.LOADING_SCENARIO);
    setIsProcessing(true);
    try {
      const newScenario = await generateScenario(diff, language);
      setScenario(newScenario);
      setPhase(GamePhase.NAVIGATION);
      setPlayerLocationId(null);
      setInventory([]);
      setActionPoints(5);
      setTurnCount(1);
      setLogs([]);
      addLog(txt.initLog, 'System', 'info');
    } catch (error) {
      console.error(error);
      alert("API Error. Please check your key and try again.");
      setPhase(GamePhase.MENU);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMove = (locationId: string) => {
    if (locationId === '') {
      setPhase(GamePhase.NAVIGATION);
      setPlayerLocationId(null);
      return;
    }
    // Movement costs 1 AP
    if (actionPoints > 0) {
      setActionPoints(prev => prev - 1);
      setPlayerLocationId(locationId);
      setPhase(GamePhase.LOCATION_VIEW);
    } else {
      addLog(txt.actionLow, 'System', 'danger');
    }
  };

  const handleInspect = async (interactable: Interactable) => {
    if (!scenario || !playerLocationId || actionPoints <= 0) return;
    const currentLocation = scenario.locations.find(l => l.id === playerLocationId);
    if (!currentLocation) return;

    setIsProcessing(true);
    setActionPoints(prev => prev - 1);

    try {
      // Mark as searched immediately
      setScenario(prev => {
        if (!prev) return null;
        return {
          ...prev,
          locations: prev.locations.map(l => l.id === playerLocationId ? {
            ...l,
            interactables: l.interactables.map(i => i.id === interactable.id ? { ...i, isSearched: true } : i)
          } : l)
        };
      });

      setPendingInteractableId(interactable.id);

      if (interactable.hasClue) {
        const newClue = await findClue(currentLocation, interactable, language);
        const clueWithLoc = { ...newClue, foundInLocation: playerLocationId };
        setPendingClue(clueWithLoc);
        // Modal will open automatically because pendingClue is set
      } else {
        addLog(`${txt.nothingFound} ${interactable.name}`, 'System', 'neutral');
      }

    } catch (error) {
      addLog(txt.searchFailed, 'System', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeepItem = () => {
    if (!pendingClue) return;
    if (inventory.length >= MAX_INVENTORY) {
      // UI handles disabling button or showing warning, logic here strictly prevents
      return;
    }
    
    setInventory(prev => [...prev, pendingClue]);
    addLog(`${txt.itemAcquired}: ${pendingClue.name}`, 'System', 'success');
    setPendingClue(null);
  };

  const handleDiscardItem = () => {
    if (!pendingClue) return;
    addLog(`${txt.itemDiscarded}: ${pendingClue.name}`, 'System', 'neutral');
    setPendingClue(null);
  };

  const handleTalk = (char: Character) => {
    setSelectedCharacter(char);
    setPhase(GamePhase.CONFRONTATION);
  };

  const handleUseClue = async (clue: Clue) => {
    if (!scenario || !selectedCharacter || actionPoints <= 0) return;

    setIsProcessing(true);
    setActionPoints(prev => prev - 1);

    setInventory(prev => prev.map(c => c.id === clue.id ? { ...c, isUsed: true } : c));

    try {
      const battleContext = `Location: ${scenario.locations.find(l => l.id === playerLocationId)?.name}. Player Share: ${scenario.playerShare}%.`;
      const result = await resolveBattle(clue, selectedCharacter, battleContext, language);

      let shareChange = result.shareChange;
      
      // Ensure we don't take more than they have
      if (shareChange > selectedCharacter.share) shareChange = selectedCharacter.share;
      
      const newCharacters = scenario.characters.map(r => {
        if (r.id === selectedCharacter.id) {
          const newShare = r.share - shareChange;
          return { 
            ...r, 
            share: Math.max(0, newShare),
            isDefeated: newShare <= 0 
          };
        }
        return r;
      });

      const newPlayerShare = scenario.playerShare + shareChange;

      setScenario({
        ...scenario,
        characters: newCharacters,
        playerShare: newPlayerShare
      });

      addLog(result.dialogue, 'Log', result.isCriticalSuccess ? 'success' : 'neutral');
      
      if (shareChange > 0) {
        addLog(`${txt.shareGain} +${shareChange.toFixed(1)}%`, 'System', 'success');
      } else {
        addLog(`${txt.shareLoss} ${shareChange.toFixed(1)}%`, 'System', 'danger');
      }

      const updatedChar = newCharacters.find(c => c.id === selectedCharacter.id);
      if (updatedChar && updatedChar.isDefeated) {
        setPhase(GamePhase.LOCATION_VIEW);
        setSelectedCharacter(null);
        addLog(`${selectedCharacter.name} ${txt.eliminated}`, 'System', 'success');
      }

    } catch (error) {
       addLog("Connection disrupted.", 'System', 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextTurn = () => {
    setTurnCount(prev => prev + 1);
    setActionPoints(5);
    addLog(`--- ${txt.logHeader} ${turnCount + 1} ---`, 'System', 'info');
  };

  useEffect(() => {
    if (!scenario) return;
    if (scenario.playerShare >= 51) {
      setGameResult('WIN');
      setPhase(GamePhase.GAME_OVER);
    } else if (turnCount > 8 && scenario.playerShare < 51) {
      // Basic Lose Condition
      setGameResult('LOSE');
      setPhase(GamePhase.GAME_OVER);
    }
  }, [scenario, turnCount]);

  if (phase === GamePhase.MENU) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center relative overflow-hidden">
        {/* Dynamic Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-black to-slate-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900 via-slate-950 to-black"></div>
        
        {/* Decorative Lines */}
        <div className="absolute top-0 left-10 w-px h-64 bg-gradient-to-b from-cyan-500/50 to-transparent"></div>
        <div className="absolute bottom-0 right-10 w-px h-64 bg-gradient-to-t from-cyan-500/50 to-transparent"></div>

        <div className="relative z-10 w-full max-w-lg p-12 border border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl flex flex-col items-center">
          
          <GameLogo />

          <div className="mb-12 text-center w-full">
             <div className="flex items-center justify-center gap-2 mb-4">
                <div className="h-px w-8 bg-cyan-500/50"></div>
                <div className="text-cyan-400 text-[10px] uppercase tracking-[0.3em] font-mono">{txt.systemReady}</div>
                <div className="h-px w-8 bg-cyan-500/50"></div>
             </div>
             <h1 className="text-5xl font-serif font-black text-white tracking-widest uppercase mb-2 drop-shadow-lg">
               {txt.titleMain} <span className="text-cyan-500">{txt.titleSub}</span>
             </h1>
             <h2 className="text-xs font-mono text-slate-500 tracking-[0.5em] uppercase">
               {txt.subtitle}
             </h2>
          </div>

          <div className="space-y-4 font-mono text-sm w-full">
             {[Difficulty.EASY, Difficulty.MEDIUM, Difficulty.HARD].map((d) => {
                let label = txt.easy;
                if (d === Difficulty.MEDIUM) label = txt.medium;
                if (d === Difficulty.HARD) label = txt.hard;

                return (
                  <button 
                    key={d}
                    onClick={() => startGame(d)} 
                    className="w-full text-left p-5 border border-slate-700 bg-slate-900/50 hover:border-cyan-400 hover:bg-cyan-950/30 text-slate-400 hover:text-cyan-400 transition-all uppercase tracking-widest group flex justify-between items-center"
                  >
                    <span className="flex items-center gap-2">
                       <span className={`w-1.5 h-1.5 rounded-full ${d === Difficulty.EASY ? 'bg-emerald-500' : d === Difficulty.MEDIUM ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                       {label}
                    </span>
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300" />
                  </button>
                )
             })}
          </div>

          <button 
            onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')}
            className="mt-12 w-full text-center text-xs text-slate-600 hover:text-white transition-colors flex items-center justify-center gap-2 uppercase tracking-wider"
          >
            <Globe size={12} /> {txt.langSwitch}
          </button>
        </div>
      </div>
    );
  }

  if (phase === GamePhase.LOADING_SCENARIO) {
    return (
      <div className="h-screen w-full bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-64 h-px bg-slate-800 mb-8 overflow-hidden relative">
          <div className="absolute inset-y-0 left-0 bg-cyan-500 w-1/2 animate-[shimmer_1.5s_infinite_ease-in-out]"></div>
        </div>
        <div className="flex flex-col items-center gap-2">
           <Hexagon size={32} className="text-cyan-500 animate-spin mb-4" strokeWidth={1} />
           <p className="font-mono text-xs text-cyan-500 uppercase tracking-[0.3em] animate-pulse">
             {txt.loading}
           </p>
        </div>
        <style>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        `}</style>
      </div>
    );
  }

  if (phase === GamePhase.GAME_OVER) {
     return (
        <div className="h-screen w-full bg-black flex items-center justify-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
           <div className="text-center z-10 border border-slate-800 p-16 bg-slate-950/90 backdrop-blur-xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <div className="mb-8 flex justify-center">
                 {gameResult === 'WIN' ? 
                   <div className="w-24 h-24 rounded-full border-4 border-cyan-500 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                     <Fingerprint size={64} />
                   </div> :
                   <div className="w-24 h-24 rounded-full border-4 border-slate-700 flex items-center justify-center text-slate-600">
                     <Hexagon size={64} />
                   </div>
                 }
              </div>
              <h1 className={`text-6xl font-black mb-6 tracking-[0.2em] font-serif ${gameResult === 'WIN' ? 'text-cyan-400 text-shadow-glow' : 'text-slate-500'}`}>
                {gameResult === 'WIN' ? txt.win : txt.lose}
              </h1>
              <div className="h-px w-32 bg-slate-800 mx-auto mb-8"></div>
              <p className="text-slate-300 font-mono text-sm mb-12 uppercase tracking-widest">
                 {txt.finalShare}: <span className="text-2xl font-bold text-white">{scenario?.playerShare.toFixed(2)}%</span>
              </p>
              <button 
                onClick={() => setPhase(GamePhase.MENU)} 
                className="group relative px-8 py-3 bg-transparent border border-slate-600 text-slate-300 hover:text-black transition-colors uppercase tracking-widest text-xs font-bold overflow-hidden"
              >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">{txt.returnMenu}</span>
              </button>
           </div>
        </div>
     )
  }

  const currentLocation = scenario?.locations.find(l => l.id === playerLocationId) || null;
  const charactersInLocation = scenario?.characters.filter(c => c.locationId === playerLocationId) || [];

  return (
    <>
      <GameUI 
        scenario={scenario!}
        inventory={inventory}
        logs={logs}
        actionPoints={actionPoints}
        playerLocationId={playerLocationId}
        currentLocation={currentLocation}
        charactersInLocation={charactersInLocation}
        onMove={handleMove}
        onInspect={handleInspect}
        onTalk={handleTalk}
        onUseClue={handleUseClue}
        onCancelConfrontation={() => {
          setPhase(GamePhase.LOCATION_VIEW);
          setSelectedCharacter(null);
        }}
        selectedCharacter={selectedCharacter}
        isProcessing={isProcessing}
        language={language}
        setLanguage={setLanguage}
        gamePhase={phase}
        turnCount={turnCount}
        foundItem={pendingClue}
        onKeepItem={handleKeepItem}
        onDiscardItem={handleDiscardItem}
        inventoryFull={inventory.length >= MAX_INVENTORY}
      />
      
      {/* End Turn Button */}
      {actionPoints <= 0 && !isProcessing && phase !== GamePhase.CONFRONTATION && !pendingClue && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 animate-bounce-slow">
          <button 
            onClick={nextTurn}
            className="bg-cyan-600 hover:bg-cyan-500 text-black font-bold py-3 px-8 shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all uppercase tracking-widest text-xs flex items-center gap-2 border border-cyan-400 group"
          >
             {txt.endCycle} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </>
  );
}
