export default function BracketLines() {
  return (
    <svg className="bracketLines" viewBox="0 0 1250 750" preserveAspectRatio="none">
      <g stroke="rgba(255,255,255,0.9)" strokeWidth="4" fill="none">
        {/* ESQUERDA TOP */}
        <path d="M300 150 H420 V250 H500" />
        <path d="M300 320 H420 V250 H500" />

        {/* ESQUERDA BOTTOM */}
        <path d="M300 430 H420 V530 H500" />
        <path d="M300 600 H420 V530 H500" />

        {/* SEMI ESQUERDA -> FINAL */}
        <path d="M550 250 H650 V380 H720" />
        <path d="M550 530 H650 V380 H720" />

        {/* DIREITA TOP */}
        <path d="M950 150 H830 V250 H750" />
        <path d="M950 320 H830 V250 H750" />

        {/* DIREITA BOTTOM */}
        <path d="M950 430 H830 V530 H750" />
        <path d="M950 600 H830 V530 H750" />

        {/* SEMI DIREITA -> FINAL */}
        <path d="M700 250 H600 V380 H530" />
        <path d="M700 530 H600 V380 H530" />
      </g>
    </svg>
  );
}