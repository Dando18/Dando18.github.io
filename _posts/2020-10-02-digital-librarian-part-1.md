---
title: 'The Digital Librarian: Part 1'
date: 2020-10-02
permalink: /posts/2020/02/librarian
categories:
  - computer vision
  - books
tags:
  - books
  - computer vision
---

This is the second part of my digital librarian post. See part 0 [here](2020-09-03-digital-librarian-part-0.md). 

As part of my effort to improve searching old book stores I developed an app to segment and identify books by live video of their spines. Part 0 contains a description of the computer vision pipeline I developed as well as the theory behind it. I found the theory a lot more interesting than actually implementing it with code (_read as:_ pulling my hair out fixing bugs at 2am), but to each their own.

I plan on eventually making the code public. However, to actually publish the app and/or port it to iOS I will need some time (and motivation). Maybe at some point I will get around to it.

## Setup on Android

Since I only own an Android phone, I developed the app for Android. However, most of my pipeline uses OpenCV for computational kernels and OpenCV supports numerous other platforms (i.e. iOS), so in theory it should be easy to port. 