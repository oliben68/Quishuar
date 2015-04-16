require 'rbconfig'
require 'yaml'

class SassyClass
    def _ruby_tool_path(tool)
        ruby_exec_path = ruby_exec_path = File.join( RbConfig::CONFIG['bindir'],
            RbConfig::CONFIG['RUBY_INSTALL_NAME'] + RbConfig::CONFIG['EXEEXT'])
        ruby_exec_ary = ruby_exec_path.split('/').reverse.drop(1).reverse.insert(-1, tool)
        return "%s %s" % [@ruby_exec_path, ruby_exec_ary.join('/')]
    end

    def sass_transform(sass_file, css_output = nil, web_root = `pwd`.gsub("\n", ''))
        sass_file_path = "%s/%s" % [
           (if web_root[-1..-1] == "/" then web_root[0..-2] else web_root end),
           (if (sass_file[0..0] == "/") then sass_file[1..-1] else sass_file end)]

        if css_output == nil
            css_output_ary = sass_file_path.split('.').reverse.drop(1).reverse.insert(-1, 'css')
            css_output = css_output_ary.join('.')
        else
            css_output = "%s/%s" % [web_root, css_output]
        end

        sass_cmd = "%s %s %s" % [_ruby_tool_path('sass'), File.expand_path(sass_file_path), File.expand_path(css_output)]
        begin
            %x(#{sass_cmd})
        rescue Exception => e
            puts e
        end

        css_output_rel = css_output.gsub(web_root, '')
    end

    def insert_head_items(file_name)
        output = ""
        begin
            data = YAML::load(File.open(file_name))
            data["items"].each do |item|
                case item.keys[0]
                when "comment"
                    output += "<!--%s-->\n" % [item['comment']]
                else
                    if item[item.keys[0]] == nil then
                        tag = item.keys[0]
                        item.delete(tag)
                        if item.has_key?("rel") and item["rel"] == "stylesheet" and
                            item.has_key?("href") and item.has_key?("source") and 
                            item.has_key?("output")
                            
                            sass_transform(item["source"], item["output"])
                        end
                        output += "<%s" % [tag]
                        item.keys.each do |key|
                            output += " %s=\"%s\"" % [key, item[key]]
                        end
                        output += (if tag == "script" then "></%s>\n" % [tag] else " />\n" end)
                    else
                        output += "\n"
                    end
                end
            end
        rescue Exception => e
            puts e
        end
        return output
    end

    def insert_as_is(file_name)
        output = ""
        begin
            file = File.open(file_name, 'r')
            output += file.read
        rescue Exception => e
            puts e
        end
        return output
    end  
end

SASSY = SassyClass.new