// ─── Премиальные ручные иллюстрации питомцев (11 шт., единорожка — отдельно) ─
import { Frame, Ground, Spark, Glow, INK, lighten } from './shared';

type P = { size?: number; silhouette?: boolean; className?: string };

/** demo-01 · Пушистик-хранитель (Common) — пушистый комочек с листиком */
export function FluffballArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#EAFBF3" silhouette={silhouette} label="Пушистик-хранитель" className={className}>
      <Ground />
      <defs>
        <linearGradient id="fl-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#C9F2DE" />
        </linearGradient>
      </defs>
      {/* лапки */}
      <ellipse cx="84" cy="152" rx="11" ry="8" fill="#B9ECD4" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="118" cy="152" rx="11" ry="8" fill="#B9ECD4" stroke={INK} strokeWidth="2.4" />
      {/* пушистое тело-облако */}
      <path
        d="M64 132 Q50 114 64 100 Q58 82 80 80 Q86 62 104 68 Q120 56 132 70 Q150 70 146 88 Q160 100 146 114 Q152 132 132 136 Q124 152 106 144 Q90 154 76 142 Q58 144 64 132Z"
        fill="url(#fl-b)"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* листик-росток */}
      <g>
        <path d="M100 66 Q98 52 88 48" stroke="#3E9E6C" strokeWidth="3.4" fill="none" strokeLinecap="round" />
        <path d="M88 48 Q74 44 72 32 Q86 34 88 48Z" fill="#4ADE80" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M88 48 Q98 38 110 40 Q104 52 88 48Z" fill="#6FE0B8" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      </g>
      {/* лицо */}
      <g className="pet-eyes">
        <circle cx="88" cy="110" r="5" fill={INK} />
        <circle cx="114" cy="110" r="5" fill={INK} />
        <circle cx="89.6" cy="108.4" r="1.7" fill="#fff" />
        <circle cx="115.6" cy="108.4" r="1.7" fill="#fff" />
      </g>
      <ellipse cx="78" cy="120" rx="6.5" ry="4.2" fill="#F38BBF" opacity="0.5" />
      <ellipse cx="124" cy="120" rx="6.5" ry="4.2" fill="#F38BBF" opacity="0.5" />
      <path d="M95 122 Q101 128 107 122" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <Spark x={52} y={70} s={5} c="#4ADE80" />
      <Spark x={150} y={92} s={5} c="#4ADE80" delay={0.9} />
    </Frame>
  );
}

/** demo-02 · Росистый ежик (Common) — иголки с капельками росы */
export function HedgehogArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#FFF3E4" silhouette={silhouette} label="Росистый ежик" className={className}>
      <Ground />
      {/* панцирь-иголки */}
      <path
        d="M52 128 L44 106 L58 112 L54 90 L70 100 L68 78 L84 92 L88 70 L102 88 L110 68 L120 90 L136 80 L134 102 L150 96 L142 118 L154 118 L142 132 Z"
        fill="#8A5A3B"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M60 122 L54 108 L64 112 L62 96 L74 104 L74 88 L86 98 L90 82 L100 96 L108 80 L116 98 L128 90 L128 106 L140 102 L134 120 Z" fill="#A9744C" opacity="0.7" />
      {/* капельки росы */}
      <g fill="#7DD3FC" stroke={INK} strokeWidth="1.8">
        <circle cx="72" cy="86" r="5" />
        <circle cx="104" cy="76" r="5" />
        <circle cx="130" cy="96" r="5" />
      </g>
      <g fill="#fff" opacity="0.8">
        <circle cx="70.5" cy="84.5" r="1.6" />
        <circle cx="102.5" cy="74.5" r="1.6" />
        <circle cx="128.5" cy="94.5" r="1.6" />
      </g>
      {/* мордочка */}
      <ellipse cx="100" cy="126" rx="34" ry="26" fill="#FFD9C4" stroke={INK} strokeWidth="3" />
      <ellipse cx="100" cy="136" rx="15" ry="11" fill="#FFE9DC" />
      <circle cx="100" cy="132" r="4.6" fill={INK} />
      <g className="pet-eyes">
        <circle cx="84" cy="120" r="4.6" fill={INK} />
        <circle cx="116" cy="120" r="4.6" fill={INK} />
        <circle cx="85.5" cy="118.6" r="1.5" fill="#fff" />
        <circle cx="117.5" cy="118.6" r="1.5" fill="#fff" />
      </g>
      <path d="M94 142 Q100 146 106 142" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="74" cy="132" rx="5.5" ry="3.6" fill="#F38BBF" opacity="0.5" />
      <ellipse cx="126" cy="132" rx="5.5" ry="3.6" fill="#F38BBF" opacity="0.5" />
      <Spark x={56} y={60} s={5} />
      <Spark x={146} y={64} s={5} c="#7DD3FC" delay={1.1} />
    </Frame>
  );
}

