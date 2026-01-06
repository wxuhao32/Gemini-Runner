
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, Trophy, MapPin, Diamond, Rocket, ArrowUpCircle, Shield, Activity, PlusCircle, Play, ArrowLeft, ArrowRight, ArrowUp, Maximize, Minimize, Globe } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, GEMINI_COLORS, ShopItem, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

// --- TRANSLATION DATA ---
const TRANSLATIONS = {
  en: {
    shopTitle: "CYBER SHOP",
    credits: "AVAILABLE CREDITS",
    resume: "RESUME MISSION",
    gems: "GEMS",
    start: "INITIALIZE RUN",
    tutorial: "[ ARROWS / WASD / SWIPE TO MOVE ]",
    gameOver: "GAME OVER",
    level: "LEVEL",
    distance: "DISTANCE",
    totalScore: "TOTAL SCORE",
    runAgain: "RUN AGAIN",
    victory: "MISSION COMPLETE",
    victoryDesc: "THE ANSWER TO THE UNIVERSE HAS BEEN FOUND",
    finalScore: "FINAL SCORE",
    restart: "RESTART MISSION",
    speed: "SPEED",
    immortal: "IMMORTAL",
    
    // Shop Items
    item_DOUBLE_JUMP: "DOUBLE JUMP",
    desc_DOUBLE_JUMP: "Jump again in mid-air. Essential for high obstacles.",
    item_MAX_LIFE: "MAX LIFE UP",
    desc_MAX_LIFE: "Permanently adds a heart slot and heals you.",
    item_HEAL: "REPAIR KIT",
    desc_HEAL: "Restores 1 Life point instantly.",
    item_IMMORTAL: "IMMORTALITY",
    desc_IMMORTAL: "Unlock Ability: Press Space/Tap to be invincible for 5s."
  },
  zh: {
    shopTitle: "赛博商店",
    credits: "可用积分",
    resume: "继续任务",
    gems: "宝石",
    start: "启动任务",
    tutorial: "[ 方向键 / WASD / 滑动移动 ]",
    gameOver: "游戏结束",
    level: "关卡",
    distance: "距离",
    totalScore: "总分",
    runAgain: "再次挑战",
    victory: "任务完成",
    victoryDesc: "宇宙的终极答案已被找到",
    finalScore: "最终得分",
    restart: "重新开始",
    speed: "速度",
    immortal: "无敌状态",
    
    // Shop Items
    item_DOUBLE_JUMP: "二段跳",
    desc_DOUBLE_JUMP: "在空中再次跳跃。应对高障碍物的必备技能。",
    item_MAX_LIFE: "生命上限提升",
    desc_MAX_LIFE: "永久增加一颗心并恢复生命值。",
    item_HEAL: "维修包",
    desc_HEAL: "立即恢复 1 点生命值。",
    item_IMMORTAL: "无敌护盾",
    desc_IMMORTAL: "解锁技能：按空格/点击以获得5秒无敌时间。"
  }
};

// Available Shop Items (Data Only)
const SHOP_ITEMS_DATA: ShopItem[] = [
    {
        id: 'DOUBLE_JUMP',
        cost: 1000,
        icon: ArrowUpCircle,
        oneTime: true
    },
    {
        id: 'MAX_LIFE',
        cost: 1500,
        icon: Activity
    },
    {
        id: 'HEAL',
        cost: 1000,
        icon: PlusCircle
    },
    {
        id: 'IMMORTAL',
        cost: 3000,
        icon: Shield,
        oneTime: true
    }
];

const LanguageToggle: React.FC = () => {
    const { language, setLanguage } = useStore();
    
    const toggle = () => {
        setLanguage(language === 'en' ? 'zh' : 'en');
    };

    return (
        <button 
            onClick={toggle}
            className="absolute top-4 left-4 z-[100] flex items-center bg-black/50 backdrop-blur border border-white/20 text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
        >
            <Globe size={18} className="mr-2 text-cyan-400" />
            <span className="text-xs font-bold font-mono">{language === 'en' ? 'EN' : '中文'}</span>
        </button>
    );
};

