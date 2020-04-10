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

For instance, say each of $$p$$ processors has a number $$n_i$$. An example of an All-Reduce operation is computing the sum, $$s=\sum_{j=0}^{p-1} n_j$$, and storing the resulting sum $$s$$ on each processor. Seems trivial, right?

We can gather all the numbers on a master processor, compute the sum, and then broadcast the result. This naive approach is, however, rather sub-optimal. What if each processor has more than 1 integer? The gather result might not be able to fit in a single processor's memory.

Additionally, we can outperform the communication overhead of gather $$\rightarrow$$ compute $$\rightarrow$$ broadcast. A gather will be $$\sim\mathcal{O}(\log p + n)$$, the compute is $$\mathcal{O}(np)$$, and finally a broadcast is $$\mathcal{O}(n\log p)$$. Thus, the total time complexity is roughly $$\mathcal{O}(np)$$.

I'll discuss some topics related to the use, implementation, and optimization of all-reduce calls.

#### What is All-Reduce?
I've already mentioned the example of summing integers over many processors. In fact, we can all-reduce with any binary-associative operator. Let $$\bigoplus$$ be some binary operator, meaning it takes two parameters (i.e. $$a \bigoplus b$$). If and only if $$\bigoplus$$ is associative, then $$a \bigoplus \left(b \bigoplus c\right) = \left(a \bigoplus b\right) \bigoplus c$$. As long as $$\bigoplus$$ has these two properties, then we can use it to reduce along all processes.

Addition is a simple example of this operation. It is clear to see that $$a+(b+c)=(a+b)+c$$. Others include product, min, max, etc... 


