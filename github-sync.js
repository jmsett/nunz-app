/* Nun'z GitHub synchronization, optional and disabled until manually paired.
 * Never embed a token in this source, the public repo or JSON exports.
 * One remote snapshot protected by GitHub's blob SHA to avoid silent overwrites.
 */
(function () {
  'use strict';
  const CFG_KEY = 'nunz-gh-sync-config-v1';
  const DB_NAME = 'nunz-gh-private-device-v1';
  const OWNER = 'jmsett', REPO = 'nunz-datos', FILE = 'datos/estado.json';
  const API = `https://api.github.com/repos/${OWNER}/${REPO}`;
  const now = () => new Date().toISOString();
  const safeParse = (raw, fallback) => { try { return JSON.parse(raw); } catch { return fallback; } };
  const escapeHtml = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function idbOpen() {
    return new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('secrets');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(new Error('No se puede acceder al almacenamiento privado del dispositivo'));
    });
  }
  async function secretGet() {
    const db = await idbOpen();
    try { return await new Promise((resolve, reject) => {
      const tx = db.transaction('secrets', 'readonly');
      const req = tx.objectStore('secrets').get('github-token');
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(new Error('No se pudo recuperar el token'));
    }); } finally { db.close(); }
  }
  async function secretSet(value) {
    const db = await idbOpen();
    try { await new Promise((resolve, reject) => {
      const tx = db.transaction('secrets', 'readwrite');
      if (value) tx.objectStore('secrets').put(value, 'github-token');
      else tx.objectStore('secrets').delete('github-token');
      tx.oncomplete = resolve;
      tx.onerror = () => reject(new Error('No se pudo guardar la conexión local'));
      tx.onabort = () => reject(new Error('Se canceló el almacenamiento local'));
    }); } finally { db.close(); }
  }
  function encodeBase64UTF8(s) {
    const bytes = new TextEncoder().encode(s);
    let out = '';
    for (let i = 0; i < bytes.length; i += 8192) out += String.fromCharCode(...bytes.slice(i, i + 8192));
    return btoa(out);
  }
  function decodeBase64UTF8(base64) {
    const raw = atob(base64.replace(/\s+/g,''));
    const bytes = Uint8Array.from(raw, c => c.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }
  function message(status, body) {
    const hint = (body && typeof body.message === 'string') ? body.message : '';
    if (status === 401) return 'Token no válido o vencido (401)';
    if (status === 403) return 'Acceso denegado o límite de solicitudes (403)';
    if (status === 404) return 'Repositorio o archivo no encontrado (404). Revisa permisos';
    if (status === 409 || status === 422) return 'El archivo cambió en GitHub; no se sobrescribió (409/422)';
    return `GitHub respondió ${status}${hint ? ': ' + hint.slice(0, 120) : ''}`;
  }
  class NunzGitHubSync {
    constructor({ getState, replaceState, notify, onRefresh, shouldPausePull }) {
      this.getState = getState;
      this.replaceState = replaceState;
      this.notify = notify;
      this.onRefresh = onRefresh;
      this.shouldPausePull = shouldPausePull || (() => false);
      this.cfg = safeParse(localStorage.getItem(CFG_KEY), {}) || {};
      this.cfg.linked = !!this.cfg.linked;
      this.cfg.initialized = !!this.cfg.initialized;
      this.cfg.dirty = !!this.cfg.dirty;
      this.cfg.revision = Number(this.cfg.revision) || 0;
      this.cfg.mode = this.cfg.mode === 'read' ? 'read' : 'write';
      this.cfg.sha = this.cfg.sha || null;
      this.token = null;
      this.busy = false;
      this.timer = null;
      this.status = 'Sin conexión configurada';
      this.lastError = '';
    }
    persist() { localStorage.setItem(CFG_KEY, JSON.stringify(this.cfg)); this.refresh(); }
    refresh() {
      const badge = document.getElementById('ghBadge');
      if (badge) badge.textContent = this.label();
      const status = document.getElementById('ghStatusText');
      if (status) status.textContent = this.label() + (this.cfg.lastSynced ? ` · Última sincronización: ${new Date(this.cfg.lastSynced).toLocaleString('es-GT')}` : '');
    }
    label() {
      if (!this.cfg.linked) return 'Solo en este dispositivo';
      if (!this.token) return 'Conexión pendiente';
      if (this.busy) return 'Sincronizando…';
      if (this.cfg.conflict) return 'Conflicto · sin sobrescribir';
      if (!navigator.onLine) return this.cfg.dirty ? 'Sin internet · cambios pendientes' : 'Sin internet · datos locales';
      if (!this.cfg.initialized) return 'Conectado · configurar primera copia';
      if (this.cfg.dirty) return this.cfg.mode === 'read' ? 'Cambios locales no publicados' : 'Cambios pendientes de enviar';
      return this.lastError ? `Revisar conexión: ${this.lastError}` : '✓ Sincronizado con GitHub';
    }
    async init() {
      try { this.token = await secretGet(); }
      catch (e) { this.lastError = e.message; }
      if (this.cfg.linked && !this.token) this.lastError = 'Token no disponible en este dispositivo';
      this.refresh();
      this.onRefresh();
      if (this.cfg.linked && this.cfg.initialized && this.token) this.schedule(1000);
      window.addEventListener('online', () => this.schedule(900));
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.schedule(1100);
      });
      setInterval(() => { if (document.visibilityState === 'visible') this.schedule(0); }, 120000);
    }
    async request(url, options = {}, candidate = null) {
      const t = candidate || this.token;
      if (!t) throw new Error('Se necesita un token de GitHub configurado en este dispositivo');
      let res;
      try { res = await fetch(url, {
        ...options,
        cache:'no-store',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${t}`,
          'X-GitHub-Api-Version': '2022-11-28',
          ...(options.headers || {})
        }
      }); } catch (e) { throw new Error('No se pudo conectar a GitHub. Comprueba internet e inténtalo otra vez'); }
      const result = await res.json().catch(() => ({}));
      return { res, body: result };
    }
    async verifyRepo(candidate) {
      const {res, body} = await this.request(API, {}, candidate);
      if (!res.ok) throw new Error(message(res.status, body));
      if (!body.private) throw new Error('El repositorio nunz-datos debe ser PRIVADO. Corrige su visibilidad antes de continuar');
    }
    async readFile(candidate = null) {
      const {res, body} = await this.request(API + '/contents/' + FILE, {}, candidate);
      if (res.status === 404) return {exists:false, sha:null, state:null};
      if (!res.ok) throw new Error(message(res.status, body));
      if (!body.content || !body.sha) throw new Error('Archivo de datos inesperado o demasiado grande');
      let doc;
      try { doc = JSON.parse(decodeBase64UTF8(body.content)); }
      catch { throw new Error('El archivo remoto no contiene JSON válido de Nun’z'); }
      if (!doc || doc.schema !== 1 || !doc.state || !Array.isArray(doc.state.sellers) || !doc.state.weeks) {
        throw new Error('El formato remoto no corresponde al de Nun’z; no se ha reemplazado nada');
      }
      return {exists:true, sha:body.sha, state:doc.state};
    }
    async writeFile(state, sha = null) {
      const payload = {
        message: `Nunz: respaldo de ventas ${new Date().toISOString().slice(0, 10)}`,
        content: encodeBase64UTF8(JSON.stringify({schema:1, updatedAt:now(), state})),
        branch: 'main'
      };
      if (sha) payload.sha = sha;
      const {res, body} = await this.request(API + '/contents/' + FILE, {
        method:'PUT', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(message(res.status, body));
      if (!body.content?.sha) throw new Error('GitHub no confirmó la nueva versión');
      return body.content.sha;
    }
    async link(token, mode) {
      if (!token || !/^(github_pat_|ghp_)/.test(token)) throw new Error('Pega un token de acceso de GitHub válido');
      if (this.busy) return;
      this.busy = true; this.refresh();
      try {
        await this.verifyRepo(token);
        const remote = await this.readFile(token);
        await secretSet(token);
        this.token = token;
        this.cfg = {linked:true,initialized:false,dirty:false,conflict:false,revision:0,sha:null,
          mode:mode === 'read' ? 'read' : 'write',remoteExists:remote.exists,lastSynced:null};
        this.lastError = '';
        this.persist();
        this.notify(remote.exists ? 'GitHub conectado. Elige «Usar datos de GitHub».' : 'GitHub conectado. El repositorio aún no contiene datos Nun’z.');
      } catch (e) { this.lastError = e.message; this.notify(e.message); }
      finally { this.busy = false; this.refresh(); this.onRefresh(); }
    }
    async beginPull() {
      if (this.busy) return;
      const hasLocal = this.getState().sellers.length || Object.keys(this.getState().weeks || {}).length;
      if (hasLocal && !confirm('Los datos actuales de este dispositivo se reemplazarán por los de GitHub. Exporta primero tu JSON local si deseas conservarlo. ¿Continuar?')) return;
      this.busy = true; this.refresh();
      try {
        const remote = await this.readFile();
        if (!remote.exists) throw new Error('Todavía no existe un archivo de datos en GitHub');
        this.replaceState(remote.state);
        this.cfg.initialized = true; this.cfg.sha = remote.sha; this.cfg.dirty = false;
        this.cfg.conflict = false; this.cfg.lastSynced = now(); this.cfg.remoteExists = true;
        this.lastError = ''; this.persist();
        this.notify('Datos de GitHub cargados en este dispositivo');
      } catch(e) { this.lastError = e.message; this.notify(e.message); }
      finally { this.busy = false; this.refresh(); this.onRefresh(); }
    }
    async beginCreate() {
      if (this.busy || this.cfg.mode !== 'write') return;
      if (this.getState().demo) { this.notify('Elimina los datos ficticios antes de activar la nube'); return; }
      if (!confirm('Crear la primera copia de los datos de ESTE dispositivo en el repositorio privado nunz-datos. ¿Continuar?')) return;
      this.busy = true; this.refresh();
      try {
        const remote = await this.readFile();
        if (remote.exists) throw new Error('El archivo ya existe: usa «Usar datos de GitHub». No se sobrescribió.');
        const snapshot = JSON.parse(JSON.stringify(this.getState()));
        snapshot.weekDrafts={};snapshot.drafts={};
        const sha = await this.writeFile(snapshot);
        this.cfg.initialized = true; this.cfg.sha = sha; this.cfg.dirty = false;
        this.cfg.conflict = false; this.cfg.lastSynced = now(); this.cfg.remoteExists = true;
        const changedWhileUploading=JSON.stringify(this.getState().sellers)!==JSON.stringify(snapshot.sellers) || JSON.stringify(this.getState().weeks)!==JSON.stringify(snapshot.weeks) || JSON.stringify(this.getState().monthlyGoals)!==JSON.stringify(snapshot.monthlyGoals);
        if(changedWhileUploading){this.cfg.dirty=true;this.cfg.revision+=1;}
        this.lastError = ''; this.persist(); this.notify('✓ Primer respaldo creado en el repositorio privado');
      } catch(e) { this.lastError = e.message; this.notify(e.message); }
      finally { this.busy = false; this.refresh(); this.onRefresh(); if(this.cfg.dirty)this.schedule(1000); }
    }
    changed() {
      if (!this.cfg.linked || !this.cfg.initialized) return;
      this.cfg.revision += 1;
      this.cfg.dirty = true;
      this.persist();
      this.schedule(2300);
    }
    schedule(ms = 1200) {
      if (this.timer) clearTimeout(this.timer);
      if (!this.cfg.linked || !this.cfg.initialized || !this.token || this.busy) return;
      this.timer = setTimeout(() => this.sync(), ms);
    }
    async sync() {
      if (this.busy || !this.cfg.linked || !this.cfg.initialized || !this.token) return;
      if (!navigator.onLine) { this.lastError = ''; this.refresh(); return; }
      if (this.cfg.conflict) { this.refresh(); return; }
      this.busy = true; this.refresh();
      const rev = this.cfg.revision;
      try {
        const remote = await this.readFile();
        if (!remote.exists) throw new Error('El archivo privado desapareció. Por seguridad no se recreó automáticamente');
        if (remote.sha !== this.cfg.sha) {
          if (this.cfg.dirty || this.cfg.revision !== rev) {
            this.cfg.conflict = true; this.persist();
            throw new Error('Conflicto: GitHub cambió y también hay modificaciones locales. No se ha sobrescrito ninguna copia');
          }
          // Prevent the user losing an unsaved field currently being typed.
          if (document.activeElement?.matches('input,textarea') || this.shouldPausePull()) return;
          const localDrafts = this.getState().weekDrafts || {};
          const localOtherDrafts = this.getState().drafts || {};
          this.replaceState({...remote.state,weekDrafts:localDrafts,drafts:localOtherDrafts});
          this.cfg.sha = remote.sha;
          this.cfg.lastSynced = now(); this.cfg.dirty = false;
          this.lastError = ''; this.persist();
        } else if (this.cfg.dirty) {
          if (this.cfg.mode !== 'write') throw new Error('Modo consulta: esta copia no puede subir cambios a GitHub');
          const snapshot = JSON.parse(JSON.stringify(this.getState()));
          snapshot.weekDrafts={};snapshot.drafts={};
          let newSha;
          try{newSha = await this.writeFile(snapshot, remote.sha);}
          catch(e){if(/409|422/.test(e.message)){this.cfg.conflict=true;this.persist();}throw e;}
          this.cfg.sha = newSha;
          this.cfg.lastSynced = now();
          // Changes made while the upload was in flight are still pending.
          this.cfg.dirty = this.cfg.revision !== rev;
          this.lastError = ''; this.persist();
        } else {
          this.cfg.lastSynced = now(); this.lastError = ''; this.persist();
        }
      } catch (e) {
        this.lastError = e.message;
        this.persist();
        // Do not retry indefinitely on authentication errors or a conflict.
      } finally {
        this.busy = false;
        this.refresh();
        if (this.cfg.dirty && !this.cfg.conflict && !this.lastError && this.cfg.mode === 'write') this.schedule(2000);
      }
    }
    async disconnect() {
      if (this.busy) return;
      if (this.cfg.dirty && !confirm('Hay cambios sin sincronizar. Desvincular no los borra de este dispositivo, pero no subirán a GitHub. ¿Continuar?')) return;
      await secretSet(null);
      this.token = null;
      this.cfg = {linked:false,initialized:false,dirty:false,conflict:false,revision:0,sha:null,mode:'write'};
      this.lastError='';this.persist();this.onRefresh();
      this.notify('Este dispositivo ya no está vinculado. Los datos locales se conservan.');
    }
    panelHTML() {
      const status = escapeHtml(this.label());
      if (!this.cfg.linked || !this.token) return `<section class="panel" id="ghSyncPanel"><h2>Sincronización privada · GitHub</h2><p class="helptext">Los datos permanecen en este dispositivo hasta vincularlo. El token se guarda únicamente en este navegador (IndexedDB), nunca en GitHub Pages ni en los respaldos JSON. No está cifrado frente a código malicioso que se ejecute en la misma página.</p><div class="controlrow"><div class="field grow"><label for="ghToken">Token de acceso (solo repositorio nunz-datos)</label><input id="ghToken" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="github_pat_…"/></div><div class="field"><label for="ghMode">Permisos en este teléfono</label><select id="ghMode"><option value="write">Registrar y sincronizar</option><option value="read">Solo consultar</option></select></div><button type="button" class="btn" data-action="ghLink">Vincular GitHub</button></div><p class="hint">Nunca pegues el token en ChatGPT ni lo subas a nunz-app. Debe estar restringido únicamente al repositorio privado nunz-datos.</p></section>`;
      if (!this.cfg.initialized) return `<section class="panel" id="ghSyncPanel"><h2>Sincronización privada · GitHub</h2><p id="ghStatusText" class="note">${status}</p><p class="helptext">Repositorio: <strong>jmsett/nunz-datos</strong>. Elige cómo comenzar sin mezclar datos entre dispositivos.</p><div class="footeract">${this.cfg.remoteExists ? `<button class="btn" data-action="ghPull">Usar datos de GitHub</button>` : (this.cfg.mode==='write' ? `<button class="btn" data-action="ghCreate">Crear primera copia en GitHub</button>` : '<span class="note">Pide al administrador que cree la primera copia desde un dispositivo de registro.</span>')}<button class="btn ghost" data-action="ghDisconnect">Desvincular</button></div></section>`;
      return `<section class="panel" id="ghSyncPanel"><h2>Sincronización privada · GitHub</h2><p class="note" id="ghStatusText">${status}</p><p class="helptext">Repositorio privado: <strong>jmsett/nunz-datos</strong> · ${this.cfg.mode==='write'?'Registro y sincronización':'Solo consulta'}. Los cambios se sincronizan cuando la aplicación esté abierta y con conexión.</p>${this.cfg.conflict?'<p class="note warning">Conflicto detectado. Exporta un JSON de este dispositivo y consulta el historial de GitHub antes de desvincular o recuperar la nube. No se sobrescribirán cambios automáticamente.</p>':''}<div class="footeract"><button class="btn secondary" data-action="ghSync">↻ Sincronizar ahora</button><button class="btn ghost" data-action="ghDisconnect">Desvincular</button></div></section>`;
    }
  }
  window.NunzGitHubSync = NunzGitHubSync;
})();
