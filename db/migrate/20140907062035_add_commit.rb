class AddCommit < ActiveRecord::Migration
  def up
    create_table :commits do |t|
      t.string :contributor
      t.belongs_to :repo
      t.timestamps
    end
  end

  def down
  end
end
