class AddCommit < ActiveRecord::Migration
  def up
    create_table :commits do |t|
      t.string :contributor
      t.string :owner
      t.belongs_to :repo
      t.text :data
      t.timestamps
    end
  end

  def down
  end
end
