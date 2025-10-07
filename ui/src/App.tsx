import { useEffect } from 'react';
import './App.css';
import { useSampleSelectors } from './store/skeleton';

function LabeledValue({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="value">
      <span className="value-label">{label}</span>
      <span className="value-data">{value ?? '—'}</span>
    </div>
  );
}

function App() {
  const nodeId = useSampleSelectors.nodeId();
  const isConnected = useSampleSelectors.isConnected();
  const counters = useSampleSelectors.counters();
  const httpMessage = useSampleSelectors.httpMessage();
  const processMessage = useSampleSelectors.processMessage();
  const sendMode = useSampleSelectors.sendMode();
  const remoteNode = useSampleSelectors.remoteNode();
  const mismatchNode = useSampleSelectors.mismatchNode();
  const mismatchMessage = useSampleSelectors.mismatchMessage();
  const isSubmitting = useSampleSelectors.isSubmitting();
  const isHttpMismatchSubmitting = useSampleSelectors.isHttpMismatchSubmitting();
  const isMismatchSubmitting = useSampleSelectors.isMismatchSubmitting();
  const isLoading = useSampleSelectors.isLoading();
  const error = useSampleSelectors.error();
  const initialize = useSampleSelectors.initialize();
  const refresh = useSampleSelectors.refresh();
  const setHttpMessage = useSampleSelectors.setHttpMessage();
  const setProcessMessage = useSampleSelectors.setProcessMessage();
  const setSendMode = useSampleSelectors.setSendMode();
  const setRemoteNode = useSampleSelectors.setRemoteNode();
  const setMismatchNode = useSampleSelectors.setMismatchNode();
  const setMismatchMessage = useSampleSelectors.setMismatchMessage();
  const sendHttpPing = useSampleSelectors.sendHttpPing();
  const triggerHttpMismatch = useSampleSelectors.triggerHttpMismatch();
  const sendProcessMessage = useSampleSelectors.sendProcessMessage();
  const triggerMismatch = useSampleSelectors.triggerMismatch();
  const clearError = useSampleSelectors.clearError();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>📡 Sample Hyperapp</h1>
          <p className="subtitle">Ping counters for HTTP, local, and remote interactions.</p>
        </div>
        <div className="status-box">
          {isConnected ? (
            <>
              <span className="status-dot online" />
              <span>Connected as {nodeId}</span>
            </>
          ) : (
            <>
              <span className="status-dot offline" />
              <span>Not connected</span>
            </>
          )}
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button type="button" onClick={clearError}>
            Dismiss
          </button>
        </div>
      )}

      <main className="content">
        <section className="card">
          <h2>HTTP Ping</h2>
          <p>Send a message via the HTTP handler. Each ping increments the HTTP counter.</p>
          <form
            className="ping-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendHttpPing();
            }}
          >
            <input
              type="text"
              placeholder="Message to send"
              value={httpMessage}
              onChange={(event) => setHttpMessage(event.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Ping'}
            </button>
            <button
              type="button"
              className="danger-action"
              onClick={() => triggerHttpMismatch()}
              disabled={isHttpMismatchSubmitting}
            >
              {isHttpMismatchSubmitting ? 'Triggering…' : 'HTTP Mismatch'}
            </button>
          </form>
          <p className="hint">
            The mismatch button POSTs a `PingLocal` payload to the HTTP endpoint, which should drive the
            backend into the unexpected-variant path without taking down the process.
          </p>
        </section>

        <section className="card danger-card">
          <h2>Unreachable Arm Demo</h2>
          <p>
            Send a remote message that deliberately uses the wrong handler variant. This will drive the
            macro-generated dispatcher into its <code>unreachable!</code> arm on the target node. The
            request usually returns an error once the remote crashes, so keep an eye on the banner above.
          </p>
          <form
            className="mismatch-form"
            onSubmit={(event) => {
              event.preventDefault();
              triggerMismatch();
            }}
          >
            <input
              type="text"
              className="mismatch-input"
              placeholder="Target node (e.g. other-node.os)"
              value={mismatchNode}
              onChange={(event) => setMismatchNode(event.target.value)}
              disabled={isMismatchSubmitting}
            />
            <input
              type="text"
              className="mismatch-input"
              placeholder="Message payload"
              value={mismatchMessage}
              onChange={(event) => setMismatchMessage(event.target.value)}
              disabled={isMismatchSubmitting}
            />
            <button type="submit" disabled={isMismatchSubmitting}>
              {isMismatchSubmitting ? 'Triggering…' : 'Trigger Unreachable'}
            </button>
          </form>
        </section>

        <section className="card">
          <h2>Process Message</h2>
          <p>Dispatch through the new HTTP handler. The message is routed to the matching `#[local]` or `#[remote]` endpoint.</p>
          <form
            className="message-form"
            onSubmit={(event) => {
              event.preventDefault();
              sendProcessMessage();
            }}
          >
            <div className="mode-toggle">
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="local"
                  checked={sendMode === 'local'}
                  onChange={() => setSendMode('local')}
                  disabled={isSubmitting}
                />
                Local
              </label>
              <label>
                <input
                  type="radio"
                  name="mode"
                  value="remote"
                  checked={sendMode === 'remote'}
                  onChange={() => setSendMode('remote')}
                  disabled={isSubmitting}
                />
                Remote
              </label>
            </div>

            {sendMode === 'remote' && (
              <input
                type="text"
                className="remote-input"
                placeholder="Target node (e.g. fake.os)"
                value={remoteNode}
                onChange={(event) => setRemoteNode(event.target.value)}
                disabled={isSubmitting}
              />
            )}

            <input
              type="text"
              className="message-input"
              placeholder="Message to send"
              value={processMessage}
              onChange={(event) => setProcessMessage(event.target.value)}
              disabled={isSubmitting}
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </section>

        <section className="card">
          <div className="card-header">
            <h2>Counter Status</h2>
            <button type="button" onClick={refresh} disabled={isLoading}>
              {isLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="counters">
            <div className="counter">
              <h3>HTTP Handler</h3>
              <LabeledValue label="Count" value={counters?.http_count ?? 0} />
              <LabeledValue label="Last message" value={counters?.http_last_message ?? null} />
            </div>
            <div className="counter">
              <h3>Local Handler</h3>
              <LabeledValue label="Count" value={counters?.local_count ?? 0} />
              <LabeledValue label="Last message" value={counters?.local_last_message ?? null} />
            </div>
            <div className="counter">
              <h3>Remote Handler</h3>
              <LabeledValue label="Count" value={counters?.remote_count ?? 0} />
              <LabeledValue label="Last message" value={counters?.remote_last_message ?? null} />
            </div>
          </div>
        </section>

        <section className="card instructions">
          <h2>Terminal Pings</h2>
          <p>
            Use <code>kit inject-message</code> to exercise the local and remote handlers directly. Replace
            <code>&lt;node&gt;</code> with the target node ID if you have multiple nodes running.
          </p>
          <pre>
{`# Local ping (loopback)
kit inject-message sample-hyperapp:sample-hyperapp:sample.os '{"PingLocal":"Hello from local"}'

# Remote ping (targeting another node)
kit inject-message sample-hyperapp:sample-hyperapp:<target-node>.os '{"PingRemote":"Hello from remote"}'`}
          </pre>
          <p>
            These commands mirror the behaviour used by the UI. Each handler returns the latest
            counter snapshot and logs the message in the backend console.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;
