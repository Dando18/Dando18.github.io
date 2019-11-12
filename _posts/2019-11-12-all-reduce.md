---
title: 'All Reduce'
date: 2019-11-12
permalink: /posts/2019/11/12/all-reduce
categories:
  - computer science
tags:
  - computer science
  - math
  - parallel computing
---

All-Reduce is the operation of _reducing_ some data across nodes and finishing with the resulting reduction available on all processes. 

For instance, say each of $p$ processors has a number $n_i$. An example of an All-Reduce operation is computing the sum, $s=\sum_{j=0}^{p-1} n_j$, and storing the resulting sum $s$ on each processor. Seems trivial, right?

We can gather all the numbers on a master processor, compute the average, and then broadcast the result. This naive approach is, however, rather sub-optimal. 