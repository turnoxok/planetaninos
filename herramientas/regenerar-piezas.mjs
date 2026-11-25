// Vuelve a armar SOLO las piezas SVG ya armadas (bk-lite / bk-full) con el sitio ya publicado, sin tocar index.html.
// Uso:  node regenerar-piezas.mjs <carpeta-del-sitio> http://localhost:PUERTO/
import fs from 'fs'; import path from 'path'; import zlib from 'zlib';
import {open} from './navegador-sandbox.mjs';
const [out, urlSalida] = [process.argv[2], process.argv[3]];
// 3) piezas ya armadas (hace falta el sitio servido)
if (urlSalida) {
  for (const [q, nombre] of [['1', 'bk-lite'], ['2', 'bk-full']]) {
    for (const e of ['json', 'bin.gz']) fs.rmSync(path.join(out, nombre + '.' + e), {force: true});
    const {b: br, pg} = await open(urlSalida + 'index.html?q=' + q, {w: 1400, h: 900});
    let last = -1, est = 0;
    for (let i = 0; i < 1000; i++) {
      const s = await pg.evaluate(() => ({st: window.__wbStarted || 0, pe: window.__wbPend || 0, n: window.__SVG_GEO ? window.__SVG_GEO.size : 0})).catch(() => null);
      if (s && s.st > 0 && s.pe === 0) { est = s.n === last ? est + 1 : 0; last = s.n; if (est >= 6) break; }
      await pg.waitForTimeout(1000);
    }
    const res = await pg.evaluate(() => {
      const man = {}, chunks = []; let off = 0;
      const push = (ta) => { const u8 = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength); const pad = (4 - (off % 4)) % 4; if (pad) { chunks.push(new Uint8Array(pad)); off += pad; } const o = off; chunks.push(u8.slice()); off += u8.byteLength; return [o, ta.length]; };
      for (const [k, e] of window.__SVG_GEO) {
        man[k] = {asp: e.built.aspect, rev: !!e.built.rev, parts: e.built.parts.map(pt => { const g = pt.geo, p = g.attributes.position, n = g.attributes.normal, u = g.attributes.uv;
          const o = {c: [pt.color.r, pt.color.g, pt.color.b], p: push(new Float32Array(p.array)), n: n ? push(new Float32Array(n.array)) : null, u: u ? push(new Float32Array(u.array)) : null};
          if (g.index) { const big = p.count > 65535; o.i = push(big ? new Uint32Array(g.index.array) : new Uint16Array(g.index.array)); o.big = big; }
          return o; })};
      }
      const tot = new Uint8Array(off); let c = 0; chunks.forEach(x => { tot.set(x, c); c += x.byteLength; });
      let bin = ''; for (let i = 0; i < tot.length; i += 32768) bin += String.fromCharCode.apply(null, tot.subarray(i, i + 32768));
      return {man, b64: btoa(bin), n: window.__SVG_GEO.size};
    });
    fs.writeFileSync(path.join(out, nombre + '.json'), JSON.stringify(res.man));
    fs.writeFileSync(path.join(out, nombre + '.bin.gz'), zlib.gzipSync(Buffer.from(res.b64, 'base64'), {level: 9}));
    console.log('PIEZAS', nombre, res.n, 'formas', Math.round(fs.statSync(path.join(out, nombre + '.bin.gz')).size / 1024), 'KB');
    await br.close();
  }
}
console.log('LISTO', out);
