class CommitsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    author = params[:author]

    client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
    client_secret = ENV['github_client_secret'] || CONFIG['github']['client_secret']
    client = Octokit::Client.new \
      :client_id     => "#{client_id}",
      :client_secret => "#{client_secret}"
    client.auto_paginate = true
    commits = client.commits("#{owner}"+"/"+"#{repo}", {:author => "#{author}", :per_page => 100})
    if commits.class == Array
      parsed_commits = commits.map do |commit|
        commit = {
          author: commit.author.login,
          date: commit.commit.committer.date,
          url: commit.url
        }
      end
    else
      parsed_commits = {}
    end
      render :json => parsed_commits.to_json
  end

end