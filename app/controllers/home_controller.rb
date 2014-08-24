class HomeController < ApplicationController
  def index
    if session[:access_token] == nil
      redirect_to login_path
    end
  end

  def login
    @callback_url = 'http://127.0.0.1:3000/oauth/callback'
    @client_id = CONFIG['github']['client_id']
  end

end