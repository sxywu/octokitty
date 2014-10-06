class ContributionResponse < ActiveRecord::Base
  belongs_to :contribution
  belongs_to :response

  attr_accessible :contribution_id
end