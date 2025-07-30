# Hyperware Skeleton App

A minimal, well-commented skeleton application for the Hyperware platform using the Hyperapp framework. This skeleton provides a starting point for building Hyperware applications with a React/TypeScript frontend and Rust backend.

## Features

- ✅ Minimal working Hyperware app structure
- ✅ Well-commented code explaining key concepts
- ✅ Basic state management with counter example
- ✅ HTTP endpoints demonstration
- ✅ React/TypeScript UI with Zustand state management
- ✅ Error handling and loading states
- ✅ Automatic WIT generation via hyperprocess macro
- ✅ Persistent state across app restarts

## Quick Start

### Prerequisites

- Hyperware development environment (`kit` command)
- Rust toolchain
- Node.js and npm

### Building

   ```bash
   kit b --hyperapp
   ```


## Project Structure

```
hyperapp-skeleton/
├── Cargo.toml              # Workspace configuration
├── metadata.json           # App metadata
├── skeleton-app/           # Main Rust process
│   ├── Cargo.toml         # Process dependencies
│   └── src/
│       ├── lib.rs         # Main app logic (well-commented)
│       └── icon           # App icon file
├── ui/                    # Frontend application
│   ├── package.json       # Node dependencies
│   ├── index.html         # Entry point (includes /our.js)
│   ├── vite.config.ts     # Build configuration
│   └── src/
│       ├── App.tsx        # Main React component
│       ├── store/         # Zustand state management
│       ├── types/         # TypeScript type definitions
│       └── utils/         # API utilities
├── api/                   # Generated WIT files (after build)
└── pkg/                   # Built package output
```

## Key Concepts

### 1. The Hyperprocess Macro

The `#[hyperprocess]` macro is the core of the Hyperapp framework. It provides:
- Async/await support without tokio
- Automatic WIT generation
- State persistence
- HTTP/WebSocket endpoint configuration

### 2. Required Patterns

#### HTTP Endpoints
ALL HTTP endpoints MUST accept a `_request_body: String` parameter:
```rust
#[http]
async fn my_endpoint(&self, _request_body: String) -> String {
    // Implementation
}
```

#### Frontend API Calls
Parameters must be sent as tuples for multi-parameter methods:
```typescript
// Single parameter
{ "MethodName": value }

// Multiple parameters  
{ "MethodName": [param1, param2] }
```

#### The /our.js Script
MUST be included in index.html:
```html
<script src="/our.js"></script>
```

### 3. State Persistence

Your app's state is automatically persisted based on the `save_config` option:
- `EveryMessage`: Save after each message (safest)
- `OnInterval(n)`: Save every n seconds
- `Never`: No automatic saves

## Customization Guide

### 1. Modify App State

Edit `AppState` in `skeleton-app/src/lib.rs`:
```rust
#[derive(Default, Serialize, Deserialize)]
pub struct AppState {
    // Add your fields here
    my_data: Vec<MyType>,
}
```

### 2. Add HTTP Endpoints

For UI interaction:
```rust
#[http]
async fn my_method(&mut self, request_body: String) -> Result<String, String> {
    // Parse request, update state, return response
}
```

### 3. Add Capabilities

Add system permissions in `manifest.json`:
```json
"request_capabilities": [
    "homepage:homepage:sys",
    "http-server:distro:sys",
    "vfs:distro:sys"  // Add as needed
]
```

### 4. Update Frontend

1. Add types in `ui/src/types/skeleton.ts`
2. Add API calls in `ui/src/utils/api.ts`
3. Update store in `ui/src/store/skeleton.ts`
4. Modify UI in `ui/src/App.tsx`

## Common Issues and Solutions

### "Failed to deserialize HTTP request"
- Ensure all HTTP methods have `_request_body` parameter
- Check parameter format (tuple vs object)

### "Node not connected"
- Verify `/our.js` is included in index.html
- Check that the app is running in Hyperware environment

### WIT Generation Errors
- Use simple types or return JSON strings
- No HashMap (use Vec<(K,V)>)
- No fixed arrays (use Vec<T>)
- Add #[derive(PartialEq)] to structs

### Import Errors
- Don't add `hyperware_process_lib` to Cargo.toml
- Use imports from `hyperprocess_macro`

## Testing Your App

1. Run a Hyperware node:
   ```bash
   kit s
   ```

2. Your app will be automatically installed and available at `http://localhost:8080`
3. Check the Hyperware homepage for your app icon

## Next Steps

1. **Study the Code**: Read through the well-commented `lib.rs` file
2. **Experiment**: Try modifying the counter logic or adding new endpoints
3. **Build Features**: Add your own functionality following the patterns
4. **Add Capabilities**: Request system permissions as needed for your features

## Resources

- **Development Guides**: See `resources/guides/` for comprehensive documentation
  - [Manifest & Deployment](resources/guides/08-MANIFEST-AND-DEPLOYMENT.md) - Understanding manifest.json
  - [Capabilities Guide](resources/guides/09-CAPABILITIES-GUIDE.md) - System permissions reference
  - [Complete Guide Index](resources/guides/README.md) - All available guides
- **Example Apps**: Check the `example-apps` folder for working implementations
- **Hyperware Documentation**: [Coming Soon]
- **Community**: [Coming Soon]

## License

[Your License Here]
