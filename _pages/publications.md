---
layout: archive
title: "Publications"
permalink: /publications/
author_profile: true
---

{% include base_path %}

<div class="pub-intro">
  {% if site.author.googlescholar %}
    <span>You can also find my articles on <a href="{{site.author.googlescholar}}">my Google Scholar profile</a>.</span>
  {% endif %}
</div>

{% assign publications = site.publications | sort: "date" | reverse %}
<div class="pub-list">
  {% for post in publications %}
    {% assign conf = post.venue_short | default: post.abbreviation | default: post.venue %}
    {% assign pub_year = post.pub_year | default: post.date | date: "%Y" %}
    {% assign detail_line = post.short_citation | default: post.citation %}
    {% assign detail_line_highlight = detail_line
      | replace: 'D. Nichols*', '<span class="author-me">D. Nichols*</span>'
      | replace: 'D. Nichols', '<span class="author-me">D. Nichols</span>'
      | replace: 'Daniel Nichols*', '<span class="author-me">Daniel Nichols*</span>'
      | replace: 'Daniel Nichols', '<span class="author-me">Daniel Nichols</span>' %}

    <article class="pub-card">
      <div class="pub-chip">
        <span class="pub-conf">{{ conf }}</span>
        <span class="pub-year">{{ pub_year }}</span>
      </div>

      <div class="pub-main">
        <div class="pub-title-row">
          <h3 class="pub-title"><a href="{{ base_path }}{{ post.url }}">{{ post.title }}</a></h3>
          <div class="pub-links">
            {% if post.paperurl %}
              <a class="pub-link" href="{{ post.paperurl }}" aria-label="PDF">
                <i class="fa fa-file-pdf" aria-hidden="true"></i>
              </a>
            {% endif %}
            <a class="pub-link" href="{{ base_path }}{{ post.url }}" aria-label="Permalink">
              <i class="fa fa-link" aria-hidden="true"></i>
            </a>
          </div>
        </div>

        {% if detail_line %}
          <p class="pub-meta">{{ detail_line_highlight }}</p>
        {% else %}
          <p class="pub-meta">Published in <i>{{ post.venue }}</i> {{ pub_year }}</p>
        {% endif %}
      </div>
    </article>
  {% endfor %}
</div>
