class OauthController < ApplicationController
  def callback
    session_code = params[:code]
    result = HTTParty.post('https://github.com/login/oauth/access_token',
                          {body:
                            {:client_id => CONFIG['github']['client_id'],
                            :client_secret => CONFIG['github']['client_secret'],
                            :code => session_code},
                           headers: {
                            "Accept" => "application/json"
                            }
                          })
    session[:access_token] = JSON.parse(result.body)["access_token"]
    redirect_to root_path
  end

end