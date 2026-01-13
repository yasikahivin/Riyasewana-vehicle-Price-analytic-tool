import json
import os
import subprocess
import sys
import threading
import tkinter as tk
from tkinter import ttk, messagebox

CONFIG_PATH = "scrape_config.json"
SCRAPER_SCRIPT = "vehicle_scraper.py"  # change if your file name differs

DEFAULT_CONFIG = {
    "vtype": "cars",
    "make": "toyota",
    "model": "aqua",
    "city": "Any",
    "min_price": 0,
    "max_price": 999999999,
    "condition": "Any",
    "pages": 5,
}

FIELDS = [
    ("vtype", "Vehicle Type (vtype)"),
    ("make", "Make"),
    ("model", "Model"),
    ("city", "City"),
    ("min_price", "Min Price"),
    ("max_price", "Max Price"),
    ("condition", "Condition"),
    ("pages", "Pages"),
]


def safe_int(value: str, fallback: int) -> int:
    try:
        return int(str(value).strip())
    except Exception:
        return fallback


class ScrapeConfigGUI(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Riyasewana Scraper Config")
        self.geometry("780x520")
        self.minsize(720, 480)

        self.vars = {k: tk.StringVar(value=str(DEFAULT_CONFIG.get(k, ""))) for k, _ in FIELDS}

        self._build_ui()
        self.load_config_if_exists()

    def _build_ui(self):
        container = ttk.Frame(self, padding=12)
        container.pack(fill="both", expand=True)

        title = ttk.Label(container, text="Scrape Configuration", font=("Segoe UI", 14, "bold"))
        title.pack(anchor="w", pady=(0, 10))

        form = ttk.Frame(container)
        form.pack(fill="x")

        for i, (key, label) in enumerate(FIELDS):
            row = ttk.Frame(form)
            row.pack(fill="x", pady=4)

            ttk.Label(row, text=label, width=22).pack(side="left")
            entry = ttk.Entry(row, textvariable=self.vars[key])
            entry.pack(side="left", fill="x", expand=True)

        btn_row = ttk.Frame(container)
        btn_row.pack(fill="x", pady=(12, 8))

        ttk.Button(btn_row, text="Load Config", command=self.load_config_if_exists).pack(side="left")
        ttk.Button(btn_row, text="Save Config", command=self.save_config).pack(side="left", padx=8)
        ttk.Button(btn_row, text="Run Scraper", command=self.run_scraper_threaded).pack(side="left")

        ttk.Label(btn_row, text=f"Config path: {os.path.abspath(CONFIG_PATH)}").pack(side="right")

        ttk.Separator(container).pack(fill="x", pady=10)

        log_label = ttk.Label(container, text="Run Log", font=("Segoe UI", 11, "bold"))
        log_label.pack(anchor="w")

        self.log = tk.Text(container, height=14, wrap="word")
        self.log.pack(fill="both", expand=True)

        scrollbar = ttk.Scrollbar(self.log, command=self.log.yview)
        self.log.configure(yscrollcommand=scrollbar.set)
        scrollbar.pack(side="right", fill="y")

        self._log_line("Ready. Update values, Save Config, then Run Scraper.")

    def _log_line(self, msg: str):
        self.log.insert("end", msg + "\n")
        self.log.see("end")

    def load_config_if_exists(self):
        if not os.path.exists(CONFIG_PATH):
            self._log_line(f"No config found. Using defaults.")
            self._apply_config(DEFAULT_CONFIG)
            return

        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                cfg = json.load(f)
            self._apply_config({**DEFAULT_CONFIG, **cfg})
            self._log_line(f"Loaded config from {CONFIG_PATH}")
        except Exception as e:
            messagebox.showerror("Load error", f"Failed to load {CONFIG_PATH}\n\n{e}")
            self._log_line(f"ERROR loading config: {e}")

    def _apply_config(self, cfg: dict):
        for key, _ in FIELDS:
            self.vars[key].set(str(cfg.get(key, DEFAULT_CONFIG.get(key, ""))))

    def _collect_config(self) -> dict:
        cfg = {}
        for key, _ in FIELDS:
            cfg[key] = self.vars[key].get().strip()

        # enforce numeric fields
        cfg["min_price"] = safe_int(cfg.get("min_price"), DEFAULT_CONFIG["min_price"])
        cfg["max_price"] = safe_int(cfg.get("max_price"), DEFAULT_CONFIG["max_price"])
        cfg["pages"] = max(1, safe_int(cfg.get("pages"), DEFAULT_CONFIG["pages"]))

        # keep strings as-is for these
        cfg["vtype"] = cfg.get("vtype") or DEFAULT_CONFIG["vtype"]
        cfg["make"] = cfg.get("make") or DEFAULT_CONFIG["make"]
        cfg["model"] = cfg.get("model") or DEFAULT_CONFIG["model"]
        cfg["city"] = cfg.get("city") or DEFAULT_CONFIG["city"]
        cfg["condition"] = cfg.get("condition") or DEFAULT_CONFIG["condition"]

        # simple sanity check
        if cfg["min_price"] > cfg["max_price"]:
            raise ValueError("min_price cannot be greater than max_price")

        return cfg

    def save_config(self):
        try:
            cfg = self._collect_config()
            with open(CONFIG_PATH, "w", encoding="utf-8") as f:
                json.dump(cfg, f, ensure_ascii=False, indent=4)
            self._log_line(f"Saved config to {CONFIG_PATH}")
            messagebox.showinfo("Saved", f"Saved config to:\n{os.path.abspath(CONFIG_PATH)}")
        except Exception as e:
            messagebox.showerror("Save error", str(e))
            self._log_line(f"ERROR saving config: {e}")

    def run_scraper_threaded(self):
        # Save first (so run uses latest values)
        try:
            self.save_config()
        except Exception:
            return

        t = threading.Thread(target=self.run_scraper, daemon=True)
        t.start()

    def run_scraper(self):
        if not os.path.exists(SCRAPER_SCRIPT):
            self._log_line(f"ERROR: {SCRAPER_SCRIPT} not found in this folder.")
            return

        self._log_line(f"Running: {sys.executable} {SCRAPER_SCRIPT}")
        self._log_line("-" * 60)

        try:
            # Run the scraper and stream logs into the textbox
            proc = subprocess.Popen(
                [sys.executable, SCRAPER_SCRIPT],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )

            for line in proc.stdout:
                self._log_line(line.rstrip("\n"))

            code = proc.wait()
            self._log_line("-" * 60)
            self._log_line(f"Finished with exit code: {code}")

        except Exception as e:
            self._log_line(f"ERROR running scraper: {e}")


if __name__ == "__main__":
    app = ScrapeConfigGUI()
    app.mainloop()
