import requests
import json
import os
import time
import sys
import random
from typing import Optional
from dotenv import load_dotenv


class AutoInstagramPoster:
    INSTA_ACCESS_TOKEN = None
    INSTA_ACCOUNT_ID = None

    def __init__(self, insta_access_token, insta_account_id):
        self.INSTA_ACCESS_TOKEN = insta_access_token
        self.INSTA_ACCOUNT_ID = insta_account_id
    
    def fetch_meme_of_the_day(self) -> Optional[dict]:
        fetch_url = os.environ["FETCH_MEME_BASE_URL"]
        fetched_meme = None

        while fetched_meme is None:
            r = requests.get(fetch_url)
            
            if r.status_code == 200:
                result = json.loads(r.text)
                try:
                    assert "title" in result
                    assert "url" in result
                    assert "author" in result
                    assert "nsfw" in result
                    assert result["nsfw"] is False
                except AssertionError as e:
                    print(e)
                    continue
                else:
                    fetched_meme = result
            else:
                try:
                    result = json.loads(r.text)
                    print(result)
                except Exception as e:
                    print(result)
                    print("LOG: FATAL - ", e, "\n")
            return result
        return None
    
    def generate_caption(self, meme_data):
        hastags = self.generate_hastags()
        credits = self.generate_credits(meme_data)
        title = meme_data["title"]

        return f"""
            {title}\n\n{credits}\n\n{hastags}
        """
    
    def generate_hastags(self):
        available_hashtags = [
            "#funny", "#meme", "#memeoftheday", "#memeaday", "#funnypage", "#memepage",
            "#funnymemes", "#memes", "#funny", "#meme", "#dankmemes", "#memesdaily", "#lol", "#funnyvideos",
            "#comedy", "#dailymemes", "#follow", "#dank", "#offensivememes", "#edgymemes", "#memepage", "#lmao",
            "#fun", "#humor", "#memestagram", "#love", "#funnymeme", "#tiktok", "#instagram", "#like",
            "#dankmeme", "#jokes", "#explorepage", "#memer", "#instagood"
        ]
        top_hashtags = [
            "#love","#instagood","#fashion","#photooftheday","#beautiful","#art","#photography","#happy",
            "#picoftheday","#cute","#follow","#tbt","#followme","#nature","#like4like","#travel","#instagram",
            "#style","#repost","#summer454","#selfie","#instadaily","#friends","#me","#girl","#fitness",
            "#fun","#food","#instalike","#beauty","#family","#smile","#life","#photo","#music",
            "#likeforlike","#follow4follow","#ootd","#amazing","#makeup","#nofilter","#igers",
            "#model","#dog","#beach","#sunset","#foodporn","#instamood","#followforfollow","#motivation"
        ]
        return " ".join(random.sample(available_hashtags, 10)) + " " + " ".join(random.sample(top_hashtags, 10))
    
    def generate_credits(self, meme_data):
        return f"Credit to : {meme_data['author']} (Reddit)"
    
    def post_meme_of_the_day(self):
        post_base_url = os.environ["FB_GRAPH_API_BASE_URL"]
        meme_data = self.fetch_meme_of_the_day()

        if meme_data:
            caption = self.generate_caption(meme_data)
            post_url = f'{post_base_url}/{self.INSTA_ACCOUNT_ID}/media'
            payload = {
                "image_url": meme_data['url'],
                "caption": caption,
                "access_token": self.INSTA_ACCESS_TOKEN
            }

            res = requests.post(post_url, payload)

            if res.status_code in [200,201]:
                result = json.loads(res.text)

                if 'id' in result:
                    creation_id = result['id']
                    second_url = f'{post_base_url}/{self.INSTA_ACCOUNT_ID}/media_publish'
                    second_payload = {
                        'creation_id': creation_id,
                        'access_token': self.INSTA_ACCESS_TOKEN
                    }
                    res2 = requests.post(second_url, data=second_payload)

                    if res2.status_code in [200,201]:
                        print("LOG: Posted to Instagram")
                    else:
                        try:
                            result = json.loads(res2.text)
                            print(result)
                        except Exception as e:
                            print(result)
                            print("LOG: FATAL - ", e, "\n")
            else:
                try:
                    result = json.loads(res.text)
                    print(result)
                except Exception as e:
                    print("LOG: FATAL - ", e, "\n")
        else:
            print("Meme not found")

def main(no_of_memes: int):
    load_dotenv()

    insta_access_token = os.environ["INSTA_TOKEN"]
    insta_account_id = os.environ["INSTA_ACC_ID"]

    for _ in range(no_of_memes):
        AutoInstagramPoster(insta_access_token, insta_account_id).post_meme_of_the_day()
        time.sleep(10)

if __name__ == "__main__":
    arguments = sys.argv
    if len(arguments) > 1:
        try:
            no_of_memes = int(arguments[1])
        except ValueError:
            no_of_memes = 1
    
    main(no_of_memes)