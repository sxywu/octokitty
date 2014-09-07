class DropSearchCountTable < ActiveRecord::Migration
  def up
    drop_table :search_counts
  end

  def down
  end
end
