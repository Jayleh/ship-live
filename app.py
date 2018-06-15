import requests
from flask import Flask, render_template, jsonify
from static.config.config import apiKey, apiSecret


app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/map")
def mappy():
    return render_template("map.html")


@app.route("/awaiting")
def awaiting():

    base_url = "https://ssapi.shipstation.com"

    query_url = "/orders?orderStatus=awaiting_shipment&page=1&pageSize=500"
    # query_url = "/orders?orderStatus=shipped&page=1&pageSize=20"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)


@app.route("/shipped/<date>")
def shipped(date):

    base_url = "https://ssapi.shipstation.com"

    query_url = f"/orders?orderStatus=shipped&orderDateStart={date}&page=1&pageSize=500"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)


@app.route("/on-hold")
def on_hold():

    base_url = "https://ssapi.shipstation.com"

    query_url = f"/orders?orderStatus=on_hold&page=1&pageSize=500"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
