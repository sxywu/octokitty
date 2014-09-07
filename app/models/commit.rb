class Commit < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :contributor
  belongs_to :repo
  attr_accessible :contributor, :repo_id
end