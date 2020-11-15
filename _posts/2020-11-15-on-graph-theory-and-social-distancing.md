---
title: 'On Graph Theory and Social Distancing'
date: 2020-11-15
permalink: /posts/2020/15/on-graph-theory-and-social-distancing
categories:
  - graph theory
  - math
tags:
  - graph theory
  - math
---

COVID-19 has posed unique challenges to the world and forced people to adapt to new ways of living. For example *social distancing* has become the norm in public spaces. In the U.S. keeping people 6 feet apart has become a rigid requirement in any social gathering. While sitting at some of these events, I have started to wonder: is this socially distanced arrangement *optimal*? So I began to investigate.

First, we need to define *optimal*. One definition might say an arrangement is optimal if it fits the most amount of people within an area, while preserving social distancing measures. However, this might not be useful as various governments have imposed hard limits on the number of people allowed to gather. So we could, given a fixed number of people, define optimal as maximizing the total distance between people. Or if we are feeling adventurous we could define some function $$ g_{\lambda}(p, d) = \lambda_p p + \lambda_d d $$ as the weighted sum of the net distance and number of people seated and optimize $$ g_{\lambda} $$ over the constraint $$ p < N $$.

All of these measures of optimality make sense, but what are we optimizing exactly? I have used the word "arrangement" without really giving it a definition, so let me present two possible ways to approach this problem. First, we could have a fixed number of available positions and we need to map persons to those positions in such a way that preserves social distancing. For instance, an auditorium has fixed seating and we need to assign people to those seats in an optimal and safe way. Now consider we can move those seats around. This leads us to the second approach, where we need to find an optimal set of points within a region to place people safely.

Now we have 3 measures of optimality over 2 possible problem spaces leading to 6 fun optimization problems to work through. None of these consider the extra free-variable, which is grouping. Often people who co-habitate are permitted to be within 6 feet of each other. At least for the second problem space (non-fixed seating) we can treat groups as single entities and the same solutions work. For the first, we need some smarter solutions, which I address at the end. I should also note that most of my solutions are for the general case and thus somewhat complicated. Finding optimal configurations with the assumption of some regularity is often much easier, but what is the point of being in graduate school if you are not going to show the general case.

