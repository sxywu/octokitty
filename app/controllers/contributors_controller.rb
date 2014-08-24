class ContributorsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]

    searched_user = SearchCount.find_by_username(owner)
    if searched_user
      searched_user.count += 1
      searched_user.save
    else
      searched_user = SearchCount.create(username: owner, count: 1)
    end

    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    contribs = client.contribs("#{owner}"+"/"+"#{repo}")
    parsed_contribs = contribs.map do |contrib|
      contrib = {
        author: contrib.login,
        contributions: contrib.contributions
      }
    end
    render :json => parsed_contribs.to_json
  end

end