class HomeController < ApplicationController
  def index
    @callback_url = '/oauth/callback'
    @client_id = ENV['github_client_id'] || CONFIG['github']['client_id']

    ordered_users = User.find(:all, :order => "search_count desc")
    if ordered_users.length == 0
      @popular_users = [{username: "sxywu", count: 0}]
    elsif ordered_users.length < 10
      @popular_users = ordered_users.map { |user| { username: user.username, count: user.search_count } }
    else
      @popular_users = []
      ordered_users = ordered_users.map { |user| { username: user.username, count: user.search_count } }
      while @popular_users.length < 10
        @popular_users << ordered_users.shift
      end
    end
  end
end