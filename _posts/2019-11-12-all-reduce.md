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

We can gather all the numbers on a master processor, compute the average, and then broadcast the result. This naive approach is, however, rather sub-optimal. What if each processor has more than 1 integer? The gather result might not be able to fit in a single processor's memory.

Additionally, we can outperform the communication overhead of gather $\rightarrow$ compute $\rightarrow$ broadcast. A gather will be $\sim\mathcal{O}(\log p)$ (assuming $n \sim \mathcal{O}(1)$, otherwise $\mathcal{O}(\log p + n)$), the compute is $\mathcal{O}(n+p)$, and finally a broadcast is $\mathcal{O}(n\log p)$. Thus, the total time complexity is roughly $\mathcal{O}(n \log p + p)$. The extra $p$ is if $n\sim\mathcal{O}(1)$, then the time complexity is dominated by $p$.



