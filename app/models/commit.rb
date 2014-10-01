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
    if self.data
      commits = client.get_commits("#{self.owner}"+"/"+"#{repo.name}", {
        :author => "#{self.contributor}", 
        :since => self.updated_at,
        :per_page => 100
      })

      if commits.count > 0
        # concatenate old array of commits with new
        commits = JSON.parse(self.data) + commits
        self.data = commits.to_json
      end
    else
      commits = client.get_commits("#{self.owner}"+"/"+"#{repo.name}", {
        :author => "#{self.contributor}", 
        :per_page => 100
      })

      self.data = commits.to_json
      self.save
    end
  end

  def success

  end

  def parse_for_render
    repo = Repo.find(self.repo_id)
    return JSON.parse(self.data).map do |c|
      c[:repo] = repo.name
      c[:owner] = repo.owner

      c
    end
  end

end