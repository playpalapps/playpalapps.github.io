// Haptics: Capacitor plugin when present, navigator.vibrate fallback, silent otherwise.
let H = null;
try { H = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics; } catch (e) { H = null; }
export const haptics = {
  light() { try { if (H) H.impact({ style: 'LIGHT' }); else if (navigator.vibrate) navigator.vibrate(8); } catch (e) { } },
  medium() { try { if (H) H.impact({ style: 'MEDIUM' }); else if (navigator.vibrate) navigator.vibrate(14); } catch (e) { } },
  soft() { try { if (H) H.impact({ style: 'SOFT' }); else if (navigator.vibrate) navigator.vibrate(5); } catch (e) { } },
  success() { try { if (H) H.notification({ type: 'SUCCESS' }); else if (navigator.vibrate) navigator.vibrate([10, 30, 10]); } catch (e) { } }
};
