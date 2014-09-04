class ContributorsController < ApplicationController
  def show
    owner = params[:owner]
    repo = params[:repo]
    client = ApiClient.new

    contribs = client.get_contribs("#{owner}"+"/"+"#{repo}", anon=nil, {:per_page => 100})

    render :json => contribs.to_json
  end

end