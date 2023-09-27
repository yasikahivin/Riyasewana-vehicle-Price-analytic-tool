import requests
from bs4 import BeautifulSoup
import json

# Define the base URL
base_url = "https://riyasewana.com/search/aqua"

# Define the number of pages you want to scrape
num_pages = 5  # You can change this as needed

# Create an empty list to store the scraped data
vehicle_data_list = []

# Loop through the pages
for page_number in range(1, num_pages + 1):
    # Construct the URL for the current page
    url = base_url

    if(page_number>1):
        url = base_url + "?page=" + str(page_number)

    # Send an HTTP GET request to the URL
    # response = requests.get(url)

    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"}
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
            # title_element = vehicle_element.find("h2", class_="more").find("a")  # Locate the <a> element inside the <h2> with class "more"
            title = vehicle_element.find("h2", class_="more").find("a").text.strip()  # Extract the text of the <a> element and remove leading/trailing whitespace
            price = vehicle_element.find("div", class_="boxintxt b").text.strip()
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
with open("vehicle_data.json", "w", encoding="utf-8") as json_file:
    json.dump(vehicle_data_list, json_file, ensure_ascii=False, indent=4)

print("Data saved to vehicle_data.json.")
