class ReposController < ApplicationController
  def show
    username = params[:username]
    response = HTTParty.get("https://api.github.com/users/#{username}/repos", {:params => {:access_token => "#{session[:access_token]}"}, :accept => :json, :headers => {"User-Agent" => "Octokitty"}
      })
    render :json => response.to_json
  end

end