# Mobile font resource regression

The reported `app://d4662…` URLs were found in AstroScope's generated
`.obsidian/snippets/local-font-loader.css`. This file can sync to mobile and is
loaded by Obsidian before plugin startup. It previously contained desktop font
resource URLs. Desktop exit-time parking did not prevent sync during a session,
process termination, or mobile reuse of the generated snippet.

The fix keeps font faces in session-local DOM style nodes and writes only
portable variables/layout rules to the snippet. Startup and CSS changes remove
legacy font-face blocks from this plugin's own snippet. No font binaries or
resource URLs are persisted in the snippet. Each runtime still resolves fonts
through its own adapter's `getResourcePath`.

## Automated verification

Run `bun run typecheck`, `bun test`, and `bun run build`.
The seven regression tests use temporary, initially empty filesystem vault
folders and DOM/Obsidian doubles. They verify folder creation, configured and
unconfigured fonts, legacy snippet migration, mobile adapter URLs, session URL
changes, popout cleanup, and resource API errors. They do not assert real browser
font rendering or actual Obsidian startup.

## Required runtime verification (pending)

1. Open a fresh vault in Obsidian with only Local Font Loader enabled. With no
   fonts configured, confirm there are no plugin startup errors.
2. Add a TTF/OTF font, scan and select it. Confirm text renders with that font,
   `document.fonts.load('16px "<family>"')` returns a loaded face, and the
   generated snippet contains no `@font-face`, `app://`, or `file://` URLs.
3. Restart the test vault manually and confirm fonts load automatically without
   resource errors. Confirm desktop popouts and PDF export retain the chosen font.
4. Connect Android with USB debugging, open `chrome://inspect/#devices` in Chrome,
   and inspect the Obsidian WebView. Install the built plugin on both desktop and
   mobile and sync the portable snippet. Verify runtime font URLs originate from
   the mobile adapter, faces finish loading, and no `ERR_UNKNOWN_URL_SCHEME`
   requests appear after a fresh app start.
5. For legacy migration, sync an old generated desktop snippet into the mobile
   test vault. The old snippet can already have caused requests before the
   plugin's first startup; verify it is sanitized, then manually cold-start the
   app again and confirm the errors do not recur.

At preparation time Chrome/Chromium launched, but the ChatGPT browser extension
and native connection were not available to the agent. Obsidian CLI failed its
capability probe (AppImage/FUSE), and the Obsidian DevTools endpoint timed out.
The runtime steps above have therefore not yet been executed.
