// Reference-led SVG tracing. Decorative only; no project data or pointer targets.
export function geekFigure(includeForeground=true,includeFloor=true){
 const bust='M364 197C369 219 372 239 357 255C346 268 328 281 315 293C291 313 253 323 245 374C244 381 243 388 243 394C266 407 299 409 342 404C402 411 480 400 535 371Q542 368 542 361L542 345C539 321 520 306 493 293C479 287 461 281 449 277Q440 274 441 266Q441 261 444 258';
 const face='M345 128C343 135 343 142 344 149M367 181C378 190 390 197 401 204C402 215 401 229 402 238C416 245 430 251 443 256C455 262 467 262 474 248C480 232 484 216 486 199M486 176C486 163 493 150 491 132';
 const hand='M554 388C565 383 574 374 581 366C592 355 606 347 620 343C632 334 647 330 654 334C666 340 643 352 631 356Q623 359 617 362C622 368 631 371 640 371Q646 371 652 371C654 358 657 350 662 354C667 358 670 373 671 380C673 364 674 344 680 342C692 336 685 357 682 367C689 354 698 344 702 346C710 350 695 362 686 369Q683 378 681 388C681 397 664 401 645 402C610 403 579 401 554 393';
 const horizontal=Array.from({length:16},(_,i)=>`<path d="M-400 ${302+Math.pow(i/15,1.75)*185}H1500"/>`).join('');
 const perspective=Array.from({length:29},(_,i)=>{const x=-900+i*110;return `<path d="M${600+(x-600)*.06} 302L${x} 490"/>`;}).join('');
 return `<svg class="geek-figure" viewBox="0 0 1000 700" fill="none" aria-hidden="true" focusable="false">
 <defs><mask id="geek-floor-mask" maskUnits="userSpaceOnUse" x="-500" y="-80" width="2200" height="900"><rect x="-500" y="-80" width="2200" height="900" fill="white"/><path d="${bust}L444 258L367 181Z" fill="black"/><path d="${hand}Z" fill="black"/></mask></defs>
 <g transform="translate(-150 15) scale(1.45)">
  ${includeFloor?`<g class="figure-floor" mask="url(#geek-floor-mask)">${horizontal}${perspective}</g>`:''}
  <g class="figure-orbits figure-orbits-back">
   <path d="M304 223C268 217 241 221 259 254"/>
   <path d="M273 265L294 278"/>
   <path d="M474 256C510 271 548 296 556 313C565 333 534 338 492 336"/>
   <path d="M543 343C576 349 590 362 571 375"/>
   <path d="M255 386C225 390 209 402 212 413C219 437 356 444 462 424C488 419 512 412 530 404"/>
  </g>
  <g class="figure-portrait-motion"><g class="figure-person">
   <!-- Shoulder, collarbone and neck follow the supplied silhouette. -->
   <path d="${bust}"/>
   <path d="M369 200C375 241 389 283 410 309"/>
   <path d="M442 276C440 287 442 298 447 306"/>
   <path d="M330 330C339 343 344 369 342 404"/>
   <path d="M491 332C502 348 508 359 512 369"/>
   <path d="M319 303C363 320 421 333 477 337"/>
   <!-- Profile deliberately has a blank face and the reference's inset staircase. -->
   <path d="${face}"/>
   <path d="M356 80C369 69 382 65 395 63M454 69C471 78 481 89 486 102M488 117L488 133"/>
   <path d="M344 126L348 109"/>
   <path d="M365 182L371 187M365 191L368 205"/>
   <path d="M383 193L383 219L389 219L389 225L395 225L395 231L402 231"/>
   <path d="M383 201H388V207H393V213H398V219H402M383 208H393M383 214H398M389 220H402M395 226H402"/>
   <!-- Ear: outer helix, antihelix and lobe. -->
   <path d="M361 153C354 145 347 146 342 154C336 163 341 176 347 186C353 196 359 201 368 197"/>
   <path d="M359 158C355 152 349 152 346 159C342 167 347 177 352 183L355 188C358 192 361 193 365 191"/>
   <path d="M358 158C361 163 361 169 357 172C352 175 357 178 360 179L365 185"/>
   <!-- Floating hand: thumb-index opening, palm and separate finger joints. -->
   <g class="figure-hand-motion"><path d="${hand}"/>
   <path d="M581 365C592 353 605 348 620 343"/>
   <path d="M617 362Q621 358 625 355M621 350Q626 354 632 356"/>
   <path d="M621 371C615 380 604 385 595 388"/>
   <path d="M652 371C647 363 647 358 651 357C658 356 663 373 665 385L665 397"/>
   <path d="M659 386C653 382 650 376 652 371M659 386L654 398"/>
   <path d="M671 380Q673 387 675 394M682 367Q681 378 681 388"/>
   <path d="M667 367Q671 365 674 366M674 376Q678 374 681 375M664 388Q668 386 672 386"/>
   <path d="M625 386Q621 390 618 394M647 389Q644 394 643 399"/>
   <path d="M560 391C588 401 634 406 663 402"/></g>
  </g>
  <g class="figure-head-orbits figure-ribbons">
   <!-- Three distinct ribbon sections, including their thickness and end caps. -->
   <path d="M403 56C430 54 478 56 505 61C497 65 483 65 472 64L472 81C486 83 497 82 505 80L505 61"/>
   <path d="M403 56V66M413 56V64M426 58V63M453 59V72H472"/>
   <path d="M329 81C350 74 400 78 435 86C440 87 444 89 447 91L447 111C411 113 351 109 329 103Z"/>
   <path d="M329 81C353 89 412 91 447 91M441 92V110"/>
   <path d="M344 127C371 134 456 139 491 132M344 127C348 124 351 124 356 124M344 127V146"/>
   <path d="M488 132L493 133"/>
  </g>
  <g class="figure-solid">
   <path d="M351 171C354 172 356 170 356 166C359 168 361 173 358 176L363 183C365 189 360 190 357 185L352 181C348 179 349 174 351 171Z"/>
   <path d="M384 193L401 204V217L396 215V210L391 208V202L384 199Z"/>
   <path d="M435 86L442 88V110H435Z"/>
  </g>
  </g><g class="figure-nodes">
   <rect class="node-blue" x="319" y="-5" width="19" height="20"/>
   <rect x="360" y="28" width="18" height="18"/>
   <rect class="node-lime" x="424" y="45" width="25" height="24"/>
   <rect class="node-cyan" x="360" y="78" width="25" height="25"/>
   <rect class="node-purple" x="468" y="99" width="25" height="24"/>
   <rect class="node-lime" x="399" y="123" width="25" height="24"/>
   <rect class="node-cyan" x="441" y="158" width="18" height="18"/>
   <rect class="figure-square-outline" x="484" y="176" width="23" height="23"/>
   <circle cx="318" cy="291" r="15"/>
  </g>
  ${includeForeground?frontOrbits():''}
  <g class="figure-solid figure-celestial">
   <path d="M256 81C247 95 254 109 270 106C272 105 274 104 276 102C270 118 250 113 248 101C246 93 250 86 256 81Z"/>
   <path d="M588 280C589 287 592 290 599 292C592 293 589 296 588 303C586 296 583 293 576 292C583 290 586 287 588 280Z"/>
  </g>
 </g></svg>`;
}

function frontOrbits(){return `<g class="figure-orbits figure-orbits-front">
   <path d="M244 404C276 430 386 429 461 411M287 421C337 425 402 422 435 415"/>
   <path d="M346 409C414 416 479 403 530 379"/>
   <path d="M559 382C535 386 544 401 584 406C614 411 647 410 670 405M684 397C700 409 675 417 652 416"/>
  </g>`;}

export function geekForeground(){return `<svg class="geek-figure" viewBox="0 0 1000 700" fill="none" aria-hidden="true" focusable="false"><g transform="translate(-150 15) scale(1.45)">${frontOrbits()}</g></svg>`;}

export function geekFloor(){
 const rows=Array.from({length:28},(_,i)=>`<path d="M-200 ${Math.pow(i/27,1.65)*1060}H1800"/>`).join('');
 const rays=Array.from({length:45},(_,i)=>{const end=-2800+i*170;return `<path d="M${800+(end-800)*.12} 0L${end} 1120"/>`;}).join('');
 return `<svg class="creation-floor-art" viewBox="0 0 1600 1000" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false"><g>${rows}${rays}</g></svg>`;
}
