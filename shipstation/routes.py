import requests
from flask import render_template, jsonify, redirect, url_for, flash, request
from shipstation import app, db, bcrypt
from shipstation.forms import RegistrationForm, LoginForm
from shipstation.config import apiKey, apiSecret
from shipstation.models import User
from flask_login import login_user, current_user, logout_user, login_required


@app.route("/")
@login_required
def home():
    return render_template("index.html")


# Disabling route
@app.route("/register", methods=["GET", "POST"])
@login_required
def register():
    form = RegistrationForm()
    if form.validate_on_submit():
        hashed_password = bcrypt.generate_password_hash(form.password.data).decode("utf-8")
        user = User(username=form.username.data, email=form.email.data, password=hashed_password)
        db.session.add(user)
        db.session.commit()
        flash(f"Account created for {form.username.data}! Please log in.", "success")
        return redirect(url_for("login"))
    return render_template("registration.html", title="Register", form=form)


@app.route("/login", methods=["GET", "POST"])
def login():
    if current_user.is_authenticated:
        return redirect(url_for("home"))
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            next_page = request.args.get("next")
            return redirect(next_page) if next_page else redirect(url_for("home"))
        else:
            flash("Login unsuccessful. Please check email and password.", "danger")
    return render_template("login.html", title="Login", form=form)


@app.route("/logout")
def logout():
    logout_user()
    return redirect(url_for("home"))


@app.route("/map")
@login_required
def mappy():
    return render_template("map.html")


@app.route("/awaiting")
@login_required
def awaiting():

    base_url = "https://ssapi.shipstation.com"

    query_url = "/orders?orderStatus=awaiting_shipment&page=1&pageSize=500"
    # query_url = "/orders?orderStatus=shipped&page=1&pageSize=20"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)


@app.route("/shipped/<date>")
@login_required
def shipped(date):

    base_url = "https://ssapi.shipstation.com"

    query_url = f"/orders?orderStatus=shipped&orderDateStart={date}&page=1&pageSize=500"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)


@app.route("/on-hold")
@login_required
def on_hold():

    base_url = "https://ssapi.shipstation.com"

    query_url = f"/orders?orderStatus=on_hold&page=1&pageSize=500"

    full_url = base_url + query_url

    response = requests.get(full_url, auth=(apiKey, apiSecret))

    data = response.json()

    return jsonify(data)
