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

project-root/
│
├── vehicle_scraper.py # Main Selenium scraper
├── scrape_config_gui.py # Desktop GUI
├── scrape_config.json # Scrape configuration (auto-generated)
├── requirements.txt
│
└── vehicle-price-analytics-app/
└── public/
└── vehicle_data.json # Output JSON (auto-generated)

yaml
Copy code

---

## ⚙️ Prerequisites

### 1️⃣ Python

- Python **3.10 or higher**
- Ensure Python is added to **PATH**

Verify:

```bash
python --version
2️⃣ Google Chrome
Required for Selenium

Must be installed before running the scraper

🚀 Setup on a New Machine
1️⃣ Clone the repository

git clone <REPOSITORY_URL>
cd <PROJECT_FOLDER>
2️⃣ Create and activate a virtual environment (recommended)
Windows

python -m venv venv
venv\Scripts\activate
macOS / Linux

python3 -m venv venv
source venv/bin/activate
3️⃣ Install dependencies

pip install -r requirements.txt
🖥️ Running the Application
Launch the GUI:


python scrape_config_gui.py
From the GUI you can:

Update scrape filters

Save configuration

Run the scraper

View live execution logs

📁 Output Data
Scraped vehicle data is saved to:

pgsql
Copy code
vehicle-price-analytics-app/public/vehicle_data.json
This file is ready to be consumed by:

React / Next.js dashboards

Data visualization tools

Pricing analytics engines

⚠️ First-Time Execution Notes
Chrome will open visibly

If Cloudflare or bot checks appear:

⏳ Wait 10–20 seconds

❌ Do not close the browser

Later runs usually complete faster

🛠 Troubleshooting
ChromeDriver issues

pip install --upgrade selenium webdriver-manager
GUI opens but scraper does not run
Ensure vehicle_scraper.py is in the same directory as scrape_config_gui.py

macOS / Linux permission error

chmod +x vehicle_scraper.py
📦 requirements.txt
txt
Copy code
selenium
webdriver-manager
beautifulsoup4
⚖️ Legal & Ethical Notice
This project is intended for educational and analytical purposes only.
Always respect:

Website terms of service

Rate limits

Applicable laws and regulations

👨‍💻 Author
Yasika Hivin
Software Engineer | Data & Analytics Enthusiast

markdown
Copy code

---

If you want, I can now:
- Add **badges** (Python, Selenium, GUI)
- Add **screenshots** section
- Create a **Docker version**
- Write a **LICENSE file**
- Add **frontend integration notes**

Just say the word 🚀
```
