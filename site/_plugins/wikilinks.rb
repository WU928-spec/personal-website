require 'erb'

module Wikilinks
  LINK_PATTERN = /\[\[([^\[\]\n]+)\]\]/.freeze

  def self.normalize_key(value)
    value.to_s.strip.unicode_normalize(:nfc).downcase.sub(/\.md$/, '').sub(/^\d{4}-\d{2}-\d{2}[-_]/, '')
  end

  def self.heading_slug(value)
    value.to_s.downcase.strip.gsub(/\s+/, '-').gsub(/[^\p{Word}\-_]/, '').gsub(/-+/, '-').gsub(/^-|-$/, '')
  end

  def self.keys_for(document)
    basename = document.basename.to_s.sub(/\.md$/, '')
    [document.data['title'], document.data['slug'], basename, basename.sub(/^\d{4}-\d{2}-\d{2}[-_]/, '')]
  end

  def self.build_index(notes)
    notes.each_with_object({}) do |document, index|
      next if document.data['published'] == false
      keys_for(document).each do |key|
        normalized = normalize_key(key)
        next if normalized.empty?
        if index.key?(normalized) && !index[normalized].equal?(document)
          index[normalized] = nil
        else
          index[normalized] = document
        end
      end
    end
  end

  def self.map_text_segments(content, &block)
    content.to_s.split(/(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]+`)/).each_with_index.map do |part, index|
      index.even? ? block.call(part) : part
    end.join
  end

  def self.extract_targets(content)
    targets = []
    map_text_segments(content) do |segment|
      segment.scan(LINK_PATTERN) do |match|
        target = match[0].split('|', 2)[0].split('#', 2)[0].strip
        targets << target unless target.empty?
      end
      segment
    end
    targets
  end

  def self.transform(content, index, current_document)
    map_text_segments(content) do |segment|
      segment.gsub(LINK_PATTERN) do
        inner = Regexp.last_match(1)
        target_part, alias_text = inner.split('|', 2)
        target_part = target_part.to_s.strip
        heading = target_part.split('#', 2)[1]
        target = target_part.split('#', 2)[0].to_s.strip
        label = alias_text || (target.empty? ? heading : target_part)
        document = target.empty? ? current_document : index[normalize_key(target)]
        next ERB::Util.html_escape(label) if label.nil?
        if document
          href = document.url.to_s
          href += "##{heading_slug(heading)}" if heading && !heading.empty?
          %(<a class="wikilink" href="#{ERB::Util.html_escape(href)}">#{ERB::Util.html_escape(label)}</a>)
        else
          %(<span class="wikilink unresolved" title="没有找到这篇公开文章">#{ERB::Util.html_escape(label)}</span>)
        end
      end
    end
  end

  def self.process_page(document, site)
    prepare(site)
    index = site.instance_variable_get(:@wikilinks_index)
    document.content = transform(document.content, index, document)
  end

  def self.prepare(site)
    return if site.instance_variable_get(:@wikilinks_prepared)
    notes = site.collections['notes'].docs
    pages = site.respond_to?(:pages) ? site.pages : []
    sources = (notes + pages).select { |document| document.data['published'] != false }
    index = build_index(sources)
    backlinks = Hash.new { |hash, key| hash[key] = [] }

    sources.each do |source|
      extract_targets(source.content).each do |target|
        document = index[normalize_key(target)]
        next unless document
        next if document.equal?(source)
        backlinks[document] << source unless backlinks[document].include?(source)
      end
    end

    sources.each do |document|
      document.data['backlinks'] = backlinks[document].map do |source|
        { 'title' => source.data['title'] || source.basename, 'url' => source.url }
      end
    end
    site.instance_variable_set(:@wikilinks_index, index)
    site.instance_variable_set(:@wikilinks_prepared, true)
  end
end

if defined?(Jekyll::Hooks)
  Jekyll::Hooks.register :documents, :pre_render do |document, _payload|
    next unless document.collection.label == 'notes'
    Wikilinks.process_page(document, document.site)
  end

  Jekyll::Hooks.register :pages, :pre_render do |page, _payload|
    Wikilinks.process_page(page, page.site)
  end
end
