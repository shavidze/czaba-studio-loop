COMMIT: OK

Ich habe den Diff und die genannten Dateien gelesen. Der Browser ist nicht gelaufen. `verify.log` zeigt 252 Testdateien und 3723 Tests grün, `tsc --noEmit` und beide Builds sind durch. In den sechs Pfaden gibt es keinen Auth-, Kauf- oder Download-Code.

Die Sektionsüberschriften unten sind auf Deutsch. Dateinamen, Code und Testnamen bleiben unverändert.

## Befunde (nach Rang)

Es gibt keine blockierenden Befunde. Die zwei Hinweise unten sind niedrig.

1. **Niedrig, Annahme ohne Wächter:** `ArrangementTransport.tsx` (neuer `useSoftDisableFocusHandoff`, `requestAnimationFrame`-Ablauf).
   - Das Ablaufen des Handoffs nach einem Frame setzt voraus, dass Undo, Redo, Delete und Zoom-back synchron im Click-Handler committen.
   - Eine Browser-Regression gäbe es erst, wenn eine dieser Aktionen in `startTransition` wandert. Der Fokus würde dann nicht mehr zum Partner springen.
   - Aktuell stimmt die Annahme: In `app/components/arrangement` gibt es kein `startTransition`, `useTransition` oder `useDeferredValue`.
   - Die Absicherung liegt nur in einem Claim-Skript außerhalb des Repos, das als einziger Wächter dient. Ein In-Repo-Test fehlt.
   - **Fix:** In einer Folgerunde einen Test ergänzen, der die drei Hook-Namen in den drei Dateien per Textsuche verbietet. Alternativ ein Kommentar am Hook, weil die Projektregel Kontext-Hinweise zulässt.

2. **Niedrig, Nebenkosten:** `ArrangementTransport.tsx` (`armFocusHandoff`).
   - Die Funktion plant bei jedem Klick einen Frame ein, auch wenn der Fokus nicht auf der Quelle liegt (`handoffRef` ist dann `null`).
   - Das ist harmlos: eine Callback-Planung pro Klick, ein Timer, der beim Unmount abgebrochen wird. Leaks sehe ich nicht.
   - **Fix, optional:** Nur planen, wenn `handoffRef.current !== null`.

## Geprüft ohne Befund

- **Event-Reihenfolge:**
  - Der Handoff wird im Click gesetzt, der Commit läuft synchron, und der Layout-Effekt der jeweiligen Gruppe verbraucht ihn vor dem nächsten Frame.
  - Der Fall mit unveränderten Labels (zweimal Undo) hinterlässt keinen scharfen Handoff mehr. FL11 deckt das ab, und `vi.unstubAllGlobals()` räumt `requestAnimationFrame` auf.
  - Alle vier Handoff-Paare (Undo↔Redo, Delete→Undo, Zoom-back→Fit) liegen jeweils in einer Gruppe, deren Props sich im selben Commit ändern.
- **Listener und Timer:**
  - Das Cleanup bricht den Frame beim Unmount ab. Unter StrictMode ist das unschädlich.
  - Neue Listener gibt es nicht.
- **Render-Kosten:**
  - `transportNavigation` ist in `StudioWorkspace.tsx:3201` memoisiert, `openExportDialog` ist `useCallback([])`, und die Actions liegen in einem `useMemo`. Damit hat die `memo`-Ansicht stabile Props.
  - Der Anstieg von `move-components-max` um +2 ist im Doc offengelegt und akzeptiert.
- **Barrierefreiheit und DOM:**
  - Die Gruppen rendern ihr `div` direkt als Grid-Kind. `grid-area`, `data-testid`, `aria-*`, `title`, `aria-keyshortcuts` und Soft-Disabled-Verhalten sind unverändert.
- **Tailwind und Tokens:** Neue Klassen und Farben gibt es nicht, nur verschobene.
- **TS strict:** Keine neuen `any`, `@ts-ignore` oder Type-Assertions im Diff. `Pick<ArrangementContextValue,…>` ist sauber getypt.
- **Bestehende Abläufe:**
  - `ArrangementTransport` bleibt als dünner Wrapper mit gleicher Signatur. `index.ts` und `export-toolbar-hold-enter.test.tsx` nutzen ihn weiter.
  - Die Nullprüfungen am Wrapper in `render-budget.test.tsx:870` und `:881` zählen den Wrapper-Namen. Sie sind bewusst als Schutz gegen ein Zurücksetzen der Einbindung im Workspace gedacht, und `ArrangementTransportViewInner` hat an anderer Stelle `> 0`-Kontrollen. Das ist akzeptabel.
- **Dokumentation:** Das Doc 243 ist vorhanden, nach Vorlage aufgebaut und benennt die Annahme aus Befund 1.

## Architecture note

- Signal 4 (neuer State oder Lifecycle in einem bestehenden Besitzer): `ArrangementTransport.tsx` (neuer Hook `useSoftDisableFocusHandoff`, Zeilen 48–90 im Diff).
  - Er fügt Ref, Effect, Timer und Cleanup hinzu.
  - Er ist an die zwei Gruppen gebunden, die ihn nutzen, und hängt vom Commit-Zeitpunkt des Besitzers ab.
  - Entscheidung: **behalten**. Der Lifecycle ist in einem Hook gekapselt, die Handoff-Paare liegen pro Gruppe zusammen, und FL3, FL5, FL11 sowie die Mutanten sichern ihn.
  - Eine Extraktion bringt jetzt keinen Nutzen und kostet mittel.
- Signal 3 (wiederholte teure Änderung in einer Region): Die Transport-Region wurde in den Runden 375 bis 377 mehrfach angefasst. Jede Runde brauchte Render-Budget-Zeilen, Umbenennungen von Zählnamen und Mutanten.
  - Vorschlag für den Planer, nicht für jetzt: Eine kleine Aufgabe, die die Render-Zähl-Konstanten (`TRANSPORT_LEAVES`, `TRANSPORT_STEP_COUNTS` und die Namen aus `drag-preview-render` und `selection-wrappers-render`) in eine gemeinsame Test-Hilfsdatei legt. Akzeptanz: Eine Umbenennung ändert nur eine Stelle, die drei Testdateien bleiben grün.
  - Die Entscheidung über Reihenfolge liegt bei Root oder dem Nutzer.
  - Das Dünn-Wrapper-Thema (GATE375-L1-UNUSED-WRAPPERS) bleibt beim Planer.

Das ist ein Review des Diffs, keine Prüfung des gesamten Moduls.