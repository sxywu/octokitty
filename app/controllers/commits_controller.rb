class CommitsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    author = params[:author]
    searched_user = SearchCount.find_by_username(author)
    if searched_user
      searched_user.count += 1
      searched_user.save
    else
      searched_user = SearchCount.create(username: author, count: 1)
    end

    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    commits = client.commits("#{owner}"+"/"+"#{repo}", {:author => "#{author}"})
    parsed_commits = commits.map do |commit|
      commit = {
        author: commit.author.login,
        date: commit.commit.committer.date,
        url: commit.url
      }
    end
    render :json => parsed_commits.to_json
  end

end