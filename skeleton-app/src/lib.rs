use hyperprocess_macro::hyperprocess;

use hyperware_process_lib::homepage::add_to_homepage;
use hyperware_process_lib::hyperapp::send;
use hyperware_process_lib::{our, println, Address, ProcessId, Request};

use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Default)]
pub struct CounterSnapshot {
    pub http_count: u64,
    pub http_last_message: Option<String>,
    pub local_count: u64,
    pub local_last_message: Option<String>,
    pub remote_count: u64,
    pub remote_last_message: Option<String>,
}

#[derive(Default, Serialize, Deserialize)]
pub struct AppState {
    http_count: u64,
    local_count: u64,
    remote_count: u64,
    http_last_message: Option<String>,
    local_last_message: Option<String>,
    remote_last_message: Option<String>,
}

#[derive(Deserialize)]
struct PingPayload {
    message: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum SendMode {
    Local,
    Remote,
    #[serde(rename = "remote-mismatch")]
    RemoteMismatch,
}

#[derive(Deserialize)]
struct SendMessagePayload {
    mode: SendMode,
    message: String,
    target_node: Option<String>,
}

impl AppState {
    fn snapshot(&self) -> CounterSnapshot {
        CounterSnapshot {
            http_count: self.http_count,
            http_last_message: self.http_last_message.clone(),
            local_count: self.local_count,
            local_last_message: self.local_last_message.clone(),
            remote_count: self.remote_count,
            remote_last_message: self.remote_last_message.clone(),
        }
    }

    fn record_http(&mut self, message: String) -> CounterSnapshot {
        self.http_count += 1;
        self.http_last_message = Some(message.clone());
        println!(
            "[HTTP] #{count} message: {message}",
            count = self.http_count,
            message = message
        );
        // hyperware_process_lib::hyperapp::set_response_status(hyperware_process_lib::http::StatusCode::OK);
        self.snapshot()
    }

    fn record_local(&mut self, message: String) -> CounterSnapshot {
        self.local_count += 1;
        self.local_last_message = Some(message.clone());
        println!(
            "[LOCAL] #{count} message: {message}",
            count = self.local_count,
            message = message
        );
        self.snapshot()
    }

    fn record_remote(&mut self, message: String) -> CounterSnapshot {
        self.remote_count += 1;
        self.remote_last_message = Some(message.clone());
        println!(
            "[REMOTE] #{count} message: {message}",
            count = self.remote_count,
            message = message
        );
        self.snapshot()
    }
}

#[hyperprocess(
    name = "Sample Hyperapp",
    ui = Some(hyperware_process_lib::http::server::HttpBindingConfig::default()),
    endpoints = vec![hyperware_process_lib::hyperapp::Binding::Http {
        path: "/api",
        config: hyperware_process_lib::http::server::HttpBindingConfig::new(false, false, false, None)
    }],
    save_config = hyperware_process_lib::hyperapp::SaveOptions::OnDiff,
    wit_world = "sample-hyperapp-dot-os-v0"
)]
impl AppState {
    #[init]
    async fn initialize(&mut self) {
        add_to_homepage("Sample Hyperapp", Some("📡"), Some("/"), None);
        println!("Sample Hyperapp ready on node {node}", node = our().node);
    }

    #[http]
    async fn get_counters(&self, _request_body: String) -> CounterSnapshot {
        self.snapshot()
    }

    #[http]
    async fn ping_http(&mut self, request_body: String) -> Result<CounterSnapshot, String> {
        let payload: PingPayload = serde_json::from_str(&request_body)
            .map_err(|err| json_error(format!("invalid payload: {err}")))?;
        let message = payload
            .message
            .map(|m| m.trim().to_string())
            .filter(|m| !m.is_empty())
            .unwrap_or_else(|| "(empty message)".to_string());
        match message.as_str() {
            "err" => Err(json_error(format!("simulated error: {message}"))),
            _ => Ok(self.record_http(message)),
        }
    }

    #[local]
    async fn ping_local(&mut self, message: String) -> Result<CounterSnapshot, String> {
        let message = message.trim().to_string();
        let message = if message.is_empty() {
            "(empty message)".to_string()
        } else {
            message
        };
        Ok(self.record_local(message))
        // Ok(self.record_local(message))
    }

    #[http]
    async fn send_message(&mut self, request_body: String) -> Result<CounterSnapshot, String> {
        let payload: SendMessagePayload = serde_json::from_str(&request_body)
            .map_err(|err| json_error(format!("invalid payload: {err}")))?;

        let message = payload.message.trim().to_string();
        if message.is_empty() {
            return Err(json_error("message cannot be empty"));
        }

        let our_address = our();

        match payload.mode {
            SendMode::Local => {
                let snapshot = dispatch_ping(our_address.clone(), "PingLocal", &message).await?;
                Ok(snapshot)
            }
            SendMode::Remote => {
                let target_node = payload
                    .target_node
                    .as_deref()
                    .map(str::trim)
                    .filter(|s| !s.is_empty())
                    .unwrap_or_else(|| our_address.node());

                let process_id = ProcessId::new(
                    Some(our_address.process()),
                    our_address.package(),
                    our_address.publisher(),
                );
                println!("Sending to remote node: {target_node}");
                println!("Process ID: {}", process_id);
                let target = Address::new(target_node.to_string(), process_id);
                let snapshot = dispatch_ping(target, "PingRemote", &message).await?;
                Ok(snapshot)
            }
            SendMode::RemoteMismatch => {
                let target_node = payload
                    .target_node
                    .as_deref()
                    .map(str::trim)
                    .filter(|s| !s.is_empty())
                    .ok_or_else(|| json_error("remote-mismatch requires a target node"))?;

                let process_id = ProcessId::new(
                    Some(our_address.process()),
                    our_address.package(),
                    our_address.publisher(),
                );
                println!("Triggering remote mismatch on node: {target_node}");
                println!("Process ID: {}", process_id);
                let target = Address::new(target_node.to_string(), process_id);
                let snapshot = dispatch_ping(target, "PingLocal", &message).await?;
                Ok(snapshot)
            }
        }
    }

    #[remote]
    async fn ping_remote(&mut self, message: String) -> Result<CounterSnapshot, String> {
        let message = message.trim().to_string();
        let message = if message.is_empty() {
            "(empty message)".to_string()
        } else {
            message
        };

        Ok(self.record_remote(message))
    }
}

async fn dispatch_ping(
    target: Address,
    variant: &str,
    message: &str,
) -> Result<CounterSnapshot, String> {
    let body = serde_json::to_vec(&json!({ variant: message }))
        .map_err(|err| json_error(err.to_string()))?;

    let request = Request::to(target).expects_response(5).body(body);

    match send::<Result<CounterSnapshot, String>>(request).await {
        Ok(Ok(snapshot)) => Ok(snapshot),
        Ok(Err(err)) => Err(err),
        Err(err) => Err(json_error(err.to_string())),
    }
}

fn json_error(message: impl Into<String>) -> String {
    serde_json::json!({ "error": message.into() }).to_string()
}
