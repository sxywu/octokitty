class Contribution < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :owner
  belongs_to :repo
  serialize :data, JSON
end