/** demo-03 · Хмурый камнеед (Common) — валун с мхом и хмурым взглядом */
export function RockArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#EDF0F4" silhouette={silhouette} label="Хмурый камнеед" className={className}>
      <Ground rx={48} />
      {/* руки-камешки */}
      <circle cx="52" cy="128" r="12" fill="#B9C1CE" stroke={INK} strokeWidth="2.6" />
      <circle cx="150" cy="128" r="12" fill="#B9C1CE" stroke={INK} strokeWidth="2.6" />
      {/* тело-валун */}
      <path
        d="M60 152 L54 112 Q56 84 86 80 L122 78 Q148 84 148 112 L142 152 Z"
        fill="#C9CFD9"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M70 100 Q84 88 108 90 M96 130 L110 118 L120 128" stroke="#9AA3B2" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* мох */}
      <path d="M62 96 Q70 78 92 80 Q84 92 74 98 Q66 100 62 96Z" fill="#4ADE80" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="70" cy="88" r="3" fill="#6FE0B8" />
      {/* хмурые брови и глаза */}
      <path d="M82 106 L94 110 M126 106 L114 110" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />
      <g className="pet-eyes">
        <circle cx="90" cy="118" r="4.4" fill={INK} />
        <circle cx="118" cy="118" r="4.4" fill={INK} />
      </g>
      <path d="M96 136 Q104 132 112 136" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <ellipse cx="76" cy="128" rx="5" ry="3.2" fill="#F38BBF" opacity="0.35" />
      <ellipse cx="132" cy="128" rx="5" ry="3.2" fill="#F38BBF" opacity="0.35" />
      <Spark x={150} y={78} s={5} c="#9AA3B2" />
    </Frame>
  );
}

/** demo-04 · Светлячок-певец (Uncommon) — с музыкальной нотой */
export function FireflyArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#F3FFE4" silhouette={silhouette} label="Светлячок-певец" className={className}>
      <Ground />
      {/* свечение жучка */}
      <Glow cx={100} cy={126} r={44} color="#D9F99D" op={0.5} />
      {/* крылышки */}
      <g className="pet-wing-l">
        <ellipse cx="76" cy="88" rx="20" ry="9" fill="#EAF7FE" stroke="#9BDDF0" strokeWidth="2" transform="rotate(-32 76 88)" />
      </g>
      <g className="pet-wing-r">
        <ellipse cx="124" cy="88" rx="20" ry="9" fill="#EAF7FE" stroke="#9BDDF0" strokeWidth="2" transform="rotate(32 124 88)" />
      </g>
      {/* светящийся брюшко */}
      <ellipse cx="100" cy="130" rx="30" ry="26" fill="#FDE047" stroke={INK} strokeWidth="3" />
      <ellipse cx="100" cy="132" rx="19" ry="16" fill="#FDE047" opacity="0.8" />
      <path d="M78 122 Q100 114 122 122 M80 134 Q100 128 120 134" stroke="#EAB308" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="130" r="30" fill="none" stroke="#FDE047" strokeWidth="6" opacity="0.4" className="pet-aura" />
      {/* головка */}
      <circle cx="100" cy="88" r="24" fill="#4ADE80" stroke={INK} strokeWidth="3" />
      <path d="M88 70 Q84 58 76 54 M112 70 Q116 58 124 54" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <circle cx="75" cy="53" r="3.6" fill="#FDE047" stroke={INK} strokeWidth="1.8" />
      <circle cx="125" cy="53" r="3.6" fill="#FDE047" stroke={INK} strokeWidth="1.8" />
      <path d="M84 90 Q89 84 94 90 M106 90 Q111 84 116 90" stroke={INK} strokeWidth="2.8" fill="none" strokeLinecap="round" />
      <ellipse cx="88" cy="97" rx="5" ry="3.2" fill="#F38BBF" opacity="0.55" />
      <ellipse cx="112" cy="97" rx="5" ry="3.2" fill="#F38BBF" opacity="0.55" />
      {/* нота */}
      <g fill={INK}>
        <ellipse cx="142" cy="66" rx="5" ry="4" transform="rotate(-18 142 66)" />
        <path d="M146 64 L146 44 Q154 44 156 50" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      <Spark x={58} y={120} s={5} c="#A3E635" />
      <Spark x={146} y={112} s={5} c="#FDE047" delay={0.7} />
    </Frame>
  );
}

