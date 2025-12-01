from django.shortcuts import render, redirect 
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, HttpResponseRedirect
import requests
from django.contrib.auth.models import User
from django.db import IntegrityError 
from datetime import datetime

# --- Configuration ---
BASE_API_URL = "https://fullstack-developer-capstone-3.onrender.com"
SENTIMENT_API_URL = "https://fullstack-developer-capstone-2.onrender.com/sentiment"

# --- Static/Homepage Views (NO CHANGES NEEDED HERE) ---
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
import requests
from django.contrib.auth.models import User
from datetime import datetime

# -------------------------
# CONFIGURATION
# -------------------------
BASE_API_URL = "https://fullstack-developer-capstone-3.onrender.com"
SENTIMENT_API_URL = "https://fullstack-developer-capstone-2.onrender.com/sentiment"


# -------------------------
# HOME PAGE – SHOW DEALERS
# -------------------------
def get_dealers(request):
    state_filter = request.GET.get('state')

    api_url = f"{BASE_API_URL}/fetchDealers"
    dealerships = []

    try:
        response = requests.get(api_url, timeout=10)
        if response.status_code == 200:
            dealerships = response.json()
    except Exception as e:
        print("ERROR calling dealers API:", e)

    # Optional filtering
    if state_filter and state_filter.lower() != "all states":
        dealerships = [
            d for d in dealerships
            if "state" in d and d["state"].lower() == state_filter.lower()
        ]

    return render(request, "home.html", {"dealerships": dealerships})


def about(request):
    return render(request, "about.html")


def contact(request):
    return render(request, "contact.html")


