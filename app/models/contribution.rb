class Contribution < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :contributor
  belongs_to :repo

  has_many :contribution_responses
  has_many :responses, :through => :contribution_responses, :uniq => true

  attr_accessible :repo_id, :owns
end