/** demo-05 · Облачный зайка (Uncommon) — заяц на облаке со звёздным следом */
export function CloudBunnyArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#E6F7FD" silhouette={silhouette} label="Облачный зайка" className={className}>
      <Ground rx={52} />
      {/* облако-лодочка */}
      <g>
        <circle cx="72" cy="140" r="20" fill="#fff" stroke={INK} strokeWidth="2.8" />
        <circle cx="100" cy="132" r="24" fill="#fff" stroke={INK} strokeWidth="2.8" />
        <circle cx="128" cy="140" r="18" fill="#fff" stroke={INK} strokeWidth="2.8" />
        <ellipse cx="100" cy="146" rx="42" ry="14" fill="#EAF7FE" stroke={INK} strokeWidth="2.8" />
      </g>
      {/* звёздный след от облака */}
      <Spark x={150} y={128} s={5} c="#5EC8ED" />
      <Spark x={160} y={112} s={4} c="#F38BBF" delay={0.6} />
      <Spark x={152} y={96} s={3.4} c="#FFD45C" delay={1.2} />
      {/* зайка */}
      <g>
        <path d="M84 84 Q76 44 88 34 Q98 44 94 84 Z" fill="#fff" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M88 78 Q84 50 89 42" stroke="#F38BBF" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M112 84 Q120 44 108 34 Q98 44 102 84 Z" fill="#fff" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M108 78 Q112 50 107 42" stroke="#F38BBF" strokeWidth="5" fill="none" strokeLinecap="round" />
        <ellipse cx="98" cy="108" rx="26" ry="24" fill="#fff" stroke={INK} strokeWidth="3" />
        <g className="pet-eyes">
          <circle cx="88" cy="104" r="4.2" fill={INK} />
          <circle cx="108" cy="104" r="4.2" fill={INK} />
          <circle cx="89.4" cy="102.6" r="1.4" fill="#fff" />
          <circle cx="109.4" cy="102.6" r="1.4" fill="#fff" />
        </g>
        <path d="M96 112 h4 M98 112 v3" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <path d="M93 117 Q98 121 103 117" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
        <ellipse cx="80" cy="112" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
        <ellipse cx="116" cy="112" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
      </g>
    </Frame>
  );
}

/** demo-06 · Лисёнок-звездочёт (Rare) */
export function FoxArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#FFF1E0" silhouette={silhouette} label="Лисёнок-звездочёт" className={className}>
      <Ground />
      <defs>
        <linearGradient id="fx-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten('#F2994A', 30)} />
          <stop offset="100%" stopColor="#F2994A" />
        </linearGradient>
      </defs>
      {/* хвост с белым кончиком */}
      <path d="M130 128 Q172 124 168 88 Q158 108 142 108 Q154 92 144 76 Q136 96 124 104 Z" fill="url(#fx-b)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M150 116 Q170 108 168 90 Q162 106 150 108 Z" fill="#fff" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      {/* тело */}
      <ellipse cx="102" cy="126" rx="32" ry="28" fill="url(#fx-b)" stroke={INK} strokeWidth="3" />
      <ellipse cx="98" cy="134" rx="15" ry="14" fill="#FFE9DC" />
      {/* лапки */}
      <ellipse cx="86" cy="152" rx="10" ry="7" fill="#E8823C" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="118" cy="152" rx="10" ry="7" fill="#E8823C" stroke={INK} strokeWidth="2.4" />
      {/* голова */}
      <circle cx="96" cy="82" r="30" fill="url(#fx-b)" stroke={INK} strokeWidth="3" />
      {/* уши */}
      <path d="M72 66 L62 34 L88 52 Z" fill="url(#fx-b)" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M74 58 L69 42 L83 52 Z" fill="#F38BBF" />
      <path d="M120 66 L130 34 L104 52 Z" fill="url(#fx-b)" stroke={INK} strokeWidth="2.8" strokeLinejoin="round" />
      <path d="M118 58 L123 42 L109 52 Z" fill="#F38BBF" />
      {/* белая мордочка */}
      <path d="M78 88 Q96 76 114 88 Q112 106 96 108 Q80 106 78 88Z" fill="#FFE9DC" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <circle cx="96" cy="90" r="4.6" fill={INK} />
      <g className="pet-eyes">
        <circle cx="84" cy="78" r="4.8" fill={INK} />
        <circle cx="108" cy="78" r="4.8" fill={INK} />
        <circle cx="85.6" cy="76.4" r="1.6" fill="#fff" />
        <circle cx="109.6" cy="76.4" r="1.6" fill="#fff" />
      </g>
      <path d="M90 98 Q96 103 102 98" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      {/* звёздная брошь-звездочёт */}
      <path d="M118 118 l2 4.4 4.4 2 -4.4 2 -2 4.4 -2 -4.4 -4.4 -2 4.4 -2z" fill="#FFD45C" stroke={INK} strokeWidth="1.6" />
      <Spark x={58} y={52} s={5} />
      <Spark x={146} y={60} s={5} c="#5EC8ED" delay={0.8} />
      <Spark x={140} y={142} s={4.4} c="#A78BFA" delay={1.4} />
    </Frame>
  );
}

