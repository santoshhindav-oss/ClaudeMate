import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { ProfilePage, BankPage, GeneratePage, MockPage } from './prep.jsx';

const starterMessages = [{ role: 'assistant', content: "Hi, I'm ClaudeMate. Connect your Claude API key, import your past Claude conversations, and I'll use relevant history to make future answers more personal. Your imported history stays on this computer." }];
function Icon({ name }) {
  const paths = {
    chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/></>,
    history: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.5.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.5-.9l-1.7.6-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.8l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.5-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.5.9l1.7-.6 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.7Z" transform="translate(-1 -1) scale(1.05)"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z"/><path d="m19 14 1 2.5 2.5 1-2.5 1L19 21l-1-2.5-2.5-1 2.5-1L19 14Z"/></>,
    close: <><path d="m18 6-12 12M6 6l12 12"/></>,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"/></>,
    check: <><path d="m5 12 4 4L19 6"/></>,
    arrow: <><path d="M5 12h14m-7-7 7 7-7 7"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}
function App() {
  const [page, setPage] = useState('chat');
  const [keyConfigured, setKeyConfigured] = useState(false);
  const [keyInput, setKeyInput] = useState('');
  const [prefs, setPrefs] = useState({ model: 'claude-sonnet-5-5', memoryEnabled: true });
  const [count, setCount] = useState({ total: 0, messages: 0 });
  const [history, setHistory] = useState([]);
  const [historyQuery, setHistoryQuery] = useState('');
  const [messages, setMessages] = useState(starterMessages);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showKey, setShowKey] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const areaRef = useRef(null);
  const [sessionId, setSessionId] = useState(1);
  const [prep, setPrep] = useState({ resume: '', jobDescription: '', role: '', company: '', generated: [], attempts: [] });
  const [practiceSeed, setPracticeSeed] = useState(null);
  const reloadPrep = () => window.claudemate.getPrep().then(setPrep).catch(() => {});

  const notify = (kind, text) => { setNotice({ kind, text }); window.setTimeout(() => setNotice(null), 4800); };
  const refresh = async () => {
    try {
      const [key, p, c, h] = await Promise.all([window.claudemate.keyStatus(), window.claudemate.getPrefs(), window.claudemate.historyCount(), window.claudemate.listHistory(historyQuery)]);
      setKeyConfigured(key.configured); setPrefs(p); setCount(c); setHistory(h);
    } catch (e) { notify('error', e.message || 'Could not load local application data.'); }
  };
  useEffect(() => { refresh(); reloadPrep(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);
  useEffect(() => { const t = window.setTimeout(() => { window.claudemate.listHistory(historyQuery).then(setHistory).catch(() => {}); }, 180); return () => window.clearTimeout(t); }, [historyQuery]);
  const historyLabel = useMemo(() => `${count.total} conversations · ${count.messages} messages`, [count]);

  const saveKey = async () => {
    try { await window.claudemate.setKey(keyInput); setKeyInput(''); setKeyConfigured(true); setConnected(false); notify('success', 'Claude API key saved securely on this device.'); }
    catch (e) { notify('error', e.message || 'Could not save API key.'); }
  };
  const deleteKey = async () => { if (!window.confirm('Remove the saved Claude API key from this device?')) return; await window.claudemate.deleteKey(); setKeyConfigured(false); setConnected(false); notify('success', 'Saved API key removed.'); };
  const importHistory = async () => {
    try {
      const result = await window.claudemate.importHistory();
      if (result.canceled) return;
      await refresh();
      if (!result.parsed) notify('error', 'No conversations were recognized. Try the original Claude data-export ZIP or a JSON/JSONL conversation file.');
      else notify('success', `Import complete: ${result.added} new conversations added (${result.parsed} recognized).`);
    } catch (e) { notify('error', e.message || 'History import failed.'); }
  };
  const newChat = () => { setMessages(starterMessages); setQuestion(''); setSessionId(x => x + 1); setPage('chat'); };
  const send = async () => {
    const q = question.trim(); if (!q || busy) return;
    if (!keyConfigured) { setPage('settings'); notify('error', 'Add your Anthropic API key in Settings before asking Claude.'); return; }
    const prior = messages.filter((m, i) => i > 0 && (m.role === 'user' || m.role === 'assistant')).slice(-8);
    const next = [...messages, { role: 'user', content: q }]; setMessages(next); setQuestion(''); setBusy(true); setConnected(false);
    try {
      const context = prefs.memoryEnabled ? await window.claudemate.searchContext(q) : [];
      const result = await window.claudemate.askClaude({ question: q, messages: prior, context });
      setMessages(m => [...m, { role: 'assistant', content: result.answer, sources: result.sources || [], model: result.model }]); setConnected(true);
    } catch (e) { setMessages(m => [...m, { role: 'error', content: e.message || 'Request failed.' }]); notify('error', e.message || 'Claude request failed.'); }
    finally { setBusy(false); }
  };
  const testConnection = async () => {
    if (!keyConfigured) { notify('error', 'Save an Anthropic API key first.'); return; }
    setBusy(true);
    try { const r = await window.claudemate.askClaude({ question: 'Reply with exactly: Connection successful.', messages: [], context: [] }); setConnected(true); notify('success', `Claude connection works (${r.model || prefs.model}).`); }
    catch (e) { setConnected(false); notify('error', e.message || 'Connection test failed.'); }
    finally { setBusy(false); }
  };
  const savePrefs = async (next) => { try { const p = await window.claudemate.setPrefs(next); setPrefs(p); notify('success', 'Preferences saved.'); } catch (e) { notify('error', e.message || 'Could not save preferences.'); } };
  const clearHistory = async () => { if (!window.confirm('Permanently delete all imported conversation history stored by ClaudeMate? This cannot be undone.')) return; await window.claudemate.deleteAllHistory(); await refresh(); notify('success', 'Imported history deleted from this device.'); };

  return <div className="app-shell">
    <aside className={`sidebar ${page === 'bank' ? 'slim' : ''}`}>
      <div className="brand"><div className="brand-mark"><Icon name="spark"/></div><div><div className="brand-name">ClaudeMate</div><div className="brand-sub">PERSONAL AI WORKSPACE</div></div></div>
      <button className="new-chat" onClick={newChat}><Icon name="plus"/> New conversation</button>
      <div className="nav-label">WORKSPACE</div>
      <button className={`nav-item ${page === 'chat' ? 'active' : ''}`} onClick={() => setPage('chat')} title="Ask Claude"><Icon name="chat"/><span>Ask Claude</span></button>
      <button className={`nav-item ${page === 'history' ? 'active' : ''}`} onClick={() => setPage('history')} title="Conversation memory"><Icon name="history"/><span>Conversation memory</span><span className="nav-count">{count.total}</span></button>
      <div className="nav-label">INTERVIEW PREP</div>
      <button className={`nav-item ${page === 'mock' ? 'active' : ''}`} onClick={() => setPage('mock')} title="Mock interview"><Icon name="chat"/><span>Mock interview</span></button>
      <button className={`nav-item ${page === 'generate' ? 'active' : ''}`} onClick={() => setPage('generate')} title="Generate questions"><Icon name="spark"/><span>Generate questions</span></button>
      <button className={`nav-item ${page === 'bank' ? 'active' : ''}`} onClick={() => setPage('bank')} title="Question bank"><Icon name="book"/><span>Question bank</span><span className="nav-count">{111 + prep.generated.length}</span></button>
      <button className={`nav-item ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')} title="Resume & JD"><Icon name="upload"/><span>Resume & JD</span></button>
      <div className="nav-label">APP</div>
      <button className={`nav-item ${page === 'settings' ? 'active' : ''}`} onClick={() => setPage('settings')} title="Settings"><Icon name="settings"/><span>Settings</span></button>
      <div className="sidebar-bottom">
        <div className="memory-card"><div className="memory-icon"><Icon name="shield"/></div><div><strong>Your history stays local</strong><p>Imported conversations are stored on this device and only relevant excerpts are sent with your question.</p></div></div>
        <div className="profile-row"><div className="avatar">CM</div><div className="profile-text"><strong>Personal workspace</strong><span>{keyConfigured ? 'Claude API configured' : 'Setup required'}</span></div><span className={`status-dot ${keyConfigured ? 'on' : ''}`}/></div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumbs"><span>Workspace</span><Icon name="arrow"/><strong>{({ chat: 'Ask Claude', history: 'Conversation memory', settings: 'Settings', mock: 'Mock interview', generate: 'Generate questions', bank: 'Question bank', profile: 'Resume & JD' })[page]}</strong></div><div className="top-actions"><div className={`provider-pill ${connected ? 'connected' : ''}`}><span className="provider-dot"/>{connected ? 'Claude connected' : 'Anthropic Claude'}<span className="chevron">⌄</span></div><button className="icon-button" title="Settings" onClick={() => setPage('settings')}><Icon name="settings"/></button></div></header>
      {page === 'chat' && <section className="chat-page">
        <div className="chat-heading"><div className="eyebrow"><span className="eyebrow-line"/> YOUR PERSONAL AI</div><h1>Let's think <em>better,</em><br/>together.</h1><p>Answers grounded in your ideas, history, and context.</p>
          <div className="chat-meta"><span><Icon name="spark"/> Claude AI</span><span className="meta-sep"/><span><Icon name="book"/> {prefs.memoryEnabled ? `${count.total} memories available` : 'Memory paused'}</span><span className="meta-sep"/><span><Icon name="shield"/> Private by design</span></div>
        </div>
        <div className="conversation-wrap" ref={areaRef}>
          {messages.map((m, i) => <div className={`message-row ${m.role}`} key={`${sessionId}-${i}`}><div className={`message-avatar ${m.role}`}>{m.role === 'assistant' ? <Icon name="spark"/> : m.role === 'error' ? '!' : 'You'}</div><div className="message-body"><div className="message-author">{m.role === 'assistant' ? 'ClaudeMate' : m.role === 'error' ? 'Request issue' : 'You'}{m.model && <span className="model-tag">{m.model}</span>}</div><div className={`message-content ${m.role === 'error' ? 'error-content' : ''}`}>{m.content}</div>{m.sources?.length > 0 && <div className="sources"><span className="sources-label">USED MEMORY</span>{m.sources.map(s => <span className="source-chip" key={s.id}><Icon name="book"/>{s.title}</span>)}</div>}</div></div>)}
          {busy && <div className="message-row assistant"><div className="message-avatar assistant"><Icon name="spark"/></div><div className="message-body"><div className="message-author">ClaudeMate</div><div className="thinking"><span/><span/><span/> <label>Thinking with your context…</label></div></div></div>}
          <div ref={bottomRef}/>
        </div>
        <div className="composer-area"><div className="composer"><textarea value={question} onChange={e => setQuestion(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask anything… ClaudeMate can use your past conversations" rows={2}/><div className="composer-footer"><div className="composer-hints"><span className="context-toggle"><span className={`tiny-check ${prefs.memoryEnabled ? 'checked' : ''}`}>{prefs.memoryEnabled && <Icon name="check"/>}</span> Past-chat context {prefs.memoryEnabled ? 'on' : 'off'}</span><span className="keyboard-hint">Enter to send · Shift + Enter for new line</span></div><button className="send-button" disabled={!question.trim() || busy} onClick={send}><span>{busy ? 'Working' : 'Send'}</span><Icon name="send"/></button></div></div><div className="composer-disclaimer">Claude can make mistakes. Check important information. API usage may incur charges.</div></div>
      </section>}
      {page === 'history' && <section className="content-page"><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/> PERSONAL KNOWLEDGE</div><h1>Conversation memory</h1><p>Search your imported Claude conversations and give new answers useful context.</p></div><button className="primary-button" onClick={importHistory}><Icon name="upload"/> Import history</button></div><div className="stats-grid"><div className="stat-card"><span>CONVERSATIONS</span><strong>{count.total.toLocaleString()}</strong><small>Imported and indexed locally</small></div><div className="stat-card"><span>MESSAGES</span><strong>{count.messages.toLocaleString()}</strong><small>User and assistant messages</small></div><div className="stat-card"><span>MEMORY STATUS</span><strong className="stat-state">{prefs.memoryEnabled ? 'Active' : 'Paused'}</strong><small>{prefs.memoryEnabled ? 'Relevant excerpts can be used' : 'No history sent to Claude'}</small></div></div><div className="panel"><div className="panel-header"><div><h2>Imported conversations</h2><p>{historyLabel}</p></div><div className="search-field"><Icon name="search"/><input value={historyQuery} onChange={e => setHistoryQuery(e.target.value)} placeholder="Search history…"/></div></div>{history.length ? <div className="history-list">{history.map(c => <div className="history-item" key={c.id}><div className="history-icon"><Icon name="chat"/></div><div className="history-item-main"><strong>{c.title}</strong><p>{c.preview || 'No preview available'}</p><span>{c.messageCount} messages{c.createdAt ? ` · ${new Date(c.createdAt).toLocaleDateString()}` : ''}</span></div><button className="text-button" onClick={() => { setQuestion(`Continue this previous discussion: ${c.title}. Use the relevant context from my imported conversation history.`); setPage('chat'); }}>Use context <Icon name="arrow"/></button></div>)}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="book"/></div><h3>{historyQuery ? 'No matching conversations' : 'Your memory starts here'}</h3><p>{historyQuery ? 'Try another search term.' : 'Import your Claude data export to make your previous discussions searchable and useful in future answers.'}</p>{!historyQuery && <button className="primary-button" onClick={importHistory}><Icon name="upload"/> Import Claude history</button>}</div>}</div><div className="privacy-note"><Icon name="shield"/><div><strong>Private by default</strong><p>Search and storage happen locally. When you ask Claude a question, ClaudeMate sends only the top matching excerpts (if memory is enabled), along with your prompt.</p></div></div></section>}
      {page === 'profile' && <ProfilePage prep={prep} setPrep={setPrep} notify={notify}/>}
      {page === 'bank' && <BankPage prep={prep} notify={notify} onPractice={(q, reload) => { if (reload) { reloadPrep(); return; } setPracticeSeed(q); setPage('mock'); }}/>}
      {page === 'generate' && <GeneratePage prep={prep} setPrep={setPrep} notify={notify} keyConfigured={keyConfigured} goSettings={() => setPage('settings')} goProfile={() => setPage('profile')}/>}
      {page === 'mock' && <MockPage prep={prep} setPrep={setPrep} notify={notify} keyConfigured={keyConfigured} goSettings={() => setPage('settings')} seed={practiceSeed} clearSeed={() => setPracticeSeed(null)}/>}
      {page === 'settings' && <section className="content-page settings-page"><div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line"/> WORKSPACE CONFIGURATION</div><h1>Settings</h1><p>Configure Claude, personalization, and local data.</p></div><div className="secure-badge"><Icon name="shield"/> Secure settings</div></div><div className="settings-grid"><div className="settings-main"><div className="panel settings-panel"><div className="section-heading"><div className="section-icon claude-icon"><Icon name="spark"/></div><div><h2>Anthropic Claude</h2><p>Connect using your personal Anthropic API key.</p></div><span className={`connection-status ${keyConfigured ? 'good' : ''}`}><span/>{keyConfigured ? 'Configured' : 'Not connected'}</span></div><div className="field-label">ANTHROPIC API KEY</div><div className="key-input-row"><input type={showKey ? 'text' : 'password'} value={keyInput} onChange={e => setKeyInput(e.target.value)} placeholder={keyConfigured ? 'Key saved securely · enter a new key to replace' : 'sk-ant-…'}/><button className="subtle-button" onClick={() => setShowKey(!showKey)}>{showKey ? 'Hide' : 'Show'}</button></div><p className="field-help">Stored with OS-backed encryption. Your key is not sent to OpenAI or included in the renderer UI.</p><div className="button-row"><button className="primary-button" disabled={!keyInput.trim()} onClick={saveKey}>Save API key</button><button className="secondary-button" disabled={!keyConfigured || busy} onClick={testConnection}>Test connection</button>{keyConfigured && <button className="danger-button" onClick={deleteKey}>Remove key</button>}</div><div className="divider"/><div className="field-label">CLAUDE MODEL</div><select className="select-control" value={prefs.model} onChange={e => savePrefs({ ...prefs, model: e.target.value })}><option value="claude-sonnet-5-5">Claude Sonnet 5.5 · Balanced</option><option value="claude-opus-5-5">Claude Opus 5.5 · Advanced reasoning</option><option value="claude-haiku-5-5">Claude Haiku 5.5 · Faster responses</option><option value="claude-sonnet-4-5-20250929">Claude Sonnet 4.5 · Balanced</option><option value="claude-opus-4-1-20250805">Claude Opus 4.1 · Advanced reasoning</option><option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 · Faster responses</option></select><p className="field-help">Model availability depends on your Anthropic API account. API usage is billed separately from Claude Pro/Max subscriptions.</p><div className="link-line"><button className="link-button" onClick={() => window.claudemate.openExternal('https://console.anthropic.com/settings/keys')}>Get an API key <Icon name="arrow"/></button><button className="link-button" onClick={() => window.claudemate.openExternal('https://docs.anthropic.com/en/api/messages')}>API documentation <Icon name="arrow"/></button></div></div>
        <div className="panel settings-panel"><div className="section-heading"><div className="section-icon memory-setting-icon"><Icon name="book"/></div><div><h2>Personal memory</h2><p>Choose how past conversations influence answers.</p></div></div><div className="setting-row"><div><strong>Use imported history</strong><p>Search your local archive and send relevant excerpts with each question.</p></div><button className={`switch ${prefs.memoryEnabled ? 'on' : ''}`} role="switch" aria-checked={prefs.memoryEnabled} onClick={() => savePrefs({ ...prefs, memoryEnabled: !prefs.memoryEnabled })}><span/></button></div><div className="setting-row"><div><strong>Local conversation archive</strong><p>{historyLabel}. Stored in your app data folder.</p></div><button className="secondary-button" onClick={() => setPage('history')}>View history</button></div><div className="setting-row"><div><strong>Delete imported history</strong><p>Permanently erase the local imported archive.</p></div><button className="danger-button" onClick={clearHistory}>Delete all</button></div></div>
        <div className="panel settings-panel"><div className="section-heading"><div className="section-icon privacy-icon"><Icon name="shield"/></div><div><h2>Privacy & data</h2><p>Know what stays on your device and what leaves it.</p></div></div><div className="privacy-list"><div><Icon name="check"/><span><strong>API key</strong> encrypted using operating-system secure storage</span></div><div><Icon name="check"/><span><strong>Imported history</strong> stored locally in the app's data directory</span></div><div><Icon name="check"/><span><strong>Context retrieval</strong> runs locally before each Claude request</span></div><div><Icon name="check"/><span><strong>Claude requests</strong> include your prompt and relevant excerpts when memory is enabled</span></div></div></div></div><aside className="settings-aside"><div className="aside-card"><div className="aside-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="art-center"><Icon name="spark"/></div></div><h3>Your context. Your control.</h3><p>ClaudeMate brings your past thinking into today's work, without requiring you to paste the same background again.</p><div className="aside-stat"><span>MEMORY ARCHIVE</span><strong>{count.total} <small>conversations</small></strong></div><button className="secondary-button full-width" onClick={importHistory}><Icon name="upload"/> Import Claude history</button></div><div className="aside-foot"><Icon name="shield"/> Designed for local-first privacy</div></aside></div></section>}
      <footer className="app-footer"><span>ClaudeMate <span className="footer-dot">·</span> Personal AI workspace</span><span>Built for your workflow <span className="footer-dot">·</span> v0.1 MVP</span></footer>
    </main>
    {notice && <div className={`toast ${notice.kind}`}><span className="toast-mark">{notice.kind === 'success' ? <Icon name="check"/> : '!'}</span>{notice.text}<button onClick={() => setNotice(null)}><Icon name="close"/></button></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