const ShopScreen: React.FC = () => {
    const { score, buyItem, closeShop, hasDoubleJump, hasImmortality, language } = useStore();
    const [items, setItems] = useState<ShopItem[]>([]);
    const t = TRANSLATIONS[language];

    useEffect(() => {
        // Select 3 random items, filtering out one-time items already bought
        let pool = SHOP_ITEMS_DATA.filter(item => {
            if (item.id === 'DOUBLE_JUMP' && hasDoubleJump) return false;
            if (item.id === 'IMMORTAL' && hasImmortality) return false;
            return true;
        });

        // Shuffle and pick 3
        pool = pool.sort(() => 0.5 - Math.random());
        setItems(pool.slice(0, 3));
    }, [hasDoubleJump, hasImmortality]);

    return (
        <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
             <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                 <h2 className="text-3xl md:text-4xl font-black text-cyan-400 mb-2 font-cyber tracking-widest text-center">{t.shopTitle}</h2>
                 <div className="flex items-center text-yellow-400 mb-6 md:mb-8">
                     <span className="text-base md:text-lg mr-2">{t.credits}:</span>
                     <span className="text-xl md:text-2xl font-bold">{score.toLocaleString()}</span>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-4xl w-full mb-8">
                     {items.map(item => {
                         const Icon = item.icon;
                         const canAfford = score >= item.cost;
                         const nameKey = `item_${item.id}` as keyof typeof t;
                         const descKey = `desc_${item.id}` as keyof typeof t;

                         return (
                             <div key={item.id} className="bg-gray-900/80 border border-gray-700 p-4 md:p-6 rounded-xl flex flex-col items-center text-center hover:border-cyan-500 transition-colors">
                                 <div className="bg-gray-800 p-3 md:p-4 rounded-full mb-3 md:mb-4">
                                     <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
                                 </div>
                                 <h3 className="text-lg md:text-xl font-bold mb-2">{t[nameKey] || item.id}</h3>
                                 <p className="text-gray-400 text-xs md:text-sm mb-4 h-10 md:h-12 flex items-center justify-center">{t[descKey]}</p>
                                 <button 
                                    onClick={() => buyItem(item.id as any, item.cost)}
                                    disabled={!canAfford}
                                    className={`px-4 md:px-6 py-2 rounded font-bold w-full text-sm md:text-base ${canAfford ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110' : 'bg-gray-700 cursor-not-allowed opacity-50'}`}
                                 >
                                     {item.cost} {t.gems}
                                 </button>
                             </div>
                         );
                     })}
                 </div>

                 <button 
                    onClick={closeShop}
                    className="flex items-center px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,0,255,0.4)]"
                 >
                     {t.resume} <Play className="ml-2 w-5 h-5" fill="white" />
                 </button>
             </div>
        </div>
    );
};

