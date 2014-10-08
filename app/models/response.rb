class Response < ActiveRecord::Base
  has_many :user_responses, :dependent => :destroy
  has_many :users, :through => :user_responses, :uniq => true

  has_many :repo_responses, :dependent => :destroy
  has_many :repos, :through => :repo_responses, :uniq => true

  has_many :contribution_responses, :dependent => :destroy
  has_many :contributions, :through => :contribution_responses, :uniq => true 

  attr_accessible :username

  def fetch
    return if (self.finished === 'finished') and (Time.now < (self.updated_at + 7 * 24 * 60 * 60))

    self.finished = 'first'
    self.save

  	perform
  end

  def perform
  	username = self.username
    fetch_user(username)
  end

  def fetch_user(username)
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

    # finished_fetches
  end

  def repo_fetched(repo)
    if repo.contributions.count > 1

      # fetch all commits by contributors to repo
      repo.contributions.each do |contribution|
        begin 
          self.contribution_responses << ContributionResponse.create(contribution_id: contribution.id)
        rescue ActiveRecord::RecordNotUnique => e
          p 'contribution responses not unique'
        end

        self.save
        contribution.fetch

      end
    end

    # finished_fetches
  end

  def contributions_fetched(contribution)
    # finished_fetches
  end

  def finished_fetches
    return if self.users.empty? or self.repos.empty? or self.contributions.empty?

    users_fetched = self.users.all? {|user| user.fetched === 'success'}
    repos_fetched = self.repos.all? {|repo| repo.fetched === 'success'}
    contributions_fetched = self.contributions.all? {|contribution| contribution.fetched === 'success'}

    if users_fetched and repos_fetched and contributions_fetched
      if self.finished === 'first'
        self.finished = 'second'
        self.save
        # if this was first user
        self.repos.where(:owner => self.username).each do |repo|
          # so fetch all of his/her contributors
          repo.contributions.where(:owns => false).each do |contribution|
            p contribution.contributor
            fetch_user(contribution.contributor)
          end
        end
      else
        self.finished = 'finished'
        self.save
      end
    end
  end

  def clean_repos
    self.repos.each do |repo|
      if repo.contributions.count === 1
        repo.destroy
      end
    end
  end

end