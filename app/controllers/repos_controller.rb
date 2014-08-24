class ReposController < ApplicationController
  def show
    username = params[:username]
    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    user = client.user "#{username}"
    repos = user.rels[:repos].get.data
    parsed_repos = repos.map do |repo|
      repo = {owner: repo.owner.login,
        name: repo.name,
        watches: repo.watchers_count,
        stars: repo.stargazers_count,
        forks: repo.forks_count}
    end
    render :json => parsed_repos.to_json
  end

end