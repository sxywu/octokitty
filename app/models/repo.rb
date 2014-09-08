class Repo < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :owner
  has_many :commits
  has_many :contributions
  attr_accessible :owner, :name, :watches, :stars, :forks

  def fetch
  	perform
  end

  def perform	
  	# if this has been updated in the last 7 days, return
    return if (self.created_at != self.updated_at) and (Time.now < (self.updated_at + 7 * 24 * 60 * 60))

  	client = ApiClient.new
    contribs = client.get_contribs("#{self.owner}"+"/"+"#{self.name}", anon=nil, {:per_page => 100})

    # sort contributors by number of contributions to repo
    contribs = contribs.select {|contributor| contributor[:author] != self.owner and contributor[:contributions] >= 5}
    contribs = contribs.sort_by {|contributor| -contributor[:contributions]}.first(5)

    if not contribs.empty?
    	# if not empty, loop through each contributor and add them
    	contribs.each do |contrib|
    		user = add_contributor(contrib)
    		add_commit(self.owner, user.username, self.id)
    	end
    end

    # create commit for owner also
    add_commit(self.owner, self.owner, self.id)

  end

  def add_contributor(contrib)
  	user = User.find_by_username(contrib[:author])
	if not user
		user = User.create(username: contrib[:author])
	end

	# for each of users, add repo to contributions
	if not Contribution.exists?(:contributor => user.username, :repo_id => self.id)
		user.contributions << Contribution.create(repo_id: self.id, owns: false)
	end

	return user
  end

  def add_commit(owner, contributor, repo_id)
  	if not Commit.exists?(:contributor => contributor, :repo_id => repo_id)
		commit = Commit.create(
			owner: owner,
			contributor: contributor,
			repo_id: repo_id
		)
	end
  end

  def parse_for_render
  	return {
          owner: self.owner,
          name: self.name,
          stars: self.stars,
          watches: self.watches,
          forks: self.forks,
          contributors: self.contributions.map{|contribution| contribution.contributor}
        }
  end
end