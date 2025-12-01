from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
import requests
from datetime import datetime

# ------------------------------
# CONSTANTS
# ------------------------------

BASE_API_URL = "https://fullstack-developer-capstone-3.onrender.com"
SENTIMENT_API_URL = "https://fullstack-developer-capstone-2.onrender.com/sentiment"


# ------------------------------
# HOME PAGE — FETCH DEALERS
# ------------------------------

def get_dealer_details(request, dealer_id):
    dealer = {}
    reviews_data = []

    try:
        # 1. Fetch Dealer Details
        dealer_url = f"{BASE_API_URL}/fetchDealer/{dealer_id}"
        dealer_response = requests.get(dealer_url)

        if dealer_response.status_code == 200:
            dealer_list = dealer_response.json()
            if dealer_list and isinstance(dealer_list, list):
                dealer = dealer_list[0]

        # 2. Fetch Dealer Reviews  (FIXED ROUTE)
        reviews_url = f"{BASE_API_URL}/reviews/{dealer_id}"
        reviews_response = requests.get(reviews_url)

        if reviews_response.status_code == 200:
            reviews_data = reviews_response.json()

    except Exception as e:
        print("ERROR fetching dealer or reviews:", e)

    context = {
        'dealer': dealer,
        'reviews': reviews_data,
        'dealer_id': dealer_id
    }
    
    return render(request, 'dealer_details.html', context)


# ------------------------------
# STATIC PAGES
# ------------------------------

def about(request):
    return render(request, "about.html")

def contact(request):
    return render(request, "contact.html")


# ------------------------------
# AUTH
# ------------------------------

def login_request(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user:
            login(request, user)
            return redirect("/")     # Redirect home
        else:
            return render(request, "login.html", {"error": "Invalid credentials"})

    return render(request, "login.html")


def logout_request(request):
    logout(request)
    return redirect("/")


def registration_request(request):
    return render(request, "signup.html")


# ------------------------------
# DEALER DETAILS + REVIEWS
# ------------------------------

def get_dealer_details(request, dealer_id):

    dealer = {}
    reviews = []

    try:
        # Fetch dealer info
        d_url = f"{BASE_API_URL}/fetchDealer/{dealer_id}"
        r = requests.get(d_url)
        if r.status_code == 200:
            data = r.json()
            if isinstance(data, list) and len(data) > 0:
                dealer = data[0]

        # Fetch reviews
        rv_url = f"{BASE_API_URL}/fetchReviews/dealer/{dealer_id}"
        rv = requests.get(rv_url)
        if rv.status_code == 200:
            reviews = rv.json()

    except Exception as e:
        print("Error reading dealer details:", e)

    return render(request, "dealer_details.html", {
        "dealer": dealer,
        "reviews": reviews,
        "dealer_id": dealer_id
    })


# ------------------------------
# ADD REVIEW
# ------------------------------

def add_review(request, dealer_id):

    if request.method == "POST":
        review_text = request.POST.get("review_content")

        # Get sentiment
        sentiment = "NEUTRAL"
        try:
            s = requests.get(SENTIMENT_API_URL, params={"text": review_text})
            if s.status_code == 200:
                sentiment = s.json().get("sentiment", "NEUTRAL")
        except:
            pass

        # Build review payload
        data = {
            "id": -1,
            "name": request.user.username,
            "dealership": dealer_id,
            "review": review_text,
            "purchase": "purchase_check" in request.POST,
            "purchase_date": request.POST.get("purchase_date"),
            "car_make": request.POST.get("car_make"),
            "car_model": request.POST.get("car_model"),
            "car_year": request.POST.get("car_year"),
            "sentiment": sentiment
        }

        # Submit to backend
        try:
            url = f"{BASE_API_URL}/insert_review"
            response = requests.post(url, json=data)

            if response.status_code in [200, 201]:
                return redirect("dealer_details", dealer_id=dealer_id)

        except Exception as e:
            print("Review POST failed:", e)

    # GET request → load dealer name on form
    dealer = {}
    try:
        d_url = f"{BASE_API_URL}/fetchDealer/{dealer_id}"
        r = requests.get(d_url)
        if r.status_code == 200:
            dealer_list = r.json()
            if dealer_list:
                dealer = dealer_list[0]
    except:
        pass

    return render(request, "add_review.html", {"dealer_id": dealer_id, "dealer": dealer})


# ------------------------------
# SENTIMENT TEST ENDPOINT
# ------------------------------

def sentiment_analysis(request):
    return JsonResponse({"message": "Sentiment API working"})
