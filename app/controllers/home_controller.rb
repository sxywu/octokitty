class HomeController < ApplicationController
  def index
    @callback_url = 'http://127.0.0.1:3000/oauth/callback'
    @client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
  end
end