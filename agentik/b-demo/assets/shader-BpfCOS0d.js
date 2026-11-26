var e={welcome:48e3,pulse:86e3,skeleton:48e3,reveal:1e5,ripple:65e3},t=.3,n=44,r=!1,i=`
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,a=`
precision mediump float;
varying vec2 uv;
uniform vec2 origin;
uniform vec3 background, foreground, accent;
uniform vec3 sweepWidths;
uniform float time;
uniform sampler2D glyphs;

float bell(float n, float width) {
  float x = n / width;
  return exp(-x * x);
}

void main() {
  vec3 lime = vec3(.79, .96, .42);
  vec3 mint = vec3(.54, .88, .77);
  float envelope = smoothstep(0., .14, time) * (1. - smoothstep(.67, 1., time));
  float sweep = uv.x + (uv.y - .5) * ${t} - mix(-.25, 1.25, time);
`,o={welcome:`
    float column = floor(uv.x * 21.) / 21.;
    float reveal = clamp((time - .35 * column) / .61, 0., 1.);
    float rest = 1. - reveal;
    float spring = .19 * rest * rest * rest - .08 * sin(reveal * 9.) * exp(-4. * reveal);
    float mask = texture2D(glyphs, vec2(uv.x, 1. - uv.y - spring)).a;
    float lit = bell(sweep + .035 * sin(uv.y * 22.), .13) * envelope;
    vec3 tint = mix(mint, lime, .5 + .5 * sin(uv.y * 4. + time * 5.));
    gl_FragColor = vec4(mix(foreground, tint, lit * .78), mask * smoothstep(0., .38, reveal));
  `,pulse:`
    float expand = time * (2. - time);
    vec2 center = origin + vec2(-.19, .16) * expand;
    vec2 delta = uv - center;
    float radius = mix(.15, .72, expand);
    float glow = 1. - smoothstep(0., radius * radius, dot(delta, delta));
    vec2 edge = min(uv, 1. - uv);
    float feather = smoothstep(0., .22, min(edge.x, edge.y));
    float fade = smoothstep(0., .23, time) * (1. - smoothstep(.34, 1., time));
    vec3 tint = mix(accent, mint, smoothstep(.26, .78, uv.y) * .48);
    gl_FragColor = vec4(tint, glow * feather * fade * .34);
  `,skeleton:`
    float line = bell(sweep, sweepWidths.x) * .13 + bell(sweep + .18, sweepWidths.y) * .05;
    gl_FragColor = vec4(mix(mint, vec3(.93, 1., .83), bell(sweep, sweepWidths.z)), line * envelope);
  `,reveal:`
    float ripple = .02 * sin(uv.y * 36. + uv.x * 10.) + .013 * sin(uv.y * 81.);
    float edge = sweep + ripple;
    float veil = smoothstep(-.11 - sweepWidths.x, .09 + sweepWidths.x, edge) * (1. - smoothstep(.8, 1., time)) * .30;
    float shimmer = bell(edge, sweepWidths.y) * envelope;
    gl_FragColor = vec4(mix(background, lime, shimmer * .7), max(veil, shimmer * .17));
  `,ripple:`
    precision mediump float;
    varying vec2 uv;
    uniform sampler2D artwork;
    uniform vec2 origin, extent;
    uniform vec3 travel;
    uniform float strength, time;
    void main() {
      vec2 point = vec2(uv.x, 1. - uv.y) * extent;
      vec2 delta = point - origin;
      float distance = length(delta);
      // Reach distant artwork promptly, then slow down as the front crosses it.
      float approach = clamp(travel.x * .13, .001, .20);
      float progress = clamp((time - approach) / (1. - approach), 0., 1.);
      float radius = travel.x * smoothstep(0., approach, time)
        + (travel.y - travel.x) * progress * (2. - progress);
      float edge = clamp((distance - radius) / travel.z, -4., 4.);
      float fade = smoothstep(0., .14, time) * (1. - smoothstep(.46, 1., time));
      // A soft slope bends the samples in opposite directions across the crest.
      float bend = strength * fade * 2.33 * edge * exp(-edge * edge);
      vec2 samplePoint = point - delta * bend / max(distance, travel.z * .25);
      gl_FragColor = texture2D(artwork, samplePoint / extent);
    }
  `};function s(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function c(e,t,n,r){let i=document.createElement(`canvas`);i.width=t,i.height=n;let a=i.getContext(`2d`);if(!a)return null;let o=getComputedStyle(e);a.font=`${o.fontWeight} ${parseFloat(o.fontSize)*r}px ${o.fontFamily}`,`letterSpacing`in a&&(a.letterSpacing=`${(parseFloat(o.letterSpacing)||0)*r}px`);let s=e.textContent??``;return a.measureText(s).width>t+2?null:(a.textBaseline=`middle`,a.textAlign=`center`,a.fillStyle=`#fff`,a.fillText(s,t/2,n/2+r),i)}function l(e,t,n,r){if(!n.complete||!n.naturalWidth)return;let i=getComputedStyle(e),a=parseFloat(i.width),o=parseFloat(i.height),s=getComputedStyle(n),c=parseFloat(s.width),l=parseFloat(s.height);if(!a||!o||!c||!l)return;let u=getComputedStyle(e.parentElement??e).transform,d=new DOMMatrixReadOnly(u===`none`?void 0:u),f=t.width/(Math.abs(d.a)*a+Math.abs(d.c)*o),p=d.inverse().transformPoint({x:(r.x-t.left-t.width/2)/f,y:(r.y-t.top-t.height/2)/f,w:0}),m=Math.hypot(Math.max(0,Math.abs(p.x)-c/2),Math.max(0,Math.abs(p.y)-l/2)),h=Math.hypot(Math.abs(p.x)+c/2,Math.abs(p.y)+l/2),g=Math.min(42,Math.max(20,c*.26)),_=Math.max(a,o);return{image:n,width:a,height:o,imageWidth:c,imageHeight:l,zoom:f,origin:[(a/2+p.x)/_,(o/2+p.y)/_],extent:[a/_,o/_],travel:[Math.max(0,m-g*.75)/_,(h+g*.6)/_,g/_],strength:Math.min(9,c*.055)/_}}function u(e,t,n){let r=document.createElement(`canvas`);r.width=t,r.height=n;let i=r.getContext(`2d`);if(!i)return null;let a=e.imageWidth*t/e.width,o=e.imageHeight*n/e.height;return i.drawImage(e.image,(t-a)/2,(n-o)/2,a,o),r}function d(e,t,n){let r=e.getPropertyValue(t).trim(),i=/^#([0-9a-f]{6})$/i.exec(r);return i?[0,2,4].map(e=>parseInt(i[1].slice(e,e+2),16)/255):n}function f(f,p){if(r||typeof WebGLRenderingContext>`u`||document.hidden)return;let m=f.getBoundingClientRect();if(m.width<1||m.height<1)return;let{effect:h,origin:g,image:_}=p,v=h===`ripple`&&g&&_?l(f,m,_,g):void 0;if(h===`ripple`&&!v)return;let y=v?v.width*v.zoom:m.width,b=v?v.height*v.zoom:m.height,x=v?1.65:p.effect===`welcome`?1.5:1.25,S=Math.min(devicePixelRatio||1,x,Math.sqrt(e[h]/(y*b)));f.width=Math.max(1,Math.floor(y*S)),f.height=Math.max(1,Math.floor(b*S));let C=f.getContext(`webgl`,{alpha:!0,antialias:!1,depth:!v,premultipliedAlpha:!!v,failIfMajorPerformanceCaveat:!0});if(!C){r=!0,f.width=1,f.height=1;return}let w=v?u(v,f.width,f.height):p.text?c(p.text,f.width,f.height,f.width/m.width):null;if((h===`welcome`||h===`ripple`)&&!w){f.width=1,f.height=1;return}let T=s(C,C.VERTEX_SHADER,i),E=s(C,C.FRAGMENT_SHADER,h===`ripple`?o.ripple:`${a}${o[h]}}`),D=C.createProgram(),O=C.createBuffer(),k=w?C.createTexture():null,A=0,j=!1,M=matchMedia(`(prefers-reduced-motion: reduce)`);function N(){j||(j=!0,cancelAnimationFrame(A),document.removeEventListener(`visibilitychange`,P),M.removeEventListener(`change`,F),f.removeEventListener(`webglcontextlost`,N),v&&window.removeEventListener(`resize`,N),C&&!C.isContextLost()&&(C.deleteShader(T),C.deleteShader(E),C.deleteProgram(D),C.deleteBuffer(O),k&&C.deleteTexture(k)),delete f.dataset.running,f.width=1,f.height=1)}function P(){document.hidden&&N()}function F(){M.matches&&N()}if(!T||!E||!D||!O||w&&!k||(C.attachShader(D,T),C.attachShader(D,E),C.linkProgram(D),!C.getProgramParameter(D,C.LINK_STATUS))){N();return}C.useProgram(D),C.bindBuffer(C.ARRAY_BUFFER,O),C.bufferData(C.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),C.STATIC_DRAW);let I=C.getAttribLocation(D,`position`);if(C.enableVertexAttribArray(I),C.vertexAttribPointer(I,2,C.FLOAT,!1,0,0),w&&k){C.bindTexture(C.TEXTURE_2D,k),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_S,C.CLAMP_TO_EDGE),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_WRAP_T,C.CLAMP_TO_EDGE),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MIN_FILTER,C.LINEAR),C.texParameteri(C.TEXTURE_2D,C.TEXTURE_MAG_FILTER,C.LINEAR),v&&C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!0);try{C.texImage2D(C.TEXTURE_2D,0,C.RGBA,C.RGBA,C.UNSIGNED_BYTE,w)}catch{N();return}if(v&&C.getError()!==C.NO_ERROR){N();return}}if(C.viewport(0,0,f.width,f.height),v&&(C.uniform2f(C.getUniformLocation(D,`origin`),...v.origin),C.uniform2f(C.getUniformLocation(D,`extent`),...v.extent),C.uniform3f(C.getUniformLocation(D,`travel`),...v.travel),C.uniform1f(C.getUniformLocation(D,`strength`),v.strength),window.addEventListener(`resize`,N)),p.effect===`skeleton`||p.effect===`reveal`){let e=f.clientWidth||m.width,r=f.clientHeight||m.height,i=n*Math.hypot(1/e,t/r),a=e=>Math.hypot(e,Math.SQRT2*i),o=p.effect===`skeleton`?[a(.13),a(.24),a(.065)]:[i,a(.065),0];C.uniform3f(C.getUniformLocation(D,`sweepWidths`),o[0],o[1],o[2])}p.effect===`pulse`&&p.origin?(C.uniform2f(C.getUniformLocation(D,`origin`),(p.origin.x-m.left)/m.width,1-(p.origin.y-m.top)/m.height),C.uniform3f(C.getUniformLocation(D,`accent`),...d(getComputedStyle(f),`--lime`,[.79,.96,.42]))):p.effect===`reveal`?C.uniform3f(C.getUniformLocation(D,`background`),...d(getComputedStyle(f),`--shader-surface`,[.95,.96,.92])):p.effect===`welcome`&&C.uniform3f(C.getUniformLocation(D,`foreground`),...d(getComputedStyle(f),`--ink`,[.14,.16,.13]));let L=C.getUniformLocation(D,`time`),R;document.addEventListener(`visibilitychange`,P),M.addEventListener(`change`,F),f.addEventListener(`webglcontextlost`,N);function z(){if(!C||j)return;let e=R===void 0?0:performance.now()-R;if(e>=p.duration)return N();C.uniform1f(L,e/p.duration),C.drawArrays(C.TRIANGLES,0,3),R===void 0&&(R=performance.now(),h===`welcome`&&(f.dataset.started=`true`),f.dataset.running=`true`),A=requestAnimationFrame(z)}return A=requestAnimationFrame(z),N}export{f as playShader};