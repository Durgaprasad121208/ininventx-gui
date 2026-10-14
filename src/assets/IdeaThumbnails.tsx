import React from 'react';

interface ThumbnailProps {
  className?: string;
}

/**
 * 1. HandshakeSvg - Digital Connected Neural Network Clasping Hands
 * Matches Card 1 (Remote Support) & Card 4 (Unified Group Skills)
 */
export const HandshakeSvg: React.FC<ThumbnailProps> = ({ className }) => (
  <svg
    viewBox="0 0 360 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="360" height="160" fill="#040e21" />
    <circle cx="180" cy="80" r="75" fill="url(#blue-radial-glow)" opacity="0.45" />

    {/* Digital Constellation Mesh Links */}
    <g stroke="#0284c7" strokeWidth="1.2" opacity="0.6" strokeDasharray="3 3">
      <line x1="50" y1="40" x2="110" y2="75" />
      <line x1="110" y1="75" x2="160" y2="50" />
      <line x1="160" y1="50" x2="210" y2="85" />
      <line x1="210" y1="85" x2="270" y2="45" />
      <line x1="310" y1="90" x2="270" y2="45" />
      <line x1="60" y1="120" x2="120" y2="85" />
      <line x1="120" y1="85" x2="180" y2="105" />
      <line x1="180" y1="105" x2="240" y2="85" />
      <line x1="240" y1="85" x2="300" y2="120" />
      <line x1="110" y1="75" x2="120" y2="85" />
      <line x1="160" y1="50" x2="180" y2="105" />
      <line x1="210" y1="85" x2="240" y2="85" />
    </g>

    {/* Clasping Handshake Tech Curves */}
    <path
      d="M80 100 C 110 70, 140 60, 175 78 C 195 65, 230 70, 260 105"
      stroke="#38bdf8"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M100 115 C 130 90, 155 85, 180 92 C 205 85, 235 90, 270 125"
      stroke="#06b6d4"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M150 72 L 180 92 L 205 76"
      stroke="#29c9d1"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    {/* Glowing Nodes */}
    <circle cx="110" cy="75" r="4.5" fill="#38bdf8" />
    <circle cx="160" cy="50" r="4" fill="#67e8f9" />
    <circle cx="180" cy="80" r="6" fill="#29c9d1" />
    <circle cx="210" cy="85" r="4.5" fill="#38bdf8" />
    <circle cx="240" cy="85" r="3.5" fill="#60a5fa" />
    <circle cx="120" cy="85" r="3.5" fill="#0284c7" />
    <circle cx="180" cy="105" r="4" fill="#38bdf8" />
    <circle cx="270" cy="45" r="3" fill="#67e8f9" />

    <defs>
      <radialGradient id="blue-radial-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#040e21" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * 2. RoboticsSvg - Robotic Joint Arm with Data Stream Nodes
 * Matches Card 2 (Proposal Drafting) & Card 3 (Commissioning Checklist)
 */
export const RoboticsSvg: React.FC<ThumbnailProps> = ({ className }) => (
  <svg
    viewBox="0 0 360 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="360" height="160" fill="#040e21" />
    <circle cx="120" cy="90" r="65" fill="url(#cyan-glow)" opacity="0.45" />

    {/* Connected Robotics Joint Links */}
    <path
      d="M70 140 L 105 90 L 150 70 L 185 85 L 215 65"
      stroke="#06b6d4"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M150 70 L 180 50 L 220 52"
      stroke="#38bdf8"
      strokeWidth="2.5"
      strokeLinecap="round"
    />

    {/* Servo joints */}
    <circle cx="70" cy="140" r="9" fill="#0f172a" stroke="#06b6d4" strokeWidth="2.5" />
    <circle cx="105" cy="90" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2.5" />
    <circle cx="150" cy="70" r="7" fill="#0f172a" stroke="#29c9d1" strokeWidth="2.5" />
    <circle cx="185" cy="85" r="6" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />

    {/* Floating Cyber Holographic Data Blocks */}
    <rect x="230" y="55" width="20" height="20" rx="4" fill="#0284c7" opacity="0.85" />
    <rect x="265" y="45" width="16" height="16" rx="3.5" fill="#06b6d4" opacity="0.75" />
    <rect x="255" y="85" width="22" height="22" rx="4" fill="#38bdf8" opacity="0.7" />
    <rect x="290" y="75" width="14" height="14" rx="3" fill="#29c9d1" opacity="0.8" />

    {/* Glowing Data Beams */}
    <line x1="215" y1="65" x2="230" y2="65" stroke="#67e8f9" strokeWidth="2" strokeDasharray="2 2" />
    <line x1="250" y1="65" x2="265" y2="55" stroke="#38bdf8" strokeWidth="1.5" />
    <line x1="240" y1="75" x2="255" y2="85" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="3 3" />
    <circle cx="215" cy="65" r="4.5" fill="#67e8f9" />

    <defs>
      <radialGradient id="cyan-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#040e21" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * 3. FactorySvg - Industrial Plant & Chemical Refinery Silhouette
 * Matches Card 5 (Automated Test Harness for PLC Logic)
 */
export const FactorySvg: React.FC<ThumbnailProps> = ({ className }) => (
  <svg
    viewBox="0 0 360 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="360" height="160" fill="#030c1c" />
    <circle cx="240" cy="70" r="75" fill="url(#plant-radial)" opacity="0.4" />

    {/* Background Radar Grid Circle */}
    <circle cx="150" cy="50" r="28" stroke="#0284c7" strokeWidth="1" opacity="0.3" strokeDasharray="3 3" />
    <path d="M125 50 Q 140 35 155 52 T 175 48" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.6" />

    {/* Plant Structures & Distillation Towers */}
    {/* Large Storage Tank Left */}
    <rect x="140" y="110" width="34" height="30" rx="6" fill="#06223d" stroke="#0284c7" strokeWidth="1.5" />
    {/* Tall Distillation Column Center */}
    <rect x="195" y="65" width="20" height="75" rx="3" fill="#072b4d" stroke="#06b6d4" strokeWidth="1.8" />
    <line x1="195" y1="80" x2="215" y2="80" stroke="#06b6d4" strokeWidth="1" />
    <line x1="195" y1="95" x2="215" y2="95" stroke="#06b6d4" strokeWidth="1" />
    <line x1="195" y1="110" x2="215" y2="110" stroke="#06b6d4" strokeWidth="1" />
    {/* Tank Dome */}
    <path d="M195 65 C 195 55, 215 55, 215 65" fill="#072b4d" stroke="#06b6d4" strokeWidth="1.8" />

    {/* Second Reactor Column */}
    <rect x="225" y="78" width="18" height="62" rx="3" fill="#051f38" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M225 78 C 225 70, 243 70, 243 78" fill="#051f38" stroke="#38bdf8" strokeWidth="1.5" />

    {/* Interconnecting Piping System */}
    <path
      d="M205 60 L 205 45 L 260 45 L 260 90 L 280 90 L 280 140"
      stroke="#29c9d1"
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M174 125 L 195 125"
      stroke="#38bdf8"
      strokeWidth="2"
    />
    <path
      d="M215 90 L 225 90"
      stroke="#38bdf8"
      strokeWidth="2"
    />

    {/* Large Cylindrical Storage Tank Right */}
    <rect x="270" y="95" width="36" height="45" rx="6" fill="#07223b" stroke="#0284c7" strokeWidth="1.8" />
    <circle cx="288" cy="95" r="18" fill="#07223b" stroke="#0284c7" strokeWidth="1.5" />

    {/* Glowing Process Sensor Nodes */}
    <circle cx="205" cy="45" r="3.5" fill="#29c9d1" />
    <circle cx="260" cy="45" r="3.5" fill="#38bdf8" />
    <circle cx="260" cy="90" r="3.5" fill="#67e8f9" />
    <circle cx="174" cy="125" r="3" fill="#29c9d1" />

    {/* Ground Baseline */}
    <line x1="50" y1="140" x2="330" y2="140" stroke="#173153" strokeWidth="2" />

    <defs>
      <radialGradient id="plant-radial" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#0891b2" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#030c1c" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * 4. LeafSvg - Cybernetic Bioluminescent Leaf with Growth Graph
 * Matches Card 6 (Energy Insights Portal for Customers)
 */
export const LeafSvg: React.FC<ThumbnailProps> = ({ className }) => (
  <svg
    viewBox="0 0 360 160"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ width: '100%', height: '100%', display: 'block' }}
  >
    <rect width="360" height="160" fill="#030f1c" />
    <circle cx="190" cy="75" r="65" fill="url(#leaf-glow)" opacity="0.4" />

    {/* Exponential Performance Curve / Energy Trend */}
    <path
      d="M70 135 Q 150 130 200 90 T 310 35"
      stroke="#10b981"
      strokeWidth="2"
      fill="none"
      opacity="0.7"
    />
    <line x1="200" y1="90" x2="200" y2="140" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
    <line x1="260" y1="58" x2="260" y2="140" stroke="#059669" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
    <line x1="310" y1="35" x2="310" y2="140" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />

    {/* Bioluminescent Leaf Contour */}
    <path
      d="M140 135 C 140 70, 180 25, 230 25 C 240 60, 230 115, 140 135 Z"
      stroke="#34d399"
      strokeWidth="2.5"
      fill="#062e24"
      fillOpacity="0.3"
      strokeLinecap="round"
    />

    {/* Glowing Leaf Veins */}
    <path
      d="M145 130 Q 185 85 225 30"
      stroke="#29c9d1"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Secondary Veins */}
    <path d="M165 105 Q 185 100 200 110" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M175 90 Q 200 80 220 90" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M190 70 Q 205 60 225 65" stroke="#6ee7b7" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M160 110 Q 150 95 155 85" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M175 90 Q 165 75 170 65" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M190 70 Q 180 55 188 45" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />

    {/* Metric Nodes on Trend Curve */}
    <circle cx="200" cy="90" r="4" fill="#34d399" />
    <circle cx="260" cy="58" r="4.5" fill="#29c9d1" />
    <circle cx="310" cy="35" r="5" fill="#10b981" />

    <defs>
      <radialGradient id="leaf-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.75" />
        <stop offset="100%" stopColor="#030f1c" stopOpacity="0" />
      </radialGradient>
    </defs>
  </svg>
);

/**
 * Helper function to render matching SVG thumbnail based on type
 */
export const renderIdeaThumbnail = (type: string, className?: string) => {
  switch (type) {
    case 'robotics':
      return <RoboticsSvg className={className} />;
    case 'factory':
      return <FactorySvg className={className} />;
    case 'leaf':
      return <LeafSvg className={className} />;
    case 'handshake':
    default:
      return <HandshakeSvg className={className} />;
  }
};
