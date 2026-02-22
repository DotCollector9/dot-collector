"""Network data collection using psutil."""

import time
import psutil
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class InterfaceSnapshot:
    name: str
    bytes_sent: int
    bytes_recv: int
    packets_sent: int
    packets_recv: int
    errin: int
    errout: int
    dropin: int
    dropout: int
    timestamp: float = field(default_factory=time.time)


@dataclass
class BandwidthRate:
    interface: str
    bytes_sent_per_sec: float
    bytes_recv_per_sec: float
    packets_sent_per_sec: float
    packets_recv_per_sec: float


@dataclass
class ConnectionInfo:
    fd: int
    family: str
    type: str
    local_addr: str
    local_port: Optional[int]
    remote_addr: str
    remote_port: Optional[int]
    status: str
    pid: Optional[int]
    process_name: str


def get_interface_snapshots() -> dict[str, InterfaceSnapshot]:
    """Return current IO counters for all network interfaces."""
    counters = psutil.net_io_counters(pernic=True)
    snapshots = {}
    for name, stats in counters.items():
        snapshots[name] = InterfaceSnapshot(
            name=name,
            bytes_sent=stats.bytes_sent,
            bytes_recv=stats.bytes_recv,
            packets_sent=stats.packets_sent,
            packets_recv=stats.packets_recv,
            errin=stats.errin,
            errout=stats.errout,
            dropin=stats.dropin,
            dropout=stats.dropout,
        )
    return snapshots


def compute_bandwidth_rates(
    prev: dict[str, InterfaceSnapshot],
    curr: dict[str, InterfaceSnapshot],
) -> list[BandwidthRate]:
    """Compute per-second bandwidth rates between two snapshots."""
    rates = []
    for name, curr_snap in curr.items():
        if name not in prev:
            continue
        prev_snap = prev[name]
        elapsed = curr_snap.timestamp - prev_snap.timestamp
        if elapsed <= 0:
            continue
        rates.append(
            BandwidthRate(
                interface=name,
                bytes_sent_per_sec=(curr_snap.bytes_sent - prev_snap.bytes_sent) / elapsed,
                bytes_recv_per_sec=(curr_snap.bytes_recv - prev_snap.bytes_recv) / elapsed,
                packets_sent_per_sec=(curr_snap.packets_sent - prev_snap.packets_sent) / elapsed,
                packets_recv_per_sec=(curr_snap.packets_recv - prev_snap.packets_recv) / elapsed,
            )
        )
    return rates


def get_connections() -> list[ConnectionInfo]:
    """Return all active network connections with process info."""
    pid_name_cache: dict[int, str] = {}

    def _proc_name(pid: Optional[int]) -> str:
        if pid is None:
            return "-"
        if pid in pid_name_cache:
            return pid_name_cache[pid]
        try:
            name = psutil.Process(pid).name()
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            name = "?"
        pid_name_cache[pid] = name
        return name

    import socket

    family_map = {
        socket.AF_INET: "IPv4",
        socket.AF_INET6: "IPv6",
        socket.AF_UNIX: "Unix",
    }
    type_map = {
        socket.SOCK_STREAM: "TCP",
        socket.SOCK_DGRAM: "UDP",
    }

    connections = []
    try:
        for conn in psutil.net_connections(kind="all"):
            laddr = conn.laddr
            raddr = conn.raddr
            connections.append(
                ConnectionInfo(
                    fd=conn.fd if conn.fd is not None else -1,
                    family=family_map.get(conn.family, str(conn.family)),
                    type=type_map.get(conn.type, str(conn.type)),
                    local_addr=laddr.ip if laddr else "",
                    local_port=laddr.port if laddr else None,
                    remote_addr=raddr.ip if raddr else "",
                    remote_port=raddr.port if raddr else None,
                    status=conn.status or "-",
                    pid=conn.pid,
                    process_name=_proc_name(conn.pid),
                )
            )
    except psutil.AccessDenied:
        pass
    return connections


def get_interface_addresses() -> dict[str, list[str]]:
    """Return IP addresses per interface."""
    result: dict[str, list[str]] = {}
    for iface, addrs in psutil.net_if_addrs().items():
        ips = []
        for addr in addrs:
            if addr.address and addr.address not in ("", "::1", "127.0.0.1"):
                ips.append(addr.address)
        if ips:
            result[iface] = ips
    return result


def get_interface_stats() -> dict[str, psutil._common.snicstats]:
    """Return interface up/down stats."""
    try:
        return psutil.net_if_stats()
    except Exception:
        return {}
