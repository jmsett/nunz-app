# Nun’z Ventas — PWA con sincronización de GitHub (prototipo v10)

Esta versión agrega sincronización opcional con **dos repositorios separados**:

- `jmsett/nunz-app`: PWA pública alojada con GitHub Pages. No debe contener secretos ni ventas reales.
- `jmsett/nunz-datos`: repositorio **privado** con un archivo `datos/estado.json`, creado por la propia PWA al activar la primera copia.

El almacenamiento local sigue funcionando sin conexión. Los datos se envían a GitHub cuando la aplicación está abierta y conectada. No hay sincronización garantizada en segundo plano con la PWA cerrada en iOS.

## Publicación de esta versión

1. Haz una copia de seguridad JSON desde tu PWA anterior **antes de cambiar de versión**.
2. Sustituye los archivos de la raíz de `jmsett/nunz-app` por el contenido de este ZIP, conservando la estructura de directorios.
3. `git add -A && git commit -m "Nunz: sincronización GitHub v10" && git push origin main`
4. Abre `https://jmsett.github.io/nunz-app/` con internet; recarga una vez si el service worker todavía muestra la versión anterior.
5. Ve a **Equipo de ventas** y localiza la sección **Sincronización privada · GitHub**.

**No pegues ningún token en el repositorio ni en ChatGPT.** El código se publica sin credenciales.

## Cómo preparar un token en GitHub (siguiente etapa)

En GitHub abre: `Settings > Developer settings > Personal access tokens > Fine-grained tokens`.

Crea un token restringido a:
- Resource owner: `jmsett`.
- Repository access: **Only select repositories** → `nunz-datos` únicamente.
- Repository permissions: **Contents: Read and write** para el dispositivo de registro; **Contents: Read-only** para un dispositivo de consulta.
- Expiración definida (GitHub recomienda un vencimiento). Apunta la fecha para renovarlo antes de que caduque.

Introduce el token **solo en el formulario de la PWA en tu propio dispositivo**. Se guarda en IndexedDB del navegador; ningún token se sube a GitHub mediante la sincronización ni aparece en los JSON de ventas. No es almacenamiento a prueba de malware/XSS: cualquier script que se ejecute con el origen de la PWA podría acceder a él. Limita el token y revócalo si se pierde un teléfono.

### Primera conexión

**Primer dispositivo, con los datos iniciales**
1. Abre Equipo de ventas → Sincronización GitHub.
2. Introduce el token del dispositivo de registro y elige `Registrar y sincronizar`.
3. Vincula GitHub y selecciona **Crear primera copia en GitHub** cuando el repositorio todavía no tenga `datos/estado.json`.
4. La app creará el archivo en `nunz-datos`; registra un vendedor de prueba y verifica en GitHub que se haya actualizado.

**Segundo dispositivo, principalmente para consultar**
1. Genera un token distinto, restringido al mismo repositorio con `Contents: Read-only`.
2. Abre la PWA y vincula GitHub en modo **Solo consultar**.
3. Pulsa **Usar datos de GitHub** para recuperar el estado. La app pedirá confirmación si ya existen datos locales.
4. Al abrirla con conexión, la copia se actualiza; también puedes pulsar `Sincronizar ahora`.

## Comportamiento y protección de datos

- Los cálculos, el registro semanal acumulado y las gráficas siguen funcionando sin internet.
- Al completar una semana, las modificaciones locales se conservan y se intenta enviar una copia a GitHub.
- El archivo remoto incluye ventas semanales (incrementos), metas mensuales, vendedores e historial; no incluye los borradores incompletos ni tokens.
- La API requiere el `sha` actual del archivo. Si otro dispositivo lo modificó mientras hay cambios locales, la app **bloquea la sobrescritura** y muestra un conflicto.
- En caso de conflicto, exporta primero el JSON local y revisa los dos estados antes de recuperarlos o combinarlos manualmente. La app **todavía no resuelve conflictos automáticamente**.
- El repositorio privado conserva historial de commits, pero esto no sustituye un respaldo externo independiente.
- Esta primera integración funciona mejor con **un único dispositivo editor** (iPhone de tu papá) y otro de **solo consulta** para ti. Para dos editores concurrentes habrá que implementar una estrategia de fusión de cambios.
- La PWA puede continuar con datos pendientes si no tiene internet. No puede garantizar sincronización con la app cerrada en segundo plano (iOS).
- Una reinstalación, cambio de origen, borrado de datos de Safari o expiración/revocación del token puede requerir volver a vincular el dispositivo.
- El token no está cifrado frente a scripts que corran en el mismo origen; evita incrustar bibliotecas o HTML de terceros y revisa los cambios antes de publicarlos.
- Esta PWA sigue permitiendo exportar un JSON manual por precaución. La descarga automática al finalizar la semana se omite mientras la nube está vinculada y funcionando.

## Límite importante de GitHub Pages

GitHub indica que Pages no está destinado a alojar servicios para operar negocios en línea o software comercial como servicio. Antes de usar esta herramienta interna con datos reales en producción, revisa si tu caso cumple las condiciones de GitHub. El prototipo técnico no equivale a una autorización de uso comercial del alojamiento.

## Archivos añadidos respecto a v9

- `github-sync.js`: API REST, token local, creación/carga de datos, SHA, sincronización y estados.
- `index.html`: nueva sección de conexión GitHub en Equipo de ventas, indicador de estado y restauración JSON.
- `sw.js`: caché v10 que incluye `github-sync.js` para que la interfaz siga abriendo sin conexión.

Consulta la documentación oficial de GitHub sobre **Contents API**, **fine-grained tokens** y **GitHub Pages limits** para validar permisos y restricciones.
