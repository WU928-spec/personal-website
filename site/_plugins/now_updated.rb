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
end

if defined?(Jekyll::Hooks)
  Jekyll::Hooks.register :pages, :pre_render do |page, _payload|
    NowUpdated.apply(page)
  end
end
