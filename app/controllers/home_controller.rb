class HomeController < ApplicationController
  def index
    @callback_url = '/oauth/callback'
    @client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
  end
end