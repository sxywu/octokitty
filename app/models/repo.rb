class Repo < ActiveRecord::Base
  belongs_to :user, primary_key: :username, foreign_key: :owner
  has_many :commits
  has_many :contributions
  attr_accessible :owner, :name, :watches, :stars, :forks

  def fetch
  	perform
  end

  def perform
  	client = ApiClient.new
    contribs = client.get_contribs("#{self.owner}"+"/"+"#{self.name}", anon=nil, {:per_page => 100})

    # sort contributors by number of contributions to repo
    contribs = contribs.select {|contributor| contributor[:author] != self.owner and contributor[:contributions] >= 5}
    contribs = contribs.sort_by {|contributor| contributor[:contributions]}.first(5)

    if not contribs.empty?
    	# if not empty, loop through contribs array and find corresponding user
    	contribs.each do |contrib|
			user = User.find_by_username(contrib[:author])
			if not user
				user = User.create(username: contrib[:author])
			end

			# for each of users, add repo to contributions
			if not Contribution.find_by_contributor_and_repo_id(user.username, self.id)
				user.contributions << Contribution.create(repo_id: self.id, owns: false)
			end

			if not Commit.find_by_contributor_and_repo_id(user.username, self.id)
				commit = Commit.create(
					owner: self.owner,
					contributor: user.username,
					repo_id: self.id
				)
			end
    	end
    end

    # create commit for owner also
    if not Commit.find_by_contributor_and_repo_id(self.owner, self.id)
	    commit = Commit.create(
	    	owner: self.owner,
			contributor: self.owner,
			repo_id: self.id
		)
	end

  end


end