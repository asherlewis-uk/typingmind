/**
 * TypingMind Native Bridge
 * Full Capacitor plugin integration for gestures, haptics, and native interactions
 * Uses Capacitor.Plugins globals — works in native webview without a bundler
 */

(function initNativeBridge() {
  const cap = typeof window !== 'undefined' && window.Capacitor;
  const isNative = cap && cap.isNativePlatform && cap.isNativePlatform();
  const isAndroid = isNative && cap.getPlatform() === 'android';
  const isIOS = isNative && cap.getPlatform() === 'ios';
  const Plugins = cap && cap.Plugins;

  if (!isNative || !Plugins) {
    console.log('[NativeBridge] Running in web mode — native features disabled');
    window.Native = createWebFallback();
    return;
  }

  console.log('[NativeBridge] Initializing native platform:', cap.getPlatform());

  // Destructure all registered plugins from the global Capacitor.Plugins object
  const {
    App, Haptics, Keyboard, StatusBar, SplashScreen,
    ActionSheet, Toast, Browser, Clipboard, Device,
    Network, ScreenOrientation, Motion, Geolocation,
    LocalNotifications, PushNotifications, Camera,
    Filesystem, Share, Preferences, Dialog,
    ScreenReader, TextZoom, KeepAwake,
  } = Plugins;

  // ── Native API Surface ──
  window.Native = {
    platform: cap.getPlatform(),
    isNative: true,
    isAndroid,
    isIOS,

    // ── App Lifecycle ──
    app: {
      getInfo() { return App.getInfo(); },
      getState() { return App.getState(); },
      minimizeApp() { return App.minimizeApp(); },
      onResume(cb) { return App.addListener('resume', cb); },
      onPause(cb) { return App.addListener('pause', cb); },
      onAppUrlOpen(cb) { return App.addListener('appUrlOpen', cb); },
      onBackButton(cb) { return App.addListener('backButton', cb); },
    },

    // ── Haptics (Gestures & Feedback) ──
    haptics: {
      impact(style = 'medium') {
        return Haptics ? Haptics.impact({ style }).catch(() => {}) : Promise.resolve();
      },
      impactLight() { return this.impact('light'); },
      impactMedium() { return this.impact('medium'); },
      impactHeavy() { return this.impact('heavy'); },
      notification(type = 'success') {
        return Haptics ? Haptics.notification({ type }).catch(() => {}) : Promise.resolve();
      },
      notificationSuccess() { return this.notification('success'); },
      notificationWarning() { return this.notification('warning'); },
      notificationError() { return this.notification('error'); },
      selectionStart() { return Haptics ? Haptics.selectionStart().catch(() => {}) : Promise.resolve(); },
      selectionChanged() { return Haptics ? Haptics.selectionChanged().catch(() => {}) : Promise.resolve(); },
      selectionEnd() { return Haptics ? Haptics.selectionEnd().catch(() => {}) : Promise.resolve(); },
      vibrate(duration = 300) {
        if ('vibrate' in navigator) navigator.vibrate(duration);
      },
    },

    // ── Keyboard ──
    keyboard: {
      show() { return Keyboard.show(); },
      hide() { return Keyboard.hide(); },
      setAccessoryBarVisible(isVisible) { return Keyboard.setAccessoryBarVisible({ isVisible }); },
      setScroll(opts) { return Keyboard.setScroll({ isDisabled: opts?.isDisabled ?? false }); },
      onKeyboardWillShow(cb) { return Keyboard.addListener('keyboardWillShow', cb); },
      onKeyboardWillHide(cb) { return Keyboard.addListener('keyboardWillHide', cb); },
      onKeyboardDidShow(cb) { return Keyboard.addListener('keyboardDidShow', cb); },
      onKeyboardDidHide(cb) { return Keyboard.addListener('keyboardDidHide', cb); },
    },

    // ── Status Bar ──
    statusBar: {
      show() { return StatusBar.show(); },
      hide() { return StatusBar.hide(); },
      setStyle(style) {
        const s = style === 'light' ? 'LIGHT' : 'DARK';
        return StatusBar.setStyle({ style: s });
      },
      setBackgroundColor(color) { return StatusBar.setBackgroundColor({ color }); },
      setOverlaysWebView(overlay) { return StatusBar.setOverlaysWebView({ overlay }); },
    },

    // ── Splash Screen ──
    splashScreen: {
      show() { return SplashScreen.show({ showDuration: 2000, autoHide: true }); },
      hide() { return SplashScreen.hide({ fadeOutDuration: 500 }); },
    },

    // ── Action Sheet ──
    actionSheet: {
      show(options) {
        return ActionSheet.showActionSheet({
          title: options.title,
          message: options.message,
          options: options.options || [],
        });
      },
    },

    // ── Toast ──
    toast: {
      show(options) {
        return Toast.show({
          text: options.text || options.message || '',
          duration: options.duration === 'long' ? 'long' : 'short',
          position: options.position || 'bottom',
        });
      },
      showShort(message, position = 'bottom') {
        return this.show({ text: message, duration: 'short', position });
      },
      showLong(message, position = 'bottom') {
        return this.show({ text: message, duration: 'long', position });
      },
    },

    // ── Browser ──
    browser: {
      open(url, options = {}) {
        return Browser.open({ url, presentationStyle: options.presentationStyle || 'default' });
      },
      close() { return Browser.close(); },
      addListener(event, cb) { return Browser.addListener(event, cb); },
    },

    // ── Clipboard ──
    clipboard: {
      copy(text) { return Clipboard.write({ string: text }); },
      paste() { return Clipboard.read().then(r => r.value); },
    },

    // ── Device ──
    device: {
      getInfo() { return Device.getInfo(); },
      getBatteryInfo() { return Device.getBatteryInfo(); },
      getLanguageCode() { return Device.getLanguageCode(); },
      isVirtual() { return Device.getInfo().then(i => i.isVirtual); },
    },

    // ── Network ──
    network: {
      getStatus() { return Network.getStatus(); },
      onChange(cb) { return Network.addListener('networkStatusChange', cb); },
    },

    // ── Screen Orientation ──
    screenOrientation: {
      lock(orientation) { return ScreenOrientation.lock({ orientation }); },
      unlock() { return ScreenOrientation.unlock(); },
      getCurrentOrientation() { return ScreenOrientation.getCurrentOrientation(); },
      onChange(cb) { return ScreenOrientation.addListener('screenOrientationChange', cb); },
    },

    // ── Motion (Accelerometer / Gyroscope for Gestures) ──
    motion: {
      addListener(event, cb) { return Motion.addListener(event, cb); },
      removeAllListeners() { return Motion.removeAllListeners(); },
      onAccel(cb) { return this.addListener('accel', cb); },
      onOrientation(cb) { return this.addListener('orientation', cb); },
    },

    // ── Geolocation ──
    geolocation: {
      getCurrentPosition(options) { return Geolocation.getCurrentPosition(options); },
      watchPosition(cb, options) { return Geolocation.watchPosition(options, cb); },
      clearWatch(id) { return Geolocation.clearWatch({ id }); },
      checkPermissions() { return Geolocation.checkPermissions(); },
      requestPermissions() { return Geolocation.requestPermissions(); },
    },

    // ── Camera ──
    camera: {
      getPhoto(options = {}) {
        return Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing ?? false,
          resultType: options.resultType || 'uri',
          source: options.source || 'prompt',
          direction: options.direction || 'rear',
          width: options.width,
          height: options.height,
          promptLabelHeader: options.promptLabelHeader || 'Choose an option',
          promptLabelCancel: options.promptLabelCancel || 'Cancel',
          promptLabelPhoto: options.promptLabelPhoto || 'Take Photo',
          promptLabelPicture: options.promptLabelPicture || 'Choose from Library',
        });
      },
      checkPermissions() { return Camera.checkPermissions(); },
      requestPermissions() { return Camera.requestPermissions(); },
    },

    // ── Filesystem ──
    filesystem: {
      Directory: cap.FilesystemDirectory || {},
      Encoding: cap.FilesystemEncoding || {},
      readFile(options) { return Filesystem.readFile(options); },
      writeFile(options) { return Filesystem.writeFile(options); },
      appendFile(options) { return Filesystem.appendFile(options); },
      deleteFile(options) { return Filesystem.deleteFile(options); },
      mkdir(options) { return Filesystem.mkdir(options); },
      rmdir(options) { return Filesystem.rmdir(options); },
      readdir(options) { return Filesystem.readdir(options); },
      getUri(options) { return Filesystem.getUri(options); },
      stat(options) { return Filesystem.stat(options); },
      rename(options) { return Filesystem.rename(options); },
      copy(options) { return Filesystem.copy(options); },
      checkPermissions() { return Filesystem.checkPermissions(); },
      requestPermissions() { return Filesystem.requestPermissions(); },
    },

    // ── Share ──
    share: {
      share(options) {
        return Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || 'Share',
          files: options.files,
        });
      },
      canShare() { return Share.canShare(); },
    },

    // ── Preferences (Native Key-Value Storage) ──
    preferences: {
      get(key) { return Preferences.get({ key }).then(r => r.value); },
      set(key, value) { return Preferences.set({ key, value }); },
      remove(key) { return Preferences.remove({ key }); },
      clear() { return Preferences.clear(); },
      keys() { return Preferences.keys().then(r => r.keys); },
      async migrateFromLocalStorage() {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
          const value = localStorage.getItem(key);
          if (value !== null) await Preferences.set({ key, value });
        }
        console.log('[NativeBridge] Migrated', keys.length, 'items to native Preferences');
      },
    },

    // ── Dialog ──
    dialog: {
      alert(message, title = 'Alert') { return Dialog.alert({ title, message }); },
      confirm(message, title = 'Confirm') {
        return Dialog.confirm({ title, message }).then(r => r.value);
      },
      prompt(message, title = 'Prompt', okButtonTitle = 'OK', cancelButtonTitle = 'Cancel', inputPlaceholder = '') {
        return Dialog.prompt({ title, message, okButtonTitle, cancelButtonTitle, inputPlaceholder });
      },
    },

    // ── Screen Reader ──
    screenReader: {
      isEnabled() { return ScreenReader.isEnabled().then(r => r.value); },
      speak(options) { return ScreenReader.speak(options); },
      onChange(cb) { return ScreenReader.addListener('stateChange', cb); },
    },

    // ── Text Zoom ──
    textZoom: {
      get() { return TextZoom.get().then(r => r.value); },
      set(value) { return TextZoom.set({ value }); },
    },

    // ── Keep Awake ──
    keepAwake: {
      enable() { return KeepAwake.keepAwake(); },
      disable() { return KeepAwake.allowSleep(); },
      isEnabled() { return KeepAwake.isSupported().then(r => r.isSupported); },
    },

    // ── Local Notifications ──
    localNotifications: {
      schedule(options) {
        return LocalNotifications.schedule({ notifications: Array.isArray(options) ? options : [options] });
      },
      cancel(options) { return LocalNotifications.cancel(options); },
      getPending() { return LocalNotifications.getPending().then(r => r.notifications); },
      registerActionTypes(types) { return LocalNotifications.registerActionTypes({ types }); },
      checkPermissions() { return LocalNotifications.checkPermissions(); },
      requestPermissions() { return LocalNotifications.requestPermissions(); },
      onReceive(cb) { return LocalNotifications.addListener('localNotificationReceived', cb); },
      onAction(cb) { return LocalNotifications.addListener('localNotificationActionPerformed', cb); },
    },

    // ── Push Notifications ──
    pushNotifications: {
      register() { return PushNotifications.register(); },
      getDeliveredNotifications() { return PushNotifications.getDeliveredNotifications(); },
      removeDeliveredNotifications(notifications) {
        return PushNotifications.removeDeliveredNotifications({ notifications });
      },
      removeAllDeliveredNotifications() { return PushNotifications.removeAllDeliveredNotifications(); },
      checkPermissions() { return PushNotifications.checkPermissions(); },
      requestPermissions() { return PushNotifications.requestPermissions(); },
      onRegistration(cb) { return PushNotifications.addListener('registration', cb); },
      onRegistrationError(cb) { return PushNotifications.addListener('registrationError', cb); },
      onPushReceived(cb) { return PushNotifications.addListener('pushNotificationReceived', cb); },
      onPushAction(cb) { return PushNotifications.addListener('pushNotificationActionPerformed', cb); },
    },

    // ── Gesture Helpers (Web + Native Haptics) ──
    gestures: {
      attachHaptic(element, style = 'medium', events = ['touchstart']) {
        if (!element) return function(){};
        const handler = () => window.Native.haptics.impact(style);
        events.forEach(e => element.addEventListener(e, handler, { passive: true }));
        return function cleanup() { events.forEach(e => element.removeEventListener(e, handler)); };
      },
      attachSelectionHaptic(elements) {
        if (!elements) return function(){};
        const list = elements instanceof NodeList ? Array.from(elements) : [elements].flat().filter(Boolean);
        const cleaners = list.map(el => this.attachHaptic(el, 'light', ['touchstart']));
        return function cleanup() { cleaners.forEach(c => c()); };
      },
      detectSwipe(element, options = {}) {
        const threshold = options.threshold || 50;
        const maxTime = options.maxTime || 1000;
        let startX, startY, startTime;
        const onStart = (e) => {
          const touch = e.changedTouches[0];
          startX = touch.screenX;
          startY = touch.screenY;
          startTime = Date.now();
        };
        const onEnd = (e) => {
          const touch = e.changedTouches[0];
          const dx = touch.screenX - startX;
          const dy = touch.screenY - startY;
          const dt = Date.now() - startTime;
          if (dt > maxTime) return;
          const absX = Math.abs(dx);
          const absY = Math.abs(dy);
          if (absX > absY && absX > threshold) {
            if (dx > 0) options.onSwipeRight?.(e);
            else options.onSwipeLeft?.(e);
          } else if (absY > absX && absY > threshold) {
            if (dy > 0) options.onSwipeDown?.(e);
            else options.onSwipeUp?.(e);
          }
        };
        element.addEventListener('touchstart', onStart, { passive: true });
        element.addEventListener('touchend', onEnd, { passive: true });
        return function cleanup() {
          element.removeEventListener('touchstart', onStart);
          element.removeEventListener('touchend', onEnd);
        };
      },
      detectLongPress(element, callback, duration = 500) {
        let timer;
        const start = () => {
          timer = setTimeout(() => {
            window.Native.haptics.impactHeavy();
            callback();
          }, duration);
        };
        const cancel = () => clearTimeout(timer);
        element.addEventListener('touchstart', start, { passive: true });
        element.addEventListener('touchend', cancel, { passive: true });
        element.addEventListener('touchmove', cancel, { passive: true });
        return function cleanup() {
          element.removeEventListener('touchstart', start);
          element.removeEventListener('touchend', cancel);
          element.removeEventListener('touchmove', cancel);
        };
      },
      detectDoubleTap(element, callback, maxDelay = 300) {
        let lastTap = 0;
        const handler = () => {
          const now = Date.now();
          if (now - lastTap < maxDelay) {
            window.Native.haptics.impactLight();
            callback();
          }
          lastTap = now;
        };
        element.addEventListener('touchend', handler, { passive: true });
        return function cleanup() { element.removeEventListener('touchend', handler); };
      },
      pullToRefresh(element, callback, threshold = 100) {
        let startY, pulling = false;
        const onStart = (e) => { startY = e.touches[0].clientY; };
        const onMove = (e) => {
          if (element.scrollTop > 0) return;
          const dy = e.touches[0].clientY - startY;
          if (dy > threshold && !pulling) {
            pulling = true;
            window.Native.haptics.impactLight();
          }
        };
        const onEnd = () => {
          if (pulling) { pulling = false; callback(); }
        };
        element.addEventListener('touchstart', onStart, { passive: true });
        element.addEventListener('touchmove', onMove, { passive: true });
        element.addEventListener('touchend', onEnd, { passive: true });
        return function cleanup() {
          element.removeEventListener('touchstart', onStart);
          element.removeEventListener('touchmove', onMove);
          element.removeEventListener('touchend', onEnd);
        };
      },
    },

    // ── Convenience ──
    ready() {
      if (SplashScreen) SplashScreen.hide({ fadeOutDuration: 500 }).catch(() => {});
      if (StatusBar) {
        StatusBar.setStyle({ style: 'DARK' }).catch(() => {});
        StatusBar.setBackgroundColor({ color: '#0f0f0f' }).catch(() => {});
      }
      console.log('[NativeBridge] App ready — native UI initialized');
    },
  };

  // ── Auto-initialize listeners ──
  App.addListener('resume', () => console.log('[NativeBridge] App resumed'));
  App.addListener('pause', () => console.log('[NativeBridge] App paused'));

  if (isAndroid) {
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) App.minimizeApp();
      else window.history.back();
    });
  }

  App.addListener('appUrlOpen', (data) => {
    console.log('[NativeBridge] Deep link:', data.url);
    window.dispatchEvent(new CustomEvent('native:deeplink', { detail: data }));
  });

  Network.addListener('networkStatusChange', (status) => {
    window.dispatchEvent(new CustomEvent('native:network', { detail: status }));
  });

  setTimeout(() => {
    SplashScreen.hide({ fadeOutDuration: 500 }).catch(() => {});
  }, 1500);

  console.log('[NativeBridge] Initialized with 22+ plugins');

  // ── Web Fallback ──
  function createWebFallback() {
    const noop = () => Promise.resolve();
    const falseP = () => Promise.resolve(false);
    const emptyP = () => Promise.resolve({});
    const arrP = () => Promise.resolve([]);
    return {
      platform: 'web', isNative: false, isAndroid: false, isIOS: false,
      app: { getInfo: emptyP, getState: emptyP, minimizeApp: noop, onResume: () => ({ remove: () => {} }), onPause: () => ({ remove: () => {} }), onAppUrlOpen: () => ({ remove: () => {} }), onBackButton: () => ({ remove: () => {} }) },
      haptics: { impact: noop, impactLight: noop, impactMedium: noop, impactHeavy: noop, notification: noop, notificationSuccess: noop, notificationWarning: noop, notificationError: noop, selectionStart: noop, selectionChanged: noop, selectionEnd: noop, vibrate: (d) => { if ('vibrate' in navigator) navigator.vibrate(d); } },
      keyboard: { show: noop, hide: noop, setAccessoryBarVisible: noop, setScroll: noop, onKeyboardWillShow: () => ({ remove: () => {} }), onKeyboardWillHide: () => ({ remove: () => {} }), onKeyboardDidShow: () => ({ remove: () => {} }), onKeyboardDidHide: () => ({ remove: () => {} }) },
      statusBar: { show: noop, hide: noop, setStyle: noop, setBackgroundColor: noop, setOverlaysWebView: noop },
      splashScreen: { show: noop, hide: noop },
      actionSheet: { show: (opts) => Promise.resolve({ index: window.confirm(opts.message || 'Choose') ? 0 : -1 }) },
      toast: { show: noop, showShort: noop, showLong: noop },
      browser: { open: (url) => Promise.resolve(window.open(url, '_blank')), close: noop, addListener: () => ({ remove: () => {} }) },
      clipboard: { copy: (text) => navigator.clipboard?.writeText(text) || Promise.resolve(), paste: () => navigator.clipboard?.readText() || Promise.resolve('') },
      device: { getInfo: () => Promise.resolve({ platform: 'web', model: 'Browser', osVersion: navigator.userAgent }), getBatteryInfo: emptyP, getLanguageCode: () => Promise.resolve({ value: navigator.language }), isVirtual: () => Promise.resolve(false) },
      network: { getStatus: () => Promise.resolve({ connected: navigator.onLine, connectionType: 'unknown' }), onChange: () => ({ remove: () => {} }) },
      screenOrientation: { lock: noop, unlock: noop, getCurrentOrientation: emptyP, onChange: () => ({ remove: () => {} }) },
      motion: { addListener: () => ({ remove: () => {} }), removeAllListeners: noop, onAccel: () => ({ remove: () => {} }), onOrientation: () => ({ remove: () => {} }) },
      geolocation: { getCurrentPosition: (opts) => new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, opts)), watchPosition: () => Promise.resolve(0), clearWatch: noop, checkPermissions: emptyP, requestPermissions: emptyP },
      camera: { getPhoto: () => Promise.reject(new Error('Camera not available in web mode')), checkPermissions: emptyP, requestPermissions: emptyP },
      filesystem: { Directory: {}, Encoding: {}, readFile: noop, writeFile: noop, appendFile: noop, deleteFile: noop, mkdir: noop, rmdir: noop, readdir: noop, getUri: noop, stat: noop, rename: noop, copy: noop, checkPermissions: emptyP, requestPermissions: emptyP },
      share: { share: (opts) => navigator.share ? navigator.share(opts) : Promise.resolve(), canShare: () => Promise.resolve(!!navigator.share) },
      preferences: { get: (key) => Promise.resolve(localStorage.getItem(key)), set: (key, val) => Promise.resolve(localStorage.setItem(key, val)), remove: (key) => Promise.resolve(localStorage.removeItem(key)), clear: () => Promise.resolve(localStorage.clear()), keys: () => Promise.resolve(Object.keys(localStorage)), migrateFromLocalStorage: noop },
      dialog: { alert: (msg) => Promise.resolve(window.alert(msg)), confirm: (msg) => Promise.resolve(window.confirm(msg)), prompt: (msg) => { const v = window.prompt(msg); return Promise.resolve({ value: v || '', cancelled: v === null }); } },
      screenReader: { isEnabled: () => Promise.resolve(false), speak: noop, onChange: () => ({ remove: () => {} }) },
      textZoom: { get: () => Promise.resolve(1), set: noop },
      keepAwake: { enable: noop, disable: noop, isEnabled: () => Promise.resolve(false) },
      localNotifications: { schedule: noop, cancel: noop, getPending: arrP, registerActionTypes: noop, checkPermissions: emptyP, requestPermissions: emptyP, onReceive: () => ({ remove: () => {} }), onAction: () => ({ remove: () => {} }) },
      pushNotifications: { register: noop, getDeliveredNotifications: arrP, removeDeliveredNotifications: noop, removeAllDeliveredNotifications: noop, checkPermissions: emptyP, requestPermissions: emptyP, onRegistration: () => ({ remove: () => {} }), onRegistrationError: () => ({ remove: () => {} }), onPushReceived: () => ({ remove: () => {} }), onPushAction: () => ({ remove: () => {} }) },
      gestures: {
        attachHaptic: (el) => { if (el) el.addEventListener('touchstart', () => { if ('vibrate' in navigator) navigator.vibrate(15); }, { passive: true }); return () => {}; },
        attachSelectionHaptic: () => () => {},
        detectSwipe: (el, opts) => { let sx, sy; el.addEventListener('touchstart', e => { sx = e.changedTouches[0].screenX; sy = e.changedTouches[0].screenY; }, { passive: true }); el.addEventListener('touchend', e => { const dx = e.changedTouches[0].screenX - sx, dy = e.changedTouches[0].screenY - sy; if (Math.abs(dx) > 50) dx > 0 ? opts.onSwipeRight?.() : opts.onSwipeLeft?.(); else if (Math.abs(dy) > 50) dy > 0 ? opts.onSwipeDown?.() : opts.onSwipeUp?.(); }, { passive: true }); return () => {}; },
        detectLongPress: (el, cb, dur = 500) => { let t; el.addEventListener('touchstart', () => t = setTimeout(cb, dur), { passive: true }); el.addEventListener('touchend', () => clearTimeout(t), { passive: true }); return () => {}; },
        detectDoubleTap: (el, cb, delay = 300) => { let lt = 0; el.addEventListener('touchend', () => { const n = Date.now(); if (n - lt < delay) cb(); lt = n; }, { passive: true }); return () => {}; },
        pullToRefresh: (el, cb, thresh = 100) => { let sy, p = false; el.addEventListener('touchstart', e => { sy = e.touches[0].clientY; }, { passive: true }); el.addEventListener('touchmove', e => { if (el.scrollTop > 0) return; if (e.touches[0].clientY - sy > thresh && !p) p = true; }, { passive: true }); el.addEventListener('touchend', () => { if (p) { p = false; cb(); } }, { passive: true }); return () => {}; },
      },
      ready: noop,
    };
  }
})();
