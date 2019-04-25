require_dependency 'redmine/helpers/gantt'

module GanttPatch
  def self.included(base)
    base.extend(ClassMethods)
    base.send(:include, InstanceMethods)
    base.class_eval do
      unloadable
	  alias_method_chain :line_for_issue, :custom_text
	  alias_method_chain :html_subject, :custom_width
	end
  end
  module ClassMethods
  end
  module InstanceMethods  
    def isholiday(date)
		if date.mday == 1 && date.mon == 1
			return true
		end
		if date.mday == 6 && date.mon == 1
			return true
		end
		if date.mday == 1 && date.mon == 5
			return true
		end
		if date.mday == 3 && date.mon == 10
			return true
		end
		if date.mday == 1 && date.mon == 11
			return true
		end
		if date.mday == 25 && date.mon == 12
			return true
		end
		if date.mday == 26 && date.mon == 12
			return true
		end
		jahr = date.year
		c = jahr / 100
		n = jahr - 19 * (jahr / 19)
		k = (c - 17) / 25
		i = c - c / 4 - ((c - k) / 3) + 19 * n + 15
		i = i - 30 * (i / 30)
		i = i - (i / 28) * ((1 - (i / 28)) * (29 / (i + 1)) * ((21 - n) / 11))
		j = jahr + (jahr / 4) + i + 2 - c + (c / 4)
		j = j - 7 * (j / 7)
		l = i - j
		osterMonat = 3 + ((l + 40) / 44)
		osterTag = l + 28 - 31 * (osterMonat / 4)
		hDate = Date.civil(date.year, osterMonat, osterTag)
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		hDate -= 2
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		hDate += 3
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		hDate += 38
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		hDate += 11
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		hDate += 10
		if date.mday == hDate.mday && date.mon == hDate.mon
			return true
		end
		return false
	end
    def line_for_issue_with_custom_text(issue, options)
      # Skip issues that don't have a due_before (due_date or version's due_date)
      if issue.is_a?(Issue) && issue.due_before
        label = issue.status.name.dup
        unless issue.disabled_core_fields.include?('done_ratio')
          label << " #{issue.done_ratio}%"
        end
	    labelValueCustomField = issue.custom_values.find{ |i| i.custom_field_id == 1 }
		if not labelValueCustomField.nil? and labelValueCustomField.value != ""
			label = issue.assigned_to.to_s + " " + labelValueCustomField.value
		else
			label = label + " " + issue.assigned_to.to_s
		end
        markers = !issue.leaf?
        line(issue.start_date, issue.due_before, issue.done_ratio, markers, label, options, issue)
      end
	end
	def html_subject_with_custom_width(params, subject, object)	
      style = "position: absolute;top:#{params[:top]}px;left:#{params[:indent]}px;"
      style << "right:#{params[:indent]/params[:subject_width]}%;" if params[:subject_width]
      content = html_subject_content(object) || subject
      tag_options = {:style => style}
      case object
      when Issue
        tag_options[:id] = "issue-#{object.id}"
        tag_options[:class] = "issue-subject"
        tag_options[:title] = object.subject
      when Version
        tag_options[:id] = "version-#{object.id}"
        tag_options[:class] = "version-name"
      when Project
        tag_options[:class] = "project-name"
      end
      output = view.content_tag(:div, content, tag_options)
      @subjects << output
      output
    end
  end
end
Redmine::Helpers::Gantt.send(:include, GanttPatch)