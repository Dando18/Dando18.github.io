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

Additionally, we can outperform the communication overhead of gather $\rightarrow$ compute $\rightarrow$ broadcast. A gather will be $\sim\mathcal{O}(\log p + n)$, the compute is $\mathcal{O}(n+p)$, and finally a broadcast is $\mathcal{O}(n\log p)$. Thus, the total time complexity is roughly $\mathcal{O}(n \log p + p)$. The extra $p$ is if $n\sim\mathcal{O}(1)$, then the time complexity is dominated by $p$.

I'll discuss some topics related to the use, implementation, and optimization of all-reduce calls.

#### What is All-Reduce?
I've already mentioned the exampling of summing integers over many processors. In fact, we can all-reduce with any binary-associative operator. Let $\bigoplus$ be some binary operator, meaning it takes two parameters (i.e. $a \bigoplus b$). If and only if $\bigoplus$ is associative, then $a \bigoplus \left(b \bigoplus c\right) = \left(a \bigoplus b\right) \bigoplus c$. As long as $\bigoplus$ has these properties, then we can use it to reduce along all processes.

Addition is a simple example of this operation. It is clear to see that $a+(b+c)=(a+b)+c$. The default MPI operations are included in the table in the next section. Custom operations can also be created with `MPI_Op`s and `MPI_Opcreate()`.



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

| Name         | MPI Flag   | Associativity                                            | Description                      |
| ------------ | ---------- | -------------------------------------------------------- | -------------------------------- |
| Max          | MPI_MAX    | $\max\lbracea, \max\{b,c\}\rbrace=\max\{\max\{a,b\},c\}$ | Computes the max of two numbers. |
| Min          | MPI_MIN    | $\min\{a, \min\{b,c\}\}=\min\{\min\{a,b\},c\}$           | Computes the min of two numbers. |
| Sum          | MPI_SUM    | $a+(b+c)=(a+b)+c$                                        | Adds two numbers.                |
| Product      | MPI_PROD   | $a(bc)=(ab)c$                                            | Multiplies two numbers.          |
| Logical And  | MPI_LAND   | $a \land (b \land c) \equiv (a \land b) \land c$         | Logical and of two predicates.   |
| Logical Or   | MPI_LOR    | $a \lor (b \lor c) \equiv (a \lor b) \lor c$             | Logical or of two predicates.    |
| Binary And   | MPI_BAND   | $a \& (b \& c) = (a \& b) \& c$                          | Binary and of two numbers.       |
| Binary Or    | MPI_BOR    | $a ^ (b ^ c) = (a ^ b) ^ c$                              | Binary or of two numbers.        |
| Max Location | MPI_MAXLOC | -- same as max --                                        | Max and processor rank.          |
| Min Location | MPI_MINLOC | -- same as min --                                        | Min and processor rank.          |


