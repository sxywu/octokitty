class UsersController < ApplicationController
  include ApplicationHelper

  def start

    username = params[:username]
    response = Response.find_by_username(username)

    if not response
      response = Response.create(username: username)
    end

    response.fetch

    render :json => {}
  end

  def get_status
    username = params[:username]
    response = Response.find_by_username(username)

    if not response
      response = Response.create(username: username)
    end

    response.finished_fetches
    if response.finished === 'finished'
      response.clean_repos # destroy the repos with no contributors first
      render :json => {
        users: response.users,
        repos: response.repos.map{|repo| repo.parse_for_render},
        commits: response.contributions.map{|contribution| contribution.parse_for_render}
      }
    else
      render :json => {}
    end
  end

end