# -------------------------
# AUTHENTICATION
# -------------------------
def login_request(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return redirect("/")  # Home page
        else:
            return render(request, "login.html", {"error": "Invalid username or password"})

    return render(request, "login.html")


def logout_request(request):
    logout(request)
    return redirect("/?logout_success=true")


def registration_request(request):
    if request.method == "POST":
        pass
    return render(request, "signup.html")


# -------------------------
# DEALER DETAILS + REVIEWS
# -------------------------
def get_dealer_details(request, dealer_id):
    dealer = {}
    reviews = []

    try:
        # 1. Fetch dealer details
        dealer_url = f"{BASE_API_URL}/fetchDealer/{dealer_id}"
        dealer_resp = requests.get(dealer_url)
        if dealer_resp.status_code == 200:
            dealer_list = dealer_resp.json()
            if dealer_list:
                dealer = dealer_list[0]

        # 2. Fetch dealer reviews
        reviews_url = f"{BASE_API_URL}/reviews/{dealer_id}"
        reviews_resp = requests.get(reviews_url)
        if reviews_resp.status_code == 200:
            reviews = reviews_resp.json()

    except Exception as e:
        print("ERROR fetching dealer or reviews:", e)

    context = {
        "dealer": dealer,
        "reviews": reviews,
        "dealer_id": dealer_id,
    }

    return render(request, "dealer_details.html", context)


# -------------------------
# ADD REVIEW
# -------------------------
def add_review(request, dealer_id):
    if request.method == "POST":
        review_text = request.POST.get("review_content")
        car_make = request.POST.get("car_make")
        car_model = request.POST.get("car_model")
        car_year = request.POST.get("car_year")
        purchase_date = request.POST.get("purchase_date")

        # ---- SENTIMENT ----
        sentiment = "NEUTRAL"
        try:
            sentiment_resp = requests.get(SENTIMENT_API_URL, params={"text": review_text})
            if sentiment_resp.status_code == 200:
                sentiment = sentiment_resp.json().get("sentiment", "NEUTRAL")
        except:
            pass

        # Payload for Express backend
        data = {
            "id": -1,
            "name": request.user.username,
            "dealership": dealer_id,
            "review": review_text,
            "purchase": "purchase_check" in request.POST,
            "purchase_date": purchase_date,
            "car_make": car_make,
            "car_model": car_model,
            "car_year": car_year,
            "sentiment": sentiment,
        }

        # POST to Express
        try:
            post_url = f"{BASE_API_URL}/insert_review"
            response = requests.post(post_url, json=data)

            if response.status_code == 200 or response.status_code == 201:
                return redirect("dealer_details", dealer_id=dealer_id)

        except Exception as e:
            print("ERROR posting review:", e)

    # GET request → show form
    dealer = {}
    try:
        dealer_resp = requests.get(f"{BASE_API_URL}/fetchDealer/{dealer_id}")
        if dealer_resp.status_code == 200:
            dealer_list = dealer_resp.json()
            if dealer_list:
                dealer = dealer_list[0]
    except:
        pass

    return render(request, "add_review.html", {"dealer": dealer, "dealer_id": dealer_id})


# -------------------------
# SENTIMENT (PLACEHOLDER)
# -------------------------
def sentiment_analysis(request):
    return JsonResponse({"message": "Sentiment service running"})


def analyze_review_sentiments(text):
    try:
        response = requests.get(SENTIMENT_API_URL, params={"text": text})
        if response.status_code == 200:
            return response.json().get("sentiment")
        return "UNKNOWN"
    except:
        return "ERROR"


    
    # 2. Filter data in Python based on the state_filter (Case-Insensitive)
    if state_filter and state_filter.lower() != 'all states':
        target_state_lower = state_filter.lower() 
        dealerships = [
            d for d in all_dealers if 'state' in d and d['state'].lower() == target_state_lower
        ]
    else:
        dealerships = all_dealers

    context = {'dealerships': dealerships}
    return render(request, 'home.html', context)

def about(request):
    return render(request, 'about.html') 

def contact(request):
    return render(request, 'contact.html') 

# --- Authentication Views (NO CHANGES NEEDED HERE) ---

def login_request(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            return redirect('/')   # FIXED
        else:
            return render(request, 'login.html', {'error': 'Invalid credentials'})
    
    return render(request, 'login.html')

def logout_request(request):
    logout(request)
    return redirect('/?logout_success=true') 

def registration_request(request):
    if request.method == 'POST':
        pass 
    return render(request, 'signup.html') 

# --- Dealer Functionality Views ---

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
        
        # 2. Fetch Dealer Reviews
        reviews_url = f"{BASE_API_URL}/fetchReviews/dealer/{dealer_id}"
        reviews_url_nocache = f"{reviews_url}?_={datetime.now().timestamp()}"
        reviews_response = requests.get(reviews_url)
        
        if reviews_response.status_code == 200:
            reviews_data = reviews_response.json()

    except requests.exceptions.ConnectionError:
        print("CONNECTION ERROR: Express server (3030) is not accessible.")

    context = {
        'dealer': dealer,
        'reviews': reviews_data,
        'dealer_id': dealer_id
    }
    
    return render(request, 'dealer_details.html', context)


# View for adding a review (Task 21, 22) - FINAL FUNCTIONAL LOGIC
def add_review(request, dealer_id):
    if request.method == 'POST':
        # 1. Collect form data
        review_content = request.POST.get('review_content')
        car_make = request.POST.get('car_make')
        car_model = request.POST.get('car_model')
        car_year = request.POST.get('car_year')
        purchase_date = request.POST.get('purchase_date')
        
        # --- CRITICAL FIX: Get Sentiment Analysis ---
        sentiment_result = 'NEUTRAL'
        try:
            sentiment_url = f"{SENTIMENT_API_URL}?text={review_content}"
            sentiment_response = requests.get(sentiment_url)
            
            if sentiment_response.status_code == 200:
                sentiment_result = sentiment_response.json().get('sentiment', 'NEUTRAL')
        except Exception as e:
            print(f"Sentiment service error: {e}")
        # ---------------------------------------------
        
        # 2. Construct the JSON payload 
        data = {
            'id': -1, 
            'name': request.user.username,
            'dealership': dealer_id,
            'review': review_content,
            'purchase': 'purchase_check' in request.POST,
            'purchase_date': purchase_date,
            'car_make': car_make,
            'car_model': car_model,
            'car_year': car_year,
            'sentiment': sentiment_result # <-- NOW INCLUDED IN PAYLOAD
        }
        
        # 3. Send POST request to Express backend
        try:
            post_url = f"{BASE_API_URL}/insert_review"
            response = requests.post(post_url, json=data) 
            
            if response.status_code == 200 or response.status_code == 201:
                # Redirect back to the dealer details page to see the new review (Task 22)
                return redirect('dealer_details', dealer_id=dealer_id)
            else:
                print(f"Error submitting review: {response.text}")
        except Exception as e:
            print(f"Connection error on POST: {e}")
            
    # 4. Handle GET request (Render the form - Task 21)
    # Fetch dealer details to display the name on the form page
    try:
        dealer_url = f"{BASE_API_URL}/fetchDealer/{dealer_id}"
        dealer_response = requests.get(dealer_url)
        if dealer_response.status_code == 200:
            dealer_list = dealer_response.json()
            dealer = dealer_list[0] if dealer_list and isinstance(dealer_list, list) else {}
        else:
            dealer = {}
    except requests.exceptions.ConnectionError:
        dealer = {}
        
    context = {'dealer_id': dealer_id, 'dealer': dealer}
    return render(request, 'add_review.html', context)


# Placeholder for Sentiment Analysis Proxy (Task 16)
def sentiment_analysis(request):
    return JsonResponse({'message': 'Sentiment analysis proxy service running.'})

def analyze_review_sentiments(text):
    url = "https://fullstack-developer-capstone-2.onrender.com/sentiment"
    try:
        response = requests.get(url, params={"text": text})
        if response.status_code == 200:
            return response.json().get("sentiment")
        else:
            return "UNKNOWN"
    except Exception as e:
        print("Error calling sentiment API:", e)
        return "ERROR"
