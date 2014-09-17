class UsersController < ApplicationController

  def get_user
    username = params[:username]
    response = Response.find_by_username(username)

    if not response
      response = Response.create(username: username)
    end

    response.get_user

    render :json => {}
  end


  def poll
    username = params[:username]
    response = Response.find_by_username(username)

    render :json => {response: response.response, data: JSON.parse(response.data)}
  end

end