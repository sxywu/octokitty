class ContributorsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    client.auto_paginate = true
    contribs = client.contribs("#{owner}"+"/"+"#{repo}", anon=nil, {:per_page => 100})
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