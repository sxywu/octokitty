class AddUser < ActiveRecord::Migration
  def up
    create_table :users, {:id => false} do |t|
      t.string :username, null: false
      t.integer :followers
      t.integer :search_count, default: 0
      t.string :fetched
      t.timestamps
    end
    execute "ALTER TABLE users ADD PRIMARY KEY (username);"

  end

  def down
  end
end
