class Repo < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :owner
  has_many :commits
  has_many :contributions
end