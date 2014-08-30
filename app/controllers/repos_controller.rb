class ReposController < ApplicationController
  def show
    username = params[:username]

    searched_user = SearchCount.find_by_username(username)
    if searched_user
      searched_user.count += 1
      searched_user.save
    else
      searched_user = SearchCount.create(username: username, count: 1)
    end

    client = ApiClient.new
    repos = client.get_repos("#{username}", {:per_page => 100})

    render :json => repos.to_json
  end

end