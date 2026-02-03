(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ui=Symbol("Comlink.proxy"),_a=Symbol("Comlink.endpoint"),ga=Symbol("Comlink.releaseProxy"),Lt=Symbol("Comlink.finalizer"),ht=Symbol("Comlink.thrown"),_i=e=>typeof e=="object"&&e!==null||typeof e=="function",pa={canHandle:e=>_i(e)&&e[ui],serialize(e){const{port1:n,port2:t}=new MessageChannel;return pi(e,n),[t,[t]]},deserialize(e){return e.start(),bi(e)}},wa={canHandle:e=>_i(e)&&ht in e,serialize({value:e}){let n;return e instanceof Error?n={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:n={isError:!1,value:e},[n,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},gi=new Map([["proxy",pa],["throw",wa]]);function ba(e,n){for(const t of e)if(n===t||t==="*"||t instanceof RegExp&&t.test(n))return!0;return!1}function pi(e,n=globalThis,t=["*"]){n.addEventListener("message",function i(a){if(!a||!a.data)return;if(!ba(t,a.origin)){console.warn(`Invalid origin '${a.origin}' for comlink proxy`);return}const{id:r,type:s,path:l}=Object.assign({path:[]},a.data),h=(a.data.argumentList||[]).map(le);let o;try{const c=l.slice(0,-1).reduce((d,f)=>d[f],e),p=l.reduce((d,f)=>d[f],e);switch(s){case"GET":o=p;break;case"SET":c[l.slice(-1)[0]]=le(a.data.value),o=!0;break;case"APPLY":o=p.apply(c,h);break;case"CONSTRUCT":{const d=new p(...h);o=ka(d)}break;case"ENDPOINT":{const{port1:d,port2:f}=new MessageChannel;pi(e,f),o=Ea(d,[d])}break;case"RELEASE":o=void 0;break;default:return}}catch(c){o={value:c,[ht]:0}}Promise.resolve(o).catch(c=>({value:c,[ht]:0})).then(c=>{const[p,d]=pt(c);n.postMessage(Object.assign(Object.assign({},p),{id:r}),d),s==="RELEASE"&&(n.removeEventListener("message",i),wi(n),Lt in e&&typeof e[Lt]=="function"&&e[Lt]())}).catch(c=>{const[p,d]=pt({value:new TypeError("Unserializable return value"),[ht]:0});n.postMessage(Object.assign(Object.assign({},p),{id:r}),d)})}),n.start&&n.start()}function ma(e){return e.constructor.name==="MessagePort"}function wi(e){ma(e)&&e.close()}function bi(e,n){const t=new Map;return e.addEventListener("message",function(a){const{data:r}=a;if(!r||!r.id)return;const s=t.get(r.id);if(s)try{s(r)}finally{t.delete(r.id)}}),Yt(e,t,[],n)}function at(e){if(e)throw new Error("Proxy has been released and is not useable")}function mi(e){return ye(e,new Map,{type:"RELEASE"}).then(()=>{wi(e)})}const _t=new WeakMap,gt="FinalizationRegistry"in globalThis&&new FinalizationRegistry(e=>{const n=(_t.get(e)||0)-1;_t.set(e,n),n===0&&mi(e)});function ya(e,n){const t=(_t.get(n)||0)+1;_t.set(n,t),gt&&gt.register(e,n,e)}function xa(e){gt&&gt.unregister(e)}function Yt(e,n,t=[],i=function(){}){let a=!1;const r=new Proxy(i,{get(s,l){if(at(a),l===ga)return()=>{xa(r),mi(e),n.clear(),a=!0};if(l==="then"){if(t.length===0)return{then:()=>r};const h=ye(e,n,{type:"GET",path:t.map(o=>o.toString())}).then(le);return h.then.bind(h)}return Yt(e,n,[...t,l])},set(s,l,h){at(a);const[o,c]=pt(h);return ye(e,n,{type:"SET",path:[...t,l].map(p=>p.toString()),value:o},c).then(le)},apply(s,l,h){at(a);const o=t[t.length-1];if(o===_a)return ye(e,n,{type:"ENDPOINT"}).then(le);if(o==="bind")return Yt(e,n,t.slice(0,-1));const[c,p]=Sn(h);return ye(e,n,{type:"APPLY",path:t.map(d=>d.toString()),argumentList:c},p).then(le)},construct(s,l){at(a);const[h,o]=Sn(l);return ye(e,n,{type:"CONSTRUCT",path:t.map(c=>c.toString()),argumentList:h},o).then(le)}});return ya(r,e),r}function va(e){return Array.prototype.concat.apply([],e)}function Sn(e){const n=e.map(pt);return[n.map(t=>t[0]),va(n.map(t=>t[1]))]}const yi=new WeakMap;function Ea(e,n){return yi.set(e,n),e}function ka(e){return Object.assign(e,{[ui]:!0})}function pt(e){for(const[n,t]of gi)if(t.canHandle(e)){const[i,a]=t.serialize(e);return[{type:"HANDLER",name:n,value:i},a]}return[{type:"RAW",value:e},yi.get(e)||[]]}function le(e){switch(e.type){case"HANDLER":return gi.get(e.name).deserialize(e.value);case"RAW":return e.value}}function ye(e,n,t,i){return new Promise(a=>{const r=Sa();n.set(r,a),e.start&&e.start(),e.postMessage(Object.assign({id:r},t),i)})}function Sa(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}const Aa=`
<h2>What is JXL Art?</h2>
<p>
  <strong>JXL Art is the practice of using <a href="https://jpeg.org/jpegxl/">JPEG XL</a>'s prediction tree to generate art</strong>.
  If you have questions, join the <code>#jxl-art</code> channel on the <a href="https://discord.gg/DqkQgDRTFu">JPEG XL Discord</a>.
</p>

<p>
  JPEG XL has a modular mode that divides the image into squares called groups (up to 1024x1024 each).
  It uses a prediction tree to predict each pixel's value based on neighboring pixels and gradients.
  Only the <em>difference</em> between the actual image and prediction needs to be encoded.
</p>

<p>
  In JXL art, the error is always zero, so the image consists <em>only</em> of the prediction tree.
  The predictions generate the image. Creating JXL art means writing that prediction tree.
</p>

<h2>Header Options</h2>
<ul>
  <li><code>Width 1024</code> - Image width</li>
  <li><code>Height 1024</code> - Image height</li>
  <li><code>Bitdepth 8</code> - Bit depth (1-31)</li>
  <li><code>RCT 0</code> - Reversible Color Transform (0=RGB, 6=YCoCg, up to 42)</li>
  <li><code>Orientation 0-7</code> - Rotation/flip as per EXIF</li>
  <li><code>GroupShift 3</code> - Group size = 128 << value (0-3)</li>
  <li><code>Alpha</code> - Add alpha channel (c == 3)</li>
  <li><code>XYB</code> - Use XYB color space</li>
  <li><code>CbYCr</code> - Use YCbCr color space</li>
  <li><code>Squeeze</code> - Apply Squeeze transform</li>
  <li><code>FramePos X Y</code> - Frame position offset</li>
  <li><code>NotLast</code> - More layers follow (for multi-layer images)</li>
</ul>

<h2>Decision Nodes</h2>
<pre>if [property] > [value]
  (THEN branch)
  (ELSE branch)</pre>

<h3>Properties for conditions:</h3>
<ul>
  <li><code>c</code> - Channel (0=R, 1=G, 2=B, 3=A)</li>
  <li><code>g</code> - Group number</li>
  <li><code>x</code>, <code>y</code> - Coordinates</li>
  <li><code>N</code>, <code>W</code> - Pixel above / left</li>
  <li><code>|N|</code>, <code>|W|</code> - Absolute values</li>
  <li><code>NW</code>, <code>NE</code> - Diagonal neighbors</li>
  <li><code>W+N-NW</code> - Gradient predictor value</li>
  <li><code>W-NW</code>, <code>NW-N</code>, <code>N-NE</code> - Differences</li>
  <li><code>N-NN</code>, <code>W-WW</code> - Second-order differences</li>
  <li><code>WGH</code> - Weighted predictor error</li>
  <li><code>Prev</code>, <code>PPrev</code> - Previous channel values</li>
  <li><code>PrevErr</code>, <code>PPrevErr</code> - Previous channel errors</li>
</ul>

<h2>Leaf Nodes (Predictors)</h2>
<pre>- [predictor] +/- [offset]</pre>

<h3>Available predictors:</h3>
<ul>
  <li><code>Set</code> - Always 0, so offset becomes the value</li>
  <li><code>W</code>, <code>N</code>, <code>NW</code>, <code>NE</code>, <code>WW</code> - Neighbor values</li>
  <li><code>Select</code> - WebP lossless predictor</li>
  <li><code>Gradient</code> - W+N-NW, clamped</li>
  <li><code>Weighted</code> - Weighted sum of 4 subpredictors</li>
  <li><code>AvgW+N</code>, <code>AvgW+NW</code>, <code>AvgN+NW</code>, <code>AvgN+NE</code> - Averages</li>
  <li><code>AvgAll</code> - Weighted sum of multiple neighbors</li>
</ul>

<h2>Edge Cases</h2>
<ul>
  <li>At x=y=0: W=0. At x=0: W=N. At y=0: N=W</li>
  <li>NW falls back to W at edges</li>
  <li>NE, NN fall back to N; WW falls back to W</li>
</ul>

<h2>Keyboard Shortcuts</h2>
<ul>
  <li><code>Ctrl+Alt+Enter</code> - Run</li>
</ul>
`;function pn(e){return new Promise((n,t)=>{e.oncomplete=e.onsuccess=()=>n(e.result),e.onabort=e.onerror=()=>t(e.error)})}function Na(e,n){let t;const i=()=>{if(t)return t;const a=indexedDB.open(e);return a.onupgradeneeded=()=>a.result.createObjectStore(n),t=pn(a),t.then(r=>{r.onclose=()=>t=void 0},()=>{}),t};return(a,r)=>i().then(s=>r(s.transaction(n,a).objectStore(n)))}let Tt;function xi(){return Tt||(Tt=Na("keyval-store","keyval")),Tt}function Ra(e,n=xi()){return n("readonly",t=>pn(t.get(e)))}function za(e,n,t=xi()){return t("readwrite",i=>(i.put(n,e),pn(i.transaction)))}const vi="jxl-art-code";async function Se(e){await za(vi,e)}async function La(){return Ra(vi)}/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */const Ta=4,An=0,Nn=1,Da=2;function Ae(e){let n=e.length;for(;--n>=0;)e[n]=0}const Ca=0,Ei=1,Ia=2,Wa=3,Ba=258,wn=29,Ge=256,Oe=Ge+1+wn,xe=30,bn=19,ki=2*Oe+1,se=15,Dt=16,Oa=7,mn=256,Si=16,Ai=17,Ni=18,jt=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),ut=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),Ua=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),Ri=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Ma=512,Y=new Array((Oe+2)*2);Ae(Y);const De=new Array(xe*2);Ae(De);const Ue=new Array(Ma);Ae(Ue);const Me=new Array(Ba-Wa+1);Ae(Me);const yn=new Array(wn);Ae(yn);const wt=new Array(xe);Ae(wt);function Ct(e,n,t,i,a){this.static_tree=e,this.extra_bits=n,this.extra_base=t,this.elems=i,this.max_length=a,this.has_stree=e&&e.length}let zi,Li,Ti;function It(e,n){this.dyn_tree=e,this.max_code=0,this.stat_desc=n}const Di=e=>e<256?Ue[e]:Ue[256+(e>>>7)],Pe=(e,n)=>{e.pending_buf[e.pending++]=n&255,e.pending_buf[e.pending++]=n>>>8&255},W=(e,n,t)=>{e.bi_valid>Dt-t?(e.bi_buf|=n<<e.bi_valid&65535,Pe(e,e.bi_buf),e.bi_buf=n>>Dt-e.bi_valid,e.bi_valid+=t-Dt):(e.bi_buf|=n<<e.bi_valid&65535,e.bi_valid+=t)},H=(e,n,t)=>{W(e,t[n*2],t[n*2+1])},Ci=(e,n)=>{let t=0;do t|=e&1,e>>>=1,t<<=1;while(--n>0);return t>>>1},Pa=e=>{e.bi_valid===16?(Pe(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=e.bi_buf&255,e.bi_buf>>=8,e.bi_valid-=8)},Za=(e,n)=>{const t=n.dyn_tree,i=n.max_code,a=n.stat_desc.static_tree,r=n.stat_desc.has_stree,s=n.stat_desc.extra_bits,l=n.stat_desc.extra_base,h=n.stat_desc.max_length;let o,c,p,d,f,_,L=0;for(d=0;d<=se;d++)e.bl_count[d]=0;for(t[e.heap[e.heap_max]*2+1]=0,o=e.heap_max+1;o<ki;o++)c=e.heap[o],d=t[t[c*2+1]*2+1]+1,d>h&&(d=h,L++),t[c*2+1]=d,!(c>i)&&(e.bl_count[d]++,f=0,c>=l&&(f=s[c-l]),_=t[c*2],e.opt_len+=_*(d+f),r&&(e.static_len+=_*(a[c*2+1]+f)));if(L!==0){do{for(d=h-1;e.bl_count[d]===0;)d--;e.bl_count[d]--,e.bl_count[d+1]+=2,e.bl_count[h]--,L-=2}while(L>0);for(d=h;d!==0;d--)for(c=e.bl_count[d];c!==0;)p=e.heap[--o],!(p>i)&&(t[p*2+1]!==d&&(e.opt_len+=(d-t[p*2+1])*t[p*2],t[p*2+1]=d),c--)}},Ii=(e,n,t)=>{const i=new Array(se+1);let a=0,r,s;for(r=1;r<=se;r++)a=a+t[r-1]<<1,i[r]=a;for(s=0;s<=n;s++){let l=e[s*2+1];l!==0&&(e[s*2]=Ci(i[l]++,l))}},$a=()=>{let e,n,t,i,a;const r=new Array(se+1);for(t=0,i=0;i<wn-1;i++)for(yn[i]=t,e=0;e<1<<jt[i];e++)Me[t++]=i;for(Me[t-1]=i,a=0,i=0;i<16;i++)for(wt[i]=a,e=0;e<1<<ut[i];e++)Ue[a++]=i;for(a>>=7;i<xe;i++)for(wt[i]=a<<7,e=0;e<1<<ut[i]-7;e++)Ue[256+a++]=i;for(n=0;n<=se;n++)r[n]=0;for(e=0;e<=143;)Y[e*2+1]=8,e++,r[8]++;for(;e<=255;)Y[e*2+1]=9,e++,r[9]++;for(;e<=279;)Y[e*2+1]=7,e++,r[7]++;for(;e<=287;)Y[e*2+1]=8,e++,r[8]++;for(Ii(Y,Oe+1,r),e=0;e<xe;e++)De[e*2+1]=5,De[e*2]=Ci(e,5);zi=new Ct(Y,jt,Ge+1,Oe,se),Li=new Ct(De,ut,0,xe,se),Ti=new Ct(new Array(0),Ua,0,bn,Oa)},Wi=e=>{let n;for(n=0;n<Oe;n++)e.dyn_ltree[n*2]=0;for(n=0;n<xe;n++)e.dyn_dtree[n*2]=0;for(n=0;n<bn;n++)e.bl_tree[n*2]=0;e.dyn_ltree[mn*2]=1,e.opt_len=e.static_len=0,e.sym_next=e.matches=0},Bi=e=>{e.bi_valid>8?Pe(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0},Rn=(e,n,t,i)=>{const a=n*2,r=t*2;return e[a]<e[r]||e[a]===e[r]&&i[n]<=i[t]},Wt=(e,n,t)=>{const i=e.heap[t];let a=t<<1;for(;a<=e.heap_len&&(a<e.heap_len&&Rn(n,e.heap[a+1],e.heap[a],e.depth)&&a++,!Rn(n,i,e.heap[a],e.depth));)e.heap[t]=e.heap[a],t=a,a<<=1;e.heap[t]=i},zn=(e,n,t)=>{let i,a,r=0,s,l;if(e.sym_next!==0)do i=e.pending_buf[e.sym_buf+r++]&255,i+=(e.pending_buf[e.sym_buf+r++]&255)<<8,a=e.pending_buf[e.sym_buf+r++],i===0?H(e,a,n):(s=Me[a],H(e,s+Ge+1,n),l=jt[s],l!==0&&(a-=yn[s],W(e,a,l)),i--,s=Di(i),H(e,s,t),l=ut[s],l!==0&&(i-=wt[s],W(e,i,l)));while(r<e.sym_next);H(e,mn,n)},Kt=(e,n)=>{const t=n.dyn_tree,i=n.stat_desc.static_tree,a=n.stat_desc.has_stree,r=n.stat_desc.elems;let s,l,h=-1,o;for(e.heap_len=0,e.heap_max=ki,s=0;s<r;s++)t[s*2]!==0?(e.heap[++e.heap_len]=h=s,e.depth[s]=0):t[s*2+1]=0;for(;e.heap_len<2;)o=e.heap[++e.heap_len]=h<2?++h:0,t[o*2]=1,e.depth[o]=0,e.opt_len--,a&&(e.static_len-=i[o*2+1]);for(n.max_code=h,s=e.heap_len>>1;s>=1;s--)Wt(e,t,s);o=r;do s=e.heap[1],e.heap[1]=e.heap[e.heap_len--],Wt(e,t,1),l=e.heap[1],e.heap[--e.heap_max]=s,e.heap[--e.heap_max]=l,t[o*2]=t[s*2]+t[l*2],e.depth[o]=(e.depth[s]>=e.depth[l]?e.depth[s]:e.depth[l])+1,t[s*2+1]=t[l*2+1]=o,e.heap[1]=o++,Wt(e,t,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],Za(e,n),Ii(t,h,e.bl_count)},Ln=(e,n,t)=>{let i,a=-1,r,s=n[0*2+1],l=0,h=7,o=4;for(s===0&&(h=138,o=3),n[(t+1)*2+1]=65535,i=0;i<=t;i++)r=s,s=n[(i+1)*2+1],!(++l<h&&r===s)&&(l<o?e.bl_tree[r*2]+=l:r!==0?(r!==a&&e.bl_tree[r*2]++,e.bl_tree[Si*2]++):l<=10?e.bl_tree[Ai*2]++:e.bl_tree[Ni*2]++,l=0,a=r,s===0?(h=138,o=3):r===s?(h=6,o=3):(h=7,o=4))},Tn=(e,n,t)=>{let i,a=-1,r,s=n[0*2+1],l=0,h=7,o=4;for(s===0&&(h=138,o=3),i=0;i<=t;i++)if(r=s,s=n[(i+1)*2+1],!(++l<h&&r===s)){if(l<o)do H(e,r,e.bl_tree);while(--l!==0);else r!==0?(r!==a&&(H(e,r,e.bl_tree),l--),H(e,Si,e.bl_tree),W(e,l-3,2)):l<=10?(H(e,Ai,e.bl_tree),W(e,l-3,3)):(H(e,Ni,e.bl_tree),W(e,l-11,7));l=0,a=r,s===0?(h=138,o=3):r===s?(h=6,o=3):(h=7,o=4)}},Ha=e=>{let n;for(Ln(e,e.dyn_ltree,e.l_desc.max_code),Ln(e,e.dyn_dtree,e.d_desc.max_code),Kt(e,e.bl_desc),n=bn-1;n>=3&&e.bl_tree[Ri[n]*2+1]===0;n--);return e.opt_len+=3*(n+1)+5+5+4,n},Fa=(e,n,t,i)=>{let a;for(W(e,n-257,5),W(e,t-1,5),W(e,i-4,4),a=0;a<i;a++)W(e,e.bl_tree[Ri[a]*2+1],3);Tn(e,e.dyn_ltree,n-1),Tn(e,e.dyn_dtree,t-1)},Xa=e=>{let n=4093624447,t;for(t=0;t<=31;t++,n>>>=1)if(n&1&&e.dyn_ltree[t*2]!==0)return An;if(e.dyn_ltree[9*2]!==0||e.dyn_ltree[10*2]!==0||e.dyn_ltree[13*2]!==0)return Nn;for(t=32;t<Ge;t++)if(e.dyn_ltree[t*2]!==0)return Nn;return An};let Dn=!1;const Ga=e=>{Dn||($a(),Dn=!0),e.l_desc=new It(e.dyn_ltree,zi),e.d_desc=new It(e.dyn_dtree,Li),e.bl_desc=new It(e.bl_tree,Ti),e.bi_buf=0,e.bi_valid=0,Wi(e)},Oi=(e,n,t,i)=>{W(e,(Ca<<1)+(i?1:0),3),Bi(e),Pe(e,t),Pe(e,~t),t&&e.pending_buf.set(e.window.subarray(n,n+t),e.pending),e.pending+=t},Ya=e=>{W(e,Ei<<1,3),H(e,mn,Y),Pa(e)},ja=(e,n,t,i)=>{let a,r,s=0;e.level>0?(e.strm.data_type===Da&&(e.strm.data_type=Xa(e)),Kt(e,e.l_desc),Kt(e,e.d_desc),s=Ha(e),a=e.opt_len+3+7>>>3,r=e.static_len+3+7>>>3,r<=a&&(a=r)):a=r=t+5,t+4<=a&&n!==-1?Oi(e,n,t,i):e.strategy===Ta||r===a?(W(e,(Ei<<1)+(i?1:0),3),zn(e,Y,De)):(W(e,(Ia<<1)+(i?1:0),3),Fa(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),zn(e,e.dyn_ltree,e.dyn_dtree)),Wi(e),i&&Bi(e)},Ka=(e,n,t)=>(e.pending_buf[e.sym_buf+e.sym_next++]=n,e.pending_buf[e.sym_buf+e.sym_next++]=n>>8,e.pending_buf[e.sym_buf+e.sym_next++]=t,n===0?e.dyn_ltree[t*2]++:(e.matches++,n--,e.dyn_ltree[(Me[t]+Ge+1)*2]++,e.dyn_dtree[Di(n)*2]++),e.sym_next===e.sym_end);var Ja=Ga,Va=Oi,qa=ja,Qa=Ka,er=Ya,tr={_tr_init:Ja,_tr_stored_block:Va,_tr_flush_block:qa,_tr_tally:Qa,_tr_align:er};const nr=(e,n,t,i)=>{let a=e&65535|0,r=e>>>16&65535|0,s=0;for(;t!==0;){s=t>2e3?2e3:t,t-=s;do a=a+n[i++]|0,r=r+a|0;while(--s);a%=65521,r%=65521}return a|r<<16|0};var Ze=nr;const ir=()=>{let e,n=[];for(var t=0;t<256;t++){e=t;for(var i=0;i<8;i++)e=e&1?3988292384^e>>>1:e>>>1;n[t]=e}return n},ar=new Uint32Array(ir()),rr=(e,n,t,i)=>{const a=ar,r=i+t;e^=-1;for(let s=i;s<r;s++)e=e>>>8^a[(e^n[s])&255];return e^-1};var D=rr,he={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Ye={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:or,_tr_stored_block:Jt,_tr_flush_block:lr,_tr_tally:Q,_tr_align:sr}=tr,{Z_NO_FLUSH:ee,Z_PARTIAL_FLUSH:cr,Z_FULL_FLUSH:fr,Z_FINISH:U,Z_BLOCK:Cn,Z_OK:C,Z_STREAM_END:In,Z_STREAM_ERROR:F,Z_DATA_ERROR:dr,Z_BUF_ERROR:Bt,Z_DEFAULT_COMPRESSION:hr,Z_FILTERED:ur,Z_HUFFMAN_ONLY:rt,Z_RLE:_r,Z_FIXED:gr,Z_DEFAULT_STRATEGY:pr,Z_UNKNOWN:wr,Z_DEFLATED:At}=Ye,br=9,mr=15,yr=8,xr=29,vr=256,Vt=vr+1+xr,Er=30,kr=19,Sr=2*Vt+1,Ar=15,v=3,V=258,X=V+v+1,Nr=32,ve=42,xn=57,qt=69,Qt=73,en=91,tn=103,ce=113,Le=666,I=1,Ne=2,ue=3,Re=4,Rr=3,fe=(e,n)=>(e.msg=he[n],n),Wn=e=>e*2-(e>4?9:0),J=e=>{let n=e.length;for(;--n>=0;)e[n]=0},zr=e=>{let n,t,i,a=e.w_size;n=e.hash_size,i=n;do t=e.head[--i],e.head[i]=t>=a?t-a:0;while(--n);n=a,i=n;do t=e.prev[--i],e.prev[i]=t>=a?t-a:0;while(--n)};let Lr=(e,n,t)=>(n<<e.hash_shift^t)&e.hash_mask,te=Lr;const B=e=>{const n=e.state;let t=n.pending;t>e.avail_out&&(t=e.avail_out),t!==0&&(e.output.set(n.pending_buf.subarray(n.pending_out,n.pending_out+t),e.next_out),e.next_out+=t,n.pending_out+=t,e.total_out+=t,e.avail_out-=t,n.pending-=t,n.pending===0&&(n.pending_out=0))},O=(e,n)=>{lr(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,n),e.block_start=e.strstart,B(e.strm)},A=(e,n)=>{e.pending_buf[e.pending++]=n},ze=(e,n)=>{e.pending_buf[e.pending++]=n>>>8&255,e.pending_buf[e.pending++]=n&255},nn=(e,n,t,i)=>{let a=e.avail_in;return a>i&&(a=i),a===0?0:(e.avail_in-=a,n.set(e.input.subarray(e.next_in,e.next_in+a),t),e.state.wrap===1?e.adler=Ze(e.adler,n,a,t):e.state.wrap===2&&(e.adler=D(e.adler,n,a,t)),e.next_in+=a,e.total_in+=a,a)},Ui=(e,n)=>{let t=e.max_chain_length,i=e.strstart,a,r,s=e.prev_length,l=e.nice_match;const h=e.strstart>e.w_size-X?e.strstart-(e.w_size-X):0,o=e.window,c=e.w_mask,p=e.prev,d=e.strstart+V;let f=o[i+s-1],_=o[i+s];e.prev_length>=e.good_match&&(t>>=2),l>e.lookahead&&(l=e.lookahead);do if(a=n,!(o[a+s]!==_||o[a+s-1]!==f||o[a]!==o[i]||o[++a]!==o[i+1])){i+=2,a++;do;while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<d);if(r=V-(d-i),i=d-V,r>s){if(e.match_start=n,s=r,r>=l)break;f=o[i+s-1],_=o[i+s]}}while((n=p[n&c])>h&&--t!==0);return s<=e.lookahead?s:e.lookahead},Ee=e=>{const n=e.w_size;let t,i,a;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=n+(n-X)&&(e.window.set(e.window.subarray(n,n+n-i),0),e.match_start-=n,e.strstart-=n,e.block_start-=n,e.insert>e.strstart&&(e.insert=e.strstart),zr(e),i+=n),e.strm.avail_in===0)break;if(t=nn(e.strm,e.window,e.strstart+e.lookahead,i),e.lookahead+=t,e.lookahead+e.insert>=v)for(a=e.strstart-e.insert,e.ins_h=e.window[a],e.ins_h=te(e,e.ins_h,e.window[a+1]);e.insert&&(e.ins_h=te(e,e.ins_h,e.window[a+v-1]),e.prev[a&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=a,a++,e.insert--,!(e.lookahead+e.insert<v)););}while(e.lookahead<X&&e.strm.avail_in!==0)},Mi=(e,n)=>{let t=e.pending_buf_size-5>e.w_size?e.w_size:e.pending_buf_size-5,i,a,r,s=0,l=e.strm.avail_in;do{if(i=65535,r=e.bi_valid+42>>3,e.strm.avail_out<r||(r=e.strm.avail_out-r,a=e.strstart-e.block_start,i>a+e.strm.avail_in&&(i=a+e.strm.avail_in),i>r&&(i=r),i<t&&(i===0&&n!==U||n===ee||i!==a+e.strm.avail_in)))break;s=n===U&&i===a+e.strm.avail_in?1:0,Jt(e,0,0,s),e.pending_buf[e.pending-4]=i,e.pending_buf[e.pending-3]=i>>8,e.pending_buf[e.pending-2]=~i,e.pending_buf[e.pending-1]=~i>>8,B(e.strm),a&&(a>i&&(a=i),e.strm.output.set(e.window.subarray(e.block_start,e.block_start+a),e.strm.next_out),e.strm.next_out+=a,e.strm.avail_out-=a,e.strm.total_out+=a,e.block_start+=a,i-=a),i&&(nn(e.strm,e.strm.output,e.strm.next_out,i),e.strm.next_out+=i,e.strm.avail_out-=i,e.strm.total_out+=i)}while(s===0);return l-=e.strm.avail_in,l&&(l>=e.w_size?(e.matches=2,e.window.set(e.strm.input.subarray(e.strm.next_in-e.w_size,e.strm.next_in),0),e.strstart=e.w_size,e.insert=e.strstart):(e.window_size-e.strstart<=l&&(e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,e.insert>e.strstart&&(e.insert=e.strstart)),e.window.set(e.strm.input.subarray(e.strm.next_in-l,e.strm.next_in),e.strstart),e.strstart+=l,e.insert+=l>e.w_size-e.insert?e.w_size-e.insert:l),e.block_start=e.strstart),e.high_water<e.strstart&&(e.high_water=e.strstart),s?Re:n!==ee&&n!==U&&e.strm.avail_in===0&&e.strstart===e.block_start?Ne:(r=e.window_size-e.strstart,e.strm.avail_in>r&&e.block_start>=e.w_size&&(e.block_start-=e.w_size,e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,r+=e.w_size,e.insert>e.strstart&&(e.insert=e.strstart)),r>e.strm.avail_in&&(r=e.strm.avail_in),r&&(nn(e.strm,e.window,e.strstart,r),e.strstart+=r,e.insert+=r>e.w_size-e.insert?e.w_size-e.insert:r),e.high_water<e.strstart&&(e.high_water=e.strstart),r=e.bi_valid+42>>3,r=e.pending_buf_size-r>65535?65535:e.pending_buf_size-r,t=r>e.w_size?e.w_size:r,a=e.strstart-e.block_start,(a>=t||(a||n===U)&&n!==ee&&e.strm.avail_in===0&&a<=r)&&(i=a>r?r:a,s=n===U&&e.strm.avail_in===0&&i===a?1:0,Jt(e,e.block_start,i,s),e.block_start+=i,B(e.strm)),s?ue:I)},Ot=(e,n)=>{let t,i;for(;;){if(e.lookahead<X){if(Ee(e),e.lookahead<X&&n===ee)return I;if(e.lookahead===0)break}if(t=0,e.lookahead>=v&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),t!==0&&e.strstart-t<=e.w_size-X&&(e.match_length=Ui(e,t)),e.match_length>=v)if(i=Q(e,e.strstart-e.match_start,e.match_length-v),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=v){e.match_length--;do e.strstart++,e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart;while(--e.match_length!==0);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=te(e,e.ins_h,e.window[e.strstart+1]);else i=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(i&&(O(e,!1),e.strm.avail_out===0))return I}return e.insert=e.strstart<v-1?e.strstart:v-1,n===U?(O(e,!0),e.strm.avail_out===0?ue:Re):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?I:Ne},be=(e,n)=>{let t,i,a;for(;;){if(e.lookahead<X){if(Ee(e),e.lookahead<X&&n===ee)return I;if(e.lookahead===0)break}if(t=0,e.lookahead>=v&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=v-1,t!==0&&e.prev_length<e.max_lazy_match&&e.strstart-t<=e.w_size-X&&(e.match_length=Ui(e,t),e.match_length<=5&&(e.strategy===ur||e.match_length===v&&e.strstart-e.match_start>4096)&&(e.match_length=v-1)),e.prev_length>=v&&e.match_length<=e.prev_length){a=e.strstart+e.lookahead-v,i=Q(e,e.strstart-1-e.prev_match,e.prev_length-v),e.lookahead-=e.prev_length-1,e.prev_length-=2;do++e.strstart<=a&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart);while(--e.prev_length!==0);if(e.match_available=0,e.match_length=v-1,e.strstart++,i&&(O(e,!1),e.strm.avail_out===0))return I}else if(e.match_available){if(i=Q(e,0,e.window[e.strstart-1]),i&&O(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return I}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(i=Q(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<v-1?e.strstart:v-1,n===U?(O(e,!0),e.strm.avail_out===0?ue:Re):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?I:Ne},Tr=(e,n)=>{let t,i,a,r;const s=e.window;for(;;){if(e.lookahead<=V){if(Ee(e),e.lookahead<=V&&n===ee)return I;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=v&&e.strstart>0&&(a=e.strstart-1,i=s[a],i===s[++a]&&i===s[++a]&&i===s[++a])){r=e.strstart+V;do;while(i===s[++a]&&i===s[++a]&&i===s[++a]&&i===s[++a]&&i===s[++a]&&i===s[++a]&&i===s[++a]&&i===s[++a]&&a<r);e.match_length=V-(r-a),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=v?(t=Q(e,1,e.match_length-v),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(t=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),t&&(O(e,!1),e.strm.avail_out===0))return I}return e.insert=0,n===U?(O(e,!0),e.strm.avail_out===0?ue:Re):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?I:Ne},Dr=(e,n)=>{let t;for(;;){if(e.lookahead===0&&(Ee(e),e.lookahead===0)){if(n===ee)return I;break}if(e.match_length=0,t=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,t&&(O(e,!1),e.strm.avail_out===0))return I}return e.insert=0,n===U?(O(e,!0),e.strm.avail_out===0?ue:Re):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?I:Ne};function $(e,n,t,i,a){this.good_length=e,this.max_lazy=n,this.nice_length=t,this.max_chain=i,this.func=a}const Te=[new $(0,0,0,0,Mi),new $(4,4,8,4,Ot),new $(4,5,16,8,Ot),new $(4,6,32,32,Ot),new $(4,4,16,16,be),new $(8,16,32,32,be),new $(8,16,128,128,be),new $(8,32,128,256,be),new $(32,128,258,1024,be),new $(32,258,258,4096,be)],Cr=e=>{e.window_size=2*e.w_size,J(e.head),e.max_lazy_match=Te[e.level].max_lazy,e.good_match=Te[e.level].good_length,e.nice_match=Te[e.level].nice_length,e.max_chain_length=Te[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=v-1,e.match_available=0,e.ins_h=0};function Ir(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=At,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(Sr*2),this.dyn_dtree=new Uint16Array((2*Er+1)*2),this.bl_tree=new Uint16Array((2*kr+1)*2),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(Ar+1),this.heap=new Uint16Array(2*Vt+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*Vt+1),J(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const je=e=>{if(!e)return 1;const n=e.state;return!n||n.strm!==e||n.status!==ve&&n.status!==xn&&n.status!==qt&&n.status!==Qt&&n.status!==en&&n.status!==tn&&n.status!==ce&&n.status!==Le?1:0},Pi=e=>{if(je(e))return fe(e,F);e.total_in=e.total_out=0,e.data_type=wr;const n=e.state;return n.pending=0,n.pending_out=0,n.wrap<0&&(n.wrap=-n.wrap),n.status=n.wrap===2?xn:n.wrap?ve:ce,e.adler=n.wrap===2?0:1,n.last_flush=-2,or(n),C},Zi=e=>{const n=Pi(e);return n===C&&Cr(e.state),n},Wr=(e,n)=>je(e)||e.state.wrap!==2?F:(e.state.gzhead=n,C),$i=(e,n,t,i,a,r)=>{if(!e)return F;let s=1;if(n===hr&&(n=6),i<0?(s=0,i=-i):i>15&&(s=2,i-=16),a<1||a>br||t!==At||i<8||i>15||n<0||n>9||r<0||r>gr||i===8&&s!==1)return fe(e,F);i===8&&(i=9);const l=new Ir;return e.state=l,l.strm=e,l.status=ve,l.wrap=s,l.gzhead=null,l.w_bits=i,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=a+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+v-1)/v),l.window=new Uint8Array(l.w_size*2),l.head=new Uint16Array(l.hash_size),l.prev=new Uint16Array(l.w_size),l.lit_bufsize=1<<a+6,l.pending_buf_size=l.lit_bufsize*4,l.pending_buf=new Uint8Array(l.pending_buf_size),l.sym_buf=l.lit_bufsize,l.sym_end=(l.lit_bufsize-1)*3,l.level=n,l.strategy=r,l.method=t,Zi(e)},Br=(e,n)=>$i(e,n,At,mr,yr,pr),Or=(e,n)=>{if(je(e)||n>Cn||n<0)return e?fe(e,F):F;const t=e.state;if(!e.output||e.avail_in!==0&&!e.input||t.status===Le&&n!==U)return fe(e,e.avail_out===0?Bt:F);const i=t.last_flush;if(t.last_flush=n,t.pending!==0){if(B(e),e.avail_out===0)return t.last_flush=-1,C}else if(e.avail_in===0&&Wn(n)<=Wn(i)&&n!==U)return fe(e,Bt);if(t.status===Le&&e.avail_in!==0)return fe(e,Bt);if(t.status===ve&&t.wrap===0&&(t.status=ce),t.status===ve){let a=At+(t.w_bits-8<<4)<<8,r=-1;if(t.strategy>=rt||t.level<2?r=0:t.level<6?r=1:t.level===6?r=2:r=3,a|=r<<6,t.strstart!==0&&(a|=Nr),a+=31-a%31,ze(t,a),t.strstart!==0&&(ze(t,e.adler>>>16),ze(t,e.adler&65535)),e.adler=1,t.status=ce,B(e),t.pending!==0)return t.last_flush=-1,C}if(t.status===xn){if(e.adler=0,A(t,31),A(t,139),A(t,8),t.gzhead)A(t,(t.gzhead.text?1:0)+(t.gzhead.hcrc?2:0)+(t.gzhead.extra?4:0)+(t.gzhead.name?8:0)+(t.gzhead.comment?16:0)),A(t,t.gzhead.time&255),A(t,t.gzhead.time>>8&255),A(t,t.gzhead.time>>16&255),A(t,t.gzhead.time>>24&255),A(t,t.level===9?2:t.strategy>=rt||t.level<2?4:0),A(t,t.gzhead.os&255),t.gzhead.extra&&t.gzhead.extra.length&&(A(t,t.gzhead.extra.length&255),A(t,t.gzhead.extra.length>>8&255)),t.gzhead.hcrc&&(e.adler=D(e.adler,t.pending_buf,t.pending,0)),t.gzindex=0,t.status=qt;else if(A(t,0),A(t,0),A(t,0),A(t,0),A(t,0),A(t,t.level===9?2:t.strategy>=rt||t.level<2?4:0),A(t,Rr),t.status=ce,B(e),t.pending!==0)return t.last_flush=-1,C}if(t.status===qt){if(t.gzhead.extra){let a=t.pending,r=(t.gzhead.extra.length&65535)-t.gzindex;for(;t.pending+r>t.pending_buf_size;){let l=t.pending_buf_size-t.pending;if(t.pending_buf.set(t.gzhead.extra.subarray(t.gzindex,t.gzindex+l),t.pending),t.pending=t.pending_buf_size,t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex+=l,B(e),t.pending!==0)return t.last_flush=-1,C;a=0,r-=l}let s=new Uint8Array(t.gzhead.extra);t.pending_buf.set(s.subarray(t.gzindex,t.gzindex+r),t.pending),t.pending+=r,t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=Qt}if(t.status===Qt){if(t.gzhead.name){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),B(e),t.pending!==0)return t.last_flush=-1,C;a=0}t.gzindex<t.gzhead.name.length?r=t.gzhead.name.charCodeAt(t.gzindex++)&255:r=0,A(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=en}if(t.status===en){if(t.gzhead.comment){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),B(e),t.pending!==0)return t.last_flush=-1,C;a=0}t.gzindex<t.gzhead.comment.length?r=t.gzhead.comment.charCodeAt(t.gzindex++)&255:r=0,A(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a))}t.status=tn}if(t.status===tn){if(t.gzhead.hcrc){if(t.pending+2>t.pending_buf_size&&(B(e),t.pending!==0))return t.last_flush=-1,C;A(t,e.adler&255),A(t,e.adler>>8&255),e.adler=0}if(t.status=ce,B(e),t.pending!==0)return t.last_flush=-1,C}if(e.avail_in!==0||t.lookahead!==0||n!==ee&&t.status!==Le){let a=t.level===0?Mi(t,n):t.strategy===rt?Dr(t,n):t.strategy===_r?Tr(t,n):Te[t.level].func(t,n);if((a===ue||a===Re)&&(t.status=Le),a===I||a===ue)return e.avail_out===0&&(t.last_flush=-1),C;if(a===Ne&&(n===cr?sr(t):n!==Cn&&(Jt(t,0,0,!1),n===fr&&(J(t.head),t.lookahead===0&&(t.strstart=0,t.block_start=0,t.insert=0))),B(e),e.avail_out===0))return t.last_flush=-1,C}return n!==U?C:t.wrap<=0?In:(t.wrap===2?(A(t,e.adler&255),A(t,e.adler>>8&255),A(t,e.adler>>16&255),A(t,e.adler>>24&255),A(t,e.total_in&255),A(t,e.total_in>>8&255),A(t,e.total_in>>16&255),A(t,e.total_in>>24&255)):(ze(t,e.adler>>>16),ze(t,e.adler&65535)),B(e),t.wrap>0&&(t.wrap=-t.wrap),t.pending!==0?C:In)},Ur=e=>{if(je(e))return F;const n=e.state.status;return e.state=null,n===ce?fe(e,dr):C},Mr=(e,n)=>{let t=n.length;if(je(e))return F;const i=e.state,a=i.wrap;if(a===2||a===1&&i.status!==ve||i.lookahead)return F;if(a===1&&(e.adler=Ze(e.adler,n,t,0)),i.wrap=0,t>=i.w_size){a===0&&(J(i.head),i.strstart=0,i.block_start=0,i.insert=0);let h=new Uint8Array(i.w_size);h.set(n.subarray(t-i.w_size,t),0),n=h,t=i.w_size}const r=e.avail_in,s=e.next_in,l=e.input;for(e.avail_in=t,e.next_in=0,e.input=n,Ee(i);i.lookahead>=v;){let h=i.strstart,o=i.lookahead-(v-1);do i.ins_h=te(i,i.ins_h,i.window[h+v-1]),i.prev[h&i.w_mask]=i.head[i.ins_h],i.head[i.ins_h]=h,h++;while(--o);i.strstart=h,i.lookahead=v-1,Ee(i)}return i.strstart+=i.lookahead,i.block_start=i.strstart,i.insert=i.lookahead,i.lookahead=0,i.match_length=i.prev_length=v-1,i.match_available=0,e.next_in=s,e.input=l,e.avail_in=r,i.wrap=a,C};var Pr=Br,Zr=$i,$r=Zi,Hr=Pi,Fr=Wr,Xr=Or,Gr=Ur,Yr=Mr,jr="pako deflate (from Nodeca project)",Ce={deflateInit:Pr,deflateInit2:Zr,deflateReset:$r,deflateResetKeep:Hr,deflateSetHeader:Fr,deflate:Xr,deflateEnd:Gr,deflateSetDictionary:Yr,deflateInfo:jr};const Kr=(e,n)=>Object.prototype.hasOwnProperty.call(e,n);var Jr=function(e){const n=Array.prototype.slice.call(arguments,1);for(;n.length;){const t=n.shift();if(t){if(typeof t!="object")throw new TypeError(t+"must be non-object");for(const i in t)Kr(t,i)&&(e[i]=t[i])}}return e},Vr=e=>{let n=0;for(let i=0,a=e.length;i<a;i++)n+=e[i].length;const t=new Uint8Array(n);for(let i=0,a=0,r=e.length;i<r;i++){let s=e[i];t.set(s,a),a+=s.length}return t},Nt={assign:Jr,flattenChunks:Vr};let Hi=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{Hi=!1}const $e=new Uint8Array(256);for(let e=0;e<256;e++)$e[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;$e[254]=$e[254]=1;var qr=e=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(e);let n,t,i,a,r,s=e.length,l=0;for(a=0;a<s;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<s&&(i=e.charCodeAt(a+1),(i&64512)===56320&&(t=65536+(t-55296<<10)+(i-56320),a++)),l+=t<128?1:t<2048?2:t<65536?3:4;for(n=new Uint8Array(l),r=0,a=0;r<l;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<s&&(i=e.charCodeAt(a+1),(i&64512)===56320&&(t=65536+(t-55296<<10)+(i-56320),a++)),t<128?n[r++]=t:t<2048?(n[r++]=192|t>>>6,n[r++]=128|t&63):t<65536?(n[r++]=224|t>>>12,n[r++]=128|t>>>6&63,n[r++]=128|t&63):(n[r++]=240|t>>>18,n[r++]=128|t>>>12&63,n[r++]=128|t>>>6&63,n[r++]=128|t&63);return n};const Qr=(e,n)=>{if(n<65534&&e.subarray&&Hi)return String.fromCharCode.apply(null,e.length===n?e:e.subarray(0,n));let t="";for(let i=0;i<n;i++)t+=String.fromCharCode(e[i]);return t};var eo=(e,n)=>{const t=n||e.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(e.subarray(0,n));let i,a;const r=new Array(t*2);for(a=0,i=0;i<t;){let s=e[i++];if(s<128){r[a++]=s;continue}let l=$e[s];if(l>4){r[a++]=65533,i+=l-1;continue}for(s&=l===2?31:l===3?15:7;l>1&&i<t;)s=s<<6|e[i++]&63,l--;if(l>1){r[a++]=65533;continue}s<65536?r[a++]=s:(s-=65536,r[a++]=55296|s>>10&1023,r[a++]=56320|s&1023)}return Qr(r,a)},to=(e,n)=>{n=n||e.length,n>e.length&&(n=e.length);let t=n-1;for(;t>=0&&(e[t]&192)===128;)t--;return t<0||t===0?n:t+$e[e[t]]>n?t:n},He={string2buf:qr,buf2string:eo,utf8border:to};function no(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Fi=no;const Xi=Object.prototype.toString,{Z_NO_FLUSH:io,Z_SYNC_FLUSH:ao,Z_FULL_FLUSH:ro,Z_FINISH:oo,Z_OK:bt,Z_STREAM_END:lo,Z_DEFAULT_COMPRESSION:so,Z_DEFAULT_STRATEGY:co,Z_DEFLATED:fo}=Ye;function Ke(e){this.options=Nt.assign({level:so,method:fo,chunkSize:16384,windowBits:15,memLevel:8,strategy:co},e||{});let n=this.options;n.raw&&n.windowBits>0?n.windowBits=-n.windowBits:n.gzip&&n.windowBits>0&&n.windowBits<16&&(n.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Fi,this.strm.avail_out=0;let t=Ce.deflateInit2(this.strm,n.level,n.method,n.windowBits,n.memLevel,n.strategy);if(t!==bt)throw new Error(he[t]);if(n.header&&Ce.deflateSetHeader(this.strm,n.header),n.dictionary){let i;if(typeof n.dictionary=="string"?i=He.string2buf(n.dictionary):Xi.call(n.dictionary)==="[object ArrayBuffer]"?i=new Uint8Array(n.dictionary):i=n.dictionary,t=Ce.deflateSetDictionary(this.strm,i),t!==bt)throw new Error(he[t]);this._dict_set=!0}}Ke.prototype.push=function(e,n){const t=this.strm,i=this.options.chunkSize;let a,r;if(this.ended)return!1;for(n===~~n?r=n:r=n===!0?oo:io,typeof e=="string"?t.input=He.string2buf(e):Xi.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){if(t.avail_out===0&&(t.output=new Uint8Array(i),t.next_out=0,t.avail_out=i),(r===ao||r===ro)&&t.avail_out<=6){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(a=Ce.deflate(t,r),a===lo)return t.next_out>0&&this.onData(t.output.subarray(0,t.next_out)),a=Ce.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===bt;if(t.avail_out===0){this.onData(t.output);continue}if(r>0&&t.next_out>0){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(t.avail_in===0)break}return!0};Ke.prototype.onData=function(e){this.chunks.push(e)};Ke.prototype.onEnd=function(e){e===bt&&(this.result=Nt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function vn(e,n){const t=new Ke(n);if(t.push(e,!0),t.err)throw t.msg||he[t.err];return t.result}function ho(e,n){return n=n||{},n.raw=!0,vn(e,n)}function uo(e,n){return n=n||{},n.gzip=!0,vn(e,n)}var _o=Ke,go=vn,po=ho,wo=uo,bo={Deflate:_o,deflate:go,deflateRaw:po,gzip:wo};const ot=16209,mo=16191;var yo=function(n,t){let i,a,r,s,l,h,o,c,p,d,f,_,L,E,m,N,y,u,S,T,g,R,k,w;const x=n.state;i=n.next_in,k=n.input,a=i+(n.avail_in-5),r=n.next_out,w=n.output,s=r-(t-n.avail_out),l=r+(n.avail_out-257),h=x.dmax,o=x.wsize,c=x.whave,p=x.wnext,d=x.window,f=x.hold,_=x.bits,L=x.lencode,E=x.distcode,m=(1<<x.lenbits)-1,N=(1<<x.distbits)-1;e:do{_<15&&(f+=k[i++]<<_,_+=8,f+=k[i++]<<_,_+=8),y=L[f&m];t:for(;;){if(u=y>>>24,f>>>=u,_-=u,u=y>>>16&255,u===0)w[r++]=y&65535;else if(u&16){S=y&65535,u&=15,u&&(_<u&&(f+=k[i++]<<_,_+=8),S+=f&(1<<u)-1,f>>>=u,_-=u),_<15&&(f+=k[i++]<<_,_+=8,f+=k[i++]<<_,_+=8),y=E[f&N];n:for(;;){if(u=y>>>24,f>>>=u,_-=u,u=y>>>16&255,u&16){if(T=y&65535,u&=15,_<u&&(f+=k[i++]<<_,_+=8,_<u&&(f+=k[i++]<<_,_+=8)),T+=f&(1<<u)-1,T>h){n.msg="invalid distance too far back",x.mode=ot;break e}if(f>>>=u,_-=u,u=r-s,T>u){if(u=T-u,u>c&&x.sane){n.msg="invalid distance too far back",x.mode=ot;break e}if(g=0,R=d,p===0){if(g+=o-u,u<S){S-=u;do w[r++]=d[g++];while(--u);g=r-T,R=w}}else if(p<u){if(g+=o+p-u,u-=p,u<S){S-=u;do w[r++]=d[g++];while(--u);if(g=0,p<S){u=p,S-=u;do w[r++]=d[g++];while(--u);g=r-T,R=w}}}else if(g+=p-u,u<S){S-=u;do w[r++]=d[g++];while(--u);g=r-T,R=w}for(;S>2;)w[r++]=R[g++],w[r++]=R[g++],w[r++]=R[g++],S-=3;S&&(w[r++]=R[g++],S>1&&(w[r++]=R[g++]))}else{g=r-T;do w[r++]=w[g++],w[r++]=w[g++],w[r++]=w[g++],S-=3;while(S>2);S&&(w[r++]=w[g++],S>1&&(w[r++]=w[g++]))}}else if(u&64){n.msg="invalid distance code",x.mode=ot;break e}else{y=E[(y&65535)+(f&(1<<u)-1)];continue n}break}}else if(u&64)if(u&32){x.mode=mo;break e}else{n.msg="invalid literal/length code",x.mode=ot;break e}else{y=L[(y&65535)+(f&(1<<u)-1)];continue t}break}}while(i<a&&r<l);S=_>>3,i-=S,_-=S<<3,f&=(1<<_)-1,n.next_in=i,n.next_out=r,n.avail_in=i<a?5+(a-i):5-(i-a),n.avail_out=r<l?257+(l-r):257-(r-l),x.hold=f,x.bits=_};const me=15,Bn=852,On=592,Un=0,Ut=1,Mn=2,xo=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),vo=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),Eo=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),ko=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),So=(e,n,t,i,a,r,s,l)=>{const h=l.bits;let o=0,c=0,p=0,d=0,f=0,_=0,L=0,E=0,m=0,N=0,y,u,S,T,g,R=null,k;const w=new Uint16Array(me+1),x=new Uint16Array(me+1);let oe=null,kn,nt,it;for(o=0;o<=me;o++)w[o]=0;for(c=0;c<i;c++)w[n[t+c]]++;for(f=h,d=me;d>=1&&w[d]===0;d--);if(f>d&&(f=d),d===0)return a[r++]=1<<24|64<<16|0,a[r++]=1<<24|64<<16|0,l.bits=1,0;for(p=1;p<d&&w[p]===0;p++);for(f<p&&(f=p),E=1,o=1;o<=me;o++)if(E<<=1,E-=w[o],E<0)return-1;if(E>0&&(e===Un||d!==1))return-1;for(x[1]=0,o=1;o<me;o++)x[o+1]=x[o]+w[o];for(c=0;c<i;c++)n[t+c]!==0&&(s[x[n[t+c]]++]=c);if(e===Un?(R=oe=s,k=20):e===Ut?(R=xo,oe=vo,k=257):(R=Eo,oe=ko,k=0),N=0,c=0,o=p,g=r,_=f,L=0,S=-1,m=1<<f,T=m-1,e===Ut&&m>Bn||e===Mn&&m>On)return 1;for(;;){kn=o-L,s[c]+1<k?(nt=0,it=s[c]):s[c]>=k?(nt=oe[s[c]-k],it=R[s[c]-k]):(nt=96,it=0),y=1<<o-L,u=1<<_,p=u;do u-=y,a[g+(N>>L)+u]=kn<<24|nt<<16|it|0;while(u!==0);for(y=1<<o-1;N&y;)y>>=1;if(y!==0?(N&=y-1,N+=y):N=0,c++,--w[o]===0){if(o===d)break;o=n[t+s[c]]}if(o>f&&(N&T)!==S){for(L===0&&(L=f),g+=p,_=o-L,E=1<<_;_+L<d&&(E-=w[_+L],!(E<=0));)_++,E<<=1;if(m+=1<<_,e===Ut&&m>Bn||e===Mn&&m>On)return 1;S=N&T,a[S]=f<<24|_<<16|g-r|0}}return N!==0&&(a[g+N]=o-L<<24|64<<16|0),l.bits=f,0};var Ie=So;const Ao=0,Gi=1,Yi=2,{Z_FINISH:Pn,Z_BLOCK:No,Z_TREES:lt,Z_OK:_e,Z_STREAM_END:Ro,Z_NEED_DICT:zo,Z_STREAM_ERROR:P,Z_DATA_ERROR:ji,Z_MEM_ERROR:Ki,Z_BUF_ERROR:Lo,Z_DEFLATED:Zn}=Ye,Rt=16180,$n=16181,Hn=16182,Fn=16183,Xn=16184,Gn=16185,Yn=16186,jn=16187,Kn=16188,Jn=16189,mt=16190,G=16191,Mt=16192,Vn=16193,Pt=16194,qn=16195,Qn=16196,ei=16197,ti=16198,st=16199,ct=16200,ni=16201,ii=16202,ai=16203,ri=16204,oi=16205,Zt=16206,li=16207,si=16208,z=16209,Ji=16210,Vi=16211,To=852,Do=592,Co=15,Io=Co,ci=e=>(e>>>24&255)+(e>>>8&65280)+((e&65280)<<8)+((e&255)<<24);function Wo(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const we=e=>{if(!e)return 1;const n=e.state;return!n||n.strm!==e||n.mode<Rt||n.mode>Vi?1:0},qi=e=>{if(we(e))return P;const n=e.state;return e.total_in=e.total_out=n.total=0,e.msg="",n.wrap&&(e.adler=n.wrap&1),n.mode=Rt,n.last=0,n.havedict=0,n.flags=-1,n.dmax=32768,n.head=null,n.hold=0,n.bits=0,n.lencode=n.lendyn=new Int32Array(To),n.distcode=n.distdyn=new Int32Array(Do),n.sane=1,n.back=-1,_e},Qi=e=>{if(we(e))return P;const n=e.state;return n.wsize=0,n.whave=0,n.wnext=0,qi(e)},ea=(e,n)=>{let t;if(we(e))return P;const i=e.state;return n<0?(t=0,n=-n):(t=(n>>4)+5,n<48&&(n&=15)),n&&(n<8||n>15)?P:(i.window!==null&&i.wbits!==n&&(i.window=null),i.wrap=t,i.wbits=n,Qi(e))},ta=(e,n)=>{if(!e)return P;const t=new Wo;e.state=t,t.strm=e,t.window=null,t.mode=Rt;const i=ea(e,n);return i!==_e&&(e.state=null),i},Bo=e=>ta(e,Io);let fi=!0,$t,Ht;const Oo=e=>{if(fi){$t=new Int32Array(512),Ht=new Int32Array(32);let n=0;for(;n<144;)e.lens[n++]=8;for(;n<256;)e.lens[n++]=9;for(;n<280;)e.lens[n++]=7;for(;n<288;)e.lens[n++]=8;for(Ie(Gi,e.lens,0,288,$t,0,e.work,{bits:9}),n=0;n<32;)e.lens[n++]=5;Ie(Yi,e.lens,0,32,Ht,0,e.work,{bits:5}),fi=!1}e.lencode=$t,e.lenbits=9,e.distcode=Ht,e.distbits=5},na=(e,n,t,i)=>{let a;const r=e.state;return r.window===null&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Uint8Array(r.wsize)),i>=r.wsize?(r.window.set(n.subarray(t-r.wsize,t),0),r.wnext=0,r.whave=r.wsize):(a=r.wsize-r.wnext,a>i&&(a=i),r.window.set(n.subarray(t-i,t-i+a),r.wnext),i-=a,i?(r.window.set(n.subarray(t-i,t),0),r.wnext=i,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0},Uo=(e,n)=>{let t,i,a,r,s,l,h,o,c,p,d,f,_,L,E=0,m,N,y,u,S,T,g,R;const k=new Uint8Array(4);let w,x;const oe=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(we(e)||!e.output||!e.input&&e.avail_in!==0)return P;t=e.state,t.mode===G&&(t.mode=Mt),s=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,i=e.input,l=e.avail_in,o=t.hold,c=t.bits,p=l,d=h,R=_e;e:for(;;)switch(t.mode){case Rt:if(t.wrap===0){t.mode=Mt;break}for(;c<16;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(t.wrap&2&&o===35615){t.wbits===0&&(t.wbits=15),t.check=0,k[0]=o&255,k[1]=o>>>8&255,t.check=D(t.check,k,2,0),o=0,c=0,t.mode=$n;break}if(t.head&&(t.head.done=!1),!(t.wrap&1)||(((o&255)<<8)+(o>>8))%31){e.msg="incorrect header check",t.mode=z;break}if((o&15)!==Zn){e.msg="unknown compression method",t.mode=z;break}if(o>>>=4,c-=4,g=(o&15)+8,t.wbits===0&&(t.wbits=g),g>15||g>t.wbits){e.msg="invalid window size",t.mode=z;break}t.dmax=1<<t.wbits,t.flags=0,e.adler=t.check=1,t.mode=o&512?Jn:G,o=0,c=0;break;case $n:for(;c<16;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(t.flags=o,(t.flags&255)!==Zn){e.msg="unknown compression method",t.mode=z;break}if(t.flags&57344){e.msg="unknown header flags set",t.mode=z;break}t.head&&(t.head.text=o>>8&1),t.flags&512&&t.wrap&4&&(k[0]=o&255,k[1]=o>>>8&255,t.check=D(t.check,k,2,0)),o=0,c=0,t.mode=Hn;case Hn:for(;c<32;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.head&&(t.head.time=o),t.flags&512&&t.wrap&4&&(k[0]=o&255,k[1]=o>>>8&255,k[2]=o>>>16&255,k[3]=o>>>24&255,t.check=D(t.check,k,4,0)),o=0,c=0,t.mode=Fn;case Fn:for(;c<16;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.head&&(t.head.xflags=o&255,t.head.os=o>>8),t.flags&512&&t.wrap&4&&(k[0]=o&255,k[1]=o>>>8&255,t.check=D(t.check,k,2,0)),o=0,c=0,t.mode=Xn;case Xn:if(t.flags&1024){for(;c<16;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.length=o,t.head&&(t.head.extra_len=o),t.flags&512&&t.wrap&4&&(k[0]=o&255,k[1]=o>>>8&255,t.check=D(t.check,k,2,0)),o=0,c=0}else t.head&&(t.head.extra=null);t.mode=Gn;case Gn:if(t.flags&1024&&(f=t.length,f>l&&(f=l),f&&(t.head&&(g=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Uint8Array(t.head.extra_len)),t.head.extra.set(i.subarray(r,r+f),g)),t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,t.length-=f),t.length))break e;t.length=0,t.mode=Yn;case Yn:if(t.flags&2048){if(l===0)break e;f=0;do g=i[r+f++],t.head&&g&&t.length<65536&&(t.head.name+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=jn;case jn:if(t.flags&4096){if(l===0)break e;f=0;do g=i[r+f++],t.head&&g&&t.length<65536&&(t.head.comment+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.comment=null);t.mode=Kn;case Kn:if(t.flags&512){for(;c<16;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(t.wrap&4&&o!==(t.check&65535)){e.msg="header crc mismatch",t.mode=z;break}o=0,c=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),e.adler=t.check=0,t.mode=G;break;case Jn:for(;c<32;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}e.adler=t.check=ci(o),o=0,c=0,t.mode=mt;case mt:if(t.havedict===0)return e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,zo;e.adler=t.check=1,t.mode=G;case G:if(n===No||n===lt)break e;case Mt:if(t.last){o>>>=c&7,c-=c&7,t.mode=Zt;break}for(;c<3;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}switch(t.last=o&1,o>>>=1,c-=1,o&3){case 0:t.mode=Vn;break;case 1:if(Oo(t),t.mode=st,n===lt){o>>>=2,c-=2;break e}break;case 2:t.mode=Qn;break;case 3:e.msg="invalid block type",t.mode=z}o>>>=2,c-=2;break;case Vn:for(o>>>=c&7,c-=c&7;c<32;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if((o&65535)!==(o>>>16^65535)){e.msg="invalid stored block lengths",t.mode=z;break}if(t.length=o&65535,o=0,c=0,t.mode=Pt,n===lt)break e;case Pt:t.mode=qn;case qn:if(f=t.length,f){if(f>l&&(f=l),f>h&&(f=h),f===0)break e;a.set(i.subarray(r,r+f),s),l-=f,r+=f,h-=f,s+=f,t.length-=f;break}t.mode=G;break;case Qn:for(;c<14;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(t.nlen=(o&31)+257,o>>>=5,c-=5,t.ndist=(o&31)+1,o>>>=5,c-=5,t.ncode=(o&15)+4,o>>>=4,c-=4,t.nlen>286||t.ndist>30){e.msg="too many length or distance symbols",t.mode=z;break}t.have=0,t.mode=ei;case ei:for(;t.have<t.ncode;){for(;c<3;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.lens[oe[t.have++]]=o&7,o>>>=3,c-=3}for(;t.have<19;)t.lens[oe[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,w={bits:t.lenbits},R=Ie(Ao,t.lens,0,19,t.lencode,0,t.work,w),t.lenbits=w.bits,R){e.msg="invalid code lengths set",t.mode=z;break}t.have=0,t.mode=ti;case ti:for(;t.have<t.nlen+t.ndist;){for(;E=t.lencode[o&(1<<t.lenbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(y<16)o>>>=m,c-=m,t.lens[t.have++]=y;else{if(y===16){for(x=m+2;c<x;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(o>>>=m,c-=m,t.have===0){e.msg="invalid bit length repeat",t.mode=z;break}g=t.lens[t.have-1],f=3+(o&3),o>>>=2,c-=2}else if(y===17){for(x=m+3;c<x;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}o>>>=m,c-=m,g=0,f=3+(o&7),o>>>=3,c-=3}else{for(x=m+7;c<x;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}o>>>=m,c-=m,g=0,f=11+(o&127),o>>>=7,c-=7}if(t.have+f>t.nlen+t.ndist){e.msg="invalid bit length repeat",t.mode=z;break}for(;f--;)t.lens[t.have++]=g}}if(t.mode===z)break;if(t.lens[256]===0){e.msg="invalid code -- missing end-of-block",t.mode=z;break}if(t.lenbits=9,w={bits:t.lenbits},R=Ie(Gi,t.lens,0,t.nlen,t.lencode,0,t.work,w),t.lenbits=w.bits,R){e.msg="invalid literal/lengths set",t.mode=z;break}if(t.distbits=6,t.distcode=t.distdyn,w={bits:t.distbits},R=Ie(Yi,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,w),t.distbits=w.bits,R){e.msg="invalid distances set",t.mode=z;break}if(t.mode=st,n===lt)break e;case st:t.mode=ct;case ct:if(l>=6&&h>=258){e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,yo(e,d),s=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,i=e.input,l=e.avail_in,o=t.hold,c=t.bits,t.mode===G&&(t.back=-1);break}for(t.back=0;E=t.lencode[o&(1<<t.lenbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(N&&!(N&240)){for(u=m,S=N,T=y;E=t.lencode[T+((o&(1<<u+S)-1)>>u)],m=E>>>24,N=E>>>16&255,y=E&65535,!(u+m<=c);){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}o>>>=u,c-=u,t.back+=u}if(o>>>=m,c-=m,t.back+=m,t.length=y,N===0){t.mode=oi;break}if(N&32){t.back=-1,t.mode=G;break}if(N&64){e.msg="invalid literal/length code",t.mode=z;break}t.extra=N&15,t.mode=ni;case ni:if(t.extra){for(x=t.extra;c<x;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.length+=o&(1<<t.extra)-1,o>>>=t.extra,c-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=ii;case ii:for(;E=t.distcode[o&(1<<t.distbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(!(N&240)){for(u=m,S=N,T=y;E=t.distcode[T+((o&(1<<u+S)-1)>>u)],m=E>>>24,N=E>>>16&255,y=E&65535,!(u+m<=c);){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}o>>>=u,c-=u,t.back+=u}if(o>>>=m,c-=m,t.back+=m,N&64){e.msg="invalid distance code",t.mode=z;break}t.offset=y,t.extra=N&15,t.mode=ai;case ai:if(t.extra){for(x=t.extra;c<x;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}t.offset+=o&(1<<t.extra)-1,o>>>=t.extra,c-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){e.msg="invalid distance too far back",t.mode=z;break}t.mode=ri;case ri:if(h===0)break e;if(f=d-h,t.offset>f){if(f=t.offset-f,f>t.whave&&t.sane){e.msg="invalid distance too far back",t.mode=z;break}f>t.wnext?(f-=t.wnext,_=t.wsize-f):_=t.wnext-f,f>t.length&&(f=t.length),L=t.window}else L=a,_=s-t.offset,f=t.length;f>h&&(f=h),h-=f,t.length-=f;do a[s++]=L[_++];while(--f);t.length===0&&(t.mode=ct);break;case oi:if(h===0)break e;a[s++]=t.length,h--,t.mode=ct;break;case Zt:if(t.wrap){for(;c<32;){if(l===0)break e;l--,o|=i[r++]<<c,c+=8}if(d-=h,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?D(t.check,a,d,s-d):Ze(t.check,a,d,s-d)),d=h,t.wrap&4&&(t.flags?o:ci(o))!==t.check){e.msg="incorrect data check",t.mode=z;break}o=0,c=0}t.mode=li;case li:if(t.wrap&&t.flags){for(;c<32;){if(l===0)break e;l--,o+=i[r++]<<c,c+=8}if(t.wrap&4&&o!==(t.total&4294967295)){e.msg="incorrect length check",t.mode=z;break}o=0,c=0}t.mode=si;case si:R=Ro;break e;case z:R=ji;break e;case Ji:return Ki;case Vi:default:return P}return e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,(t.wsize||d!==e.avail_out&&t.mode<z&&(t.mode<Zt||n!==Pn))&&na(e,e.output,e.next_out,d-e.avail_out),p-=e.avail_in,d-=e.avail_out,e.total_in+=p,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?D(t.check,a,d,e.next_out-d):Ze(t.check,a,d,e.next_out-d)),e.data_type=t.bits+(t.last?64:0)+(t.mode===G?128:0)+(t.mode===st||t.mode===Pt?256:0),(p===0&&d===0||n===Pn)&&R===_e&&(R=Lo),R},Mo=e=>{if(we(e))return P;let n=e.state;return n.window&&(n.window=null),e.state=null,_e},Po=(e,n)=>{if(we(e))return P;const t=e.state;return t.wrap&2?(t.head=n,n.done=!1,_e):P},Zo=(e,n)=>{const t=n.length;let i,a,r;return we(e)||(i=e.state,i.wrap!==0&&i.mode!==mt)?P:i.mode===mt&&(a=1,a=Ze(a,n,t,0),a!==i.check)?ji:(r=na(e,n,t,t),r?(i.mode=Ji,Ki):(i.havedict=1,_e))};var $o=Qi,Ho=ea,Fo=qi,Xo=Bo,Go=ta,Yo=Uo,jo=Mo,Ko=Po,Jo=Zo,Vo="pako inflate (from Nodeca project)",j={inflateReset:$o,inflateReset2:Ho,inflateResetKeep:Fo,inflateInit:Xo,inflateInit2:Go,inflate:Yo,inflateEnd:jo,inflateGetHeader:Ko,inflateSetDictionary:Jo,inflateInfo:Vo};function qo(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var Qo=qo;const ia=Object.prototype.toString,{Z_NO_FLUSH:el,Z_FINISH:tl,Z_OK:Fe,Z_STREAM_END:Ft,Z_NEED_DICT:Xt,Z_STREAM_ERROR:nl,Z_DATA_ERROR:di,Z_MEM_ERROR:il}=Ye;function Je(e){this.options=Nt.assign({chunkSize:1024*64,windowBits:15,to:""},e||{});const n=this.options;n.raw&&n.windowBits>=0&&n.windowBits<16&&(n.windowBits=-n.windowBits,n.windowBits===0&&(n.windowBits=-15)),n.windowBits>=0&&n.windowBits<16&&!(e&&e.windowBits)&&(n.windowBits+=32),n.windowBits>15&&n.windowBits<48&&(n.windowBits&15||(n.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Fi,this.strm.avail_out=0;let t=j.inflateInit2(this.strm,n.windowBits);if(t!==Fe)throw new Error(he[t]);if(this.header=new Qo,j.inflateGetHeader(this.strm,this.header),n.dictionary&&(typeof n.dictionary=="string"?n.dictionary=He.string2buf(n.dictionary):ia.call(n.dictionary)==="[object ArrayBuffer]"&&(n.dictionary=new Uint8Array(n.dictionary)),n.raw&&(t=j.inflateSetDictionary(this.strm,n.dictionary),t!==Fe)))throw new Error(he[t])}Je.prototype.push=function(e,n){const t=this.strm,i=this.options.chunkSize,a=this.options.dictionary;let r,s,l;if(this.ended)return!1;for(n===~~n?s=n:s=n===!0?tl:el,ia.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){for(t.avail_out===0&&(t.output=new Uint8Array(i),t.next_out=0,t.avail_out=i),r=j.inflate(t,s),r===Xt&&a&&(r=j.inflateSetDictionary(t,a),r===Fe?r=j.inflate(t,s):r===di&&(r=Xt));t.avail_in>0&&r===Ft&&t.state.wrap>0&&e[t.next_in]!==0;)j.inflateReset(t),r=j.inflate(t,s);switch(r){case nl:case di:case Xt:case il:return this.onEnd(r),this.ended=!0,!1}if(l=t.avail_out,t.next_out&&(t.avail_out===0||r===Ft))if(this.options.to==="string"){let h=He.utf8border(t.output,t.next_out),o=t.next_out-h,c=He.buf2string(t.output,h);t.next_out=o,t.avail_out=i-o,o&&t.output.set(t.output.subarray(h,h+o),0),this.onData(c)}else this.onData(t.output.length===t.next_out?t.output:t.output.subarray(0,t.next_out));if(!(r===Fe&&l===0)){if(r===Ft)return r=j.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,!0;if(t.avail_in===0)break}}return!0};Je.prototype.onData=function(e){this.chunks.push(e)};Je.prototype.onEnd=function(e){e===Fe&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=Nt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function En(e,n){const t=new Je(n);if(t.push(e),t.err)throw t.msg||he[t.err];return t.result}function al(e,n){return n=n||{},n.raw=!0,En(e,n)}var rl=Je,ol=En,ll=al,sl=En,cl={Inflate:rl,inflate:ol,inflateRaw:ll,ungzip:sl};const{Deflate:fl,deflate:dl,deflateRaw:hl,gzip:ul}=bo,{Inflate:_l,inflate:gl,inflateRaw:pl,ungzip:wl}=cl;var bl=fl,ml=dl,yl=hl,xl=ul,vl=_l,El=gl,kl=pl,Sl=wl,Al=Ye,aa={Deflate:bl,deflate:ml,deflateRaw:yl,gzip:xl,Inflate:vl,inflate:El,inflateRaw:kl,ungzip:Sl,constants:Al};function Nl(e){const n=aa.deflate(new TextEncoder().encode(e));return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Rl(e){const n=e.replace(/-/g,"+").replace(/_/g,"/"),t=atob(n),i=new Uint8Array(t.length);for(let r=0;r<t.length;r++)i[r]=t.charCodeAt(r);const a=aa.inflate(i);return new TextDecoder().decode(a)}function zl(){const e=new URLSearchParams(window.location.search),n=e.get("zcode");if(n)try{return Rl(n)}catch(i){console.error("Failed to decode zcode:",i)}const t=e.get("code");if(t)try{const i=t.replace(/-/g,"+").replace(/_/g,"/");return atob(i)}catch(i){console.error("Failed to decode code:",i)}return null}async function Ll(e){const n=new URL(window.location.href);n.searchParams.delete("code"),n.searchParams.set("zcode",Nl(e)),await navigator.clipboard.writeText(n.toString())}const an=[{name:"Gradient Waves",description:"Colorful gradient waves pattern",code:`Bitdepth 8
Width 512
Height 512

if c > 1
  if y > 256
    - Set 200
    if x > 256
      - Set 100
      - Set 50
  if x > 256
    - Gradient +50
    - N -20
if y > 256
  - W +30
  - Set 180`},{name:"Surma's Original",description:"The original JXL Art example by Surma",code:`Bitdepth 8
Orientation 7
RCT 6

if y > 150
  if c > 0
    - N 0
    if x > 500
      if WGH > 5
        - AvgN+NW +2
        - AvgN+NE -2
      if x > 470
        - AvgW+NW -2
        if WGH > 0
          - AvgN+NW +1
          - AvgN+NE -1
  if y > 136
    if c > 0
      if c > 1
        if x > 500
          - Set -20
          - Set 40
        if x > 501
          - W -1
          - Set 150
      if x > 500
        - N +5
        - N -15
    if W > -50
      - Weighted -1
      - Set 320`},{name:"Rainbow Diagonal",description:"Diagonal rainbow stripes",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  - Set 128
if c > 0
  if x > 256
    - Gradient +1
    - N -1
  - W +2
- Gradient +1`},{name:"Plasma Effect",description:"Plasma-like color pattern",code:`Bitdepth 8
Width 256
Height 256

if c > 1
  if x > 128
    - W +3
    - N -2
  if y > 128
    - AvgW+N +5
    - Set 200
if c > 0
  if y > 128
    - Gradient +2
    - W -1
  - N +3
if x > 128
  - AvgN+NW +1
  - Set 100`},{name:"Checkerboard",description:"Simple checkerboard pattern",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 255
  if y > 255
    - Set 255
    - Set 0
  if y > 255
    - Set 0
    - Set 255
if y > 255
  - Set 255
  - Set 0`},{name:"Noise Pattern",description:"Pseudo-random noise using weighted predictor",code:`Bitdepth 8
Width 256
Height 256

if c > 0
  - W 0
if WGH > 0
  if N > 128
    - Weighted +50
    - Weighted -30
  if W > 128
    - Weighted -40
    - Weighted +60
- Set 128`},{name:"Concentric",description:"Concentric pattern using coordinates",code:`Bitdepth 8
Width 512
Height 512

if c > 1
  if x > 256
    if y > 256
      - Set 50
      - Set 150
    if y > 256
      - Set 200
      - Set 100
  - W +30
if c > 0
  - W -20
if x > 256
  - Gradient +1
  - N -1`},{name:"Minimalist",description:"Smallest interesting JXL art",code:`Bitdepth 8
Width 64
Height 64

if c > 0
  - W 0
- Gradient +1`},{name:"YCoCg Experiment",description:"Using YCoCg color transform",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  - Set 0
if c > 0
  if x > 256
    - W +1
    - N -1
  - Set 128
if y > 256
  if x > 256
    - Gradient +2
    - Set 200
  - W +1`},{name:"Sierpinski-ish",description:"Fractal-like pattern",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 256
  if y > 256
    if W > 128
      - Set 0
      - Set 255
    if N > 128
      - Set 255
      - Set 0
  if W > 128
    - Set 255
    - Set 0
if y > 256
  if N > 128
    - Set 255
    - Set 0
  - Set 128`},{name:"Mandelbrot-ish",description:"Fractal-inspired pattern with color bands",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  if x > 256
    if y > 128
      - Set 50
      - Set 200
    - Set 150
if c > 0
  if y > 256
    if x > 128
      - Gradient +3
      - N -2
    - W +1
  - Set 100
if x > 384
  if y > 384
    - Weighted +20
    - Set 180
  - Gradient -1`},{name:"Vaporwave",description:"Retro aesthetic gradient",code:`Bitdepth 8
Width 512
Height 256
RCT 6

if c > 1
  if y > 128
    - Set 200
    - Set 80
  - Gradient +2
if c > 0
  if y > 200
    - W +5
    - N -3
  - Set 150
if y > 128
  - AvgW+N +1
  - Set 255`},{name:"Grid Pattern",description:"Clean grid lines",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 63
  if x > 127
    if x > 191
      if x > 255
        if x > 319
          if x > 383
            if x > 447
              - Set 40
              - Set 255
            - Set 255
          - Set 40
        - Set 255
      - Set 40
    - Set 255
  - Set 40
if y > 63
  if y > 127
    if y > 191
      if y > 255
        if y > 319
          if y > 383
            if y > 447
              - N 0
              - Set 255
            - Set 255
          - N 0
        - Set 255
      - N 0
    - Set 255
  - N 0
- Set 40`},{name:"Fire",description:"Flame-like colors",code:`Bitdepth 8
Width 256
Height 256
RCT 6

if c > 1
  if y > 128
    - Set 0
    - Set 50
  - Weighted +10
if c > 0
  if y > 200
    - Set 200
    - N -5
  if y > 100
    - Gradient +3
    - Set 255
  - Set 128
if y > 180
  - W +20
  - Set 255`},{name:"Ocean Waves",description:"Blue wave pattern",code:`Bitdepth 8
Width 512
Height 256
RCT 6

if c > 1
  - Set 180
if c > 0
  if y > 128
    - Gradient +1
    - N -2
  - Set 80
if y > 200
  if x > 256
    - W +3
    - AvgW+N +1
  - Set 50`},{name:"XYB + Gaborish",description:"XYB with Gaborish/EPF and 16-bit buffers",code:`Bitdepth 8
Width 256
Height 256
Gaborish
16BitBuffers
XYB
XYBFactors 4096 512 256
EPF 2

if c > 1
  - Set 128
if c > 0
  if x > 128
    - Gradient +2
    - N -1
  - Set 200
if y > 128
  - W +1
  - Set 100`}],yt=["Bitdepth","Width","Height","RCT","Orientation","Alpha","NotLast","FramePos","XYB","XYBFactors","Gaborish","EPF","16BitBuffers","Squeeze","CbYCr"],xt=["c","g","x","y","N","W","|N|","|W|","NW","NE","NN","WW","W-WW-NW+NWW","W+N-NW","W-NW","NW-N","N-NE","N-NN","W-WW","WGH","Prev","PPrev","PrevErr","PPrevErr","PrevAbs","PPrevAbs","PrevAbsErr","PPrevAbsErr"],Xe=["Set","W","N","NW","NE","WW","Select","Gradient","Weighted","AvgW+N","AvgW+NW","AvgN+NW","AvgN+NE","AvgAll"],rn=["if"];function Tl(e,n=0){const t=[];let i=0;for(;i<e.length;){const a=n+i;if(/\s/.test(e[i])){i++;continue}if(e[i]==="#"){t.push({type:"comment",value:e.slice(i),start:a,end:n+e.length});break}if(e[i]==="-"&&(i===0||/\s/.test(e[i-1]))){const s=e.slice(i+1).match(/^\s*(\w+)/);if(s&&Xe.includes(s[1])){t.push({type:"leaf",value:"-",start:a,end:a+1}),i++;continue}}if(e[i]===">"){t.push({type:"operator",value:">",start:a,end:a+1}),i++;continue}if(e.slice(i).startsWith("16BitBuffers")){t.push({type:"header",value:"16BitBuffers",start:a,end:a+12}),i+=12;continue}if(/[+\-]?\d/.test(e.slice(i,i+2))||/\d/.test(e[i])){const s=e.slice(i).match(/^[+\-]?\d+/);if(s){t.push({type:"number",value:s[0],start:a,end:a+s[0].length}),i+=s[0].length;continue}}const r=e.slice(i).match(/^[\w+\-|]+/);if(r){const s=r[0];let l="default";s==="if"?l="keyword":yt.includes(s)?l="header":Xe.includes(s)?l="predictor":xt.includes(s)?l="property":/^[+\-]\d+$/.test(s)?l="number":l="error",t.push({type:l,value:s,start:a,end:a+s.length}),i+=s.length;continue}t.push({type:"error",value:e[i],start:a,end:a+1}),i++}return t}function Dl(e,n){const t=e.slice(0,n),i=t.trim().split(/\s+/),a=i[i.length-1]||"",r=i[i.length-2]||"";if(r==="if")return xt.filter(l=>l.toLowerCase().startsWith(a.toLowerCase()));if(r==="-"||t.trimEnd().endsWith("-")){const l=r==="-"?a:"";return Xe.filter(h=>h.toLowerCase().startsWith(l.toLowerCase()))}return r===">"?[]:t.trim()===""||t.trim()===a?[...rn,...yt,"-"].filter(h=>h.toLowerCase().startsWith(a.toLowerCase())):[...rn,...yt,...xt,...Xe].filter(l=>l.toLowerCase().startsWith(a.toLowerCase()))}function Cl(e){const n=Tl(e,0);if(n.length===0)return ft(e);let t="",i=0;for(const a of n)a.start>i&&(t+=ft(e.slice(i,a.start))),t+=`<span class="tok-${a.type}">${ft(a.value)}</span>`,i=a.end;return i<e.length&&(t+=ft(e.slice(i))),t}function ft(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Il(e){return e.split(`
`).map(Cl).join(`
`)}const b=document.getElementById("code"),on=document.getElementById("run"),Wl=document.getElementById("share"),Bl=document.getElementById("prettier"),Ol=document.getElementById("help"),Ul=document.getElementById("close-help"),vt=document.getElementById("help-dialog"),Ml=document.getElementById("help-content"),We=document.getElementById("preview"),ln=document.getElementById("download-jxl"),sn=document.getElementById("download-png"),dt=document.getElementById("size-info"),hi=document.getElementById("log"),K=document.getElementById("image-container"),Pl=document.getElementById("image-wrapper"),Zl=document.getElementById("zoom-level"),$l=document.getElementById("zoom-in"),Hl=document.getElementById("zoom-out"),Fl=document.getElementById("zoom-fit"),Xl=document.getElementById("zoom-reset"),Gl=document.querySelector(".placeholder"),Yl=document.getElementById("jxl-support"),ra=document.getElementById("line-numbers"),cn=document.getElementById("code-highlight"),de=document.getElementById("autocomplete"),jl=document.getElementById("presets-btn"),ne=document.getElementById("presets-dialog"),fn=document.getElementById("presets-grid"),Kl=document.getElementById("close-presets"),oa=document.getElementById("main"),la=document.getElementById("resizer"),Et=document.querySelector(".editor-panel"),kt=document.querySelector(".preview-panel");let Ve,St=null,Be=null,Gt=!1,ke=!1;async function Jl(){return new Promise(e=>{const n=new Image,t=setTimeout(()=>e(!1),1e3);n.onload=()=>{clearTimeout(t),e(n.width===1&&n.height===1)},n.onerror=()=>{clearTimeout(t),e(!1)},n.src="data:image/jxl;base64,/woAkAEAE4gCAMAAtZ8gAAAVKqOMG7yc6/nyQ4fFtI3rDG21bWEJY7O9MEhIOIONiwTfnKWRaQYkopIE"})}let Z=1,ae=0,re=0,ge=!1,sa=0,ca=0;function Vl(){const e=new Worker(new URL("/jxl-art/assets/jxl-worker-CDsShlMY.js",import.meta.url),{type:"module"});return bi(e)}function M(e,n="info"){hi.textContent=e,hi.className=n}async function qe(){if(!Gt){Gt=!0,document.body.classList.add("loading"),on.disabled=!0,M("Compiling...","info");try{const e=b.value,n=await Ve.render(e);St=n.jxlData;const t=/^\s*16BitBuffers\b/im.test(e);let i;ke&&!t?(i=new Blob([new Uint8Array(n.jxlData)],{type:"image/jxl"}),Be=null):(Be=new Blob([new Uint8Array(n.pngData)],{type:"image/png"}),i=Be);const a=URL.createObjectURL(i);We.src=a,Gl.classList.add("hidden"),We.onload=()=>ua(),ln.disabled=!1,sn.disabled=!1,dt&&(dt.textContent=`JXL: ${n.jxlData.byteLength} bytes${ke?" (native)":""}`),M(`Success! JXL size: ${n.jxlData.byteLength} bytes`,"success"),await Se(e)}catch(e){const n=e instanceof Error?e.message:"Unknown error";M(n,"error"),console.error(e),ln.disabled=!0,sn.disabled=!0,dt&&(dt.textContent="")}finally{Gt=!1,document.body.classList.remove("loading"),on.disabled=!1}}}function dn(e,n){const t=URL.createObjectURL(e),i=document.createElement("a");i.href=t,i.download=n,i.click(),URL.revokeObjectURL(t)}on.addEventListener("click",qe);Wl.addEventListener("click",da);Bl.addEventListener("click",ha);Ol.addEventListener("click",()=>{Ml.innerHTML=Aa,vt.showModal()});Ul.addEventListener("click",()=>{vt.close()});ln.addEventListener("click",()=>{St&&dn(new Blob([new Uint8Array(St)],{type:"image/jxl"}),"art.jxl")});sn.addEventListener("click",async()=>{if(Be)dn(Be,"art.png");else if(St&&ke){M("Converting to PNG...","info");try{const e=await Ve.render(b.value),n=new Blob([new Uint8Array(e.pngData)],{type:"image/png"});dn(n,"art.png"),M("PNG downloaded","success")}catch{M("Failed to convert to PNG","error")}}});b.addEventListener("keydown",e=>{e.ctrlKey&&e.altKey&&e.code==="Enter"&&(e.preventDefault(),qe())});function Qe(){const e=b.value.split(`
`).length,n=Array.from({length:e},(t,i)=>`<span>${i+1}</span>`).join("");ra.innerHTML=n,cn.innerHTML=Il(b.value)+`
`}b.addEventListener("scroll",()=>{ra.scrollTop=b.scrollTop,cn.scrollTop=b.scrollTop,cn.scrollLeft=b.scrollLeft});let ie=[],q=0;function ql(e){if(e.length===0){et();return}ie=e,q=0;const n=b.selectionStart,i=b.value.substring(0,n).split(`
`),a=i.length-1,r=i[i.length-1].length,s=19.5,l=7.8,h=(a+1)*s+16,o=r*l+16;de.style.top=`${Math.min(h,b.offsetHeight-100)}px`,de.style.left=`${Math.min(o,b.offsetWidth-160)}px`,hn(),de.classList.remove("hidden")}function et(){de.classList.add("hidden"),ie=[]}function hn(){de.innerHTML=ie.map((e,n)=>{let t="",i="";return rn.includes(e)?(t="type-keyword",i="keyword"):yt.includes(e)?(t="type-header",i="header"):xt.includes(e)?(t="type-property",i="prop"):Xe.includes(e)&&(t="type-predictor",i="pred"),`<div class="autocomplete-item${n===q?" selected":""}" data-index="${n}">
      <span>${e}</span>
      ${i?`<span class="type ${t}">${i}</span>`:""}
    </div>`}).join("")}function fa(){if(ie.length===0)return;const e=ie[q],n=b.selectionStart,t=b.value.substring(0,n),i=b.value.substring(n),a=t.match(/[\w\-|]*$/),r=a?n-a[0].length:n;b.value=b.value.substring(0,r)+e+i,b.selectionStart=b.selectionEnd=r+e.length,et(),Qe(),Se(b.value)}b.addEventListener("keydown",e=>{if(!de.classList.contains("hidden")){if(e.key==="ArrowDown"){e.preventDefault(),q=(q+1)%ie.length,hn();return}if(e.key==="ArrowUp"){e.preventDefault(),q=(q-1+ie.length)%ie.length,hn();return}if(e.key==="Enter"||e.key==="Tab"){e.preventDefault(),fa();return}if(e.key==="Escape"){e.preventDefault(),et();return}}if(e.key==="Tab"){e.preventDefault();const n=b.selectionStart,t=b.selectionEnd;b.value=b.value.substring(0,n)+"  "+b.value.substring(t),b.selectionStart=b.selectionEnd=n+2,Qe(),Se(b.value)}});b.addEventListener("input",()=>{Se(b.value),Qe();const e=b.selectionStart,t=b.value.substring(0,e).split(`
`).pop()||"",i=t.match(/[\w\-|]+$/);if(i&&i[0].length>=1){const a=Dl(t,t.length);ql(a.slice(0,8))}else et()});de.addEventListener("click",e=>{const n=e.target.closest(".autocomplete-item");n&&(q=parseInt(n.getAttribute("data-index")||"0"),fa())});b.addEventListener("blur",()=>{setTimeout(et,150)});document.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&(e.preventDefault(),qe()),(e.ctrlKey||e.metaKey)&&e.key==="s"&&(e.preventDefault(),da()),(e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="f"&&(e.preventDefault(),ha()),e.key==="Escape"&&(vt.open&&vt.close(),ne.open&&ne.close())});async function da(){try{await Ll(b.value),M("Share URL copied to clipboard!","success")}catch{M("Failed to copy URL","error")}}async function ha(){try{const e=await Ve.prettier(b.value);b.value=e,Se(e),M("Code formatted","success")}catch{M("Failed to format code","error")}}jl.addEventListener("click",()=>{ne.showModal()});Kl.addEventListener("click",()=>{ne.close()});ne.addEventListener("click",e=>{e.target===ne&&ne.close()});fn.addEventListener("click",e=>{const n=e.target.closest(".preset-card");if(!n)return;const t=n.getAttribute("data-preset"),i=an.find(a=>a.name===t);i&&(b.value=i.code,Qe(),Se(i.code),ne.close(),M(`Loaded preset: ${i.name}`,"info"),qe())});function tt(){Pl.style.transform=`translate(${ae}px, ${re}px) scale(${Z})`,Zl.textContent=`${Math.round(Z*100)}%`}function zt(e,n,t){const i=Z;if(Z=Math.max(.1,Math.min(10,e)),n!==void 0&&t!==void 0){const a=K.getBoundingClientRect(),r=n-a.left-a.width/2,s=t-a.top-a.height/2,l=Z/i;ae=r-(r-ae)*l,re=s-(s-re)*l}tt()}function ua(){if(!We.naturalWidth)return;const e=K.getBoundingClientRect(),n=(e.width-20)/We.naturalWidth,t=(e.height-60)/We.naturalHeight;Z=Math.min(n,t,1),ae=0,re=0,tt()}$l.addEventListener("click",()=>zt(Z*1.25));Hl.addEventListener("click",()=>zt(Z/1.25));Xl.addEventListener("click",()=>{Z=1,ae=0,re=0,tt()});Fl.addEventListener("click",ua);K.addEventListener("wheel",e=>{e.preventDefault();const n=e.deltaY>0?.9:1.1;zt(Z*n,e.clientX,e.clientY)},{passive:!1});K.addEventListener("mousedown",e=>{e.button===0&&(ge=!0,sa=e.clientX-ae,ca=e.clientY-re,K.style.cursor="grabbing")});window.addEventListener("mousemove",e=>{ge&&(ae=e.clientX-sa,re=e.clientY-ca,tt())});window.addEventListener("mouseup",()=>{ge=!1,K.style.cursor=""});let un=0,_n=0,gn=0;K.addEventListener("touchstart",e=>{e.touches.length===1?(ge=!0,_n=e.touches[0].clientX,gn=e.touches[0].clientY):e.touches.length===2&&(ge=!1,un=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))},{passive:!0});K.addEventListener("touchmove",e=>{if(e.touches.length===1&&ge){const n=e.touches[0].clientX-_n,t=e.touches[0].clientY-gn;ae+=n,re+=t,_n=e.touches[0].clientX,gn=e.touches[0].clientY,tt()}else if(e.touches.length===2){const n=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),t=(e.touches[0].clientX+e.touches[1].clientX)/2,i=(e.touches[0].clientY+e.touches[1].clientY)/2;zt(Z*(n/un),t,i),un=n}},{passive:!0});K.addEventListener("touchend",()=>{ge=!1});let pe=!1;la.addEventListener("mousedown",e=>{pe=!0,document.body.style.cursor="col-resize",document.body.style.userSelect="none",e.preventDefault()});window.addEventListener("mousemove",e=>{if(!pe)return;const n=oa.getBoundingClientRect();if(window.innerWidth<=900){const i=e.clientY-n.top,a=n.height,r=i/a*100,s=Math.max(15,Math.min(85,r));Et.style.flex=`0 0 ${s}%`,kt.style.flex=`0 0 ${100-s-2}%`}else{const i=e.clientX-n.left,a=n.width,r=i/a*100,s=Math.max(15,Math.min(85,r));Et.style.flex=`0 0 ${s}%`,kt.style.flex=`0 0 ${100-s-2}%`}});window.addEventListener("mouseup",()=>{pe&&(pe=!1,document.body.style.cursor="",document.body.style.userSelect="")});la.addEventListener("touchstart",e=>{pe=!0,e.preventDefault()});window.addEventListener("touchmove",e=>{if(!pe||e.touches.length!==1)return;const n=e.touches[0],t=oa.getBoundingClientRect();if(window.innerWidth<=900){const a=n.clientY-t.top,r=t.height,s=a/r*100,l=Math.max(15,Math.min(85,s));Et.style.flex=`0 0 ${l}%`,kt.style.flex=`0 0 ${100-l-2}%`}else{const a=n.clientX-t.left,r=t.width,s=a/r*100,l=Math.max(15,Math.min(85,s));Et.style.flex=`0 0 ${l}%`,kt.style.flex=`0 0 ${100-l-2}%`}});window.addEventListener("touchend",()=>{pe=!1});async function Ql(e){try{const n=await Ve.render(e),t=ke?new Blob([new Uint8Array(n.jxlData)],{type:"image/jxl"}):new Blob([new Uint8Array(n.pngData)],{type:"image/png"});return URL.createObjectURL(t)}catch{return""}}async function es(){an.forEach(e=>{const n=document.createElement("div");n.className="preset-card loading",n.setAttribute("data-preset",e.name),n.innerHTML=`
      <img src="" alt="${e.name}" />
      <p class="preset-name">${e.name}</p>
      <p class="preset-desc">${e.description}</p>
    `,fn.appendChild(n)});for(const e of an){const n=fn.querySelector(`[data-preset="${e.name}"]`);if(!n)continue;const t=await Ql(e.code),i=n.querySelector("img");i&&t&&(i.src=t),n.classList.remove("loading")}}async function ts(){Ve=Vl(),es(),ke=await Jl(),ke?(console.log("[JXL Art] Native JXL support detected - using JXL for preview"),Yl.classList.remove("hidden")):console.log("[JXL Art] No native JXL support - using PNG for preview");const e=zl();if(e)b.value=e;else{const n=await La();n&&(b.value=n)}Qe(),M("Ready. Press Ctrl+Enter to generate image.","info"),e&&qe()}ts();
