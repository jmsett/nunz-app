## v17 — Cumplimiento al registrar y resumen completo del ranking

- Al registrar ventas, el porcentaje frente a la meta mensual aparece a la derecha del nombre y se actualiza al escribir ventas o meta. Los campos vacíos o inválidos muestran «—».
- El ranking incluye Cumplimiento, Ventas, Objetivo y Vendedores en pantalla y en el PNG descargado o compartido. En móvil, los cuatro indicadores permanecen juntos y los importes completos con centavos se ajustan a una sola línea.
- El resumen al pie de los gráficos históricos exportados (Ventas, Meta y Cumplimiento) se muestra en negrita.

## v16 — Semana del ranking e importes con centavos

- En móvil, los importes de Ventas en el ranking y de Ventas del período y Objetivo del período en el histórico permanecen completos en una línea.
- Todos los puestos del ranking usan nombre y métricas sobre una barra de ancho completo. Desde el cuarto se conserva el tamaño compacto y el número sin laureles ni corona, también en PNG.
- El histórico abre por defecto en Valor total (Q); sigue disponible la vista de porcentaje.
- Las barras de todos los puestos comparten la misma columna de inicio y ancho en móvil, escritorio y PNG descargado o compartido. Los mensajes compartidos empiezan con «Nun'z Laboratorios:»; el histórico indica el año o rango de años mostrado, la vista mensual o anual y si muestra valor total o porcentaje.

- El ranking mensual indica la última semana con ventas registradas del mes seleccionado. La imagen PNG, su nombre y el texto compartido (incluido WhatsApp) llevan el mismo período y el título «Ranking de ventas». Los registros mensuales antiguos sin desglose semanal y el informe anual conservan su período sin inventar una semana.
- Los importes muestran centavos y usan coma para miles y punto decimal: `Q1,234.56`, tanto en los resúmenes como en el ranking de cada vendedor y las exportaciones.
- Al abrir una semana nueva, las ventas quedan vacías. Se conservan los borradores de esa semana y los valores guardados al corregir reportes existentes. La meta mensual se reutiliza dentro del mismo mes; un mes nuevo sin datos empieza con la meta vacía.
- Los campos de objetivo y ventas separan automáticamente los miles al escribir y completan los dos decimales al salir. El registro sigue siendo acumulado desde el día 1 del mes, con incrementos semanales almacenados a precisión de centavos.

## v15 — Ranking e histórico adaptados a móvil

Ajustes de presentación: resúmenes centrados y labels del ranking simplificados a Cumplimiento, Ventas y Vendedores. En el histórico en Q, el objetivo usa azul y las ventas amarillo, tanto en barras como en líneas y PNG, con leyendas correspondientes. En móvil y tablet, el período queda a la izquierda, centrado verticalmente junto a las tres columnas de Ventas, Objetivo y Cumplimiento. El ranking agrupa el porcentaje grande inmediatamente a la izquierda del monto pequeño, alineados a la derecha, también en PNG.

Los años de la tabla permanecen completos en una línea. En Valor total (Q), los pares Ventas | Objetivo aparecen sobre barras y puntos en etiquetas negras con fondo blanco, dibujadas en una capa por encima de las series. Las etiquetas se escalonan para evitar superposiciones; ya no se muestran tablas debajo de los gráficos. Los montos se abrevian en Q (k = miles, M = millones) y también se incluyen en el PNG. El histórico mensual conserva dos gráficos de seis meses en móvil, igual que en porcentajes; en escritorio se muestra el año completo en un gráfico. El porcentaje se mantiene en la vista de cumplimiento.

- Ranking mensual y anual, ordenado por cumplimiento, con porcentaje y ventas en Q visibles a la vez en pantalla y PNG.
- Histórico mensual y anual con Barras como vista inicial y porcentaje conseguido sobre cada barra. El eje porcentual avanza de 25% en 25%; la línea discontinua de meta al 100% se dibuja por encima de las barras.
- En móvil, el gráfico se divide en grupos de hasta seis períodos para conservar etiquetas legibles. La tabla presenta una ficha compacta por período con ventas, objetivo y cumplimiento, sin desplazamiento horizontal.
- Descargar PNG y Compartir usan iconos con etiquetas accesibles en ranking e histórico, incluidas las vistas de líneas y tabla.
- El registro semanal sigue disponible; al terminar regresa al ranking mensual. Se conservan el almacenamiento, los datos y la sincronización existentes.
- Se renueva la versión del caché de la PWA para cargar la interfaz actualizada.

## v14 — Laureles aprobados

