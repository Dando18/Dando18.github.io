---
title: 'Visualizing Gradient Descent and Its Descendants'
date: 2020-11-28
permalink: /posts/2020/28/visualizing-gradient-descent
categories:
  - computer science
  - math
  - optimization
tags:
  - computer science
  - math
  - optimization
---


Gradient descent has become ubiquitous in computer science recently largely due to its use in training neural networks. While neural networks are somewhat complex, gradient descent is a very simple, intuitive tool.

- [Mathematical Formulation](#mathematical-formulation)
- [Intuition and Visualization](#intuition-and-visualization)
- [Momentum](#momentum)
- [Adam](#adam)
- [Use in Neural Networks](#use-in-neural-networks)
  - [Machine Learning in General](#machine-learning-in-general)

## Mathematical Formulation

Given a function $$ f : \mathbb{R}^d \mapsto \mathbb{R}^n $$ vanilla gradient descent defines an update rule which will minimize $$ f $$. 

$$ \bm{x}_{i+1} \leftarrow \bm{x}_i - \eta \nabla f(\bm{x}_i) $$

This statement may seem foreign, but visualizing gradient descent helps uncover the mystery behind the gradient and its properties.

## Intuition and Visualization

If you are not familiar with gradients, they have a nice intuitive property which lets this update rule work. The gradient of a function $$ f $$ at a point $$ \bm x $$ always points in the direction of steepest ascent. Intuitively, if you are on the side of a mountain, then the gradient at your location would be the direction of the steepest step you can take. If you want to reach the peak of the mountain, then continually taking steps in that direction is a good strategy. Now you may not reach the absolute highest peak on the mountain, but you will reach _a_ peak.

Following the same intuition if we take the negative gradient ($$ -\nabla f(\bm x) $$), then this points in the direction of steepest descent. So if we continually take steps in this direction ($$ -\eta \nabla f(\bm x) $$), then we will eventually reach a local minimum. Here $$ \eta $$ defines the size of the step we take.

You can see an example of this process below. The paths on the two plots show the path of gradient descent travelling down the slope. Try different functions in the select box. Also try changing the step size and seeing how it effects the path and number of iterations needed. You can click on a point in the contour plot (on the right) to set a new starting point.

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="{{ base_path }}/assets/js/posts/gradient-descent.js"></script>
<div id="visualizing-gradient-descent__vanilla__inputs-div">
  <select id="visualizing-gradient-descent__vanilla__function-select">
    <option value="quadratic">Quadratic</option>
    <option value="waves">Waves</option>
    <option value="saddle">Saddle</option>
    <option value="terrain">Terrain</option>
    <option value="hills">Hills</option>
    <option value="ripple">Ripple</option>
  </select>
  <label for="step-size">Step Size:</label>
  <input type="number" name="step-size" id="visualizing-gradient-descent__vanilla__step-size-input" value="0.01" style="width: 40%;">
  <div id="visualizing-gradient-descent__vanilla__info-div" style="background: light-gray; border-radius: 3pt; width: 100%;"></div>
</div>
<div id="visualizing-gradient-descent__vanilla__plotly-div" style="width: 100%;"></div>


## Momentum

As you can see from the above minimization it can sometimes take a large number of iterations to find an optimal minimum. One of the reasons is we are taking such small steps repeatedly. However, in the general case (and with more than 3 dimensions) its difficult to determine how large of a step to take. This is where _Nesterov Momentum_ comes in. The name momentum aptly describes how this adjustment to gradient descent works. If we continue to travel in the same direction, then increasingly take larger steps until we have found a minimum. This is similar to how one would gain momentum rolling down a hill.

Let $$ v $$ give the _velocity_ of the descent. Then we can define our update rule as

$$\begin{aligned}
  \bm{v}_{i+1} &\leftarrow \alpha \bm{v}_i - \eta \nabla f(\bm x_i) \\
  \bm{x}_{i+1} &\leftarrow \bm{x}_i - \bm{v}_i
\end{aligned}$$

This is usually called _Classical Momentum_.

<div id="visualizing-gradient-descent__momentum__inputs-div">
  <select id="visualizing-gradient-descent__momentum__function-select">
    <option value="quadratic">Quadratic</option>
    <option value="waves">Waves</option>
    <option value="saddle">Saddle</option>
    <option value="terrain">Terrain</option>
    <option value="hills">Hills</option>
    <option value="ripple">Ripple</option>
  </select>
  <label for="step-size">Step Size:</label>
  <input type="number" name="step-size" id="visualizing-gradient-descent__momentum__step-size-input" value="0.01" style="width: 40%;">
  <div id="visualizing-gradient-descent__momentum__info-div" style="background: light-gray; border-radius: 3pt; width: 100%;"></div>
</div>
<div id="visualizing-gradient-descent__momentum__plotly-div" style="width: 100%;"></div>

## Adam

A more recent adaptation by Kingma _et al_ [[1](https://arxiv.org/pdf/1412.6980.pdf)] called Adam has quickly become the most popular gradient descent derivative in use today. A large portion of neural network training uses Adam to find optimal parameters for the network. Adam is based off of adaptive moment estimations, which is where it gets its name.

The main improvement in Adam is that each parameter is given an adaptive learning rate (or step size). In vanilla gradient descent there is a static step size $$\eta$$ for all values of $$\bm x$$ and every iteration. Adam gives a unique step size to each $$\bm x_i$$ and updates them every iteration using the first and second moments of the gradient. Here the first moment is the mean of the gradient and the second the uncentered variance. Since computing these directly would be computationally burdensome we use running averages to calculate approximate moments. Let $$\bm m$$ be the first approximate moment and $$\bm v$$ the second. If we initialized these to zero, then they can be calculated at iteration $$i$$ as 

$$\begin{aligned}
  \bm m_i &\leftarrow \beta_1 \bm m_{i-1} + (1 - \beta_1) \nabla f(\bm x_i) \\
  \bm v_i &\leftarrow \beta_2 \bm v_{i-1} + (1 - \beta_2) \left(\nabla f(\bm x_i)\right)^2
\end{aligned}$$

If you expend the values $$\bm m_i$$ and $$\bm v_i$$ it is clear to see that the above formulas produce biased estimators of the moments. That is $$\mathbb{E}[\bm m_i] = \mathbb{E}\left[\nabla f(\bm x_i)\right] (1-\beta_1^i) $$ and $$\mathbb{E}[\bm v_i] = \mathbb{E}\left[\left(\nabla f(\bm x_i)\right)^2\right] (1-\beta_2^i)$$, which are biased by $$(1-\beta_1^i)$$ and $$(1-\beta_2^i)$$, respectively. To fix this we adjust the bias after computing the above updates.

$$\begin{aligned}
  \hat{\bm m}_i &\leftarrow \frac{\bm m_i}{1-\beta_1^i} \\
  \hat{\bm v}_i &\leftarrow \frac{\bm v_i}{1-\beta_2^i}
\end{aligned}$$

And finally we get the following update rule for our parameter $$\bm x$$:

$$ \bm x_i \leftarrow \bm x_{i-1} - \eta \frac{\hat{\bm m}_i}{\sqrt{\hat{\bm v}_i} + \varepsilon} $$

for some small $$\varepsilon > 0$$. The $$\varepsilon$$ is included to avoid division by zero, when $$\bm v_i=\bm 0$$. According to [[1](https://arxiv.org/pdf/1412.6980.pdf)] the values $$\beta_1=0.9$$, $$\beta_2=0.999$$, and $$\varepsilon=10^{-8}$$ are ideal for almost all problems. The rate $$\eta$$ is subject to change, but small values between $$0.001$$ and $$0.01$$ are often ideal.

<div id="visualizing-gradient-descent__adam__inputs-div">
  <select id="visualizing-gradient-descent__adam__function-select">
    <option value="quadratic">Quadratic</option>
    <option value="waves">Waves</option>
    <option value="saddle">Saddle</option>
    <option value="terrain">Terrain</option>
    <option value="hills">Hills</option>
    <option value="ripple">Ripple</option>
  </select>
  <label for="step-size">Step Size:</label>
  <input type="number" name="step-size" id="visualizing-gradient-descent__adam__step-size-input" value="0.01" style="width: 40%;">
  <div id="visualizing-gradient-descent__adam__info-div" style="background: light-gray; border-radius: 3pt; width: 100%;"></div>
</div>
<div id="visualizing-gradient-descent__adam__plotly-div" style="width: 100%;"></div>

## Use in Neural Networks

So how does this simple "walking down hill" optimization let us train neural networks for complex tasks like facial recognition? The intuition is very simple. Neural networks are mathematical functions, which take in a piece of input data and a set of parameters and makes a prediction about what the input data is. Call this function $$ f(\bm x, \bm \theta) $$. Here $$ f $$ is the neural network, $$ \bm x $$ is the input data, and $$ \bm \theta $$ are the parameters. Now let $$ y_i $$ denote the actual class of $$ \bm x_i $$ (i.e. dog or cat) and $$ f(\bm x_i, \bm \theta) $$ is what our neural network predicted $$ \bm x_i $$ is.

Using these definitions we can define the _error_ of the network as some loss function $$\mathcal{L}(f(\bm x_i, \bm \theta), y_i)$$, which takes the prediction and ground truth and returns the error of misclassifying sample $$\bm x_i$$. This gives us a mathematical definition for the classification error of the neural network, which can be minimized with gradient descent. And this is exactly what we want: minimal classification error.

$$ \bm{\theta}_{i+1} \leftarrow \bm{\theta}_i - \eta \nabla \mathcal{L} $$

This formulation and intuition are pretty simple, but in practice computing $$ \nabla_{\bm \theta_i} \mathcal{L}(f(\bm x, \bm \theta_i), y) $$ is non-trivial. For starters, calculating the true gradient is often impossible. We do not have access to all possible values of $$ \bm x$$ and $$y$$ (think about $$\bm x$$ is an image and $$y$$ is whether that image is a dog or cat). Even if we restrict our problem domain to small data set, then its still computationally difficult to compute the entire gradient. To alleviate this we use something called stochastic gradient descent (SGD) and/or batch SGD. Here we pick a random input sample or random batch of input samples at each iteration to compute an approximate gradient.

The other issue here is that gradient descent is only guaranteed to find a global minimum if the function is convex (like the quadratic example from above). Otherwise it might only find local minima. In the case of neural networks $$ f $$ is highly non-convex. It is not completely understood why local minima work so well for neural networks, but who is gonna complain?

### Machine Learning in General

In general if we can model the classification error or loss of a machine learning predictor as a mathematical function, then we can apply gradient descent to optimize it. Consider the linear classification model $$ f(\bm x; \bm \theta) = \bm \theta^\intercal \bm x  + \theta_0 $$. We can model the error of $$ f $$ as the mean squared error

$$ \mathcal{L}(f(\bm x; \bm \theta), y) = \frac{1}{2N} \sum_{n=1}^{N} ((\bm \theta^\intercal \bm x_n  + \theta_0) - y_n)^2 $$

This is example is slight overkill since linear least squares has a closed form solution, but it shows the general idea quite well. 
