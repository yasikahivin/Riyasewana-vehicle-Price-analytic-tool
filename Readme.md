# 🚗 Riyasewana Vehicle Price Scraper (GUI + Selenium)

A desktop-based vehicle price scraping tool for **Riyasewana.com**, built using **Selenium + BeautifulSoup**, with a **Tkinter GUI** to configure filters and generate structured JSON output for analytics and dashboards.

This tool uses a **real Chrome browser** to safely handle JavaScript and Cloudflare protection.

---

## ✨ Features

- 🖥️ Desktop GUI to manage scrape configuration  
- 🌐 Real Chrome browser (Cloudflare-safe)  
- 🔍 Filter by:
  - Vehicle type
  - Make
  - Model
  - City
  - Price range
  - Condition
  - Number of pages
- 📊 Extracts:
  - Title
  - Price (integer)
  - Posted date
  - Location
  - Mileage (km)
  - Listing URL
- 💾 Outputs clean JSON for frontend analytics  
- 🧠 Automatic ChromeDriver management  

---

## 🗂 Project Structure

```
project-root/
│
├── vehicle_scraper.py              # Main Selenium scraper
├── scrape_config_gui.py            # Desktop GUI
├── scrape_config.json              # Scrape configuration (auto-generated)
├── requirements.txt
│
└── vehicle-price-analytics-app/
    └── public/
        └── vehicle_data.json       # Output JSON (auto-generated)
```

---

## ⚙️ Prerequisites

### 1️⃣ Python
- Python **3.10 or higher**
- Ensure Python is added to **PATH**

Verify:
```bash
python --version
```

### 2️⃣ Google Chrome
- Required for Selenium
- Must be installed before running the scraper

---

## 🚀 Setup on a New Machine

### 1️⃣ Clone the repository
```bash
git clone <REPOSITORY_URL>
cd <PROJECT_FOLDER>
```

### 2️⃣ Create and activate a virtual environment (recommended)

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

---

## 🖥️ Running the Application

```bash
python scrape_config_gui.py
```

From the GUI you can:
- Update scrape filters
- Save configuration
- Run the scraper
- View live execution logs

---

## 📁 Output Data

```
vehicle-price-analytics-app/public/vehicle_data.json
```

This JSON file is ready for:
- React / Next.js dashboards
- Data analytics
- Market price comparison tools

---

## ⚠️ First-Time Execution Notes

- Chrome will open **visibly**
- If Cloudflare or bot checks appear:
  - ⏳ Wait 10–20 seconds
  - ❌ Do not close the browser
- Subsequent runs are faster

---

## 🛠 Troubleshooting

### ChromeDriver issues
```bash
pip install --upgrade selenium webdriver-manager
```

### GUI opens but scraper does not run
- Ensure `vehicle_scraper.py` is in the same directory as `scrape_config_gui.py`

### macOS / Linux permission issue
```bash
chmod +x vehicle_scraper.py
```

---

## 📦 requirements.txt

```txt
selenium
webdriver-manager
beautifulsoup4
```

---

## ⚖️ Legal & Ethical Notice

This project is intended for **educational and analytical purposes only**.  
Always respect website terms of service and local regulations.

---

## 👨‍💻 Author

**Yasika Hivin**  
Software Engineer | Data & Analytics Enthusiast
