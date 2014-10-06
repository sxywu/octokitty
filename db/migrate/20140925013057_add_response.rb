class AddResponse < ActiveRecord::Migration
  def up
    create_table :responses do |t|
      t.boolean :finished
      t.string :error
      t.string :username
      t.timestamps
    end
  end

  def down
  end
end
