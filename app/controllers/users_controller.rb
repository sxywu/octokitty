class UsersController < ApplicationController
  def show
    username = params[:username]
    user = User.find_by_username(username)

    if user
      # user already exists
      user.fetch
    else
      # user does not exist, create and then fetch
      user = User.create(username: username)
      user.fetch
    end

    render :json => {}
  end

end