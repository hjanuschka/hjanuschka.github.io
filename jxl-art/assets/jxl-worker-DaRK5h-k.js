(async ()=>{
    const j = Symbol("Comlink.proxy"), _ = Symbol("Comlink.endpoint"), z = Symbol("Comlink.releaseProxy"), S = Symbol("Comlink.finalizer"), p = Symbol("Comlink.thrown"), T = (e)=>typeof e == "object" && e !== null || typeof e == "function", W = {
        canHandle: (e)=>T(e) && e[j],
        serialize (e) {
            const { port1: r, port2: t } = new MessageChannel;
            return M(e, r), [
                t,
                [
                    t
                ]
            ];
        },
        deserialize (e) {
            return e.start(), F(e);
        }
    }, D = {
        canHandle: (e)=>T(e) && p in e,
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
            W
        ],
        [
            "throw",
            D
        ]
    ]);
    function H(e, r) {
        for (const t of e)if (r === t || t === "*" || t instanceof RegExp && t.test(r)) return !0;
        return !1;
    }
    function M(e, r = globalThis, t = [
        "*"
    ]) {
        r.addEventListener("message", function s(a) {
            if (!a || !a.data) return;
            if (!H(t, a.origin)) {
                console.warn(`Invalid origin '${a.origin}' for comlink proxy`);
                return;
            }
            const { id: n, type: i, path: o } = Object.assign({
                path: []
            }, a.data), u = (a.data.argumentList || []).map(y);
            let c;
            try {
                const l = o.slice(0, -1).reduce((f, h)=>f[h], e), g = o.reduce((f, h)=>f[h], e);
                switch(i){
                    case "GET":
                        c = g;
                        break;
                    case "SET":
                        l[o.slice(-1)[0]] = y(a.data.value), c = !0;
                        break;
                    case "APPLY":
                        c = g.apply(l, u);
                        break;
                    case "CONSTRUCT":
                        {
                            const f = new g(...u);
                            c = q(f);
                        }
                        break;
                    case "ENDPOINT":
                        {
                            const { port1: f, port2: h } = new MessageChannel;
                            M(e, h), c = v(f, [
                                f
                            ]);
                        }
                        break;
                    case "RELEASE":
                        c = void 0;
                        break;
                    default:
                        return;
                }
            } catch (l) {
                c = {
                    value: l,
                    [p]: 0
                };
            }
            Promise.resolve(c).catch((l)=>({
                    value: l,
                    [p]: 0
                })).then((l)=>{
                const [g, f] = A(l);
                r.postMessage(Object.assign(Object.assign({}, g), {
                    id: n
                }), f), i === "RELEASE" && (r.removeEventListener("message", s), $(r), S in e && typeof e[S] == "function" && e[S]());
            }).catch((l)=>{
                const [g, f] = A({
                    value: new TypeError("Unserializable return value"),
                    [p]: 0
                });
                r.postMessage(Object.assign(Object.assign({}, g), {
                    id: n
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
        return e.addEventListener("message", function(a) {
            const { data: n } = a;
            if (!n || !n.id) return;
            const i = t.get(n.id);
            if (i) try {
                i(n);
            } finally{
                t.delete(n.id);
            }
        }), C(e, t, [], r);
    }
    function E(e) {
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
    function V(e, r) {
        const t = (x.get(r) || 0) + 1;
        x.set(r, t), k && k.register(e, r, e);
    }
    function I(e) {
        k && k.unregister(e);
    }
    function C(e, r, t = [], s = function() {}) {
        let a = !1;
        const n = new Proxy(s, {
            get (i, o) {
                if (E(a), o === z) return ()=>{
                    I(n), L(e), r.clear(), a = !0;
                };
                if (o === "then") {
                    if (t.length === 0) return {
                        then: ()=>n
                    };
                    const u = m(e, r, {
                        type: "GET",
                        path: t.map((c)=>c.toString())
                    }).then(y);
                    return u.then.bind(u);
                }
                return C(e, r, [
                    ...t,
                    o
                ]);
            },
            set (i, o, u) {
                E(a);
                const [c, l] = A(u);
                return m(e, r, {
                    type: "SET",
                    path: [
                        ...t,
                        o
                    ].map((g)=>g.toString()),
                    value: c
                }, l).then(y);
            },
            apply (i, o, u) {
                E(a);
                const c = t[t.length - 1];
                if (c === _) return m(e, r, {
                    type: "ENDPOINT"
                }).then(y);
                if (c === "bind") return C(e, r, t.slice(0, -1));
                const [l, g] = P(u);
                return m(e, r, {
                    type: "APPLY",
                    path: t.map((f)=>f.toString()),
                    argumentList: l
                }, g).then(y);
            },
            construct (i, o) {
                E(a);
                const [u, c] = P(o);
                return m(e, r, {
                    type: "CONSTRUCT",
                    path: t.map((l)=>l.toString()),
                    argumentList: u
                }, c).then(y);
            }
        });
        return V(n, e), n;
    }
    function G(e) {
        return Array.prototype.concat.apply([], e);
    }
    function P(e) {
        const r = e.map(A);
        return [
            r.map((t)=>t[0]),
            G(r.map((t)=>t[1]))
        ];
    }
    const N = new WeakMap;
    function v(e, r) {
        return N.set(e, r), e;
    }
    function q(e) {
        return Object.assign(e, {
            [j]: !0
        });
    }
    function A(e) {
        for (const [r, t] of O)if (t.canHandle(e)) {
            const [s, a] = t.serialize(e);
            return [
                {
                    type: "HANDLER",
                    name: r,
                    value: s
                },
                a
            ];
        }
        return [
            {
                type: "RAW",
                value: e
            },
            N.get(e) || []
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
    function m(e, r, t, s) {
        return new Promise((a)=>{
            const n = X();
            r.set(n, a), e.start && e.start(), e.postMessage(Object.assign({
                id: n
            }, t), s);
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
        "notlast"
    ], J = [
        "framepos"
    ];
    function Z(e) {
        const r = e.toLowerCase();
        return Y.includes(r) ? 0 : J.includes(r) ? 2 : 1;
    }
    function w(e) {
        const { value: r, done: t } = e.next();
        if (t) throw new Error("Unexpected end of input");
        return r;
    }
    function B(e) {
        const t = e.split(/\s+/).filter((s)=>s)[Symbol.iterator]();
        return b(t, 0);
    }
    function b(e, r) {
        let t = "", s, a, n = !1;
        for(;;){
            if ({ value: s, done: a } = e.next(), a) return t;
            const i = s.toLowerCase();
            if (i === "if" || s === "-") {
                n && (t += `
`);
                break;
            }
            if (s.startsWith("/*")) {
                let u = s.endsWith("*/");
                for(t += `${"  ".repeat(r)}${s}`; !u;){
                    const c = w(e);
                    u = c.endsWith("*/"), t += ` ${c}`;
                }
                t += `
`;
                continue;
            }
            t += s;
            let o = Z(i);
            for(; o > 0;)t += ` ${w(e)}`, o--;
            t += `
`, n = !0;
        }
        if (s.toLowerCase() === "if") {
            const i = w(e);
            w(e);
            const o = w(e);
            t += `${"  ".repeat(r)}if ${i} > ${o}
`, t += b(e, r + 1), t += `
`, t += b(e, r + 1);
        } else if (s === "-") {
            const i = w(e), o = w(e);
            t += `${"  ".repeat(r)}- ${i}`, o === "+" || o === "-" ? t += ` ${o} ${w(e)}` : t += ` ${o}`;
        }
        return r === 0 && (t += `
`, t += b(e, 0)), t;
    }
    let R = null, d = [];
    async function K() {
        if (R) return;
        const e = (await import("./jxl-Cf-87UZE.js")).default;
        R = await e({
            locateFile: (r)=>r.endsWith(".wasm") ? new URL("/jxl-art/assets/jxl-DkxV83-1.wasm", import.meta.url).href : r,
            printErr: (r)=>{
                console.error("[libjxl]", r), d.push(r);
            },
            print: (r)=>{
                console.log("[libjxl]", r);
            }
        }), console.log("[Worker] libjxl loaded");
    }
    const Q = {
        async render (e) {
            await K(), d = [];
            let r;
            try {
                r = R.jxl_from_tree(e);
            } catch (n) {
                const i = d.join(`
`), o = n instanceof Error ? n.message : String(n);
                throw new Error(i || `Encode failed: ${o}`);
            }
            if (d.length > 0) {
                const n = d.join(`
`);
                if (n.toLowerCase().includes("error") || n.toLowerCase().includes("fail")) throw new Error(n);
            }
            if (typeof r == "string") throw new Error(r);
            if (!r || r.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Compilation failed - check your tree syntax");
            }
            const t = new Uint8Array(r);
            d = [];
            let s;
            try {
                s = R.decode(t);
            } catch (n) {
                const i = d.join(`
`), o = n instanceof Error ? n.message : String(n);
                throw new Error(i || `Decode failed: ${o}`);
            }
            if (!s || s.length === 0) {
                const n = d.join(`
`);
                throw new Error(n || "Failed to decode JXL to PNG");
            }
            const a = new Uint8Array(s);
            return {
                jxlData: t,
                pngData: a
            };
        },
        prettier (e) {
            return B(e);
        }
    };
    M(Q);
})();
