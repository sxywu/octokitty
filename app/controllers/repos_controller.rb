class ReposController < ApplicationController
  def show
    username = params[:username]
    client = Octokit::Client.new \
      :client_id     => "#{CONFIG['github']['client_id']}",
      :client_secret => "#{CONFIG['github']['client_secret']}"
    user = client.user "#{username}"
    repos = user.rels[:repos]
    render :json => repos.to_json
  end

end