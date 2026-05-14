import requests
from bs4 import BeautifulSoup

def get_link_metadata(url):
    try:
        response = requests.get(url, timeout=5)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.find('meta', property='og:title') or soup.find('title')
        description = soup.find('meta', property='og:description') or soup.find('meta', attrs={'name': 'description'})
        image = soup.find('meta', property='og:image')
        
        return {
            'url': url,
            'title': title.get('content') if hasattr(title, 'get') else title.string if title else url,
            'description': description.get('content') if hasattr(description, 'get') else '',
            'image': image.get('content') if image else ''
        }
    except Exception:
        return None
