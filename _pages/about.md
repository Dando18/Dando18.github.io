---
permalink: /
title: "About Me"
excerpt: "About me"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

I am the [Sidney Fernbach Postdoctoral
Fellow](https://computing.llnl.gov/fernbach) at Lawrence Livermore National
Laboratory. I previously completed my PhD in computer science at the University
of Maryland, College Park working with the [Parallel Software and Systems
Group](https://pssg.cs.umd.edu). Before UMD, I completed my B.S. in Computer
Science at the University of Tennessee, Knoxville in Spring 2020 working with
the [Innovative Computing Laboratory](https://www.icl.utk.edu/) and the [Joint
Institute for Computer Science](https://www.jics.utk.edu/). I am also the
recipient of the [2024 ACM-IEEE CS George Michael Memorial HPC
Fellowship](https://awards.acm.org/hpc-fellows).

<div class="home-news">
  <div class="home-news__header">
    <h2>News</h2>
    <a class="home-news__all" href="/news/">View all</a>
  </div>
  <ul class="home-news__list">
    {% assign recent_news = site.news | sort: "date" | reverse | slice: 0, 5 %}
    {% for item in recent_news %}
    <li class="home-news__item">
      <div class="home-news__date">{{ item.date | date: "%b '%y" }}</div>
      <div class="home-news__content">
        <div class="home-news__title">
          {% if item.link %}
          <a href="{{ item.link }}" target="_blank" rel="noopener">{{ item.title }}</a>
          {% else %}
          {{ item.title }}
          {% endif %}
        </div>
        <div class="home-news__meta">
          {% if item.location %}<span class="home-news__location">{{ item.location }}</span>{% endif %}
          {% if item.location and item.excerpt %}<span class="home-news__dot">&bull;</span>{% endif %}
          {% if item.excerpt %}<span class="home-news__summary">{{ item.excerpt }}</span>{% endif %}
        </div>
      </div>
    </li>
    {% endfor %}
  </ul>
</div>

My research broadly centers around the intersection of systems and machine
learning where I utilize historical data to improve performance on HPC systems.
More recently I have branched into exploring how LLMs can be utilized to improve
scientific and high performance software development. You can check out our
HPC-Coder model [on
HuggingFace](https://huggingface.co/hpcgroup/hpc-coder-v2-6.7b). Previously I
worked on high performance and parallel deep learning and authored the DL
framework [MagmaDNN](https://github.com/MagmaDNN/magmadnn).

Outside of work I also enjoy film,
[reading](https://www.goodreads.com/user/show/101631777-daniel-nichols), and
twizzlers (my _raison d'être_) of which I [sometimes write
about](/year-archive/). I am also fairly active on the [Math StackExchange math
forum](https://math.stackexchange.com/users/274085/dando18). I currently reside
in Berkeley, California with [my lovely
wife](https://sites.google.com/view/mollyharnish/about).

<p align="center">
<i>
<br>
S'io credesse che mia risposta fosse<br>
A persona che mai tornasse al mondo,<br>
Questa fiamma staria senza piu scosse.<br>
Ma penciocche gammai di questo fondo<br>
Non torno viva alcun, s'i'odo il vero,<br>
Senza tema d'infamia ti rispondo<br>
</i>
</p>
