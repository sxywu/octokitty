class AddRepo < ActiveRecord::Migration
  def up
    create_table :repos do |t|
      t.string :name, null: false
      t.string :owner, null: false
      t.integer :star_count
      t.integer :fork_count
      t.integer :watcher_count
      t.timestamps
    end
  end

  def down
  end
end
