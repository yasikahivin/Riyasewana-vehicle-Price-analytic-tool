import requests
from bs4 import BeautifulSoup
import json
import re

# Define the base URL
base_url = "https://riyasewana.com/search/aqua"

# Define the number of pages you want to scrape
num_pages = 5  # You can change this as needed

# Define the price range
min_price = 4000000  # Example minimum price
max_price = 9000000  # Example maximum price

# Create an empty list to store the scraped data
vehicle_data_list = []

# Loop through the pages
for page_number in range(1, num_pages + 1):
    # Construct the URL for the current page
    url = base_url

    if page_number > 1:
        url = base_url + "?page=" + str(page_number)

    # Send an HTTP GET request to the URL
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers)
    print(f"Response {response.status_code}.")

    # Check if the request was successful (status code 200)
    if response.status_code == 200:
        # Parse the HTML content of the page
        soup = BeautifulSoup(response.text, "html.parser")

        # Find the HTML elements containing vehicle data and extract it
        vehicle_data_elements = soup.find_all("li", class_="item round")

        # Loop through the data elements and extract specific details
        for vehicle_element in vehicle_data_elements:
            # Extract and store the details in a dictionary
            title = vehicle_element.find("h2", class_="more").find("a").text.strip()
            price_text = vehicle_element.find("div", class_="boxintxt b").text.strip()

            # Use regular expressions to extract the numeric part of the price
            price_match = re.search(r"\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?", price_text)
            price = int(price_match.group().replace(",", "")) if price_match else None

            # Check if the price is within the desired range
            if price and min_price <= price <= max_price:
                date = vehicle_element.find("div", class_="boxintxt s").text.strip()

                # Create a dictionary for the current vehicle
                vehicle_data = {
                    "Title": title,
                    "Price": price,
                    "Date": date,
                    # Add more data fields as needed
                }

                # Append the dictionary to the list
                vehicle_data_list.append(vehicle_data)

        print(f"Page {page_number} data added to JSON.")

    else:
        print(f"Failed to retrieve page {page_number}.")

    # Close the HTTP session for the current page
    response.close()

# Save the scraped data to a JSON file
with open("vehicle-price-analytics-app/public/vehicle_data.json", "w", encoding="utf-8") as json_file:
    json.dump(vehicle_data_list, json_file, ensure_ascii=False, indent=4)

print("Data saved to vehicle_data.json.")
