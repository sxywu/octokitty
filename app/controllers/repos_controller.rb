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

    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    user = client.user "#{username}"
    repos = user.rels[:repos].get.data
    if repos.class == Array
      parsed_repos = repos.map do |repo|
        repo = {owner: repo.owner.login,
          name: repo.name,
          watches: repo.watchers_count,
          stars: repo.stargazers_count,
          forks: repo.forks_count}
      end
      render :json => parsed_repos.to_json
    else
      render :json => {}.to_json
    end
  end

end