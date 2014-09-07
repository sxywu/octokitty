class AddRepo < ActiveRecord::Migration
  def up
    create_table :repos do |t|
      t.string :name, null: false
      t.string :owner
      t.integer :stars
      t.integer :forks
      t.integer :watches
      t.timestamps
    end
  end

  def down
  end
end
