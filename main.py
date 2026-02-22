#!/usr/bin/env python3
"""Entry point for the network tracking app."""

import argparse
import sys


def main() -> None:
    parser = argparse.ArgumentParser(
        prog="network-tracker",
        description="Real-time network interface and connection tracker.",
    )
    parser.add_argument(
        "--interval",
        "-i",
        type=float,
        default=1.0,
        metavar="SECONDS",
        help="Refresh interval in seconds (default: 1.0)",
    )
    parser.add_argument(
        "--connections",
        "-c",
        type=int,
        default=20,
        metavar="N",
        help="Max connections to display (default: 20)",
    )
    parser.add_argument(
        "--snapshot",
        "-s",
        action="store_true",
        help="Print a one-time snapshot and exit (no live dashboard)",
    )

    args = parser.parse_args()

    if args.snapshot:
        _print_snapshot()
    else:
        from network_tracker.dashboard import run_dashboard
        run_dashboard(refresh_interval=args.interval, conn_limit=args.connections)


def _print_snapshot() -> None:
    """Print a single point-in-time summary to stdout."""
    import json
    import time
    from network_tracker.collector import (
        get_connections,
        get_interface_addresses,
        get_interface_snapshots,
        get_interface_stats,
    )

    snapshots = get_interface_snapshots()
    addresses = get_interface_addresses()
    stats = get_interface_stats()
    connections = get_connections()

    output = {
        "timestamp": time.time(),
        "interfaces": [
            {
                "name": snap.name,
                "addresses": addresses.get(snap.name, []),
                "is_up": getattr(stats.get(snap.name), "isup", None),
                "bytes_sent": snap.bytes_sent,
                "bytes_recv": snap.bytes_recv,
                "packets_sent": snap.packets_sent,
                "packets_recv": snap.packets_recv,
                "errin": snap.errin,
                "errout": snap.errout,
            }
            for snap in snapshots.values()
        ],
        "connections": [
            {
                "family": c.family,
                "type": c.type,
                "local": f"{c.local_addr}:{c.local_port}" if c.local_port else c.local_addr,
                "remote": f"{c.remote_addr}:{c.remote_port}" if c.remote_port else c.remote_addr,
                "status": c.status,
                "pid": c.pid,
                "process": c.process_name,
            }
            for c in connections
        ],
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
