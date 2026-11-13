require 'minitest/autorun'
require_relative '../_plugins/wikilinks'

FakeDocument = Struct.new(:data, :url, :basename, :content)

class WikilinksTest < Minitest::Test
  def setup
    @reader = FakeDocument.new({ 'title' => '读者' }, '/notes/2026-11-08_读者/', '2026-11-08_读者.md')
    @other = FakeDocument.new({ 'title' => '另一篇' }, '/notes/another/', 'another.md')
    @index = Wikilinks.build_index([@reader, @other])
  end

  def test_links_titles_aliases_and_headings
    html = Wikilinks.transform('阅读 [[读者]]，跳到 [[读者#川端康成|这一段]]。', @index, @other)
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/">读者</a>'
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/#川端康成">这一段</a>'
  end

  def test_supports_file_names_and_local_headings
    html = Wikilinks.transform('[[2026-11-08_读者|文件]] [[#当前小节|这里]]', @index, @other)
    assert_includes html, '<a class="wikilink" href="/notes/2026-11-08_读者/">文件</a>'
    assert_includes html, '<a class="wikilink" href="/notes/another/#当前小节">这里</a>'
  end

  def test_unresolved_links_and_code_are_preserved
    html = Wikilinks.transform("[[不存在]] `[[读者]]`\n```\n[[读者]]\n```", @index, @other)
    assert_includes html, '<span class="wikilink unresolved" title="没有找到这篇公开文章">不存在</span>'
    assert_includes html, '`[[读者]]`'
    assert_includes html, "```\n[[读者]]\n```"
  end

  def test_builds_backlinks_from_public_notes
    @other.content = '链接到 [[读者]]。'
    @reader.content = '没有出站链接。'
    site = Struct.new(:collections).new({ 'notes' => Struct.new(:docs).new([@reader, @other]) })

    Wikilinks.prepare(site)

    assert_equal [{ 'title' => '另一篇', 'url' => '/notes/another/' }], @reader.data['backlinks']
    assert_equal [], @other.data['backlinks']
  end
end
