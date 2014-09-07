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
    p contribs
  end


end