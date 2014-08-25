class HomeController < ApplicationController
  def index
    @callback_url = '/oauth/callback'
    @client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
    ordered_users = SearchCount.find(:all, :order => "count desc")
    if ordered_users.length == 0
      @popular_users = ['sxywu']
    elsif ordered_users.length < 5
      @popular_users = ordered_users.map { |user| { username: user.username, count: user.count } }
    else
      @popular_users = []
      ordered_users = ordered_users.map { |user| { username: user.username, count: user.count } }
      while @popular_users.length < 5
        @popular_users << ordered_users.shift
      end
    end
  end
end