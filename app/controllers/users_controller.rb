class UsersController < ApplicationController
  include ApplicationHelper

  def show
    username = params[:username]
    user = User.find_by_username(username)
    json = {}
    json[:users] = []
    json[:repos] = []
    json[:commits] = []

    if user
      # user already exists
      user.fetch
      json[:users] << user

      # after fetching, fetch user's repos
      fetch_user_repos(user, json)

    else
      # user does not exist, create and then fetch
      user = User.create(username: username)
      user.fetch

      fetch_user_repos(user, json)
    end

    render :json => json
  end

  private
  def fetch_user_repos(user, json)
    user.contributions.where(:owns => true).each do |contribution|
      repo = Repo.find(contribution.repo_id)
      repo.fetch
      json[:repos] << repo

      # fetch all commits by contributors to repo
      repo.contributions.each do |contribution|
        commit = Commit.find_by_contributor_and_repo_id(contribution.contributor, contribution.repo_id)
        commit.fetch

        json[:commits] << {
          owner: commit.owner,
          author: commit.contributor,
          repo: repo.name,
          commits: JSON.parse(commit.data)
        }
      end

    end
  end
  helper_method :fetch_user_repos

end