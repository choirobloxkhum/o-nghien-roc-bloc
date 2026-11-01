import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Flame,
  Heart,
  Radio,
  Eye,
  EyeOff,
} from 'lucide-react';
import { RPCharacter } from '../types';
import { getCharacterAvatar } from '../data/rpCharacters';
import { playUiClick } from '../utils/audio';

interface HellInteractiveCharacterViewProps {
  character: RPCharacter;
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
  isAdmin?: boolean;
}

// Victor Laurent's default background sound effect / track YouTube Video ID (https://www.youtube.com/watch?v=KWiagDHdw1w)
const VICTOR_YOUTUBE_BGM_ID = 'KWiagDHdw1w';

// Default Hell mode background track YouTube Video ID (Bedroom R&B After Hours: https://www.youtube.com/watch?v=qcwA2G7oYQk)
const DEFAULT_HELL_YOUTUBE_BGM_ID = 'qcwA2G7oYQk';

// Special Mouth / Lips voice line exclusively for Victor Laurent
const VICTOR_MOUTH_VOICE_URL =
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793451090/ElevenLabs_2026-10-31T12_48_12_Adam_-_American_Dark_and_Tough_pvc_sp100_s50_sb75_v4.mp3';

// Special ASMR Kissing voice line for other Hell characters' Mouth / Lips hotspot
const MOUTH_ASMR_VOICE_URL =
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793449971/asmr%E7%99%BA%E6%83%85%E3%81%97%E3%81%9F%E5%BD%BC%E6%B0%8F%E3%81%A8%E3%81%B2%E3%81%9F%E3%81%99%E3%82%89%E3%81%A1%E3%82%85%E3%83%BC%E3%81%99%E3%82%8B%E3%81%A0%E3%81%91%E3%81%AE%E9%9F%B3%E5%A3%B010%E5%88%86%E9%96%93%E8%80%90%E4%B9%85.mp3';

// 3 Voice lines for other body hotspots (Ngực, Nách, Cơ bụng)
const BODY_VOICE_URLS = [
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793445798/ElevenLabs_2026-10-31T11_15_27_Roger_-_Laid-Back_Casual_Resonant_pre_sp100_s50_sb75_v4.mp3',
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793445799/ElevenLabs_2026-10-31T11_16_50_Roger_-_Laid-Back_Casual_Resonant_pre_sp100_s50_sb75_v4.mp3',
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793445874/ElevenLabs_2026-10-31T11_24_06_Adam_-_American_Dark_and_Tough_pvc_sp100_s50_sb75_v4.mp3',
];

// Special Climax Voice when progress bar reaches 100% (Whiteout Flash)
const CLIMAX_VOICE_URL =
  'https://res.cloudinary.com/ngvsacix/video/upload/v1793451312/ElevenLabs_2026-10-31T12_54_06_Adam_-_American_Dark_and_Tough_pvc_sp100_s50_sb75_v4.mp3';

interface BodyHotspot {
  id: string;
  name: string;
  part: 'mouth' | 'chest' | 'underarm' | 'abs';
  top: string;
  left: string;
  whisperDialogues: string[];
}

