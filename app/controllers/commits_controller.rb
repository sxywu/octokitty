class CommitsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    author = params[:author]
    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    commits = client.commits("#{owner}"+"/"+"#{repo}", {:author => "#{author}"})
    render :json => commits.to_json
  end

end