/** demo-07 · Кристальный медвежонок (Rare) */
export function CrystalBearArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#EAF6FF" silhouette={silhouette} label="Кристальный медвежонок" className={className}>
      <Ground />
      <defs>
        <linearGradient id="cb-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D6EEF8" />
        </linearGradient>
        <linearGradient id="cb-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BDE9FA" />
          <stop offset="100%" stopColor="#5EC8ED" />
        </linearGradient>
      </defs>
      {/* кристаллы за спиной */}
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M126 110 L142 62 L156 110 Z" fill="url(#cb-c)" />
        <path d="M142 62 L142 110" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
        <path d="M144 112 L158 78 L170 112 Z" fill="url(#cb-c)" />
        <path d="M116 112 L126 84 L136 112 Z" fill="url(#cb-c)" />
      </g>
      {/* медвежонок */}
      <ellipse cx="92" cy="126" rx="34" ry="30" fill="url(#cb-b)" stroke={INK} strokeWidth="3" />
      <ellipse cx="92" cy="134" rx="16" ry="14" fill="#fff" />
      <circle cx="62" cy="66" r="10" fill="url(#cb-b)" stroke={INK} strokeWidth="2.6" />
      <circle cx="62" cy="66" r="4.6" fill="#BDE9FA" />
      <circle cx="118" cy="66" r="10" fill="url(#cb-b)" stroke={INK} strokeWidth="2.6" />
      <circle cx="118" cy="66" r="4.6" fill="#BDE9FA" />
      <circle cx="90" cy="86" r="28" fill="url(#cb-b)" stroke={INK} strokeWidth="3" />
      <ellipse cx="90" cy="98" rx="13" ry="10" fill="#fff" />
      <circle cx="90" cy="93" r="4.4" fill={INK} />
      <g className="pet-eyes">
        <circle cx="79" cy="82" r="4.6" fill={INK} />
        <circle cx="101" cy="82" r="4.6" fill={INK} />
        <circle cx="80.5" cy="80.4" r="1.5" fill="#fff" />
        <circle cx="102.5" cy="80.4" r="1.5" fill="#fff" />
      </g>
      <path d="M84 102 Q90 107 96 102" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="70" cy="94" rx="5.4" ry="3.4" fill="#F38BBF" opacity="0.45" />
      <ellipse cx="110" cy="94" rx="5.4" ry="3.4" fill="#F38BBF" opacity="0.45" />
      <Spark x={52} y={96} s={5} c="#7DD3FC" />
      <Spark x={146} y={52} s={5} c="#BDE9FA" delay={0.7} />
      <Spark x={130} y={140} s={4.4} c="#7DD3FC" delay={1.3} />
    </Frame>
  );
}

