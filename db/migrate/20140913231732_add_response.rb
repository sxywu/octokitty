class AddResponse < ActiveRecord::Migration
  def up
  	create_table :responses, {:id => false} do |t|
      t.string :username, null: false
      t.boolean :response
      t.text :data
      t.timestamps
    end
    execute "ALTER TABLE responses ADD PRIMARY KEY (username);"
  end

  def down
  end
end
