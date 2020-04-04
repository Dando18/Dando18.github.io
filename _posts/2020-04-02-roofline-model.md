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

- [Performance Objective (Flops/s)](#performance-objective-flopss)
- [Arithmetic Intensity](#arithmetic-intensity)
  - [AI Examples](#ai-examples)
- [The Roofline Model](#the-roofline-model)
- [Big Ideas](#big-ideas)
  - [Further Reading](#further-reading)

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
**axpy:** The AXPY routine is formally defined as $y = ax + y$ where $a\in\mathbb{R}$ and $x,y\in\mathbb{R}^n$. In C code:

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

$$ AI = \frac{flops}{bytes} = \frac{2n}{24n} = \frac{1}{12} $$

**GeMM:** GeMM, or general matrix multiplication, is another good example for calculating arithmetic intensity. Let's just look at simple matrix multiplication: $C=AB$ where $A,B,C \in \mathbb{R}^{n \times n}$. In C code:

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

This is the first time we see an algorithm's arithmetic intensity is dependent on its input size. Matrix multiplication does more arithmetic per byte loaded for larger matrix sizes. Thus, we should expect better flop rates for larger matrices. This is because of _data reuse_: the algorithm reuses loaded data before moving onto the next piece of data.

_Warning:_ While a high AI is usually better, it does not mean better execution time. A 1000x1000 matrix multiplication might have an $AI = \frac{1000}{16} = 62.5$, but it still needs to do $O(n^3)$ work. The Roofline Model will give more reasons why high AI is not a perfect predictor of performance.

## The Roofline Model

Finally we have enough tools to understand our model. We are seeking the _AttainablePerformance_ for our specific hardware in terms of Gflops/s. The Roofline Model finds the upper bound on performance by using the _peak bandwidth_ and _peak performance_.

_Peak Bandwidth_ - The fastest the processor can load data. Measured in bytes/second.

_Peak Performance_ - The floating point max performance of the processor. Measured in flops/second.

Obviously no algorithm can have a higher flops/s rate than the peak of the processing unit. However, it can be even lower if its limited by bandwidth. We can calculate bandwidth limited performance using $\text{AI} \cdot \text{PeakBandwidth}$. Combining these two ideas we get a formula for calculating Attainable Performance:

$$ \text{AttainablePerformance}(AI) = \min\{\text{PeakPerformance}, \text{AI} \cdot \text{PeakBandwidth}\} $$

See the dynamic plot below for an example.

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script type="text/javascript" src="{{ base_path }}/assets/js/posts/roofline.js"></script>
<div id="slider-container">
    <label>PeakPerformance = <span id="MaxPerformanceValue">100</span> Gflops/s</label>
    <input type="range" min="10" max="1000" value="100" step="10" class="slider" id="MaxPerformance" style="border: none;">
    <label>PeakBandwidth = <span id="MaxBandwidthValue">30</span> GB/s</label>
    <input type="range" min="1" max="100" step="1" value="32" class="slider" id="MaxBandwidth">
</div>
<div id="roofline-plot"></div>


From the plot it is now clear to see how this model got its name. The plot, with some imagination, forms the shape of a roofline.

So what does this model tell us? As discussed before it gives an upper bound on an algorithms performance. For example: consider our processor has a peak bandwidth of 16 GB/s and a peak performance of 64 GFlops/s. Now lets look at the matrix multiplication algorithm.

Remember _GeMM_ has $AI = \frac{N}{16}$, so let's look at a small $4\times 4$ _GeMM_ operation. We can initially calculate $AI = \frac{1}{4}$, which gives us our attainable performance

$$ \text{AttainablePerformance}(\frac{1}{4}) = \min\{64, \frac{1}{4} \cdot 16\} = 4 \text{ Gflops/s} $$

So despite having a processor which can perform $64\cdot 10^{9}$ floating point operations per second ours only achieved $4 \cdot 10^{9}$. That's only 6.25% efficient. _But_ a $4\times 4$ _GeMM_ is quite trivial. Lets look at something more reasonable like $64\times 64$.

$$ \text{AttainablePerformance}(\frac{64}{16}) = \min\{64, \frac{64}{16} \cdot 16\} = 64 \text{ Gflops/s} $$

So we have achieved our peak performance. The _GeMM_ is no longer limited by memory operations and is now limited by the processor's compute. Notice that any larger matrix size is still going to get 64 Gflops/s, since the algorithm is now compute bound.


## Big Ideas
There are 2 big takeaways from this model.

1. No matter how fast your processing unit is, whether CPU or GPU, if your algorithm is waiting on data to load all the time, then your performance will be limited by memory speed and not the processor speed.

2. On the other end if your algorithm does not use that many load/stores, i.e. it is memory efficient, you still cannot achieve better performance than the processor is capable no matter how high the arithmetic intensity.



### Further Reading
1 - [https://en.wikipedia.org/wiki/Roofline_model](https://en.wikipedia.org/wiki/Roofline_model)

2 - [https://crd.lbl.gov/assets/pubs_presos/parlab08-roofline-talk.pdf](https://crd.lbl.gov/assets/pubs_presos/parlab08-roofline-talk.pdf)

3 - [https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf](https://people.eecs.berkeley.edu/~kubitron/cs252/handouts/papers/RooflineVyNoYellow.pdf)
