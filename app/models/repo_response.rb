class RepoResponse < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :username
  belongs_to :response
end