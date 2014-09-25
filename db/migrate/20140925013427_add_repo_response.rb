class AddRepoResponse < ActiveRecord::Migration
  def up
    create_table :repo_responses do |t|
      t.belongs_to :repo
      t.belongs_to :response
      t.timestamps
    end
  end

  def down
  end
end
