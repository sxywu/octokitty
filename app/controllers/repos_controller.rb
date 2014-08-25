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

    client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
    client_secret = ENV['github_client_secret'] || CONFIG['github']['client_secret']

    Octokit.auto_paginate = true
    client = Octokit::Client.new \
      :client_id     => "#{client_id}",
      :client_secret => "#{client_secret}"
    client.auto_paginate = true
    repos = client.repositories("#{username}", {:per_page => 100})
    if repos.class == Array
      parsed_repos = repos.map do |repo|
        repo = {owner: repo.owner.login,
          name: repo.name,
          watches: repo.watchers_count,
          stars: repo.stargazers_count,
          forks: repo.forks_count}
      end
    else
      parsed_repos = {}
    end
    render :json => parsed_repos.to_json
  end

end