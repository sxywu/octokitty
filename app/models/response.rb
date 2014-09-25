class Response < ActiveRecord::Base
  has_many :user_responses, :dependent => :destroy
  has_many :users, :through => :user_responses, :uniq => true

  has_many :repo_responses, :dependent => :destroy
  has_many :repos, :through => :repo_responses, :uniq => true

  has_many :contribution_responses, :dependent => :destroy
  has_many :contributions, :through => :contribution_responses, :uniq => true
end