// Hotspot coordinates on character portrait:
// - Miệng: 42%
// - Ngực: 58%
// - Nách (Trái/Phải): Moved further out to left (12%) and right (88%)
// - Cơ bụng: 77%
const BODY_HOTSPOTS: BodyHotspot[] = [
  {
    id: 'mouth',
    name: 'Môi',
    part: 'mouth',
    top: '42%',
    left: '50%',
    whisperDialogues: [
      'Ưm... nụ hôn của em làm tôi đê mê... đừng buông ra...',
      'Đến gần hơn nữa đi... để tôi hôn trọn lấy môi em...',
      'Hơi thở em ngọt quá... làm tôi mất hết lí trí rồi...',
      'Chụt... em làm tôi phát cuồng lên mất...',
    ],
  },
  {
    id: 'chest',
    name: 'Ngực',
    part: 'chest',
    top: '58%',
    left: '50%',
    whisperDialogues: [
      'Lồng ngực tôi đang đập rộn ràng vì em... Em có cảm nhận được không?',
      'Bàn tay em ấm áp quá... áp chặt vào ngực tôi đi.',
      'Trái tim này thuộc về em, từ hơi thở đến từng nhịp đập.',
      'Chạm vào ngực tôi thế này... nhịp tim tăng nhanh mất rồi.',
    ],
  },
  {
    id: 'underarm_left',
    name: 'Nách',
    part: 'underarm',
    top: '55%',
    left: '12%',
    whisperDialogues: [
      'Chạm vào chỗ nhạy cảm này... em bạo dạn thật đấy.',
      'Nhột quá... em làm tôi run rẩy cả người rồi.',
      'Đừng trêu chọc tôi nữa... tôi sẽ phạt em đấy.',
      'Tay em lướt qua đây làm tôi rùng mình từng đợt...',
    ],
  },
  {
    id: 'underarm_right',
    name: 'Nách',
    part: 'underarm',
    top: '55%',
    left: '88%',
    whisperDialogues: [
      'Chạm vào chỗ nhạy cảm này... em bạo dạn thật đấy.',
      'Nhột quá... em làm tôi run rẩy cả người rồi.',
      'Đừng trêu chọc tôi nữa... tôi sẽ phạt em đấy.',
      'Tay em lướt qua đây làm tôi rùng mình từng đợt...',
    ],
  },
  {
    id: 'abs',
    name: 'Cơ bụng',
    part: 'abs',
    top: '77%',
    left: '50%',
    whisperDialogues: [
      'Cơ bụng tôi siết chặt lại mỗi khi đầu ngón tay em lướt qua...',
      'Em thích chạm vào những đường cơ này sao? Cứ vuốt ve tự nhiên đi.',
      'Nóng quá... em đang thiêu đốt sự kiên nhẫn cuối cùng của tôi đấy.',
      'Đừng dừng lại... bàn tay em làm tôi phát điên lên mất.',
    ],
  },
];

