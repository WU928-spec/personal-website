require_relative '../_plugins/wikilinks'

FakeDocument = Struct.new(:data, :url, :basename, :content)

def assert_includes(text, fragment)
  raise "Expected #{fragment.inspect} to appear in #{text.inspect}" unless text.include?(fragment)
end

def assert_equal(expected, actual)
  raise "Expected #{expected.inspect}, got #{actual.inspect}" unless expected == actual
end

def with_documents
  reader = FakeDocument.new({ 'title' => '读者' }, '/notes/2026-11-08_读者/', '2026-11-08_读者.md')
  other = FakeDocument.new({ 'title' => '另一篇' }, '/notes/another/', 'another.md')
  yield reader, other, Wikilinks.build_index([reader, other])
end

def test_links_titles_aliases_and_headings
  with_documents do |reader, other, index|
    html = Wikilinks.transform('阅读 [[读者]]，跳到 [[读者#川端康成|这一段]]。', index, other)
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/">读者</a>'
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/#川端康成">这一段</a>'
  end
end

def test_supports_file_names_and_local_headings
  with_documents do |_reader, other, index|
    html = Wikilinks.transform('[[2026-11-08_读者|文件]] [[#当前小节|这里]]', index, other)
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/">文件</a>'
    assert_includes html, '<a class="wikilink" href="/notes/another/#当前小节">这里</a>'
  end
end

def test_unresolved_links_and_code_are_preserved
  with_documents do |_reader, other, index|
    html = Wikilinks.transform("[[不存在]] `[[读者]]`\n```\n[[读者]]\n```", index, other)
    assert_includes html, '<span class="wikilink unresolved" title="没有找到这篇公开文章">不存在</span>'
    assert_includes html, '`[[读者]]`'
    assert_includes html, "```\n[[读者]]\n```"
  end
end

def test_builds_backlinks_from_public_notes
  with_documents do |reader, other, _index|
    other.content = '链接到 [[读者]]。'
    reader.content = '没有出站链接。'
    site = Struct.new(:collections).new({ 'notes' => Struct.new(:docs).new([reader, other]) })
    Wikilinks.prepare(site)
    assert_equal [{ 'title' => '另一篇', 'url' => '/notes/another/' }], reader.data['backlinks']
    assert_equal [], other.data['backlinks']
  end
end

def test_processes_pages_and_includes_them_in_backlinks
  target = FakeDocument.new({ 'title' => '调度问题' }, '/notes/调度问题/', '调度问题.md', '正文')
  now = FakeDocument.new({ 'title' => '现在' }, '/now/', 'now.md', '一个[[调度问题]]')
  site = Struct.new(:collections, :pages).new(
    { 'notes' => Struct.new(:docs).new([target]) },
    [now],
  )

  Wikilinks.process_page(now, site)

  assert_includes now.content, '<a class="wikilink" href="/notes/调度问题/">调度问题</a>'
  assert_equal [{ 'title' => '现在', 'url' => '/now/' }], target.data['backlinks']
end

[
  :test_links_titles_aliases_and_headings,
  :test_supports_file_names_and_local_headings,
  :test_unresolved_links_and_code_are_preserved,
  :test_builds_backlinks_from_public_notes,
  :test_processes_pages_and_includes_them_in_backlinks,
].each { |test| send(test) }

puts '5 wikilink tests passed'
