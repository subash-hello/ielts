import pymongo
import os
import json
from duckduckgo_search import DDGS
from dotenv import load_dotenv

load_dotenv()

client = pymongo.MongoClient(os.getenv("MONGODB_URI"))
db = client.get_default_database()
TestContent = db.testcontents

tests = TestContent.find({
    "type": "practice_task",
    "subType": "listening",
    "title": {"$regex": "Cambridge IELTS (1[0-7])"}
})

def find_map_image(title, questions):
    # Construct a strong query
    query = f"{title} listening map {questions.split(',')[0]} ielts"
    print(f"Searching for: {query}")
    try:
        results = DDGS().images(query, max_results=3)
        for res in results:
            if 'image' in res and 'http' in res['image']:
                # Prioritize png/jpg directly
                if '.png' in res['image'] or '.jpg' in res['image']:
                    return res['image']
        if len(results) > 0:
            return results[0]['image']
    except Exception as e:
        print(f"Error searching {query}: {e}")
    return None

updated_count = 0

for test in tests:
    parts = test['content']['parts']
    modified = False
    for i, part in enumerate(parts):
        has_matching = any(q.get('type') == 'matching' for q in part.get('questions', []))
        if has_matching and not part.get('imageUrl'):
            questions_text = ", ".join([q.get('text', '') for q in part.get('questions', []) if q.get('type') == 'matching'])
            img_url = find_map_image(test['title'], questions_text)
            if img_url:
                print(f"Found map for {test['title']} Part {i+1}: {img_url}")
                parts[i]['imageUrl'] = img_url
                modified = True
            else:
                print(f"Could not find map for {test['title']} Part {i+1}")
                
    if modified:
        TestContent.update_one(
            {"_id": test["_id"]},
            {"$set": {"content.parts": parts}}
        )
        updated_count += 1
        print(f"Updated {test['title']} in DB.")

print(f"Finished updating {updated_count} tests.")
