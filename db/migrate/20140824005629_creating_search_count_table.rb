class CreatingSearchCountTable < ActiveRecord::Migration
  def up
    create_table :search_counts do |t|
      t.string :username, null: false
      t.integer :count
      t.timestamps
    end
  end

  def down
  end
end
