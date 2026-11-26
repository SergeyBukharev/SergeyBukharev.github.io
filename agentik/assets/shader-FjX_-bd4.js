var e={welcome:48e3,pulse:86e3,skeleton:48e3,reveal:1e5},t=!1,n=`
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0.0, 1.0);
}`,r=`
precision mediump float;
varying vec2 uv;
uniform vec2 origin;
uniform vec3 background, foreground, accent;
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
  float sweep = uv.x + (uv.y - .5) * .30 - mix(-.25, 1.25, time);
`,i={welcome:`
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
    float line = bell(sweep, .13) * .30 + bell(sweep + .18, .24) * .12;
    gl_FragColor = vec4(mix(mint, vec3(.93, 1., .83), bell(sweep, .065)), line * envelope);
  `,reveal:`
    float ripple = .02 * sin(uv.y * 36. + uv.x * 10.) + .013 * sin(uv.y * 81.);
    float edge = sweep + ripple;
    float veil = smoothstep(-.11, .09, edge) * (1. - smoothstep(.8, 1., time)) * .91;
    float shimmer = bell(edge, .065) * envelope;
    gl_FragColor = vec4(mix(background, lime, shimmer * .7), max(veil, shimmer * .38));
  `};function a(e,t,n){let r=e.createShader(t);return r?(e.shaderSource(r,n),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(e.deleteShader(r),null)):null}function o(e,t,n,r){let i=document.createElement(`canvas`);i.width=t,i.height=n;let a=i.getContext(`2d`);if(!a)return null;let o=getComputedStyle(e);a.font=`${o.fontWeight} ${parseFloat(o.fontSize)*r}px ${o.fontFamily}`,`letterSpacing`in a&&(a.letterSpacing=`${(parseFloat(o.letterSpacing)||0)*r}px`);let s=e.textContent??``;return a.measureText(s).width>t+2?null:(a.textBaseline=`middle`,a.textAlign=`center`,a.fillStyle=`#fff`,a.fillText(s,t/2,n/2+r),i)}function s(e,t,n){let r=e.getPropertyValue(t).trim(),i=/^#([0-9a-f]{6})$/i.exec(r);return i?[0,2,4].map(e=>parseInt(i[1].slice(e,e+2),16)/255):n}function c(c,l){if(t||typeof WebGLRenderingContext>`u`||document.hidden)return;let u=c.getBoundingClientRect();if(u.width<1||u.height<1)return;let d=Math.min(devicePixelRatio||1,l.effect===`welcome`?1.5:1.25,Math.sqrt(e[l.effect]/(u.width*u.height)));c.width=Math.max(1,Math.floor(u.width*d)),c.height=Math.max(1,Math.floor(u.height*d));let f=c.getContext(`webgl`,{alpha:!0,antialias:!1,premultipliedAlpha:!1,failIfMajorPerformanceCaveat:!0});if(!f){t=!0;return}let p=l.text?o(l.text,c.width,c.height,c.width/u.width):null;if(l.effect===`welcome`&&!p){c.width=1,c.height=1;return}let m=a(f,f.VERTEX_SHADER,n),h=a(f,f.FRAGMENT_SHADER,`${r}${i[l.effect]}}`),g=f.createProgram(),_=f.createBuffer(),v=p?f.createTexture():null,y=0,b=!1,x=matchMedia(`(prefers-reduced-motion: reduce)`);function S(){b||(b=!0,cancelAnimationFrame(y),document.removeEventListener(`visibilitychange`,C),x.removeEventListener(`change`,w),c.removeEventListener(`webglcontextlost`,S),f&&!f.isContextLost()&&(f.deleteShader(m),f.deleteShader(h),f.deleteProgram(g),f.deleteBuffer(_),v&&f.deleteTexture(v)),delete c.dataset.running,c.width=1,c.height=1)}function C(){document.hidden&&S()}function w(){x.matches&&S()}if(!m||!h||!g||!_||p&&!v||(f.attachShader(g,m),f.attachShader(g,h),f.linkProgram(g),!f.getProgramParameter(g,f.LINK_STATUS))){S();return}f.useProgram(g),f.bindBuffer(f.ARRAY_BUFFER,_),f.bufferData(f.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),f.STATIC_DRAW);let T=f.getAttribLocation(g,`position`);f.enableVertexAttribArray(T),f.vertexAttribPointer(T,2,f.FLOAT,!1,0,0),p&&v&&(f.bindTexture(f.TEXTURE_2D,v),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_S,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_WRAP_T,f.CLAMP_TO_EDGE),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MIN_FILTER,f.LINEAR),f.texParameteri(f.TEXTURE_2D,f.TEXTURE_MAG_FILTER,f.LINEAR),f.texImage2D(f.TEXTURE_2D,0,f.RGBA,f.RGBA,f.UNSIGNED_BYTE,p)),f.viewport(0,0,c.width,c.height),l.effect===`pulse`&&l.origin?(f.uniform2f(f.getUniformLocation(g,`origin`),(l.origin.x-u.left)/u.width,1-(l.origin.y-u.top)/u.height),f.uniform3f(f.getUniformLocation(g,`accent`),...s(getComputedStyle(c),`--lime`,[.79,.96,.42]))):l.effect===`reveal`?f.uniform3f(f.getUniformLocation(g,`background`),...s(getComputedStyle(c),`--shader-surface`,[.95,.96,.92])):l.effect===`welcome`&&f.uniform3f(f.getUniformLocation(g,`foreground`),...s(getComputedStyle(c),`--ink`,[.14,.16,.13]));let E=f.getUniformLocation(g,`time`),D;document.addEventListener(`visibilitychange`,C),x.addEventListener(`change`,w),c.addEventListener(`webglcontextlost`,S);function O(e){if(f&&!b){if(D===void 0&&(D=e,l.effect===`welcome`&&(c.dataset.started=`true`),c.dataset.running=`true`),e-D>=l.duration)return S();f.uniform1f(E,Math.min(1,(e-D)/l.duration)),f.drawArrays(f.TRIANGLES,0,3),y=requestAnimationFrame(O)}}return y=requestAnimationFrame(O),S}export{c as playShader};