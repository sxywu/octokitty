class ContributorsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    client_id = ENV['github_client_id'] || CONFIG['github']['client_id']
    client_secret = ENV['github_client_secret'] || CONFIG['github']['client_secret']
    client = Octokit::Client.new \
      :client_id     => "#{client_id}",
      :client_secret => "#{client_secret}"
    client.auto_paginate = true
    contribs = client.contribs("#{owner}"+"/"+"#{repo}")
    if contribs.class == Array
      parsed_contribs = contribs.map do |contrib|
        contrib = {
          author: contrib.login,
          contributions: contrib.contributions
        }
      end
    else
      parsed_contribs = {}
    end
      render :json => parsed_contribs.to_json
  end

end