---
layout: archive
title: "News"
permalink: /news/
---

{% include base_path %}

<div class="news-intro">
  <p class="news-kicker">What's happening</p>
  <h1 class="news-headline">Recent news and announcements</h1>
  <p class="news-lede">
    A running log of milestones, papers, travel, and life updates. Tap any item to read more or follow external links.
  </p>
</div>

{% assign news_items = site.news | sort: "date" | reverse %}
{% assign current_year = "" %}

<div class="news-timeline">
{% for item in news_items %}
  {% assign item_year = item.date | date: "%Y" %}
  {% if item_year != current_year %}
    {% if current_year != "" %}
      </div>
    </div>
    {% endif %}
    <div class="news-year">
      <div class="news-year__label">{{ item_year }}</div>
      <div class="news-year__items">
  {% endif %}

  {% assign icon_name = item.icon | default: "newspaper-o" | remove: "fa-" | strip %}
  <article class="news-card">
    <div class="news-card__date">
      <span class="news-card__month">{{ item.date | date: "%b" }}</span>
      <span class="news-card__day">{{ item.date | date: "%-d" }}</span>
      <span class="news-card__year">{{ item.date | date: "%Y" }}</span>
    </div>

    <div class="news-card__body">
      <div class="news-card__title-row">
        <div class="news-card__title">
          <i class="fa fa-{{ icon_name }}" aria-hidden="true"></i>
          {% if item.link %}
            <a href="{{ item.link }}" target="_blank" rel="noopener">{{ item.title }}</a>
          {% else %}
            <a href="{{ base_path }}{{ item.url }}">{{ item.title }}</a>
          {% endif %}
        </div>
        <div class="news-card__meta">
          {% if item.location %}<span class="news-chip">{{ item.location }}</span>{% endif %}
        </div>
      </div>

      {% if item.excerpt %}
        <p class="news-card__excerpt">{{ item.excerpt }}</p>
      {% endif %}

      <div class="news-card__links">
        <a class="news-card__link" href="{{ base_path }}{{ item.url }}">Details</a>
        {% if item.link %}
          <a class="news-card__link news-card__link--external" href="{{ item.link }}" target="_blank" rel="noopener">
            External link <i class="fa fa-external-link" aria-hidden="true"></i>
          </a>
        {% endif %}
      </div>
    </div>
  </article>

  {% assign current_year = item_year %}
  {% if forloop.last %}
      </div>
    </div>
  {% endif %}
{% endfor %}
</div>