/** demo-08 · Портальный кот (Epic) — хвост уходит в портал */
export function PortalCatArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#EFEAFB" silhouette={silhouette} label="Портальный кот" className={className}>
      <Ground />
      <defs>
        <linearGradient id="pc-p" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F38BBF" />
          <stop offset="50%" stopColor="#7655D9" />
          <stop offset="100%" stopColor="#5EC8ED" />
        </linearGradient>
        <linearGradient id="pc-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten('#8B6FE8', 25)} />
          <stop offset="100%" stopColor="#8B6FE8" />
        </linearGradient>
      </defs>
      {/* портал за котом */}
      <g>
        <ellipse cx="140" cy="104" rx="26" ry="36" fill="none" stroke="url(#pc-p)" strokeWidth="9" opacity="0.9" />
        <ellipse cx="140" cy="104" rx="17" ry="26" fill="#2E2647" opacity="0.85" />
        <ellipse cx="140" cy="104" rx="17" ry="26" fill="none" stroke="#B79CFF" strokeWidth="2" strokeDasharray="5 7" className="animate-wiggle" />
        <Spark x={140} y={64} s={4} c="#B79CFF" />
        <Spark x={164} y={104} s={4} c="#5EC8ED" delay={0.7} />
      </g>
      {/* хвост, исчезающий в портале */}
      <path d="M116 132 Q136 134 138 116" stroke="#8B6FE8" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* тело */}
      <ellipse cx="94" cy="126" rx="32" ry="28" fill="url(#pc-b)" stroke={INK} strokeWidth="3" />
      <ellipse cx="90" cy="134" rx="14" ry="13" fill="#EFEAFB" opacity="0.85" />
      {/* звёздный узор */}
      <path d="M104 118 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#FFD45C" opacity="0.9" />
      {/* лапки */}
      <ellipse cx="80" cy="152" rx="10" ry="7" fill="#7655D9" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="110" cy="152" rx="10" ry="7" fill="#7655D9" stroke={INK} strokeWidth="2.4" />
      {/* голова с ушами */}
      <path d="M66 66 L58 38 L82 54 Z" fill="url(#pc-b)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M68 58 L64 44 L76 53 Z" fill="#F38BBF" />
      <path d="M118 66 L126 38 L102 54 Z" fill="url(#pc-b)" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M116 58 L120 44 L108 53 Z" fill="#F38BBF" />
      <circle cx="92" cy="82" r="28" fill="url(#pc-b)" stroke={INK} strokeWidth="3" />
      {/* большие зелёные глаза */}
      <g className="pet-eyes">
        <ellipse cx="81" cy="80" rx="6.4" ry="7.4" fill="#fff" stroke={INK} strokeWidth="2" />
        <ellipse cx="103" cy="80" rx="6.4" ry="7.4" fill="#fff" stroke={INK} strokeWidth="2" />
        <ellipse cx="81" cy="81" rx="4" ry="5.2" fill="#4ADE80" stroke={INK} strokeWidth="1.4" />
        <ellipse cx="103" cy="81" rx="4" ry="5.2" fill="#4ADE80" stroke={INK} strokeWidth="1.4" />
        <ellipse cx="81" cy="82" rx="1.8" ry="2.6" fill={INK} />
        <ellipse cx="103" cy="82" rx="1.8" ry="2.6" fill={INK} />
        <circle cx="79.4" cy="78.6" r="1.4" fill="#fff" />
        <circle cx="101.4" cy="78.6" r="1.4" fill="#fff" />
      </g>
      <path d="M92 88 v4 M88 94 Q92 97 96 94" stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <ellipse cx="72" cy="90" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
      <ellipse cx="112" cy="90" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
    </Frame>
  );
}

/** demo-09 · Дракончик-сюрприз (Epic) — чихает конфетти */
export function DragonArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#E6FBF3" silhouette={silhouette} label="Дракончик-сюрприз" className={className}>
      <Ground />
      <defs>
        <linearGradient id="dr-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighten('#6FE0B8', 25)} />
          <stop offset="100%" stopColor="#4ECFA5" />
        </linearGradient>
      </defs>
      {/* конфетти-выдох */}
      <g>
        <rect x="40" y="66" width="7" height="7" rx="2" fill="#F38BBF" transform="rotate(18 43 69)" />
        <rect x="30" y="80" width="6" height="6" rx="2" fill="#FFD45C" transform="rotate(-24 33 83)" />
        <circle cx="42" cy="94" r="3.4" fill="#5EC8ED" />
        <rect x="26" y="64" width="5" height="5" rx="1.6" fill="#A78BFA" transform="rotate(40 28 66)" />
        <circle cx="30" cy="104" r="2.6" fill="#FF6B6B" />
      </g>
      {/* крылья */}
      <g className="pet-wing-l">
        <path d="M112 96 Q140 78 148 96 Q132 96 128 106 Q118 104 112 96Z" fill="#BDE9FA" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      </g>
      {/* тело с чешуёй */}
      <ellipse cx="102" cy="126" rx="34" ry="28" fill="url(#dr-b)" stroke={INK} strokeWidth="3" />
      <ellipse cx="102" cy="132" rx="18" ry="15" fill="#EAFBF3" />
      <path d="M90 126 q6 6 12 0 M98 134 q6 6 12 0" stroke="#4ECFA5" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* лапки */}
      <ellipse cx="86" cy="152" rx="10" ry="7" fill="#4ECFA5" stroke={INK} strokeWidth="2.4" />
      <ellipse cx="118" cy="152" rx="10" ry="7" fill="#4ECFA5" stroke={INK} strokeWidth="2.4" />
      {/* голова */}
      <circle cx="98" cy="84" r="27" fill="url(#dr-b)" stroke={INK} strokeWidth="3" />
      {/* рожки */}
      <path d="M82 62 L76 46 L90 56 Z" fill="#FFD45C" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M112 62 L118 46 L104 56 Z" fill="#FFD45C" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
      {/* морда */}
      <ellipse cx="84" cy="94" rx="14" ry="11" fill="#EAFBF3" stroke={INK} strokeWidth="2" />
      <circle cx="74" cy="90" r="2.4" fill={INK} />
      <g className="pet-eyes">
        <circle cx="94" cy="76" r="5" fill={INK} />
        <circle cx="112" cy="76" r="5" fill={INK} />
        <circle cx="95.6" cy="74.4" r="1.7" fill="#fff" />
        <circle cx="113.6" cy="74.4" r="1.7" fill="#fff" />
      </g>
      <path d="M86 100 Q92 105 98 100" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <ellipse cx="106" cy="92" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
    </Frame>
  );
}

