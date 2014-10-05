class Response < ActiveRecord::Base
  has_many :user_responses, :dependent => :destroy
  has_many :users, :through => :user_responses, :uniq => true

  has_many :repo_responses, :dependent => :destroy
  has_many :repos, :through => :repo_responses, :uniq => true

  has_many :contribution_responses, :dependent => :destroy
  has_many :contributions, :through => :contribution_responses, :uniq => true 

  attr_accessible :username

  def fetch
  	perform
  end

  def perform
  	username = self.username
  	user = User.find_by_username(username)
    
    if not user
      user = User.create(username: username)
    end

    begin 
      self.user_responses << UserResponse.create(username: username)
    rescue ActiveRecord::RecordNotUnique => e
      puts 'user responses not unique'
    end
    
    self.save

    user.fetch
  end

  def user_fetched(user)
  	# once a user's repo info has been fetched, fetch each repo
    user.contributions.where(:owns => true).each do |contribution|
      repo = Repo.find(contribution.repo_id)

      begin 
        self.repo_responses << RepoResponse.create(repo_id: repo.id)
      rescue ActiveRecord::RecordNotUnique => e
        p 'repo responses not unique'
      end

      self.save
      repo.fetch
    end
  end

  def repo_fetched(repo)
    # if repo.contributions.count > 1
    #   # json[:repos] << repo.parse_for_render

    #   # fetch all commits by contributors to repo
    #   repo.contributions.each do |contribution|
    #     commit = Commit.find_by_contributor_and_repo_id(contribution.contributor, contribution.repo_id)
    #     commit.fetch

    #     # json[:commits] << commit.parse_for_render
    #   end
    # else
    #   # if the repo doesn't have any contributors 
    #   # first delete references to the contribution in user and repo 
    #   # then delete contribution
    #   # then delete the repo
    #   repo.contributions.delete(repo.contributions.first)
    #   user.contributions.delete(contribution)
    #   contribution.destroy
    #   repo.destroy
    # end
  end

end