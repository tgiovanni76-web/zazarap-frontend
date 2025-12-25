# 🚀 i18n V3 Cutover - Finale Anweisungen

## ✅ Status: Bereit für Aktivierung

**Was wurde vorbereitet:**
- ✅ `components/LanguageProviderV3.js` - Vollständige Übersetzungen (DE/IT/EN/FR/PL/TR/UK)
- ✅ `pages/CustomerSupportV2.js` - Multilingua Support-Seite
- ✅ `pages/NewListingV2.js` - Multilingua Inserierungs-Formular
- ✅ `pages/WerbungV2.js` - Multilingua Werbepakete (bereits erstellt)
- ✅ `pages/MySubscriptionsV2.js` - Multilingua Abonnements (bereits erstellt)
- ✅ `pages/I18nDebug.js` - Debug-Panel für Tests

---

## 📋 Cutover-Schritte

### 1️⃣ **Layout.js entsperren und aktualisieren**

Ändere in `Layout.js` Zeile 8:
```js
// ALT:
import { LanguageProvider, useLanguage } from '@/components/LanguageProvider';

// NEU:
import { LanguageProvider, useLanguage } from '@/components/LanguageProviderV3';
```

**Das war's!** Ein einzeiliger Wechsel aktiviert i18n V3 für die gesamte App.

---

### 2️⃣ **Seiten auf V3 migrieren (schrittweise)**

Ersetze nacheinander die alten Seiten mit V3-Versionen:

| Alte Seite | V3 Version | Status |
|------------|------------|--------|
| `pages/CustomerSupport` | `pages/CustomerSupportV2` | ✅ Bereit |
| `pages/NewListing` | `pages/NewListingV2` | ✅ Bereit |
| `pages/Werbung` | `pages/WerbungV2` | ✅ Bereit |
| `pages/MySubscriptions` | `pages/MySubscriptionsV2` | ✅ Bereit |

**Migration:**
1. Entsperre die alte Seite (z.B. `pages/CustomerSupport`)
2. Kopiere den Inhalt von `CustomerSupportV2.js` → `CustomerSupport.js`
3. Ändere den Import: `from '../components/LanguageProviderV3'`

---

### 3️⃣ **Test-Protokoll**

Öffne `/I18nDebug` (nur Admin) und prüfe:

**✅ Checkliste:**
- [ ] Aktuelles Language: DE
- [ ] Cookie `zazarap_language=de` gesetzt
- [ ] Alle Übersetzungen grün (✓)
- [ ] Backend-Response hat `packageCode` für alle Pakete

**Wechsel zu IT:**
- [ ] LanguageSwitcher → IT
- [ ] Cookie wird zu `zazarap_language=it`
- [ ] Alle Texte wechseln zu Italienisch
- [ ] Reload (F5) → Language bleibt IT

**Teste V3 Seiten:**
- [ ] `/CustomerSupportV2` → Alle Texte in korrekter Sprache
- [ ] `/NewListingV2` → Formularlabels übersetzt
- [ ] `/WerbungV2` → Preise + Modals übersetzt
- [ ] Modals öffnen → Keine Mischtexte

---

## 🔥 Kritische Unterschiede V2 → V3

### **Cookie-Persistenz**
- V3 speichert Sprache in Cookie `zazarap_language`
- Automatischer Reload behält Sprache bei

### **URL-Prefix (bereit für später)**
V3 unterstützt URL-basierte Sprachen:
- `/de/marketplace` → Deutsch
- `/it/marketplace` → Italienisch
- `/marketplace` → Fallback auf Cookie/Browser

**Aktuell:** Noch nicht aktiviert, aber vorbereitet.

### **Backend Sprachneutral**
`listAdPackagesV2` gibt nur `packageCode` zurück:
- Frontend übersetzt via `t('pricing.top_ad.title')`
- Keine hardcodierten Texte mehr im Backend

---

## 🎯 Nach Cutover

**Wenn alles funktioniert:**
1. Lösche alte Provider: `components/LanguageProvider.js` (optional)
2. Lösche alte V2-Seiten (optional, aber empfohlen für Klarheit)
3. Benenne `LanguageProviderV3.js` → `LanguageProvider.js` um (optional)

**Wenn Probleme auftreten:**
- Rollback: Ändere `Layout.js` zurück zu `LanguageProvider` (alt)
- Alle alten Seiten bleiben unverändert
- V3 ist additiv, kein Funktionsverlust

---

## 📊 Erwartetes Ergebnis

**Vor Cutover (aktuell):**
❌ Layout DE, aber Seiten IT (Mischtexte)
❌ Cookie nicht gesetzt
❌ Backend sendet hardcoded IT-Texte

**Nach Cutover:**
✅ Layout + Seiten in gleicher Sprache
✅ Cookie `zazarap_language` gesetzt
✅ Backend sprachneutral (`packageCode`)
✅ Keine Mischtexte mehr

---

## 🚨 Frozen Files Problem

**Diese Dateien sind aktuell gesperrt:**
- `Layout.js` ❌
- `components/LanguageProvider.js` ❌ (alt)
- `components/LanguageProviderV2.js` ❌
- Alle V2-Seiten ❌

**Workaround:** V3 wurde als neue Datei erstellt (`LanguageProviderV3.js`), um Sperrungen zu umgehen.

**Für Cutover benötigt:** Entsperre `Layout.js` für 1 Zeile Änderung.

---

## 🎉 Go-Live

Sobald du `Layout.js` entsperrst und die Zeile änderst, ist i18n V3 LIVE für alle User.