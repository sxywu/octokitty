class AddUserResponse < ActiveRecord::Migration
  def up
    create_table :user_responses do |t|
      t.string :username
      t.belongs_to :response
      t.timestamps
    end

    add_index(:user_responses, [:username, :response_id], unique: true, name: 'by_user_response')
  end

  def down
  end
end
