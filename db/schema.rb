# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20140925021136) do

  create_table "contribution_responses", :force => true do |t|
    t.integer  "contribution_id"
    t.integer  "response_id"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "contribution_responses", ["contribution_id", "response_id"], :name => "by_contribution_response", :unique => true

  create_table "contributions", :force => true do |t|
    t.string   "contributor"
    t.integer  "repo_id"
    t.boolean  "owns"
    t.text     "commits"
    t.string   "fetched"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "contributions", ["contributor", "repo_id"], :name => "by_contributor_repo", :unique => true

  create_table "delayed_jobs", :force => true do |t|
    t.integer  "priority",   :default => 0, :null => false
    t.integer  "attempts",   :default => 0, :null => false
    t.text     "handler",                   :null => false
    t.text     "last_error"
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string   "locked_by"
    t.string   "queue"
    t.datetime "created_at",                :null => false
    t.datetime "updated_at",                :null => false
  end

  add_index "delayed_jobs", ["priority", "run_at"], :name => "delayed_jobs_priority"

  create_table "repo_responses", :force => true do |t|
    t.integer  "repo_id"
    t.integer  "response_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "repo_responses", ["repo_id", "response_id"], :name => "by_repo_response", :unique => true

  create_table "repos", :force => true do |t|
    t.string   "name",       :null => false
    t.string   "owner"
    t.integer  "stars"
    t.integer  "forks"
    t.integer  "watches"
    t.string   "fetched"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "responses", :force => true do |t|
    t.string   "finished"
    t.string   "error"
    t.string   "username"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "user_responses", :force => true do |t|
    t.string   "username"
    t.integer  "response_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "user_responses", ["username", "response_id"], :name => "by_user_response", :unique => true

  create_table "users", :id => false, :force => true do |t|
    t.string   "username",                    :null => false
    t.integer  "followers"
    t.integer  "search_count", :default => 0
    t.string   "fetched"
    t.datetime "created_at",                  :null => false
    t.datetime "updated_at",                  :null => false
  end

end
