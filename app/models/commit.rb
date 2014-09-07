class Commit < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :contributor
  belongs_to :repo
  attr_accessible :contributor, :repo_id, :owner

  def fetch
  	perform
  end

  def perform
  	client = ApiClient.new
  	repo = Repo.find(self.repo_id)
    commits = client.get_commits("#{self.owner}"+"/"+"#{repo.name}", {:author => "#{self.contributor}", :per_page => 100})

    self.data = commits.to_json
    self.save

  end

end