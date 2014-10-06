class UserResponse < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :username
  belongs_to :response

  attr_accessible :username
end