// Character personalized dialogues
const CHARACTER_INTERACTION_DIALOGUES: Record<string, string[]> = {
  'char-18-victor-laurent': [
    'Anh không nghĩ em sẽ làm được vậy...',
    'Đừng cử động... để tôi ôm em một chút.',
    'Tay em... đang chạm vào đâu đấy? Đừng làm loạn...',
    'Hơi thở của em phả vào cổ tôi... em muốn thử thách lòng kiên nhẫn của một quân nhân sao?',
    'Ngoan nào... quân phục này để tôi tự cởi cho em xem.',
    'Em làm tôi phát điên lên mất... lại gần đây với tôi.',
  ],
  'char-19-valentin-de-vigny': [
    'Thiên thần nhỏ của chú...thì ra cháu lại hư thế này...',
    'Thiên thần nhỏ của chú... Cháu ngoan lắm.',
    'Cháu dám chạm vào chú như vậy sao? Có biết hậu quả là gì không...?',
    'Lại đây với chú... hôm nay cháu muốn được cưng chiều thế nào?',
    'Đừng nhìn chú bằng ánh mắt ươn ướt đó... chú không nương tay đâu.',
  ],
  'char-20-le-minh-khai': [
    'Mợ Cả...mợ đừng có ỷ tui chiều mà làm càng nhen...',
    'Mợ chạm vào tui vậy... lỡ người ta thấy rồi sao mợ?',
    'Con chim nó nói tầm bậy, mợ đừng nghe... Trong lòng tui chỉ có một mình mợ thôi à.',
    'Mợ... tim tui đập thình thịch nè, mợ có nghe thấy hôn?',
    'Mợ thương tui nhiều hông? Đêm nay tui thức quạt cho mợ ngủ nghen.',
  ],
  'char-16-hoang-nhat-thien': [
    'Nhóc à...anh không ngờ em lại thích thú với mấy thứ này...',
    'Em phát hiện tôi theo dõi em... hay là em đang cố tình câu dẫn tôi?',
    'Lại gần đây. Tôi trói tay em lại xem em còn nghịch ngợm được không.',
    'Hôm nay em muốn tôi trừng phạt em kiểu gì đây hả cô gái bé nhỏ?',
    'Em thuộc về tôi, từ hơi thở đến từng tấc da thịt này.',
  ],
  'char-14-gabriel': [
    'Em...việc này kì quá...em muốn thì cẩn thận nhé.',
    'Thiên thần sa ngã... hơi thở của em thật ngọt ngào.',
    'Đừng sợ... hãy để đôi cánh đen này ôm trọn lấy em trong bóng đêm.',
    'Em có cảm nhận được nhịp đập nơi lồng ngực này không?',
  ],
  'char-11-lucifer': [
    'Thứ sucubus/incubus hạ đẳng, sao ngươi dá-!? Ưm~',
    'Linh hồn bé nhỏ... ngươi tự nguyện dâng hiến cho Chúa tể Địa Ngục sao?',
    'Chạm vào ta... ngươi sẽ bị ngọn lửa dục vọng này thiêu rụi đấy.',
    'Ngươi rất can đảm... và cũng rất ngon miệng.',
  ],
  'char-12-jaxon': [
    'Ha...tôi không ngờ cô liều lĩnh vậy đấy...quản lý à~',
    'Em nghĩ có thể thuần hóa được con sói hoang này sao, cưng?',
    'Tay em ấm thật... chạm sâu thêm chút nữa đi.',
    'Đừng chạy... ở Địa Ngục này, em là con mồi duy nhất của tôi.',
  ],
  'char-13-asmodeus': [
    'Nhân viên của tôi à...em biết em làm vậy...Tôi thích lắm không hả~?',
    'Dục vọng là món quà quyến rũ nhất của Địa Ngục... Em có muốn nếm thử không?',
    'Hơi thở của em đang run rẩy kìa... Đáng yêu và gợi cảm vô cùng.',
  ],
  'char-10-belphegor': [
    'Thì ra hệ thống của tôi cũng có mặt này à?',
    'Buồn ngủ quá... nhưng nếu là em chạm vào, ta sẽ thức thêm một lát.',
    'Ôm chặt lấy ta đi... chiếc giường Địa Ngục này lạnh lắm nếu không có em.',
  ],
  'char-2-thetri': [
    'Bà xã...việc này kì quá. Thả anh ra đi..',
    'Giáo sư... hay là người tình bí mật? Em muốn tôi vào vai nào tối nay?',
    'Đừng nhìn tôi bằng ánh mắt ấy... trên giảng đường tôi nghiêm khắc, nhưng ở đây thì khác.',
  ],
  'char-5-ducson': [
    'N-Nàng...việc làm này thật không hợp lễ giáo chút nào...',
    'Đại ca giang hồ cũng biết mềm lòng... nhất là trước mặt em.',
    'Em mà còn sờ lung tung nữa là tôi đè em ra hôn đấy.',
  ],
  'char-7-james': [
    'Mi amor...em làm vậy thật hấp dẫn',
    'Tiểu thư... quản gia của người sẵn sàng phục tùng mọi mệnh lệnh sâu kín nhất.',
    'Hơi thở của người... khiến tôi chỉ muốn xé toạc ranh giới chủ tớ này ra.',
  ],
  'char-8-votran': [
    'Em trai à...em thử thả trói tay anh đi. Anh sẽ hướng dẫn em cách làm cho đúng.',
    'Tiên đạo vô tình... nhưng vì nàng, ta sẵn sàng đọa ma diệt thế.',
    'Hơi thở của nàng đã làm loạn hoàn toàn đạo tâm ngàn năm của ta...',
  ],
  'char-9-nolan': [
    'Em ơi...chậm chậm thôi.',
    'Thí nghiệm này... biến số duy nhất khiến tôi mất kiểm soát chính là em.',
    'Nhịp tim của tôi tăng 40% mỗi khi ngón tay em lướt qua... em là độc dược gì vậy?',
  ],
};

const DEFAULT_DIALOGUES = [
  'Hơi thở của em... làm lồng ngực tôi nóng rực.',
  'Đừng cử động vội... lại gần đây để tôi cảm nhận em rõ hơn.',
  'Chạm vào tôi như thế... em có chịu trách nhiệm được không?',
  'Ánh mắt của em tối nay quyến rũ đến nghẹt thở...',
];

