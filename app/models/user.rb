class User < ActiveRecord::Base
  set_primary_key :username
  has_many :contributions, foreign_key: :contributor, primary_key: :username
  has_many :repos, foreign_key: :owner, primary_key: :username
  has_many :commits, foreign_key: :contributor, primary_key: :username
  attr_accessible :username

  def fetch
  	perform
  end

  def perform
  	increment_user

    return if (self.created_at != self.updated_at) and (Time.now < (self.updated_at + 7 * 24 * 60 * 60))

  	get_repos

    self.save

  end

  def increment_user
    self.search_count += 1
  end

  def get_repos
  	client = ApiClient.new
    repos = client.get_repos("#{username}", {:per_page => 100})

    # sort the repos by "popularity" and take the first 5
    repos = repos.sort_by {|repo| -(repo[:stars] + repo[:watches] + repo[:forks])}.first(5)

    repos.each do |repo_obj|
    	if not Repo.exists?(:owner => repo_obj[:owner], :name => repo_obj[:name])
    		# for each repo, first create repo if it doesn't already exist
    		repo = Repo.create(repo_obj)

        if not Contribution.exists?(:contributor => self.username, :repo_id => repo.id)
  				self.contributions << Contribution.create(repo_id: repo.id, owns: true)
    		end
    		
    	end
    end
  end

  def get_user_info
  	client = ApiClient.new
  end

end