from flask import render_template, Flask, request
import asyncio
from spond import spond

asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
app = Flask(__name__)

spond_login_error_message = "Login failed. Response received: {'errorKey': 'wrongEmailOrPassword', 'message': 'Wrong email or password.'}"

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/login/spond", methods=['GET'])
def page_login_spond():
    return render_template("login_spond.html")


@app.route("/api/spond", methods=["POST"])
def spond_api():
    body = request.get_json()
    if not ("username" in body and "password" in body and "function" in body and body["function"] in ["check_login", "get_all_groups"]):
        return {"error": "bad-request"}, 400
    try:
        username = body["username"]
        password = body["password"]
        function = body["function"]
        data = {}
        if not (username and password):
            return {"error": "empty"}
        if function == "check_login":
            asyncio.run(check_login_spond(username, password))
        if function == "get_all_groups":
            data = asyncio.run(get_all_groups_spond(username, password))
    except Exception as e:
        if str(e) == "'loginToken'":
            return {"error": "invalid-login"}, 403
        else:
            print(str(e))
            return {"error": "internal-error"}, 500
    else:
        return {"error": "false", "data": data}, 200


async def check_login_spond(username, password):
    if not (username and password):
        raise Exception("empty")

    s = spond.Spond(username=username, password=password)
    await s.get_events(max_events=1)
    await s.clientsession.close()


async def get_all_groups_spond(username, password):
    if not (username and password):
        raise Exception("empty")

    s = spond.Spond(username=username, password=password)
    data = await s.get_groups()
    await s.clientsession.close()
    return data


if __name__ == "__main__":
    app.run(port=8000, debug=True)
