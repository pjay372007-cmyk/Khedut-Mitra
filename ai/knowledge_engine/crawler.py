import os
import time
import requests
# pyrefly: ignore [missing-import]
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = "http://agri.ikhedut.aau.in"
OUTPUT_DIR = r"c:\Users\pjay3\OneDrive\Desktop\a\raw_data"

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

visited_urls = set()
urls_to_visit = [BASE_URL]

def get_safe_filename(url):
    parsed = urlparse(url)
    path = parsed.path.strip("/")
    if not path:
        return "index.html"
    return path.replace("/", "_") + ".html"

def is_internal(url):
    parsed = urlparse(url)
    return parsed.netloc == "" or parsed.netloc == urlparse(BASE_URL).netloc

print("Starting crawler...")

while urls_to_visit:
    current_url = urls_to_visit.pop(-1)
    
    if current_url in visited_urls:
        continue
        
    print(f"Crawling: {current_url}")
    visited_urls.add(current_url)
    
    try:
        response = requests.get(current_url, timeout=10)
        if response.status_code != 200:
            print(f"Failed to fetch {current_url} (Status: {response.status_code})")
            continue
            
        html_content = response.text
        
        # Save HTML
        filename = get_safe_filename(current_url)
        filepath = os.path.join(OUTPUT_DIR, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(html_content)
            
        # Parse links
        soup = BeautifulSoup(html_content, "html.parser")
        for link in soup.find_all("a", href=True):
            href = link["href"]
            
            # Skip javascript, mailto, etc.
            if href.startswith(("javascript:", "mailto:", "tel:")):
                continue
                
            full_url = urljoin(current_url, href)
            # Remove fragment/query
            full_url = full_url.split("#")[0].split("?")[0]
            
            if is_internal(full_url) and full_url not in visited_urls and full_url not in urls_to_visit:
                # We only want to crawl the text content pages, ignore images/pdf extensions if they exist
                if not full_url.lower().endswith(('.pdf', '.jpg', '.png', '.jpeg', '.gif')):
                    urls_to_visit.append(full_url)
                    
        # time.sleep(1) # Be polite
        
    except Exception as e:
        print(f"Error crawling {current_url}: {e}")

print(f"Crawling complete. Visited {len(visited_urls)} pages.")
