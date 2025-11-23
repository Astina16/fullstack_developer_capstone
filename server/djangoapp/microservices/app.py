from flask import Flask, request, jsonify # Import request and jsonify
from nltk.sentiment.vader import SentimentIntensityAnalyzer # Use specific VADER import
import json

app = Flask("Sentiment Analyzer")
sia = SentimentIntensityAnalyzer()


@app.get('/')
def home():
    return "Welcome to the Sentiment Analyzer. Use /sentiment?text=... to analyze."


# CORRECTED ROUTE: Uses /sentiment and retrieves text from the query string (?text=...)
@app.get('/sentiment') 
def analyze_sentiment():
    # Retrieve text from the query parameter 'text'
    input_txt = request.args.get('text') 

    if not input_txt:
        return jsonify({"error": "No text provided"}), 400

    scores = sia.polarity_scores(input_txt)
    print(scores)

    # Use compound score for simplicity in determining final sentiment
    compound_score = scores['compound']
    
    if compound_score >= 0.05:
        res = "POSITIVE"
    elif compound_score <= -0.05:
        res = "NEGATIVE"
    else:
        res = "NEUTRAL"
        
    # Return JSON response using jsonify
    return jsonify({"sentiment": res, "scores": scores})

if __name__ == "__main__":
    # Set host='0.0.0.0' to ensure accessibility from localhost
    app.run(host='0.0.0.0', port=5000)