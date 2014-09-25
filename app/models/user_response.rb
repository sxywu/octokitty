class UserResponse < ActiveRecord::Base
  belongs_to :user, primary_key: :username
  belongs_to :response
end