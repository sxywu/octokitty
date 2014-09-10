class UsersController < ApplicationController
  include ApplicationHelper

  def show
    username = params[:username]
    response = Response.find_by_username(username)
    if not response
      response = Response.create(username: username)
      response.perform
    end

    render :json => response

  end

end