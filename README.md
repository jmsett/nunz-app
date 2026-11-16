# Nun’z Ventas — PWA para GitHub Pages

Proyecto de interfaz PWA basado en Nun’z v8. **No incluye sincronización GitHub todavía**.

## Publicación

1. Crear/abrir `jmsett/nunz-app` (código público, sin datos reales ni tokens).
2. Subir los archivos de esta carpeta a la raíz de la rama `main`.
3. GitHub → Settings → Pages → Build and deployment → Deploy from a branch → `main` → `/(root)` → Save.
4. Abrir `https://jmsett.github.io/nunz-app/` desde Safari (iPhone) o Chrome (Android).
5. Tras una visita online y la instalación del *service worker*, abrir de nuevo sin conexión y comprobar el funcionamiento.

## Instalar

- **iPhone:** Safari → Compartir → Añadir a pantalla de inicio → Abrir como app.
- **Android:** Chrome → menú → Instalar aplicación / Añadir a pantalla de inicio.

## Consideraciones de seguridad y datos

- Esta entrega **no sincroniza** con `nunz-datos` y **no contiene credenciales**.
- El almacenamiento local depende de dispositivo, navegador y origen (dominio). Datos de un HTML local anterior **no aparecen automáticamente** en la PWA; exportar JSON del anterior e importar en la nueva, si ya se ingresaron datos.
- La PWA arranca **sin datos ficticios** al primer uso. Agregar vendedores, o importar JSON válido.
- Los respaldos JSON automáticos siguen siendo descargas en esta versión. Evita confiar únicamente en el almacenamiento del iPhone.
- El repositorio `nunz-app` es público: no subir jamás tokens, archivos de ventas o respaldos.
- La instalación offline requiere una primera carga exitosa con HTTPS; el *service worker* puede tardar hasta una recarga en controlar la página.
- Cambiar la URL/origen de instalación puede provocar un almacenamiento separado. Mantener la URL estable.

## Actualizaciones futuras

- `sw.js` hace caché del shell local para uso sin conexión. Cuando se actualicen archivos estáticos, cambiar `CACHE_NAME` a una nueva versión.
- Una futura integración con GitHub API tendrá que autenticar de forma segura, manejar colisiones de versiones y no filtrar tokens al repositorio público.
- GitHub Pages tiene restricciones de uso comercial. Verificar que el despliegue interno cumple los términos de GitHub antes de usarlo en producción.
