"""
GovBridge Mock Services Runner
Starts all 6 simulated government registries on designated ports:
- Port 8001: Identity Registry (REST/JSON)
- Port 8002: Education Registry (REST/JSON)
- Port 8003: Employment Registry (REST/JSON)
- Port 8004: Skill Registry (SOAP/XML)
- Port 8005: Revenue Registry (Database-style)
- Port 8006: Welfare Registry (REST/JSON)
"""
import sys
import os
import threading
import time
import uvicorn

# Ensure mock-services directory is in path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import identity_service
import education_service
import employment_service
import skill_service
import revenue_service
import welfare_service

SERVICES = [
    ("Identity Registry", identity_service.app, 8001),
    ("Education Registry", education_service.app, 8002),
    ("Employment Registry", employment_service.app, 8003),
    ("Skill Registry (SOAP)", skill_service.app, 8004),
    ("Revenue Registry (DB)", revenue_service.app, 8005),
    ("Welfare Registry", welfare_service.app, 8006),
]


def start_service(name: str, app, port: int):
    config = uvicorn.Config(app, host="127.0.0.1", port=port, log_level="warning", access_log=False)
    server = uvicorn.Server(config)
    server.run()


def start_all_background(daemon: bool = True):
    threads = []
    for name, app, port in SERVICES:
        t = threading.Thread(target=start_service, args=(name, app, port), daemon=daemon)
        t.start()
        threads.append(t)
    time.sleep(1.0)  # Wait for socket bindings
    return threads


if __name__ == "__main__":
    print("=" * 60)
    print("GovBridge Mock Services Launcher (SIH26129)")
    print("=" * 60)
    for name, _, port in SERVICES:
        print(f"[*] Starting {name} on http://127.0.0.1:{port}")
    threads = start_all_background(daemon=False)
    print("\n[+] All 6 mock services are running. Press Ctrl+C to stop.")
    try:
        for t in threads:
            t.join()
    except KeyboardInterrupt:
        print("\n[!] Shutting down mock services.")
