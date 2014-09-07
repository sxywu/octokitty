class User < ActiveRecord::Base
  set_primary_key :username
  has_many :contributions, foreign_key: :owner, primary_key: :username
  has_many :repos, foreign_key: :owner, primary_key: :username
  has_many :commits, foreign_key: :owner, primary_key: :username
  attr_accessible :username
end