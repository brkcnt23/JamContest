"""
Locust load test for JamContest API
Run: locust -f loadtest/locustfile.py --host=http://localhost:8000
"""
from locust import HttpUser, task, between


class AnonymousUser(HttpUser):
    """Unauthenticated user browsing contests and feed"""
    wait_time = between(1, 3)

    @task(3)
    def browse_contests(self):
        self.client.get("/api/contests", name="GET /contests")

    @task(2)
    def view_social_feed(self):
        self.client.get("/api/social/feed", name="GET /social/feed")

    @task(1)
    def health_check(self):
        self.client.get("/api/health", name="GET /health")

    @task(1)
    def get_plans(self):
        self.client.get("/api/subscription/plans", name="GET /subscription/plans")


class AuthenticatedUser(HttpUser):
    """Logged-in user interacting with platform"""
    wait_time = between(2, 5)

    def on_start(self):
        resp = self.client.post("/api/auth/login", json={
            "email": "testuser@jamcontest.com",
            "password": "asd123",
        }, name="POST /auth/login")
        if resp.status_code == 200:
            self.token = resp.json().get("accessToken", "")
            self.client.headers["Authorization"] = f"Bearer {self.token}"

    @task(5)
    def get_my_profile(self):
        self.client.get("/api/auth/me", name="GET /auth/me")

    @task(3)
    def browse_contests(self):
        self.client.get("/api/contests", name="GET /contests")

    @task(2)
    def get_jobs(self):
        self.client.get("/api/jobs", name="GET /jobs")

    @task(2)
    def get_projects(self):
        self.client.get("/api/projects", name="GET /projects")

    @task(1)
    def get_application_status(self):
        self.client.get("/api/applications/my-status", name="GET /applications/my-status")

    @task(1)
    def get_payment_history(self):
        self.client.get("/api/payments/history", name="GET /payments/history")
