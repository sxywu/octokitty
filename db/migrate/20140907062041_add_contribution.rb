class AddContribution < ActiveRecord::Migration
  def up
    create_table :contributions do |t|
      t.string :owner
      t.belongs_to :repo
      t.text :data
      t.timestamps
    end
  end

  def down
  end
end
