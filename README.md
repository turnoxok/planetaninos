# Planeta Niños — web definitiva (tuweeb)

Punto de partida: la demo `https://demo.tuweeb.com/?d=planetaninos`.
Este repo es del cliente: acá se edita el 3D (`editor.html` → Exportar index.html), las páginas y el panel.

## Conexión con el admin de tuweeb
- `tema.js` tiene `CLIENTE='planetaninos'`: siempre usa el pedido `planetaninos` de la fábrica (marca, mail del panel, pagos, vencimientos).
- Si en el admin se pone "Suspender web", el sitio, el panel y las reservas muestran el cartel de suspendido.
- Los pagos, vencimientos e historial se siguen gestionando desde https://demo.tuweeb.com/admin/

## Pendiente para salir al aire
1. **Backend propio** (Apps Script + planilla del cliente): hoy el panel y las reservas guardan en el navegador (modo demo). Hay que pasarlos a `reservas/backend` del repo `weeb` con `armar_cliente.py`, y cargar como datos iniciales la copia que está en Drive (`tuweeb-respaldos/planetaninos.json`).
2. **Dominio** `planetaninos.com`: comprar, agregar `CNAME` y actualizar las etiquetas `og:url`/`og:image` de `index.html`.
3. Re-exportar el 3D con el logo y colores definitivos (hoy los toma de la demo al cargar).
