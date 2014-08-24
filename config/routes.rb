Octokitty::Application.routes.draw do
  root to:'home#index'
  match 'test' => 'home#test'
  match 'login' => 'home#login'
  match 'oauth/callback' => 'oauth#callback'

  get 'users/:username/repos'=> 'repos#show'
  get '/repos/:owner/:repo/commits/:author' => 'commits#show'
  get '/repos/:owner/:repo/contributors' => 'contributors#show'
end
