class UsersController < ApplicationController
  include ApplicationHelper

  def show
    username = params[:username]
    user = User.find_by_username(username)

    if user
      # user already exists
      user.fetch

      # after fetching, fetch user's repos
      fetch_user_repos(user)

    else
      # user does not exist, create and then fetch
      user = User.create(username: username)
      user.fetch

      fetch_user_repos(user)
    end

    render :json => {}
  end

  private
  def fetch_user_repos(user)
    user.contributions.where(:owns => true).each do |contribution|
      repo = Repo.find(contribution.repo_id)
      repo.fetch

      # fetch all commits by contributors to repo
      repo.contributions.each do |contribution|
        commit = Commit.find_by_contributor_and_repo_id(contribution.contributor, contribution.repo_id)
        commit.fetch
      end

    end
  end
  helper_method :fetch_user_repos

end