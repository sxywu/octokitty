class AddContribution < ActiveRecord::Migration
  def up
    create_table :contributions do |t|
      t.string :contributor
      t.belongs_to :repo
      t.boolean :owns
      t.timestamps
    end
  end

  def down
  end
end
