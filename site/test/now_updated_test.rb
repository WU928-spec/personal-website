require_relative '../_plugins/now_updated'

def assert_equal(expected, actual)
  raise "Expected #{expected.inspect}, got #{actual.inspect}" unless expected == actual
end

page = Struct.new(:url, :path, :data).new('/now/', '/repo/site/now.md', {})
NowUpdated.apply(page, git: ->(_path) { "2026-11-13T10:20:24+08:00\n" })
assert_equal '2026-11-13 10:20', page.data['updated']

other = Struct.new(:url, :path, :data).new('/notes/example/', '/repo/site/_notes/example.md', { 'updated' => 'unchanged' })
NowUpdated.apply(other, git: ->(_path) { raise 'should not query Git for other pages' })
assert_equal 'unchanged', other.data['updated']

missing = Struct.new(:url, :path, :data).new('/now/', '/repo/site/now.md', { 'updated' => 'fallback' })
NowUpdated.apply(missing, git: ->(_path) { '' })
assert_equal 'fallback', missing.data['updated']

puts '3 Now timestamp tests passed'
