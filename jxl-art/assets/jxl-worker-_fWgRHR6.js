(async ()=>{
    const T = Symbol("Comlink.proxy"), z = Symbol("Comlink.endpoint"), H = Symbol("Comlink.releaseProxy"), S = Symbol("Comlink.finalizer"), p = Symbol("Comlink.thrown"), j = (e)=>typeof e == "object" && e !== null || typeof e == "function", N = {
        canHandle: (e)=>j(e) && e[T],
        serialize (e) {
            const { port1: r, port2: t } = new MessageChannel;
            return C(e, r), [
                t,
                [
                    t
                ]
            ];
        },
        deserialize (e) {
            return e.start(), F(e);
        }
    }, W = {
        canHandle: (e)=>j(e) && p in e,
        serialize ({ value: e }) {
            let r;
            return e instanceof Error ? r = {
                isError: !0,
                value: {
                    message: e.message,
                    name: e.name,
                    stack: e.stack
                }
            } : r = {
                isError: !1,
                value: e
            }, [
                r,
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
    function D(e, r) {
        for (const t of e)if (r === t || t === "*" || t instanceof RegExp && t.test(r)) return !0;
        return !1;
    }
    function C(e, r = globalThis, t = [
        "*"
    ]) {
        r.addEventListener("message", function o(s) {
            if (!s || !s.data) return;
            if (!D(t, s.origin)) {
                console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
                return;
            }
            const { id: a, type: c, path: n } = Object.assign({
                path: []
            }, s.data), l = (s.data.argumentList || []).map(y);
            let i;
            try {
                const u = n.slice(0, -1).reduce((f, E)=>f[E], e), g = n.reduce((f, E)=>f[E], e);
                switch(c){
                    case "GET":
                        i = g;
                        break;
                    case "SET":
                        u[n.slice(-1)[0]] = y(s.data.value), i = !0;
                        break;
                    case "APPLY":
                        i = g.apply(u, l);
                        break;
                    case "CONSTRUCT":
                        {
                            const f = new g(...l);
                            i = q(f);
                        }
                        break;
                    case "ENDPOINT":
                        {
                            const { port1: f, port2: E } = new MessageChannel;
                            C(e, E), i = v(f, [
                                f
                            ]);
                        }
                        break;
                    case "RELEASE":
                        i = void 0;
                        break;
                    default:
                        return;
                }
            } catch (u) {
                i = {
                    value: u,
                    [p]: 0
                };
            }
            Promise.resolve(i).catch((u)=>({
                    value: u,
                    [p]: 0
                })).then((u)=>{
                const [g, f] = A(u);
                r.postMessage(Object.assign(Object.assign({}, g), {
                    id: a
                }), f), c === "RELEASE" && (r.removeEventListener("message", o), $(r), S in e && typeof e[S] == "function" && e[S]());
            }).catch((u)=>{
                const [g, f] = A({
                    value: new TypeError("Unserializable return value"),
                    [p]: 0
                });
                r.postMessage(Object.assign(Object.assign({}, g), {
                    id: a
                }), f);
            });
        }), r.start && r.start();
    }
    function U(e) {
        return e.constructor.name === "MessagePort";
    }
    function $(e) {
        U(e) && e.close();
    }
    function F(e, r) {
        const t = new Map;
        return e.addEventListener("message", function(s) {
            const { data: a } = s;
            if (!a || !a.id) return;
            const c = t.get(a.id);
            if (c) try {
                c(a);
            } finally{
                t.delete(a.id);
            }
        }), P(e, t, [], r);
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
        const r = (x.get(e) || 0) - 1;
        x.set(e, r), r === 0 && L(e);
    });
    function I(e, r) {
        const t = (x.get(r) || 0) + 1;
        x.set(r, t), k && k.register(e, r, e);
    }
    function G(e) {
        k && k.unregister(e);
    }
    function P(e, r, t = [], o = function() {}) {
        let s = !1;
        const a = new Proxy(o, {
            get (c, n) {
                if (h(s), n === H) return ()=>{
                    G(a), L(e), r.clear(), s = !0;
                };
                if (n === "then") {
                    if (t.length === 0) return {
                        then: ()=>a
                    };
                    const l = m(e, r, {
                        type: "GET",
                        path: t.map((i)=>i.toString())
                    }).then(y);
                    return l.then.bind(l);
                }
                return P(e, r, [
                    ...t,
                    n
                ]);
            },
            set (c, n, l) {
                h(s);
                const [i, u] = A(l);
                return m(e, r, {
                    type: "SET",
                    path: [
                        ...t,
                        n
                    ].map((g)=>g.toString()),
                    value: i
                }, u).then(y);
            },
            apply (c, n, l) {
                h(s);
                const i = t[t.length - 1];
                if (i === z) return m(e, r, {
                    type: "ENDPOINT"
                }).then(y);
                if (i === "bind") return P(e, r, t.slice(0, -1));
                const [u, g] = M(l);
                return m(e, r, {
                    type: "APPLY",
                    path: t.map((f)=>f.toString()),
                    argumentList: u
                }, g).then(y);
            },
            construct (c, n) {
                h(s);
                const [l, i] = M(n);
                return m(e, r, {
                    type: "CONSTRUCT",
                    path: t.map((u)=>u.toString()),
                    argumentList: l
                }, i).then(y);
            }
        });
        return I(a, e), a;
    }
    function V(e) {
        return Array.prototype.concat.apply([], e);
    }
    function M(e) {
        const r = e.map(A);
        return [
            r.map((t)=>t[0]),
            V(r.map((t)=>t[1]))
        ];
    }
    const _ = new WeakMap;
    function v(e, r) {
        return _.set(e, r), e;
    }
    function q(e) {
        return Object.assign(e, {
            [T]: !0
        });
    }
    function A(e) {
        for (const [r, t] of O)if (t.canHandle(e)) {
            const [o, s] = t.serialize(e);
            return [
                {
                    type: "HANDLER",
                    name: r,
                    value: o
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
    function m(e, r, t, o) {
        return new Promise((s)=>{
            const a = X();
            r.set(a, s), e.start && e.start(), e.postMessage(Object.assign({
                id: a
            }, t), o);
        });
    }
    function X() {
        return new Array(4).fill(0).map(()=>Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
    }
    const Y = [
        "squeeze",
        "xyb",
        "cbycr",
        "alpha",
        "notlast",
        "16bitbuffers",
        "gaborish"
    ], J = [
        "framepos"
    ], Z = [
        "xybfactors"
    ];
    function B(e) {
        const r = e.toLowerCase();
        return Y.includes(r) ? 0 : J.includes(r) ? 2 : Z.includes(r) ? 3 : 1;
    }
    function w(e) {
        const { value: r, done: t } = e.next();
        if (t) throw new Error("Unexpected end of input");
        return r;
    }
    function K(e) {
        const t = e.split(/\s+/).filter((o)=>o)[Symbol.iterator]();
        return b(t, 0);
    }
    function b(e, r) {
        let t = "", o, s, a = !1;
        for(;;){
            if ({ value: o, done: s } = e.next(), s) return t;
            const c = o.toLowerCase();
            if (c === "if" || o === "-") {
                a && (t += `
`);
                break;
            }
            if (o.startsWith("/*")) {
                let l = o.endsWith("*/");
                for(t += `${"  ".repeat(r)}${o}`; !l;){
                    const i = w(e);
                    l = i.endsWith("*/"), t += ` ${i}`;
                }
                t += `
`;
                continue;
            }
            t += o;
            let n = B(c);
            for(; n > 0;)t += ` ${w(e)}`, n--;
            t += `
`, a = !0;
        }
        if (o.toLowerCase() === "if") {
            const c = w(e);
            w(e);
            const n = w(e);
            t += `${"  ".repeat(r)}if ${c} > ${n}
`, t += b(e, r + 1), t += `
`, t += b(e, r + 1);
        } else if (o === "-") {
            const c = w(e), n = w(e);
            t += `${"  ".repeat(r)}- ${c}`, n === "+" || n === "-" ? t += ` ${n} ${w(e)}` : t += ` ${n}`;
        }
        return r === 0 && (t += `
`, t += b(e, 0)), t;
    }
    let R = null, d = [];
    async function Q() {
        if (R) return;
        const e = (await import("./jxl-DGzUj951.js")).default;
        R = await e({
            locateFile: (r)=>r.endsWith(".wasm") ? new URL("/jxl-art/assets/jxl--z72W-fI.wasm", import.meta.url).href : r,
            printErr: (r)=>{
                console.error("[libjxl]", r), d.push(r);
            },
            print: (r)=>{
                console.log("[libjxl]", r);
            }
        }), console.log("[Worker] libjxl loaded");
    }
    const ee = {
        async render (e, r) {
            await Q(), d = [];
            const t = r?.skipPng ?? !1;
            let o;
            try {
                o = R.jxl_from_tree(e);
            } catch (n) {
                const l = d.join(`
`), i = n instanceof Error ? n.message : String(n);
                throw new Error(l || `Encode failed: ${i}`);
            }
            if (d.length > 0) {
                const n = d.join(`
`);
                if (n.toLowerCase().includes("error") || n.toLowerCase().includes("fail")) throw new Error(n);
            }
            if (typeof o == "string") throw new Error(o);
            if (!o || o.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Compilation failed - check your tree syntax");
            }
            const s = new Uint8Array(o);
            if (t) return {
                jxlData: s,
                pngData: new Uint8Array(0)
            };
            d = [];
            let a;
            try {
                a = R.decode(s);
            } catch (n) {
                const l = d.join(`
`), i = n instanceof Error ? n.message : String(n);
                throw new Error(l || `Decode failed: ${i}`);
            }
            if (!a || a.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Failed to decode JXL to PNG");
            }
            const c = new Uint8Array(a);
            return {
                jxlData: s,
                pngData: c
            };
        },
        prettier (e) {
            return K(e);
        }
    };
    C(ee);
})();
