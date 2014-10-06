class Repo < ActiveRecord::Base
  has_many :contributions, :dependent => :destroy
  has_many :users, :through => :contributions, :uniq => true

  has_many :repo_responses
  has_many :responses, :through => :repo_responses, :uniq => true

  attr_accessible :owner, :name, :watches, :stars, :forks


  def fetch
    # if this has been updated in the last 7 days, return
    # return if (self.created_at != self.updated_at) and (Time.now < (self.updated_at + 7 * 24 * 60 * 60))

    self.fetched = 'fetching'
    self.save

  	perform
  end

  def perform

  	client = ApiClient.new
    contribs = client.get_contribs("#{self.owner}"+"/"+"#{self.name}", anon=nil, {:per_page => 100})

    # sort contributors by number of contributions to repo
    contribs = contribs.select {|contributor| contributor[:author] != self.owner and contributor[:contributions] >= 5}
    contribs = contribs.sort_by {|contributor| -contributor[:contributions]}.first(5)

    if not contribs.empty?
    	# if not empty, loop through each contributor and add them
    	contribs.each do |contrib|
    		add_contributor(contrib)
    	end
    end

    success
  end

  def add_contributor(contrib)
  	user = User.find_by_username(contrib[:author])
  	if not user
  		user = User.create(username: contrib[:author])
  	end

  	# for each of users, add repo to contributions
    begin 
      user.contributions << Contribution.create(repo_id: self.id, owns: false)
    rescue
      p 'repo.rb: contribution not unique'
    end

  	return user
  end

  def success
    self.fetched = 'success'
    self.save

    self.responses.each do |response|
      response.repo_fetched(self)
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