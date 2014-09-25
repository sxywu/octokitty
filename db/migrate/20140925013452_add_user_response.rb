class AddUserResponse < ActiveRecord::Migration
  def up
    create_table :user_responses do |t|
      t.string :username
      t.belongs_to :response
      t.timestamps
    end
  end

  def down
  end
end