const MobileControls: React.FC = () => {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
             if (document.exitFullscreen) document.exitFullscreen();
        }
    };

    const simulateKey = (key: string) => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    };

    return (
        <>
            <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2 pointer-events-auto">
                 <button 
                    onClick={toggleFullscreen} 
                    className="p-2 bg-gray-800/60 backdrop-blur border border-white/20 rounded-full text-white active:scale-95 transition-transform"
                    aria-label="Toggle Fullscreen"
                 >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                 </button>
            </div>

            <div className="absolute bottom-8 left-0 right-0 z-[60] px-6 flex justify-between items-end pointer-events-none pb-[env(safe-area-inset-bottom)]">
                <div className="flex gap-4 pointer-events-auto">
                    <button 
                        className="w-16 h-16 rounded-full bg-cyan-900/40 border border-cyan-500/30 backdrop-blur flex items-center justify-center text-cyan-400 active:bg-cyan-800/60 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                        onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowLeft'); }}
                    >
                        <ArrowLeft size={32} />
                    </button>
                    <button 
                        className="w-16 h-16 rounded-full bg-cyan-900/40 border border-cyan-500/30 backdrop-blur flex items-center justify-center text-cyan-400 active:bg-cyan-800/60 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,255,0.2)]"
                        onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowRight'); }}
                    >
                        <ArrowRight size={32} />
                    </button>
                </div>

                <div className="flex gap-6 items-end pointer-events-auto">
                    <button 
                        className="w-14 h-14 rounded-full bg-yellow-900/40 border border-yellow-500/30 backdrop-blur flex items-center justify-center text-yellow-400 active:bg-yellow-800/60 active:scale-95 transition-all mb-2 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
                        onPointerDown={(e) => { e.preventDefault(); simulateKey(' '); }}
                    >
                        <Zap size={28} />
                    </button>

                    <button 
                        className="w-20 h-20 rounded-full bg-pink-900/40 border border-pink-500/30 backdrop-blur flex items-center justify-center text-pink-400 active:bg-pink-800/60 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,0,128,0.2)]"
                        onPointerDown={(e) => { e.preventDefault(); simulateKey('ArrowUp'); }}
                    >
                        <ArrowUp size={40} />
                    </button>
                </div>
            </div>
        </>
    );
};

