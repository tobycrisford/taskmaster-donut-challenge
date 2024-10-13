# Taskmaster Doughnut Challenge

This repo is based on the final task of Taskmaster Series 3 Episode 5.

Each player has a stick, and some doughnuts (one doughnut for every player in the game). Each player secretly decides how many doughnuts to place on their stick. Once everyone has decided, the choices are revealed, and the winner is the player who has selected the
smallest *unique* number of doughnuts to place on their stick. If no one's selection is unique,
then there is no winner, and we repeat until a winner is found.

This repo contains an interactive game following the above rules, written in javascript, where you can play against several AI players, each following different strategies.

The most interesting strategy is the Nash equilibrium strategy, calculated numerically for different numbers of players in the donut_challenge.py python script. The rest of this readme explains how the Nash equilibrium strategy works, how it is calculated, and what the Nash equilibrium strategy is for the doughnut challenge with different numbers of players.

## What is Nash equilibrium?

In this challenge, we are playing a game where our best move depends on what the other players do, and they make their decision in secret. In games like this, you can't find the optimum strategy with maths alone. That's because the optimum strategy is to accurately predict what the other players are going to do, and respond accordingly, and that is a problem in psychology, not mathematics.

However, using Game Theory, you *can* calculate something called the Nash equilibrium strategy. This is a strategy with the following property:

*If all players are following the Nash equilibrium strategy, then no individual player can benefit by deviating from the Nash equilibrium strategy.*

In this sense, the Nash equilibrium strategy represents a kind of stable situation. In an interesting game, the Nash equilibrium strategy will involve selecting from a few options at random, according to particular probabilities. For example, in Rock/Paper/Scissors, the Nash equilibrium strategy is to select between Rock, Paper, or Scissors, with 1/3 probability each. This isn't so interesting, because all moves are equally good. But in more complicated games, like the Taskmaster doughnut challenge, the Nash strategy will have you selecting between the different moves with different probabilities. In the doughnut challenge, we will typically be assigning higher probabilities to the smaller numbers.

If you had a perfectly rational self-interested player, who knew for certain that all the other players were *also* perfectly rational and self-interested, then you might expect this player to adopt the Nash equilibrium strategy when playing the game. Why is this? Well no other strategy would make sense for them. If you were to propose that a rational self-interested player should instead pursue strategy X, then they should expect that all the *other* players will play X as well, since we are assuming they are all reasoning similarly. But if all the other players are playing X, and X is not a Nash equilibrium strategy, then X is not the best strategy to pick in response, and we have a contradiction.

