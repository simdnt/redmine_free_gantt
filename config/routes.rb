RedmineApp::Application.routes.draw do
  post '/issues/:id/move', :to => 'moves#move', :id => /\d+/, :as => 'rmp_move_issue'
end