/** demo-11 · Хранитель радуги (Mythic) */
export function RainbowKeeperArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#FDEAF4" silhouette={silhouette} label="Хранитель радуги" className={className}>
      <Ground rx={46} />
      {/* радуга-дуга */}
      <g fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M52 108 A48 48 0 0 1 148 108" stroke="#F38BBF" strokeWidth="6" />
        <path d="M60 108 A40 40 0 0 1 140 108" stroke="#FFD45C" strokeWidth="6" />
        <path d="M68 108 A32 32 0 0 1 132 108" stroke="#5EC8ED" strokeWidth="6" />
      </g>
      {/* пушистое тело */}
      <path
        d="M66 136 Q54 118 68 106 Q64 90 84 90 Q90 76 106 82 Q122 74 130 88 Q146 90 142 106 Q154 118 142 132 Q146 146 128 146 Q120 156 104 150 Q88 158 78 146 Q62 148 66 136Z"
        fill="#FFFFFF"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* солнышко-пряжка */}
      <g transform="translate(100 128)">
        <circle r="9" fill="#FFD45C" stroke={INK} strokeWidth="2.2" />
        <path d="M0 -14 v-4 M0 14 v4 M-14 0 h-4 M14 0 h4 M-10 -10 l-3 -3 M10 -10 l3 -3" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
        <circle r="3.6" fill="#FF9A3D" />
      </g>
      {/* лицо */}
      <g className="pet-eyes">
        <circle cx="86" cy="110" r="4.8" fill={INK} />
        <circle cx="114" cy="110" r="4.8" fill={INK} />
        <circle cx="87.6" cy="108.4" r="1.6" fill="#fff" />
        <circle cx="115.6" cy="108.4" r="1.6" fill="#fff" />
      </g>
      <ellipse cx="76" cy="120" rx="6" ry="3.8" fill="#F38BBF" opacity="0.55" />
      <ellipse cx="124" cy="120" rx="6" ry="3.8" fill="#F38BBF" opacity="0.55" />
      <path d="M94 118 Q100 124 106 118" stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <Spark x={56} y={70} s={5} c="#F38BBF" />
      <Spark x={146} y={64} s={5} c="#5EC8ED" delay={0.8} />
      <Spark x={150} y={130} s={4.4} c="#FFD45C" delay={1.5} />
    </Frame>
  );
}

/** demo-12 · Тень-невидимка (Secret) — дымка со светящимися глазами и печеньем */
export function ShadowArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#E4DEF7" silhouette={silhouette} label="Тень-невидимка" className={className}>
      <Ground rx={42} />
      <defs>
        <linearGradient id="sh-b" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5B4A96" />
          <stop offset="100%" stopColor="#2A2148" />
        </linearGradient>
        <radialGradient id="sh-e" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF3B0" />
          <stop offset="100%" stopColor="#FFD45C" />
        </radialGradient>
      </defs>
      {/* внешнее свечение */}
      <Glow cx={100} cy={112} r={58} color="#7655D9" op={0.22} />
      {/* дымное тело с волнистым низом */}
      <path
        d="M62 146 Q52 108 70 88 Q64 64 88 62 Q94 44 112 52 Q132 44 136 66 Q156 74 148 98 Q162 116 146 138 Q150 154 132 148 Q124 162 108 152 Q92 164 82 150 Q64 156 62 146Z"
        fill="url(#sh-b)"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
        opacity="0.96"
      />
      {/* вихри дыма */}
      <path d="M70 120 Q60 112 66 102 M140 108 Q150 100 144 90" stroke="#8B7BD9" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* ушки-тени */}
      <path d="M80 62 L74 40 L94 54 Z" fill="url(#sh-b)" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M124 60 L132 38 L110 52 Z" fill="url(#sh-b)" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {/* светящиеся глаза */}
      <g className="pet-eyes">
        <ellipse cx="88" cy="100" rx="7" ry="8.4" fill="url(#sh-e)" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="114" cy="100" rx="7" ry="8.4" fill="url(#sh-e)" stroke={INK} strokeWidth="1.8" />
        <ellipse cx="88" cy="101" rx="1.8" ry="4.6" fill={INK} />
        <ellipse cx="114" cy="101" rx="1.8" ry="4.6" fill={INK} />
      </g>
      {/* загадочная ухмылка */}
      <path d="M92 122 Q101 128 110 121" stroke="#FFD45C" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* запах печенья */}
      <g>
        <circle cx="140" cy="140" r="8" fill="#C98A5B" stroke={INK} strokeWidth="2" />
        <circle cx="137" cy="138" r="1.5" fill="#5A3E2B" />
        <circle cx="143" cy="141" r="1.5" fill="#5A3E2B" />
        <circle cx="139" cy="143" r="1.3" fill="#5A3E2B" />
        <circle cx="152" cy="124" r="6" fill="#C98A5B" stroke={INK} strokeWidth="1.8" />
        <circle cx="150" cy="123" r="1.2" fill="#5A3E2B" />
        <circle cx="154" cy="126" r="1.2" fill="#5A3E2B" />
        <path d="M132 118 Q126 108 132 98" stroke="#B79CFF" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.8" strokeDasharray="1 6" />
      </g>
      <Spark x={58} y={76} s={5} c="#B79CFF" />
      <Spark x={148} y={70} s={5} c="#FFD45C" delay={0.9} />
      <Spark x={64} y={150} s={4.4} c="#8B7BD9" delay={1.6} />
    </Frame>
  );
}

