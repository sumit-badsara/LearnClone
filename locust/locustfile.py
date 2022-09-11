from locust import HttpUser, task
import random

class HelloWorldUser(HttpUser):
    @task
    def base_url(self):
        # user_id = random.randint(1, 20000)
        self.client.get(f"/")
    
    # def get_merchantwise(self):
    #     user_id = random.randint(1, 20000)
    #     self.client.get(f"/user/{user_id}/merchantwise")
