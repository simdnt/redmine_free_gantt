require 'redmine'

require_dependency 'gantt_patch'

Redmine::Plugin.register :free_gantt do
  name 'Free Gantt plugin'
  author 'simdnt'
  description 'This is a free gantt plugin for Redmine'
  version '0.0.1'
  url 'https://github.com/simdnt'
  author_url 'https://github.com/simdnt'
end