"""
Riyasewana scraper (Selenium + BeautifulSoup)

- Uses a REAL Chrome browser (needed because site may show Cloudflare/JS challenge)
- Scrapes: Title, Price (int), Date, Location, MileageKm, Link
- Filters by price range (from scrape_config.json)
- Saves JSON to: vehicle-price-analytics-app/public/vehicle_data.json (creates folders)

Install:
  pip install selenium webdriver-manager beautifulsoup4

Run:
  python vehicle_scraper.py
"""

import json
import os
import re
import time
from typing import Optional, Dict, Any, List

from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

# ----------------------------
# Config
# ----------------------------
CONFIG_PATH = "scrape_config.json"
OUT_PATH = "vehicle-price-analytics-app/public/vehicle_data.json"
PAGE_DELAY = 4  # seconds between page loads

def slug(s: str) -> str:
    s = (s or "").strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\-]", "", s)
    return s

def build_riyasewana_url(
    vtype="cars",
    make=None,
    model=None,
    city=None,
    min_price=None,
    max_price=None,
    condition=None,
) -> str:
    parts = ["https://riyasewana.com/search", slug(vtype)]

    if make and make != "Any":
        parts.append(slug(make))
    if model and model != "Any":
        parts.append(slug(model))
    if city and city != "Any":
        parts.append(slug(city))

    if min_price is not None and max_price is not None:
        parts.append(f"price-{int(min_price)}-{int(max_price)}")

    if condition and condition != "Any":
        parts.append(slug(condition))

    return "/".join(parts)

def load_config() -> Dict[str, Any]:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# ----------------------------
# Parsers
# ----------------------------
def parse_price(price_text: str) -> Optional[int]:
    """Return integer price from 'Rs. 7,290,000' else None (e.g., Negotiable)."""
    if not price_text:
        return None
    if "Negotiable" in price_text:
        return None
    m = re.search(r"\d{1,3}(?:,\d{3})+", price_text)
    if not m:
        return None
    return int(m.group().replace(",", ""))

def parse_mileage_km(text: str) -> Optional[int]:
    """Extract mileage number from '154500 (km)' etc."""
    if not text:
        return None
    m = re.search(r"(\d[\d,]*)\s*\(km\)", text.replace(",", ""))
    if not m:
        return None
    try:
        return int(m.group(1))
    except ValueError:
        return None

# ----------------------------
# Selenium
# ----------------------------
def build_driver() -> webdriver.Chrome:
    options = Options()

    # Use visible browser first. If stable, you can try headless.
    # options.add_argument("--headless=new")

    options.add_argument("--start-maximized")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options,
    )
    driver.set_page_load_timeout(60)
    return driver

# ----------------------------
# Scrape one page
# ----------------------------
def scrape_page(html: str, min_price: int, max_price: int) -> List[Dict[str, Any]]:
    soup = BeautifulSoup(html, "html.parser")
    items = soup.select("li.item.round")

    results: List[Dict[str, Any]] = []

    for item in items:
        title_tag = item.select_one("h2.more a")
        price_tag = item.select_one("div.boxintxt.b")
        date_tag = item.select_one("div.boxintxt.s")
        box_fields = [x.get_text(" ", strip=True) for x in item.select("div.boxtext div.boxintxt")]

        if not title_tag or not price_tag or not date_tag:
            continue

        title = title_tag.get_text(strip=True)
        link = title_tag.get("href")

        price_text = price_tag.get_text(" ", strip=True)
        price = parse_price(price_text)

        date = date_tag.get_text(strip=True)

        location = box_fields[0] if len(box_fields) >= 1 else None

        mileage_km = None
        for field in box_fields:
            km = parse_mileage_km(field)
            if km is not None:
                mileage_km = km
                break

        if price is None:
            continue
        if not (min_price <= price <= max_price):
            continue

        results.append(
            {
                "Title": title,
                "Price": price,
                "Date": date,
                "Location": location,
                "MileageKm": mileage_km,
                "Link": link,
            }
        )

    return results

# ----------------------------
# Main
# ----------------------------
def main():
    cfg = load_config()

    vtype = cfg.get("vtype", "cars")
    make = cfg.get("make", "toyota")
    model = cfg.get("model", "aqua")
    city = cfg.get("city", "Any")
    min_price = int(cfg.get("min_price", 0))
    max_price = int(cfg.get("max_price", 999999999))
    condition = cfg.get("condition", "Any")
    num_pages = int(cfg.get("pages", 5))

    BASE_URL = build_riyasewana_url(
        vtype=vtype,
        make=make,
        model=model,
        city=city,
        min_price=min_price,
        max_price=max_price,
        condition=condition,
    )

    print("Base URL:", BASE_URL)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)

    driver = build_driver()
    all_data: List[Dict[str, Any]] = []

    try:
        for page in range(1, num_pages + 1):
            url = BASE_URL if page == 1 else f"{BASE_URL}?page={page}"
            print(f"Loading page {page}: {url}")

            try:
                driver.get(url)
            except Exception as e:
                print(f"  Page load error on page {page}: {e}")
                continue

            time.sleep(PAGE_DELAY)

            html = driver.page_source
            page_data = scrape_page(html, min_price=min_price, max_price=max_price)

            if not page_data:
                print("  No listings found (possible challenge page, or no results for filters).")
            else:
                all_data.extend(page_data)
                print(f"  Extracted {len(page_data)} listings. Total kept: {len(all_data)}")

            time.sleep(1)

    finally:
        driver.quit()

    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_data, f, ensure_ascii=False, indent=4)

    print(f"\nSaved {len(all_data)} records to: {OUT_PATH}")

if __name__ == "__main__":
    main()
