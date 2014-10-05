class AddContributionResponse < ActiveRecord::Migration
  def up
    create_table :contribution_responses do |t|
      t.belongs_to :contribution
      t.belongs_to :response
      t.timestamps
    end

    add_index(:contribution_responses, [:contribution_id, :response_id], unique: true, name: 'by_contribution_response')
  end

  def down
  end
end
