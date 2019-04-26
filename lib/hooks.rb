module RedmineHooks
  class Hooks < Redmine::Hook::ViewListener
    def view_layouts_base_html_head(context={})
      return context[:controller].send(:render_to_string, {
        :locals => context,
        :partial=> 'hooks/scripts'})
    end
  end
end
