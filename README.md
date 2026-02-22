# Network Tracker

A real-time terminal dashboard for monitoring network interfaces, bandwidth usage, and active connections.

## Features

- Live per-interface bandwidth (download/upload rates)
- Total bytes/packets sent and received per interface
- Interface status (UP/DOWN) and IP addresses
- Active TCP/UDP connection table with process names
- One-shot JSON snapshot mode for scripting

## Requirements

- Python 3.9+
- Linux/macOS (Windows support limited by `psutil`)

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Live dashboard (default)

```bash
python main.py
```

Options:

| Flag | Default | Description |
|------|---------|-------------|
| `-i`, `--interval` | `1.0` | Refresh interval in seconds |
| `-c`, `--connections` | `20` | Max connections to display |

Example — refresh every 2 seconds, show top 30 connections:

```bash
python main.py --interval 2 --connections 30
```

### One-shot JSON snapshot

```bash
python main.py --snapshot
```

Prints a JSON object with interface stats and connection list, then exits. Useful for piping into `jq` or logging.

```bash
python main.py --snapshot | jq '.interfaces[] | {name, bytes_recv, bytes_sent}'
```

## Project Structure

```
.
├── main.py                      # CLI entry point
├── requirements.txt
└── network_tracker/
    ├── __init__.py
    ├── collector.py             # Data collection (psutil wrappers)
    └── dashboard.py             # Rich live terminal dashboard
```

## Notes

- Reading all connections (`psutil.net_connections`) may require elevated privileges on some systems. Run with `sudo` if you see incomplete connection data.
- The snapshot mode outputs raw cumulative counters from the OS; bandwidth rates are only available in dashboard mode.
