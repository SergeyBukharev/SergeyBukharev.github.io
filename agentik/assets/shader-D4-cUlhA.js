var e={welcome:48e3,pulse:86e3,skeleton:48e3,reveal:1e5},t=.3,n=44,r=!1,i=`
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
  `};function s(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function c(e,t,n,r){let i=document.createElement(`canvas`);i.width=t,i.height=n;let a=i.getContext(`2d`);if(!a)return null;let o=getComputedStyle(e);a.font=`${o.fontWeight} ${parseFloat(o.fontSize)*r}px ${o.fontFamily}`,`letterSpacing`in a&&(a.letterSpacing=`${(parseFloat(o.letterSpacing)||0)*r}px`);let s=e.textContent??``;return a.measureText(s).width>t+2?null:(a.textBaseline=`middle`,a.textAlign=`center`,a.fillStyle=`#fff`,a.fillText(s,t/2,n/2+r),i)}function l(e,t,n){let r=e.getPropertyValue(t).trim(),i=/^#([0-9a-f]{6})$/i.exec(r);return i?[0,2,4].map(e=>parseInt(i[1].slice(e,e+2),16)/255):n}function u(u,d){if(r||typeof WebGLRenderingContext>`u`||document.hidden)return;let f=u.getBoundingClientRect();if(f.width<1||f.height<1)return;let p=Math.min(devicePixelRatio||1,d.effect===`welcome`?1.5:1.25,Math.sqrt(e[d.effect]/(f.width*f.height)));u.width=Math.max(1,Math.floor(f.width*p)),u.height=Math.max(1,Math.floor(f.height*p));let m=u.getContext(`webgl`,{alpha:!0,antialias:!1,premultipliedAlpha:!1,failIfMajorPerformanceCaveat:!0});if(!m){r=!0;return}let h=d.text?c(d.text,u.width,u.height,u.width/f.width):null;if(d.effect===`welcome`&&!h){u.width=1,u.height=1;return}let g=s(m,m.VERTEX_SHADER,i),_=s(m,m.FRAGMENT_SHADER,`${a}${o[d.effect]}}`),v=m.createProgram(),y=m.createBuffer(),b=h?m.createTexture():null,x=0,S=!1,C=matchMedia(`(prefers-reduced-motion: reduce)`);function w(){S||(S=!0,cancelAnimationFrame(x),document.removeEventListener(`visibilitychange`,T),C.removeEventListener(`change`,E),u.removeEventListener(`webglcontextlost`,w),m&&!m.isContextLost()&&(m.deleteShader(g),m.deleteShader(_),m.deleteProgram(v),m.deleteBuffer(y),b&&m.deleteTexture(b)),delete u.dataset.running,u.width=1,u.height=1)}function T(){document.hidden&&w()}function E(){C.matches&&w()}if(!g||!_||!v||!y||h&&!b||(m.attachShader(v,g),m.attachShader(v,_),m.linkProgram(v),!m.getProgramParameter(v,m.LINK_STATUS))){w();return}m.useProgram(v),m.bindBuffer(m.ARRAY_BUFFER,y),m.bufferData(m.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),m.STATIC_DRAW);let D=m.getAttribLocation(v,`position`);if(m.enableVertexAttribArray(D),m.vertexAttribPointer(D,2,m.FLOAT,!1,0,0),h&&b&&(m.bindTexture(m.TEXTURE_2D,b),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_S,m.CLAMP_TO_EDGE),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_WRAP_T,m.CLAMP_TO_EDGE),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MIN_FILTER,m.LINEAR),m.texParameteri(m.TEXTURE_2D,m.TEXTURE_MAG_FILTER,m.LINEAR),m.texImage2D(m.TEXTURE_2D,0,m.RGBA,m.RGBA,m.UNSIGNED_BYTE,h)),m.viewport(0,0,u.width,u.height),d.effect===`skeleton`||d.effect===`reveal`){let e=u.clientWidth||f.width,r=u.clientHeight||f.height,i=n*Math.hypot(1/e,t/r),a=e=>Math.hypot(e,Math.SQRT2*i),o=d.effect===`skeleton`?[a(.13),a(.24),a(.065)]:[i,a(.065),0];m.uniform3f(m.getUniformLocation(v,`sweepWidths`),o[0],o[1],o[2])}d.effect===`pulse`&&d.origin?(m.uniform2f(m.getUniformLocation(v,`origin`),(d.origin.x-f.left)/f.width,1-(d.origin.y-f.top)/f.height),m.uniform3f(m.getUniformLocation(v,`accent`),...l(getComputedStyle(u),`--lime`,[.79,.96,.42]))):d.effect===`reveal`?m.uniform3f(m.getUniformLocation(v,`background`),...l(getComputedStyle(u),`--shader-surface`,[.95,.96,.92])):d.effect===`welcome`&&m.uniform3f(m.getUniformLocation(v,`foreground`),...l(getComputedStyle(u),`--ink`,[.14,.16,.13]));let O=m.getUniformLocation(v,`time`),k;document.addEventListener(`visibilitychange`,T),C.addEventListener(`change`,E),u.addEventListener(`webglcontextlost`,w);function A(e){if(m&&!S){if(k===void 0&&(k=e,d.effect===`welcome`&&(u.dataset.started=`true`),u.dataset.running=`true`),e-k>=d.duration)return w();m.uniform1f(O,Math.min(1,(e-k)/d.duration)),m.drawArrays(m.TRIANGLES,0,3),x=requestAnimationFrame(A)}}return x=requestAnimationFrame(A),w}export{u as playShader};