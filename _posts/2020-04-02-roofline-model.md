---
title: 'Roofline Model'
date: 2020-04-02
permalink: /posts/2020/04/02/roofline-model
categories:
  - computer science
tags:
  - computer science
  - high performance computing
  - HPC
  - performance modeling
---

The Roofline Model is a performance model seeking to give the limitations of a specific hardware component in terms of algorithm performance. The model is often employed visually as a log-log plot of _Arithmetic Intensity_ vs _Flops/s_. 

## Performance Objective (Flops/s)
It is first important to understand the objective we're seeking to measure. _Flops/s_ is a simple measurement standing for _floating point operations per second_. This is essentially the number of mathematical operations (i.e. `+`, `*`, ...) that the computer does per second on a given algorithm. For instance, consider the function

```c++
double foo(double a, double b) {
    double x = 0.0;
    for (int i = 0; i < 50; i++) {
        x = a * x + b;      // (a)
    }
    return x;
}
```

One call of `foo` will execute line `(a)` 50 times. Line `(a)` has two floating pointing operations on it: `*` and `+`. Thus, `foo` will have 100 floating point operations. If `foo` takes 1.0 second to run, then our algorithm ran with 100 floating point operations per second or 100 flops/s. 

These numbers are unrealistic though. Typical algorithms run between $10^9$ and $10^{18}$, where $10^9$ or GigaFlops/s is typically what you'll see listed for a commercial CPU and $10^{18}$ or ExaFlops/s is at the cutting edge of supercomputing capability.

Flops/s is a desirable objective since the higher it is, the quicker an algorithm can run through more data. Flops/s is usually dependent on the hardware, algorithm and implementation.

## Arithmetic Intensity
Before we get to the Roofline Model it is also important to understand the independent variable in the model: _Arithmetic Intensity_. Put simply arithmetic intensity (AI) is the measure of how many operations are done per bytes loaded or stored from memory.

$$ AI = \frac{\text{Flops/s}}{\text{Memory Traffic}} = \frac{flops/second}{bytes/second} = \frac{flops}{bytes} $$

Why is this metric important? Despite the speed of modern hardware, __memory operations are slow__. While floating point operations like add and multiply only take 1 CPU cycle (or even less given fused instructions like `FMA` and `FMAC` in x86), the loads and stores can take orders of magnitude more. The table below gives rough estimates for how long it takes to load/store from different memory locations.

| Memory Location | CPU Cycles |
| :-------------: | :--------: |
|    Register     |     1      |
|    L1 Cache     |     ~4     |
|    L2 Cache     |    ~14     |
|    L3 Cache     |    ~75     |
|   Main Memory   |    ~200    |

Since memory operations are so slow it is important to try and do as many operations with a piece of loaded data as possible before the next data is loaded. Arithmetic intensity aims to measure this quantity.

A high AI value means we're doing a lot of computation per load, while a low AI means the algorithm is often waiting on data to be loaded before it can do anything.


### AI Examples
**axpy:** The AXPY routine is formally defined as $\boldsymbol{y} = a\boldsymbol{x} + \boldsymbol{y}$ where $a\in\mathbb{R}$ and $x,y\in\mathbb{R}^n$. In C code:

```c++
void daxpy(size_t n, double a, const double *x, double *y) {
    size_t i;
    for (i = 0; i < n; i++) {
        y[i] = a * x[i] + y[i];
    }
}
```

Here flops is easy to count: $flops = 2n$.

Memory traffic is calculated as: $traffic = [(2 \text{ loads})(8 \frac{\text{bytes}}{\text{load}}) + (1 \text{ store})(8 \frac{\text{bytes}}{\text{store}})] \cdot n = 24n$.

Therefore, the AI for DAXPY is

$$ AI = \frac{flops}{bytes} = \frac{2n}{24n} = \frac{1}{12}. $$

**GeMM:** GeMM, or general matrix multiplication, is another good example for calculating arithmetic intensity. Let's just look at simple matrix multiplication: $C=AB$ where $A,B,C \in \mathbb{R}^{n\times n}$. In C code:

```c++
void dgemm(size_t n, const double *A, const double *B, const double *C) {
    size_t i, j, k;
    double sum;
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            sum = 0.0;
            for (k = 0; k < n; k++) {
                sum = sum + A[i*n+k] * B[k*n+j];
            }
            C[i*n+j] = sum;
        }
    }
}
```

Again, flops is simple here. The innermost line of the loops has 2 floating point operations: `*` and `+`. This line will execute $n^3$ times so our total flop count is $flops = 2n^3$.

For memory we must load $A_{ik}, B_{kj}, \text{ and } C_{ij}$ and we must store $C_{ij}$. Since $A_{i:}$ and $B_{:j}$ can remain in memory, these load/stores only happen $n^2$ times. This gives us $traffic = (4)(8)(n) = 32n^2$.

Thus, we have 

$$ AI = \frac{2n^3}{32n^2} = \frac{n}{16} $$

This is the first time we see an algorithm's arithmetic intensity is dependent on its input size. Matrix multiplication does more arithmetic per byte loaded for larger matrix sizes. Thus, we should expect better flop rates for larger matrices. This is because of _data reuse_: the algorithm reuses loaded data before moving onto the next bit of data.


## The Roofline Model

Finally we have enough tools to understand our model. We are seeking the _AttainablePerformance_ for our specific hardware in terms of Gflops/s.





#### Further Reading
1 - [https://en.wikipedia.org/wiki/Roofline_model](https://en.wikipedia.org/wiki/Roofline_model)

2 - [https://crd.lbl.gov/assets/pubs_presos/parlab08-roofline-talk.pdf](https://crd.lbl.gov/assets/pubs_presos/parlab08-roofline-talk.pdf)

3 - [https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf)
