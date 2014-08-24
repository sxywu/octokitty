class ContributorsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    contribs = client.contribs("#{owner}"+"/"+"#{repo}")
    render :json => contribs.to_json
  end

end