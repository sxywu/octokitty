class CommitsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    author = params[:author]

    client = ApiClient.new
    commits = client.get_commits("#{owner}"+"/"+"#{repo}", {:author => "#{author}", :per_page => 100})

    render :json => commits.to_json
  end

end