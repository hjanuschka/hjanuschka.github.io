(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))n(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&n(s)}).observe(document,{childList:!0,subtree:!0});function t(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(a){if(a.ep)return;a.ep=!0;const r=t(a);fetch(a.href,r)}})();/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */const un=Symbol("Comlink.proxy"),_a=Symbol("Comlink.endpoint"),ga=Symbol("Comlink.releaseProxy"),zt=Symbol("Comlink.finalizer"),ht=Symbol("Comlink.thrown"),_n=e=>typeof e=="object"&&e!==null||typeof e=="function",pa={canHandle:e=>_n(e)&&e[un],serialize(e){const{port1:i,port2:t}=new MessageChannel;return pn(e,i),[t,[t]]},deserialize(e){return e.start(),bn(e)}},wa={canHandle:e=>_n(e)&&ht in e,serialize({value:e}){let i;return e instanceof Error?i={isError:!0,value:{message:e.message,name:e.name,stack:e.stack}}:i={isError:!1,value:e},[i,[]]},deserialize(e){throw e.isError?Object.assign(new Error(e.value.message),e.value):e.value}},gn=new Map([["proxy",pa],["throw",wa]]);function ba(e,i){for(const t of e)if(i===t||t==="*"||t instanceof RegExp&&t.test(i))return!0;return!1}function pn(e,i=globalThis,t=["*"]){i.addEventListener("message",function n(a){if(!a||!a.data)return;if(!ba(t,a.origin)){console.warn(`Invalid origin '${a.origin}' for comlink proxy`);return}const{id:r,type:s,path:l}=Object.assign({path:[]},a.data),h=(a.data.argumentList||[]).map(le);let o;try{const c=l.slice(0,-1).reduce((d,f)=>d[f],e),p=l.reduce((d,f)=>d[f],e);switch(s){case"GET":o=p;break;case"SET":c[l.slice(-1)[0]]=le(a.data.value),o=!0;break;case"APPLY":o=p.apply(c,h);break;case"CONSTRUCT":{const d=new p(...h);o=Sa(d)}break;case"ENDPOINT":{const{port1:d,port2:f}=new MessageChannel;pn(e,f),o=Ea(d,[d])}break;case"RELEASE":o=void 0;break;default:return}}catch(c){o={value:c,[ht]:0}}Promise.resolve(o).catch(c=>({value:c,[ht]:0})).then(c=>{const[p,d]=pt(c);i.postMessage(Object.assign(Object.assign({},p),{id:r}),d),s==="RELEASE"&&(i.removeEventListener("message",n),wn(i),zt in e&&typeof e[zt]=="function"&&e[zt]())}).catch(c=>{const[p,d]=pt({value:new TypeError("Unserializable return value"),[ht]:0});i.postMessage(Object.assign(Object.assign({},p),{id:r}),d)})}),i.start&&i.start()}function ma(e){return e.constructor.name==="MessagePort"}function wn(e){ma(e)&&e.close()}function bn(e,i){const t=new Map;return e.addEventListener("message",function(a){const{data:r}=a;if(!r||!r.id)return;const s=t.get(r.id);if(s)try{s(r)}finally{t.delete(r.id)}}),Yt(e,t,[],i)}function at(e){if(e)throw new Error("Proxy has been released and is not useable")}function mn(e){return ye(e,new Map,{type:"RELEASE"}).then(()=>{wn(e)})}const _t=new WeakMap,gt="FinalizationRegistry"in globalThis&&new FinalizationRegistry(e=>{const i=(_t.get(e)||0)-1;_t.set(e,i),i===0&&mn(e)});function ya(e,i){const t=(_t.get(i)||0)+1;_t.set(i,t),gt&&gt.register(e,i,e)}function xa(e){gt&&gt.unregister(e)}function Yt(e,i,t=[],n=function(){}){let a=!1;const r=new Proxy(n,{get(s,l){if(at(a),l===ga)return()=>{xa(r),mn(e),i.clear(),a=!0};if(l==="then"){if(t.length===0)return{then:()=>r};const h=ye(e,i,{type:"GET",path:t.map(o=>o.toString())}).then(le);return h.then.bind(h)}return Yt(e,i,[...t,l])},set(s,l,h){at(a);const[o,c]=pt(h);return ye(e,i,{type:"SET",path:[...t,l].map(p=>p.toString()),value:o},c).then(le)},apply(s,l,h){at(a);const o=t[t.length-1];if(o===_a)return ye(e,i,{type:"ENDPOINT"}).then(le);if(o==="bind")return Yt(e,i,t.slice(0,-1));const[c,p]=Si(h);return ye(e,i,{type:"APPLY",path:t.map(d=>d.toString()),argumentList:c},p).then(le)},construct(s,l){at(a);const[h,o]=Si(l);return ye(e,i,{type:"CONSTRUCT",path:t.map(c=>c.toString()),argumentList:h},o).then(le)}});return ya(r,e),r}function va(e){return Array.prototype.concat.apply([],e)}function Si(e){const i=e.map(pt);return[i.map(t=>t[0]),va(i.map(t=>t[1]))]}const yn=new WeakMap;function Ea(e,i){return yn.set(e,i),e}function Sa(e){return Object.assign(e,{[un]:!0})}function pt(e){for(const[i,t]of gn)if(t.canHandle(e)){const[n,a]=t.serialize(e);return[{type:"HANDLER",name:i,value:n},a]}return[{type:"RAW",value:e},yn.get(e)||[]]}function le(e){switch(e.type){case"HANDLER":return gn.get(e.name).deserialize(e.value);case"RAW":return e.value}}function ye(e,i,t,n){return new Promise(a=>{const r=ka();i.set(r,a),e.start&&e.start(),e.postMessage(Object.assign({id:r},t),n)})}function ka(){return new Array(4).fill(0).map(()=>Math.floor(Math.random()*Number.MAX_SAFE_INTEGER).toString(16)).join("-")}const Aa=`
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
`;function gi(e){return new Promise((i,t)=>{e.oncomplete=e.onsuccess=()=>i(e.result),e.onabort=e.onerror=()=>t(e.error)})}function Na(e,i){let t;const n=()=>{if(t)return t;const a=indexedDB.open(e);return a.onupgradeneeded=()=>a.result.createObjectStore(i),t=gi(a),t.then(r=>{r.onclose=()=>t=void 0},()=>{}),t};return(a,r)=>n().then(s=>r(s.transaction(i,a).objectStore(i)))}let Lt;function xn(){return Lt||(Lt=Na("keyval-store","keyval")),Lt}function Wa(e,i=xn()){return i("readonly",t=>gi(t.get(e)))}function Ra(e,i,t=xn()){return t("readwrite",n=>(n.put(i,e),gi(n.transaction)))}const vn="jxl-art-code";async function ke(e){await Ra(vn,e)}async function za(){return Wa(vn)}/*! pako 2.1.0 https://github.com/nodeca/pako @license (MIT AND Zlib) */const La=4,ki=0,Ai=1,Ta=2;function Ae(e){let i=e.length;for(;--i>=0;)e[i]=0}const Ca=0,En=1,Da=2,Ba=3,Ia=258,pi=29,Xe=256,Oe=Xe+1+pi,xe=30,wi=19,Sn=2*Oe+1,se=15,Tt=16,Oa=7,bi=256,kn=16,An=17,Nn=18,jt=new Uint8Array([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0]),ut=new Uint8Array([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13]),Ha=new Uint8Array([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7]),Wn=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),Ma=512,Y=new Array((Oe+2)*2);Ae(Y);const Te=new Array(xe*2);Ae(Te);const He=new Array(Ma);Ae(He);const Me=new Array(Ia-Ba+1);Ae(Me);const mi=new Array(pi);Ae(mi);const wt=new Array(xe);Ae(wt);function Ct(e,i,t,n,a){this.static_tree=e,this.extra_bits=i,this.extra_base=t,this.elems=n,this.max_length=a,this.has_stree=e&&e.length}let Rn,zn,Ln;function Dt(e,i){this.dyn_tree=e,this.max_code=0,this.stat_desc=i}const Tn=e=>e<256?He[e]:He[256+(e>>>7)],Ue=(e,i)=>{e.pending_buf[e.pending++]=i&255,e.pending_buf[e.pending++]=i>>>8&255},B=(e,i,t)=>{e.bi_valid>Tt-t?(e.bi_buf|=i<<e.bi_valid&65535,Ue(e,e.bi_buf),e.bi_buf=i>>Tt-e.bi_valid,e.bi_valid+=t-Tt):(e.bi_buf|=i<<e.bi_valid&65535,e.bi_valid+=t)},$=(e,i,t)=>{B(e,t[i*2],t[i*2+1])},Cn=(e,i)=>{let t=0;do t|=e&1,e>>>=1,t<<=1;while(--i>0);return t>>>1},Ua=e=>{e.bi_valid===16?(Ue(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):e.bi_valid>=8&&(e.pending_buf[e.pending++]=e.bi_buf&255,e.bi_buf>>=8,e.bi_valid-=8)},Pa=(e,i)=>{const t=i.dyn_tree,n=i.max_code,a=i.stat_desc.static_tree,r=i.stat_desc.has_stree,s=i.stat_desc.extra_bits,l=i.stat_desc.extra_base,h=i.stat_desc.max_length;let o,c,p,d,f,_,z=0;for(d=0;d<=se;d++)e.bl_count[d]=0;for(t[e.heap[e.heap_max]*2+1]=0,o=e.heap_max+1;o<Sn;o++)c=e.heap[o],d=t[t[c*2+1]*2+1]+1,d>h&&(d=h,z++),t[c*2+1]=d,!(c>n)&&(e.bl_count[d]++,f=0,c>=l&&(f=s[c-l]),_=t[c*2],e.opt_len+=_*(d+f),r&&(e.static_len+=_*(a[c*2+1]+f)));if(z!==0){do{for(d=h-1;e.bl_count[d]===0;)d--;e.bl_count[d]--,e.bl_count[d+1]+=2,e.bl_count[h]--,z-=2}while(z>0);for(d=h;d!==0;d--)for(c=e.bl_count[d];c!==0;)p=e.heap[--o],!(p>n)&&(t[p*2+1]!==d&&(e.opt_len+=(d-t[p*2+1])*t[p*2],t[p*2+1]=d),c--)}},Dn=(e,i,t)=>{const n=new Array(se+1);let a=0,r,s;for(r=1;r<=se;r++)a=a+t[r-1]<<1,n[r]=a;for(s=0;s<=i;s++){let l=e[s*2+1];l!==0&&(e[s*2]=Cn(n[l]++,l))}},Za=()=>{let e,i,t,n,a;const r=new Array(se+1);for(t=0,n=0;n<pi-1;n++)for(mi[n]=t,e=0;e<1<<jt[n];e++)Me[t++]=n;for(Me[t-1]=n,a=0,n=0;n<16;n++)for(wt[n]=a,e=0;e<1<<ut[n];e++)He[a++]=n;for(a>>=7;n<xe;n++)for(wt[n]=a<<7,e=0;e<1<<ut[n]-7;e++)He[256+a++]=n;for(i=0;i<=se;i++)r[i]=0;for(e=0;e<=143;)Y[e*2+1]=8,e++,r[8]++;for(;e<=255;)Y[e*2+1]=9,e++,r[9]++;for(;e<=279;)Y[e*2+1]=7,e++,r[7]++;for(;e<=287;)Y[e*2+1]=8,e++,r[8]++;for(Dn(Y,Oe+1,r),e=0;e<xe;e++)Te[e*2+1]=5,Te[e*2]=Cn(e,5);Rn=new Ct(Y,jt,Xe+1,Oe,se),zn=new Ct(Te,ut,0,xe,se),Ln=new Ct(new Array(0),Ha,0,wi,Oa)},Bn=e=>{let i;for(i=0;i<Oe;i++)e.dyn_ltree[i*2]=0;for(i=0;i<xe;i++)e.dyn_dtree[i*2]=0;for(i=0;i<wi;i++)e.bl_tree[i*2]=0;e.dyn_ltree[bi*2]=1,e.opt_len=e.static_len=0,e.sym_next=e.matches=0},In=e=>{e.bi_valid>8?Ue(e,e.bi_buf):e.bi_valid>0&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0},Ni=(e,i,t,n)=>{const a=i*2,r=t*2;return e[a]<e[r]||e[a]===e[r]&&n[i]<=n[t]},Bt=(e,i,t)=>{const n=e.heap[t];let a=t<<1;for(;a<=e.heap_len&&(a<e.heap_len&&Ni(i,e.heap[a+1],e.heap[a],e.depth)&&a++,!Ni(i,n,e.heap[a],e.depth));)e.heap[t]=e.heap[a],t=a,a<<=1;e.heap[t]=n},Wi=(e,i,t)=>{let n,a,r=0,s,l;if(e.sym_next!==0)do n=e.pending_buf[e.sym_buf+r++]&255,n+=(e.pending_buf[e.sym_buf+r++]&255)<<8,a=e.pending_buf[e.sym_buf+r++],n===0?$(e,a,i):(s=Me[a],$(e,s+Xe+1,i),l=jt[s],l!==0&&(a-=mi[s],B(e,a,l)),n--,s=Tn(n),$(e,s,t),l=ut[s],l!==0&&(n-=wt[s],B(e,n,l)));while(r<e.sym_next);$(e,bi,i)},Kt=(e,i)=>{const t=i.dyn_tree,n=i.stat_desc.static_tree,a=i.stat_desc.has_stree,r=i.stat_desc.elems;let s,l,h=-1,o;for(e.heap_len=0,e.heap_max=Sn,s=0;s<r;s++)t[s*2]!==0?(e.heap[++e.heap_len]=h=s,e.depth[s]=0):t[s*2+1]=0;for(;e.heap_len<2;)o=e.heap[++e.heap_len]=h<2?++h:0,t[o*2]=1,e.depth[o]=0,e.opt_len--,a&&(e.static_len-=n[o*2+1]);for(i.max_code=h,s=e.heap_len>>1;s>=1;s--)Bt(e,t,s);o=r;do s=e.heap[1],e.heap[1]=e.heap[e.heap_len--],Bt(e,t,1),l=e.heap[1],e.heap[--e.heap_max]=s,e.heap[--e.heap_max]=l,t[o*2]=t[s*2]+t[l*2],e.depth[o]=(e.depth[s]>=e.depth[l]?e.depth[s]:e.depth[l])+1,t[s*2+1]=t[l*2+1]=o,e.heap[1]=o++,Bt(e,t,1);while(e.heap_len>=2);e.heap[--e.heap_max]=e.heap[1],Pa(e,i),Dn(t,h,e.bl_count)},Ri=(e,i,t)=>{let n,a=-1,r,s=i[0*2+1],l=0,h=7,o=4;for(s===0&&(h=138,o=3),i[(t+1)*2+1]=65535,n=0;n<=t;n++)r=s,s=i[(n+1)*2+1],!(++l<h&&r===s)&&(l<o?e.bl_tree[r*2]+=l:r!==0?(r!==a&&e.bl_tree[r*2]++,e.bl_tree[kn*2]++):l<=10?e.bl_tree[An*2]++:e.bl_tree[Nn*2]++,l=0,a=r,s===0?(h=138,o=3):r===s?(h=6,o=3):(h=7,o=4))},zi=(e,i,t)=>{let n,a=-1,r,s=i[0*2+1],l=0,h=7,o=4;for(s===0&&(h=138,o=3),n=0;n<=t;n++)if(r=s,s=i[(n+1)*2+1],!(++l<h&&r===s)){if(l<o)do $(e,r,e.bl_tree);while(--l!==0);else r!==0?(r!==a&&($(e,r,e.bl_tree),l--),$(e,kn,e.bl_tree),B(e,l-3,2)):l<=10?($(e,An,e.bl_tree),B(e,l-3,3)):($(e,Nn,e.bl_tree),B(e,l-11,7));l=0,a=r,s===0?(h=138,o=3):r===s?(h=6,o=3):(h=7,o=4)}},$a=e=>{let i;for(Ri(e,e.dyn_ltree,e.l_desc.max_code),Ri(e,e.dyn_dtree,e.d_desc.max_code),Kt(e,e.bl_desc),i=wi-1;i>=3&&e.bl_tree[Wn[i]*2+1]===0;i--);return e.opt_len+=3*(i+1)+5+5+4,i},Ga=(e,i,t,n)=>{let a;for(B(e,i-257,5),B(e,t-1,5),B(e,n-4,4),a=0;a<n;a++)B(e,e.bl_tree[Wn[a]*2+1],3);zi(e,e.dyn_ltree,i-1),zi(e,e.dyn_dtree,t-1)},Fa=e=>{let i=4093624447,t;for(t=0;t<=31;t++,i>>>=1)if(i&1&&e.dyn_ltree[t*2]!==0)return ki;if(e.dyn_ltree[9*2]!==0||e.dyn_ltree[10*2]!==0||e.dyn_ltree[13*2]!==0)return Ai;for(t=32;t<Xe;t++)if(e.dyn_ltree[t*2]!==0)return Ai;return ki};let Li=!1;const Xa=e=>{Li||(Za(),Li=!0),e.l_desc=new Dt(e.dyn_ltree,Rn),e.d_desc=new Dt(e.dyn_dtree,zn),e.bl_desc=new Dt(e.bl_tree,Ln),e.bi_buf=0,e.bi_valid=0,Bn(e)},On=(e,i,t,n)=>{B(e,(Ca<<1)+(n?1:0),3),In(e),Ue(e,t),Ue(e,~t),t&&e.pending_buf.set(e.window.subarray(i,i+t),e.pending),e.pending+=t},Ya=e=>{B(e,En<<1,3),$(e,bi,Y),Ua(e)},ja=(e,i,t,n)=>{let a,r,s=0;e.level>0?(e.strm.data_type===Ta&&(e.strm.data_type=Fa(e)),Kt(e,e.l_desc),Kt(e,e.d_desc),s=$a(e),a=e.opt_len+3+7>>>3,r=e.static_len+3+7>>>3,r<=a&&(a=r)):a=r=t+5,t+4<=a&&i!==-1?On(e,i,t,n):e.strategy===La||r===a?(B(e,(En<<1)+(n?1:0),3),Wi(e,Y,Te)):(B(e,(Da<<1)+(n?1:0),3),Ga(e,e.l_desc.max_code+1,e.d_desc.max_code+1,s+1),Wi(e,e.dyn_ltree,e.dyn_dtree)),Bn(e),n&&In(e)},Ka=(e,i,t)=>(e.pending_buf[e.sym_buf+e.sym_next++]=i,e.pending_buf[e.sym_buf+e.sym_next++]=i>>8,e.pending_buf[e.sym_buf+e.sym_next++]=t,i===0?e.dyn_ltree[t*2]++:(e.matches++,i--,e.dyn_ltree[(Me[t]+Xe+1)*2]++,e.dyn_dtree[Tn(i)*2]++),e.sym_next===e.sym_end);var Ja=Xa,Va=On,qa=ja,Qa=Ka,er=Ya,tr={_tr_init:Ja,_tr_stored_block:Va,_tr_flush_block:qa,_tr_tally:Qa,_tr_align:er};const ir=(e,i,t,n)=>{let a=e&65535|0,r=e>>>16&65535|0,s=0;for(;t!==0;){s=t>2e3?2e3:t,t-=s;do a=a+i[n++]|0,r=r+a|0;while(--s);a%=65521,r%=65521}return a|r<<16|0};var Pe=ir;const nr=()=>{let e,i=[];for(var t=0;t<256;t++){e=t;for(var n=0;n<8;n++)e=e&1?3988292384^e>>>1:e>>>1;i[t]=e}return i},ar=new Uint32Array(nr()),rr=(e,i,t,n)=>{const a=ar,r=n+t;e^=-1;for(let s=n;s<r;s++)e=e>>>8^a[(e^i[s])&255];return e^-1};var T=rr,he={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Ye={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{_tr_init:or,_tr_stored_block:Jt,_tr_flush_block:lr,_tr_tally:Q,_tr_align:sr}=tr,{Z_NO_FLUSH:ee,Z_PARTIAL_FLUSH:cr,Z_FULL_FLUSH:fr,Z_FINISH:H,Z_BLOCK:Ti,Z_OK:C,Z_STREAM_END:Ci,Z_STREAM_ERROR:G,Z_DATA_ERROR:dr,Z_BUF_ERROR:It,Z_DEFAULT_COMPRESSION:hr,Z_FILTERED:ur,Z_HUFFMAN_ONLY:rt,Z_RLE:_r,Z_FIXED:gr,Z_DEFAULT_STRATEGY:pr,Z_UNKNOWN:wr,Z_DEFLATED:At}=Ye,br=9,mr=15,yr=8,xr=29,vr=256,Vt=vr+1+xr,Er=30,Sr=19,kr=2*Vt+1,Ar=15,v=3,V=258,F=V+v+1,Nr=32,ve=42,yi=57,qt=69,Qt=73,ei=91,ti=103,ce=113,ze=666,D=1,Ne=2,ue=3,We=4,Wr=3,fe=(e,i)=>(e.msg=he[i],i),Di=e=>e*2-(e>4?9:0),J=e=>{let i=e.length;for(;--i>=0;)e[i]=0},Rr=e=>{let i,t,n,a=e.w_size;i=e.hash_size,n=i;do t=e.head[--n],e.head[n]=t>=a?t-a:0;while(--i);i=a,n=i;do t=e.prev[--n],e.prev[n]=t>=a?t-a:0;while(--i)};let zr=(e,i,t)=>(i<<e.hash_shift^t)&e.hash_mask,te=zr;const I=e=>{const i=e.state;let t=i.pending;t>e.avail_out&&(t=e.avail_out),t!==0&&(e.output.set(i.pending_buf.subarray(i.pending_out,i.pending_out+t),e.next_out),e.next_out+=t,i.pending_out+=t,e.total_out+=t,e.avail_out-=t,i.pending-=t,i.pending===0&&(i.pending_out=0))},O=(e,i)=>{lr(e,e.block_start>=0?e.block_start:-1,e.strstart-e.block_start,i),e.block_start=e.strstart,I(e.strm)},A=(e,i)=>{e.pending_buf[e.pending++]=i},Re=(e,i)=>{e.pending_buf[e.pending++]=i>>>8&255,e.pending_buf[e.pending++]=i&255},ii=(e,i,t,n)=>{let a=e.avail_in;return a>n&&(a=n),a===0?0:(e.avail_in-=a,i.set(e.input.subarray(e.next_in,e.next_in+a),t),e.state.wrap===1?e.adler=Pe(e.adler,i,a,t):e.state.wrap===2&&(e.adler=T(e.adler,i,a,t)),e.next_in+=a,e.total_in+=a,a)},Hn=(e,i)=>{let t=e.max_chain_length,n=e.strstart,a,r,s=e.prev_length,l=e.nice_match;const h=e.strstart>e.w_size-F?e.strstart-(e.w_size-F):0,o=e.window,c=e.w_mask,p=e.prev,d=e.strstart+V;let f=o[n+s-1],_=o[n+s];e.prev_length>=e.good_match&&(t>>=2),l>e.lookahead&&(l=e.lookahead);do if(a=i,!(o[a+s]!==_||o[a+s-1]!==f||o[a]!==o[n]||o[++a]!==o[n+1])){n+=2,a++;do;while(o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&o[++n]===o[++a]&&n<d);if(r=V-(d-n),n=d-V,r>s){if(e.match_start=i,s=r,r>=l)break;f=o[n+s-1],_=o[n+s]}}while((i=p[i&c])>h&&--t!==0);return s<=e.lookahead?s:e.lookahead},Ee=e=>{const i=e.w_size;let t,n,a;do{if(n=e.window_size-e.lookahead-e.strstart,e.strstart>=i+(i-F)&&(e.window.set(e.window.subarray(i,i+i-n),0),e.match_start-=i,e.strstart-=i,e.block_start-=i,e.insert>e.strstart&&(e.insert=e.strstart),Rr(e),n+=i),e.strm.avail_in===0)break;if(t=ii(e.strm,e.window,e.strstart+e.lookahead,n),e.lookahead+=t,e.lookahead+e.insert>=v)for(a=e.strstart-e.insert,e.ins_h=e.window[a],e.ins_h=te(e,e.ins_h,e.window[a+1]);e.insert&&(e.ins_h=te(e,e.ins_h,e.window[a+v-1]),e.prev[a&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=a,a++,e.insert--,!(e.lookahead+e.insert<v)););}while(e.lookahead<F&&e.strm.avail_in!==0)},Mn=(e,i)=>{let t=e.pending_buf_size-5>e.w_size?e.w_size:e.pending_buf_size-5,n,a,r,s=0,l=e.strm.avail_in;do{if(n=65535,r=e.bi_valid+42>>3,e.strm.avail_out<r||(r=e.strm.avail_out-r,a=e.strstart-e.block_start,n>a+e.strm.avail_in&&(n=a+e.strm.avail_in),n>r&&(n=r),n<t&&(n===0&&i!==H||i===ee||n!==a+e.strm.avail_in)))break;s=i===H&&n===a+e.strm.avail_in?1:0,Jt(e,0,0,s),e.pending_buf[e.pending-4]=n,e.pending_buf[e.pending-3]=n>>8,e.pending_buf[e.pending-2]=~n,e.pending_buf[e.pending-1]=~n>>8,I(e.strm),a&&(a>n&&(a=n),e.strm.output.set(e.window.subarray(e.block_start,e.block_start+a),e.strm.next_out),e.strm.next_out+=a,e.strm.avail_out-=a,e.strm.total_out+=a,e.block_start+=a,n-=a),n&&(ii(e.strm,e.strm.output,e.strm.next_out,n),e.strm.next_out+=n,e.strm.avail_out-=n,e.strm.total_out+=n)}while(s===0);return l-=e.strm.avail_in,l&&(l>=e.w_size?(e.matches=2,e.window.set(e.strm.input.subarray(e.strm.next_in-e.w_size,e.strm.next_in),0),e.strstart=e.w_size,e.insert=e.strstart):(e.window_size-e.strstart<=l&&(e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,e.insert>e.strstart&&(e.insert=e.strstart)),e.window.set(e.strm.input.subarray(e.strm.next_in-l,e.strm.next_in),e.strstart),e.strstart+=l,e.insert+=l>e.w_size-e.insert?e.w_size-e.insert:l),e.block_start=e.strstart),e.high_water<e.strstart&&(e.high_water=e.strstart),s?We:i!==ee&&i!==H&&e.strm.avail_in===0&&e.strstart===e.block_start?Ne:(r=e.window_size-e.strstart,e.strm.avail_in>r&&e.block_start>=e.w_size&&(e.block_start-=e.w_size,e.strstart-=e.w_size,e.window.set(e.window.subarray(e.w_size,e.w_size+e.strstart),0),e.matches<2&&e.matches++,r+=e.w_size,e.insert>e.strstart&&(e.insert=e.strstart)),r>e.strm.avail_in&&(r=e.strm.avail_in),r&&(ii(e.strm,e.window,e.strstart,r),e.strstart+=r,e.insert+=r>e.w_size-e.insert?e.w_size-e.insert:r),e.high_water<e.strstart&&(e.high_water=e.strstart),r=e.bi_valid+42>>3,r=e.pending_buf_size-r>65535?65535:e.pending_buf_size-r,t=r>e.w_size?e.w_size:r,a=e.strstart-e.block_start,(a>=t||(a||i===H)&&i!==ee&&e.strm.avail_in===0&&a<=r)&&(n=a>r?r:a,s=i===H&&e.strm.avail_in===0&&n===a?1:0,Jt(e,e.block_start,n,s),e.block_start+=n,I(e.strm)),s?ue:D)},Ot=(e,i)=>{let t,n;for(;;){if(e.lookahead<F){if(Ee(e),e.lookahead<F&&i===ee)return D;if(e.lookahead===0)break}if(t=0,e.lookahead>=v&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),t!==0&&e.strstart-t<=e.w_size-F&&(e.match_length=Hn(e,t)),e.match_length>=v)if(n=Q(e,e.strstart-e.match_start,e.match_length-v),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=v){e.match_length--;do e.strstart++,e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart;while(--e.match_length!==0);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=te(e,e.ins_h,e.window[e.strstart+1]);else n=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(n&&(O(e,!1),e.strm.avail_out===0))return D}return e.insert=e.strstart<v-1?e.strstart:v-1,i===H?(O(e,!0),e.strm.avail_out===0?ue:We):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?D:Ne},be=(e,i)=>{let t,n,a;for(;;){if(e.lookahead<F){if(Ee(e),e.lookahead<F&&i===ee)return D;if(e.lookahead===0)break}if(t=0,e.lookahead>=v&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=v-1,t!==0&&e.prev_length<e.max_lazy_match&&e.strstart-t<=e.w_size-F&&(e.match_length=Hn(e,t),e.match_length<=5&&(e.strategy===ur||e.match_length===v&&e.strstart-e.match_start>4096)&&(e.match_length=v-1)),e.prev_length>=v&&e.match_length<=e.prev_length){a=e.strstart+e.lookahead-v,n=Q(e,e.strstart-1-e.prev_match,e.prev_length-v),e.lookahead-=e.prev_length-1,e.prev_length-=2;do++e.strstart<=a&&(e.ins_h=te(e,e.ins_h,e.window[e.strstart+v-1]),t=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart);while(--e.prev_length!==0);if(e.match_available=0,e.match_length=v-1,e.strstart++,n&&(O(e,!1),e.strm.avail_out===0))return D}else if(e.match_available){if(n=Q(e,0,e.window[e.strstart-1]),n&&O(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return D}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&(n=Q(e,0,e.window[e.strstart-1]),e.match_available=0),e.insert=e.strstart<v-1?e.strstart:v-1,i===H?(O(e,!0),e.strm.avail_out===0?ue:We):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?D:Ne},Lr=(e,i)=>{let t,n,a,r;const s=e.window;for(;;){if(e.lookahead<=V){if(Ee(e),e.lookahead<=V&&i===ee)return D;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=v&&e.strstart>0&&(a=e.strstart-1,n=s[a],n===s[++a]&&n===s[++a]&&n===s[++a])){r=e.strstart+V;do;while(n===s[++a]&&n===s[++a]&&n===s[++a]&&n===s[++a]&&n===s[++a]&&n===s[++a]&&n===s[++a]&&n===s[++a]&&a<r);e.match_length=V-(r-a),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=v?(t=Q(e,1,e.match_length-v),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(t=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),t&&(O(e,!1),e.strm.avail_out===0))return D}return e.insert=0,i===H?(O(e,!0),e.strm.avail_out===0?ue:We):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?D:Ne},Tr=(e,i)=>{let t;for(;;){if(e.lookahead===0&&(Ee(e),e.lookahead===0)){if(i===ee)return D;break}if(e.match_length=0,t=Q(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,t&&(O(e,!1),e.strm.avail_out===0))return D}return e.insert=0,i===H?(O(e,!0),e.strm.avail_out===0?ue:We):e.sym_next&&(O(e,!1),e.strm.avail_out===0)?D:Ne};function Z(e,i,t,n,a){this.good_length=e,this.max_lazy=i,this.nice_length=t,this.max_chain=n,this.func=a}const Le=[new Z(0,0,0,0,Mn),new Z(4,4,8,4,Ot),new Z(4,5,16,8,Ot),new Z(4,6,32,32,Ot),new Z(4,4,16,16,be),new Z(8,16,32,32,be),new Z(8,16,128,128,be),new Z(8,32,128,256,be),new Z(32,128,258,1024,be),new Z(32,258,258,4096,be)],Cr=e=>{e.window_size=2*e.w_size,J(e.head),e.max_lazy_match=Le[e.level].max_lazy,e.good_match=Le[e.level].good_length,e.nice_match=Le[e.level].nice_length,e.max_chain_length=Le[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=v-1,e.match_available=0,e.ins_h=0};function Dr(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=At,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new Uint16Array(kr*2),this.dyn_dtree=new Uint16Array((2*Er+1)*2),this.bl_tree=new Uint16Array((2*Sr+1)*2),J(this.dyn_ltree),J(this.dyn_dtree),J(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new Uint16Array(Ar+1),this.heap=new Uint16Array(2*Vt+1),J(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new Uint16Array(2*Vt+1),J(this.depth),this.sym_buf=0,this.lit_bufsize=0,this.sym_next=0,this.sym_end=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}const je=e=>{if(!e)return 1;const i=e.state;return!i||i.strm!==e||i.status!==ve&&i.status!==yi&&i.status!==qt&&i.status!==Qt&&i.status!==ei&&i.status!==ti&&i.status!==ce&&i.status!==ze?1:0},Un=e=>{if(je(e))return fe(e,G);e.total_in=e.total_out=0,e.data_type=wr;const i=e.state;return i.pending=0,i.pending_out=0,i.wrap<0&&(i.wrap=-i.wrap),i.status=i.wrap===2?yi:i.wrap?ve:ce,e.adler=i.wrap===2?0:1,i.last_flush=-2,or(i),C},Pn=e=>{const i=Un(e);return i===C&&Cr(e.state),i},Br=(e,i)=>je(e)||e.state.wrap!==2?G:(e.state.gzhead=i,C),Zn=(e,i,t,n,a,r)=>{if(!e)return G;let s=1;if(i===hr&&(i=6),n<0?(s=0,n=-n):n>15&&(s=2,n-=16),a<1||a>br||t!==At||n<8||n>15||i<0||i>9||r<0||r>gr||n===8&&s!==1)return fe(e,G);n===8&&(n=9);const l=new Dr;return e.state=l,l.strm=e,l.status=ve,l.wrap=s,l.gzhead=null,l.w_bits=n,l.w_size=1<<l.w_bits,l.w_mask=l.w_size-1,l.hash_bits=a+7,l.hash_size=1<<l.hash_bits,l.hash_mask=l.hash_size-1,l.hash_shift=~~((l.hash_bits+v-1)/v),l.window=new Uint8Array(l.w_size*2),l.head=new Uint16Array(l.hash_size),l.prev=new Uint16Array(l.w_size),l.lit_bufsize=1<<a+6,l.pending_buf_size=l.lit_bufsize*4,l.pending_buf=new Uint8Array(l.pending_buf_size),l.sym_buf=l.lit_bufsize,l.sym_end=(l.lit_bufsize-1)*3,l.level=i,l.strategy=r,l.method=t,Pn(e)},Ir=(e,i)=>Zn(e,i,At,mr,yr,pr),Or=(e,i)=>{if(je(e)||i>Ti||i<0)return e?fe(e,G):G;const t=e.state;if(!e.output||e.avail_in!==0&&!e.input||t.status===ze&&i!==H)return fe(e,e.avail_out===0?It:G);const n=t.last_flush;if(t.last_flush=i,t.pending!==0){if(I(e),e.avail_out===0)return t.last_flush=-1,C}else if(e.avail_in===0&&Di(i)<=Di(n)&&i!==H)return fe(e,It);if(t.status===ze&&e.avail_in!==0)return fe(e,It);if(t.status===ve&&t.wrap===0&&(t.status=ce),t.status===ve){let a=At+(t.w_bits-8<<4)<<8,r=-1;if(t.strategy>=rt||t.level<2?r=0:t.level<6?r=1:t.level===6?r=2:r=3,a|=r<<6,t.strstart!==0&&(a|=Nr),a+=31-a%31,Re(t,a),t.strstart!==0&&(Re(t,e.adler>>>16),Re(t,e.adler&65535)),e.adler=1,t.status=ce,I(e),t.pending!==0)return t.last_flush=-1,C}if(t.status===yi){if(e.adler=0,A(t,31),A(t,139),A(t,8),t.gzhead)A(t,(t.gzhead.text?1:0)+(t.gzhead.hcrc?2:0)+(t.gzhead.extra?4:0)+(t.gzhead.name?8:0)+(t.gzhead.comment?16:0)),A(t,t.gzhead.time&255),A(t,t.gzhead.time>>8&255),A(t,t.gzhead.time>>16&255),A(t,t.gzhead.time>>24&255),A(t,t.level===9?2:t.strategy>=rt||t.level<2?4:0),A(t,t.gzhead.os&255),t.gzhead.extra&&t.gzhead.extra.length&&(A(t,t.gzhead.extra.length&255),A(t,t.gzhead.extra.length>>8&255)),t.gzhead.hcrc&&(e.adler=T(e.adler,t.pending_buf,t.pending,0)),t.gzindex=0,t.status=qt;else if(A(t,0),A(t,0),A(t,0),A(t,0),A(t,0),A(t,t.level===9?2:t.strategy>=rt||t.level<2?4:0),A(t,Wr),t.status=ce,I(e),t.pending!==0)return t.last_flush=-1,C}if(t.status===qt){if(t.gzhead.extra){let a=t.pending,r=(t.gzhead.extra.length&65535)-t.gzindex;for(;t.pending+r>t.pending_buf_size;){let l=t.pending_buf_size-t.pending;if(t.pending_buf.set(t.gzhead.extra.subarray(t.gzindex,t.gzindex+l),t.pending),t.pending=t.pending_buf_size,t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex+=l,I(e),t.pending!==0)return t.last_flush=-1,C;a=0,r-=l}let s=new Uint8Array(t.gzhead.extra);t.pending_buf.set(s.subarray(t.gzindex,t.gzindex+r),t.pending),t.pending+=r,t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=Qt}if(t.status===Qt){if(t.gzhead.name){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a)),I(e),t.pending!==0)return t.last_flush=-1,C;a=0}t.gzindex<t.gzhead.name.length?r=t.gzhead.name.charCodeAt(t.gzindex++)&255:r=0,A(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a)),t.gzindex=0}t.status=ei}if(t.status===ei){if(t.gzhead.comment){let a=t.pending,r;do{if(t.pending===t.pending_buf_size){if(t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a)),I(e),t.pending!==0)return t.last_flush=-1,C;a=0}t.gzindex<t.gzhead.comment.length?r=t.gzhead.comment.charCodeAt(t.gzindex++)&255:r=0,A(t,r)}while(r!==0);t.gzhead.hcrc&&t.pending>a&&(e.adler=T(e.adler,t.pending_buf,t.pending-a,a))}t.status=ti}if(t.status===ti){if(t.gzhead.hcrc){if(t.pending+2>t.pending_buf_size&&(I(e),t.pending!==0))return t.last_flush=-1,C;A(t,e.adler&255),A(t,e.adler>>8&255),e.adler=0}if(t.status=ce,I(e),t.pending!==0)return t.last_flush=-1,C}if(e.avail_in!==0||t.lookahead!==0||i!==ee&&t.status!==ze){let a=t.level===0?Mn(t,i):t.strategy===rt?Tr(t,i):t.strategy===_r?Lr(t,i):Le[t.level].func(t,i);if((a===ue||a===We)&&(t.status=ze),a===D||a===ue)return e.avail_out===0&&(t.last_flush=-1),C;if(a===Ne&&(i===cr?sr(t):i!==Ti&&(Jt(t,0,0,!1),i===fr&&(J(t.head),t.lookahead===0&&(t.strstart=0,t.block_start=0,t.insert=0))),I(e),e.avail_out===0))return t.last_flush=-1,C}return i!==H?C:t.wrap<=0?Ci:(t.wrap===2?(A(t,e.adler&255),A(t,e.adler>>8&255),A(t,e.adler>>16&255),A(t,e.adler>>24&255),A(t,e.total_in&255),A(t,e.total_in>>8&255),A(t,e.total_in>>16&255),A(t,e.total_in>>24&255)):(Re(t,e.adler>>>16),Re(t,e.adler&65535)),I(e),t.wrap>0&&(t.wrap=-t.wrap),t.pending!==0?C:Ci)},Hr=e=>{if(je(e))return G;const i=e.state.status;return e.state=null,i===ce?fe(e,dr):C},Mr=(e,i)=>{let t=i.length;if(je(e))return G;const n=e.state,a=n.wrap;if(a===2||a===1&&n.status!==ve||n.lookahead)return G;if(a===1&&(e.adler=Pe(e.adler,i,t,0)),n.wrap=0,t>=n.w_size){a===0&&(J(n.head),n.strstart=0,n.block_start=0,n.insert=0);let h=new Uint8Array(n.w_size);h.set(i.subarray(t-n.w_size,t),0),i=h,t=n.w_size}const r=e.avail_in,s=e.next_in,l=e.input;for(e.avail_in=t,e.next_in=0,e.input=i,Ee(n);n.lookahead>=v;){let h=n.strstart,o=n.lookahead-(v-1);do n.ins_h=te(n,n.ins_h,n.window[h+v-1]),n.prev[h&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=h,h++;while(--o);n.strstart=h,n.lookahead=v-1,Ee(n)}return n.strstart+=n.lookahead,n.block_start=n.strstart,n.insert=n.lookahead,n.lookahead=0,n.match_length=n.prev_length=v-1,n.match_available=0,e.next_in=s,e.input=l,e.avail_in=r,n.wrap=a,C};var Ur=Ir,Pr=Zn,Zr=Pn,$r=Un,Gr=Br,Fr=Or,Xr=Hr,Yr=Mr,jr="pako deflate (from Nodeca project)",Ce={deflateInit:Ur,deflateInit2:Pr,deflateReset:Zr,deflateResetKeep:$r,deflateSetHeader:Gr,deflate:Fr,deflateEnd:Xr,deflateSetDictionary:Yr,deflateInfo:jr};const Kr=(e,i)=>Object.prototype.hasOwnProperty.call(e,i);var Jr=function(e){const i=Array.prototype.slice.call(arguments,1);for(;i.length;){const t=i.shift();if(t){if(typeof t!="object")throw new TypeError(t+"must be non-object");for(const n in t)Kr(t,n)&&(e[n]=t[n])}}return e},Vr=e=>{let i=0;for(let n=0,a=e.length;n<a;n++)i+=e[n].length;const t=new Uint8Array(i);for(let n=0,a=0,r=e.length;n<r;n++){let s=e[n];t.set(s,a),a+=s.length}return t},Nt={assign:Jr,flattenChunks:Vr};let $n=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{$n=!1}const Ze=new Uint8Array(256);for(let e=0;e<256;e++)Ze[e]=e>=252?6:e>=248?5:e>=240?4:e>=224?3:e>=192?2:1;Ze[254]=Ze[254]=1;var qr=e=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(e);let i,t,n,a,r,s=e.length,l=0;for(a=0;a<s;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<s&&(n=e.charCodeAt(a+1),(n&64512)===56320&&(t=65536+(t-55296<<10)+(n-56320),a++)),l+=t<128?1:t<2048?2:t<65536?3:4;for(i=new Uint8Array(l),r=0,a=0;r<l;a++)t=e.charCodeAt(a),(t&64512)===55296&&a+1<s&&(n=e.charCodeAt(a+1),(n&64512)===56320&&(t=65536+(t-55296<<10)+(n-56320),a++)),t<128?i[r++]=t:t<2048?(i[r++]=192|t>>>6,i[r++]=128|t&63):t<65536?(i[r++]=224|t>>>12,i[r++]=128|t>>>6&63,i[r++]=128|t&63):(i[r++]=240|t>>>18,i[r++]=128|t>>>12&63,i[r++]=128|t>>>6&63,i[r++]=128|t&63);return i};const Qr=(e,i)=>{if(i<65534&&e.subarray&&$n)return String.fromCharCode.apply(null,e.length===i?e:e.subarray(0,i));let t="";for(let n=0;n<i;n++)t+=String.fromCharCode(e[n]);return t};var eo=(e,i)=>{const t=i||e.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(e.subarray(0,i));let n,a;const r=new Array(t*2);for(a=0,n=0;n<t;){let s=e[n++];if(s<128){r[a++]=s;continue}let l=Ze[s];if(l>4){r[a++]=65533,n+=l-1;continue}for(s&=l===2?31:l===3?15:7;l>1&&n<t;)s=s<<6|e[n++]&63,l--;if(l>1){r[a++]=65533;continue}s<65536?r[a++]=s:(s-=65536,r[a++]=55296|s>>10&1023,r[a++]=56320|s&1023)}return Qr(r,a)},to=(e,i)=>{i=i||e.length,i>e.length&&(i=e.length);let t=i-1;for(;t>=0&&(e[t]&192)===128;)t--;return t<0||t===0?i:t+Ze[e[t]]>i?t:i},$e={string2buf:qr,buf2string:eo,utf8border:to};function io(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0}var Gn=io;const Fn=Object.prototype.toString,{Z_NO_FLUSH:no,Z_SYNC_FLUSH:ao,Z_FULL_FLUSH:ro,Z_FINISH:oo,Z_OK:bt,Z_STREAM_END:lo,Z_DEFAULT_COMPRESSION:so,Z_DEFAULT_STRATEGY:co,Z_DEFLATED:fo}=Ye;function Ke(e){this.options=Nt.assign({level:so,method:fo,chunkSize:16384,windowBits:15,memLevel:8,strategy:co},e||{});let i=this.options;i.raw&&i.windowBits>0?i.windowBits=-i.windowBits:i.gzip&&i.windowBits>0&&i.windowBits<16&&(i.windowBits+=16),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Gn,this.strm.avail_out=0;let t=Ce.deflateInit2(this.strm,i.level,i.method,i.windowBits,i.memLevel,i.strategy);if(t!==bt)throw new Error(he[t]);if(i.header&&Ce.deflateSetHeader(this.strm,i.header),i.dictionary){let n;if(typeof i.dictionary=="string"?n=$e.string2buf(i.dictionary):Fn.call(i.dictionary)==="[object ArrayBuffer]"?n=new Uint8Array(i.dictionary):n=i.dictionary,t=Ce.deflateSetDictionary(this.strm,n),t!==bt)throw new Error(he[t]);this._dict_set=!0}}Ke.prototype.push=function(e,i){const t=this.strm,n=this.options.chunkSize;let a,r;if(this.ended)return!1;for(i===~~i?r=i:r=i===!0?oo:no,typeof e=="string"?t.input=$e.string2buf(e):Fn.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){if(t.avail_out===0&&(t.output=new Uint8Array(n),t.next_out=0,t.avail_out=n),(r===ao||r===ro)&&t.avail_out<=6){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(a=Ce.deflate(t,r),a===lo)return t.next_out>0&&this.onData(t.output.subarray(0,t.next_out)),a=Ce.deflateEnd(this.strm),this.onEnd(a),this.ended=!0,a===bt;if(t.avail_out===0){this.onData(t.output);continue}if(r>0&&t.next_out>0){this.onData(t.output.subarray(0,t.next_out)),t.avail_out=0;continue}if(t.avail_in===0)break}return!0};Ke.prototype.onData=function(e){this.chunks.push(e)};Ke.prototype.onEnd=function(e){e===bt&&(this.result=Nt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function xi(e,i){const t=new Ke(i);if(t.push(e,!0),t.err)throw t.msg||he[t.err];return t.result}function ho(e,i){return i=i||{},i.raw=!0,xi(e,i)}function uo(e,i){return i=i||{},i.gzip=!0,xi(e,i)}var _o=Ke,go=xi,po=ho,wo=uo,bo={Deflate:_o,deflate:go,deflateRaw:po,gzip:wo};const ot=16209,mo=16191;var yo=function(i,t){let n,a,r,s,l,h,o,c,p,d,f,_,z,E,m,N,y,u,k,L,g,W,S,w;const x=i.state;n=i.next_in,S=i.input,a=n+(i.avail_in-5),r=i.next_out,w=i.output,s=r-(t-i.avail_out),l=r+(i.avail_out-257),h=x.dmax,o=x.wsize,c=x.whave,p=x.wnext,d=x.window,f=x.hold,_=x.bits,z=x.lencode,E=x.distcode,m=(1<<x.lenbits)-1,N=(1<<x.distbits)-1;e:do{_<15&&(f+=S[n++]<<_,_+=8,f+=S[n++]<<_,_+=8),y=z[f&m];t:for(;;){if(u=y>>>24,f>>>=u,_-=u,u=y>>>16&255,u===0)w[r++]=y&65535;else if(u&16){k=y&65535,u&=15,u&&(_<u&&(f+=S[n++]<<_,_+=8),k+=f&(1<<u)-1,f>>>=u,_-=u),_<15&&(f+=S[n++]<<_,_+=8,f+=S[n++]<<_,_+=8),y=E[f&N];i:for(;;){if(u=y>>>24,f>>>=u,_-=u,u=y>>>16&255,u&16){if(L=y&65535,u&=15,_<u&&(f+=S[n++]<<_,_+=8,_<u&&(f+=S[n++]<<_,_+=8)),L+=f&(1<<u)-1,L>h){i.msg="invalid distance too far back",x.mode=ot;break e}if(f>>>=u,_-=u,u=r-s,L>u){if(u=L-u,u>c&&x.sane){i.msg="invalid distance too far back",x.mode=ot;break e}if(g=0,W=d,p===0){if(g+=o-u,u<k){k-=u;do w[r++]=d[g++];while(--u);g=r-L,W=w}}else if(p<u){if(g+=o+p-u,u-=p,u<k){k-=u;do w[r++]=d[g++];while(--u);if(g=0,p<k){u=p,k-=u;do w[r++]=d[g++];while(--u);g=r-L,W=w}}}else if(g+=p-u,u<k){k-=u;do w[r++]=d[g++];while(--u);g=r-L,W=w}for(;k>2;)w[r++]=W[g++],w[r++]=W[g++],w[r++]=W[g++],k-=3;k&&(w[r++]=W[g++],k>1&&(w[r++]=W[g++]))}else{g=r-L;do w[r++]=w[g++],w[r++]=w[g++],w[r++]=w[g++],k-=3;while(k>2);k&&(w[r++]=w[g++],k>1&&(w[r++]=w[g++]))}}else if(u&64){i.msg="invalid distance code",x.mode=ot;break e}else{y=E[(y&65535)+(f&(1<<u)-1)];continue i}break}}else if(u&64)if(u&32){x.mode=mo;break e}else{i.msg="invalid literal/length code",x.mode=ot;break e}else{y=z[(y&65535)+(f&(1<<u)-1)];continue t}break}}while(n<a&&r<l);k=_>>3,n-=k,_-=k<<3,f&=(1<<_)-1,i.next_in=n,i.next_out=r,i.avail_in=n<a?5+(a-n):5-(n-a),i.avail_out=r<l?257+(l-r):257-(r-l),x.hold=f,x.bits=_};const me=15,Bi=852,Ii=592,Oi=0,Ht=1,Hi=2,xo=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),vo=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),Eo=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),So=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]),ko=(e,i,t,n,a,r,s,l)=>{const h=l.bits;let o=0,c=0,p=0,d=0,f=0,_=0,z=0,E=0,m=0,N=0,y,u,k,L,g,W=null,S;const w=new Uint16Array(me+1),x=new Uint16Array(me+1);let oe=null,Ei,it,nt;for(o=0;o<=me;o++)w[o]=0;for(c=0;c<n;c++)w[i[t+c]]++;for(f=h,d=me;d>=1&&w[d]===0;d--);if(f>d&&(f=d),d===0)return a[r++]=1<<24|64<<16|0,a[r++]=1<<24|64<<16|0,l.bits=1,0;for(p=1;p<d&&w[p]===0;p++);for(f<p&&(f=p),E=1,o=1;o<=me;o++)if(E<<=1,E-=w[o],E<0)return-1;if(E>0&&(e===Oi||d!==1))return-1;for(x[1]=0,o=1;o<me;o++)x[o+1]=x[o]+w[o];for(c=0;c<n;c++)i[t+c]!==0&&(s[x[i[t+c]]++]=c);if(e===Oi?(W=oe=s,S=20):e===Ht?(W=xo,oe=vo,S=257):(W=Eo,oe=So,S=0),N=0,c=0,o=p,g=r,_=f,z=0,k=-1,m=1<<f,L=m-1,e===Ht&&m>Bi||e===Hi&&m>Ii)return 1;for(;;){Ei=o-z,s[c]+1<S?(it=0,nt=s[c]):s[c]>=S?(it=oe[s[c]-S],nt=W[s[c]-S]):(it=96,nt=0),y=1<<o-z,u=1<<_,p=u;do u-=y,a[g+(N>>z)+u]=Ei<<24|it<<16|nt|0;while(u!==0);for(y=1<<o-1;N&y;)y>>=1;if(y!==0?(N&=y-1,N+=y):N=0,c++,--w[o]===0){if(o===d)break;o=i[t+s[c]]}if(o>f&&(N&L)!==k){for(z===0&&(z=f),g+=p,_=o-z,E=1<<_;_+z<d&&(E-=w[_+z],!(E<=0));)_++,E<<=1;if(m+=1<<_,e===Ht&&m>Bi||e===Hi&&m>Ii)return 1;k=N&L,a[k]=f<<24|_<<16|g-r|0}}return N!==0&&(a[g+N]=o-z<<24|64<<16|0),l.bits=f,0};var De=ko;const Ao=0,Xn=1,Yn=2,{Z_FINISH:Mi,Z_BLOCK:No,Z_TREES:lt,Z_OK:_e,Z_STREAM_END:Wo,Z_NEED_DICT:Ro,Z_STREAM_ERROR:U,Z_DATA_ERROR:jn,Z_MEM_ERROR:Kn,Z_BUF_ERROR:zo,Z_DEFLATED:Ui}=Ye,Wt=16180,Pi=16181,Zi=16182,$i=16183,Gi=16184,Fi=16185,Xi=16186,Yi=16187,ji=16188,Ki=16189,mt=16190,X=16191,Mt=16192,Ji=16193,Ut=16194,Vi=16195,qi=16196,Qi=16197,en=16198,st=16199,ct=16200,tn=16201,nn=16202,an=16203,rn=16204,on=16205,Pt=16206,ln=16207,sn=16208,R=16209,Jn=16210,Vn=16211,Lo=852,To=592,Co=15,Do=Co,cn=e=>(e>>>24&255)+(e>>>8&65280)+((e&65280)<<8)+((e&255)<<24);function Bo(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const we=e=>{if(!e)return 1;const i=e.state;return!i||i.strm!==e||i.mode<Wt||i.mode>Vn?1:0},qn=e=>{if(we(e))return U;const i=e.state;return e.total_in=e.total_out=i.total=0,e.msg="",i.wrap&&(e.adler=i.wrap&1),i.mode=Wt,i.last=0,i.havedict=0,i.flags=-1,i.dmax=32768,i.head=null,i.hold=0,i.bits=0,i.lencode=i.lendyn=new Int32Array(Lo),i.distcode=i.distdyn=new Int32Array(To),i.sane=1,i.back=-1,_e},Qn=e=>{if(we(e))return U;const i=e.state;return i.wsize=0,i.whave=0,i.wnext=0,qn(e)},ea=(e,i)=>{let t;if(we(e))return U;const n=e.state;return i<0?(t=0,i=-i):(t=(i>>4)+5,i<48&&(i&=15)),i&&(i<8||i>15)?U:(n.window!==null&&n.wbits!==i&&(n.window=null),n.wrap=t,n.wbits=i,Qn(e))},ta=(e,i)=>{if(!e)return U;const t=new Bo;e.state=t,t.strm=e,t.window=null,t.mode=Wt;const n=ea(e,i);return n!==_e&&(e.state=null),n},Io=e=>ta(e,Do);let fn=!0,Zt,$t;const Oo=e=>{if(fn){Zt=new Int32Array(512),$t=new Int32Array(32);let i=0;for(;i<144;)e.lens[i++]=8;for(;i<256;)e.lens[i++]=9;for(;i<280;)e.lens[i++]=7;for(;i<288;)e.lens[i++]=8;for(De(Xn,e.lens,0,288,Zt,0,e.work,{bits:9}),i=0;i<32;)e.lens[i++]=5;De(Yn,e.lens,0,32,$t,0,e.work,{bits:5}),fn=!1}e.lencode=Zt,e.lenbits=9,e.distcode=$t,e.distbits=5},ia=(e,i,t,n)=>{let a;const r=e.state;return r.window===null&&(r.wsize=1<<r.wbits,r.wnext=0,r.whave=0,r.window=new Uint8Array(r.wsize)),n>=r.wsize?(r.window.set(i.subarray(t-r.wsize,t),0),r.wnext=0,r.whave=r.wsize):(a=r.wsize-r.wnext,a>n&&(a=n),r.window.set(i.subarray(t-n,t-n+a),r.wnext),n-=a,n?(r.window.set(i.subarray(t-n,t),0),r.wnext=n,r.whave=r.wsize):(r.wnext+=a,r.wnext===r.wsize&&(r.wnext=0),r.whave<r.wsize&&(r.whave+=a))),0},Ho=(e,i)=>{let t,n,a,r,s,l,h,o,c,p,d,f,_,z,E=0,m,N,y,u,k,L,g,W;const S=new Uint8Array(4);let w,x;const oe=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(we(e)||!e.output||!e.input&&e.avail_in!==0)return U;t=e.state,t.mode===X&&(t.mode=Mt),s=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,n=e.input,l=e.avail_in,o=t.hold,c=t.bits,p=l,d=h,W=_e;e:for(;;)switch(t.mode){case Wt:if(t.wrap===0){t.mode=Mt;break}for(;c<16;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(t.wrap&2&&o===35615){t.wbits===0&&(t.wbits=15),t.check=0,S[0]=o&255,S[1]=o>>>8&255,t.check=T(t.check,S,2,0),o=0,c=0,t.mode=Pi;break}if(t.head&&(t.head.done=!1),!(t.wrap&1)||(((o&255)<<8)+(o>>8))%31){e.msg="incorrect header check",t.mode=R;break}if((o&15)!==Ui){e.msg="unknown compression method",t.mode=R;break}if(o>>>=4,c-=4,g=(o&15)+8,t.wbits===0&&(t.wbits=g),g>15||g>t.wbits){e.msg="invalid window size",t.mode=R;break}t.dmax=1<<t.wbits,t.flags=0,e.adler=t.check=1,t.mode=o&512?Ki:X,o=0,c=0;break;case Pi:for(;c<16;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(t.flags=o,(t.flags&255)!==Ui){e.msg="unknown compression method",t.mode=R;break}if(t.flags&57344){e.msg="unknown header flags set",t.mode=R;break}t.head&&(t.head.text=o>>8&1),t.flags&512&&t.wrap&4&&(S[0]=o&255,S[1]=o>>>8&255,t.check=T(t.check,S,2,0)),o=0,c=0,t.mode=Zi;case Zi:for(;c<32;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.head&&(t.head.time=o),t.flags&512&&t.wrap&4&&(S[0]=o&255,S[1]=o>>>8&255,S[2]=o>>>16&255,S[3]=o>>>24&255,t.check=T(t.check,S,4,0)),o=0,c=0,t.mode=$i;case $i:for(;c<16;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.head&&(t.head.xflags=o&255,t.head.os=o>>8),t.flags&512&&t.wrap&4&&(S[0]=o&255,S[1]=o>>>8&255,t.check=T(t.check,S,2,0)),o=0,c=0,t.mode=Gi;case Gi:if(t.flags&1024){for(;c<16;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.length=o,t.head&&(t.head.extra_len=o),t.flags&512&&t.wrap&4&&(S[0]=o&255,S[1]=o>>>8&255,t.check=T(t.check,S,2,0)),o=0,c=0}else t.head&&(t.head.extra=null);t.mode=Fi;case Fi:if(t.flags&1024&&(f=t.length,f>l&&(f=l),f&&(t.head&&(g=t.head.extra_len-t.length,t.head.extra||(t.head.extra=new Uint8Array(t.head.extra_len)),t.head.extra.set(n.subarray(r,r+f),g)),t.flags&512&&t.wrap&4&&(t.check=T(t.check,n,f,r)),l-=f,r+=f,t.length-=f),t.length))break e;t.length=0,t.mode=Xi;case Xi:if(t.flags&2048){if(l===0)break e;f=0;do g=n[r+f++],t.head&&g&&t.length<65536&&(t.head.name+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=T(t.check,n,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.name=null);t.length=0,t.mode=Yi;case Yi:if(t.flags&4096){if(l===0)break e;f=0;do g=n[r+f++],t.head&&g&&t.length<65536&&(t.head.comment+=String.fromCharCode(g));while(g&&f<l);if(t.flags&512&&t.wrap&4&&(t.check=T(t.check,n,f,r)),l-=f,r+=f,g)break e}else t.head&&(t.head.comment=null);t.mode=ji;case ji:if(t.flags&512){for(;c<16;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(t.wrap&4&&o!==(t.check&65535)){e.msg="header crc mismatch",t.mode=R;break}o=0,c=0}t.head&&(t.head.hcrc=t.flags>>9&1,t.head.done=!0),e.adler=t.check=0,t.mode=X;break;case Ki:for(;c<32;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}e.adler=t.check=cn(o),o=0,c=0,t.mode=mt;case mt:if(t.havedict===0)return e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,Ro;e.adler=t.check=1,t.mode=X;case X:if(i===No||i===lt)break e;case Mt:if(t.last){o>>>=c&7,c-=c&7,t.mode=Pt;break}for(;c<3;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}switch(t.last=o&1,o>>>=1,c-=1,o&3){case 0:t.mode=Ji;break;case 1:if(Oo(t),t.mode=st,i===lt){o>>>=2,c-=2;break e}break;case 2:t.mode=qi;break;case 3:e.msg="invalid block type",t.mode=R}o>>>=2,c-=2;break;case Ji:for(o>>>=c&7,c-=c&7;c<32;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if((o&65535)!==(o>>>16^65535)){e.msg="invalid stored block lengths",t.mode=R;break}if(t.length=o&65535,o=0,c=0,t.mode=Ut,i===lt)break e;case Ut:t.mode=Vi;case Vi:if(f=t.length,f){if(f>l&&(f=l),f>h&&(f=h),f===0)break e;a.set(n.subarray(r,r+f),s),l-=f,r+=f,h-=f,s+=f,t.length-=f;break}t.mode=X;break;case qi:for(;c<14;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(t.nlen=(o&31)+257,o>>>=5,c-=5,t.ndist=(o&31)+1,o>>>=5,c-=5,t.ncode=(o&15)+4,o>>>=4,c-=4,t.nlen>286||t.ndist>30){e.msg="too many length or distance symbols",t.mode=R;break}t.have=0,t.mode=Qi;case Qi:for(;t.have<t.ncode;){for(;c<3;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.lens[oe[t.have++]]=o&7,o>>>=3,c-=3}for(;t.have<19;)t.lens[oe[t.have++]]=0;if(t.lencode=t.lendyn,t.lenbits=7,w={bits:t.lenbits},W=De(Ao,t.lens,0,19,t.lencode,0,t.work,w),t.lenbits=w.bits,W){e.msg="invalid code lengths set",t.mode=R;break}t.have=0,t.mode=en;case en:for(;t.have<t.nlen+t.ndist;){for(;E=t.lencode[o&(1<<t.lenbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(y<16)o>>>=m,c-=m,t.lens[t.have++]=y;else{if(y===16){for(x=m+2;c<x;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(o>>>=m,c-=m,t.have===0){e.msg="invalid bit length repeat",t.mode=R;break}g=t.lens[t.have-1],f=3+(o&3),o>>>=2,c-=2}else if(y===17){for(x=m+3;c<x;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}o>>>=m,c-=m,g=0,f=3+(o&7),o>>>=3,c-=3}else{for(x=m+7;c<x;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}o>>>=m,c-=m,g=0,f=11+(o&127),o>>>=7,c-=7}if(t.have+f>t.nlen+t.ndist){e.msg="invalid bit length repeat",t.mode=R;break}for(;f--;)t.lens[t.have++]=g}}if(t.mode===R)break;if(t.lens[256]===0){e.msg="invalid code -- missing end-of-block",t.mode=R;break}if(t.lenbits=9,w={bits:t.lenbits},W=De(Xn,t.lens,0,t.nlen,t.lencode,0,t.work,w),t.lenbits=w.bits,W){e.msg="invalid literal/lengths set",t.mode=R;break}if(t.distbits=6,t.distcode=t.distdyn,w={bits:t.distbits},W=De(Yn,t.lens,t.nlen,t.ndist,t.distcode,0,t.work,w),t.distbits=w.bits,W){e.msg="invalid distances set",t.mode=R;break}if(t.mode=st,i===lt)break e;case st:t.mode=ct;case ct:if(l>=6&&h>=258){e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,yo(e,d),s=e.next_out,a=e.output,h=e.avail_out,r=e.next_in,n=e.input,l=e.avail_in,o=t.hold,c=t.bits,t.mode===X&&(t.back=-1);break}for(t.back=0;E=t.lencode[o&(1<<t.lenbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(N&&!(N&240)){for(u=m,k=N,L=y;E=t.lencode[L+((o&(1<<u+k)-1)>>u)],m=E>>>24,N=E>>>16&255,y=E&65535,!(u+m<=c);){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}o>>>=u,c-=u,t.back+=u}if(o>>>=m,c-=m,t.back+=m,t.length=y,N===0){t.mode=on;break}if(N&32){t.back=-1,t.mode=X;break}if(N&64){e.msg="invalid literal/length code",t.mode=R;break}t.extra=N&15,t.mode=tn;case tn:if(t.extra){for(x=t.extra;c<x;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.length+=o&(1<<t.extra)-1,o>>>=t.extra,c-=t.extra,t.back+=t.extra}t.was=t.length,t.mode=nn;case nn:for(;E=t.distcode[o&(1<<t.distbits)-1],m=E>>>24,N=E>>>16&255,y=E&65535,!(m<=c);){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(!(N&240)){for(u=m,k=N,L=y;E=t.distcode[L+((o&(1<<u+k)-1)>>u)],m=E>>>24,N=E>>>16&255,y=E&65535,!(u+m<=c);){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}o>>>=u,c-=u,t.back+=u}if(o>>>=m,c-=m,t.back+=m,N&64){e.msg="invalid distance code",t.mode=R;break}t.offset=y,t.extra=N&15,t.mode=an;case an:if(t.extra){for(x=t.extra;c<x;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}t.offset+=o&(1<<t.extra)-1,o>>>=t.extra,c-=t.extra,t.back+=t.extra}if(t.offset>t.dmax){e.msg="invalid distance too far back",t.mode=R;break}t.mode=rn;case rn:if(h===0)break e;if(f=d-h,t.offset>f){if(f=t.offset-f,f>t.whave&&t.sane){e.msg="invalid distance too far back",t.mode=R;break}f>t.wnext?(f-=t.wnext,_=t.wsize-f):_=t.wnext-f,f>t.length&&(f=t.length),z=t.window}else z=a,_=s-t.offset,f=t.length;f>h&&(f=h),h-=f,t.length-=f;do a[s++]=z[_++];while(--f);t.length===0&&(t.mode=ct);break;case on:if(h===0)break e;a[s++]=t.length,h--,t.mode=ct;break;case Pt:if(t.wrap){for(;c<32;){if(l===0)break e;l--,o|=n[r++]<<c,c+=8}if(d-=h,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?T(t.check,a,d,s-d):Pe(t.check,a,d,s-d)),d=h,t.wrap&4&&(t.flags?o:cn(o))!==t.check){e.msg="incorrect data check",t.mode=R;break}o=0,c=0}t.mode=ln;case ln:if(t.wrap&&t.flags){for(;c<32;){if(l===0)break e;l--,o+=n[r++]<<c,c+=8}if(t.wrap&4&&o!==(t.total&4294967295)){e.msg="incorrect length check",t.mode=R;break}o=0,c=0}t.mode=sn;case sn:W=Wo;break e;case R:W=jn;break e;case Jn:return Kn;case Vn:default:return U}return e.next_out=s,e.avail_out=h,e.next_in=r,e.avail_in=l,t.hold=o,t.bits=c,(t.wsize||d!==e.avail_out&&t.mode<R&&(t.mode<Pt||i!==Mi))&&ia(e,e.output,e.next_out,d-e.avail_out),p-=e.avail_in,d-=e.avail_out,e.total_in+=p,e.total_out+=d,t.total+=d,t.wrap&4&&d&&(e.adler=t.check=t.flags?T(t.check,a,d,e.next_out-d):Pe(t.check,a,d,e.next_out-d)),e.data_type=t.bits+(t.last?64:0)+(t.mode===X?128:0)+(t.mode===st||t.mode===Ut?256:0),(p===0&&d===0||i===Mi)&&W===_e&&(W=zo),W},Mo=e=>{if(we(e))return U;let i=e.state;return i.window&&(i.window=null),e.state=null,_e},Uo=(e,i)=>{if(we(e))return U;const t=e.state;return t.wrap&2?(t.head=i,i.done=!1,_e):U},Po=(e,i)=>{const t=i.length;let n,a,r;return we(e)||(n=e.state,n.wrap!==0&&n.mode!==mt)?U:n.mode===mt&&(a=1,a=Pe(a,i,t,0),a!==n.check)?jn:(r=ia(e,i,t,t),r?(n.mode=Jn,Kn):(n.havedict=1,_e))};var Zo=Qn,$o=ea,Go=qn,Fo=Io,Xo=ta,Yo=Ho,jo=Mo,Ko=Uo,Jo=Po,Vo="pako inflate (from Nodeca project)",j={inflateReset:Zo,inflateReset2:$o,inflateResetKeep:Go,inflateInit:Fo,inflateInit2:Xo,inflate:Yo,inflateEnd:jo,inflateGetHeader:Ko,inflateSetDictionary:Jo,inflateInfo:Vo};function qo(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1}var Qo=qo;const na=Object.prototype.toString,{Z_NO_FLUSH:el,Z_FINISH:tl,Z_OK:Ge,Z_STREAM_END:Gt,Z_NEED_DICT:Ft,Z_STREAM_ERROR:il,Z_DATA_ERROR:dn,Z_MEM_ERROR:nl}=Ye;function Je(e){this.options=Nt.assign({chunkSize:1024*64,windowBits:15,to:""},e||{});const i=this.options;i.raw&&i.windowBits>=0&&i.windowBits<16&&(i.windowBits=-i.windowBits,i.windowBits===0&&(i.windowBits=-15)),i.windowBits>=0&&i.windowBits<16&&!(e&&e.windowBits)&&(i.windowBits+=32),i.windowBits>15&&i.windowBits<48&&(i.windowBits&15||(i.windowBits|=15)),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Gn,this.strm.avail_out=0;let t=j.inflateInit2(this.strm,i.windowBits);if(t!==Ge)throw new Error(he[t]);if(this.header=new Qo,j.inflateGetHeader(this.strm,this.header),i.dictionary&&(typeof i.dictionary=="string"?i.dictionary=$e.string2buf(i.dictionary):na.call(i.dictionary)==="[object ArrayBuffer]"&&(i.dictionary=new Uint8Array(i.dictionary)),i.raw&&(t=j.inflateSetDictionary(this.strm,i.dictionary),t!==Ge)))throw new Error(he[t])}Je.prototype.push=function(e,i){const t=this.strm,n=this.options.chunkSize,a=this.options.dictionary;let r,s,l;if(this.ended)return!1;for(i===~~i?s=i:s=i===!0?tl:el,na.call(e)==="[object ArrayBuffer]"?t.input=new Uint8Array(e):t.input=e,t.next_in=0,t.avail_in=t.input.length;;){for(t.avail_out===0&&(t.output=new Uint8Array(n),t.next_out=0,t.avail_out=n),r=j.inflate(t,s),r===Ft&&a&&(r=j.inflateSetDictionary(t,a),r===Ge?r=j.inflate(t,s):r===dn&&(r=Ft));t.avail_in>0&&r===Gt&&t.state.wrap>0&&e[t.next_in]!==0;)j.inflateReset(t),r=j.inflate(t,s);switch(r){case il:case dn:case Ft:case nl:return this.onEnd(r),this.ended=!0,!1}if(l=t.avail_out,t.next_out&&(t.avail_out===0||r===Gt))if(this.options.to==="string"){let h=$e.utf8border(t.output,t.next_out),o=t.next_out-h,c=$e.buf2string(t.output,h);t.next_out=o,t.avail_out=n-o,o&&t.output.set(t.output.subarray(h,h+o),0),this.onData(c)}else this.onData(t.output.length===t.next_out?t.output:t.output.subarray(0,t.next_out));if(!(r===Ge&&l===0)){if(r===Gt)return r=j.inflateEnd(this.strm),this.onEnd(r),this.ended=!0,!0;if(t.avail_in===0)break}}return!0};Je.prototype.onData=function(e){this.chunks.push(e)};Je.prototype.onEnd=function(e){e===Ge&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=Nt.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg};function vi(e,i){const t=new Je(i);if(t.push(e),t.err)throw t.msg||he[t.err];return t.result}function al(e,i){return i=i||{},i.raw=!0,vi(e,i)}var rl=Je,ol=vi,ll=al,sl=vi,cl={Inflate:rl,inflate:ol,inflateRaw:ll,ungzip:sl};const{Deflate:fl,deflate:dl,deflateRaw:hl,gzip:ul}=bo,{Inflate:_l,inflate:gl,inflateRaw:pl,ungzip:wl}=cl;var bl=fl,ml=dl,yl=hl,xl=ul,vl=_l,El=gl,Sl=pl,kl=wl,Al=Ye,aa={Deflate:bl,deflate:ml,deflateRaw:yl,gzip:xl,Inflate:vl,inflate:El,inflateRaw:Sl,ungzip:kl,constants:Al};function Nl(e){const i=aa.deflate(new TextEncoder().encode(e));return btoa(String.fromCharCode(...i)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Wl(e){const i=e.replace(/-/g,"+").replace(/_/g,"/"),t=atob(i),n=new Uint8Array(t.length);for(let r=0;r<t.length;r++)n[r]=t.charCodeAt(r);const a=aa.inflate(n);return new TextDecoder().decode(a)}function Rl(){const e=new URLSearchParams(window.location.search),i=e.get("zcode");if(i)try{return Wl(i)}catch(n){console.error("Failed to decode zcode:",n)}const t=e.get("code");if(t)try{const n=t.replace(/-/g,"+").replace(/_/g,"/");return atob(n)}catch(n){console.error("Failed to decode code:",n)}return null}async function zl(e){const i=new URL(window.location.href);i.searchParams.delete("code"),i.searchParams.set("zcode",Nl(e)),await navigator.clipboard.writeText(i.toString())}const ni=[{name:"Gradient Waves",description:"Colorful gradient waves pattern",code:`Bitdepth 8
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
  - Set 100`},{name:"Aurora Borealis",description:"Northern lights gradient waves",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  if y > 256
    - Gradient +4
    - W -2
  - Set 40
if c > 0
  if x > 256
    if y > 384
      - N +3
      - Set 200
    - Weighted +2
    - Set 80
  if y > 128
    - Gradient +1
    - Set 150
  - Set 60
if y > 384
  if x > 256
    - Set 255
    - Gradient +3
  - W +2
  - N -1
if x > 128
  if y > 256
    - AvgW+N +2
    - Weighted -1
  - Gradient +1
  - Set 100
- Set 80`},{name:"Crystal Cave",description:"Geometric crystal patterns",code:`Bitdepth 8
Width 512
Height 512
RCT 17

if c > 1
  if x > 256
    - N +3
    - Set 80
  - Set 180
if c > 0
  if y > 256
    if x > 256
      - Gradient +4
      - W -2
    - Weighted +2
    - Set 100
  - N +1
  - Set 200
if x > 384
  if y > 384
    - Set 255
    - Set 0
  if y > 128
    - Gradient +2
    - W -1
  - Set 50
if y > 128
  if x > 128
    if W > 128
      - N +2
      - Gradient -1
    - AvgW+N +1
    - Set 150
  - W +1
  - Set 80
- Set 128`},{name:"Sunset Horizon",description:"Warm sunset color bands",code:`Bitdepth 8
Width 512
Height 256
RCT 6

if c > 1
  if y > 128
    - Set 60
    - Set 180
  - Set 220
if c > 0
  if y > 200
    - Gradient +2
    - Set 80
  if y > 100
    - W +1
    - Set 150
  - Set 200
if y > 200
  if x > 256
    - Gradient +3
    - W -2
  - N +1
  - Set 100
if y > 100
  if x > 128
    - AvgW+N +2
    - Weighted -1
  - Gradient +1
  - Set 180
- Set 255`},{name:"Digital Rain",description:"Matrix-style vertical patterns",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 480
  - Set 255
  - Gradient +2
if x > 32
  if y > 32
    if W > 128
      if N > 100
        - Set 200
        - Gradient -1
      - N +2
      - Set 80
    if y > 256
      - Gradient +3
      - W -1
    - Weighted +1
    - Set 100
  - Set 50
  - N +1
- Set 0`},{name:"Nebula Clouds",description:"Space nebula effect",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  if y > 256
    if x > 256
      - Gradient +3
      - Set 100
    - W +2
    - Set 60
  - Set 180
if c > 0
  if x > 384
    - N +2
    - Set 200
  if x > 128
    - Gradient +1
    - Set 150
  - Set 80
if y > 384
  if x > 256
    - Set 255
    - Weighted +2
  - AvgW+N +1
  - Set 120
if x > 256
  if y > 128
    - Gradient +2
    - W -1
  - N +1
  - Set 100
- Set 60`},{name:"Tessellation",description:"Interlocking geometric tiles",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 256
  if y > 256
    if W > 128
      if N > 100
        - Gradient +3
        - Set 50
      - W +2
      - Set 200
    if W > 50
      - N +1
      - Gradient -1
    - Set 150
    - W -1
  if N > 128
    - Weighted +2
    - Set 100
  - AvgW+N +1
  - Set 80
if y > 128
  if W > 100
    - N +2
    - Gradient +1
  - Set 180
  - W -1
- Set 128`},{name:"Coral Reef",description:"Organic underwater patterns",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  if x > 256
    - Set 180
    - Set 100
  - Set 220
if c > 0
  if y > 256
    - Gradient +3
    - W -2
  - N +2
  - Set 150
if y > 384
  if x > 384
    - Set 255
    - Gradient +2
  if x > 128
    - W +2
    - N -1
  - Set 80
  - Weighted +1
if x > 128
  if y > 128
    if W > 128
      - AvgW+N +2
      - Gradient -1
    - W +1
    - Set 200
  - N +1
  - Set 100
- Set 60`},{name:"Quantum Field",description:"Wave interference patterns",code:`Bitdepth 8
Width 512
Height 512

if c > 0
  - W 0
if x > 384
  if y > 384
    - Set 255
    - Gradient +3
  if y > 128
    - W +2
    - N -2
  - Set 50
if x > 128
  if y > 384
    - N +3
    - Set 200
  if y > 128
    if W > 128
      - Gradient +2
      - AvgW+N -1
    if N > 100
      - W +1
      - Set 180
    - Weighted +2
    - Set 100
  - Set 80
  - N +1
- Set 150`},{name:"Stained Glass",description:"Cathedral window effect",code:`Bitdepth 8
Width 512
Height 512
RCT 17

if c > 1
  if y > 256
    - W +3
    - Set 80
  - Set 200
if c > 0
  if x > 256
    if y > 256
      - Gradient +4
      - N -2
    - W +2
    - Set 150
  - Set 100
if x > 448
  if y > 256
    - Set 255
    - Gradient +2
  - N +1
  - Set 50
if y > 64
  if x > 64
    if W > 128
      - Gradient +2
      - Set 180
    if N > 100
      - W +1
      - AvgW+N -1
    - Weighted +2
    - Set 120
  - Set 80
  - N +1
- Set 150`},{name:"Volcanic",description:"Molten lava flow",code:`Bitdepth 8
Width 512
Height 512
RCT 6

if c > 1
  if y > 384
    - Set 20
    - Set 80
  - Set 40
if c > 0
  if y > 256
    - Gradient +2
    - Set 100
  - N +1
  - Set 200
if y > 448
  if x > 256
    - Set 255
    - Gradient +3
  - W +2
  - Set 220
if y > 256
  if x > 256
    if W > 128
      - Gradient +2
      - Set 150
    - N +1
    - W -1
  - AvgW+N +2
  - Set 180
if x > 128
  - Weighted +1
  - Set 100
- Set 80`}],yt=["Bitdepth","Width","Height","RCT","Orientation","Alpha","NotLast","FramePos","XYB","XYBFactors","Gaborish","EPF","16BitBuffers","Squeeze","CbYCr"],xt=["c","g","x","y","N","W","|N|","|W|","NW","NE","NN","WW","W-WW-NW+NWW","W+N-NW","W-NW","NW-N","N-NE","N-NN","W-WW","WGH","Prev","PPrev","PrevErr","PPrevErr","PrevAbs","PPrevAbs","PrevAbsErr","PPrevAbsErr"],Fe=["Set","W","N","NW","NE","WW","Select","Gradient","Weighted","AvgW+N","AvgW+NW","AvgN+NW","AvgN+NE","AvgAll"],ai=["if"];function Ll(e,i=0){const t=[];let n=0;for(;n<e.length;){const a=i+n;if(/\s/.test(e[n])){n++;continue}if(e[n]==="#"){t.push({type:"comment",value:e.slice(n),start:a,end:i+e.length});break}if(e[n]==="-"&&(n===0||/\s/.test(e[n-1]))){const s=e.slice(n+1).match(/^\s*(\w+)/);if(s&&Fe.includes(s[1])){t.push({type:"leaf",value:"-",start:a,end:a+1}),n++;continue}}if(e[n]===">"){t.push({type:"operator",value:">",start:a,end:a+1}),n++;continue}if(e.slice(n).startsWith("16BitBuffers")){t.push({type:"header",value:"16BitBuffers",start:a,end:a+12}),n+=12;continue}if(/[+\-]?\d/.test(e.slice(n,n+2))||/\d/.test(e[n])){const s=e.slice(n).match(/^[+\-]?\d+/);if(s){t.push({type:"number",value:s[0],start:a,end:a+s[0].length}),n+=s[0].length;continue}}const r=e.slice(n).match(/^[\w+\-|]+/);if(r){const s=r[0];let l="default";s==="if"?l="keyword":yt.includes(s)?l="header":Fe.includes(s)?l="predictor":xt.includes(s)?l="property":/^[+\-]\d+$/.test(s)?l="number":l="error",t.push({type:l,value:s,start:a,end:a+s.length}),n+=s.length;continue}t.push({type:"error",value:e[n],start:a,end:a+1}),n++}return t}function Tl(e,i){const t=e.slice(0,i),n=t.trim().split(/\s+/),a=n[n.length-1]||"",r=n[n.length-2]||"";if(r==="if")return xt.filter(l=>l.toLowerCase().startsWith(a.toLowerCase()));if(r==="-"||t.trimEnd().endsWith("-")){const l=r==="-"?a:"";return Fe.filter(h=>h.toLowerCase().startsWith(l.toLowerCase()))}return r===">"?[]:t.trim()===""||t.trim()===a?[...ai,...yt,"-"].filter(h=>h.toLowerCase().startsWith(a.toLowerCase())):[...ai,...yt,...xt,...Fe].filter(l=>l.toLowerCase().startsWith(a.toLowerCase()))}function Cl(e){const i=Ll(e,0);if(i.length===0)return ft(e);let t="",n=0;for(const a of i)a.start>n&&(t+=ft(e.slice(n,a.start))),t+=`<span class="tok-${a.type}">${ft(a.value)}</span>`,n=a.end;return n<e.length&&(t+=ft(e.slice(n))),t}function ft(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Dl(e){return e.split(`
`).map(Cl).join(`
`)}const b=document.getElementById("code"),ri=document.getElementById("run"),Bl=document.getElementById("share"),Il=document.getElementById("prettier"),Ol=document.getElementById("help"),Hl=document.getElementById("close-help"),vt=document.getElementById("help-dialog"),Ml=document.getElementById("help-content"),Be=document.getElementById("preview"),oi=document.getElementById("download-jxl"),li=document.getElementById("download-png"),dt=document.getElementById("size-info"),hn=document.getElementById("log"),K=document.getElementById("image-container"),Ul=document.getElementById("image-wrapper"),Pl=document.getElementById("zoom-level"),Zl=document.getElementById("zoom-in"),$l=document.getElementById("zoom-out"),Gl=document.getElementById("zoom-fit"),Fl=document.getElementById("zoom-reset"),Xl=document.querySelector(".placeholder"),Yl=document.getElementById("jxl-support"),ra=document.getElementById("line-numbers"),si=document.getElementById("code-highlight"),de=document.getElementById("autocomplete"),jl=document.getElementById("presets-btn"),ie=document.getElementById("presets-dialog"),ci=document.getElementById("presets-grid"),Kl=document.getElementById("close-presets"),oa=document.getElementById("main"),la=document.getElementById("resizer"),Et=document.querySelector(".editor-panel"),St=document.querySelector(".preview-panel");let Ve,kt=null,Ie=null,Xt=!1,Se=!1;async function Jl(){return new Promise(e=>{const i=new Image,t=setTimeout(()=>e(!1),1e3);i.onload=()=>{clearTimeout(t),e(i.width===1&&i.height===1)},i.onerror=()=>{clearTimeout(t),e(!1)},i.src="data:image/jxl;base64,/woAkAEAE4gCAMAAtZ8gAAAVKqOMG7yc6/nyQ4fFtI3rDG21bWEJY7O9MEhIOIONiwTfnKWRaQYkopIE"})}let P=1,ae=0,re=0,ge=!1,sa=0,ca=0;function Vl(){const e=new Worker(new URL("/jxl-art/assets/jxl-worker-D6aE7Mmq.js",import.meta.url),{type:"module"});return bn(e)}function M(e,i="info"){hn.textContent=e,hn.className=i}async function qe(){if(!Xt){Xt=!0,document.body.classList.add("loading"),ri.disabled=!0,M("Compiling...","info");try{const e=b.value,i=await Ve.render(e);kt=i.jxlData;const t=/^\s*16BitBuffers\b/im.test(e);let n;Se&&!t?(n=new Blob([new Uint8Array(i.jxlData)],{type:"image/jxl"}),Ie=null):(Ie=new Blob([new Uint8Array(i.pngData)],{type:"image/png"}),n=Ie);const a=URL.createObjectURL(n);Be.src=a,Xl.classList.add("hidden"),Be.onload=()=>ua(),oi.disabled=!1,li.disabled=!1,dt&&(dt.textContent=`JXL: ${i.jxlData.byteLength} bytes${Se?" (native)":""}`),M(`Success! JXL size: ${i.jxlData.byteLength} bytes`,"success"),await ke(e)}catch(e){const i=e instanceof Error?e.message:"Unknown error";M(i,"error"),console.error(e),oi.disabled=!0,li.disabled=!0,dt&&(dt.textContent="")}finally{Xt=!1,document.body.classList.remove("loading"),ri.disabled=!1}}}function fi(e,i){const t=URL.createObjectURL(e),n=document.createElement("a");n.href=t,n.download=i,n.click(),URL.revokeObjectURL(t)}ri.addEventListener("click",qe);Bl.addEventListener("click",da);Il.addEventListener("click",ha);Ol.addEventListener("click",()=>{Ml.innerHTML=Aa,vt.showModal()});Hl.addEventListener("click",()=>{vt.close()});oi.addEventListener("click",()=>{kt&&fi(new Blob([new Uint8Array(kt)],{type:"image/jxl"}),"art.jxl")});li.addEventListener("click",async()=>{if(Ie)fi(Ie,"art.png");else if(kt&&Se){M("Converting to PNG...","info");try{const e=await Ve.render(b.value),i=new Blob([new Uint8Array(e.pngData)],{type:"image/png"});fi(i,"art.png"),M("PNG downloaded","success")}catch{M("Failed to convert to PNG","error")}}});b.addEventListener("keydown",e=>{e.ctrlKey&&e.altKey&&e.code==="Enter"&&(e.preventDefault(),qe())});function Qe(){const e=b.value.split(`
`).length,i=Array.from({length:e},(t,n)=>`<span>${n+1}</span>`).join("");ra.innerHTML=i,si.innerHTML=Dl(b.value)+`
`}b.addEventListener("scroll",()=>{ra.scrollTop=b.scrollTop,si.scrollTop=b.scrollTop,si.scrollLeft=b.scrollLeft});let ne=[],q=0;function ql(e){if(e.length===0){et();return}ne=e,q=0;const i=b.selectionStart,n=b.value.substring(0,i).split(`
`),a=n.length-1,r=n[n.length-1].length,s=19.5,l=7.8,h=(a+1)*s+16,o=r*l+16;de.style.top=`${Math.min(h,b.offsetHeight-100)}px`,de.style.left=`${Math.min(o,b.offsetWidth-160)}px`,di(),de.classList.remove("hidden")}function et(){de.classList.add("hidden"),ne=[]}function di(){de.innerHTML=ne.map((e,i)=>{let t="",n="";return ai.includes(e)?(t="type-keyword",n="keyword"):yt.includes(e)?(t="type-header",n="header"):xt.includes(e)?(t="type-property",n="prop"):Fe.includes(e)&&(t="type-predictor",n="pred"),`<div class="autocomplete-item${i===q?" selected":""}" data-index="${i}">
      <span>${e}</span>
      ${n?`<span class="type ${t}">${n}</span>`:""}
    </div>`}).join("")}function fa(){if(ne.length===0)return;const e=ne[q],i=b.selectionStart,t=b.value.substring(0,i),n=b.value.substring(i),a=t.match(/[\w\-|]*$/),r=a?i-a[0].length:i;b.value=b.value.substring(0,r)+e+n,b.selectionStart=b.selectionEnd=r+e.length,et(),Qe(),ke(b.value)}b.addEventListener("keydown",e=>{if(!de.classList.contains("hidden")){if(e.key==="ArrowDown"){e.preventDefault(),q=(q+1)%ne.length,di();return}if(e.key==="ArrowUp"){e.preventDefault(),q=(q-1+ne.length)%ne.length,di();return}if(e.key==="Enter"||e.key==="Tab"){e.preventDefault(),fa();return}if(e.key==="Escape"){e.preventDefault(),et();return}}if(e.key==="Tab"){e.preventDefault();const i=b.selectionStart,t=b.selectionEnd;b.value=b.value.substring(0,i)+"  "+b.value.substring(t),b.selectionStart=b.selectionEnd=i+2,Qe(),ke(b.value)}});b.addEventListener("input",()=>{ke(b.value),Qe();const e=b.selectionStart,t=b.value.substring(0,e).split(`
`).pop()||"",n=t.match(/[\w\-|]+$/);if(n&&n[0].length>=1){const a=Tl(t,t.length);ql(a.slice(0,8))}else et()});de.addEventListener("click",e=>{const i=e.target.closest(".autocomplete-item");i&&(q=parseInt(i.getAttribute("data-index")||"0"),fa())});b.addEventListener("blur",()=>{setTimeout(et,150)});document.addEventListener("keydown",e=>{(e.ctrlKey||e.metaKey)&&e.key==="Enter"&&(e.preventDefault(),qe()),(e.ctrlKey||e.metaKey)&&e.key==="s"&&(e.preventDefault(),da()),(e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key==="f"&&(e.preventDefault(),ha()),e.key==="Escape"&&(vt.open&&vt.close(),ie.open&&ie.close())});async function da(){try{await zl(b.value),M("Share URL copied to clipboard!","success")}catch{M("Failed to copy URL","error")}}async function ha(){try{const e=await Ve.prettier(b.value);b.value=e,ke(e),M("Code formatted","success")}catch{M("Failed to format code","error")}}jl.addEventListener("click",()=>{ie.showModal()});Kl.addEventListener("click",()=>{ie.close()});ie.addEventListener("click",e=>{e.target===ie&&ie.close()});ci.addEventListener("click",e=>{const i=e.target.closest(".preset-card");if(!i)return;const t=i.getAttribute("data-preset"),n=ni.find(a=>a.name===t);n&&(b.value=n.code,Qe(),ke(n.code),ie.close(),M(`Loaded preset: ${n.name}`,"info"),qe())});function tt(){Ul.style.transform=`translate(${ae}px, ${re}px) scale(${P})`,Pl.textContent=`${Math.round(P*100)}%`}function Rt(e,i,t){const n=P;if(P=Math.max(.1,Math.min(10,e)),i!==void 0&&t!==void 0){const a=K.getBoundingClientRect(),r=i-a.left-a.width/2,s=t-a.top-a.height/2,l=P/n;ae=r-(r-ae)*l,re=s-(s-re)*l}tt()}function ua(){if(!Be.naturalWidth)return;const e=K.getBoundingClientRect(),i=(e.width-20)/Be.naturalWidth,t=(e.height-60)/Be.naturalHeight;P=Math.min(i,t,1),ae=0,re=0,tt()}Zl.addEventListener("click",()=>Rt(P*1.25));$l.addEventListener("click",()=>Rt(P/1.25));Fl.addEventListener("click",()=>{P=1,ae=0,re=0,tt()});Gl.addEventListener("click",ua);K.addEventListener("wheel",e=>{e.preventDefault();const i=e.deltaY>0?.9:1.1;Rt(P*i,e.clientX,e.clientY)},{passive:!1});K.addEventListener("mousedown",e=>{e.button===0&&(ge=!0,sa=e.clientX-ae,ca=e.clientY-re,K.style.cursor="grabbing")});window.addEventListener("mousemove",e=>{ge&&(ae=e.clientX-sa,re=e.clientY-ca,tt())});window.addEventListener("mouseup",()=>{ge=!1,K.style.cursor=""});let hi=0,ui=0,_i=0;K.addEventListener("touchstart",e=>{e.touches.length===1?(ge=!0,ui=e.touches[0].clientX,_i=e.touches[0].clientY):e.touches.length===2&&(ge=!1,hi=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY))},{passive:!0});K.addEventListener("touchmove",e=>{if(e.touches.length===1&&ge){const i=e.touches[0].clientX-ui,t=e.touches[0].clientY-_i;ae+=i,re+=t,ui=e.touches[0].clientX,_i=e.touches[0].clientY,tt()}else if(e.touches.length===2){const i=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY),t=(e.touches[0].clientX+e.touches[1].clientX)/2,n=(e.touches[0].clientY+e.touches[1].clientY)/2;Rt(P*(i/hi),t,n),hi=i}},{passive:!0});K.addEventListener("touchend",()=>{ge=!1});let pe=!1;la.addEventListener("mousedown",e=>{pe=!0,document.body.style.cursor="col-resize",document.body.style.userSelect="none",e.preventDefault()});window.addEventListener("mousemove",e=>{if(!pe)return;const i=oa.getBoundingClientRect();if(window.innerWidth<=900){const n=e.clientY-i.top,a=i.height,r=n/a*100,s=Math.max(15,Math.min(85,r));Et.style.flex=`0 0 ${s}%`,St.style.flex=`0 0 ${100-s-2}%`}else{const n=e.clientX-i.left,a=i.width,r=n/a*100,s=Math.max(15,Math.min(85,r));Et.style.flex=`0 0 ${s}%`,St.style.flex=`0 0 ${100-s-2}%`}});window.addEventListener("mouseup",()=>{pe&&(pe=!1,document.body.style.cursor="",document.body.style.userSelect="")});la.addEventListener("touchstart",e=>{pe=!0,e.preventDefault()});window.addEventListener("touchmove",e=>{if(!pe||e.touches.length!==1)return;const i=e.touches[0],t=oa.getBoundingClientRect();if(window.innerWidth<=900){const a=i.clientY-t.top,r=t.height,s=a/r*100,l=Math.max(15,Math.min(85,s));Et.style.flex=`0 0 ${l}%`,St.style.flex=`0 0 ${100-l-2}%`}else{const a=i.clientX-t.left,r=t.width,s=a/r*100,l=Math.max(15,Math.min(85,s));Et.style.flex=`0 0 ${l}%`,St.style.flex=`0 0 ${100-l-2}%`}});window.addEventListener("touchend",()=>{pe=!1});async function Ql(e){try{const i=await Ve.render(e),t=Se?new Blob([new Uint8Array(i.jxlData)],{type:"image/jxl"}):new Blob([new Uint8Array(i.pngData)],{type:"image/png"});return URL.createObjectURL(t)}catch{return""}}async function es(){ni.forEach(e=>{const i=document.createElement("div");i.className="preset-card loading",i.setAttribute("data-preset",e.name),i.innerHTML=`
      <img src="" alt="${e.name}" />
      <p class="preset-name">${e.name}</p>
      <p class="preset-desc">${e.description}</p>
    `,ci.appendChild(i)});for(const e of ni){const i=ci.querySelector(`[data-preset="${e.name}"]`);if(!i)continue;const t=await Ql(e.code),n=i.querySelector("img");n&&t&&(n.src=t),i.classList.remove("loading")}}async function ts(){Ve=Vl(),es(),Se=await Jl(),Se?(console.log("[JXL Art] Native JXL support detected - using JXL for preview"),Yl.classList.remove("hidden")):console.log("[JXL Art] No native JXL support - using PNG for preview");const e=Rl();if(e)b.value=e;else{const i=await za();i&&(b.value=i)}Qe(),M("Ready. Press Ctrl+Enter to generate image.","info"),e&&qe()}ts();
