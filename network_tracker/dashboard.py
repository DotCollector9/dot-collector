"""Live terminal dashboard using Rich."""

import time
from typing import Optional

from rich.console import Console
from rich.layout import Layout
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich import box

from .collector import (
    BandwidthRate,
    ConnectionInfo,
    InterfaceSnapshot,
    compute_bandwidth_rates,
    get_connections,
    get_interface_addresses,
    get_interface_snapshots,
    get_interface_stats,
)


def _fmt_bytes(value: float) -> str:
    """Human-readable bytes/sec."""
    for unit in ("B", "KB", "MB", "GB"):
        if abs(value) < 1024:
            return f"{value:6.1f} {unit}/s"
        value /= 1024
    return f"{value:6.1f} TB/s"


def _fmt_total(value: int) -> str:
    """Human-readable total bytes."""
    for unit in ("B", "KB", "MB", "GB", "TB"):
        if abs(value) < 1024:
            return f"{value:.1f} {unit}"
        value /= 1024
    return f"{value:.1f} PB"


def _build_interfaces_table(
    snapshots: dict[str, InterfaceSnapshot],
    rates: list[BandwidthRate],
    addresses: dict[str, list[str]],
    stats: dict,
) -> Table:
    rate_map = {r.interface: r for r in rates}

    table = Table(
        title="Network Interfaces",
        box=box.SIMPLE_HEAVY,
        show_lines=False,
        expand=True,
    )
    table.add_column("Interface", style="bold cyan", min_width=12)
    table.add_column("Status", justify="center", min_width=6)
    table.add_column("IP Addresses", min_width=18)
    table.add_column("Download", justify="right", min_width=14, style="green")
    table.add_column("Upload", justify="right", min_width=14, style="yellow")
    table.add_column("Total Recv", justify="right", min_width=12)
    table.add_column("Total Sent", justify="right", min_width=12)
    table.add_column("Errors In", justify="right", min_width=9, style="red")
    table.add_column("Errors Out", justify="right", min_width=9, style="red")

    for name, snap in sorted(snapshots.items()):
        iface_stats = stats.get(name)
        if iface_stats is not None:
            status = Text("UP", style="green bold") if iface_stats.isup else Text("DOWN", style="red bold")
        else:
            status = Text("-", style="dim")

        ips = ", ".join(addresses.get(name, ["-"]))
        rate = rate_map.get(name)
        dl = _fmt_bytes(rate.bytes_recv_per_sec) if rate else "      -"
        ul = _fmt_bytes(rate.bytes_sent_per_sec) if rate else "      -"

        table.add_row(
            name,
            status,
            ips or "-",
            dl,
            ul,
            _fmt_total(snap.bytes_recv),
            _fmt_total(snap.bytes_sent),
            str(snap.errin) if snap.errin else "0",
            str(snap.errout) if snap.errout else "0",
        )

    return table


def _build_connections_table(connections: list[ConnectionInfo], limit: int = 20) -> Table:
    # Sort: ESTABLISHED first, then by remote addr
    priority = {"ESTABLISHED": 0, "LISTEN": 1, "TIME_WAIT": 2, "CLOSE_WAIT": 3}
    sorted_conns = sorted(
        connections,
        key=lambda c: (priority.get(c.status, 9), c.remote_addr or ""),
    )[:limit]

    table = Table(
        title=f"Active Connections (top {limit})",
        box=box.SIMPLE_HEAVY,
        show_lines=False,
        expand=True,
    )
    table.add_column("Proto", min_width=5)
    table.add_column("Local Address", min_width=20)
    table.add_column("Remote Address", min_width=22)
    table.add_column("Status", min_width=12)
    table.add_column("PID", justify="right", min_width=7)
    table.add_column("Process", min_width=16)

    status_styles = {
        "ESTABLISHED": "green",
        "LISTEN": "cyan",
        "TIME_WAIT": "yellow",
        "CLOSE_WAIT": "yellow",
        "FIN_WAIT1": "dim",
        "FIN_WAIT2": "dim",
        "SYN_SENT": "magenta",
        "SYN_RECV": "magenta",
        "CLOSED": "red dim",
    }

    for conn in sorted_conns:
        local = f"{conn.local_addr}:{conn.local_port}" if conn.local_port else conn.local_addr or "-"
        remote = f"{conn.remote_addr}:{conn.remote_port}" if conn.remote_port else conn.remote_addr or "-"
        style = status_styles.get(conn.status, "")
        table.add_row(
            f"{conn.family}/{conn.type}",
            local,
            remote,
            Text(conn.status, style=style),
            str(conn.pid) if conn.pid else "-",
            conn.process_name,
        )

    return table


def run_dashboard(refresh_interval: float = 1.0, conn_limit: int = 20) -> None:
    """Start the live network tracking dashboard."""
    console = Console()
    console.print(
        Panel.fit(
            "[bold cyan]Network Tracker[/bold cyan] — press [bold]Ctrl+C[/bold] to quit",
            border_style="cyan",
        )
    )
    time.sleep(0.5)

    prev_snapshots: Optional[dict[str, InterfaceSnapshot]] = None
    rates: list[BandwidthRate] = []

    def _build_layout() -> Layout:
        nonlocal prev_snapshots, rates

        curr_snapshots = get_interface_snapshots()
        if prev_snapshots is not None:
            rates = compute_bandwidth_rates(prev_snapshots, curr_snapshots)
        prev_snapshots = curr_snapshots

        addresses = get_interface_addresses()
        stats = get_interface_stats()
        connections = get_connections()

        iface_table = _build_interfaces_table(curr_snapshots, rates, addresses, stats)
        conn_table = _build_connections_table(connections, limit=conn_limit)

        layout = Layout()
        layout.split_column(
            Layout(Panel(iface_table, border_style="blue"), name="interfaces", ratio=2),
            Layout(Panel(conn_table, border_style="green"), name="connections", ratio=3),
        )
        return layout

    with Live(console=console, refresh_per_second=int(1 / refresh_interval), screen=True) as live:
        try:
            while True:
                live.update(_build_layout())
                time.sleep(refresh_interval)
        except KeyboardInterrupt:
            pass

    console.print("[bold cyan]Network Tracker stopped.[/bold cyan]")
