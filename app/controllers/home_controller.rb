class HomeController < ApplicationController
  def index
  end

  def oauth
    @callback_url = 'http://127.0.0.1:3000/oauth/callback'
    @client_id = CONFIG['github']['client_id']
  end

  def test
    access_token = session[:access_token]
    @response = HTTParty.get('https://api.github.com/repos/enjalot/checkin/commits?author=sxywu&per_page=100', {:params => {:access_token => access_token},
        :headers => {"rel" => "last",
                    "User-Agent" => "octokitty"}
      })
  end


end