/** Сова дяди Ярика — особый почтовый питомец, живёт у Сони с самого начала */
export function OwlArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#FFF3E0" silhouette={silhouette} label="Сова дяди Ярика" className={className}>
      <Ground rx={40} />
      {/* хвост */}
      <path d="M86 150 L94 164 L100 150 L106 164 L112 150 L112 138 L86 138 Z" fill="#8A5A3B" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {/* тело */}
      <ellipse cx="99" cy="112" rx="34" ry="40" fill="#C98A5B" stroke={INK} strokeWidth="3" />
      <ellipse cx="99" cy="126" rx="20" ry="22" fill="#F3DFC2" stroke={INK} strokeWidth="2.2" />
      <path d="M90 118 q4 5 8 0 M100 118 q4 5 8 0 M92 130 q5 5 10 0" stroke="#D9B98C" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      {/* крыло с конвертом */}
      <path d="M64 104 Q50 116 58 132 Q68 128 72 118 Z" fill="#A9744C" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <g transform="rotate(-12 66 108)">
        <rect x="52" y="98" width="26" height="18" rx="3" fill="#fff" stroke={INK} strokeWidth="2" />
        <path d="M53 100 L65 110 L77 100" stroke={INK} strokeWidth="1.8" fill="none" />
        <path d="M74 94 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6z" fill="#FFD45C" stroke={INK} strokeWidth="1" />
      </g>
      {/* ушки-перья */}
      <path d="M76 74 L70 58 L86 66 Z" fill="#A9744C" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M122 74 L128 58 L112 66 Z" fill="#A9744C" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
      {/* голова */}
      <circle cx="99" cy="82" r="28" fill="#C98A5B" stroke={INK} strokeWidth="3" />
      {/* почтовая фуражка */}
      <g>
        <rect x="82" y="52" width="34" height="12" rx="4" fill="#5EC8ED" stroke={INK} strokeWidth="2.2" />
        <rect x="76" y="60" width="46" height="6" rx="3" fill="#5EC8ED" stroke={INK} strokeWidth="2.2" />
        <path d="M92 64 l2 4 4 2 -4 2 -2 4 -2 -4 -4 -2 4 -2z" fill="#FFD45C" stroke={INK} strokeWidth="1" />
      </g>
      {/* глаза */}
      <g className="pet-eyes">
        <circle cx="88" cy="84" r="11" fill="#fff" stroke={INK} strokeWidth="2.4" />
        <circle cx="110" cy="84" r="11" fill="#fff" stroke={INK} strokeWidth="2.4" />
        <circle cx="89" cy="85" r="5.4" fill="#5B3FBF" stroke={INK} strokeWidth="1.6" />
        <circle cx="109" cy="85" r="5.4" fill="#5B3FBF" stroke={INK} strokeWidth="1.6" />
        <circle cx="89" cy="86" r="2.6" fill={INK} />
        <circle cx="109" cy="86" r="2.6" fill={INK} />
        <circle cx="87" cy="82.5" r="1.6" fill="#fff" />
        <circle cx="107" cy="82.5" r="1.6" fill="#fff" />
      </g>
      {/* клюв и румяна */}
      <path d="M96 94 L99 100 L102 94 Z" fill="#F5A623" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="80" cy="94" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
      <ellipse cx="118" cy="94" rx="5" ry="3.2" fill="#F38BBF" opacity="0.5" />
      {/* лапки */}
      <path d="M88 150 v6 M94 150 v6 M104 150 v6 M110 150 v6" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
      <Spark x={140} y={60} s={5} c="#5EC8ED" />
      <Spark x={56} y={64} s={4.4} c="#FFD45C" delay={0.8} />
    </Frame>
  );
}

