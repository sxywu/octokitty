class UsersController < ApplicationController
  include ApplicationHelper

  def show

    username = params[:username]
    response = Response.find_by_username(username)

    if not response
      response = Response.create(username: username)
    end

    response.fetch
    # json = {}
    # json[:users] = []
    # json[:repos] = []
    # json[:commits] = []

    # username = params[:username]
    # user = fetch_user(username, json)

    # user.contributions.where(:owns => true).each do |contribution|
    #   # find all repos user owns
    #   Repo.find(contribution.repo_id).contributions.where(:owns => false).each do |contribution|
    #     # find all contributors to the repo
    #     fetch_user(contribution.contributor, json)
    #   end
    # end

    render :json => {}
  end

end