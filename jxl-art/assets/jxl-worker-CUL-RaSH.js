(async ()=>{
    const C = Symbol("Comlink.proxy"), N = Symbol("Comlink.endpoint"), j = Symbol("Comlink.releaseProxy"), R = Symbol("Comlink.finalizer"), E = Symbol("Comlink.thrown"), T = (e)=>typeof e == "object" && e !== null || typeof e == "function", z = {
        canHandle: (e)=>T(e) && e[C],
        serialize (e) {
            const { port1: t, port2: r } = new MessageChannel;
            return P(e, t), [
                r,
                [
                    r
                ]
            ];
        },
        deserialize (e) {
            return e.start(), U(e);
        }
    }, W = {
        canHandle: (e)=>T(e) && E in e,
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
            z
        ],
        [
            "throw",
            W
        ]
    ]);
    function H(e, t) {
        for (const r of e)if (t === r || r === "*" || r instanceof RegExp && r.test(t)) return !0;
        return !1;
    }
    function P(e, t = globalThis, r = [
        "*"
    ]) {
        t.addEventListener("message", function n(s) {
            if (!s || !s.data) return;
            if (!H(r, s.origin)) {
                console.warn(`Invalid origin '${s.origin}' for comlink proxy`);
                return;
            }
            const { id: i, type: c, path: o } = Object.assign({
                path: []
            }, s.data), u = (s.data.argumentList || []).map(w);
            let a;
            try {
                const l = o.slice(0, -1).reduce((f, m)=>f[m], e), g = o.reduce((f, m)=>f[m], e);
                switch(c){
                    case "GET":
                        a = g;
                        break;
                    case "SET":
                        l[o.slice(-1)[0]] = w(s.data.value), a = !0;
                        break;
                    case "APPLY":
                        a = g.apply(l, u);
                        break;
                    case "CONSTRUCT":
                        {
                            const f = new g(...u);
                            a = v(f);
                        }
                        break;
                    case "ENDPOINT":
                        {
                            const { port1: f, port2: m } = new MessageChannel;
                            P(e, m), a = G(f, [
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
            } catch (l) {
                a = {
                    value: l,
                    [E]: 0
                };
            }
            Promise.resolve(a).catch((l)=>({
                    value: l,
                    [E]: 0
                })).then((l)=>{
                const [g, f] = k(l);
                t.postMessage(Object.assign(Object.assign({}, g), {
                    id: i
                }), f), c === "RELEASE" && (t.removeEventListener("message", n), _(t), R in e && typeof e[R] == "function" && e[R]());
            }).catch((l)=>{
                const [g, f] = k({
                    value: new TypeError("Unserializable return value"),
                    [E]: 0
                });
                t.postMessage(Object.assign(Object.assign({}, g), {
                    id: i
                }), f);
            });
        }), t.start && t.start();
    }
    function D(e) {
        return e.constructor.name === "MessagePort";
    }
    function _(e) {
        D(e) && e.close();
    }
    function U(e, t) {
        const r = new Map;
        return e.addEventListener("message", function(s) {
            const { data: i } = s;
            if (!i || !i.id) return;
            const c = r.get(i.id);
            if (c) try {
                c(i);
            } finally{
                r.delete(i.id);
            }
        }), M(e, r, [], t);
    }
    function h(e) {
        if (e) throw new Error("Proxy has been released and is not useable");
    }
    function $(e) {
        return y(e, new Map, {
            type: "RELEASE"
        }).then(()=>{
            _(e);
        });
    }
    const b = new WeakMap, x = "FinalizationRegistry" in globalThis && new FinalizationRegistry((e)=>{
        const t = (b.get(e) || 0) - 1;
        b.set(e, t), t === 0 && $(e);
    });
    function F(e, t) {
        const r = (b.get(t) || 0) + 1;
        b.set(t, r), x && x.register(e, t, e);
    }
    function V(e) {
        x && x.unregister(e);
    }
    function M(e, t, r = [], n = function() {}) {
        let s = !1;
        const i = new Proxy(n, {
            get (c, o) {
                if (h(s), o === j) return ()=>{
                    V(i), $(e), t.clear(), s = !0;
                };
                if (o === "then") {
                    if (r.length === 0) return {
                        then: ()=>i
                    };
                    const u = y(e, t, {
                        type: "GET",
                        path: r.map((a)=>a.toString())
                    }).then(w);
                    return u.then.bind(u);
                }
                return M(e, t, [
                    ...r,
                    o
                ]);
            },
            set (c, o, u) {
                h(s);
                const [a, l] = k(u);
                return y(e, t, {
                    type: "SET",
                    path: [
                        ...r,
                        o
                    ].map((g)=>g.toString()),
                    value: a
                }, l).then(w);
            },
            apply (c, o, u) {
                h(s);
                const a = r[r.length - 1];
                if (a === N) return y(e, t, {
                    type: "ENDPOINT"
                }).then(w);
                if (a === "bind") return M(e, t, r.slice(0, -1));
                const [l, g] = S(u);
                return y(e, t, {
                    type: "APPLY",
                    path: r.map((f)=>f.toString()),
                    argumentList: l
                }, g).then(w);
            },
            construct (c, o) {
                h(s);
                const [u, a] = S(o);
                return y(e, t, {
                    type: "CONSTRUCT",
                    path: r.map((l)=>l.toString()),
                    argumentList: u
                }, a).then(w);
            }
        });
        return F(i, e), i;
    }
    function I(e) {
        return Array.prototype.concat.apply([], e);
    }
    function S(e) {
        const t = e.map(k);
        return [
            t.map((r)=>r[0]),
            I(t.map((r)=>r[1]))
        ];
    }
    const L = new WeakMap;
    function G(e, t) {
        return L.set(e, t), e;
    }
    function v(e) {
        return Object.assign(e, {
            [C]: !0
        });
    }
    function k(e) {
        for (const [t, r] of O)if (r.canHandle(e)) {
            const [n, s] = r.serialize(e);
            return [
                {
                    type: "HANDLER",
                    name: t,
                    value: n
                },
                s
            ];
        }
        return [
            {
                type: "RAW",
                value: e
            },
            L.get(e) || []
        ];
    }
    function w(e) {
        switch(e.type){
            case "HANDLER":
                return O.get(e.name).deserialize(e.value);
            case "RAW":
                return e.value;
        }
    }
    function y(e, t, r, n) {
        return new Promise((s)=>{
            const i = q();
            t.set(i, s), e.start && e.start(), e.postMessage(Object.assign({
                id: i
            }, r), n);
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
        "notlast"
    ], Y = [
        "framepos"
    ];
    function J(e) {
        const t = e.toLowerCase();
        return X.includes(t) ? 0 : Y.includes(t) ? 2 : 1;
    }
    function d(e) {
        const { value: t, done: r } = e.next();
        if (r) throw new Error("Unexpected end of input");
        return t;
    }
    function Z(e) {
        const r = e.split(/\s+/).filter((n)=>n)[Symbol.iterator]();
        return p(r, 0);
    }
    function p(e, t) {
        let r = "", n, s, i = !1;
        for(;;){
            if ({ value: n, done: s } = e.next(), s) return r;
            const c = n.toLowerCase();
            if (c === "if" || n === "-") {
                i && (r += `
`);
                break;
            }
            if (n.startsWith("/*")) {
                let u = n.endsWith("*/");
                for(r += `${"  ".repeat(t)}${n}`; !u;){
                    const a = d(e);
                    u = a.endsWith("*/"), r += ` ${a}`;
                }
                r += `
`;
                continue;
            }
            r += n;
            let o = J(c);
            for(; o > 0;)r += ` ${d(e)}`, o--;
            r += `
`, i = !0;
        }
        if (n.toLowerCase() === "if") {
            const c = d(e);
            d(e);
            const o = d(e);
            r += `${"  ".repeat(t)}if ${c} > ${o}
`, r += p(e, t + 1), r += `
`, r += p(e, t + 1);
        } else if (n === "-") {
            const c = d(e), o = d(e);
            r += `${"  ".repeat(t)}- ${c}`, o === "+" || o === "-" ? r += ` ${o} ${d(e)}` : r += ` ${o}`;
        }
        return t === 0 && (r += `
`, r += p(e, 0)), r;
    }
    let A = null;
    async function B() {
        if (A) return;
        const e = (await import("./jxl-Cf-87UZE.js")).default;
        A = await e({
            locateFile: (t)=>t.endsWith(".wasm") ? new URL("/jxl-art/assets/jxl-DkxV83-1.wasm", import.meta.url).href : t
        }), console.log("[Worker] libjxl loaded");
    }
    const K = {
        async render (e) {
            await B();
            const t = A.jxl_from_tree(e);
            if (typeof t == "string") throw new Error(t);
            if (!t || t.length === 0) throw new Error("jxl_from_tree returned empty result");
            const r = new Uint8Array(t), n = A.decode(r);
            if (!n || n.length === 0) throw new Error("Failed to decode JXL to PNG");
            const s = new Uint8Array(n);
            return {
                jxlData: r,
                pngData: s
            };
        },
        prettier (e) {
            return Z(e);
        }
    };
    P(K);
})();
