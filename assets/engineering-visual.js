// Signal paths connect the same three modules as the demo, with no animated data claims.
export function engineeringVisual(){
 const routes=[
  ['#6d8bff','M-15 75C98 58 125 151 266 150M386 150C434 150 440 81 490 81'],
  ['#b5b8d5','M-15 131C101 132 141 163 266 162M386 162C435 162 445 103 490 103'],
  ['#7ec2cf','M-15 213C115 230 133 174 266 174M386 174C440 174 445 243 490 243'],
  ['#c6ac78','M-15 258C99 268 138 186 266 186M386 186C438 186 446 263 490 263']
 ].map(([color,d])=>`<path stroke="${color}" d="${d}"/>`).join('');
 const pins=Array.from({length:6},(_,i)=>`<path d="M260 ${138+i*14}h9m117 0h9"/>`).join('');
 return `<svg class="engineering-schematic" viewBox="0 0 620 340" role="img" aria-label="ESP32 通过信号线连接 OLED 显示屏与 AHT10 传感器的装饰示意，非实时数据">
 <defs>
  <linearGradient id="signal-core-material" x1=".1" y1="0" x2=".8" y2="1"><stop stop-color="#343842"/><stop offset=".5" stop-color="#242830"/><stop offset="1" stop-color="#171a20"/></linearGradient>
  <filter id="signal-soft-glow" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="3.5"/></filter>
 </defs>
 <g class="signal-flow signal-glow">${routes}</g>
 <g class="signal-flow">${routes}</g>
 <g class="signal-pins">${pins}</g>
 <rect class="signal-core" x="268" y="111" width="119" height="124" rx="19"/>
 <path d="M286 112H368" stroke="#aab1c3" stroke-opacity=".45"/>
 <rect class="signal-core-inset" x="282" y="126" width="91" height="93" rx="11"/>
 <text class="signal-chip-label" x="327" y="172" text-anchor="middle">ESP32</text>
 <text class="signal-small-text" x="327" y="191" text-anchor="middle">WROOM-32</text>
 <circle cx="327" cy="205" r="2" fill="#c6cbb1"/>
 <g>
  <rect class="signal-module" x="490" y="47" width="105" height="85" rx="12"/>
  <rect class="signal-screen" x="503" y="59" width="79" height="48" rx="5"/>
  <path class="signal-wave" d="M511 86h12l5-11 8 18 7-12h30"/>
  <text class="signal-small-text" x="542" y="121" text-anchor="middle">OLED / I²C</text>
 </g>
 <g>
  <rect class="signal-module" x="490" y="216" width="105" height="81" rx="12"/>
  <rect x="526" y="229" width="32" height="30" rx="5" fill="#353c49" stroke="#7b8497" stroke-width=".7"/>
  <path d="M532 237h20m-20 6h20m-20 6h20" stroke="#a2acbe" stroke-width=".8"/>
  <text class="signal-small-text" x="542" y="282" text-anchor="middle">AHT10 / I²C</text>
 </g>
 </svg>`;
}
