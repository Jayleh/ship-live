import os
import requests
from flask import Flask, render_template, jsonify
# from boto.s3.connection import S3Connection
# s3 = S3Connection(os.environ['apiKey'], os.environ['apiSecret'])


app = Flask(__name__)
app.config['API_KEY'] = os.environ['apiKey']
app.config['API_SECRET'] = os.environ['apiSecret']


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

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(app.config['API_KEY'], app.config['API_SECRET']))

    data = response.json()

    return jsonify(data)


@app.route("/shipped/<date>")
def shipped(date):

    base_url = "https://ssapi.shipstation.com"

    query_url = f"/orders?orderStatus=shipped&orderDateStart={date}&page=1&pageSize=500"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(app.config['API_KEY'], app.config['API_SECRET']))

    data = response.json()

    return jsonify(data)


if __name__ == "__main__":
    app.run(debug=True)
