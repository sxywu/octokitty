Octokitty::Application.routes.draw do
  root to:'home#index'
  match 'test' => 'home#test'
  match 'login' => 'home#login'
  match 'oauth/callback' => 'oauth#callback'

  get 'users/:username'=> 'users#get_user'
  get 'users/poll/:username' => 'users#poll'
end
