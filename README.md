# ClaudeMate Desktop — MVP

ClaudeMate is an independent desktop AI assistant built to replace the parts of HireMate you need: Claude API access, local import/search of your Claude conversation export, and personalized answers using relevant past-chat context.

## Included

- **Interview Prep** (v0.2): resume and job description profile; a 111-question bank with model answers and read-aloud; Claude-generated Technical, HR, Delivery and Coding questions with tailored answers drawn from your resume and imported Claude history; mock interviews where questions are read aloud, you answer (Windows + H dictates), optionally record yourself, and Claude scores five dimensions with a stronger version of your answer.

- Anthropic Claude Messages API integration.
- API key saved with Electron `safeStorage` (OS-backed encryption; refuses to save if encryption is unavailable).
- Claude model selector and connection test.
- Import Claude export ZIP, JSON, JSONL, or JSON data files.
- Local searchable conversation archive and keyword-based context retrieval.
- Toggle to pause history context, remove the saved key, or delete imported history.
- Windows NSIS installer configuration and one-click build script.
- GitHub Actions workflow that builds a Windows installer on a Windows runner.

## Build a Windows installer

**This source package does not contain a precompiled `.exe` installer.** The build environment used to prepare it cannot resolve the npm package registry, so it could not download Electron and its dependencies. Build on a Windows PC with internet access:

1. Install Node.js 20 or newer from <https://nodejs.org/>.
2. Extract this folder to a normal writable location.
3. Double-click `BUILD-WINDOWS.bat`.
4. Wait for dependency downloads and packaging to finish. The installer should appear in `release/` as `ClaudeMate-Setup-0.2.1-x64.exe`.

Or use a GitHub Actions Windows runner: push this folder to a GitHub repository, open **Actions → Build ClaudeMate Windows installer → Run workflow**, then download the `ClaudeMate-Windows-Installer` artifact from the completed run. The workflow is in `.github/workflows/build-windows.yml`.

## Run in development

```bash
npm install
npm run dev
```

## Configure Claude

1. Open ClaudeMate and go to **Settings**.
2. Create an Anthropic API key in the Anthropic Console: <https://console.anthropic.com/settings/keys>.
3. Paste it into the app and choose **Save API key**.
4. Select **Test connection**.
5. Open **Conversation memory → Import history** and select your official Claude data export ZIP.
6. Ask a question. If memory is enabled, ClaudeMate searches the local archive and sends up to five relevant conversation excerpts with your current question.

Anthropic API usage is billed separately from Claude Pro/Max subscriptions. Never send your API key in chat or commit it to source control.

## Data and privacy

Imported conversations are stored locally in the app's user-data directory. The API key is encrypted with Electron `safeStorage`. When memory is enabled, relevant excerpts are sent to Anthropic with the prompt; the entire archive is not sent automatically. You can pause memory or delete the local archive in Settings.

## MVP limitations

- The history importer is defensive but must be validated against your actual export format; export schemas can change.
- Retrieval uses keyword scoring, not semantic/vector search.
- This MVP implements Anthropic Claude only. An OpenAI provider can be added separately.
- This build is not code-signed. Windows SmartScreen may display an unknown-publisher warning.
- The source package has not been compiled or tested end-to-end in this environment because external npm downloads are unavailable. Build and test it on a Windows machine before using it for important work.
