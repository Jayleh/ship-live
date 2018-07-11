from shipstation.models import db
from shipstation import User

user = User.query.all()
print(user)