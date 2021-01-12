---
title: 'Visualizing the Simplex Algorithm'
date: 2021-01-12
permalink: /posts/2021/12/visualizing-the-simplex-algorithm
categories:
  - computer science
  - math
  - optimization
  - visualization
tags:
  - computer science
  - math
  - optimization
  - visualization
---


The simplex algorithm is a fundamental result in linear programming and optimization. Being remarkably efficient the algorithm quickly became a popular technique for solving linear programs. Having an optimal algorithm is essential, since linear programming is ubiquitous in business analytics, supply chain management, economics, and other important fields. In addition to being efficient the algorithm has a clean and intriguing visual intuition. I will first give some background on linear programs, then show how we can visualize their solution space, and finally how to utilize this to solve linear programs.

- [Linear Programs](#linear-programs)
- [The Solution Space: A Geometric Understanding](#the-solution-space-a-geometric-understanding)
- [Finding Ideal Solutions: Two Observations](#finding-ideal-solutions-two-observations)
- [The Simplex Algorithm](#the-simplex-algorithm)

## Linear Programs 

[Linear Programming](https://en.wikipedia.org/wiki/Linear_programming) is the practice of minimizing or maximizing a linear objective with respect to linear constraints. Before diving into the notation and general definitions lets motivate it with an example problem.

You are a coffee roaster and you are trying to determine how many 60lb bags of green coffee beans to order from farms A, B, and C. You know you need 50 bags to meet this years demand and that farms A, B, and C charge $100, $115, and $90 per bag, respectively. You also must purchase at least 5 bags from each farm in order to maintain an on-going business relationship. Additionally, farms A, B, and C can only sell up to 30, 25, and 20 bags, respectively.

You find your business in this situation and you want to minimize your total expenses. By expressing each known constraint mathematically we can form a linear program. Let the total number of bags purchased from A, B, and C be represented by $$a$$, $$b$$, and $$c$$, respectively.

$$\begin{aligned}
\textrm{minimize} \quad& 100a + 115b + 90c \\
\textrm{subject to} \quad& a + b + c = 50 \\
& a,b,c \ge 5 \\
& a \le 30 \\
& b \le 25 \\
& c \le 20
\end{aligned}$$

In this instance we find that $$a=25$$, $$b=5$$, and $$c=20$$ gives the optimal price of $$\$ 4875$$. 

The above problem is not too difficult and could probably be solved by hand, but as the number of variables and constraints grows this becomes impossible. Thus, we rewrite the linear program in a more general form and try to find solutions for the general case using computers. Let $$\bm x$$ be the vector of variables we desire to optimize. Then the linear objective can be expressed as $$ \bm c^\intercal \bm x$$ where $$\bm c$$ contains the multiples of these variables. Likewise we can express constraint $$i$$ as $$\bm a_i^\intercal \bm x \le b_i$$. If we let $$A=[\bm a_1, \bm a_2, \ldots, \bm a_n]^\intercal$$ be a matrix with each $$\bm a_i$$ as row $$i$$, then our constraints become $$A\bm x \le \bm b$$. And finally requiring that $$\bm x \ge 0$$ we get

$$\begin{aligned}
\textrm{maximize} \quad& \bm c^\intercal \bm x \\
\textrm{subject to} \quad& A\bm x \le \bm b \\
& \bm x \ge 0
\end{aligned}$$

as our general case. If we want to minimize, then we can maximize $$-\bm c^\intercal \bm x$$ instead.

Notice in the coffee example we have an equality constraint $$ a+b+c=50 $$. We can accomplish this in the general form by changing the constraints to $$A\bm x = \bm b$$ and adding _slack_ and _surplus_ variables. For example, if we have the constraints $$ a+b \ge 5 $$ and $$ b-c \le 2 $$, then we can change these to $$ a+b -s = 5 $$ and $$ b-c +t = 2 $$. Here we add the variables $$s$$ and $$t$$ to $$\bm x$$ and since $$ \bm x \ge 0 $$ the inequalities still hold. And so our general form changes slightly to 

$$\begin{aligned}
\textrm{maximize} \quad& \bm c^\intercal \bm x \\
\textrm{subject to} \quad& A\bm x = \bm b \\
& \bm x \ge 0
\end{aligned}$$


## The Solution Space: A Geometric Understanding

When solving a constrained optimization problem the constraints limit possible values of $$\bm x$$, while you try to optimize some function of $$\bm x$$. This set of possible values for $$\bm x$$ is called the solution space. Somewhere within the solution space there is an $$\bm x$$ that maximizes $$\bm c^\intercal \bm x$$. In the case of linear programming the solution space is defined by values of $$\bm x$$ such that $$A\bm x \le \bm b$$ and $$\bm x \ge 0$$ (we will consider the $$\le$$ case, but the canonical form with slack variables is equivalent).

In general we might know very little about a solution space, but in the case of linear programming we know quite a bit. The possible values of $$\bm x$$ such that $$A\bm x \le \bm b$$ and $$\bm x\ge 0$$ forms a convex [polytope](https://en.wikipedia.org/wiki/Polytope). A polytope is a geometric object with only flat sides. The more familiar polygon is an example of a 2D polytope. The fact that the polytope is convex means that if you pick any two points within the shape, then the line segment connecting them is entirely within the shape (i.e. $$\beta\bm x + (1-\beta)\bm x \in \textrm{Shape}\,\, \forall \bm x \in \textrm{Shape}\,\,\forall \beta\in[0,1)$$). Put simply: the shape is not really jagged, but more somewhat plump. Below is an example of a convex polytope generated from a set of linear constraints.

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/mathjs@8.0.1/lib/browser/math.min.js"></script>
<script src="{{ base_path }}/assets/js/posts/simplex.js"></script>
<div id="visualizing-simplex__plotly-div"></div>

So what makes the constraints form a polytope? First, consider what each individual constraint means geometrically. If we have $$n$$ variables in $$\bm x$$, then each $$\bm a_i^\intercal \bm x = b_i$$ forms an $$n$$-dimensional hyperplane. In 2D this is a line, 3D a plane, and so on... Then $$\bm a_i^\intercal \bm x \le b_i$$ divides two sets of points. Those below or on the hyperplane $$\bm a_i^\intercal \bm x - b_i = 0$$ are included in our solution space and the rest are not.

When we take $$A\bm x \le \bm b$$, then we have numerous hyperplanes and the space enclosed by their intersections is our solution set. In 2D this is clear to see. If you draw a bunch of lines at random, then the space enclosed by them will form a polygon. Likewise in 3D if you position a number of sheets of paper in different orientations (assume they can intersect), then you will form a 3D polytope.

If you tried picturing this, then you might have noticed two cases where the above is not necessarily true. First, if there are parallel hyperplanes there will be no solution space. Thus, with an empty solution space we conclude that there are no solutions. In the second case we might have an unbounded region meaning that one of the sides of the polytope is not "closed" and the region spills into infinity. This is easily pictured in the 2D case by $$y>x$$ and $$y>-x$$. This case requires some special handling by the algorithm, but still fits within the intuition of the solution.


## Finding Ideal Solutions: Two Observations

Our problem has now been reduced to maximizing $$\bm c^\intercal \bm x$$ such that $$\bm x$$ is a point in the polytope defined by the constraints. While we have reduced the set of possible points significantly, there are still an infinite number of possible values of $$\bm x$$ since the polytope is a convex subset of $$\mathbb{R}^d$$. The above geometric understanding is not enough to make this problem possible in finite time. However, we can rely on two observations to simplify the problem further.

First, if the maximum value exists within the solution space, then it will be on at least one of the polytope's extreme points [[1](http://www-personal.umich.edu/~murty/books/linear_complementarity_webbook/lcp-complete.pdf)]. The extreme points are essentially the "corners" of the shape. This observation significantly reduces the search space as a convex polytope will always have a _finite_ number of extreme points.

<div id="visualizing-simplex__plotly-extremes-div"></div>

So now we have reduced the search space to a finite number of possible $$\bm x$$. However, it turns out that in practice the number of extreme points is still too large to compute in a reasonable amount of time. This leaves us with a finite possible $$\bm x$$, but there are too many to search them all for the max of $$\bm c^\intercal \bm x$$. We need a smarter way to traverse the extreme points of the polytope, so that we do not have to try them all. This is where the second observation comes in.

If an extreme point does not give the maximum, then it has at least one edge to another extreme point such that $$\bm c^\intercal \bm x$$ is strictly increasing along that edge [[1](http://www-personal.umich.edu/~murty/books/linear_complementarity_webbook/lcp-complete.pdf)]. Thus, the extreme point on the other end of the edge gives a higher value than the current extreme point. So to find the maximum we first pick an extreme point and continually jump to neighboring extreme points with higher objective values until we reach one with no neighbors giving higher objective values. This point is a value of $$\bm x$$ such that $$\bm c^\intercal \bm x$$ is maximized.

<div id="visualizing-simplex__plotly-path-div"></div>


## The Simplex Algorithm

The simplex algorithm makes use of these observations to find solutions to linear programs. It largely involves translating these geometric intuitions into a computer friendly format. You can probably stop reading here if you are not interested in this sort of thing as we now move from a clean geometric intuition to more dense mathematics. Additionally, there are lots of great linear programming libraries which implement the simplex algorithm for you and some languages, such as AMPL and R, have built-in solvers.

As mentioned we need a computer friendly format for our geometric intuition as computers cannot natively process polytopes and it seems like a headache to write software which can. So what format do computers like? _Matrices._ Yes, tables of numbers are highly addictive to computers. Now we need to rephrase our problem in terms of matrix operations. To do this let us define something called the _tableau form_:

$$\begin{bmatrix}
1 & -\bm c^\intercal & 0 \\
\bm 0 & A & \bm b \\
\end{bmatrix}$$

While this tableau form might be the input to a computer program, it is still not the ideal starting point for the algorithm. Most implementations will first rearrange the tableau into the _canonical tableau form_. This is done by rearranging the $$A$$ matrix. Notice that we can re-order the columns of $$A$$ without effecting the result. A tableau can be put in canonical form if the columns of $$A$$ can be swapped around such that it contains an identity matrix. Thus, the above tableau can be rewritten in canonical form as

$$\begin{bmatrix}
1 & -\bm c^\intercal_B & -\bm c^\intercal_D & 0 \\
\bm 0 & I & D & \bm b \\
\end{bmatrix}$$

which, using row-addition operations, can be rewritten as 

$$\begin{bmatrix}
1 & 0 & -\hat{\bm c}^\intercal_D & z \\
\bm 0 & I & D & \bm b \\
\end{bmatrix}$$

Now the variables corresponding to the columns in the identity matrix are called basic variables, while the rest are free variables. If we set all the free variables to $$0$$, then we can simply solve for the basic variables as they will just be the corresponding value in $$\bm b$$. These values give a _basic feasible solution_, which is the same as choosing the first extreme point on the polytope.

Now we can start moving along the edges to better extreme points. In the tableau form this is represented by pivot operations. The pivot operation is, in fact, very similar to the pivot in Gaussian elimination. Choosing a pivot element as a non-zero entry in free variable column, then we can multiply this row by the reciprocal of the selected number to make it $$1$$ and then add multiples of the row to the other rows until all their entries in the selected column are $$0$$. This now transforms the column from a free variable to a basic variable. It will also replace the corresponding variable in the identity matrix. The added and replaced variables are called _entering_ and _leaving variables_, respectively.

Choosing the entering and leaving variables to pivot each iteration is somewhat implementation dependent. For the entering variable we want to choose the column corresponding to the most negative value of the first row (with $$-\bm c^\intercal$$ in it). This will cause the largest derivative and likewise largest increase in the objective function. If you have chosen the column, then the row must be selected such that the solution is still feasible.

Iteratively this process continues until the first row has all positive objective values. When this happens no choice of pivot will further maximize the objective. This corresponds to finding the final extreme point on the polytope.

This was just a brief overview of the algorithm and how it connects with geometrical intuition. There are significantly many more implementation details to bother with as well as adaptations/improvements to the algorithm [[2](https://en.wikipedia.org/wiki/Simplex_algorithm#Advanced_topics)]. You can read more about simplex [here](https://en.wikipedia.org/wiki/Simplex_algorithm), [here](http://fourier.eng.hmc.edu/e176/lectures/NM/node32.html), and [here](https://sites.math.washington.edu/~burke/crs/407/notes/section2.pdf).
