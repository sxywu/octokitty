class PollController < ApplicationController
  include ApplicationHelper

  def user
    response = Response.find_by_username(params[:username])
    if response
      db_response = {response: response.response, data: response.data}
    else
      db_response = {response: false}
    end
    render :json => db_response
  end

end