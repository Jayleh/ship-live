from shipstation import db
from shipstation.models import User

user = User.query.all()
print(user)
