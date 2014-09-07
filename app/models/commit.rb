class Commit < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :owner
  belongs_to :repo
end