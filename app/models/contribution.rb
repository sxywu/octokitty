class Contribution < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :contributor
  belongs_to :repo
  serialize :data, JSON
  attr_accessible :repo_id
end