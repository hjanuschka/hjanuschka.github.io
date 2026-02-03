(async ()=>{
    const T = Symbol("Comlink.proxy"), z = Symbol("Comlink.endpoint"), H = Symbol("Comlink.releaseProxy"), S = Symbol("Comlink.finalizer"), p = Symbol("Comlink.thrown"), j = (e)=>typeof e == "object" && e !== null || typeof e == "function", N = {
        canHandle: (e)=>j(e) && e[T],
        serialize (e) {
            const { port1: t, port2: r } = new MessageChannel;
            return C(e, t), [
                r,
                [
                    r
                ]
            ];
        },
        deserialize (e) {
            return e.start(), F(e);
        }
    }, W = {
        canHandle: (e)=>j(e) && p in e,
        serialize ({ value: e }) {
            let t;
            return e instanceof Error ? t = {
                isError: !0,
                value: {
                    message: e.message,
                    name: e.name,
                    stack: e.stack
                }
            } : t = {
                isError: !1,
                value: e
            }, [
                t,
                []
            ];
        },
        deserialize (e) {
            throw e.isError ? Object.assign(new Error(e.value.message), e.value) : e.value;
        }
    }, O = new Map([
        [
            "proxy",
            N
        ],
        [
            "throw",
            W
        ]
    ]);
    function D(e, t) {
        for (const r of e)if (t === r || r === "*" || r instanceof RegExp && r.test(t)) return !0;
        return !1;
    }
    function C(e, t = globalThis, r = [
        "*"
    ]) {
        t.addEventListener("message", function c(s) {
            if (!s || !s.data) return;
            if (!D(r, s.origin)) {
                console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
                return;
            }
            const { id: i, type: l, path: o } = Object.assign({
                path: []
            }, s.data), n = (s.data.argumentList || []).map(y);
            let a;
            try {
                const u = o.slice(0, -1).reduce((f, E)=>f[E], e), g = o.reduce((f, E)=>f[E], e);
                switch(l){
                    case "GET":
                        a = g;
                        break;
                    case "SET":
                        u[o.slice(-1)[0]] = y(s.data.value), a = !0;
                        break;
                    case "APPLY":
                        a = g.apply(u, n);
                        break;
                    case "CONSTRUCT":
                        {
                            const f = new g(...n);
                            a = v(f);
                        }
                        break;
                    case "ENDPOINT":
                        {
                            const { port1: f, port2: E } = new MessageChannel;
                            C(e, E), a = B(f, [
                                f
                            ]);
                        }
                        break;
                    case "RELEASE":
                        a = void 0;
                        break;
                    default:
                        return;
                }
            } catch (u) {
                a = {
                    value: u,
                    [p]: 0
                };
            }
            Promise.resolve(a).catch((u)=>({
                    value: u,
                    [p]: 0
                })).then((u)=>{
                const [g, f] = A(u);
                t.postMessage(Object.assign(Object.assign({}, g), {
                    id: i
                }), f), l === "RELEASE" && (t.removeEventListener("message", c), $(t), S in e && typeof e[S] == "function" && e[S]());
            }).catch((u)=>{
                const [g, f] = A({
                    value: new TypeError("Unserializable return value"),
                    [p]: 0
                });
                t.postMessage(Object.assign(Object.assign({}, g), {
                    id: i
                }), f);
            });
        }), t.start && t.start();
    }
    function U(e) {
        return e.constructor.name === "MessagePort";
    }
    function $(e) {
        U(e) && e.close();
    }
    function F(e, t) {
        const r = new Map;
        return e.addEventListener("message", function(s) {
            const { data: i } = s;
            if (!i || !i.id) return;
            const l = r.get(i.id);
            if (l) try {
                l(i);
            } finally{
                r.delete(i.id);
            }
        }), P(e, r, [], t);
    }
    function h(e) {
        if (e) throw new Error("Proxy has been released and is not useable");
    }
    function L(e) {
        return m(e, new Map, {
            type: "RELEASE"
        }).then(()=>{
            $(e);
        });
    }
    const x = new WeakMap, k = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e)=>{
        const t = (x.get(e) || 0) - 1;
        x.set(e, t), t === 0 && L(e);
    });
    function I(e, t) {
        const r = (x.get(t) || 0) + 1;
        x.set(t, r), k && k.register(e, t, e);
    }
    function G(e) {
        k && k.unregister(e);
    }
    function P(e, t, r = [], c = function() {}) {
        let s = !1;
        const i = new Proxy(c, {
            get (l, o) {
                if (h(s), o === H) return ()=>{
                    G(i), L(e), t.clear(), s = !0;
                };
                if (o === "then") {
                    if (r.length === 0) return {
                        then: ()=>i
                    };
                    const n = m(e, t, {
                        type: "GET",
                        path: r.map((a)=>a.toString())
                    }).then(y);
                    return n.then.bind(n);
                }
                return P(e, t, [
                    ...r,
                    o
                ]);
            },
            set (l, o, n) {
                h(s);
                const [a, u] = A(n);
                return m(e, t, {
                    type: "SET",
                    path: [
                        ...r,
                        o
                    ].map((g)=>g.toString()),
                    value: a
                }, u).then(y);
            },
            apply (l, o, n) {
                h(s);
                const a = r[r.length - 1];
                if (a === z) return m(e, t, {
                    type: "ENDPOINT"
                }).then(y);
                if (a === "bind") return P(e, t, r.slice(0, -1));
                const [u, g] = M(n);
                return m(e, t, {
                    type: "APPLY",
                    path: r.map((f)=>f.toString()),
                    argumentList: u
                }, g).then(y);
            },
            construct (l, o) {
                h(s);
                const [n, a] = M(o);
                return m(e, t, {
                    type: "CONSTRUCT",
                    path: r.map((u)=>u.toString()),
                    argumentList: n
                }, a).then(y);
            }
        });
        return I(i, e), i;
    }
    function V(e) {
        return Array.prototype.concat.apply([], e);
    }
    function M(e) {
        const t = e.map(A);
        return [
            t.map((r)=>r[0]),
            V(t.map((r)=>r[1]))
        ];
    }
    const _ = new WeakMap;
    function B(e, t) {
        return _.set(e, t), e;
    }
    function v(e) {
        return Object.assign(e, {
            [T]: !0
        });
    }
    function A(e) {
        for (const [t, r] of O)if (r.canHandle(e)) {
            const [c, s] = r.serialize(e);
            return [
                {
                    type: "HANDLER",
                    name: t,
                    value: c
                },
                s
            ];
        }
        return [
            {
                type: "RAW",
                value: e
            },
            _.get(e) || []
        ];
    }
    function y(e) {
        switch(e.type){
            case "HANDLER":
                return O.get(e.name).deserialize(e.value);
            case "RAW":
                return e.value;
        }
    }
    function m(e, t, r, c) {
        return new Promise((s)=>{
            const i = q();
            t.set(i, s), e.start && e.start(), e.postMessage(Object.assign({
                id: i
            }, r), c);
        });
    }
    function q() {
        return new Array(4).fill(0).map(()=>Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
    }
    const X = [
        "squeeze",
        "xyb",
        "cbycr",
        "alpha",
        "notlast",
        "16bitbuffers",
        "gaborish"
    ], Y = [
        "framepos"
    ], J = [
        "xybfactors"
    ];
    function Z(e) {
        const t = e.toLowerCase();
        return X.includes(t) ? 0 : Y.includes(t) ? 2 : J.includes(t) ? 3 : 1;
    }
    function w(e) {
        const { value: t, done: r } = e.next();
        if (r) throw new Error("Unexpected end of input");
        return t;
    }
    function K(e) {
        const r = e.split(/\s+/).filter((c)=>c)[Symbol.iterator]();
        return b(r, 0);
    }
    function b(e, t) {
        let r = "", c, s, i = !1;
        for(;;){
            if ({ value: c, done: s } = e.next(), s) return r;
            const l = c.toLowerCase();
            if (l === "if" || c === "-") {
                i && (r += `
`);
                break;
            }
            if (c.startsWith("/*")) {
                let n = c.endsWith("*/");
                for(r += `${"  ".repeat(t)}${c}`; !n;){
                    const a = w(e);
                    n = a.endsWith("*/"), r += ` ${a}`;
                }
                r += `
`;
                continue;
            }
            r += c;
            let o = Z(l);
            for(; o > 0;)r += ` ${w(e)}`, o--;
            r += `
`, i = !0;
        }
        if (c.toLowerCase() === "if") {
            const l = w(e);
            w(e);
            const o = w(e);
            r += `${"  ".repeat(t)}if ${l} > ${o}
`, r += b(e, t + 1), r += `
`, r += b(e, t + 1);
        } else if (c === "-") {
            const l = w(e), o = w(e);
            r += `${"  ".repeat(t)}- ${l}`, o === "+" || o === "-" ? r += ` ${o} ${w(e)}` : r += ` ${o}`;
        }
        return t === 0 && (r += `
`, r += b(e, 0)), r;
    }
    let R = null, d = [];
    async function Q() {
        if (R) return;
        const e = (await import("./jxl-DGzUj951.js")).default;
        R = await e({
            locateFile: (t)=>t.endsWith(".wasm") ? new URL("/jxl-art/assets/jxl--z72W-fI.wasm", import.meta.url).href : t,
            printErr: (t)=>{
                console.error("[libjxl]", t), d.push(t);
            },
            print: (t)=>{
                console.log("[libjxl]", t);
            }
        }), console.log("[Worker] libjxl loaded");
    }
    const ee = {
        async render (e, t) {
            await Q(), d = [];
            const c = /^\s*16BitBuffers\b/im.test(e) ? !1 : t?.skipPng ?? !1;
            let s;
            try {
                s = R.jxl_from_tree(e);
            } catch (n) {
                const a = d.join(`
`), u = n instanceof Error ? n.message : String(n);
                throw new Error(a || `Encode failed: ${u}`);
            }
            if (d.length > 0) {
                const n = d.join(`
`);
                if (n.toLowerCase().includes("error") || n.toLowerCase().includes("fail")) throw new Error(n);
            }
            if (typeof s == "string") throw new Error(s);
            if (!s || s.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Compilation failed - check your tree syntax");
            }
            const i = new Uint8Array(s);
            if (c) return {
                jxlData: i,
                pngData: new Uint8Array(0)
            };
            d = [];
            let l;
            try {
                l = R.decode(i);
            } catch (n) {
                const a = d.join(`
`), u = n instanceof Error ? n.message : String(n);
                throw new Error(a || `Decode failed: ${u}`);
            }
            if (!l || l.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Failed to decode JXL to PNG");
            }
            const o = new Uint8Array(l);
            return {
                jxlData: i,
                pngData: o
            };
        },
        prettier (e) {
            return K(e);
        }
    };
    C(ee);
})();