/** demo-13 · Хранительница тайн (Секретная) — существо в капюшоне с ключом */
export function SecretKeeperArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#EFEAFB" silhouette={silhouette} label="Хранительница тайн" className={className}>
      <Ground rx={38} />
      {/* мантия */}
      <path
        d="M62 148 Q56 108 74 88 Q68 64 100 58 Q132 64 126 88 Q144 108 138 148 Q120 158 100 156 Q80 158 62 148Z"
        fill="#5B4A96"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M74 96 Q68 120 72 144 M126 96 Q132 120 128 144" stroke="#433876" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* капюшон и лицо-тень */}
      <path d="M74 88 Q78 58 100 54 Q122 58 126 88 Q114 76 100 76 Q86 76 74 88Z" fill="#433876" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      <ellipse cx="100" cy="92" rx="20" ry="15" fill="#2A2148" stroke={INK} strokeWidth="2.2" />
      {/* светящиеся глаза */}
      <g className="pet-eyes">
        <ellipse cx="92" cy="92" rx="4.6" ry="6" fill="#7DF9E0" />
        <ellipse cx="108" cy="92" rx="4.6" ry="6" fill="#7DF9E0" />
      </g>
      {/* золотой ключ на груди */}
      <g transform="translate(100 122)" stroke="#FFD45C" strokeWidth="2.6" fill="none" strokeLinecap="round">
        <circle cx="0" cy="-6" r="5" fill="#FFD45C" stroke={INK} strokeWidth="2" />
        <path d="M0 -1 v12 M0 6 h5 M0 10 h4" />
      </g>
      {/* лапки */}
      <ellipse cx="86" cy="152" rx="9" ry="6" fill="#433876" stroke={INK} strokeWidth="2.2" />
      <ellipse cx="114" cy="152" rx="9" ry="6" fill="#433876" stroke={INK} strokeWidth="2.2" />
      <Spark x={56} y={70} s={4.6} c="#B79CFF" />
      <Spark x={146} y={80} s={4.6} c="#7DF9E0" delay={0.8} />
      <Spark x={140} y={130} s={4} c="#FFD45C" delay={1.4} />
    </Frame>
  );
}

/** demo-14 · Вечный страж (Вечная) — кристаллический голем со знаком бесконечности */
export function EternalGuardianArt({ size, silhouette, className }: P) {
  return (
    <Frame size={size} soft="#ECFEFF" silhouette={silhouette} label="Вечный страж" className={className}>
      <Ground rx={42} />
      <defs>
        <linearGradient id="et-c" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E0FBFF" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>
      </defs>
      {/* кристаллы за спиной */}
      <g stroke={INK} strokeWidth="2.4" strokeLinejoin="round">
        <path d="M126 116 L142 66 L158 116 Z" fill="url(#et-c)" />
        <path d="M142 66 L142 116" stroke="#fff" strokeWidth="1.8" opacity="0.7" />
        <path d="M152 118 L164 88 L176 118 Z" fill="url(#et-c)" />
      </g>
      {/* ноги */}
      <rect x="82" y="130" width="16" height="26" rx="6" fill="#7DD8E8" stroke={INK} strokeWidth="2.4" />
      <rect x="104" y="130" width="16" height="26" rx="6" fill="#7DD8E8" stroke={INK} strokeWidth="2.4" />
      {/* тело-кристалл */}
      <path d="M72 132 L80 92 L100 78 L120 92 L128 132 Q100 142 72 132Z" fill="url(#et-c)" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <path d="M100 78 L100 138 M80 92 L96 104 M120 92 L104 104" stroke="#fff" strokeWidth="2" opacity="0.65" />
      {/* голова */}
      <path d="M84 84 L100 62 L116 84 Q100 92 84 84Z" fill="#BAF2FA" stroke={INK} strokeWidth="2.6" strokeLinejoin="round" />
      {/* знак бесконечности на груди */}
      <path d="M88 112 q6 -8 12 0 q6 8 12 0" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {/* глаза */}
      <g className="pet-eyes">
        <circle cx="93" cy="78" r="3" fill={INK} />
        <circle cx="107" cy="78" r="3" fill={INK} />
      </g>
      <Spark x={58} y={88} s={5} c="#22D3EE" />
      <Spark x={148} y={58} s={4.4} c="#BAF2FA" delay={0.9} />
      <Spark x={64} y={140} s={4} c="#7DD3FC" delay={1.5} />
    </Frame>
  );
}
