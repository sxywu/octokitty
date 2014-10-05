class AddRepoResponse < ActiveRecord::Migration
  def up
    create_table :repo_responses do |t|
      t.belongs_to :repo
      t.belongs_to :response
      t.timestamps
    end

    add_index(:repo_responses, [:repo_id, :response_id], unique: true, name: 'by_repo_response')
  end

  def down
  end
end
