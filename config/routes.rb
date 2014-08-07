Octokitty::Application.routes.draw do
  root to:'home#index'
  match 'test' => 'home#test'
  match 'oauth/callback' => 'oauth#callback'
end