export const HellInteractiveCharacterView: React.FC<HellInteractiveCharacterViewProps> = ({
  character,
  isOpen,
  onClose,
  soundEnabled = true,
  isAdmin = false,
}) => {
  const [touchParticles, setTouchParticles] = useState<
    { id: number; x: number; y: number; icon: string; color: string }[]
  >([]);
  const [currentDialogue, setCurrentDialogue] = useState<string>('');
  const [dialogueKey, setDialogueKey] = useState<number>(0);
  const [isFlinching, setIsFlinching] = useState<boolean>(false);
  const [heartbeatSoundActive, setHeartbeatSoundActive] = useState<boolean>(true);
  const [isPlayingVoice, setIsPlayingVoice] = useState<boolean>(false);
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>(null);

  // White Climax Progress Bar (0 to 100) & Screen Flash state
  const [climaxProgress, setClimaxProgress] = useState<number>(0);
  const [isWhiteoutFlashing, setIsWhiteoutFlashing] = useState<boolean>(false);
  const [isCleanView, setIsCleanView] = useState<boolean>(false);

  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const decayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bgmYtIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Check if Victor Laurent is selected
  const isVictor = character.id === 'char-18-victor-laurent';
  const bgmVideoId = isVictor ? VICTOR_YOUTUBE_BGM_ID : DEFAULT_HELL_YOUTUBE_BGM_ID;

  // Avatar URL with Hell mode override (Victor Laurent gets the user requested image)
  const avatarUrl = getCharacterAvatar(character, true);

  // Character dialogue pool
  const dialogues = CHARACTER_INTERACTION_DIALOGUES[character.id] || DEFAULT_DIALOGUES;

  // PostMessage helper for background sound effect YouTube iframe
  const sendYtCommand = useCallback((func: string, args: any[] = []) => {
    try {
      if (bgmYtIframeRef.current && bgmYtIframeRef.current.contentWindow) {
        bgmYtIframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func, args }),
          '*'
        );
      }
    } catch {
      // ignore
    }
  }, []);

  // Play background track CONTINUOUSLY throughout "Chơi" mode session until user exits
  useEffect(() => {
    if (!isOpen) {
      sendYtCommand('pauseVideo');
      return;
    }

    if (soundEnabled) {
      sendYtCommand('playVideo');
      sendYtCommand('setVolume', [80]);
    } else {
      sendYtCommand('pauseVideo');
    }
  }, [isOpen, soundEnabled, sendYtCommand]);

  // Initialize first dialogue & reset states when opened
  useEffect(() => {
    if (isOpen) {
      const initial = character.hellPlotSummary || dialogues[0] || 'Chào mừng em đến với cõi riêng của tôi...';
      setCurrentDialogue(initial);
      setClimaxProgress(0);
      setIsWhiteoutFlashing(false);
      setIsCleanView(false);
    }
  }, [isOpen, character.id, character.hellPlotSummary]);

  // Clean up audio on close or unmount
  useEffect(() => {
    if (!isOpen) {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.currentTime = 0;
      }
      setIsPlayingVoice(false);
      setActiveHotspotId(null);
      setIsWhiteoutFlashing(false);
      sendYtCommand('pauseVideo');
    }
  }, [isOpen, sendYtCommand]);

  useEffect(() => {
    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {
          // ignore
        }
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }
      if (decayTimerRef.current) {
        clearInterval(decayTimerRef.current);
      }
    };
  }, []);

  // Smooth decay of the white progress bar when not being clicked
  useEffect(() => {
    if (!isOpen) return;

    decayTimerRef.current = setInterval(() => {
      setClimaxProgress((prev) => {
        if (prev <= 0) return 0;
        return Math.max(0, prev - 1.0);
      });
    }, 120);

    return () => {
      if (decayTimerRef.current) clearInterval(decayTimerRef.current);
    };
  }, [isOpen]);

  // Web Audio Heartbeat synthesizer
  const playHeartbeatSound = useCallback(() => {
    if (!soundEnabled || !heartbeatSoundActive) return;
    try {
      const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = ctx;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.18);

      // Second beat (thump-thump)
      setTimeout(() => {
        try {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(55, ctx.currentTime);
          osc2.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.12);

          gain2.gain.setValueAtTime(0.001, ctx.currentTime);
          gain2.gain.linearRampToValueAtTime(0.14, ctx.currentTime + 0.02);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          osc2.connect(gain2);
          gain2.connect(ctx.destination);

          osc2.start();
          osc2.stop(ctx.currentTime + 0.18);
        } catch {
          // ignore
        }
      }, 140);
    } catch {
      // ignore
    }
  }, [soundEnabled, heartbeatSoundActive]);

  // Periodic heartbeat loop
  useEffect(() => {
    if (!isOpen || !heartbeatSoundActive) {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
      return;
    }

    heartbeatTimerRef.current = setInterval(() => {
      playHeartbeatSound();
    }, 2800);

    return () => {
      if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    };
  }, [isOpen, heartbeatSoundActive, playHeartbeatSound]);

  // Trigger Climax Event when Progress Bar hits 100%
  const triggerClimaxEvent = useCallback(() => {
    setIsWhiteoutFlashing(true);

    // Stop current voice
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
    }

    // Play Climax Voice
    try {
      const climaxAudio = new Audio(CLIMAX_VOICE_URL);
      voiceAudioRef.current = climaxAudio;
      climaxAudio.volume = 1.0;
      setIsPlayingVoice(true);

      climaxAudio.onended = () => {
        setIsPlayingVoice(false);
      };
      climaxAudio.onerror = () => {
        setIsPlayingVoice(false);
      };

      climaxAudio.play().catch((e) => {
        console.warn('Climax voice play failed:', e);
        setIsPlayingVoice(false);
      });
    } catch (err) {
      console.warn('Climax audio err:', err);
    }

    // Dialogue update
    setCurrentDialogue('i love you...');
    setDialogueKey((prev) => prev + 1);

    // Flash screen white for 2.4 seconds then smoothly reset progress
    setTimeout(() => {
      setIsWhiteoutFlashing(false);
      setClimaxProgress(0);
    }, 2400);
  }, []);

  // Handle clicking on specific white heart hotspot
  const handleHotspotClick = (hotspot: BodyHotspot, e?: React.MouseEvent) => {
    playUiClick(soundEnabled);
    playHeartbeatSound();

    // 1. Determine Voice URL:
    const selectedVoiceUrl =
      hotspot.part === 'mouth'
        ? (isVictor ? VICTOR_MOUTH_VOICE_URL : MOUTH_ASMR_VOICE_URL)
        : BODY_VOICE_URLS[Math.floor(Math.random() * BODY_VOICE_URLS.length)];

    try {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.currentTime = 0;
      }

      const audio = new Audio(selectedVoiceUrl);
      voiceAudioRef.current = audio;
      audio.volume = 1.0;

      setIsPlayingVoice(true);
      setActiveHotspotId(hotspot.id);

      audio.onended = () => {
        setIsPlayingVoice(false);
        setActiveHotspotId(null);
      };

      audio.onerror = (err) => {
        console.warn('Voice play failed:', err);
        setIsPlayingVoice(false);
        setActiveHotspotId(null);
      };

      audio.play().catch((err) => {
        console.warn('Voice play blocked or failed:', err);
        setIsPlayingVoice(false);
        setActiveHotspotId(null);
      });
    } catch (err) {
      console.warn('Voice play exception:', err);
      setIsPlayingVoice(false);
      setActiveHotspotId(null);
    }

    // 2. Flinch & shudder visual reaction
    setIsFlinching(true);
    setTimeout(() => setIsFlinching(false), 380);

    // 3. Update Progress Bar (+18% per click)
    setClimaxProgress((prev) => {
      const nextVal = Math.min(100, prev + 18);
      if (nextVal >= 100 && prev < 100) {
        triggerClimaxEvent();
      }
      return nextVal;
    });

    // 4. Update dialogue
    const useSpotLine = Math.random() > 0.3 && hotspot.whisperDialogues.length > 0;
    const nextLine = useSpotLine
      ? hotspot.whisperDialogues[Math.floor(Math.random() * hotspot.whisperDialogues.length)]
      : dialogues[Math.floor(Math.random() * dialogues.length)];
    setCurrentDialogue(nextLine);
    setDialogueKey((prev) => prev + 1);

    // 5. Spawn gentle floating white/pink spark particles at the clicked position
    const clientX = e ? e.clientX : window.innerWidth / 2;
    const clientY = e ? e.clientY : window.innerHeight / 2;
    const burstParticles = [
      { id: Date.now() + 1, x: clientX - 12, y: clientY - 10, icon: '🤍', color: '#ffffff' },
      { id: Date.now() + 2, x: clientX + 12, y: clientY + 5, icon: '✨', color: '#ffffff' },
      { id: Date.now() + 3, x: clientX, y: clientY - 20, icon: '💋', color: '#fda4af' },
    ];
    setTouchParticles((prev) => [...prev.slice(-8), ...burstParticles]);
    setTimeout(() => {
      setTouchParticles((prev) =>
        prev.filter((p) => !burstParticles.some((bp) => bp.id === p.id))
      );
    }, 1300);
  };

  // General screen touch (spawns gentle spark particle)
  const handleGeneralScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const x = e.clientX;
    const y = e.clientY;
    const icons = ['✨', '🤍', '🍷'];
    const p = {
      id: Date.now() + Math.random(),
      x,
      y,
      icon: icons[Math.floor(Math.random() * icons.length)],
      color: '#ffffff',
    };
    setTouchParticles((prev) => [...prev.slice(-8), p]);
    setTimeout(() => {
      setTouchParticles((prev) => prev.filter((item) => item.id !== p.id));
    }, 1200);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        onClick={handleGeneralScreenClick}
        className="fixed inset-0 z-[120] bg-black text-white flex flex-col justify-between overflow-hidden select-none"
      >
        {/* Background Track YouTube iFrame (plays continuously throughout "Chơi" session until exit) */}
        <iframe
          ref={bgmYtIframeRef}
          id="hell-interactive-bgm-youtube-player"
          src={`https://www.youtube.com/embed/${bgmVideoId}?enablejsapi=1&autoplay=1&loop=1&playlist=${bgmVideoId}&controls=0`}
          allow="autoplay; encrypted-media"
          title="Interactive Mode Background Music"
          onLoad={() => {
            if (isOpen && soundEnabled) {
              sendYtCommand('playVideo');
              sendYtCommand('setVolume', [80]);
            }
          }}
          className="fixed -bottom-96 -right-96 w-1 h-1 opacity-0 pointer-events-none"
          aria-hidden="true"
        />

        {/* WHITEOUT FLASH SCREEN WHEN REACHING 100% CLIMAX PROGRESS (Vintage font, no emojis, "i love you...") */}
        <AnimatePresence>
          {isWhiteoutFlashing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0.3, 1, 0.5, 1, 0.8, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.3,
                times: [0, 0.12, 0.3, 0.5, 0.68, 0.82, 0.92, 1],
                ease: 'easeInOut',
              }}
              className="fixed inset-0 z-[160] bg-white pointer-events-none flex items-center justify-center"
            >
              <div className="text-center font-serif italic text-slate-800 text-2xl sm:text-4xl md:text-5xl tracking-[0.25em] lowercase drop-shadow-sm px-4">
                i love you...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FULLSCREEN BACKGROUND AMBIENT GLOW & BLUR */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover blur-3xl opacity-35 scale-110"
            draggable={false}
          />
          <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/90 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/75 pointer-events-none" />
        </div>

        {/* FLOATING EMBER SPARKS */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-gradient-to-r from-red-400 to-amber-300 blur-[0.5px]"
              initial={{
                x: `${(i * 8.5) % 100}%`,
                y: '105%',
                opacity: 0.2 + (i % 4) * 0.15,
                scale: 0.8 + (i % 3) * 0.4,
              }}
              animate={{
                y: '-10%',
                opacity: [0, 0.75, 0],
                x: `${((i * 8.5) % 100) + (i % 2 === 0 ? 6 : -6)}%`,
              }}
              transition={{
                duration: 6 + (i % 4) * 2,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'linear',
              }}
            />
          ))}
        </div>

        {/* MINIMAL TOP FLOATING HEADER (Close X button + Eye toggle + Char Name) */}
        <header className="relative z-40 w-full px-4 sm:px-6 pt-4 pb-2 flex items-center justify-between pointer-events-none">
          {/* Left: Exit X button & Character Name */}
          <div className="flex items-center gap-2.5 pointer-events-auto">
            {!isCleanView && (
              <>
                {/* Exit Close Button (Only X icon) */}
                <button
                  type="button"
                  onClick={() => {
                    playUiClick(soundEnabled);
                    onClose();
                  }}
                  title="Thoát"
                  className="p-2 sm:p-2.5 rounded-2xl bg-red-600/90 hover:bg-red-500 text-white border border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.7)] hover:shadow-[0_0_30px_rgba(239,68,68,1)] transition-all cursor-pointer flex items-center justify-center active:scale-95 backdrop-blur-md"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
                </button>

                <div className="px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md border border-red-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.8)] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                  <h2 className="text-sm sm:text-base font-black text-white tracking-wide drop-shadow-md">
                    {character.name}
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-red-950/90 text-amber-300 text-[10px] sm:text-xs font-black border border-red-700/60 shadow-xs">
                    {character.roleTag || '18+ Hell Realm'}
                  </span>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-md bg-purple-950/90 text-purple-300 text-[10px] sm:text-xs font-black border border-purple-500/60 shadow-xs flex items-center gap-1">
                      👑 Admin
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Sound controls & Stylized Eye Focus Toggle Button */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {!isCleanView && isPlayingVoice && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black border border-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.7)] flex items-center gap-1.5 animate-pulse"
              >
                <Radio className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Đang phát voice...</span>
              </motion.div>
            )}

            {!isCleanView && (
              <button
                type="button"
                onClick={() => {
                  playUiClick(soundEnabled);
                  setHeartbeatSoundActive(!heartbeatSoundActive);
                }}
                title={heartbeatSoundActive ? 'Tắt âm nhịp tim' : 'Bật âm nhịp tim'}
                className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-black/70 hover:bg-white/10 text-red-200 border border-red-900/60 transition-all cursor-pointer flex items-center gap-1 text-xs font-bold backdrop-blur-md"
              >
                {heartbeatSoundActive ? (
                  <Volume2 className="w-4 h-4 text-rose-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400" />
                )}
              </button>
            )}

            {/* Stylized Eye Toggle Button (ALWAYS VISIBLE in both modes) */}
            <button
              type="button"
              onClick={() => {
                playUiClick(soundEnabled);
                setIsCleanView(!isCleanView);
              }}
              title={isCleanView ? 'Hiện lại nút & giao diện' : 'Chế độ ngắm ảnh rõ nét (Ẩn giao diện)'}
              className={`p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center backdrop-blur-md active:scale-95 shadow-lg ${
                isCleanView
                  ? 'bg-rose-600/90 hover:bg-rose-500 text-white border border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.9)] animate-bounce'
                  : 'bg-black/75 hover:bg-white/20 text-rose-200 border border-red-800/80 shadow-[0_0_12px_rgba(220,38,38,0.4)]'
              }`}
            >
              {isCleanView ? (
                <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-amber-200" />
              ) : (
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />
              )}
            </button>
          </div>
        </header>

        {/* MAIN FULLSCREEN VIEWPORT: IMAGE FILLS ENTIRE SCREEN WITH BREATHING & SENSITIVE HOTSPOTS */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center overflow-hidden">
          {/* Animated Breathing Character Layer */}
          <motion.div
            animate={{
              scale: isFlinching ? 1.045 : [1.0, 1.025, 1.0],
              y: isFlinching ? -6 : [0, -4, 0],
              filter: isFlinching
                ? 'drop-shadow(0 0 60px rgba(244, 63, 94, 0.95)) brightness(1.12)'
                : [
                    'drop-shadow(0 0 30px rgba(220, 38, 38, 0.35)) brightness(1.0)',
                    'drop-shadow(0 0 45px rgba(244, 63, 94, 0.55)) brightness(1.03)',
                    'drop-shadow(0 0 30px rgba(220, 38, 38, 0.35)) brightness(1.0)',
                  ],
            }}
            transition={{
              duration: isFlinching ? 0.3 : 3.5,
              repeat: isFlinching ? 0 : Infinity,
              ease: 'easeInOut',
            }}
            className="relative w-full h-full flex items-center justify-center select-none will-change-transform"
          >
            {/* FULLSCREEN CHARACTER IMAGE */}
            <img
              src={avatarUrl}
              alt={character.name}
              className="w-full h-full object-cover object-top select-none pointer-events-none"
              draggable={false}
            />

            {/* Subtle chest breathing light aura */}
            <motion.div
              animate={{
                opacity: [0.15, 0.45, 0.15],
                scale: [0.95, 1.12, 0.95],
              }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute top-[58%] left-[50%] w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-500/20 blur-3xl pointer-events-none"
            />

            {/* SENSITIVE BODY HOTSPOTS FRAME: Perfectly centered frame with white heart icons */}
            <div className="absolute inset-0 w-full h-full max-w-md mx-auto pointer-events-none">
              {BODY_HOTSPOTS.map((hotspot) => {
                const isActive = activeHotspotId === hotspot.id;
                return (
                  <motion.button
                    key={hotspot.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleHotspotClick(hotspot, e);
                    }}
                    animate={{
                      scale: isActive ? [1, 1.35, 1.15] : [1, 1.22, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: isActive ? 0.8 : 1.6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-30 group flex items-center justify-center cursor-pointer select-none active:scale-90"
                    style={{ top: hotspot.top, left: hotspot.left }}
                    title={`Chạm vào ${hotspot.name} để phát voice`}
                    aria-label={`Điểm tương tác ${hotspot.name}`}
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Subtle clean white pulse ring */}
                      <span className="absolute -inset-2 rounded-full bg-white/25 animate-ping pointer-events-none" />

                      {/* Simple, clean white heart icon indicator */}
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/25 hover:bg-white/50 backdrop-blur-xs border border-white/80 shadow-[0_0_14px_rgba(255,255,255,0.75)] flex items-center justify-center transition-all group-hover:scale-120">
                        <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white drop-shadow-sm" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* CLICK PARTICLE BURSTS */}
        <AnimatePresence>
          {touchParticles.map((pt) => (
            <motion.div
              key={pt.id}
              initial={{ opacity: 1, scale: 0.6, x: pt.x, y: pt.y }}
              animate={{
                opacity: 0,
                scale: 1.8,
                y: pt.y - 80,
                x: pt.x + (Math.random() * 30 - 15),
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: 'easeOut' }}
              className="fixed pointer-events-none z-50 font-black text-2xl drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]"
              style={{ color: pt.color }}
            >
              {pt.icon}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* BOTTOM SECTION: PROGRESS BAR & DIALOGUE WHISPER SUBTITLE */}
        <footer className="relative z-40 w-full px-4 pb-5 pt-2 flex flex-col items-center pointer-events-none">
          <div className="w-full max-w-2xl pointer-events-auto flex flex-col items-center">
            {/* WHITE PROGRESS BAR */}
            <div className="w-full max-w-xl mb-3 flex flex-col gap-1 select-none">
              <div className="flex items-center justify-between text-[11px] font-black tracking-wider text-white drop-shadow-sm px-1">
                <span className="flex items-center gap-1.5 text-white/90">
                  <Heart className={`w-3.5 h-3.5 fill-white text-white ${climaxProgress > 70 ? 'animate-bounce' : ''}`} />
                  <span>Độ hưng phấn / Cực khoái</span>
                </span>
                <span className="text-white font-mono font-black text-xs">
                  {Math.round(climaxProgress)}%
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="relative w-full h-2.5 sm:h-3 rounded-full bg-black/60 backdrop-blur-md border border-white/40 p-0.5 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.25)]">
                {/* Progress Bar Fill */}
                <motion.div
                  className={`h-full rounded-full transition-all duration-150 ${
                    climaxProgress >= 85
                      ? 'bg-white shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse'
                      : 'bg-gradient-to-r from-white/70 via-white/90 to-white shadow-[0_0_12px_rgba(255,255,255,0.8)]'
                  }`}
                  style={{ width: `${climaxProgress}%` }}
                />
              </div>
            </div>

            {/* Animated Dialogue Reaction Subtitle */}
            {!isCleanView && (
              <AnimatePresence mode="wait">
                <motion.div
                  key={dialogueKey}
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="w-full p-3.5 sm:p-4 rounded-2xl bg-black/80 backdrop-blur-md border border-red-500/60 shadow-[0_0_35px_rgba(220,38,38,0.45)] flex items-center gap-3 text-center sm:text-left justify-center sm:justify-start"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-600 border border-red-300 flex items-center justify-center shrink-0 shadow-lg shadow-red-900/40">
                    <Flame className="w-4 h-4 text-amber-200 fill-amber-300 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-rose-100 italic leading-relaxed drop-shadow-sm">
                      "{currentDialogue}"
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};
