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
				User.create(username: contrib[:author])
			end

			# no need to check if commit exists, since all deleted at end
			commit = Commit.create(
				contributor: contrib[:author],
				repo_id: self.id
			)
    	end
    end

  end


end