require 'time'

module NowUpdated
  def self.display_time(path, git: nil)
    raw = if git
      git.call(path)
    else
      root = IO.popen(['git', 'rev-parse', '--show-toplevel'], &:read).strip
      return if root.empty?
      IO.popen(['git', '-C', root, 'log', '-1', '--format=%cI', '--', path], &:read)
    end
    value = raw.to_s.strip
    return if value.empty?
    Time.parse(value).getlocal('+08:00').strftime('%Y-%m-%d %H:%M')
  rescue StandardError
    nil
  end

  def self.apply(page, git: nil)
    return unless File.basename(page.path.to_s) == 'now.md'
    timestamp = display_time(page.path, git: git)
    page.data['updated'] = timestamp if timestamp
  end

  def self.apply_to_site(site, git: nil)
    page = site.pages.find { |candidate| File.basename(candidate.path.to_s) == 'now.md' }
    apply(page, git: git) if page
  end
end

if defined?(Jekyll::Generator)
  class NowUpdatedGenerator < Jekyll::Generator
    def generate(site)
      NowUpdated.apply_to_site(site)
    end
  end
end