But it is important to stress that this does not mean a player following the Nash equilibrium strategy will always come out on top against players who are following a different strategy. For example, in Rock/Paper/Scissors, if a player follows the Nash equilibrium strategy of randomly picking between the moves with 1/3 probability each, then their chance of eventual victory (and their opponent's) will always be 50/50. This is true whatever their opponent is doing. They have no advantage over *any* possible opponent.

## Calculating the Nash Equilibrium for the Doughnut Challenge

We are going to consider the doughnut challenge with N players, choosing between M possible moves. In the show, they had N=M=5, but we are going to allow N and M to be arbitrary (although we will be most interested in M larger than or equal to N).

### How to value draws

The first thing we need to clarify is how we treat a draw. A draw occurs when there is no unique number of doughnuts (e.g. maybe 2 people select 1 doughnut and 3 people select 2 doughnuts). Some discussions of this game online treat a draw as being as bad as a loss. There is nothing wrong with doing that, but it is then a different game to the one that was played on the show. In the show, when the first round ended in a draw, they simply played another round, and they would have kept on doing that until someone won. This means a draw is not as good as a win, but it is definitely better than a loss. How should we value it?

If a win is worth 1, and a loss is worth 0, then a draw should be worth 1/N. There are three ways of arriving at this conclusion.

First, if you imagine each player contributing a stake to a pot, and winning the whole pot if they win, then a draw is like everyone getting their stake returned, which is 1/N as good as a victory (if victory is 1 and a loss is 0).

The second way that gives the same answer, and is more relevant to the format of the show, is to reason as follows. We suppose that the thing we are trying to maximize is our probability of winning the next point. If the game ends in a win for us, then that is worth 1. If the game ends in a loss for us, then that is worth 0. But if the game ends in a draw, then our win probability is still the same as what it was before we played the round. And in the equilibrium situation that we are trying to solve for, that win probability is 1/N, by symmetry.

The third way, is that this is the only way to value a draw in any variant of this game whose format makes it zero-sum (A zero-sum game is a game where one player's gain always comes at the others', equally large, expense). Our win/loss outcome doesn't look zero-sum if we say a victory is worth 1 and a loss 0, but we can freely add a constant to these values without affecting anything relevant, and by subtracting the right constant we can make it zero-sum: if a win is worth (N-1)/N and a loss is worth -1/N, then a win/loss outcome is worth 0 overall. For the draw outcome to be zero-sum as well, that must be worth zero for each player. Adding the constant back, we find that a draw must be worth (1/N) if a loss is worth 0 and a win is worth 1.

### The Nash Equilibrium constraints

The Nash equilibrium strategy corresponds to a set of M probabilities for every possible move. We need to solve for these somehow.

We take the perspective of the Nth player, who knows that the other (N-1) players are all following the Nash equilibrium strategy. We then need it to be true that the Nth player can't benefit from deviating from the Nash equilibrium strategy themselves.

For this to be true, it must be the case that:

- All moves with non-zero probability attached to them must be equally good for the Nth player, in terms of expected value. For if this was not the case, then they could benefit by shifting probability from the less good move to the better one. Additionally, by the symmetry of the game, we know exactly how good each of these moves must be. They each have value 1/N.
- Any moves with zero probability attached must be no better, in terms of expected value, than any of the moves with non-zero probability attached. Otherwise, they could benefit by shifting probability weight to these moves. These moves must all have value less than or equal to 1/N.

### Numerical recipe for finding the Nash equilibrium

To solve for these constraints, we first look for a Nash equilibrium situation where *all* of the M moves are equally good for the Nth player, being worth precisely 1/N. This gives us M equations in M unknowns, which we can solve numerically. If this works, then we have found a Nash equilibrium.

But this might not work. Typically, we might find that we have a solution, but it involves some probabilities being either <0 or >1. In this case, the solution lies outside our allowed parameter space. But this does not mean that there is no equilibrium solution. Instead, it is just a sign that the equilibrium lies on the boundary of our parameter space instead. That is, we are going to find ourselves in a situation where the second bullet point above comes in to play. In Nash equilibrium, not all moves will be equally good for the Nth player. There will be some moves (which already have zero Nash probability attached) that are worse than the rest.

To search for equilibrium on the boundary, we guess that it will be the largest move that is less good than the rest, and we try re-solving for equilibrium with (N,M-1) instead of (N,M). If this works, all we have to do is verify that the Mth move really is less valuable than the rest in this strategy, and we have found a valid equilibrium for (N, M) too, where we select the Mth move with probability 0. If it doesn't work, we repeat again, with (N, M-2), and so on, until we find an equilibrium.

The above procedure is implemented in donut_challenge.py, and it has been used to find Nash equilibrium for N from 2 to 7, with arbitrary M.

## Results

The results for different N, M are fascinating. We review them here.

### 2 Players

Ok, so the 2-player results aren't so interesting. Regardless of the number of moves M, your best strategy in the 2-player game is just to pick 1 doughnut every time.

It's easy to see that this is a Nash equilibrium. If the other player is doing this, there is nothing you can do to gain an advantage over them. If you pick 1 doughnut you tie, and if you pick any larger number of doughnuts, you lose.

### 3 Players

The 3 player game is much more interesting. The Nash equilibrium strategy for 3 players and 3 doughnuts is given below:

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.5 |
| 2 | 0.25 |
| 3 | 0.25 |

This is quite nice. To follow the Nash strategy, you should pick 1 doughnut 50% of the time, 2 doughnuts 25% of the time, and 3 doughnuts 25% of the time.

But it gets really interesting if we're allowed to pick more than 3 doughnuts!

We find that however large M (number of allowed doughnuts) gets, the probability never drops to zero!

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.5 |
| 2 | 0.25 |
| 3 | 0.125 |
| 4 | 0.0625 |
| 5 | 0.03125 |
| ... | ... |

The probabilities here are decaying as (1/2)^m.

This is kind of mind-blowing. It means if you have no limit on the number of doughnuts you can put on your stick, then in a 3-player game, you should have some non-zero probability of picking 1,000,000 doughnuts! There is no equilibrium otherwise. In concrete terms, if the other two players were playing the Nash equilibrium strategy for N=3, M=999,999 (i.e. they never put more than 999,999 doughnuts on their stick) then you could gain a (very slight) advantage over them by putting 1,000,000 doughnuts on your stick, but no smaller number would do it.

### 4 Players

You might expect this pattern to continue, but no! Once we move to the 4-player game, we go right back to the other extreme again. Here is the Nash equilibrium strategy for 4 players with 4 doughnuts each:

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.5 |
| 2 | 0.5 |
| 3 | 0 |
| 4 | 0 |

So we should pick 1 doughut or 2 doughnuts with probability 1/2 each, meaning no preference of 1 doughnut over 2. And we should never pick 3 or 4. This is kind of surprising to me!

Interestingly, we saw above that moves with 0 probability in the Nash strategy are allowed to be less valuable than the rest, but that is *not* the case here. If you are in a 4-player game against 3 other Nash players, then all 4 moves are equally valuable to you. Your chances of winning are the same with any of them. And clearly, this will still be true if you are allowed to pick >4 doughnuts. You could put 1,000,000 doughnuts on your stick each time, and still expect to win your 1/4 share of the points.

### 5 Players

What about the 5-player game that they used on the show? Here are the results:

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.37177259 |
| 2 | 0.33747026 |
| 3 | 0.19743333 |
| 4 | 0.0833575 |
| 5 | 0.00996631 |

You should now pick between all available moves with some probability, but this probability gets quickly smaller as the number of doughnuts gets higher. You should pick 5 doughnuts <1% of the time, but not never.

What if we allow >5 doughnuts? It makes no difference. Those new moves all get probability 0 anyway.

This situation is more in line with what I was expecting to see for all N.

### 6 Players

Do we *now* have a trend that is going to continue as N increases? Not quite!

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.33473325 |
| 2 | 0.3091116 |
| 3 | 0.24753243 |
| 4 | 0.10862272 |
| 5 | 0 |
| 6 | 0 |

The 6-player game is the first time (other than the boring 2-player game) where our equilibrium solution lies on the boundary. This means there are some moves that should never be picked (like in the 4-player case) but also that these moves are strictly *worse* than the other moves. If you are playing against 5 other Nash players, you will be at a disadvantage if you pick 5 or 6 doughnuts, although any of the options from 1 to 4 will be equally good.

### 7 Players

7-Players looks a lot like the 6-player case, so maybe this trend will now continue, although my implementation of the algebra involved is very inefficient and my script starts to take a very long time if I go beyond 7. Here are the 7-Player results:

| Doughnuts on stick | Probability |
| --- | --- |
| 1 | 0.30018436 |
| 2 | 0.27821983 |
| 3 | 0.23604577 |
| 4 | 0.14286798 |
| 5 | 0.04268237 |
| 6 | 0 |
| 7 | 0 |

Again, the equilibrium lies on the boundary and you should not pick 6 or 7 doughnuts if faced with 6 Nash opponents.