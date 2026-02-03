(function(){const n=document.createElement("link").relList;if(n&&n.supports&&n.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const c of r.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&i(c)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const ti=Symbol("Comlink.proxy"),na=Symbol("Comlink.endpoint"),ia=Symbol("Comlink.releaseProxy"),xt=Symbol("Comlink.finalizer"),it=Symbol("Comlink.thrown"),ni=e=>typeof e=="object"&&e!==null||typeof e=="function",aa={canHandle:e=>ni(e)&&e[ti],serialize(e){const{port1:n,port2:t}=new MessageChannel;return ai(e,n),[t,[t]]},deserialize(e){return e.start(),oi(e)}},ra={canHandle:e=>ni(e)&&it in e,serialize({value:e}){let n;return e instanceof Error?n={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:n={isError:!1,value:e},[n,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},ii=new Map([["proxy",aa],["throw",ra]]);function oa(e,n){for(const t of e)if(n===t||t==="*"||t instanceof RegExp&&t.test(n))return!0;return!1}function ai(e,n=globalThis,t=["*"]){n.addEventListener("message",function i(a){if(!a||!a.data)return;if(!oa(t,a.origin)){console.warn(`Invalid origin '${a.origin}' for comlink proxy`);return}const{id:r,type:c,path:l}=Object.assign({path:[]},a.data),h=(a.data.argumentList||[]).map(re);let o;try{const s=l.slice(0,-1).reduce((d,f)=>d[f],e),p=l.reduce((d,f)=>d[f],e);switch(c){case"GET":o=p;break;case"SET":s[l.slice(-1)[0]]=re(a.data.value),o=!0;break;case"APPLY":o=p.apply(s,h);break;case"CONSTRUCT":{const d=new p(...h);o=ha(d)}break;case"ENDPOINT":{const{port1:d,port2:f}=new MessageChannel;ai(e,f),o=da(d,[d])}break;case"RELEASE":o=void 0;break;default:return}}catch(s){o={value:s,[it]:0}}Promise.resolve(o).catch(s=>({value:s,[it]:0})).then(s=>{const[p,d]=lt(s);n.postMessage(Object.assign(Object.assign({},p),{id:r}),d),c==="RELEASE"&&(n.removeEventListener("message",i),ri(n),xt in e&&typeof e[xt]=="function"&&e[xt]())}).catch(s=>{const[p,d]=lt({value:new TypeError("Unserializable return value"),[it]:0});n.postMessage(Object.assign(Object.assign({},p),{id:r}),d)})}),n.start&&n.start()}function la(e){return e.constructor.name==="MessagePort"}function ri(e){la(e)&&e.close()}function oi(e,n){const t=new Map;return e.addEventListener("message",function(a){const{data:r}=a;if(!r||!r.id)return;const c=t.get(r.id);if(c)try{c(r)}finally{t.delete(r.id)}}),Wt(e,t,[],n)}function Ve(e){if(e)throw new Error("Proxy has been released and is not useable")}function li(e){return we(e,new Map,{type:"RELEASE"}).then(()=>{ri(e)})}const rt=new WeakMap,ot="FinalizationRegistry"in globalThis&&new FinalizationRegistry(e=>{const n=(rt.get(e)||0)-1;rt.set(e,n),n===0&&li(e)});function ca(e,n){const t=(rt.get(n)||0)+1;rt.set(n,t),ot&&ot.register(e,n,e)}function sa(e){ot&&ot.unregister(e)}function Wt(e,n,t=[],i=function(){}){let a=!1;const r=new Proxy(i,{get(c,l){if(Ve(a),l===ia)return()=>{sa(r),li(e),n.clear(),a=!0};if(l==="then"){if(t.length===0)return{then:()=>r};const h=we(e,n,{type:"GET",path:t.map(o=>o.toString())}).then(re);return h.then.bind(h)}return Wt(e,n,[...t,l])},set(c,l,h){Ve(a);const[o,s]=lt(h);return we(e,n,{type:"SET",path:[...t,l].map(p=>p.toString()),value:o},s).then(re)},apply(c,l,h){Ve(a);const o=t[t.length-1];if(o===na)return we(e,n,{type:"ENDPOINT"}).then(re);if(o==="bind")return Wt(e,n,t.slice(0,-1));const[s,p]=hn(h);return we(e,n,{type:"APPLY",path:t.map(d=>d.toString()),argumentList:s},p).then(re)},construct(c,l){Ve(a);const[h,o]=hn(l);return we(e,n,{type:"CONSTRUCT",path:t.map(s=>s.toString()),argumentList:h},o).then(re)}});return ca(r,e),r}function fa(e){return Array.prototype.concat.apply([],e)}function hn(e){const n=e.map(lt);return[n.map(t=>t[0]),fa(n.map(t=>t[1]))]}const ci=new WeakMap;function da(e,n){return ci.set(e,n),e}function ha(e){return Object.assign(e,{[ti]:!0})}function lt(e){for(const[n,t]of ii)if(t.canHandle(e)){const[i,a]=t.serialize(e);return[{type:"HANDLER",name:n,value:i},a]}return[{type:"RAW",value:e},ci.get(e)||[]]}function re(e){switch(e.type){case"HANDLER":return ii.get(e.name).deserialize(e.value);case"RAW":return e.value}}function we(e,n,t,i){return new Promise(a=>{const r=_a();n.set(r,a),e.start&&e.start(),e.postMessage(Object.assign({id:r},t),i)})}function _a(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}const ua=`
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
`;function nn(e){return new Promise((n,t)=>{e.oncomplete=e.onsuccess=()=>n(e.result),e.onabort=e.onerror=()=>t(e.error)})}function ga(e,n){let t;const i=()=>{if(t)return t;const a=indexedDB.open(e);return a.onupgradeneeded=()=>a.result.createObjectStore(n),t=nn(a),t.then(r=>{r.onclose=()=>t=void 0},()=>{}),t};return(a,r)=>i().then(c=>r(c.transaction(n,a).objectStore(n)))}let yt;function si(){return yt||(yt=ga("keyval-store","keyval")),yt}function pa(e,n=si()){return n("readonly",t=>nn(t.get(e)))}function wa(e,n,t=si()){return t("readwrite",i=>(i.put(n,e),nn(i.transaction)))}const fi="jxl-art-code";async function $e(e){await wa(fi,e)}async function ba(){return pa(fi)}/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */const ma=4,_n=0,un=1,xa=2;function ve(e){let n=e.length;for(;--n>=0;)e[n]=0}const ya=0,di=1,va=2,Ea=3,ka=258,an=29,He=256,Ie=He+1+an,be=30,rn=19,hi=2*Ie+1,oe=15,vt=16,Sa=7,on=256,_i=16,ui=17,gi=18,Ut=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),at=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),Aa=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),pi=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),za=512,G=new Array((Ie+2)*2);ve(G);const Re=new Array(be*2);ve(Re);const Ce=new Array(za);ve(Ce);const Oe=new Array(ka-Ea+1);ve(Oe);const ln=new Array(an);ve(ln);const ct=new Array(be);ve(ct);function Et(e,n,t,i,a){this.static_tree=e,this.extra_bits=n,this.extra_base=t,this.elems=i,this.max_length=a,this.has_stree=e&&e.length}let wi,bi,mi;function kt(e,n){this.dyn_tree=e,this.max_code=0,this.stat_desc=n}const xi=e=>e<256?Ce[e]:Ce[256+(e>>>7)],Be=(e,n)=>{e.pending_buf[e.pending++]=n&255,e.pending_buf[e.pending++]=n>>>8&255},O=(e,n,t)=>{e.bi_valid>vt-t?(e.bi_buf|=n<<e.bi_valid&65535,Be(e,e.bi_buf),e.bi_buf=n>>vt-e.bi_valid,e.bi_valid+=t-vt):(e.bi_buf|=n<<e.bi_valid&65535,e.bi_valid+=t)},H=(e,n,t)=>{O(e,t[n*2],t[n*2+1])},yi=(e,n)=>{let t=0;do t|=e&1,e>>>=1,t<<=1;while(--n>0);return t>>>1},Ra=e=>{e.bi_valid===16?(Be(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=e.bi_buf&255,e.bi_buf>>=8,e.bi_valid-=8)},Ta=(e,n)=>{const t=n.dyn_tree,i=n.max_code,a=n.stat_desc.static_tree,r=n.stat_desc.has_stree,c=n.stat_desc.extra_bits,l=n.stat_desc.extra_base,h=n.stat_desc.max_length;let o,s,p,d,f,u,T=0;for(d=0;d<=oe;d++)e.bl_count[d]=0;for(t[e.heap[e.heap_max]*2+1]=0,o=e.heap_max+1;o<hi;o++)s=e.heap[o],d=t[t[s*2+1]*2+1]+1,d>h&&(d=h,T++),t[s*2+1]=d,!(s>i)&&(e.bl_count[d]++,f=0,s>=l&&(f=c[s-l]),u=t[s*2],e.opt_len+=u*(d+f),r&&(e.static_len+=u*(a[s*2+1]+f)));if(T!==0){do{for(d=h-1;e.bl_count[d]===0;)d--;e.bl_count[d]--,e.bl_count[d+1]+=2,e.bl_count[h]--,T-=2}while(T>0);for(d=h;d!==0;d--)for(s=e.bl_count[d];s!==0;)p=e.heap[--o],!(p>i)&&(t[p*2+1]!==d&&(e.opt_len+=(d-t[p*2+1])*t[p*2],t[p*2+1]=d),s--)}},vi=(e,n,t)=>{const i=new Array(oe+1);let a=0,r,c;for(r=1;r<=oe;r++)a=a+t[r-1]<<1,i[r]=a;for(c=0;c<=n;c++){let l=e[c*2+1];l!==0&&(e[c*2]=yi(i[l]++,l))}},Na=()=>{let e,n,t,i,a;const r=new Array(oe+1);for(t=0,i=0;i<an-1;i++)for(ln[i]=t,e=0;e<1<<Ut[i];e++)Oe[t++]=i;for(Oe[t-1]=i,a=0,i=0;i<16;i++)for(ct[i]=a,e=0;e<1<<at[i];e++)Ce[a++]=i;for(a>>=7;i<be;i++)for(ct[i]=a<<7,e=0;e<1<<at[i]-7;e++)Ce[256+a++]=i;for(n=0;n<=oe;n++)r[n]=0;for(e=0;e<=143;)G[e*2+1]=8,e++,r[8]++;for(;e<=255;)G[e*2+1]=9,e++,r[9]++;for(;e<=279;)G[e*2+1]=7,e++,r[7]++;for(;e<=287;)G[e*2+1]=8,e++,r[8]++;for(vi(G,Ie+1,r),e=0;e<be;e++)Re[e*2+1]=5,Re[e*2]=yi(e,5);wi=new Et(G,Ut,He+1,Ie,oe),bi=new Et(Re,at,0,be,oe),mi=new Et(new Array(0),Aa,0,rn,Sa)},Ei=e=>{let n;for(n=0;n<Ie;n++)e.dyn_ltree[n*2]=0;for(n=0;n<be;n++)e.dyn_dtree[n*2]=0;for(n=0;n<rn;n++)e.bl_tree[n*2]=0;e.dyn_ltree[on*2]=1,e.opt_len=e.static_len=0,e.sym_next=e.matches=0},ki=e=>{e.bi_valid>8?Be(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0},gn=(e,n,t,i)=>{const a=n*2,r=t*2;return e[a]<e[r]||e[a]===e[r]&&i[n]<=i[t]},St=(e,n,t)=>{const i=e.heap[t];let a=t<<1;for(;a<=e.heap_len&&(a<e.heap_len&&gn(n,e.heap[a+1],e.heap[a],e.depth)&&a++,!gn(n,i,e.heap[a],e.depth));)e.heap[t]=e.heap[a],t=a,a<<=1;e.heap[t]=i},pn=(e,n,t)=>{let i,a,r=0,c,l;if(e.sym_next!==0)do i=e.pending_buf[e.sym_buf+r++]&255,i+=(e.pending_buf[e.sym_buf+r++]&255)<<8,a=e.pending_buf[e.sym_buf+r++],i===0?H(e,a,n):(c=Oe[a],H(e,c+He+1,n),l=Ut[c],l!==0&&(a-=ln[c],O(e,a,l)),i--,c=xi(i),H(e,c,t),l=at[c],l!==0&&(i-=ct[c],O(e,i,l)));while(r<e.sym_next);H(e,on,n)},Zt=(e,n)=>{const t=n.dyn_tree,i=n.stat_desc.static_tree,a=n.stat_desc.has_stree,r=n.stat_desc.elems;let c,l,h=-1,o;for(e.heap_len=0,e.heap_max=hi,c=0;c<r;c++)t[c*2]!==0?(e.heap[++e.heap_len]=h=c,e.depth[c]=0):t[c*2+1]=0;for(;e.heap_len<2;)o=e.heap[++e.heap_len]=h<2?++h:0,t[o*2]=1,e.depth[o]=0,e.opt_len--,a&&(e.static_len-=i[o*2+1]);for(n.max_code=h,c=e.heap_len>>1;c>=1;c--)St(e,t,c);o=r;do c=e.heap[1],e.heap[1]=e.heap[e.heap_len--],St(e,t,1),l=e.heap[1],e.heap[--e.heap_max]=c,e.heap[--e.heap_max]=l,t[o*2]=t[c*2]+t[l*2],e.depth[o]=(e.depth[c]>=e.depth[l]?e.depth[c]:e.depth[l])+1,t[c*2+1]=t[l*2+1]=o,e.heap[1]=o++,St(e,t,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],Ta(e,n),vi(t,h,e.bl_count)},wn=(e,n,t)=>{let i,a=-1,r,c=n[0*2+1],l=0,h=7,o=4;for(c===0&&(h=138,o=3),n[(t+1)*2+1]=65535,i=0;i<=t;i++)r=c,c=n[(i+1)*2+1],!(++l<h&&r===c)&&(l<o?e.bl_tree[r*2]+=l:r!==0?(r!==a&&e.bl_tree[r*2]++,e.bl_tree[_i*2]++):l<=10?e.bl_tree[ui*2]++:e.bl_tree[gi*2]++,l=0,a=r,c===0?(h=138,o=3):r===c?(h=6,o=3):(h=7,o=4))},bn=(e,n,t)=>{let i,a=-1,r,c=n[0*2+1],l=0,h=7,o=4;for(c===0&&(h=138,o=3),i=0;i<=t;i++)if(r=c,c=n[(i+1)*2+1],!(++l<h&&r===c)){if(l<o)do H(e,r,e.bl_tree);while(--l!==0);else r!==0?(r!==a&&(H(e,r,e.bl_tree),l--),H(e,_i,e.bl_tree),O(e,l-3,2)):l<=10?(H(e,ui,e.bl_tree),O(e,l-3,3)):(H(e,gi,e.bl_tree),O(e,l-11,7));l=0,a=r,c===0?(h=138,o=3):r===c?(h=6,o=3):(h=7,o=4)}},La=e=>{let n;for(wn(e,e.dyn_ltree,e.l_desc.max_code),wn(e,e.dyn_dtree,e.d_desc.max_code),Zt(e,e.bl_desc),n=rn-1;n>=3&&e.bl_tree[pi[n]*2+1]===0;n--);return e.opt_len+=3*(n+1)+5+5+4,n},Da=(e,n,t,i)=>{let a;for(O(e,n-257,5),O(e,t-1,5),O(e,i-4,4),a=0;a<i;a++)O(e,e.bl_tree[pi[a]*2+1],3);bn(e,e.dyn_ltree,n-1),bn(e,e.dyn_dtree,t-1)},Ia=e=>{let n=4093624447,t;for(t=0;t<=31;t++,n>>>=1)if(n&1&&e.dyn_ltree[t*2]!==0)return _n;if(e.dyn_ltree[9*2]!==0||e.dyn_ltree[10*2]!==0||e.dyn_ltree[13*2]!==0)return un;for(t=32;t<He;t++)if(e.dyn_ltree[t*2]!==0)return un;return _n};let mn=!1;const Ca=e=>{mn||(Na(),mn=!0),e.l_desc=new kt(e.dyn_ltree,wi),e.d_desc=new kt(e.dyn_dtree,bi),e.bl_desc=new kt(e.bl_tree,mi),e.bi_buf=0,e.bi_valid=0,Ei(e)},Si=(e,n,t,i)=>{O(e,(ya<<1)+(i?1:0),3),ki(e),Be(e,t),Be(e,~t),t&&e.pending_buf.set(e.window.subarray(n,n+t),e.pending),e.pending+=t},Oa=e=>{O(e,di<<1,3),H(e,on,G),Ra(e)},Ba=(e,n,t,i)=>{let a,r,c=0;e.level>0?(e.strm.data_type===xa&&(e.strm.data_type=Ia(e)),Zt(e,e.l_desc),Zt(e,e.d_desc),c=La(e),a=e.opt_len+3+7>>>3,r=e.static_len+3+7>>>3,r<=a&&(a=r)):a=r=t+5,t+4<=a&&n!==-1?Si(e,n,t,i):e.strategy===ma||r===a?(O(e,(di<<1)+(i?1:0),3),pn(e,G,Re)):(O(e,(va<<1)+(i?1:0),3),Da(e,e.l_desc.max_code+1,e.d_desc.max_code+1,c+1),pn(e,e.dyn_ltree,e.dyn_dtree)),Ei(e),i&&ki(e)},Wa=(e,n,t)=>(e.pending_buf[e.sym_buf+e.sym_next++]=n,e.pending_buf[e.sym_buf+e.sym_next++]=n>>8,e.pending_buf[e.sym_buf+e.sym_next++]=t,n===0?e.dyn_ltree[t*2]++:(e.matches++,n--,e.dyn_ltree[(Oe[t]+He+1)*2]++,e.dyn_dtree[xi(n)*2]++),e.sym_next===e.sym_end);var Ua=Ca,Za=Si,Ma=Ba,$a=Wa,Ha=Oa,Pa={_tr_init:Ua,_tr_stored_block:Za,_tr_flush_block:Ma,_tr_tally:$a,_tr_align:Ha};const Fa=(e,n,t,i)=>{let a=e&65535|0,r=e>>>16&65535|0,c=0;for(;t!==0;){c=t>2e3?2e3:t,t-=c;do a=a+n[i++]|0,r=r+a|0;while(--c);a%=65521,r%=65521}return a|r<<16|0};var We=Fa;const Xa=()=>{let e,n=[];for(var t=0;t<256;t++){e=t;for(var i=0;i<8;i++)e=e&1?3988292384^e>>>1:e>>>1;n[t]=e}return n},Ga=new Uint32Array(Xa()),Ya=(e,n,t,i)=>{const a=Ga,r=i+t;e^=-1;for(let c=i;c<r;c++)e=e>>>8^a[(e^n[c])&255];return e^-1};var D=Ya,se={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Pe={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:ja,_tr_stored_block:Mt,_tr_flush_block:Ka,_tr_tally:q,_tr_align:Ja}=Pa,{Z_NO_FLUSH:Q,Z_PARTIAL_FLUSH:Va,Z_FULL_FLUSH:qa,Z_FINISH:U,Z_BLOCK:xn,Z_OK:I,Z_STREAM_END:yn,Z_STREAM_ERROR:P,Z_DATA_ERROR:Qa,Z_BUF_ERROR:At,Z_DEFAULT_COMPRESSION:er,Z_FILTERED:tr,Z_HUFFMAN_ONLY:qe,Z_RLE:nr,Z_FIXED:ir,Z_DEFAULT_STRATEGY:ar,Z_UNKNOWN:rr,Z_DEFLATED:ut}=Pe,or=9,lr=15,cr=8,sr=29,fr=256,$t=fr+1+sr,dr=30,hr=19,_r=2*$t+1,ur=15,y=3,V=258,F=V+y+1,gr=32,xe=42,cn=57,Ht=69,Pt=73,Ft=91,Xt=103,le=113,Ae=666,C=1,Ee=2,fe=3,ke=4,pr=3,ce=(e,n)=>(e.msg=se[n],n),vn=e=>e*2-(e>4?9:0),J=e=>{let n=e.length;for(;--n>=0;)e[n]=0},wr=e=>{let n,t,i,a=e.w_size;n=e.hash_size,i=n;do t=e.head[--i],e.head[i]=t>=a?t-a:0;while(--n);n=a,i=n;do t=e.prev[--i],e.prev[i]=t>=a?t-a:0;while(--n)};let br=(e,n,t)=>(n<<e.hash_shift^t)&e.hash_mask,ee=br;const B=e=>{const n=e.state;let t=n.pending;t>e.avail_out&&(t=e.avail_out),t!==0&&(e.output.set(n.pending_buf.subarray(n.pending_out,n.pending_out+t),e.next_out),e.next_out+=t,n.pending_out+=t,e.total_out+=t,e.avail_out-=t,n.pending-=t,n.pending===0&&(n.pending_out=0))},W=(e,n)=>{Ka(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,n),e.block_start=e.strstart,B(e.strm)},S=(e,n)=>{e.pending_buf[e.pending++]=n},Se=(e,n)=>{e.pending_buf[e.pending++]=n>>>8&255,e.pending_buf[e.pending++]=n&255},Gt=(e,n,t,i)=>{let a=e.avail_in;return a>i&&(a=i),a===0?0:(e.avail_in-=a,n.set(e.input.subarray(e.next_in,e.next_in+a),t),e.state.wrap===1?e.adler=We(e.adler,n,a,t):e.state.wrap===2&&(e.adler=D(e.adler,n,a,t)),e.next_in+=a,e.total_in+=a,a)},Ai=(e,n)=>{let t=e.max_chain_length,i=e.strstart,a,r,c=e.prev_length,l=e.nice_match;const h=e.strstart>e.w_size-F?e.strstart-(e.w_size-F):0,o=e.window,s=e.w_mask,p=e.prev,d=e.strstart+V;let f=o[i+c-1],u=o[i+c];e.prev_length>=e.good_match&&(t>>=2),l>e.lookahead&&(l=e.lookahead);do if(a=n,!(o[a+c]!==u||o[a+c-1]!==f||o[a]!==o[i]||o[++a]!==o[i+1])){i+=2,a++;do;while(o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&o[++i]===o[++a]&&i<d);if(r=V-(d-i),i=d-V,r>c){if(e.match_start=n,c=r,r>=l)break;f=o[i+c-1],u=o[i+c]}}while((n=p[n&s])>h&&--t!==0);return c<=e.lookahead?c:e.lookahead},ye=e=>{const n=e.w_size;let t,i,a;do{if(i=e.window_size-e.lookahead-e.strstart,e.strstart>=n+(n-F)&&(e.window.set(e.window.subarray(n,n+n-i),0),e.match_start-=n,e.strstart-=n,e.block_start-=n,e.insert>e.strstart&&(e.insert=e.strstart),wr(e),i+=n),e.strm.avail_in===0)break;if(t=Gt(e.strm,e.window,e.strstart+e.lookahead,i),e.lookahead+=t,e.lookahead+e.insert>=y)for(a=e.strstart-e.insert,e.ins_h=e.window[a],e.ins_h=ee(e,e.ins_h,e.window[a+1]);e.insert&&(e.ins_h=ee(e,e.ins_h,e.window[a+y-1]),e.prev[a&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=a,a++,e.insert--,!(e.lookahead+e.insert<y)););}while(e.lookahead<F&&e.strm.avail_in!==0)},zi=(e,n)=>{let t=e.pending_buf_size-5>e.w_size?e.w_size:e.pending_buf_size-5,i,a,r,c=0,l=e.strm.avail_in;do{if(i=65535,r=e.bi_valid+42>>3,e.strm.avail_out<r||(r=e.strm.avail_out-r,a=e.strstart-e.block_start,i>a+e.strm.avail_in&&(i=a+e.strm.avail_in),i>r&&(i=r),i<t&&(i===0&&n!==U||n===Q||i!==a+e.strm.avail_in)))break;c=n===U&&i===a+e.strm.avail_in?1:0,Mt(e,0,0,c),e.pending_buf[e.pending-4]=i,e.pending_buf[e.pending-3]=i>>8,e.pending_buf[e.pending-2]=~i,e.pending_buf[e.pending-1]=~i>>8,B(e.strm),a&&(a>i&&(a=i),e.strm.output.set(e.window.subarray(e.block_start,e.block_start+a),e.strm.next_out),e.strm.next_out+=a,e.strm.avail_out-=a,e.strm.total_out+=a,e.block_start+=a,i-=a),i&&(Gt(e.strm,e.strm.output,e.strm.next_out,i),e.strm.next_out+=i,e.strm.avail_out-=i,e.strm.total_out+=i)}while(c===0);return l-=e.strm.avail_in,l&&(l>=e.w_size?(e.matches=2,e.window.set(e.strm.input.subarray(e.strm.next_in-e.w_size,e.strm.next_in),0),e.strstart=e.w_size,e.insert=e.strstart):(e.window_size-e.strstart<=l&&(e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,e.insert>e.strstart&&(e.insert=e.strstart)),e.window.set(e.strm.input.subarray(e.strm.next_in-l,e.strm.next_in),e.strstart),e.strstart+=l,e.insert+=l>e.w_size-e.insert?e.w_size-e.insert:l),e.block_start=e.strstart),e.high_water<e.strstart&&(e.high_water=e.strstart),c?ke:n!==Q&&n!==U&&e.strm.avail_in===0&&e.strstart===e.block_start?Ee:(r=e.window_size-e.strstart,e.strm.avail_in>r&&e.block_start>=e.w_size&&(e.block_start-=e.w_size,e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,r+=e.w_size,e.insert>e.strstart&&(e.insert=e.strstart)),r>e.strm.avail_in&&(r=e.strm.avail_in),r&&(Gt(e.strm,e.window,e.strstart,r),e.strstart+=r,e.insert+=r>e.w_size-e.insert?e.w_size-e.insert:r),e.high_water<e.strstart&&(e.high_water=e.strstart),r=e.bi_valid+42>>3,r=e.pending_buf_size-r>65535?65535:e.pending_buf_size-r,t=r>e.w_size?e.w_size:r,a=e.strstart-e.block_start,(a>=t||(a||n===U)&&n!==Q&&e.strm.avail_in===0&&a<=r)&&(i=a>r?r:a,c=n===U&&e.strm.avail_in===0&&i===a?1:0,Mt(e,e.block_start,i,c),e.block_start+=i,B(e.strm)),c?fe:C)},zt=(e,n)=>{let t,i;for(;;){if(e.lookahead<F){if(ye(e),e.lookahead<F&&n===Q)return C;if(e.lookahead===0)break}if(t=0,e.lookahead>=y&&(e.ins_h=ee(e,e.ins_h,e.window[e.strstart+y-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),t!==0&&e.strstart-t<=e.w_size-F&&(e.match_length=Ai(e,t)),e.match_length>=y)if(i=q(e,e.strstart-e.match_start,e.match_length-y),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=y){e.match_length--;do e.strstart++,e.ins_h=ee(e,e.ins_h,e.window[e.strstart+y-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart;while(--e.match_length!==0);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=ee(e,e.ins_h,e.window[e.strstart+1]);else i=q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(i&&(W(e,!1),e.strm.avail_out===0))return C}return e.insert=e.strstart<y-1?e.strstart:y-1,n===U?(W(e,!0),e.strm.avail_out===0?fe:ke):e.sym_next&&(W(e,!1),e.strm.avail_out===0)?C:Ee},ge=(e,n)=>{let t,i,a;for(;;){if(e.lookahead<F){if(ye(e),e.lookahead<F&&n===Q)return C;if(e.lookahead===0)break}if(t=0,e.lookahead>=y&&(e.ins_h=ee(e,e.ins_h,e.window[e.strstart+y-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=y-1,t!==0&&e.prev_length<e.max_lazy_match&&e.strstart-t<=e.w_size-F&&(e.match_length=Ai(e,t),e.match_length<=5&&(e.strategy===tr||e.match_length===y&&e.strstart-e.match_start>4096)&&(e.match_length=y-1)),e.prev_length>=y&&e.match_length<=e.prev_length){a=e.strstart+e.lookahead-y,i=q(e,e.strstart-1-e.prev_match,e.prev_length-y),e.lookahead-=e.prev_length-1,e.prev_length-=2;do++e.strstart<=a&&(e.ins_h=ee(e,e.ins_h,e.window[e.strstart+y-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart);while(--e.prev_length!==0);if(e.match_available=0,e.match_length=y-1,e.strstart++,i&&(W(e,!1),e.strm.avail_out===0))return C}else if(e.match_available){if(i=q(e,0,e.window[e.strstart-1]),i&&W(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return C}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(i=q(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<y-1?e.strstart:y-1,n===U?(W(e,!0),e.strm.avail_out===0?fe:ke):e.sym_next&&(W(e,!1),e.strm.avail_out===0)?C:Ee},mr=(e,n)=>{let t,i,a,r;const c=e.window;for(;;){if(e.lookahead<=V){if(ye(e),e.lookahead<=V&&n===Q)return C;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=y&&e.strstart>0&&(a=e.strstart-1,i=c[a],i===c[++a]&&i===c[++a]&&i===c[++a])){r=e.strstart+V;do;while(i===c[++a]&&i===c[++a]&&i===c[++a]&&i===c[++a]&&i===c[++a]&&i===c[++a]&&i===c[++a]&&i===c[++a]&&a<r);e.match_length=V-(r-a),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=y?(t=q(e,1,e.match_length-y),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(t=q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),t&&(W(e,!1),e.strm.avail_out===0))return C}return e.insert=0,n===U?(W(e,!0),e.strm.avail_out===0?fe:ke):e.sym_next&&(W(e,!1),e.strm.avail_out===0)?C:Ee},xr=(e,n)=>{let t;for(;;){if(e.lookahead===0&&(ye(e),e.lookahead===0)){if(n===Q)return C;break}if(e.match_length=0,t=q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,t&&(W(e,!1),e.strm.avail_out===0))return C}return e.insert=0,n===U?(W(e,!0),e.strm.avail_out===0?fe:ke):e.sym_next&&(W(e,!1),e.strm.avail_out===0)?C:Ee};function $(e,n,t,i,a){this.good_length=e,this.max_lazy=n,this.nice_length=t,this.max_chain=i,this.func=a}const ze=[new $(0,0,0,0,zi),new $(4,4,8,4,zt),new $(4,5,16,8,zt),new $(4,6,32,32,zt),new $(4,4,16,16,ge),new $(8,16,32,32,ge),new $(8,16,128,128,ge),new $(8,32,128,256,ge),new $(32,128,258,1024,ge),new $(32,258,258,4096,ge)],yr=e=>{e.window_size=2*e.w_size,J(e.head),e.max_lazy_match=ze[e.level].max_lazy,e.good_match=ze[e.level].good_length,e.nice_match=ze[e.level].nice_length,e.max_chain_length=ze[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=y-1,e.match_available=0,e.ins_h=0};function vr(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=ut,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(_r*2),this.dyn_dtree=new Uint16Array((2*dr+1)*2),this.bl_tree=new Uint16Array((2*hr+1)*2),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(ur+1),this.heap=new Uint16Array(2*$t+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*$t+1),J(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const Fe=e=>{if(!e)return 1;const n=e.state;return!n||n.strm!==e||n.status!==xe&&n.status!==cn&&n.status!==Ht&&n.status!==Pt&&n.status!==Ft&&n.status!==Xt&&n.status!==le&&n.status!==Ae?1:0},Ri=e=>{if(Fe(e))return ce(e,P);e.total_in=e.total_out=0,e.data_type=rr;const n=e.state;return n.pending=0,n.pending_out=0,n.wrap<0&&(n.wrap=-n.wrap),n.status=n.wrap===2?cn:n.wrap?xe:le,e.adler=n.wrap===2?0:1,n.last_flush=-2,ja(n),I},Ti=e=>{const n=Ri(e);return n===I&&yr(e.state),n},Er=(e,n)=>Fe(e)||e.state.wrap!==2?P:(e.state.gzhead=n,I),Ni=(e,n,t,i,a,r)=>{if(!e)return P;let c=1;if(n===er&&(n=6),i<0?(c=0,i=-i):i>15&&(c=2,i-=16),a<1||a>or||t!==ut||i<8||i>15||n<0||n>9||r<0||r>ir||i===8&&c!==1)return ce(e,P);i===8&&(i=9);const l=new vr;return e.state=l,l.strm=e,l.status=xe,l.wrap=c,l.gzhead=null,l.w_bits=i,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=a+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+y-1)/y),l.window=new Uint8Array(l.w_size*2),l.head=new Uint16Array(l.hash_size),l.prev=new Uint16Array(l.w_size),l.lit_bufsize=1<<a+6,l.pending_buf_size=l.lit_bufsize*4,l.pending_buf=new Uint8Array(l.pending_buf_size),l.sym_buf=l.lit_bufsize,l.sym_end=(l.lit_bufsize-1)*3,l.level=n,l.strategy=r,l.method=t,Ti(e)},kr=(e,n)=>Ni(e,n,ut,lr,cr,ar),Sr=(e,n)=>{if(Fe(e)||n>xn||n<0)return e?ce(e,P):P;const t=e.state;if(!e.output||e.avail_in!==0&&!e.input||t.status===Ae&&n!==U)return ce(e,e.avail_out===0?At:P);const i=t.last_flush;if(t.last_flush=n,t.pending!==0){if(B(e),e.avail_out===0)return t.last_flush=-1,I}else if(e.avail_in===0&&vn(n)<=vn(i)&&n!==U)return ce(e,At);if(t.status===Ae&&e.avail_in!==0)return ce(e,At);if(t.status===xe&&t.wrap===0&&(t.status=le),t.status===xe){let a=ut+(t.w_bits-8<<4)<<8,r=-1;if(t.strategy>=qe||t.level<2?r=0:t.level<6?r=1:t.level===6?r=2:r=3,a|=r<<6,t.strstart!==0&&(a|=gr),a+=31-a%31,Se(t,a),t.strstart!==0&&(Se(t,e.adler>>>16),Se(t,e.adler&65535)),e.adler=1,t.status=le,B(e),t.pending!==0)return t.last_flush=-1,I}if(t.status===cn){if(e.adler=0,S(t,31),S(t,139),S(t,8),t.gzhead)S(t,(t.gzhead.text?1:0)+(t.gzhead.hcrc?2:0)+(t.gzhead.extra?4:0)+(t.gzhead.name?8:0)+(t.gzhead.comment?16:0)),S(t,t.gzhead.time&255),S(t,t.gzhead.time>>8&255),S(t,t.gzhead.time>>16&255),S(t,t.gzhead.time>>24&255),S(t,t.level===9?2:t.strategy>=qe||t.level<2?4:0),S(t,t.gzhead.os&255),t.gzhead.extra&&t.gzhead.extra.length&&(S(t,t.gzhead.extra.length&255),S(t,t.gzhead.extra.length>>8&255)),t.gzhead.hcrc&&(e.adler=D(e.adler,t.pending_buf,t.pending,0)),t.gzindex=0,t.status=Ht;else if(S(t,0),S(t,0),S(t,0),S(t,0),S(t,0),S(t,t.level===9?2:t.strategy>=qe||t.level<2?4:0),S(t,pr),t.status=le,B(e),t.pending!==0)return t.last_flush=-1,I}if(t.status===Ht){if(t.gzhead.extra){let a=t.pending,r=(t.gzhead.extra.length&65535)-t.gzindex;for(;t.pending+r>t.pending_buf_size;){let l=t.pending_buf_size-t.pending;if(t.pending_buf.set(t.gzhead.extra.subarray(t.gzindex,t.gzindex+l),t.pending),t.pending=t.pending_buf_size,t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex+=l,B(e),t.pending!==0)return t.last_flush=-1,I;a=0,r-=l}let c=new Uint8Array(t.gzhead.extra);t.pending_buf.set(c.subarray(t.gzindex,t.gzindex+r),t.pending),t.pending+=r,t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=Pt}if(t.status===Pt){if(t.gzhead.name){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),B(e),t.pending!==0)return t.last_flush=-1,I;a=0}t.gzindex<t.gzhead.name.length?r=t.gzhead.name.charCodeAt(t.gzindex++)&255:r=0,S(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=Ft}if(t.status===Ft){if(t.gzhead.comment){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a)),B(e),t.pending!==0)return t.last_flush=-1,I;a=0}t.gzindex<t.gzhead.comment.length?r=t.gzhead.comment.charCodeAt(t.gzindex++)&255:r=0,S(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=D(e.adler,t.pending_buf,t.pending-a,a))}t.status=Xt}if(t.status===Xt){if(t.gzhead.hcrc){if(t.pending+2>t.pending_buf_size&&(B(e),t.pending!==0))return t.last_flush=-1,I;S(t,e.adler&255),S(t,e.adler>>8&255),e.adler=0}if(t.status=le,B(e),t.pending!==0)return t.last_flush=-1,I}if(e.avail_in!==0||t.lookahead!==0||n!==Q&&t.status!==Ae){let a=t.level===0?zi(t,n):t.strategy===qe?xr(t,n):t.strategy===nr?mr(t,n):ze[t.level].func(t,n);if((a===fe||a===ke)&&(t.status=Ae),a===C||a===fe)return e.avail_out===0&&(t.last_flush=-1),I;if(a===Ee&&(n===Va?Ja(t):n!==xn&&(Mt(t,0,0,!1),n===qa&&(J(t.head),t.lookahead===0&&(t.strstart=0,t.block_start=0,t.insert=0))),B(e),e.avail_out===0))return t.last_flush=-1,I}return n!==U?I:t.wrap<=0?yn:(t.wrap===2?(S(t,e.adler&255),S(t,e.adler>>8&255),S(t,e.adler>>16&255),S(t,e.adler>>24&255),S(t,e.total_in&255),S(t,e.total_in>>8&255),S(t,e.total_in>>16&255),S(t,e.total_in>>24&255)):(Se(t,e.adler>>>16),Se(t,e.adler&65535)),B(e),t.wrap>0&&(t.wrap=-t.wrap),t.pending!==0?I:yn)},Ar=e=>{if(Fe(e))return P;const n=e.state.status;return e.state=null,n===le?ce(e,Qa):I},zr=(e,n)=>{let t=n.length;if(Fe(e))return P;const i=e.state,a=i.wrap;if(a===2||a===1&&i.status!==xe||i.lookahead)return P;if(a===1&&(e.adler=We(e.adler,n,t,0)),i.wrap=0,t>=i.w_size){a===0&&(J(i.head),i.strstart=0,i.block_start=0,i.insert=0);let h=new Uint8Array(i.w_size);h.set(n.subarray(t-i.w_size,t),0),n=h,t=i.w_size}const r=e.avail_in,c=e.next_in,l=e.input;for(e.avail_in=t,e.next_in=0,e.input=n,ye(i);i.lookahead>=y;){let h=i.strstart,o=i.lookahead-(y-1);do i.ins_h=ee(i,i.ins_h,i.window[h+y-1]),i.prev[h&i.w_mask]=i.head[i.ins_h],i.head[i.ins_h]=h,h++;while(--o);i.strstart=h,i.lookahead=y-1,ye(i)}return i.strstart+=i.lookahead,i.block_start=i.strstart,i.insert=i.lookahead,i.lookahead=0,i.match_length=i.prev_length=y-1,i.match_available=0,e.next_in=c,e.input=l,e.avail_in=r,i.wrap=a,I};var Rr=kr,Tr=Ni,Nr=Ti,Lr=Ri,Dr=Er,Ir=Sr,Cr=Ar,Or=zr,Br="pako deflate (from Nodeca project)",Te={deflateInit:Rr,deflateInit2:Tr,deflateReset:Nr,deflateResetKeep:Lr,deflateSetHeader:Dr,deflate:Ir,deflateEnd:Cr,deflateSetDictionary:Or,deflateInfo:Br};const Wr=(e,n)=>Object.prototype.hasOwnProperty.call(e,n);var Ur=function(e){const n=Array.prototype.slice.call(arguments,1);for(;n.length;){const t=n.shift();if(t){if(typeof t!="object")throw new TypeError(t+"must be non-object");for(const i in t)Wr(t,i)&&(e[i]=t[i])}}return e},Zr=e=>{let n=0;for(let i=0,a=e.length;i<a;i++)n+=e[i].length;const t=new Uint8Array(n);for(let i=0,a=0,r=e.length;i<r;i++){let c=e[i];t.set(c,a),a+=c.length}return t},gt={assign:Ur,flattenChunks:Zr};let Li=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{Li=!1}const Ue=new Uint8Array(256);for(let e=0;e<256;e++)Ue[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;Ue[254]=Ue[254]=1;var Mr=e=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(e);let n,t,i,a,r,c=e.length,l=0;for(a=0;a<c;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<c&&(i=e.charCodeAt(a+1),(i&64512)===56320&&(t=65536+(t-55296<<10)+(i-56320),a++)),l+=t<128?1:t<2048?2:t<65536?3:4;for(n=new Uint8Array(l),r=0,a=0;r<l;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<c&&(i=e.charCodeAt(a+1),(i&64512)===56320&&(t=65536+(t-55296<<10)+(i-56320),a++)),t<128?n[r++]=t:t<2048?(n[r++]=192|t>>>6,n[r++]=128|t&63):t<65536?(n[r++]=224|t>>>12,n[r++]=128|t>>>6&63,n[r++]=128|t&63):(n[r++]=240|t>>>18,n[r++]=128|t>>>12&63,n[r++]=128|t>>>6&63,n[r++]=128|t&63);return n};const $r=(e,n)=>{if(n<65534&&e.subarray&&Li)return String.fromCharCode.apply(null,e.length===n?e:e.subarray(0,n));let t="";for(let i=0;i<n;i++)t+=String.fromCharCode(e[i]);return t};var Hr=(e,n)=>{const t=n||e.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(e.subarray(0,n));let i,a;const r=new Array(t*2);for(a=0,i=0;i<t;){let c=e[i++];if(c<128){r[a++]=c;continue}let l=Ue[c];if(l>4){r[a++]=65533,i+=l-1;continue}for(c&=l===2?31:l===3?15:7;l>1&&i<t;)c=c<<6|e[i++]&63,l--;if(l>1){r[a++]=65533;continue}c<65536?r[a++]=c:(c-=65536,r[a++]=55296|c>>10&1023,r[a++]=56320|c&1023)}return $r(r,a)},Pr=(e,n)=>{n=n||e.length,n>e.length&&(n=e.length);let t=n-1;for(;t>=0&&(e[t]&192)===128;)t--;return t<0||t===0?n:t+Ue[e[t]]>n?t:n},Ze={string2buf:Mr,buf2string:Hr,utf8border:Pr};function Fr(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Di=Fr;const Ii=Object.prototype.toString,{Z_NO_FLUSH:Xr,Z_SYNC_FLUSH:Gr,Z_FULL_FLUSH:Yr,Z_FINISH:jr,Z_OK:st,Z_STREAM_END:Kr,Z_DEFAULT_COMPRESSION:Jr,Z_DEFAULT_STRATEGY:Vr,Z_DEFLATED:qr}=Pe;function Xe(e){this.options=gt.assign({level:Jr,method:qr,chunkSize:16384,windowBits:15,memLevel:8,strategy:Vr},e||{});let n=this.options;n.raw&&n.windowBits>0?n.windowBits=-n.windowBits:n.gzip&&n.windowBits>0&&n.windowBits<16&&(n.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Di,this.strm.avail_out=0;let t=Te.deflateInit2(this.strm,n.level,n.method,n.windowBits,n.memLevel,n.strategy);if(t!==st)throw new Error(se[t]);if(n.header&&Te.deflateSetHeader(this.strm,n.header),n.dictionary){let i;if(typeof n.dictionary=="string"?i=Ze.string2buf(n.dictionary):Ii.call(n.dictionary)==="[object ArrayBuffer]"?i=new Uint8Array(n.dictionary):i=n.dictionary,t=Te.deflateSetDictionary(this.strm,i),t!==st)throw new Error(se[t]);this._dict_set=!0}}Xe.prototype.push=function(e,n){const t=this.strm,i=this.options.chunkSize;let a,r;if(this.ended)return!1;for(n===~~n?r=n:r=n===!0?jr:Xr,typeof e=="string"?t.input=Ze.string2buf(e):Ii.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){if(t.avail_out===0&&(t.output=new Uint8Array(i),t.next_out=0,t.avail_out=i),(r===Gr||r===Yr)&&t.avail_out<=6){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(a=Te.deflate(t,r),a===Kr)return t.next_out>0&&this.onData(t.output.subarray(0,t.next_out)),a=Te.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===st;if(t.avail_out===0){this.onData(t.output);continue}if(r>0&&t.next_out>0){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(t.avail_in===0)break}return!0};Xe.prototype.onData=function(e){this.chunks.push(e)};Xe.prototype.onEnd=function(e){e===st&&(this.result=gt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function sn(e,n){const t=new Xe(n);if(t.push(e,!0),t.err)throw t.msg||se[t.err];return t.result}function Qr(e,n){return n=n||{},n.raw=!0,sn(e,n)}function eo(e,n){return n=n||{},n.gzip=!0,sn(e,n)}var to=Xe,no=sn,io=Qr,ao=eo,ro={Deflate:to,deflate:no,deflateRaw:io,gzip:ao};const Qe=16209,oo=16191;var lo=function(n,t){let i,a,r,c,l,h,o,s,p,d,f,u,T,v,b,A,m,_,k,L,g,z,E,w;const x=n.state;i=n.next_in,E=n.input,a=i+(n.avail_in-5),r=n.next_out,w=n.output,c=r-(t-n.avail_out),l=r+(n.avail_out-257),h=x.dmax,o=x.wsize,s=x.whave,p=x.wnext,d=x.window,f=x.hold,u=x.bits,T=x.lencode,v=x.distcode,b=(1<<x.lenbits)-1,A=(1<<x.distbits)-1;e:do{u<15&&(f+=E[i++]<<u,u+=8,f+=E[i++]<<u,u+=8),m=T[f&b];t:for(;;){if(_=m>>>24,f>>>=_,u-=_,_=m>>>16&255,_===0)w[r++]=m&65535;else if(_&16){k=m&65535,_&=15,_&&(u<_&&(f+=E[i++]<<u,u+=8),k+=f&(1<<_)-1,f>>>=_,u-=_),u<15&&(f+=E[i++]<<u,u+=8,f+=E[i++]<<u,u+=8),m=v[f&A];n:for(;;){if(_=m>>>24,f>>>=_,u-=_,_=m>>>16&255,_&16){if(L=m&65535,_&=15,u<_&&(f+=E[i++]<<u,u+=8,u<_&&(f+=E[i++]<<u,u+=8)),L+=f&(1<<_)-1,L>h){n.msg="invalid distance too far back",x.mode=Qe;break e}if(f>>>=_,u-=_,_=r-c,L>_){if(_=L-_,_>s&&x.sane){n.msg="invalid distance too far back",x.mode=Qe;break e}if(g=0,z=d,p===0){if(g+=o-_,_<k){k-=_;do w[r++]=d[g++];while(--_);g=r-L,z=w}}else if(p<_){if(g+=o+p-_,_-=p,_<k){k-=_;do w[r++]=d[g++];while(--_);if(g=0,p<k){_=p,k-=_;do w[r++]=d[g++];while(--_);g=r-L,z=w}}}else if(g+=p-_,_<k){k-=_;do w[r++]=d[g++];while(--_);g=r-L,z=w}for(;k>2;)w[r++]=z[g++],w[r++]=z[g++],w[r++]=z[g++],k-=3;k&&(w[r++]=z[g++],k>1&&(w[r++]=z[g++]))}else{g=r-L;do w[r++]=w[g++],w[r++]=w[g++],w[r++]=w[g++],k-=3;while(k>2);k&&(w[r++]=w[g++],k>1&&(w[r++]=w[g++]))}}else if(_&64){n.msg="invalid distance code",x.mode=Qe;break e}else{m=v[(m&65535)+(f&(1<<_)-1)];continue n}break}}else if(_&64)if(_&32){x.mode=oo;break e}else{n.msg="invalid literal/length code",x.mode=Qe;break e}else{m=T[(m&65535)+(f&(1<<_)-1)];continue t}break}}while(i<a&&r<l);k=u>>3,i-=k,u-=k<<3,f&=(1<<u)-1,n.next_in=i,n.next_out=r,n.avail_in=i<a?5+(a-i):5-(i-a),n.avail_out=r<l?257+(l-r):257-(r-l),x.hold=f,x.bits=u};const pe=15,En=852,kn=592,Sn=0,Rt=1,An=2,co=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),so=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),fo=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),ho=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),_o=(e,n,t,i,a,r,c,l)=>{const h=l.bits;let o=0,s=0,p=0,d=0,f=0,u=0,T=0,v=0,b=0,A=0,m,_,k,L,g,z=null,E;const w=new Uint16Array(pe+1),x=new Uint16Array(pe+1);let ae=null,dn,Ke,Je;for(o=0;o<=pe;o++)w[o]=0;for(s=0;s<i;s++)w[n[t+s]]++;for(f=h,d=pe;d>=1&&w[d]===0;d--);if(f>d&&(f=d),d===0)return a[r++]=1<<24|64<<16|0,a[r++]=1<<24|64<<16|0,l.bits=1,0;for(p=1;p<d&&w[p]===0;p++);for(f<p&&(f=p),v=1,o=1;o<=pe;o++)if(v<<=1,v-=w[o],v<0)return-1;if(v>0&&(e===Sn||d!==1))return-1;for(x[1]=0,o=1;o<pe;o++)x[o+1]=x[o]+w[o];for(s=0;s<i;s++)n[t+s]!==0&&(c[x[n[t+s]]++]=s);if(e===Sn?(z=ae=c,E=20):e===Rt?(z=co,ae=so,E=257):(z=fo,ae=ho,E=0),A=0,s=0,o=p,g=r,u=f,T=0,k=-1,b=1<<f,L=b-1,e===Rt&&b>En||e===An&&b>kn)return 1;for(;;){dn=o-T,c[s]+1<E?(Ke=0,Je=c[s]):c[s]>=E?(Ke=ae[c[s]-E],Je=z[c[s]-E]):(Ke=96,Je=0),m=1<<o-T,_=1<<u,p=_;do _-=m,a[g+(A>>T)+_]=dn<<24|Ke<<16|Je|0;while(_!==0);for(m=1<<o-1;A&m;)m>>=1;if(m!==0?(A&=m-1,A+=m):A=0,s++,--w[o]===0){if(o===d)break;o=n[t+c[s]]}if(o>f&&(A&L)!==k){for(T===0&&(T=f),g+=p,u=o-T,v=1<<u;u+T<d&&(v-=w[u+T],!(v<=0));)u++,v<<=1;if(b+=1<<u,e===Rt&&b>En||e===An&&b>kn)return 1;k=A&L,a[k]=f<<24|u<<16|g-r|0}}return A!==0&&(a[g+A]=o-T<<24|64<<16|0),l.bits=f,0};var Ne=_o;const uo=0,Ci=1,Oi=2,{Z_FINISH:zn,Z_BLOCK:go,Z_TREES:et,Z_OK:de,Z_STREAM_END:po,Z_NEED_DICT:wo,Z_STREAM_ERROR:Z,Z_DATA_ERROR:Bi,Z_MEM_ERROR:Wi,Z_BUF_ERROR:bo,Z_DEFLATED:Rn}=Pe,pt=16180,Tn=16181,Nn=16182,Ln=16183,Dn=16184,In=16185,Cn=16186,On=16187,Bn=16188,Wn=16189,ft=16190,X=16191,Tt=16192,Un=16193,Nt=16194,Zn=16195,Mn=16196,$n=16197,Hn=16198,tt=16199,nt=16200,Pn=16201,Fn=16202,Xn=16203,Gn=16204,Yn=16205,Lt=16206,jn=16207,Kn=16208,R=16209,Ui=16210,Zi=16211,mo=852,xo=592,yo=15,vo=yo,Jn=e=>(e>>>24&255)+(e>>>8&65280)+((e&65280)<<8)+((e&255)<<24);function Eo(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const ue=e=>{if(!e)return 1;const n=e.state;return!n||n.strm!==e||n.mode<pt||n.mode>Zi?1:0},Mi=e=>{if(ue(e))return Z;const n=e.state;return e.total_in=e.total_out=n.total=0,e.msg="",n.wrap&&(e.adler=n.wrap&1),n.mode=pt,n.last=0,n.havedict=0,n.flags=-1,n.dmax=32768,n.head=null,n.hold=0,n.bits=0,n.lencode=n.lendyn=new Int32Array(mo),n.distcode=n.distdyn=new Int32Array(xo),n.sane=1,n.back=-1,de},$i=e=>{if(ue(e))return Z;const n=e.state;return n.wsize=0,n.whave=0,n.wnext=0,Mi(e)},Hi=(e,n)=>{let t;if(ue(e))return Z;const i=e.state;return n<0?(t=0,n=-n):(t=(n>>4)+5,n<48&&(n&=15)),n&&(n<8||n>15)?Z:(i.window!==null&&i.wbits!==n&&(i.window=null),i.wrap=t,i.wbits=n,$i(e))},Pi=(e,n)=>{if(!e)return Z;const t=new Eo;e.state=t,t.strm=e,t.window=null,t.mode=pt;const i=Hi(e,n);return i!==de&&(e.state=null),i},ko=e=>Pi(e,vo);let Vn=!0,Dt,It;const So=e=>{if(Vn){Dt=new Int32Array(512),It=new Int32Array(32);let n=0;for(;n<144;)e.lens[n++]=8;for(;n<256;)e.lens[n++]=9;for(;n<280;)e.lens[n++]=7;for(;n<288;)e.lens[n++]=8;for(Ne(Ci,e.lens,0,288,Dt,0,e.work,{bits:9}),n=0;n<32;)e.lens[n++]=5;Ne(Oi,e.lens,0,32,It,0,e.work,{bits:5}),Vn=!1}e.lencode=Dt,e.lenbits=9,e.distcode=It,e.distbits=5},Fi=(e,n,t,i)=>{let a;const r=e.state;return r.window===null&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Uint8Array(r.wsize)),i>=r.wsize?(r.window.set(n.subarray(t-r.wsize,t),0),r.wnext=0,r.whave=r.wsize):(a=r.wsize-r.wnext,a>i&&(a=i),r.window.set(n.subarray(t-i,t-i+a),r.wnext),i-=a,i?(r.window.set(n.subarray(t-i,t),0),r.wnext=i,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0},Ao=(e,n)=>{let t,i,a,r,c,l,h,o,s,p,d,f,u,T,v=0,b,A,m,_,k,L,g,z;const E=new Uint8Array(4);let w,x;const ae=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(ue(e)||!e.output||!e.input&&e.avail_in!==0)return Z;t=e.state,t.mode===X&&(t.mode=Tt),c=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,i=e.input,l=e.avail_in,o=t.hold,s=t.bits,p=l,d=h,z=de;e:for(;;)switch(t.mode){case pt:if(t.wrap===0){t.mode=Tt;break}for(;s<16;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(t.wrap&2&&o===35615){t.wbits===0&&(t.wbits=15),t.check=0,E[0]=o&255,E[1]=o>>>8&255,t.check=D(t.check,E,2,0),o=0,s=0,t.mode=Tn;break}if(t.head&&(t.head.done=!1),!(t.wrap&1)||(((o&255)<<8)+(o>>8))%31){e.msg="incorrect header check",t.mode=R;break}if((o&15)!==Rn){e.msg="unknown compression method",t.mode=R;break}if(o>>>=4,s-=4,g=(o&15)+8,t.wbits===0&&(t.wbits=g),g>15||g>t.wbits){e.msg="invalid window size",t.mode=R;break}t.dmax=1<<t.wbits,t.flags=0,e.adler=t.check=1,t.mode=o&512?Wn:X,o=0,s=0;break;case Tn:for(;s<16;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(t.flags=o,(t.flags&255)!==Rn){e.msg="unknown compression method",t.mode=R;break}if(t.flags&57344){e.msg="unknown header flags set",t.mode=R;break}t.head&&(t.head.text=o>>8&1),t.flags&512&&t.wrap&4&&(E[0]=o&255,E[1]=o>>>8&255,t.check=D(t.check,E,2,0)),o=0,s=0,t.mode=Nn;case Nn:for(;s<32;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.head&&(t.head.time=o),t.flags&512&&t.wrap&4&&(E[0]=o&255,E[1]=o>>>8&255,E[2]=o>>>16&255,E[3]=o>>>24&255,t.check=D(t.check,E,4,0)),o=0,s=0,t.mode=Ln;case Ln:for(;s<16;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.head&&(t.head.xflags=o&255,t.head.os=o>>8),t.flags&512&&t.wrap&4&&(E[0]=o&255,E[1]=o>>>8&255,t.check=D(t.check,E,2,0)),o=0,s=0,t.mode=Dn;case Dn:if(t.flags&1024){for(;s<16;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.length=o,t.head&&(t.head.extra_len=o),t.flags&512&&t.wrap&4&&(E[0]=o&255,E[1]=o>>>8&255,t.check=D(t.check,E,2,0)),o=0,s=0}else t.head&&(t.head.extra=null);t.mode=In;case In:if(t.flags&1024&&(f=t.length,f>l&&(f=l),f&&(t.head&&(g=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Uint8Array(t.head.extra_len)),t.head.extra.set(i.subarray(r,r+f),g)),t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,t.length-=f),t.length))break e;t.length=0,t.mode=Cn;case Cn:if(t.flags&2048){if(l===0)break e;f=0;do g=i[r+f++],t.head&&g&&t.length<65536&&(t.head.name+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=On;case On:if(t.flags&4096){if(l===0)break e;f=0;do g=i[r+f++],t.head&&g&&t.length<65536&&(t.head.comment+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=D(t.check,i,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.comment=null);t.mode=Bn;case Bn:if(t.flags&512){for(;s<16;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(t.wrap&4&&o!==(t.check&65535)){e.msg="header crc mismatch",t.mode=R;break}o=0,s=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),e.adler=t.check=0,t.mode=X;break;case Wn:for(;s<32;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}e.adler=t.check=Jn(o),o=0,s=0,t.mode=ft;case ft:if(t.havedict===0)return e.next_out=c,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=s,wo;e.adler=t.check=1,t.mode=X;case X:if(n===go||n===et)break e;case Tt:if(t.last){o>>>=s&7,s-=s&7,t.mode=Lt;break}for(;s<3;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}switch(t.last=o&1,o>>>=1,s-=1,o&3){case 0:t.mode=Un;break;case 1:if(So(t),t.mode=tt,n===et){o>>>=2,s-=2;break e}break;case 2:t.mode=Mn;break;case 3:e.msg="invalid block type",t.mode=R}o>>>=2,s-=2;break;case Un:for(o>>>=s&7,s-=s&7;s<32;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if((o&65535)!==(o>>>16^65535)){e.msg="invalid stored block lengths",t.mode=R;break}if(t.length=o&65535,o=0,s=0,t.mode=Nt,n===et)break e;case Nt:t.mode=Zn;case Zn:if(f=t.length,f){if(f>l&&(f=l),f>h&&(f=h),f===0)break e;a.set(i.subarray(r,r+f),c),l-=f,r+=f,h-=f,c+=f,t.length-=f;break}t.mode=X;break;case Mn:for(;s<14;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(t.nlen=(o&31)+257,o>>>=5,s-=5,t.ndist=(o&31)+1,o>>>=5,s-=5,t.ncode=(o&15)+4,o>>>=4,s-=4,t.nlen>286||t.ndist>30){e.msg="too many length or distance symbols",t.mode=R;break}t.have=0,t.mode=$n;case $n:for(;t.have<t.ncode;){for(;s<3;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.lens[ae[t.have++]]=o&7,o>>>=3,s-=3}for(;t.have<19;)t.lens[ae[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,w={bits:t.lenbits},z=Ne(uo,t.lens,0,19,t.lencode,0,t.work,w),t.lenbits=w.bits,z){e.msg="invalid code lengths set",t.mode=R;break}t.have=0,t.mode=Hn;case Hn:for(;t.have<t.nlen+t.ndist;){for(;v=t.lencode[o&(1<<t.lenbits)-1],b=v>>>24,A=v>>>16&255,m=v&65535,!(b<=s);){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(m<16)o>>>=b,s-=b,t.lens[t.have++]=m;else{if(m===16){for(x=b+2;s<x;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(o>>>=b,s-=b,t.have===0){e.msg="invalid bit length repeat",t.mode=R;break}g=t.lens[t.have-1],f=3+(o&3),o>>>=2,s-=2}else if(m===17){for(x=b+3;s<x;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}o>>>=b,s-=b,g=0,f=3+(o&7),o>>>=3,s-=3}else{for(x=b+7;s<x;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}o>>>=b,s-=b,g=0,f=11+(o&127),o>>>=7,s-=7}if(t.have+f>t.nlen+t.ndist){e.msg="invalid bit length repeat",t.mode=R;break}for(;f--;)t.lens[t.have++]=g}}if(t.mode===R)break;if(t.lens[256]===0){e.msg="invalid code -- missing end-of-block",t.mode=R;break}if(t.lenbits=9,w={bits:t.lenbits},z=Ne(Ci,t.lens,0,t.nlen,t.lencode,0,t.work,w),t.lenbits=w.bits,z){e.msg="invalid literal/lengths set",t.mode=R;break}if(t.distbits=6,t.distcode=t.distdyn,w={bits:t.distbits},z=Ne(Oi,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,w),t.distbits=w.bits,z){e.msg="invalid distances set",t.mode=R;break}if(t.mode=tt,n===et)break e;case tt:t.mode=nt;case nt:if(l>=6&&h>=258){e.next_out=c,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=s,lo(e,d),c=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,i=e.input,l=e.avail_in,o=t.hold,s=t.bits,t.mode===X&&(t.back=-1);break}for(t.back=0;v=t.lencode[o&(1<<t.lenbits)-1],b=v>>>24,A=v>>>16&255,m=v&65535,!(b<=s);){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(A&&!(A&240)){for(_=b,k=A,L=m;v=t.lencode[L+((o&(1<<_+k)-1)>>_)],b=v>>>24,A=v>>>16&255,m=v&65535,!(_+b<=s);){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}o>>>=_,s-=_,t.back+=_}if(o>>>=b,s-=b,t.back+=b,t.length=m,A===0){t.mode=Yn;break}if(A&32){t.back=-1,t.mode=X;break}if(A&64){e.msg="invalid literal/length code",t.mode=R;break}t.extra=A&15,t.mode=Pn;case Pn:if(t.extra){for(x=t.extra;s<x;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.length+=o&(1<<t.extra)-1,o>>>=t.extra,s-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=Fn;case Fn:for(;v=t.distcode[o&(1<<t.distbits)-1],b=v>>>24,A=v>>>16&255,m=v&65535,!(b<=s);){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(!(A&240)){for(_=b,k=A,L=m;v=t.distcode[L+((o&(1<<_+k)-1)>>_)],b=v>>>24,A=v>>>16&255,m=v&65535,!(_+b<=s);){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}o>>>=_,s-=_,t.back+=_}if(o>>>=b,s-=b,t.back+=b,A&64){e.msg="invalid distance code",t.mode=R;break}t.offset=m,t.extra=A&15,t.mode=Xn;case Xn:if(t.extra){for(x=t.extra;s<x;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}t.offset+=o&(1<<t.extra)-1,o>>>=t.extra,s-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){e.msg="invalid distance too far back",t.mode=R;break}t.mode=Gn;case Gn:if(h===0)break e;if(f=d-h,t.offset>f){if(f=t.offset-f,f>t.whave&&t.sane){e.msg="invalid distance too far back",t.mode=R;break}f>t.wnext?(f-=t.wnext,u=t.wsize-f):u=t.wnext-f,f>t.length&&(f=t.length),T=t.window}else T=a,u=c-t.offset,f=t.length;f>h&&(f=h),h-=f,t.length-=f;do a[c++]=T[u++];while(--f);t.length===0&&(t.mode=nt);break;case Yn:if(h===0)break e;a[c++]=t.length,h--,t.mode=nt;break;case Lt:if(t.wrap){for(;s<32;){if(l===0)break e;l--,o|=i[r++]<<s,s+=8}if(d-=h,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?D(t.check,a,d,c-d):We(t.check,a,d,c-d)),d=h,t.wrap&4&&(t.flags?o:Jn(o))!==t.check){e.msg="incorrect data check",t.mode=R;break}o=0,s=0}t.mode=jn;case jn:if(t.wrap&&t.flags){for(;s<32;){if(l===0)break e;l--,o+=i[r++]<<s,s+=8}if(t.wrap&4&&o!==(t.total&4294967295)){e.msg="incorrect length check",t.mode=R;break}o=0,s=0}t.mode=Kn;case Kn:z=po;break e;case R:z=Bi;break e;case Ui:return Wi;case Zi:default:return Z}return e.next_out=c,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=s,(t.wsize||d!==e.avail_out&&t.mode<R&&(t.mode<Lt||n!==zn))&&Fi(e,e.output,e.next_out,d-e.avail_out),p-=e.avail_in,d-=e.avail_out,e.total_in+=p,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?D(t.check,a,d,e.next_out-d):We(t.check,a,d,e.next_out-d)),e.data_type=t.bits+(t.last?64:0)+(t.mode===X?128:0)+(t.mode===tt||t.mode===Nt?256:0),(p===0&&d===0||n===zn)&&z===de&&(z=bo),z},zo=e=>{if(ue(e))return Z;let n=e.state;return n.window&&(n.window=null),e.state=null,de},Ro=(e,n)=>{if(ue(e))return Z;const t=e.state;return t.wrap&2?(t.head=n,n.done=!1,de):Z},To=(e,n)=>{const t=n.length;let i,a,r;return ue(e)||(i=e.state,i.wrap!==0&&i.mode!==ft)?Z:i.mode===ft&&(a=1,a=We(a,n,t,0),a!==i.check)?Bi:(r=Fi(e,n,t,t),r?(i.mode=Ui,Wi):(i.havedict=1,de))};var No=$i,Lo=Hi,Do=Mi,Io=ko,Co=Pi,Oo=Ao,Bo=zo,Wo=Ro,Uo=To,Zo="pako inflate (from Nodeca project)",Y={inflateReset:No,inflateReset2:Lo,inflateResetKeep:Do,inflateInit:Io,inflateInit2:Co,inflate:Oo,inflateEnd:Bo,inflateGetHeader:Wo,inflateSetDictionary:Uo,inflateInfo:Zo};function Mo(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var $o=Mo;const Xi=Object.prototype.toString,{Z_NO_FLUSH:Ho,Z_FINISH:Po,Z_OK:Me,Z_STREAM_END:Ct,Z_NEED_DICT:Ot,Z_STREAM_ERROR:Fo,Z_DATA_ERROR:qn,Z_MEM_ERROR:Xo}=Pe;function Ge(e){this.options=gt.assign({chunkSize:1024*64,windowBits:15,to:""},e||{});const n=this.options;n.raw&&n.windowBits>=0&&n.windowBits<16&&(n.windowBits=-n.windowBits,n.windowBits===0&&(n.windowBits=-15)),n.windowBits>=0&&n.windowBits<16&&!(e&&e.windowBits)&&(n.windowBits+=32),n.windowBits>15&&n.windowBits<48&&(n.windowBits&15||(n.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Di,this.strm.avail_out=0;let t=Y.inflateInit2(this.strm,n.windowBits);if(t!==Me)throw new Error(se[t]);if(this.header=new $o,Y.inflateGetHeader(this.strm,this.header),n.dictionary&&(typeof n.dictionary=="string"?n.dictionary=Ze.string2buf(n.dictionary):Xi.call(n.dictionary)==="[object ArrayBuffer]"&&(n.dictionary=new Uint8Array(n.dictionary)),n.raw&&(t=Y.inflateSetDictionary(this.strm,n.dictionary),t!==Me)))throw new Error(se[t])}Ge.prototype.push=function(e,n){const t=this.strm,i=this.options.chunkSize,a=this.options.dictionary;let r,c,l;if(this.ended)return!1;for(n===~~n?c=n:c=n===!0?Po:Ho,Xi.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){for(t.avail_out===0&&(t.output=new Uint8Array(i),t.next_out=0,t.avail_out=i),r=Y.inflate(t,c),r===Ot&&a&&(r=Y.inflateSetDictionary(t,a),r===Me?r=Y.inflate(t,c):r===qn&&(r=Ot));t.avail_in>0&&r===Ct&&t.state.wrap>0&&e[t.next_in]!==0;)Y.inflateReset(t),r=Y.inflate(t,c);switch(r){case Fo:case qn:case Ot:case Xo:return this.onEnd(r),this.ended=!0,!1}if(l=t.avail_out,t.next_out&&(t.avail_out===0||r===Ct))if(this.options.to==="string"){let h=Ze.utf8border(t.output,t.next_out),o=t.next_out-h,s=Ze.buf2string(t.output,h);t.next_out=o,t.avail_out=i-o,o&&t.output.set(t.output.subarray(h,h+o),0),this.onData(s)}else this.onData(t.output.length===t.next_out?t.output:t.output.subarray(0,t.next_out));if(!(r===Me&&l===0)){if(r===Ct)return r=Y.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,!0;if(t.avail_in===0)break}}return!0};Ge.prototype.onData=function(e){this.chunks.push(e)};Ge.prototype.onEnd=function(e){e===Me&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=gt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function fn(e,n){const t=new Ge(n);if(t.push(e),t.err)throw t.msg||se[t.err];return t.result}function Go(e,n){return n=n||{},n.raw=!0,fn(e,n)}var Yo=Ge,jo=fn,Ko=Go,Jo=fn,Vo={Inflate:Yo,inflate:jo,inflateRaw:Ko,ungzip:Jo};const{Deflate:qo,deflate:Qo,deflateRaw:el,gzip:tl}=ro,{Inflate:nl,inflate:il,inflateRaw:al,ungzip:rl}=Vo;var ol=qo,ll=Qo,cl=el,sl=tl,fl=nl,dl=il,hl=al,_l=rl,ul=Pe,Gi={Deflate:ol,deflate:ll,deflateRaw:cl,gzip:sl,Inflate:fl,inflate:dl,inflateRaw:hl,ungzip:_l,constants:ul};function gl(e){const n=Gi.deflate(new TextEncoder().encode(e));return btoa(String.fromCharCode(...n)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function pl(e){const n=e.replace(/-/g,"+").replace(/_/g,"/"),t=atob(n),i=new Uint8Array(t.length);for(let r=0;r<t.length;r++)i[r]=t.charCodeAt(r);const a=Gi.inflate(i);return new TextDecoder().decode(a)}function wl(){const e=new URLSearchParams(window.location.search),n=e.get("zcode");if(n)try{return pl(n)}catch(i){console.error("Failed to decode zcode:",i)}const t=e.get("code");if(t)try{const i=t.replace(/-/g,"+").replace(/_/g,"/");return atob(i)}catch(i){console.error("Failed to decode code:",i)}return null}async function bl(e){const n=new URL(window.location.href);n.searchParams.delete("code"),n.searchParams.set("zcode",gl(e)),await navigator.clipboard.writeText(n.toString())}const Yt=[{name:"Gradient Waves",description:"Colorful gradient waves pattern",code:`Bitdepth 8
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
  - Set 50`}],N=document.getElementById("code"),jt=document.getElementById("run"),ml=document.getElementById("share"),xl=document.getElementById("prettier"),yl=document.getElementById("help"),vl=document.getElementById("close-help"),dt=document.getElementById("help-dialog"),El=document.getElementById("help-content"),Le=document.getElementById("preview"),Kt=document.getElementById("download-jxl"),Jt=document.getElementById("download-png"),Qn=document.getElementById("size-info"),ei=document.getElementById("log"),K=document.getElementById("image-container"),kl=document.getElementById("image-wrapper"),Sl=document.getElementById("zoom-level"),Al=document.getElementById("zoom-in"),zl=document.getElementById("zoom-out"),Rl=document.getElementById("zoom-fit"),Tl=document.getElementById("zoom-reset"),Nl=document.querySelector(".placeholder"),Ll=document.getElementById("jxl-support"),Yi=document.getElementById("line-numbers"),Dl=document.getElementById("presets-btn"),te=document.getElementById("presets-dialog"),Vt=document.getElementById("presets-grid"),Il=document.getElementById("close-presets"),ji=document.getElementById("main"),Ki=document.getElementById("resizer"),ht=document.querySelector(".editor-panel"),_t=document.querySelector(".preview-panel");let wt,qt=null,De=null,Bt=!1,me=!1;async function Cl(){return new Promise(e=>{const n=new Image,t=setTimeout(()=>e(!1),1e3);n.onload=()=>{clearTimeout(t),e(n.width===1&&n.height===1)},n.onerror=()=>{clearTimeout(t),e(!1)},n.src="data:image/jxl;base64,/woAkAEAE4gCAMAAtZ8gAAAVKqOMG7yc6/nyQ4fFtI3rDG21bWEJY7O9MEhIOIONiwTfnKWRaQYkopIE"})}let M=1,ne=0,ie=0,he=!1,Ji=0,Vi=0;function Ol(){const e=new Worker(new URL("/jxl-art/assets/jxl-worker-3vnTCf0O.js",import.meta.url),{type:"module"});return oi(e)}function j(e,n="info"){ei.textContent=e,ei.className=n}async function Ye(){if(!Bt){Bt=!0,document.body.classList.add("loading"),jt.disabled=!0,j("Compiling...","info");try{const e=N.value,n=await wt.render(e);qt=n.jxlData;let t;me?(t=new Blob([new Uint8Array(n.jxlData)],{type:"image/jxl"}),De=null):(De=new Blob([new Uint8Array(n.pngData)],{type:"image/png"}),t=De);const i=URL.createObjectURL(t);Le.src=i,Nl.classList.add("hidden"),Le.onload=()=>ta(),Kt.disabled=!1,Jt.disabled=me,Qn.textContent=`JXL: ${n.jxlData.byteLength} bytes${me?" (native)":""}`,j(`Success! JXL size: ${n.jxlData.byteLength} bytes`,"success"),await $e(e)}catch(e){const n=e instanceof Error?e.message:"Unknown error";j(n,"error"),console.error(e),Kt.disabled=!0,Jt.disabled=!0,Qn.textContent=""}finally{Bt=!1,document.body.classList.remove("loading"),jt.disabled=!1}}}function qi(e,n){const t=URL.createObjectURL(e),i=document.createElement("a");i.href=t,i.download=n,i.click(),URL.revokeObjectURL(t)}jt.addEventListener("click",Ye);ml.addEventListener("click",Qi);xl.addEventListener("click",ea);yl.addEventListener("click",()=>{El.innerHTML=ua,dt.showModal()});vl.addEventListener("click",()=>{dt.close()});Kt.addEventListener("click",()=>{qt&&qi(new Blob([new Uint8Array(qt)],{type:"image/jxl"}),"art.jxl")});Jt.addEventListener("click",()=>{De&&qi(De,"art.png")});N.addEventListener("keydown",e=>{e.ctrlKey&&e.altKey&&e.code==="Enter"&&(e.preventDefault(),Ye())});function bt(){const e=N.value.split(`
`).length,n=Array.from({length:e},(t,i)=>`<span>${i+1}</span>`).join("");Yi.innerHTML=n}N.addEventListener("scroll",()=>{Yi.scrollTop=N.scrollTop});N.addEventListener("keydown",e=>{if(e.key==="Tab"){e.preventDefault();const n=N.selectionStart,t=N.selectionEnd;N.value=N.value.substring(0,n)+"  "+N.value.substring(t),N.selectionStart=N.selectionEnd=n+2,bt(),$e(N.value)}});N.addEventListener("input",()=>{$e(N.value),bt()});document.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&(e.preventDefault(),Ye()),(e.ctrlKey||e.metaKey)&&e.key==="s"&&(e.preventDefault(),Qi()),(e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="f"&&(e.preventDefault(),ea()),e.key==="Escape"&&(dt.open&&dt.close(),te.open&&te.close())});async function Qi(){try{await bl(N.value),j("Share URL copied to clipboard!","success")}catch{j("Failed to copy URL","error")}}async function ea(){try{const e=await wt.prettier(N.value);N.value=e,$e(e),j("Code formatted","success")}catch{j("Failed to format code","error")}}Dl.addEventListener("click",()=>{te.showModal()});Il.addEventListener("click",()=>{te.close()});te.addEventListener("click",e=>{e.target===te&&te.close()});Vt.addEventListener("click",e=>{const n=e.target.closest(".preset-card");if(!n)return;const t=n.getAttribute("data-preset"),i=Yt.find(a=>a.name===t);i&&(N.value=i.code,bt(),$e(i.code),te.close(),j(`Loaded preset: ${i.name}`,"info"),Ye())});function je(){kl.style.transform=`translate(${ne}px, ${ie}px) scale(${M})`,Sl.textContent=`${Math.round(M*100)}%`}function mt(e,n,t){const i=M;if(M=Math.max(.1,Math.min(10,e)),n!==void 0&&t!==void 0){const a=K.getBoundingClientRect(),r=n-a.left-a.width/2,c=t-a.top-a.height/2,l=M/i;ne=r-(r-ne)*l,ie=c-(c-ie)*l}je()}function ta(){if(!Le.naturalWidth)return;const e=K.getBoundingClientRect(),n=(e.width-20)/Le.naturalWidth,t=(e.height-60)/Le.naturalHeight;M=Math.min(n,t,1),ne=0,ie=0,je()}Al.addEventListener("click",()=>mt(M*1.25));zl.addEventListener("click",()=>mt(M/1.25));Tl.addEventListener("click",()=>{M=1,ne=0,ie=0,je()});Rl.addEventListener("click",ta);K.addEventListener("wheel",e=>{e.preventDefault();const n=e.deltaY>0?.9:1.1;mt(M*n,e.clientX,e.clientY)},{passive:!1});K.addEventListener("mousedown",e=>{e.button===0&&(he=!0,Ji=e.clientX-ne,Vi=e.clientY-ie,K.style.cursor="grabbing")});window.addEventListener("mousemove",e=>{he&&(ne=e.clientX-Ji,ie=e.clientY-Vi,je())});window.addEventListener("mouseup",()=>{he=!1,K.style.cursor=""});let Qt=0,en=0,tn=0;K.addEventListener("touchstart",e=>{e.touches.length===1?(he=!0,en=e.touches[0].clientX,tn=e.touches[0].clientY):e.touches.length===2&&(he=!1,Qt=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))},{passive:!0});K.addEventListener("touchmove",e=>{if(e.touches.length===1&&he){const n=e.touches[0].clientX-en,t=e.touches[0].clientY-tn;ne+=n,ie+=t,en=e.touches[0].clientX,tn=e.touches[0].clientY,je()}else if(e.touches.length===2){const n=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),t=(e.touches[0].clientX+e.touches[1].clientX)/2,i=(e.touches[0].clientY+e.touches[1].clientY)/2;mt(M*(n/Qt),t,i),Qt=n}},{passive:!0});K.addEventListener("touchend",()=>{he=!1});let _e=!1;Ki.addEventListener("mousedown",e=>{_e=!0,document.body.style.cursor="col-resize",document.body.style.userSelect="none",e.preventDefault()});window.addEventListener("mousemove",e=>{if(!_e)return;const n=ji.getBoundingClientRect();if(window.innerWidth<=900){const i=e.clientY-n.top,a=n.height,r=i/a*100,c=Math.max(15,Math.min(85,r));ht.style.flex=`0 0 ${c}%`,_t.style.flex=`0 0 ${100-c-2}%`}else{const i=e.clientX-n.left,a=n.width,r=i/a*100,c=Math.max(15,Math.min(85,r));ht.style.flex=`0 0 ${c}%`,_t.style.flex=`0 0 ${100-c-2}%`}});window.addEventListener("mouseup",()=>{_e&&(_e=!1,document.body.style.cursor="",document.body.style.userSelect="")});Ki.addEventListener("touchstart",e=>{_e=!0,e.preventDefault()});window.addEventListener("touchmove",e=>{if(!_e||e.touches.length!==1)return;const n=e.touches[0],t=ji.getBoundingClientRect();if(window.innerWidth<=900){const a=n.clientY-t.top,r=t.height,c=a/r*100,l=Math.max(15,Math.min(85,c));ht.style.flex=`0 0 ${l}%`,_t.style.flex=`0 0 ${100-l-2}%`}else{const a=n.clientX-t.left,r=t.width,c=a/r*100,l=Math.max(15,Math.min(85,c));ht.style.flex=`0 0 ${l}%`,_t.style.flex=`0 0 ${100-l-2}%`}});window.addEventListener("touchend",()=>{_e=!1});async function Bl(e){try{const n=await wt.render(e),t=me?new Blob([new Uint8Array(n.jxlData)],{type:"image/jxl"}):new Blob([new Uint8Array(n.pngData)],{type:"image/png"});return URL.createObjectURL(t)}catch{return""}}async function Wl(){Yt.forEach(e=>{const n=document.createElement("div");n.className="preset-card loading",n.setAttribute("data-preset",e.name),n.innerHTML=`
      <img src="" alt="${e.name}" />
      <p class="preset-name">${e.name}</p>
      <p class="preset-desc">${e.description}</p>
    `,Vt.appendChild(n)});for(const e of Yt){const n=Vt.querySelector(`[data-preset="${e.name}"]`);if(!n)continue;const t=await Bl(e.code),i=n.querySelector("img");i&&t&&(i.src=t),n.classList.remove("loading")}}async function Ul(){wt=Ol(),Wl(),me=await Cl(),me?(console.log("[JXL Art] Native JXL support detected - using JXL for preview"),Ll.classList.remove("hidden")):console.log("[JXL Art] No native JXL support - using PNG for preview");const e=wl();if(e)N.value=e;else{const n=await ba();n&&(N.value=n)}bt(),j("Ready. Press Ctrl+Enter to generate image.","info"),e&&Ye()}Ul();
