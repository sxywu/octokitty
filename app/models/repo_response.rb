class RepoResponse < ActiveRecord::Base
  belongs_to :repo
  belongs_to :response

  attr_accessible :repo_id
end