#### MPI_Allreduce
All_Reduce can be performed in MPI using [MPI_Allreduce](https://www.mpich.org/static/docs/latest/www3/MPI_Allreduce.html). The function signature is below.

```c++
int MPI_Allreduce(  const void *    sendbuf,
                    void *          recvbuf, 
                    int             count, 
                    MPI_Datatype    datatype, 
                    MPI_Op          op, 
                    MPI_Comm        comm
                )
```

The default MPI operations are included in the table below. Custom operations can also be created with `MPI_Op`s and `MPI_Opcreate()`.

| Name         | MPI Flag   | Associativity                                                                                | Description                      |
| ------------ | ---------- | -------------------------------------------------------------------------------------------- | -------------------------------- |
| Max          | MPI_MAX    | $$\max\lbrace a, \max\lbrace b,c\rbrace\rbrace=\max\lbrace\max\lbrace a,b\rbrace ,c\rbrace$$ | Computes the max of two numbers. |
| Min          | MPI_Min    | $$\min\lbrace a, \min\lbrace b,c\rbrace\rbrace=\min\lbrace\min\lbrace a,b\rbrace ,c\rbrace$$ | Computes the min of two numbers. |
| Sum          | MPI_SUM    | $$a+(b+c)=(a+b)+c$$                                                                          | Adds two numbers.                |
| Product      | MPI_PROD   | $$a(bc)=(ab)c$$                                                                              | Multiplies two numbers.          |
| Logical And  | MPI_LAND   | $$a \land (b \land c) = (a \land b) \land c$$                                                | Logical and of two predicates.   |
| Logical Or   | MPI_LOR    | $$a \lor (b \lor c) = (a \lor b) \lor c$$                                                    | Logical or of two predicates.    |
| Binary And   | MPI_BAND   | $$a \& (b \& c) = (a \& b) \& c$$                                                            | Binary and of two numbers.       |
| Binary Or    | MPI_BOR    | $$a \mid (b \mid c) = (a \mid b) \mid c$$                                                    | Binary or of two numbers.        |
| Max Location | MPI_MAXLOC | -- same as max --                                                                            | Max and processor rank.          |
| Min Location | MPI_MINLOC | -- same as min --                                                                            | Min and processor rank.          |


For example, we can compute the sum across all ranks. At the end of the below code `sum` will contain the sum of all `num`s on each rank. 

```c++
int num = some_random_number();
int sum = 0;
MPI_Allreduce(&num, &sum, 1, MPI_INT, MPI_SUM, MPI_COMM_WORLD);
```

### Applications

The most prominent application I've used All-Reduce in is distributed deep learning. The All-Reduce is a crucial component to distributing network training across several nodes. First a primer in deep learning.

I'll brush over this in very broad terms, but the concept should be clear enough to understand why we use All-Reduce. A neural network is some function $$f(\boldsymbol x; \boldsymbol w)$$ (a black-box if you will), which takes an input $$\boldsymbol x$$ and classifies it using parameters $$\boldsymbol w$$. When training, $$\boldsymbol x$$ and $$f$$ will be given (choosing $$f$$, the neural network architecture, and $$\boldsymbol x$$, the proper data set, is actually a difficult problem, but is more in the scope of Data Science), so we're left to find the weights $$\boldsymbol w$$.

Finding $$\boldsymbol w^*$$, the optimal weights, is also a difficult problem. Typically back-propagation and gradient descent are employed, but they can take a long time depending on the size of $$\boldsymbol w$$. The update rule for vanilla gradient descent looks like

$$ \boldsymbol w_i := \boldsymbol w_i - \eta\ \mathbb{E}_{x,y\sim\mathcal{D'}} \left[\nabla_{\boldsymbol w_i} \mathcal{L}\left( f(\boldsymbol x; \boldsymbol w_i), \boldsymbol y\right)\right] \quad \forall i\ .  $$

A couple points here. Firstly, $$\boldsymbol w_i$$ is sub-indexed, because $$\boldsymbol w$$ is typically composed of several weight vectors and we need to update each one. Next, the messy looking $$\mathcal{L}\left( f(\boldsymbol x; \boldsymbol w_i), \boldsymbol y\right)$$ expression is simply the loss of the network. In other words, $$\mathcal{L}$$ is the "error" when we try to predict $$\boldsymbol x$$ with $$\boldsymbol w_i$$ and the ground truth is $$\boldsymbol y$$. The negative gradient ($$-\nabla$$) of this w.r.t. $$\boldsymbol w_i$$ gives us an update to push $$\boldsymbol w_i$$ in the right direction.


As it turns out, we can parallelize this across our data set with _data parallelism_. Assume we have $$p$$ nodes. Then we'll partition $$\boldsymbol x$$ into $$p$$ datasets and assign one to each processor. Now our update will look like

$$ \boldsymbol w_i := \boldsymbol w_i - \frac{\eta}{p} \sum_{j=0}^{p-1} \left( \mathbb{E}_{x_j,y_j\sim\mathcal{D_j'}} \left[\nabla_{\boldsymbol w_i} \mathcal{L}\left( f(\boldsymbol x_j; \boldsymbol w_i), \boldsymbol y_j\right) \right] \right) \quad \forall i\ , $$

where $$\boldsymbol x_i$$ is the dataset on the $$i$$-th processor.

Now what does the above look like? An All-Reduce operation! We're summing the gradients across each node. The gradient computation, which is very time consuming, can be done concurrently as there is no interdependence. Once computed we take the average gradient, or the average update to $$\boldsymbol w_i$$, and change each $$\boldsymbol w_i$$ on every processor according to the same average. The below pseudo-code summarizes the changes to the algorithm, which is only the addition of the all-reduce call. 

``` 
for all i
  grads[i] = calculate_gradients(network, x_j, w_i, ground_truth_j) 

allreduce(grads, SUM)     # in-place
grads /= num_processors   # element-wise make grads averages 

for all i
  update(w_i, grads[i])
```

This is, to some extant, embarrassingly parallel. The network training is running entirely in parallel with intermittent pauses to sync gradients across processors. Yet, there are still several areas for improvement here.

One problem is that some processes might finish training before others. All-Reduce is a blocking function, meaning that it won't return until the operation is done. Thus, some processors will sit idle as they wait for incoming gradient updates.

Another issues is that All-Reduce implementations, at least in MPI, are still not optimized for these types of problems. Typical MPI implementations are designed to perform well on many-node, small-data tasks. However, in distributed learning we typically have the opposite: few nodes and large data. Not to mention that many current MPI implementations do not make use of GPU direct memory or the nice speedups in dense GPU clusters.

