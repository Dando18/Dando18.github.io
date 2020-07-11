---
title: 'Artificial Poetic Intelligence'
date: 2020-07-11
permalink: /posts/2020/11/artificial_poetic_intelligence
categories:
  - computer science
tags:
  - ai
  - poetry
---

Humans are great at writing poetry. However, it takes years of reading and practice to develop a command of the language strong enough to produce great metaphor and imagery, while maintaining proper rythym and meter. Naturally, when faced with a difficult task and/or much effort we seek to automate it. So, can poetry writing be automated? _Kind of..._

Here I will look at some attempts using Recurrent Neural Networks to generate text.

## Dataset

For the data, I used a collection of ~580 poems from poetryfoundation.org. The collection includes a broad range of poetry covering several different styles (i.e. modern, renaissance, etc...). 

Text data must be preprocessed before it can be used in any ML models. For instance, neural networks, which are used here, require numeric input. To represent text numerically one can tokenize it and assign a unique integer to each. Consider the vocabulary `['dog', 'cat', 'car']`. There are two ways to tokenize this: by character and word.

Character:

| token | id    |
|-------|-------|
| a     | 0     |
| c     | 1     |
| d     | 2     |
| g     | 3     |
| o     | 4     |
| r     | 5     |
| t     | 6     |

Word:

| token | id    |
|-------|-------|
| dog   | 0     |
| cat   | 1     |
| car   | 2     |


We can take the dataset and translate it into a collection of integers. These integers can be fed into the model, which will learn based on them. Once the model is done training it will output integers, which can then be translated back into words using the same table.


## Model

The network used is 

$$ \text{Input} \rightarrow \text{Embedding} \rightarrow \text{GRU} \rightarrow \text{Fully Connected} \rightarrow \text{Output} $$

Gated Recurrent Units are used even though [LSTM units would perform better]. LSTM units have more parameters, so the GRU network trains faster (about 1 min / epoch on my i7 laptop).

## Results

### Character-Based

After just a few training epochs the model just spews out non-sense. Most of it isn't even words.

```
I,
And cootes and thing waspery purciearst finzerseftlest;
Thes thr barkn skil's of bore you?
Where whend helly couls, Ere Boor Grobled, so gord;
Bath so mo eep light of frow her (yeates, chilk so my dan me distory.To lover as ander fpor tole?
There is not weal he heared?    Tid it it fair screase
Did bare to ever quile toom iting on,
Or trettle foulder, welk the dain hanver and mells wor born,
Uler hyrnen, and toum st bud-hollow-dounte and 
In bight to me, glest cautt, beauty way we blich I.Werchisaped anl copss life Perloss
Toor that I apme my sount tore
Fairing there when thou will spring for the weared with to Scon,
His coullin's lead is to weere, witt the lovi's Lantlie, worbling ortent.Leam Salk thighen are censies Quage into rveer chamms Suctair sow
And wirtly dounes; to chas I ambirilut'dik it. I In!

And firth frow well whit coows.
Ye craul quiff may camu will the orcued,
With tem thourn have I heart is,
To ald mand nos un is high a know fr
```

Beautiful right? But after ~30 epochs the model knows words and even strings 1 or 2 phrases together.

```
They are done forge
Of himself in bloomy tarrlable limes of flowing,
Wroagic-like away.The grass is worth in a thing
     Those sack of beek saw the night did live, and the mind.
Of leavely folds of youthful powe
Aphall I care for other to a bow of life, and I a gown
Hom whose curves deep and graces,
O must be heard, let'-pross them
Would in fair love good-morrow to appease her treasure suffer'd wrether, she the fight.
Who fair within my nature rud their murmus death.Notes:
Yet for e thus ready to stain
Now far he lov'd, and yet at falling light,
That none of her beauty, plantur saik, 
Ribried, this is Chanding hands the deer,
And in thy valoor, move,
Then live with heart to sway for a flower
He broken did allfthat forge
To live and wake with calm, broad wisdom;
All your lips to the corwle stone,
My timely pride, thy looks: unkindled hearts of gaze pryticad,
And as your body wing his ears of men and wound,
And flutter of all the house, it is immortal.

The body disdain;
There the leaves from Slew of God,   
Englabus and  Dew time to render thee.Kindeah path them who all things pure;
Eternity in clay her hand
That beauty continually, playing ways . . . ben a flowe
```

Beautiful! Not really, but we are getting there.


### Word-Based

The word based has the potential to produce better results, than the character based. The character based would have to learn words, then grammar on top of words, while the latter only has to learn grammar. Here is an example output after about ~30 epochs.

```
I am comfort gathred one I would thilke never to be eye. 
I've shall not fear, whether, I remember his beauty comes to me. 
Whither thou hast won we say without, my weaker delight with gaine, love doth spred for rude dislike and kind as towers, ne make the worlds strains I read to gaze in the winters hairdocile, beholdeth hovers from selected poems. 
In endless zephyrs, a-waite of the salt birds, beyond her book. O dea certe.pierce & heel. 
Waiting the twilight lock, for to the rolling and geniall shady sleep; and on their year, I do know the haven his flocke the bent.
What all is this joyous cloak, a toy mounting sons and so will shines, and did wear where thou be procurd to be stopped hath much heaven.
```

or this one with `temperature = 0.2`, which really seems to like _the rain_ (formatting mine).

```
I am royally choked Adonis, 
and the sun, 
    and the rain, 
        and the rain, 
            and the rain,
                and the rain, 
                    and the rain, 
                        and the rain, 
                            and the rain, 
the which is the same of my heart, 
and with me, I am sick, and you are dead, 
and with my heart, I am sick, and I have seen, 
and with my love is my love, 
and with my heart, I am I have seen, 
and you will be; and I have seen.
```

Here are some of my favorites:

```
Upon us perpetual night or glee: without dislike or suspicion. 
There cherries serves your shabbiest, weariest hunger, as both deliberate, the musical.
Yes, broad wisdom of course begin, have laid me thus. 
Therefore, he hath did his church and sure can temper.
```

```
Night it would not be. 
But I have loved her.
But love, and we are done. 
I am sick, 
I am not so much, nor in the flesh, and the lisp of reeds and the sun, and the gross matter of the pantomime. 
The moss is grown, and the evening star.
```

It seems I left some copyright and author info in some of the poems...
```
Night grew heavier; 
a new edition, 
edited by richard j. finneran. copyright 1933 by macmillan publishing company, renewed 1961 by georgie yeats. 
reprinted with the permission of new directions publishing corporation.
she has gone, and the brown fingers of the shepherd moved over slim shoulders; 
and all the world of love and the spring.
```

```
Love maintaineth all hearers fit, 
and thou shalt find the world, 
and someone called me, 
and I have done. 
I have loved, 
and I will find what is no more, 
but that which is permanent and thorough, 
that which is not long: sweet thames, run softly, till I end my song.
```