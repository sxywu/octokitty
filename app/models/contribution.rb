class Contribution < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :contributor
  belongs_to :repo

  has_many :contribution_responses
  has_many :responses, :through => :contribution_responses, :uniq => true

  attr_accessible :contributor, :repo_id, :owns, :fetched

   def fetch

   	self.fetched = 'fetching'
    self.save

  	perform
  end

  def perform
    client = ApiClient.new
    repo = Repo.find(self.repo_id)
    if self.commits
      commits = client.get_commits("#{repo.owner}"+"/"+"#{repo.name}", {
        :author => "#{self.contributor}", 
        :since => self.updated_at,
        :per_page => 100
      })

      if commits.count > 0
        # concatenate old array of commits with new
        commits = JSON.parse(self.commits) + commits
        self.commits = commits.to_json
      end
    else
      commits = client.get_commits("#{repo.owner}"+"/"+"#{repo.name}", {
        :author => "#{self.contributor}", 
        :per_page => 100
      })

      self.commits = commits.to_json
    end
    
    self.save
    success
  end

  def success
  	self.fetched = 'success'
    self.save

  	self.responses.each do |response|
      response.contributions_fetched(self)
    end
  end

  def parse_for_render
    return JSON.parse(self.commits).map do |c|
      c[:repo] = self.repo.name
      c[:owner] = self.repo.owner

      c
    end
  end
end