Actualización visual exclusivamente: los laureles de los primeros tres puestos y la corona del primero se reproducen con los mismos vectores aprobados en `nunz_laureles_estudio.html`, extraídos del concepto `1000106242.jpg`. Se dibujan con la misma función en pantalla y exportación PNG.

No modifica la lógica de ventas, los JSON, la autenticación ni la sincronización de GitHub. El `sw.js` cambia la clave del caché para renovar la PWA instalada.

# Nun’z v13 — Laureles más bajos (≈60°)

Actualización visual puntual sobre v12. Los laureles del Top 3 comienzan en la misma base, pero terminan cerca de 60° desde la horizontal. Las hojas conservan sus proporciones porque se rota y escala la rama uniformemente; la segunda rama se refleja simétricamente. La corona del primer lugar conserva su posición.

El cambio afecta tanto al ranking en pantalla como al ranking PNG exportado; el almacenamiento, los permisos de GitHub, la sincronización y los datos existentes no se modifican.

## Publicación

Sustituye los archivos en `jmsett/nunz-app` con los de este ZIP y publica a `main`. `sw.js` incorpora una versión de caché nueva para que la PWA reciba la actualización cuando vuelva a abrirse con internet.

# Nun’z v12 — Sincronización discreta y modo consulta seguro

Actualización sobre v11. Conserva los mismos identificadores de almacenamiento local (`nunz-sales-v2` y `nunz-gh-sync-config-v1`) y el archivo privado `datos/estado.json`. No se incluyen credenciales ni registros reales.

## Novedades

- El encabezado deja de mostrar GitHub. Un indicador discreto aparece al final de la página.
- `Equipo de ventas` ahora prioriza vendedores. Las opciones de sincronización, exportación e importación JSON quedan dentro de **Administración y respaldos** (menú cerrado inicialmente).
- En **Ranking**, ya no aparece el botón Respaldo JSON.
- El modo **Solo consultar** impide añadir, editar, archivar, eliminar, registrar ventas e importar respaldos. Se siguen permitiendo consultas y exportar JSON local.
- Desde **Administración y respaldos → Recuperar datos desde GitHub** se sustituye la copia local por la remota. Si hay cambios pendientes/conflicto, el usuario debe escribir `RESTAURAR` (se borrarán los cambios locales no publicados). Exporta un JSON antes si es necesario.
- Desvincular exige escribir `DESVINCULAR`, y está detrás de un submenú adicional.

## Despliegue

Copia todos los archivos de este paquete a `jmsett/nunz-app` y publica con GitHub Pages desde `main`. No subas tokens ni archivos `estado.json` de ventas al repositorio público.

## Importante

Un desplegable es una barrera visual, **no un control de acceso**. El modo consulta protege la interfaz de escrituras, pero no sustituye un token GitHub de permisos limitados. Si quieres recuperar cambios de prueba realizados antes en un dispositivo de solo consulta, exporta respaldo desde ese dispositivo y después utiliza **Recuperar datos desde GitHub**. Esta operación descarta esas modificaciones locales y restablece la sincronización de lectura.

No se fusionan automáticamente dos copias divergentes. La protección SHA evita sobrescrituras silenciosas; para un conflicto real de dos escritores, conservar ambos respaldos y resolver manualmente.

## Recomendación para el iPhone

Vincula el iPhone del usuario principal en modo **Registrar y sincronizar**, y utiliza **Solo consultar** en dispositivos que solo deban visualizar. Las actualizaciones automáticas de un service worker pueden requerir cerrar y volver a abrir la PWA.

## Novedades v11: gestión de vendedores

- **Editar:** cambia el nombre de un vendedor sin alterar su identificador ni el historial vinculado. Impide duplicados.
- **Archivar / Reactivar:** conserva las ventas y objetivos.
- **Eliminar:** disponible para activos y archivados. Abre un diálogo con el recuento de registros afectados, exige escribir `ELIMINAR` y permite exportar un JSON previo. Borra entradas del vendedor en `sellers`, `weeks`, `records`, `monthlyGoals`, `weekDrafts`, `drafts` y `monthlyGoalReview`.
- La baja se guarda en el dispositivo y se sincroniza con GitHub por el mecanismo de la v10. No se fusionan automáticamente ediciones simultáneas: los conflictos siguen bloqueados por SHA.
- Antes de eliminar información real, verifica que se muestre **✓ Sincronizado con GitHub** y guarda una copia JSON externa si deseas recuperación sencilla.
- Después de publicar la v11, abre la PWA con internet para recibir el nuevo service worker y comprueba la edición/baja con un vendedor ficticio.

# Nun’z Ventas — PWA con sincronización de GitHub (prototipo v11)

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
