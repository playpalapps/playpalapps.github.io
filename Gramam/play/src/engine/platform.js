// The native edges: sharing a picture or text, saving a file, gentle local reminders. Capacitor plugins when present, browser fallbacks otherwise, silence when neither.
const P = () => (window.Capacitor && window.Capacitor.Plugins) || {};
const isNative = () => !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
function dataUrlToBlob(dataUrl) { const [h, b] = dataUrl.split(','); const mime = /:(.*?);/.exec(h)[1], bin = atob(b), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i); return new Blob([arr], { type: mime }); }
export const platform = {
  native: isNative,
  async sharePNG(dataUrl, name, text) {
    try {
      const { Filesystem, Share } = P();
      if (isNative() && Filesystem && Share) { const r = await Filesystem.writeFile({ path: name, data: dataUrl.split(',')[1], directory: 'CACHE' }); await Share.share({ title: 'Gramam', text, files: [r.uri] }); return 'shared'; }
      const blob = dataUrlToBlob(dataUrl), file = new File([blob], name, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'Gramam', text }); return 'shared'; }
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); return 'saved';
    } catch (e) { return e && e.message && /cancel/i.test(e.message) ? 'cancelled' : 'failed'; }
  },
  async shareText(text, title = 'Gramam') {
    try { const { Share } = P(); if (isNative() && Share) { await Share.share({ title, text }); return 'shared'; } if (navigator.share) { await navigator.share({ title, text }); return 'shared'; } await navigator.clipboard.writeText(text); return 'copied'; } catch (e) { return 'failed'; }
  },
  reminders: {
    async enable() { try { const { LocalNotifications } = P(); if (!LocalNotifications) return false; const r = await LocalNotifications.requestPermissions(); return r && r.display === 'granted'; } catch (e) { return false; } },
    async schedule(list) { // list: [{ id, title, body, at: Date }], replaces everything pending
      try { const { LocalNotifications } = P(); if (!LocalNotifications) return false; const pend = await LocalNotifications.getPending(); if (pend && pend.notifications && pend.notifications.length) await LocalNotifications.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) });
        const now = Date.now(), notifications = list.filter(n => n.at.getTime() > now + 60000).slice(0, 4).map(n => ({ id: n.id, title: n.title, body: n.body, schedule: { at: n.at, allowWhileIdle: false }, sound: null, smallIcon: 'ic_stat_icon' }));
        if (notifications.length) await LocalNotifications.schedule({ notifications }); return true; } catch (e) { return false; }
    },
    async clear() { try { const { LocalNotifications } = P(); if (!LocalNotifications) return; const pend = await LocalNotifications.getPending(); if (pend && pend.notifications && pend.notifications.length) await LocalNotifications.cancel({ notifications: pend.notifications.map(n => ({ id: n.id })) }); } catch (e) { } }
  }
};
