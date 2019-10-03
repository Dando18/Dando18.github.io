---
title: 'Recursive Doubling'
date: 2019-10-03
permalink: /posts/2019/10/03/recursive-doubling
categories:
  - math
tags:
  - computer science
  - math
  - parallel computing
---


Consider a problem of the form 

$$ x_i = a_i x_{i-1} + b_i $$

where $x_1=b_1$ and $a_i,b_i,x_i \in \mathbb{R}$. When $a$ and $b$ are known computing $x$ appears to be an intrinsically serial problem. To compute $x_i$ you must know $x_{i-1}$. However, we can approach in a parallel manner when we consider a big observation.

Observation #1: $x_i$ can be rewritten in terms of $x_{i-2}$. 

$$x_i = a_i \left( x_{i-1} \right) + b_i = a_i \left( a_{i-1} x_{i-2} + b_{i-1} \right) + b_i $$
