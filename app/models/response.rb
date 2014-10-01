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

    self.users_responses << UserResponse.create(username: username)
    self.save

    user.fetch
  end

  def user_fetched(user)
  	p user
  end

end