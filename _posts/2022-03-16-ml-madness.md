---
title: 'ML Madness'
date: 2022-03-16
permalink: /posts/2022/03/16/ml-madness
categories:
  - machine learning
  - sports
tags:
  - machine learning
  - sports
---

March Madness brings about spirited competition amongst friends and family 
to see who can pick the better basketball tournament bracket.
Some pick theirs randomly, some pick by favorite mascot, while others try to use in-depth
basketball knowledge to get the edge.
At the end of the day, however, there is one winner and many losers.

To add to the competitive atmosphere I decided to pit a bunch of machine learning algorithms
against each other to see who could generate the better bracket.
In this post I detail a methodology for collecting college basketball data, 
training ML models to predict game outcomes, and filling out brackets for 
tournaments to come.
The entirety of the code used can be found [here](https://github.com/Dando18/march-madness-ml).
Since I am posting this before the tournament starts I will come back in April
and revisit the models performed.

- [Data Collection](#data-collection)
- [Predicting Outcomes](#predicting-outcomes)
- [Results](#results)
  - [Brackets](#brackets)
- [Real Life Performance](#real-life-performance)

## Data Collection

There are a number of college basketball datasets already available online, which
makes the data collection straightforward.
[This dataset](https://data.world/michaelaroy/ncaa-tournament-results/) contains NCAA tournament
results dating back to 1985 (when the tournament was expanded to 64 teams).
Additionally, [this site](https://barttorvik.com/trank.php#) displays end-of-season
statistics for every team from 2008 to 2022.
Both of the above datasets can be directly downloaded as CSVs.
[I do this in Python](https://github.com/Dando18/march-madness-ml) and left join the two CSVs along _year_ and _team_.

## Predicting Outcomes
The ML problem is set up to predict the winner of a game based on information about the two teams playing.
In this setup the model is given

$$ \left[\textrm{Tournament Round},\ \textrm{seed}_{\textrm{team }1},\ \textrm{seed}_{\textrm{team }2},\ \textrm{stats}_{\textrm{team }1},\ \textrm{stats}_{\textrm{team }2}\right] $$

and predicts a 1 if $$\textrm{team }1$$ wins and a 0 if $$\textrm{team }2$$ wins.
The first 3 features and the output label are all available from the tournament results dataset.
The rest are taken from the end-of-season statistics dataset.
This contains the following statistics for each team, each year:
Conference, Games Played, Games Won, Adjusted Offensive Efficiency, Adjusted Defensive Efficiency,
Power Rating, Effective Field Goal Percentage Shot, Effective Field Goal Percentage Allowed, 
Turnover Rate, Steal Rate, Offensive Rebound Rate, Offensive Rebound Rate Allowed,
Free Throw Rate, Free Throw Rate Allowed, 2Pt %, 2Pt % Allowed, 3Pt %,
3Pt % Allowed, and Adjusted Tempo.

See the columns on the [dataset's website](https://barttorvik.com/trank.php#)
for more information on what these mean.
Each of these stats are taken from both teams and inputted into the model.
Each of these columns are normalized in the final dataset.

To rapidly try out many different models I used those already available in [sklearn](https://scikit-learn.org).
A subset of the [classification models](https://scikit-learn.org/stable/supervised_learning.html#supervised-learning)
were fit on the above training data.
Grid search was used to find good hyperparameters for each model.
Then 5-fold cross-validation was used to score each model based on average accuracy.


## Results
After tuning and fitting each model the best accuracy was achieved with the 
Support Vector Machine (SVM) classifier at 72%.
The accuracies for each model are shown below.

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script type="text/javascript" src="{{ base_path }}/assets/js/posts/ml-madness.js"></script>
<div id="ml-madness-plot"></div>

72% is not great, but it is still better than the random guessing model.
Also given that we are just using a couple end-of-season statistics this seems like
a reasonable accuracy.
Better predictions would probably require more sophisticated input data.


### Brackets

I simulated the 2022 tournament using each of the trained models.
I inputted each generated bracket into ESPN's bracket challenge and put screenshots of the 
resulting brackets below.
Also included is my personal bracket, which will serve as a comparison point to
the ML generated brackets.

<!--
adaboost.png       gaussian-naive-bayes.png  gradient-boosting.png  linear-regression.png  perceptron.png  random-forest.png  sgd.png
decision-tree.png  gaussian-process.png      kNN.png                neural-network.png     personal.png    random.png         svm.png -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
<style>
  .carousel-indicators,
  .carousel-control-next,
  .carousel-control-prev {
    filter: invert(100%);
    border: 1 black;
  }
</style>
<script src="https://cdn.jsdelivr.net/npm/popper.js@1.14.7/dist/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>

<div id="bracket-carousel" class="carousel slide" data-ride="carousel">
  <ol class="carousel-indicators">
    <li data-target="#bracket-carousel" data-slide-to="0" class="active"></li>
    <li data-target="#bracket-carousel" data-slide-to="1"></li>
    <li data-target="#bracket-carousel" data-slide-to="2"></li>
    <li data-target="#bracket-carousel" data-slide-to="3"></li>
    <li data-target="#bracket-carousel" data-slide-to="4"></li>
    <li data-target="#bracket-carousel" data-slide-to="5"></li>
    <li data-target="#bracket-carousel" data-slide-to="6"></li>
    <li data-target="#bracket-carousel" data-slide-to="7"></li>
    <li data-target="#bracket-carousel" data-slide-to="8"></li>
    <li data-target="#bracket-carousel" data-slide-to="9"></li>
    <li data-target="#bracket-carousel" data-slide-to="10"></li>
    <li data-target="#bracket-carousel" data-slide-to="11"></li>
    <li data-target="#bracket-carousel" data-slide-to="12"></li>
  </ol>

  <div class="carousel-inner">
    <div class="carousel-item active">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/random.png" alt="First slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/linear-regression.png" alt="Second slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/gradient-boosting.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/svm.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/sgd.png" alt="First slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/gaussian-naive-bayes.png" alt="Second slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/perceptron.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/neural-network.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/adaboost.png" alt="First slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/kNN.png" alt="Second slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/decision-tree.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/random-forest.png" alt="Third slide">
    </div>
    <div class="carousel-item">
      <img class="d-block w-100" src="{{ base_path }}/images/ml-madness/gaussian-process.png" alt="Third slide">
    </div>
  </div>

  <a class="carousel-control-prev" href="#bracket-carousel" role="button" data-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="sr-only">Previous</span>
  </a>
  <a class="carousel-control-next" href="#bracket-carousel" role="button" data-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="sr-only">Next</span>
  </a>
</div>
<br />

## Real Life Performance
I will update this once the actual 2022 tournament is over...
