class ContributionResponse < ActiveRecord::Base
  belongs_to :user, primary_key: :username
  belongs_to :response

  attr_accessible :contribution_id
end