- [Fixed Positions](#fixed-positions)
  - [Maximum People](#maximum-people)
  - [Maximum Distance](#maximum-distance)
  - [A Compromise](#a-compromise)
- [Free Positions](#free-positions)
  - [Maximum People](#maximum-people-1)
  - [Maximum Distance](#maximum-distance-1)
  - [A Compromise](#a-compromise-1)
- [Accounting for Groups](#accounting-for-groups)


## Fixed Positions

### Maximum People

Here we have a fixed set of seats $$ V $$ and we want to find an optimal choice of seats $$ S \subseteq V $$ such that $$ \lvert S\rvert $$ is maximized. This can be thought of as a nice graph theory problem. Define $$ \mathcal{G} = \left(V, E\right) $$ where $$ E = \{\left(v_i, v_j\right) : v_i,v_j \in V \land i\ne j \land D(v_i, v_j) < d \} $$, where $$ D(v_i, v_j) $$ is the euclidean distance between two seats and $$ d $$ is some distance threshold (i.e. 6 feet). Now $$ \mathcal{G} $$ is a graph where a seat is connected to another seat if the social distancing rule were to be broken if both seats were occupied.

Thus, the set $$ S $$ must only contain vertices of $$ \mathcal{G} $$ which are not connected by an edge. Such a set of vertices is called an independent set and we want to find the largest independent set of $$ \mathcal{G} $$. This is the same as finding the maximum [clique](https://en.wikipedia.org/wiki/Clique_(graph_theory)) of the complement graph $$ \overline{\mathcal{G}} $$. 

On one hand this is great, because finding maximum cliques is a very well studied area of graph algorithms. On the other hand, this is bad news because it is an [NP-Hard](https://en.wikipedia.org/wiki/NP-hardness) problem; it is hard to solve, check solutions, and even find approximations. There are algorithms better than the $$ \mathcal{O}(2^nn^2) $$ brute-force algorithm, but they are still in NP. Currently, the best algorithm runs in $$ \mathcal{O}(1.1996^n) $$ with polynomial space complexity as proven by Xiao *et al* [[1](https://arxiv.org/pdf/1312.6260.pdf)], which means we could only feasibly apply this algorithm for up to ~100 seats. And even worse is that finding maximum independent sets on a general graph is $$ \mathsf{MaxSNP}\mathrm{-complete} $$ meaning it has no polynomial-time approximations which produce a result within a constant $$ c $$ multiple of the optimal solution.

Luckily there is some prior knowledge about the construction of $$ \mathcal{G} $$, which we can use to simplify the problem. If $$ \Delta = \max_{v\in V} \deg v $$ is the maximum degree in $$ \mathcal{G} $$, then we can say $$ \Delta $$ is independent of $$ \lvert V \rvert $$. That is $$ \mathcal{G} $$ is a degree-bounded graph. We can make this assumption because the number of seats within $$ d $$ distance of a seat should not grow unbounded as the total number of seats grows. Otherwise you have a very dense seat packing, which is not physically possible. Likewise, this means $$ \mathcal{G} $$ is a sparse graph with bounded degree. Halldórsson *et al* [[2](https://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.145.4523&rep=rep1&type=pdf)] show that assuming bounded degree allows for a polynomial-time algorithm to find approximate maximum independent sets where the approximation always has a constant ratio $$ \frac{\Delta + 2}{3} $$ of the optimal solution. Their *greedy* algorithm is actually quite simple in that you just continually remove the vertex with the highest degree until the graph is entirely disconnected. You can see an example of this algorithm below, where each black dot could be considered a "seat" and they are connected if they are within 6 ft of each other. The red dots are then a good selection of placements to put people safely.

<script src="https://cdn.jsdelivr.net/npm/mathjs@8.0.1/lib/browser/math.min.js"></script>
<script src="{{ base_path }}/assets/js/posts/social-distancing.js"></script>
<button id="on-graph-theory-and-social-distancing__btn-0">Run</button>
<canvas id="on-graph-theory-and-social-distancing__canvas-0" style="width: 100%;"></canvas>

Using this we can also give some bounds on $$ \alpha(\mathcal{G}) = \lvert S \rvert $$ (also called the independence number of $$ \mathcal{G} $$). Most of these I pull from W. Willis [[3](https://scholarscompass.vcu.edu/cgi/viewcontent.cgi?referer=https://www.google.com/&httpsredir=1&article=3574&context=etd)]. Let $$ \bar{d} $$ be the average degree of $$ \mathcal{G} $$, $$ n $$ be the number of vertices, $$ e $$ the number of edges, and $$ \lambda_n $$ be the $$ n $$-th eigenvalue (sorted order) of the adjacency matrix. Then we can define the following lower bounds on $$ \alpha $$:

$$ \alpha \ge \frac{n}{1 + \Delta} $$

$$ \alpha \ge \frac{n}{1 + \bar{d}} $$

$$ \alpha \ge \frac{n}{1 + \lambda_1} $$

$$ \alpha \ge \sum_{v\in V} \frac{1}{1 + \deg v} $$

and several others... These are helpful in determining how many we can seat *at least* on a given graph. For instance, consider a rectangular lattice of seats with $$ d $$ unit length and the minimum distance people must sit apart is $$ \sqrt{2}d + \varepsilon $$ for some small $$ \varepsilon > 0 $$. Recall that we assumed $$ \mathcal{G} $$ is sparse with bounded degree. Thus, $$ \Delta(\mathcal{G}) = 8 $$ is independent of the number of seats $$ n $$. So we know that we will be able to seat at least $$ \frac{n}{9} $$ people in this lattice arrangement. But in this case we can give an even tighter bound with the last one (we can assume $$ \sqrt{n} \in \mathbb{Z}^+ $$):

$$\begin{aligned}
\alpha \ge \sum_{v \in V} \frac{1}{1+ \deg v} &= \left(\frac{1}{1+8}\right) (\sqrt{n}-1)^2 + \left(\frac{1}{1+5}\right) (4) (\sqrt{n}-1) + \left(\frac{1}{1+3}\right)(4) \\
&= \frac{1}{9} (\sqrt{n}-1)^2 + \frac{2}{3}(\sqrt{n}-1) + 1
\end{aligned}$$

Now $$ \left(\frac{1}{9} (\sqrt{n}-1)^2 + \frac{2}{3}(\sqrt{n}-1) + 1\right) - \frac{n}{9} \to \infty$$ as $$ n \to \infty $$, so this is an increasingly better lower bound than the first. So given 100 chairs in this lattice configuration and no one can share adjacent chairs, then you can sit at least 16 people according to this lower bound. This is not the tightest lower bound and in fact you can do better.

We can also give some upper bounds on $$ \alpha $$ (from [[3](https://scholarscompass.vcu.edu/cgi/viewcontent.cgi?referer=https://www.google.com/&httpsredir=1&article=3574&context=etd)]). Let $$ \delta = \min_{v \in V} deg(v) $$ be the minimum degree of $$ \mathcal{G} $$.

$$ \alpha \le n - \frac{e}{\Delta} $$

$$ \alpha \le \left\lfloor \frac{1}{2} + \sqrt{\frac{1}{4} + n^2 - n - 2e} \right\rfloor $$

$$ \alpha \le n - \left\lfloor \frac{n-1}{\Delta} \right\rfloor = \left\lfloor \frac{(\Delta-1)n + 1}{\Delta} \right\rfloor $$

$$ \alpha \le n - \delta $$

and some others... These are likewise helpful in determining whether a given arrangement could hold the desired amount. Returning to our lattice example from above we can take $$ e = 2(\sqrt{n}-1)(2\sqrt{n}-1) $$ and use the first upper bound. This gives

$$\begin{aligned}
\alpha \le n - \frac{e}{\Delta} &= n - \frac{2(\sqrt{n}-1)(2\sqrt{n}-1)}{8} \\
&= \frac{1}{4} \left( 2n + 3\sqrt{n} - 1 \right)
\end{aligned}$$

which, for 100 seats, implies $$ \alpha \le 57.25 $$. So now we know $$ 16 \le \alpha \le 57.25 $$, which are not great bounds, but bounds nonetheless. In fact, for the particular lattice problem I brought up (with $$ \Delta(\mathcal{G}) = 8 $$) we can say that $$ \alpha(\mathcal{G}) = \left\lceil \frac{\sqrt{n}}{2} \right\rceil^2 $$. Thus, with 100 seats we can seat at most 25 people safely. We will not have this nice closed form for every problem though, so the upper and lower bounds are important.

In summation, making assumptions about the connectivity of our graph allows us to use efficient approximations. In addition, we can calculate certain guarantees based on simple graph invariants (properties). However, this solution is somewhat overkill as fixed positions are often seats, which are usually in some regular pattern. As with the lattice pattern above it is fairly trivial to find a closed form solution based on regularity, but it is still good to have a solution for the general case.

### Maximum Distance

Here we have a fixed number of people $$ N $$ that we need to sit with maximum separation. We want to find a set of vertices $$ A \subseteq V $$ such that $$ \lvert A \rvert = N $$ and the minimum distance between any two vertices is maximum. More formally this is written as 

$$ \begin{aligned} 
\textrm{maximize} \quad& \min_{i \ne j} D\left(v_i, v_j \right) \\
\textrm{subject to} \quad & v_1, \ldots, v_N \in A \subseteq V \\
\quad & \lvert A \rvert = N
\end{aligned} $$

This problem is known as the _discrete p-dispersion_ problem and, again, has a decent amount of literature surrounding it. Unfortunately it is another computationally difficult problem. This can be shown by an interesting relationship to the independent set problem from above. First, let $$ \mathcal{G}_d $$ be defined by the same graph as above with minimum distance $$ d $$ and let $$ \mathcal{X} : \mathbb{R} \mapsto A $$ be defined by 

$$ \mathcal{X} (d) = \left\{ A \mid A \subseteq V \land \lvert A \rvert = p \land \mathbb{I}\{x\in A\} + \mathbb{I}\{y\in A\} \le 1 \,\,\forall (x,y) \in E\left(\mathcal{G}_d\right) \right\} $$

where $$ E\left(\mathcal{G}_d\right) $$ are the edges of $$ \mathcal{G}_d $$ and $$ \mathbb{I} $$ is the indicator function. The above max-min problem can be re-written as 

$$ \begin{aligned} 
\textrm{maximize} \quad & d \\
\textrm{subject to} \quad & \mathcal{X}(d) \ne \emptyset  \\
\quad & d \ge 0
\end{aligned} $$

Notice that $$ \mathcal{X}(d) $$ is the set of all size $$ N $$ independent sets of $$ \mathcal{G}_d $$ with a minimum separation of $$ d $$. So we want to maximize $$ d $$, such that a size $$ N $$ independent set exists within $$ \mathcal{G}_d $$. The independent set decision problem is $$ \mathsf{NP-complete} $$ as it is closely related to the [minimum vertex cover decision problem](https://en.wikipedia.org/wiki/Vertex_cover).

Assuming the above maximization is feasible it can be solved using binary search on the list of possible distances $$ d $$ and an independent set decision algorithm for feasibility testing. The list of possible values for $$ d $$ is all the distances in the full graph $$ \mathcal{G}_{\infty} $$. Thus, if $$ d_{max} $$ is the maximum distance between any two vertices in $$ \mathcal{G} $$, then the algorithm will run the independent set decision problem $$ \mathcal{O}(\log d_{max}) $$ times. The algorithm is still in $$ \mathsf{NP} $$ because of this, but is still feasible for smaller graphs (roughly $$ 10^3 $$ seats). Sayah _et al_ propose two formulations of the problem in terms of mixed-integer linear programming with reduced constraints using known bounds, which offer exact solutions [[4](http://www.math.wm.edu/~rrkinc/hmk_current/NLT/PdispEJOR16.pdf)] and can be easily solved with [CPLEX](https://www.ibm.com/analytics/cplex-optimizer).

### A Compromise

Now lets get a little more general... Consider we want to find some optimal solution in-between the two above approaches. This could be phrased as maximizing a weighted sum of the total number of people seated and the minimum distance between any two people. As a function this is $$ g_{\lambda_N, \lambda_d} (N, d) = \lambda_N N + \lambda_d d $$. Now we can fix the $$ \lambda $$'s and try to maximize $$ g $$. This can be formulated exactly as above, but now $$ \mathcal{X} $$ is a function of $$ N $$ and $$ d $$. I am also going to change the notation a bit to express the problem in terms of integer programming.

Let $$ \bm{x} \in \{0, 1\}^{\lvert V \rvert} $$ be a vector with an element corresponding to each vertex in $$ \mathcal{G} $$. If we decide to assign a person to vertex $$ i $$ (aka seat), then $$ \bm{x}_i = 1 $$, otherwise it is 0. Now we can re-define $$ \mathcal{X} $$ as 

$$ \mathcal{X}(N,d) = \left\{ \bm{x} \mid \sum_{i\in\mathcal{G}_d} \bm{x}_i = N \land \bm{x}_i + \bm{x}_j \le 1 \,\, \forall (i,j) \in E\left(\mathcal{G}_d\right) \right\} $$

Using this for our maximization problem gives

$$ \begin{aligned} 
\textrm{maximize} \quad & g_{\lambda_N, \lambda_d} (N, d) \\
\textrm{subject to} \quad & \mathcal{X}(N, d) \ne \emptyset  \\
\quad & d \ge 0 \\
\quad & 0 \le N \le \lvert V \rvert 
\end{aligned} $$

This adds another degree of freedom to the above algorithm, but it should be fairly trivial to adapt. Since $$ \lambda $$ are fixed, then we can fix $$ N $$, which gives $$ \max_{d} g_{\lambda_N, \lambda_d} (N, d) $$. This is the same problem as above. Despite the intuition that $$ N \propto \frac{1}{\max d} $$ they are dependent on each-other so we cannot binary search $$ N $$ as well. We will need to exhaustively search all values of $$ N $$ from $$ 1 $$ to $$ \lvert V \rvert $$. Thus we run the independent set decision problem $$ \mathcal{O}\left( \lvert V \rvert \log d_{max} \right) $$ times.

## Free Positions

### Maximum People

Some places, such as a store, do not have fixed positions to map people into. In this case we need to find those fixed positions, which adds a free variable into the optimization search space. However, this is also a constraint relaxation making the problem much easier to solve. For this problem we want to find a set of points within a region such that each point is farther than $$ d $$ from all other points and we can fit the most people inside the region.

Formally, we have a space $$ S \subset \mathbb{R}^2 $$ and we want to find a set of points $$ \mathcal{X} = \{ \bm{x}_i \mid \bm{x}_i \in S \land D(\bm{x}_i, \bm{x}_j) < d\,\, \forall i \ne j \} $$ such that $$ \lvert \mathcal{X} \rvert $$ is maximum. The provided solution actually works in $$ \mathbb{R}^d $$, but $$ \mathbb{R}^2 $$ and $$ \mathbb{R}^3 $$ are the only ones we care about.

Each $$ \bm{x}_i $$ has a neighborhood $$ S_\epsilon $$, which no other points lie within. In the 2D case this means we have a circle centered at each $$ \bm{x}_i $$ and none of them overlap. Now this boils down to the well studied problem of [circle packing](https://en.wikipedia.org/wiki/Circle_packing). There is an abundance of literature and software surrounding circle packing as well as available [tables of existing solutions](http://hydra.nat.uni-magdeburg.de/packing/csq/csq.html).

As an example of how to translate circle packing problems into point packing I will look at square regions. Given a square region with side length $$ L $$ we want to find the maximum circle packing of a square region $$ L + d $$ (scaled to account for 2 extra radii). Most literature focuses on packing unit circles, so to use these results we need to scale the square to $$ \frac{L}{d} + 1 $$ and then, once a solution is arrived upon, rescale the found circle centers by $$ d $$. 

Say we have a square region that is $$ 100 \times 100 $$ ft and we want to find the most number of seats to place such that they are all 6 ft apart. This is equivalent to finding the most number of unit circles that can be placed in the square with side length $$ \frac{100 + 6}{6} = 17.\overline{6} $$. 

### Maximum Distance

In this optimization problem we need to choose $$ N $$ positions in a region such that they are maximally dispersed. This can more formally be expressed as a constrained optimization problem:

$$ \begin{aligned} 
\textrm{maximize} \quad& \min_{i \ne j} \lVert \bm{x}_i - \bm{x}_j \rVert \\
\textrm{subject to} \quad & \bm{x}_1, \ldots, \bm{x}_N \in S \subset \mathbb{R}^2 \\
\end{aligned} $$

This is known as the _continuous p-dispersion_ problem and is well studied in terms of exact solutions and approximations. When $$ S $$ is convex this is similar to the circle packing problem of fitting the most circles in $$ S $$, since we can rewrite the above maximization problem as:

$$ \begin{aligned}
\textrm{maximize} \quad & R \\
\textrm{subject to} \quad & \bm{x}_1, \ldots, \bm{x}_N \in S \subset \mathbb{R}^2 \\
\quad & \lVert \bm{x}_i - \bm{x}_j \rVert > 2R \quad \forall i \ne j
\end{aligned} $$

These are non-linear programs and exact solutions are not always feasible. One can use an optimization software such as [AMPL](https://ampl.com/) to find good solutions for any generic convex region $$ S $$. However, since rectangular regions are common real-life examples I will discussion their solutions here.

Consider the region $$ S \in [0, 1]^2 $$. We want to fit $$ N $$ points within this square such that the minimum distance between any two points is maximized. We also want the minimum distance to be greater than $$ d $$, but by maximizing the minimum we should figure out whether this is even possible or not. Any solution in $$ [0, 1]^2 $$ is valid for any square region as we can take $$ \bm{x}_i \mapsto \frac{1}{2}\left(\frac{\bm{x}_i}{\lVert\bm{x}_i\rVert} + 1\right) $$, which maps all $$ \bm{x}_i $$ to $$ [0, 1]^2 $$ and preserves the ordering of their scaled distances.

### A Compromise

Much like above we can extend the discrete version by relaxing the constraint to be continuous.

$$ \begin{aligned} 
\textrm{maximize} \quad & g_{\lambda_N, \lambda_d} (N, d) \\
\textrm{subject to} \quad & \bm{x}_1, \ldots, \bm{x}_N \in S \subset \mathbb{R}^2  \\
\quad & d \ge 0 \\
\quad & 0 \le N \le \lvert V \rvert \\
\quad & \lVert \bm{x}_i - \bm{x}_j \rVert \le d \quad \forall i \ne j 
\end{aligned} $$

This is actually a pretty difficult problem, but it can be solved similar to how we solved the _compromised_ solution in the discrete case. For any fixed $$ N $$ we can solve this using the _continuous p-dispersion_ solution. Since $$ N $$ is discrete, then we can just try every value from $$ 1 $$ to $$ \lvert V \rvert $$ and see which one maximizes $$ g_{\lambda_N, \lambda_d} $$. 

## Accounting for Groups

Now if everyone sat/stood by themselves, then all of the above mentioned techniques would work wonderfully. But in reality people who co-habitate are often allowed to be within 6 feet of each other. In the latter approach, where we are placing the seats, this is fine. We can treat "seats" as groups of seats and all of the above mentioned methods still work. However, things get a bit more complicated when we look at the fixed seating optimization problem.

For example, consider the problem where we have $$ \lvert V \rvert $$ fixed seats and we are trying to seat $$ N $$ people with maximal distance between them. One way to approach this problem is to partition the graph into subgraphs where each subgraph represents a local "neighborhood" of seats. This way each subgraph could hold multiple people. However, determining the number of partitions to use ahead of time is difficult for the general case. 

For this problem let $$ \bm{x}_i \in \mathbb{R}^2 $$ be the location of position $$ i $$ in euclidean space. Now define the fully connected graph $$ \mathcal{G} = (V, E) $$ such that each vertex is a position and there is an edge between every seat $$ \bm{x}_i $$ and $$ \bm{x}_j $$ weighted by the radial basis function:

$$ RBF(\bm{x}_i, \bm{x}_j) = \exp \left( \frac{-\lVert \bm{x}_i - \bm{x_j} \rVert_2^2}{2\sigma^2} \right) $$

Now seats further apart have a smaller weight than those right next to each other who have a weight of 1. We want to find a partitioning $$ A_0, A_1, \ldots, A_k $$ of $$ V $$ which minimizes the weights between A's. This can be expressed cleanly as an objective function. Let $$ w_{ij} $$ be the weight between two vertices and $$ W(A, B) = \sum_{i\in A \\ j\in B} w_{ij} $$ the sum of weights between two sets of vertices. Then our object function could be

$$ f(A_1, \ldots, A_k) = \frac 1 2 \sum_{i=1}^k W(A_i, \overline{A_i}) $$

where $$ \overline A $$ is the graph complement. Minimizing $$ f $$ would give the desired outcome, but we have an issue with our objective. The current function will produce lots of single vertex sets, which is not great for trying to group people together. To fix this we can "penalize" the objective function with the size of $$ A_i $$. Instead of the size we are going to use the volume of $$ A_i $$ which takes the weights into account. Let $$ d_i = \sum_{j=1}^n w_{ij} $$ be the degree of vertex $$ i $$ and $$ vol(A) = \sum_{i \in A} d_i $$. Now our objective is


$$ f(A_1, \ldots, A_k) = \frac 1 2 \sum_{i=1}^k \frac{W(A_i, \overline{A_i})}{vol(A_i)} $$

So now we need to find $$ A_1, \ldots A_k $$ such that $$ f $$ is minimized. First let use define a matrix $$ H \in \mathbb{R}^{n\times k} $$ such that 

$$ H_{ij} = \begin{cases}
\frac{1}{\sqrt{vol(A_j)}},& \textrm{ if } v_i \in A_j \\
0,& \textrm{ otherwise}
\end{cases} $$

Also define the diagonal matrix $$ D \in \mathbb{R}^{n\times n} $$ where $$ D = \textrm{diag}(d_1,\ldots,d_n) $$, $$ W \in \mathbb{R}^{n\times n} $$ where $$ W_{ij} = w_{ij} $$, and the graph laplacian $$ L = D-W $$.


Now we can express our minimization function as 

$$ \begin{aligned}
\min_{A_1,\ldots,A_k} f(A_1,\ldots,A_k) &= \min_{A_1,\ldots,A_k} \textrm{Tr} \left( H^T L H \right) \quad &\textrm{ subject to } H^TDH = I \\
&= \min_{T} \textrm{Tr} \left( T^T D^{-1/2} L D^{-1/2} T \right) \quad &\textrm{ subject to } T^T T = I
\end{aligned}$$

where we substitute $$ T = D^{1/2} H $$ in the last step. This is a standard trace minimization problem over a quadratic term with an identity constraint. The solution is $$ T $$ such that $$ T $$ contains the $$ k $$ eigenvectors of $$ D^{-1/2}LD^{-1/2} $$ corresponding to the $$ k $$ largest eigenvalues.

We can now assign vertices to clusters by using the $$ k $$-means clustering algorithm on the rows of $$ T $$. Now vertex $$ i $$ is in a cluster with vertex $$ j $$ if rows $$ i $$ and $$ j $$ of $$ T $$ are assigned to the same cluster.

See an example of this process on a random graph below.

<button id="on-graph-theory-and-social-distancing__btn-6">Run</button>
<label>Num. Groups</label>
<input type="text" value="10" id="on-graph-theory-and-social-distancing__text-seats">
<canvas id="on-graph-theory-and-social-distancing__canvas-6" style="width: 100%;"></canvas>