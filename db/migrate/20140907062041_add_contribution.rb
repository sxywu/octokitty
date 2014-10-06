class AddContribution < ActiveRecord::Migration
  def up
    create_table :contributions do |t|
      t.string :contributor
      t.belongs_to :repo
      t.boolean :owns
      t.text :commits
      t.string :fetched
      t.timestamps
    end

    add_index(:contributions, [:contributor, :repo_id], unique: true, name: 'by_contributor_repo')
  end

  def down
  end
end
