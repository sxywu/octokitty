Octokitty::Application.routes.draw do
  root to:'home#index'
  match 'test' => 'home#test'
  match 'login' => 'home#login'
  match 'oauth/callback' => 'oauth#callback'
  get 'users/:username'=> 'users#show'
  get 'poll/:username' => 'poll#user'
end