export const HUD: React.FC = () => {
  const { score, lives, maxLives, collectedLetters, status, level, restartGame, startGame, gemsCollected, distance, isImmortalityActive, speed, language } = useStore();
  const t = TRANSLATIONS[language];
  const target = ['G', 'E', 'M', 'I', 'N', 'I'];

  // Common container style
  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.SHOP) {
      return <ShopScreen />;
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
              <LanguageToggle />
              
              {/* Card Container */}
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-white/10 animate-in zoom-in-95 duration-500">
                
                {/* Image Container - Auto height to fit full image without cropping */}
                <div className="relative w-full bg-gray-900">
                     <img 
                      src="https://www.gstatic.com/aistudio/starter-apps/gemini_runner/gemini_runner.png" 
                      alt="Gemini Runner Cover" 
                      className="w-full h-auto block"
                     />
                     
                     {/* Gradient Overlay for text readability */}
                     <div className="absolute inset-0 bg-gradient-to-t from-[#050011] via-black/30 to-transparent"></div>
                     
                     {/* Content positioned at the bottom of the card */}
                     <div className="absolute inset-0 flex flex-col justify-end items-center p-6 pb-8 text-center z-10">
                        <button 
                          onClick={() => { audio.init(); startGame(); }}
                          className="w-full group relative px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black text-xl rounded-xl hover:bg-white/20 transition-all shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] hover:border-cyan-400 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/40 via-purple-500/40 to-pink-500/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative z-10 tracking-widest flex items-center justify-center">
                                {t.start} <Play className="ml-2 w-5 h-5 fill-white" />
                            </span>
                        </button>

                        <p className="text-cyan-400/60 text-[10px] md:text-xs font-mono mt-3 tracking-wider">
                            {t.tutorial}
                        </p>
                     </div>
                </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <LanguageToggle />
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">{t.gameOver}</h1>
                
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> {t.level}</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{level} / 3</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Diamond className="mr-2 w-4 h-4 md:w-5 md:h-5"/> {t.gems}</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{gemsCollected}</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-purple-400 text-sm md:text-base"><MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5"/> {t.distance}</div>
                        <div className="text-xl md:text-2xl font-bold font-mono">{Math.floor(distance)} LY</div>
                    </div>
                     <div className="bg-gray-800/50 p-3 md:p-4 rounded-lg flex items-center justify-between mt-2">
                        <div className="flex items-center text-white text-sm md:text-base">{t.totalScore}</div>
                        <div className="text-2xl md:text-3xl font-bold font-cyber text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(0,255,255,0.4)]"
                >
                    {t.runAgain}
                </button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <LanguageToggle />
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">
                    {t.victory}
                </h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">
                    {t.victoryDesc}
                </p>
                
                <div className="grid grid-cols-1 gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-black/60 p-6 rounded-xl border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.1)]">
                        <div className="text-xs md:text-sm text-gray-400 mb-1 tracking-wider">{t.finalScore}</div>
                        <div className="text-3xl md:text-4xl font-bold font-cyber text-yellow-400">{score.toLocaleString()}</div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                            <div className="text-xs text-gray-400">{t.gems}</div>
                            <div className="text-xl md:text-2xl font-bold text-cyan-400">{gemsCollected}</div>
                        </div>
                        <div className="bg-black/60 p-4 rounded-lg border border-white/10">
                             <div className="text-xs text-gray-400">{t.distance}</div>
                            <div className="text-xl md:text-2xl font-bold text-purple-400">{Math.floor(distance)} LY</div>
                        </div>
                     </div>
                </div>

                <button 
                  onClick={() => { audio.init(); restartGame(); }}
                  className="px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest"
                >
                    {t.restart}
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className={containerClass}>
        {/* Top Bar */}
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-cyan-400 drop-shadow-[0_0_10px_#00ffff] font-cyber">
                    {score.toLocaleString()}
                </div>
                 {/* Speed Indicator - Moved here to avoid overlap with mobile controls */}
                 <div className="flex items-center space-x-2 text-cyan-500 opacity-70 mt-2">
                     <Zap className="w-4 h-4 md:w-5 md:h-5 animate-pulse" />
                     <span className="font-mono text-sm md:text-lg">{t.speed} {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
                 </div>
            </div>
            
            <div className="flex space-x-1 md:space-x-2">
                {[...Array(maxLives)].map((_, i) => (
                    <Heart 
                        key={i} 
                        className={`w-6 h-6 md:w-8 md:h-8 ${i < lives ? 'text-pink-500 fill-pink-500' : 'text-gray-800 fill-gray-800'} drop-shadow-[0_0_5px_#ff0054]`} 
                    />
                ))}
            </div>
        </div>
        
        {/* Level Indicator */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 text-sm md:text-lg text-purple-300 font-bold tracking-wider font-mono bg-black/50 px-3 py-1 rounded-full border border-purple-500/30 backdrop-blur-sm z-50">
            {t.level} {level} <span className="text-gray-500 text-xs md:text-sm">/ 3</span>
        </div>

        {/* Active Skill Indicator */}
        {isImmortalityActive && (
             <div className="absolute top-24 left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-xl md:text-2xl animate-pulse flex items-center drop-shadow-[0_0_10px_gold]">
                 <Shield className="mr-2 fill-yellow-400" /> {t.immortal}
             </div>
        )}

        {/* Gemini Collection Status */}
        <div className="absolute top-16 md:top-24 left-1/2 transform -translate-x-1/2 flex space-x-2 md:space-x-3">
            {target.map((char, idx) => {
                const isCollected = collectedLetters.includes(idx);
                const color = GEMINI_COLORS[idx];

                return (
                    <div 
                        key={idx}
                        style={{
                            borderColor: isCollected ? color : 'rgba(55, 65, 81, 1)',
                            color: isCollected ? 'rgba(0, 0, 0, 0.8)' : 'rgba(55, 65, 81, 1)',
                            boxShadow: isCollected ? `0 0 20px ${color}` : 'none',
                            backgroundColor: isCollected ? color : 'rgba(0, 0, 0, 0.9)'
                        }}
                        className={`w-8 h-10 md:w-10 md:h-12 flex items-center justify-center border-2 font-black text-lg md:text-xl font-cyber rounded-lg transform transition-all duration-300`}
                    >
                        {char}
                    </div>
                );
            })}
        </div>
        
        {/* Mobile Controls Overlay */}
        <MobileControls />
    </div>
  );
};
