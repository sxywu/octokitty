class AddContributionResponse < ActiveRecord::Migration
  def up
    create_table :contribution_responses do |t|
      t.belongs_to :contribution
      t.belongs_to :response
      t.timestamps
    end
  end

  def down
  end
end
