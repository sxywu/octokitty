class UsersController < ApplicationController
  include ApplicationHelper

  def show
    response = Response.find_by_username(params[:username])
    if not response
      response = Response.create(username: params[:username])
    end
    response.fetch
    render :json => {}

  end

end